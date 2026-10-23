import { API_BASE_URL } from './config';

export class ApiError extends Error {
  status: number;
  path: string;

  constructor(message: string, status: number, path: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.path = path;
  }
}

function capitalise(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/** Turns anything the backend throws into one short, user-facing sentence. */
export function friendlyMessage(error: unknown, subject = 'this data'): string | undefined {
  if (!error) return undefined;
  if (error instanceof ApiError) {
    if (error.status === 0) return `Unable to reach the server. Check that the backend is running on ${API_BASE_URL}.`;
    if (error.status === 404) return `${capitalise(subject)} is not available from the backend at this route.`;
    if (error.status === 400) return 'The server rejected the request. Please review the values and try again.';
    if (error.status === 409) return 'That change conflicts with existing records and was not saved.';
  }
  return `Unable to load ${subject}. Please try again.`;
}

/** Never surfaces a Java stack trace — only a short reason line, if present. */
async function readError(response: Response, path: string): Promise<ApiError> {
  let detail = '';
  try {
    const text = await response.text();
    if (text) {
      try {
        const parsed = JSON.parse(text) as Record<string, unknown>;
        const candidate = parsed.message ?? parsed.error ?? parsed.detail;
        if (typeof candidate === 'string' && candidate.length < 160 && !candidate.includes('\n')) {
          detail = candidate;
        }
      } catch {

        /* non-JSON error bodies are intentionally discarded */}
    }
  } catch {

    /* body already consumed */}
  return new ApiError(detail || `Request failed with status ${response.status}`, response.status, path);
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers:
      body === undefined ?
      { Accept: 'application/json' } :
      { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body)
    });
  } catch {
    throw new ApiError('Network request failed', 0, path);
  }

  if (!response.ok) throw await readError(response, path);
  if (response.status === 204) return undefined as T;

  const text = await response.text();
  if (!text) return undefined as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}

export const api = {
  get: <T,>(path: string) => request<T>('GET', path),
  post: <T,>(path: string, body: unknown) => request<T>('POST', path, body),
  put: <T,>(path: string, body: unknown) => request<T>('PUT', path, body),
  patch: <T,>(path: string, body: unknown) => request<T>('PATCH', path, body),
  delete: <T,>(path: string) => request<T>('DELETE', path)
};
