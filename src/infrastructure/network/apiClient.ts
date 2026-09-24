import { getAuthToken } from '@infrastructure/storage/secureStorage';

/** Normalized error shape thrown by every `apiRequest` failure. */
export interface ApiError {
  message: string;
  status: number;
  /** Backend-provided machine-readable code, when the response carried one. */
  code?: string;
}

/** Per-request configuration accepted by {@link apiRequest}. */
export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  timeoutMs?: number;
  requiresAuth?: boolean;
}

const DEFAULT_TIMEOUT_MS = 15_000;

/**
 * Type guard for errors thrown by {@link apiRequest}.
 *
 * Matches the structural `ApiError` shape rather than a class, so it also
 * recognizes errors surfaced by consumers.
 */
export function isApiError(err: unknown): err is ApiError {
  if (typeof err !== 'object' || err === null) return false;
  const candidate = err as { message?: unknown; status?: unknown; code?: unknown };
  const codeIsValid = candidate.code === undefined || typeof candidate.code === 'string';
  return (
    typeof candidate.message === 'string' &&
    typeof candidate.status === 'number' &&
    codeIsValid
  );
}

/**
 * Resolve the API base URL, or throw when it is not configured.
 *
 * Fails loudly instead of silently defaulting so a missing
 * `EXPO_PUBLIC_API_URL` shows up immediately in development.
 */
function resolveBaseUrl(): string {
  const baseUrl = process.env.EXPO_PUBLIC_API_URL;
  if (!baseUrl) {
    throw new Error('EXPO_PUBLIC_API_URL is not set');
  }
  return baseUrl.replace(/\/+$/, '');
}

/** Build the default headers merged with caller-supplied overrides. */
function buildHeaders(
  headers: Record<string, string> | undefined,
  hasBody: boolean,
  token: string | null,
): Record<string, string> {
  const merged: Record<string, string> = {
    Accept: 'application/json',
    ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
    ...headers,
  };
  if (token) merged.Authorization = `Bearer ${token}`;
  return merged;
}

/** Turn a timeout abort into the canonical `ApiError`. */
function createTimeoutError(): ApiError {
  return { message: 'Request timed out', status: 0 };
}

/** Read the body once as text, tolerating streams that cannot be re-read. */
async function readBodyText(response: Response): Promise<string> {
  try {
    return await response.text();
  } catch {
    return '';
  }
}

/** Extract a human-readable message from an error response body. */
function extractErrorMessage(text: string): string | undefined {
  if (!text) return undefined;
  try {
    const parsed: unknown = JSON.parse(text);
    if (typeof parsed === 'object' && parsed !== null) {
      const record = parsed as { message?: unknown; error?: unknown };
      if (typeof record.message === 'string') return record.message;
      if (typeof record.error === 'string') return record.error;
    }
  } catch {
    return text;
  }
  return text;
}

/** Extract a machine-readable code from an error response body. */
function extractErrorCode(text: string): string | undefined {
  if (!text) return undefined;
  try {
    const parsed: unknown = JSON.parse(text);
    if (typeof parsed === 'object' && parsed !== null) {
      const record = parsed as { code?: unknown };
      if (typeof record.code === 'string') return record.code;
    }
  } catch {
    return undefined;
  }
  return undefined;
}

/**
 * Issue an HTTP request against `EXPO_PUBLIC_API_URL` and return parsed JSON.
 *
 * Throws `ApiError` for HTTP errors, network failures, and timeouts. Timeouts
 * and network failures use `status: 0`.
 */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const {
    method = 'GET',
    body,
    headers,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    requiresAuth = false,
  } = options;

  const baseUrl = resolveBaseUrl();
  const hasBody = body !== undefined;
  const token = requiresAuth ? await getAuthToken() : null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: buildHeaders(headers, hasBody, token),
      body: hasBody ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (err) {
    if (controller.signal.aborted) throw createTimeoutError();
    const message = err instanceof Error ? err.message : 'Network request failed';
    throw { message: `Network request failed: ${message}`, status: 0 } satisfies ApiError;
  } finally {
    clearTimeout(timer);
  }

  const text = await readBodyText(response);

  if (!response.ok) {
    throw {
      message: extractErrorMessage(text) ?? `Request failed with status ${response.status}`,
      status: response.status,
      code: extractErrorCode(text),
    } satisfies ApiError;
  }

  if (!text) return undefined as T;

  try {
    return JSON.parse(text) as T;
  } catch {
    throw {
      message: 'Failed to parse response as JSON',
      status: response.status,
    } satisfies ApiError;
  }
}
