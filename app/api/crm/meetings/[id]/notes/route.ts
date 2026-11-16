import { getPool } from "@/lib/db";
import { getUserFor } from "@/lib/crm/auth";
import { announceNote, canSeeMeeting, canWorkOnMeeting, listMeetingNotes } from "@/lib/crm/meetingTeam";
import { logActivity } from "@/lib/crm/activity";

export const dynamic = "force-dynamic";

/*
 * Notes after a meeting: a typed note and/or a file (minutes, a PDF, a photo of
 * the whiteboard…). The BDM/BDE whose meeting it is and the Admins add them;
 * everyone who can see the meeting reads them.
 *
 * GET           → the notes, newest first
 * GET ?file=ID  → download one note's file
 * POST (multipart: note, file) → add a note
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
    const [rows] = await getPool().query("SELECT file_name, file_type, file_data FROM crm_meeting_notes WHERE id = ? AND meeting_id = ? AND file_data IS NOT NULL", [fileId, id]);
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
  return Response.json({ ok: true, notes: await listMeetingNotes(id) });
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getUserFor("meetings");
  if (!user) return Response.json({ ok: false, error: "Please sign in again." }, { status: 401 });
  const id = await meetingId(context);
  if (!id || !(await canWorkOnMeeting(user, id))) return Response.json({ ok: false, error: "You can't add notes to this meeting." }, { status: 403 });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }
  const note = String(form.get("note") || "").trim().slice(0, 20000);
  const entry = form.get("file");
  const file = entry instanceof File && entry.size > 0 ? entry : null;
  if (!note && !file) return Response.json({ ok: false, error: "Type a note or choose a file." }, { status: 400 });

  let fileName: string | null = null;
  let data: Buffer | null = null;
  if (file) {
    if (file.size > MAX_FILE) return Response.json({ ok: false, error: "The file is over 10 MB." }, { status: 400 });
    const ext = (file.name.split(".").pop() || "").toLowerCase();
    if (!EXTS.has(ext)) return Response.json({ ok: false, error: `.${ext} files can't be added. Use PDF, Word, Excel, PowerPoint, text or an image.` }, { status: 400 });
    fileName = file.name.replace(/[^\w.\- ()]+/g, "_").slice(0, 200) || `meeting-note.${ext}`;
    data = Buffer.from(await file.arrayBuffer());
  }

  await getPool().query(
    "INSERT INTO crm_meeting_notes (meeting_id, user_id, user_name, note, file_name, file_type, file_size, file_data) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [id, user.id, user.name.slice(0, 190), note || null, fileName, file ? file.type || "application/octet-stream" : null, file ? file.size : null, data]
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
  return Response.json({ ok: true, notes: await listMeetingNotes(id) });
}
