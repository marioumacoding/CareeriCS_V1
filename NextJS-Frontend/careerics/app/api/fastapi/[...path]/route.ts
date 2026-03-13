import { NextRequest } from "next/server";

const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "host",
  "content-length",
]);

function getFastApiBaseUrl(): string {
  const configured = process.env.FASTAPI_URL || "http://127.0.0.1:8000";
  return configured.replace(/\/+$/, "");
}

function buildTargetUrl(
  baseUrl: string,
  path: string[],
  search: string,
  incomingPathname: string,
): string {
  const normalizedPath = path.length ? `/${path.join("/")}` : "";
  const keepTrailingSlash = incomingPathname.endsWith("/") && normalizedPath !== "";
  const finalPath = keepTrailingSlash ? `${normalizedPath}/` : normalizedPath;

  return `${baseUrl}${finalPath}${search}`;
}

function buildForwardHeaders(req: NextRequest): Headers {
  const headers = new Headers(req.headers);

  for (const header of HOP_BY_HOP_HEADERS) {
    headers.delete(header);
  }

  return headers;
}

function rewriteLocationHeader(location: string, req: NextRequest, upstreamBase: string): string {
  const proxyPrefix = `${req.nextUrl.origin}/api/fastapi`;

  if (location.startsWith("/")) {
    return `${proxyPrefix}${location}`;
  }

  try {
    const loc = new URL(location);
    const upstream = new URL(upstreamBase);
    const localUpstreamHosts = new Set(["localhost", "127.0.0.1"]);
    const sameUpstreamHostPort = loc.hostname === upstream.hostname && loc.port === upstream.port;
    const localhost8000 = localUpstreamHosts.has(loc.hostname) && loc.port === "8000";

    if (sameUpstreamHostPort || localhost8000) {
      return `${proxyPrefix}${loc.pathname}${loc.search}`;
    }
  } catch {
    // If parsing fails, return original location.
  }

  return location;
}

async function handleProxy(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> },
): Promise<Response> {
  const { path } = await context.params;
  const upstreamBase = getFastApiBaseUrl();
  const url = buildTargetUrl(upstreamBase, path, req.nextUrl.search, req.nextUrl.pathname);

  const method = req.method;
  const hasBody = method !== "GET" && method !== "HEAD";
  const upstreamResponse = await fetch(url, {
    method,
    headers: buildForwardHeaders(req),
    body: hasBody ? req.body : undefined,
    redirect: "manual",
    duplex: hasBody ? "half" : undefined,
  } as RequestInit & { duplex?: "half" });

  const responseHeaders = new Headers(upstreamResponse.headers);
  const location = responseHeaders.get("location");

  if (location) {
    responseHeaders.set("location", rewriteLocationHeader(location, req, upstreamBase));
  }

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers: responseHeaders,
  });
}

export async function GET(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleProxy(req, context);
}

export async function POST(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleProxy(req, context);
}

export async function PUT(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleProxy(req, context);
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleProxy(req, context);
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleProxy(req, context);
}

export async function OPTIONS(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleProxy(req, context);
}

export async function HEAD(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleProxy(req, context);
}
