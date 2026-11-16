import { createServerFn } from "@tanstack/react-start";
import { resolvePublicHost } from "./public-host";

/** Public hostname for `x:game:image`, or "" when the request is not a public host. */
export const getShareHost = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { getRequest } = await import("@tanstack/react-start/server");
    const req = getRequest();
    const header = req?.headers.get("x-forwarded-host") ?? req?.headers.get("host") ?? "";
    return resolvePublicHost(header, process.env.VITE_PUBLIC_HOSTNAME);
  } catch {
    return resolvePublicHost("", process.env.VITE_PUBLIC_HOSTNAME);
  }
});
