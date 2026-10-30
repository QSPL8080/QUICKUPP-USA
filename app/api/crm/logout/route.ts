import { endSession } from "@/lib/crm/auth";

export async function POST() {
  await endSession();
  return Response.json({ ok: true });
}
