/**
 * Runs once per server (and per build worker) before anything else.
 *
 * Prerendering fires hundreds of queries at Sanity from several workers at
 * once, and undici's 10s default connect timeout with an unbounded connection
 * pool makes the build fail on the first dropped socket. Capping the pool and
 * raising the connect timeout keeps static generation reliable.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { setGlobalDispatcher, Agent } = await import("undici");

  setGlobalDispatcher(
    new Agent({
      connect: { timeout: 60_000 },
      connections: 32,
      keepAliveTimeout: 30_000,
      keepAliveMaxTimeout: 60_000,
    }),
  );
}
