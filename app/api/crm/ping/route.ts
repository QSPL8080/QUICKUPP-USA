import { getCurrentUser } from "@/lib/crm/auth";

/* Activity ping from an open CRM tab: keeps the session alive while it's in use */
export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) return Response.json({ ok: false }, { status: 401 });
    return Response.json({ ok: true });
  } catch (err) {
    console.error("[api/crm/ping] failed:", err);
    return Response.json({ ok: false }, { status: 500 });
  }
}
