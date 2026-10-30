/* Runs once when the server starts, before it handles any request */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { updateDatabase } = await import("./lib/db-auto-update");
    await updateDatabase();
  }
}
