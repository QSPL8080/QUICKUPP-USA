/*
 * Deprecated route: Blog images are now saved directly on the specific blog record in the blogs table.
 */
export async function POST() {
  return Response.json(
    { ok: false, error: "Blog images are saved directly on each specific blog record. No separate table is used." },
    { status: 410 }
  );
}
