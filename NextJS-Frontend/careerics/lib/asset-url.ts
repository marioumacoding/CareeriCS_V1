const FASTAPI_PROXY_PREFIX = "/api/fastapi";

export function normalizeBackendAssetUrl(value: string | undefined): string {
  if (!value) {
    return "";
  }

  if (value.startsWith(FASTAPI_PROXY_PREFIX)) {
    return value;
  }

  if (!/^https?:\/\//i.test(value)) {
    return value;
  }

  try {
    const parsed = new URL(value);
    return `${FASTAPI_PROXY_PREFIX}${parsed.pathname}${parsed.search}`;
  } catch {
    return value;
  }
}
