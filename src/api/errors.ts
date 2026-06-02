// Typed error layer. Every API error is normalised to an `AqError` with a
// `kind` the UI can branch on, so callers never inspect raw status codes.

export type AqErrorKind =
  | "validation" // 400 — bad verse key / surah number (also thrown locally pre-flight)
  | "auth" // 401 — missing/invalid key (config error, fail closed)
  | "forbidden" // 403 — revoked key / missing scope (config error)
  | "notFound" // 404 — not found / not available → graceful empty state
  | "rateLimit" // 429 — backed off + retried, then surfaced
  | "server" // 5xx — retried once, then surfaced
  | "network" // fetch/transport failure
  | "parse"; // malformed/unexpected JSON

const RETRYABLE: ReadonlySet<AqErrorKind> = new Set(["rateLimit", "server", "network"]);

export class AqError extends Error {
  readonly kind: AqErrorKind;
  readonly status?: number;
  readonly retryable: boolean;

  constructor(kind: AqErrorKind, message: string, status?: number) {
    super(message);
    this.name = "AqError";
    this.kind = kind;
    this.status = status;
    this.retryable = RETRYABLE.has(kind);
    // restore prototype chain for instanceof across transpile targets
    Object.setPrototypeOf(this, AqError.prototype);
  }

  /** Auth/forbidden are configuration problems — log and fail closed. */
  get isConfigError(): boolean {
    return this.kind === "auth" || this.kind === "forbidden";
  }
}

/** Map an HTTP status (with the parsed `{ error }` message) to a typed error. */
export function mapStatusToError(status: number, message: string): AqError {
  switch (status) {
    case 400:
      return new AqError("validation", message || "Invalid request.", status);
    case 401:
      return new AqError("auth", message || "Missing or invalid API key.", status);
    case 403:
      return new AqError("forbidden", message || "API key revoked or missing scope.", status);
    case 404:
      return new AqError("notFound", message || "Not found.", status);
    case 429:
      return new AqError("rateLimit", message || "Rate limited.", status);
    default:
      if (status >= 500) return new AqError("server", message || "Server error.", status);
      // other unexpected 4xx → treat as a non-retryable client error
      return new AqError("validation", message || `Request failed (${status}).`, status);
  }
}
