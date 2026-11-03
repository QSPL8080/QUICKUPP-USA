import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { getCurrentUser } from "@/lib/crm/auth";
import { isEnquirySource } from "@/lib/crm/data";
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

/* GET → Download single file (?id=) or list files (?source=&id=) */
export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return new Response("Please sign in again.", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const fileId = searchParams.get("id");
  const download = searchParams.get("download") === "1";

  // Mode 1: Serve a specific attachment
  if (fileId && !searchParams.has("source")) {
    const id = Number(fileId);
    if (!Number.isInteger(id) || id < 1) {
      return new Response("Not found", { status: 404 });
    }

    const [rows] = await getPool().query(
      "SELECT file_name, file_type, file_data FROM lead_attachments WHERE id = ?",
      [id]
    );
    const r = (rows as Record<string, unknown>[])[0];
    if (!r) return new Response("Not found", { status: 404 });

    const data = r.file_data as Buffer;
    const name = String(r.file_name);
    const disposition = download ? "attachment" : "inline";

    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": String(r.file_type || "application/octet-stream"),
        "Content-Length": String(data.length),
        "Content-Disposition": `${disposition}; filename="${name.replace(/"/g, "")}"; filename*=UTF-8''${encodeURIComponent(name)}`,
        "Cache-Control": "private, max-age=3600",
        "X-Content-Type-Options": "nosniff",
      },
    });
  }

  // Mode 2: List attachments for a lead
  const source = searchParams.get("source");
  const leadId = Number(searchParams.get("id"));

  if (!isEnquirySource(source) || !Number.isInteger(leadId) || leadId < 1) {
    return NextResponse.json({ ok: false, error: "Invalid lead parameters." }, { status: 400 });
  }

  const [rows] = await getPool().query(
    `SELECT id, lead_source, lead_id, file_name, file_type, file_size, uploaded_by_name, created_at
     FROM lead_attachments
     WHERE lead_source = ? AND lead_id = ?
     ORDER BY id DESC`,
    [source, leadId]
  );

  return NextResponse.json({
    ok: true,
    attachments: (rows as any[]).map((r) => ({
      id: r.id,
      leadSource: r.lead_source,
      leadId: r.lead_id,
      fileName: r.file_name,
      fileType: r.file_type,
      fileSize: r.file_size,
      uploadedByName: r.uploaded_by_name,
      createdAt: r.created_at,
    })),
  });
}

/* POST → Upload files to a lead */
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

  const source = String(form.get("leadSource") || form.get("source") || "").trim();
  const leadId = Number(form.get("leadId") || form.get("id"));

  if (!isEnquirySource(source) || !Number.isInteger(leadId) || leadId < 1) {
    return NextResponse.json({ ok: false, error: "Invalid lead details." }, { status: 400 });
  }

  // Collect all files from formData
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
  const savedAttachments: any[] = [];

  // Optional disk directory backup
  const uploadsDir = path.join(process.cwd(), "public", "uploads", "attachments");
  try {
    await fs.mkdir(uploadsDir, { recursive: true });
  } catch {}

  for (const file of uploadedFiles) {
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { ok: false, error: `File "${file.name}" exceeds the 15 MB size limit.` },
        { status: 400 }
      );
    }

    const ext = getFileExt(file.name);
    if (!ALLOWED_EXTS.has(ext)) {
      return NextResponse.json(
        { ok: false, error: `File type .${ext} is not supported.` },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const cleanName = file.name.replace(/[^\w.\- ()]+/g, "_").slice(0, 200) || `attachment_${Date.now()}.${ext}`;
    const mimeType = file.type || "application/octet-stream";

    // 1. Insert into MySQL lead_attachments
    const [res] = await pool.query(
      `INSERT INTO lead_attachments
        (lead_source, lead_id, file_name, file_type, file_size, file_data, uploaded_by, uploaded_by_name)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [source, leadId, cleanName, mimeType, file.size, buffer, user.id, user.name]
    );

    const insertId = (res as { insertId: number }).insertId;

    // 2. Write file to public/uploads/attachments/ as physical disk cache
    try {
      const diskFilename = `${insertId}_${cleanName}`;
      await fs.writeFile(path.join(uploadsDir, diskFilename), buffer);
    } catch {}

    savedAttachments.push({
      id: insertId,
      leadSource: source,
      leadId,
      fileName: cleanName,
      fileType: mimeType,
      fileSize: file.size,
      uploadedByName: user.name,
      createdAt: new Date().toISOString(),
    });
  }

  return NextResponse.json({
    ok: true,
    message: `${savedAttachments.length} file(s) uploaded successfully.`,
    attachments: savedAttachments,
  });
}

/* DELETE → Delete an attachment (?id=) */
export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Please sign in again." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  let id = Number(searchParams.get("id"));

  if (!id) {
    try {
      const body = await request.json();
      id = Number(body?.id);
    } catch {}
  }

  if (!Number.isInteger(id) || id < 1) {
    return NextResponse.json({ ok: false, error: "Invalid attachment ID." }, { status: 400 });
  }

  const pool = getPool();

  // Find attachment file_name for optional disk cleanup
  const [rows] = await pool.query("SELECT file_name FROM lead_attachments WHERE id = ?", [id]);
  const row = (rows as any[])[0];

  const [res] = await pool.query("DELETE FROM lead_attachments WHERE id = ?", [id]);
  if (!(res as { affectedRows: number }).affectedRows) {
    return NextResponse.json({ ok: false, error: "Attachment not found or already deleted." }, { status: 404 });
  }

  if (row?.file_name) {
    try {
      const diskPath = path.join(process.cwd(), "public", "uploads", "attachments", `${id}_${row.file_name}`);
      await fs.unlink(diskPath);
    } catch {}
  }

  return NextResponse.json({ ok: true, message: "Attachment deleted successfully." });
}
