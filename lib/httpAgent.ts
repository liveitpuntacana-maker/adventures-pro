/**
 * Widens Node's default HTTP connect timeout for outgoing requests.
 *
 * Static generation runs in several worker processes and fires hundreds of
 * queries at Sanity at once. undici's 10s connect timeout with an unbounded
 * pool fails the whole build on a single slow socket, and `instrumentation.ts`
 * does not run inside those prerender workers — so this lives in a module the
 * Sanity client imports, which every worker loads.
 */
let configured = false;

export function configureHttpAgent(): void {
  if (configured) return;
  if (typeof process === "undefined") return;
  if (process.env.NEXT_RUNTIME === "edge") return;

  configured = true;

  void (async () => {
    try {
      const { setGlobalDispatcher, Agent } = await import("undici");
      setGlobalDispatcher(
        new Agent({
          connect: { timeout: 60_000 },
          connections: 24,
          keepAliveTimeout: 30_000,
          keepAliveMaxTimeout: 60_000,
        }),
      );
    } catch {
      // undici is unavailable on this runtime; the defaults still work.
    }
  })();
}
