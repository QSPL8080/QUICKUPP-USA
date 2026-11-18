import { getPool } from "@/lib/db";
import { getUserFor } from "@/lib/crm/auth";
import { announceNote, canAddMeetingNotes, canSeeMeeting, listMeetingNotes, readNoteDetails } from "@/lib/crm/meetingTeam";
import { isAdminLike } from "@/lib/crm/auth";
import { logActivity } from "@/lib/crm/activity";

export const dynamic = "force-dynamic";

/*
 * Notes after a meeting: typed (a free note and/or the structured fields:
 * summary, requirements, next steps…) and/or a file (minutes, a PDF…). The
 * Admins and the BDM taking the meeting add them; Admins, Viewers and that BDM
 * read them all; a BDE only ever reads their own.
 *
 * GET           → the notes, newest first
 * GET ?file=ID  → download one note's file
 * POST (multipart: note, details (JSON), file) → add a note
 * PATCH { noteId, note, details } → change a note (its author, or an Admin)
 */

const MAX_FILE = 10 * 1024 * 1024;
const EXTS = new Set(["pdf", "doc", "docx", "txt", "rtf", "png", "jpg", "jpeg", "webp", "xls", "xlsx", "csv", "ppt", "pptx"]);

async function meetingId(context: { params: Promise<{ id: string }> }) {
  const id = Number((await context.params).id);
  return Number.isInteger(id) && id > 0 ? id : 0;
}

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getUserFor("meetings");
  if (!user) return Response.json({ ok: false, error: "Please sign in again." }, { status: 401 });
  const id = await meetingId(context);
  if (!id || !(await canSeeMeeting(user, id))) return Response.json({ ok: false, error: "Meeting not found." }, { status: 404 });

  const fileId = Number(new URL(request.url).searchParams.get("file"));
  if (fileId) {
    // a BDE downloads only the files of their own notes
    const [rows] = await getPool().query(
      `SELECT file_name, file_type, file_data FROM crm_meeting_notes WHERE id = ? AND meeting_id = ? AND file_data IS NOT NULL${user.role === "bde" ? " AND user_id = ?" : ""}`,
      user.role === "bde" ? [fileId, id, user.id] : [fileId, id]
    );
    const r = (rows as Record<string, unknown>[])[0];
    if (!r) return new Response("File not found", { status: 404 });
    const data = r.file_data as Buffer;
    const name = String(r.file_name || "meeting-note");
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": String(r.file_type || "application/octet-stream"),
        "Content-Length": String(data.length),
        "Content-Disposition": `attachment; filename="${name.replace(/"/g, "")}"; filename*=UTF-8''${encodeURIComponent(name)}`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  }
  return Response.json({ ok: true, notes: await listMeetingNotes(id, user), canAdd: await canAddMeetingNotes(user, id) });
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getUserFor("meetings");
  if (!user) return Response.json({ ok: false, error: "Please sign in again." }, { status: 401 });
  const id = await meetingId(context);
  if (!id || !(await canAddMeetingNotes(user, id))) return Response.json({ ok: false, error: "Only the BDM taking this meeting or an Admin adds notes." }, { status: 403 });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }
  const note = String(form.get("note") || "").trim().slice(0, 20000);
  const details = readNoteDetails(String(form.get("details") || "{}"));
  const entry = form.get("file");
  const file = entry instanceof File && entry.size > 0 ? entry : null;
  if (!note && !file && !Object.keys(details).length) return Response.json({ ok: false, error: "Type the notes or choose a file." }, { status: 400 });

  let fileName: string | null = null;
  let data: Buffer | null = null;
  if (file) {
    if (file.size > MAX_FILE) return Response.json({ ok: false, error: "The file is over 10 MB." }, { status: 400 });
    const ext = (file.name.split(".").pop() || "").toLowerCase();
    if (!EXTS.has(ext)) return Response.json({ ok: false, error: `.${ext} files can't be added. Use PDF, Word, Excel, PowerPoint, text or an image.` }, { status: 400 });
    // the file's first bytes must match its type (a renamed program is refused)
    const head = Buffer.from(await file.slice(0, 8).arrayBuffer());
    if (!contentMatches(ext, head)) return Response.json({ ok: false, error: `"${file.name}" doesn't look like a real .${ext} file.` }, { status: 400 });
    fileName = file.name.replace(/[^\w.\- ()]+/g, "_").slice(0, 200) || `meeting-note.${ext}`;
    data = Buffer.from(await file.arrayBuffer());
  }

  await getPool().query(
    "INSERT INTO crm_meeting_notes (meeting_id, user_id, user_name, note, details, file_name, file_type, file_size, file_data) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [id, user.id, user.name.slice(0, 190), note || null, Object.keys(details).length ? JSON.stringify(details) : null, fileName, file ? file.type || "application/octet-stream" : null, file ? file.size : null, data]
  );
  // the meeting's lead (if any) keeps a line in its history too
  const [rows] = await getPool().query("SELECT lead_id, lead_source, invitee_name FROM crm_meetings WHERE id = ?", [id]);
  const m = (rows as Record<string, unknown>[])[0];
  if (m?.lead_id && m.lead_source) {
    await logActivity({
      entity: "lead",
      source: String(m.lead_source),
      id: Number(m.lead_id),
      action: "meeting_note",
      text: `Meeting notes added${fileName ? ` (${fileName})` : ""}`,
      actor: { type: "user", user },
    }).catch(() => {});
  }
  await announceNote(id, user).catch(() => {});
  return Response.json({ ok: true, notes: await listMeetingNotes(id, user) });
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getUserFor("meetings");
  if (!user) return Response.json({ ok: false, error: "Please sign in again." }, { status: 401 });
  const id = await meetingId(context);
  if (!id || !(await canAddMeetingNotes(user, id))) return Response.json({ ok: false, error: "You can't change these notes." }, { status: 403 });
  const body = await request.json().catch(() => null);
  const noteId = Number(body?.noteId);
  if (!Number.isInteger(noteId) || noteId < 1) return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  // the author changes their note; an Admin can change any
  const [rows] = await getPool().query("SELECT user_id FROM crm_meeting_notes WHERE id = ? AND meeting_id = ?", [noteId, id]);
  const row = (rows as { user_id: number | null }[])[0];
  if (!row) return Response.json({ ok: false, error: "This note was deleted." }, { status: 404 });
  if (!isAdminLike(user) && Number(row.user_id) !== user.id) return Response.json({ ok: false, error: "Only its author or an Admin changes a note." }, { status: 403 });
  const note = String(body?.note || "").trim().slice(0, 20000);
  const details = readNoteDetails(body?.details);
  await getPool().query("UPDATE crm_meeting_notes SET note = ?, details = ? WHERE id = ?", [note || null, Object.keys(details).length ? JSON.stringify(details) : null, noteId]);
  return Response.json({ ok: true, notes: await listMeetingNotes(id, user) });
}

/* the first bytes of each allowed file type (text files have none to check) */
function contentMatches(ext: string, head: Buffer) {
  const starts = (...b: number[]) => b.every((v, i) => head[i] === v);
  if (ext === "pdf") return starts(0x25, 0x50, 0x44, 0x46);
  if (["docx", "xlsx", "pptx"].includes(ext)) return starts(0x50, 0x4b);
  if (["doc", "xls", "ppt"].includes(ext)) return starts(0xd0, 0xcf, 0x11, 0xe0);
  if (ext === "png") return starts(0x89, 0x50, 0x4e, 0x47);
  if (ext === "jpg" || ext === "jpeg") return starts(0xff, 0xd8, 0xff);
  if (ext === "webp") return starts(0x52, 0x49, 0x46, 0x46);
  return true; // txt, rtf, csv
}
