/* Deprecated route: images are stored directly on the specific blog record */
export async function GET() {
  return new Response("Not found", { status: 404 });
}
