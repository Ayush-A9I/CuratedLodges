import i18n from '@/i18n/config';
import { ApiError } from '@/lib/api';

/**
 * The kind of failure a request produced.
 * - `network`  — the request never reached the server (fetch rejection / TypeError).
 * - `timeout`  — the request exceeded the configured timeout window.
 * - `server`   — the server responded with an error status.
 * - `unknown`  — anything we could not otherwise classify.
 */
export type NormalizedErrorKind = 'network' | 'timeout' | 'server' | 'unknown';

export interface NormalizedError {
    kind: NormalizedErrorKind;
    /** The i18n key for the fallback/generic message. */
    messageKey: string;
    /** Resolved, user-facing text. Server-provided messages are used verbatim. */
    message: string;
    /** HTTP status code, when the failure came from a server response. */
    status?: number;
}

/** i18n keys for the generic fallback message of each failure kind. */
const MESSAGE_KEYS: Record<NormalizedErrorKind, string> = {
    network: 'errors.network',
    timeout: 'errors.timeout',
    server: 'errors.serverGeneric',
    unknown: 'errors.unknown',
};

/** Resolve a translation key to its active-locale string (default-locale fallback). */
function translate(key: string): string {
    return i18n.t(key);
}

/** Pull a server-supplied message out of an ApiError's response body, if present. */
function extractServerMessage(err: ApiError): string | undefined {
    const data = err.data;
    if (data && typeof data === 'object') {
        const fromError = (data as { error?: unknown }).error;
        if (typeof fromError === 'string' && fromError.trim().length > 0) {
            return fromError;
        }
        const fromMessage = (data as { message?: unknown }).message;
        if (typeof fromMessage === 'string' && fromMessage.trim().length > 0) {
            return fromMessage;
        }
    }
    return undefined;
}

/** Detect an explicit timeout marker (a TimeoutError or a `{ kind: 'timeout' }` shape). */
function isTimeout(err: unknown): boolean {
    if (err instanceof Error && err.name === 'TimeoutError') {
        return true;
    }
    if (
        typeof err === 'object' &&
        err !== null &&
        (err as { kind?: unknown }).kind === 'timeout'
    ) {
        return true;
    }
    return false;
}

/**
 * Map an arbitrary thrown value into a {@link NormalizedError} with a translated,
 * user-readable message.
 *
 * Mapping rules:
 * - {@link ApiError} carrying `data.error`/`data.message` → `server`, message taken
 *   from the response (Req 13.4).
 * - {@link ApiError} without a response message → `server` with the generic fallback
 *   key (Req 13.5).
 * - A `TypeError` / fetch rejection → `network` (Req 13.2).
 * - A timeout marker (`TimeoutError` or `{ kind: 'timeout' }`) → `timeout`.
 * - Anything else → `unknown`.
 *
 * All fallback text resolves through `react-i18next` (Req 13.8).
 */
export function normalizeError(err: unknown): NormalizedError {
    // Explicit timeout marker (checked before TypeError since a timeout could be wrapped).
    if (isTimeout(err)) {
        return {
            kind: 'timeout',
            messageKey: MESSAGE_KEYS.timeout,
            message: translate(MESSAGE_KEYS.timeout),
        };
    }

    // Server error responses surfaced through the API client.
    if (err instanceof ApiError) {
        const serverMessage = extractServerMessage(err);
        return {
            kind: 'server',
            messageKey: MESSAGE_KEYS.server,
            message: serverMessage ?? translate(MESSAGE_KEYS.server),
            status: err.status,
        };
    }

    // Network failure: fetch rejects with a TypeError when the request cannot be made.
    if (err instanceof TypeError) {
        return {
            kind: 'network',
            messageKey: MESSAGE_KEYS.network,
            message: translate(MESSAGE_KEYS.network),
        };
    }

    // Unclassifiable failure.
    return {
        kind: 'unknown',
        messageKey: MESSAGE_KEYS.unknown,
        message: translate(MESSAGE_KEYS.unknown),
    };
}
