/** Hostname suitable for absolute share-card URLs.
 * Mirrors `publicAppHost` in scripts/grok-pwa-shared.mjs: reject empty hosts,
 * hosts without a dot, IPv4, and Vercel system domains.
 */
function isVercelSystemHost(host: string): boolean {
  return (
    host === "vercel.app" ||
    host.endsWith(".vercel.app") ||
    host === "vercel.com" ||
    host.endsWith(".vercel.com")
  );
}

export function publicAppHost(hostHeader: string | undefined | null): string {
  const host = String(hostHeader ?? "")
    .split(",")[0]
    .trim()
    .split(":")[0]
    .toLowerCase();
  if (!host || !/^[a-z0-9.-]+$/.test(host) || !host.includes(".")) return "";
  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(host)) return "";
  if (isVercelSystemHost(host)) return "";
  return host;
}

/** Prefer `VITE_PUBLIC_HOSTNAME`, else the request host. Same order as `resolvePublicHost`. */
export function resolvePublicHost(
  hostHeader: string | undefined | null,
  envHost: string | undefined | null,
): string {
  return publicAppHost(envHost) || publicAppHost(hostHeader);
}
