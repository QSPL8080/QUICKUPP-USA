/*
 * Runs once when the server starts. The database update runs in the
 * background so the site starts serving straight away, and any failure is
 * only logged: it can never stop or delay the server.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  import("./lib/db-auto-update")
    .then(({ updateDatabase }) => updateDatabase())
    .catch((err) => console.error("[db] automatic database update failed:", err));
}
