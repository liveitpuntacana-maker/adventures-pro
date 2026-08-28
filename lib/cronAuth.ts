/**
 * Shared authorisation for the scheduled routes.
 *
 * These endpoints are ordinary public URLs — Vercel calls them over HTTP like
 * anyone else can. What separates the scheduler from a stranger is the bearer
 * token, so a missing `CRON_SECRET` has to mean "refuse everyone", never "let
 * everyone in". One of these routes deletes chat transcripts in bulk and
 * another sends email, and both were previously written so that an absent
 * secret skipped the check entirely.
 */
export function isAuthorizedCronRequest(request: Request, label: string): boolean {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    console.error(`[${label}] CRON_SECRET is not configured; refusing the request`);
    return false;
  }

  if (request.headers.get("authorization") === `Bearer ${secret}`) return true;

  // Accepted so the job can be triggered by hand without forging an
  // Authorization header.
  return request.headers.get("x-cron-secret") === secret;
}
