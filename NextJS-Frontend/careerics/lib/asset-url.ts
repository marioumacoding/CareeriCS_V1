const LOCAL_BACKEND_HOSTS = new Set(["localhost", "127.0.0.1"]);

function toOrigin(baseUrl: string): string {
  const trimmed = baseUrl.replace(/\/+$/, "");

  if (trimmed.endsWith("/api")) {
    return trimmed.slice(0, -4);
  }

  if (trimmed.endsWith("/graphql")) {
    return trimmed.slice(0, -8);
  }

  return trimmed;
}

export function normalizeBackendAssetUrl(value: string | undefined): string {
  if (!value) {
    return "";
  }

  if (!/^https?:\/\//i.test(value)) {
    return value;
  }

  try {
    const parsed = new URL(value);
    if (!LOCAL_BACKEND_HOSTS.has(parsed.hostname)) {
      return value;
    }

    const configured = process.env.NEXT_PUBLIC_API_URL;
    if (!configured) {
      return value;
    }

    const origin = toOrigin(configured);
    return `${origin}${parsed.pathname}${parsed.search}`;
  } catch {
    return value;
  }
}
