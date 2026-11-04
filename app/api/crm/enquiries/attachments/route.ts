import { NextResponse } from "next/server";
import { actorOf, logMany } from "@/lib/crm/activity";
import { getPool } from "@/lib/db";
import { getCurrentUser } from "@/lib/crm/auth";
import { isEnquirySource, SOURCES, type EnquirySource } from "@/lib/crm/data";
import fs from "node:fs/promises";
import path from "node:path";

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 MB

const ALLOWED_EXTS = new Set([
  "png", "jpg", "jpeg", "webp", "gif", "svg",
  "pdf", "doc", "docx", "txt", "rtf",
  "csv", "xls", "xlsx", "zip",
]);

function getFileExt(fileName: string): string {
  const parts = fileName.split(".");
  return parts.length > 1 ? parts.pop()!.toLowerCase() : "";
}

export type StoredAttachment = {
  id: string;
  leadSource?: string;
  leadId?: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  filePath: string;
  uploadedByName: string;
  createdAt: string;
};

function parseAttachments(raw: unknown): StoredAttachment[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

/* GET → Download single file or list files stored directly on the lead */
export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return new Response("Please sign in again.", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const source = searchParams.get("source") as EnquirySource;
  const leadId = Number(searchParams.get("leadId") || searchParams.get("id"));
  const fileId = searchParams.get("fileId") || searchParams.get("attId");
  const download = searchParams.get("download") === "1";
  const directFile = searchParams.get("file");

  // Mode 1: Serve/download a specific file
  if (fileId || directFile) {
    let targetFileName = directFile;
    let mimeType = "application/octet-stream";
    let displayName = directFile || "attachment";

    if (fileId && isEnquirySource(source) && Number.isInteger(leadId) && leadId >= 1) {
      const [rows] = await getPool().query(
        `SELECT attachments FROM \`${SOURCES[source].table}\` WHERE id = ?`,
        [leadId]
      );
      const row = (rows as Record<string, unknown>[])[0];
      const list = parseAttachments(row?.attachments);
      const found = list.find((a) => String(a.id) === String(fileId));
      if (found) {
        targetFileName = path.basename(found.filePath);
        mimeType = found.fileType || mimeType;
        displayName = found.fileName || displayName;
      }
    }

    if (!targetFileName) return new Response("File not found", { status: 404 });
    const cleanBasename = path.basename(targetFileName);
    const diskPath = path.join(process.cwd(), "public", "uploads", "attachments", cleanBasename);

    try {
      const fileBuffer = await fs.readFile(diskPath);
      const disposition = download ? "attachment" : "inline";
      return new Response(new Uint8Array(fileBuffer), {
        headers: {
          "Content-Type": mimeType,
          "Content-Length": String(fileBuffer.length),
          "Content-Disposition": `${disposition}; filename="${displayName.replace(/"/g, "")}"; filename*=UTF-8''${encodeURIComponent(displayName)}`,
          "Cache-Control": "private, max-age=3600",
          "X-Content-Type-Options": "nosniff",
        },
      });
    } catch {
      return new Response("File not found on server", { status: 404 });
    }
  }

  // Mode 2: List attachments for a lead (?source=&id=)
  if (!isEnquirySource(source) || !Number.isInteger(leadId) || leadId < 1) {
    return NextResponse.json({ ok: false, error: "Invalid lead parameters." }, { status: 400 });
  }

  const [rows] = await getPool().query(
    `SELECT attachments FROM \`${SOURCES[source].table}\` WHERE id = ?`,
    [leadId]
  );
  const row = (rows as Record<string, unknown>[])[0];
  const attachments = parseAttachments(row?.attachments);

  return NextResponse.json({ ok: true, attachments });
}

/* POST → Upload files directly to a lead (stored in manual_leads or other lead table) */
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Please sign in again." }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid multipart form data." }, { status: 400 });
  }

  const source = String(form.get("leadSource") || form.get("source") || "").trim() as EnquirySource;
  const leadId = Number(form.get("leadId") || form.get("id"));

  if (!isEnquirySource(source) || !Number.isInteger(leadId) || leadId < 1) {
    return NextResponse.json({ ok: false, error: "Invalid lead details." }, { status: 400 });
  }

  const uploadedFiles: File[] = [];
  for (const entry of form.getAll("files")) {
    if (entry instanceof File && entry.size > 0) uploadedFiles.push(entry);
  }
  for (const entry of form.getAll("file")) {
    if (entry instanceof File && entry.size > 0 && !uploadedFiles.includes(entry)) {
      uploadedFiles.push(entry);
    }
  }

  if (uploadedFiles.length === 0) {
    return NextResponse.json({ ok: false, error: "Please select at least one file to upload." }, { status: 400 });
  }

  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT attachments FROM \`${SOURCES[source].table}\` WHERE id = ?`,
    [leadId]
  );
  const row = (rows as Record<string, unknown>[])[0];
  if (!row) {
    return NextResponse.json({ ok: false, error: "Lead not found." }, { status: 404 });
  }

  const existing = parseAttachments(row.attachments);
  const uploadsDir = path.join(process.cwd(), "public", "uploads", "attachments");
  try {
    await fs.mkdir(uploadsDir, { recursive: true });
  } catch {}

  const newlyAdded: StoredAttachment[] = [];

  for (const file of uploadedFiles) {
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ ok: false, error: `File "${file.name}" exceeds the 15 MB limit.` }, { status: 400 });
    }
    const ext = getFileExt(file.name);
    if (!ALLOWED_EXTS.has(ext)) {
      return NextResponse.json({ ok: false, error: `File type .${ext} is not supported.` }, { status: 400 });
    }

    const attId = `att_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const cleanName = file.name.replace(/[^\w.\- ()]+/g, "_").slice(0, 200) || `file_${Date.now()}.${ext}`;
    const diskFilename = `${source}_${leadId}_${attId}_${cleanName}`;
    const diskPath = path.join(uploadsDir, diskFilename);

    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(diskPath, buffer);

    const item: StoredAttachment = {
      id: attId,
      leadSource: source,
      leadId,
      fileName: cleanName,
      fileType: file.type || "application/octet-stream",
      fileSize: file.size,
      filePath: `/uploads/attachments/${diskFilename}`,
      uploadedByName: user.name || "User",
      createdAt: new Date().toISOString(),
    };
    existing.unshift(item);
    newlyAdded.push(item);
  }

  // Update attachments directly in this lead's own table
  await pool.query(
    `UPDATE \`${SOURCES[source].table}\` SET attachments = ? WHERE id = ?`,
    [JSON.stringify(existing), leadId]
  );

  await logMany(
    newlyAdded.map((a: { fileName: string }) => ({
      entity: "lead" as const,
      source,
      id: leadId,
      action: "attachment",
      field: "attachments",
      newValue: a.fileName,
      text: `Attachment ${a.fileName} added`,
      actor: actorOf(user),
    }))
  );

  return NextResponse.json({
    ok: true,
    message: `${newlyAdded.length} file(s) attached to ${SOURCES[source].short} lead #${leadId}.`,
    attachments: existing,
  });
}

/* DELETE → Delete an attachment from a lead (stored directly in the lead table) */
export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Please sign in again." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const source = searchParams.get("source") as EnquirySource;
  const leadId = Number(searchParams.get("leadId") || searchParams.get("id"));
  const fileId = searchParams.get("fileId") || searchParams.get("attId");

  let bodyData: any = null;
  if (!fileId || !source || !leadId) {
    try {
      bodyData = await request.json();
    } catch {}
  }

  const finalSource = (source || bodyData?.source || bodyData?.leadSource) as EnquirySource;
  const finalLeadId = leadId || Number(bodyData?.leadId || bodyData?.id);
  const finalFileId = fileId || String(bodyData?.fileId || bodyData?.attId || bodyData?.id || "");

  if (!isEnquirySource(finalSource) || !Number.isInteger(finalLeadId) || finalLeadId < 1 || !finalFileId) {
    return NextResponse.json({ ok: false, error: "Invalid parameters." }, { status: 400 });
  }

  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT attachments FROM \`${SOURCES[finalSource].table}\` WHERE id = ?`,
    [finalLeadId]
  );
  const row = (rows as Record<string, unknown>[])[0];
  if (!row) {
    return NextResponse.json({ ok: false, error: "Lead not found." }, { status: 404 });
  }

  const existing = parseAttachments(row.attachments);
  const target = existing.find((a) => String(a.id) === String(finalFileId) || a.filePath.includes(finalFileId));
  const remaining = existing.filter((a) => a !== target);

  if (target?.filePath) {
    try {
      const diskPath = path.join(process.cwd(), "public", target.filePath.replace(/^\//, ""));
      await fs.unlink(diskPath);
    } catch {}
  }

  await pool.query(
    `UPDATE \`${SOURCES[finalSource].table}\` SET attachments = ? WHERE id = ?`,
    [remaining.length ? JSON.stringify(remaining) : null, finalLeadId]
  );

  if (target) {
    await logMany([
      {
        entity: "lead",
        source: finalSource,
        id: finalLeadId,
        action: "attachment",
        field: "attachments",
        oldValue: target.fileName,
        text: `Attachment ${target.fileName} removed`,
        actor: actorOf(user),
      },
    ]);
  }

  return NextResponse.json({
    ok: true,
    message: "Attachment deleted successfully.",
    attachments: remaining,
  });
}
