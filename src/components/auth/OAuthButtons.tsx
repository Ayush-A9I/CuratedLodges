'use client';

import React, { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useApiMutation } from '@/hooks/useApiMutation';

import styles from './OAuthButtons.module.css';

/**
 * Shape returned by the backend OAuth exchange endpoints
 * (`api.loginWithGoogle` / `api.loginWithFacebook`).
 */
interface AuthResult {
    user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        preferredLanguage?: string;
        preferredCurrency?: string;
    };
    token: string;
    refreshToken: string;
}

type Provider = 'google' | 'facebook';

export interface OAuthButtonsProps {
    /** Destination to navigate to after a successful sign-in. Defaults to `'/'`. */
    redirectTo?: string;
    /** Called with a user-readable message when sign-in cannot be completed. */
    onError?: (message: string) => void;
    /** Optional override for the buttons container class (defaults to the shared social-button styling). */
    containerClassName?: string;
    /** Optional override for each button's class. */
    buttonClassName?: string;
    /** Optional override for each provider icon's class. */
    iconClassName?: string;
}

/**
 * Minimal, defensive access to the provider SDKs. These globals are injected by
 * the Google Identity Services / Facebook JS SDK scripts when configured. We never
 * assume they exist — absence is treated like a cancelled sign-in (Req 8.3).
 */
declare global {
    interface Window {
        google?: {
            accounts?: {
                id?: {
                    initialize: (config: {
                        client_id: string;
                        callback: (response: { credential?: string }) => void;
                    }) => void;
                    prompt: (
                        listener?: (notification: {
                            isNotDisplayed?: () => boolean;
                            isSkippedMoment?: () => boolean;
                            isDismissedMoment?: () => boolean;
                        }) => void,
                    ) => void;
                };
            };
        };
        FB?: {
            login: (
                callback: (response: {
                    authResponse?: { accessToken?: string } | null;
                    status?: string;
                }) => void,
                options?: { scope?: string },
            ) => void;
        };
    }
}

/** Generic, user-readable message used when a provider credential is unavailable. */
const NOT_COMPLETED_MESSAGE = 'Sign-in was not completed. Please try again.';

/**
 * Request a Google ID token via the Google Identity Services SDK.
 *
 * Resolves with the credential on success, or `null` when the user cancels or the
 * SDK/client id is not configured (caller treats `null` as "not completed", Req 8.3).
 */
function requestGoogleCredential(): Promise<string | null> {
    return new Promise((resolve) => {
        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
        const googleId =
            typeof window !== 'undefined' ? window.google?.accounts?.id : undefined;

        // SDK or configuration missing — cannot obtain a credential.
        if (!clientId || !googleId) {
            resolve(null);
            return;
        }

        let settled = false;
        const settle = (value: string | null) => {
            if (!settled) {
                settled = true;
                resolve(value);
            }
        };

        try {
            googleId.initialize({
                client_id: clientId,
                callback: (response) => settle(response?.credential ?? null),
            });
            googleId.prompt((notification) => {
                if (
                    notification?.isNotDisplayed?.() ||
                    notification?.isSkippedMoment?.() ||
                    notification?.isDismissedMoment?.()
                ) {
                    settle(null);
                }
            });
        } catch {
            settle(null);
        }
    });
}

/**
 * Request a Facebook access token via the Facebook JS SDK.
 *
 * Resolves with the token on success, or `null` when the user cancels or the
 * SDK/app id is not configured (caller treats `null` as "not completed", Req 8.3).
 */
function requestFacebookCredential(): Promise<string | null> {
    return new Promise((resolve) => {
        const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
        const FB = typeof window !== 'undefined' ? window.FB : undefined;

        if (!appId || !FB) {
            resolve(null);
            return;
        }

        try {
            FB.login(
                (response) => {
                    const accessToken = response?.authResponse?.accessToken;
                    resolve(accessToken ?? null);
                },
                { scope: 'public_profile,email' },
            );
        } catch {
            resolve(null);
        }
    });
}

/**
 * Google and Facebook sign-in controls (Req 8).
 *
 * Behavior:
 * - Requests a provider credential; if the user cancels or no credential is returned
 *   (including when the SDK/client id is not configured), it reports an error via
 *   `onError` and does **not** call the backend (Req 8.1/8.2/8.3).
 * - On credential, exchanges it through `api.loginWithGoogle` / `api.loginWithFacebook`
 *   via `useApiMutation` (30 s timeout, controls disabled while in flight) (Req 8.6/8.7).
 * - On success, stores tokens + sets the auth user via `setSession`, then navigates to
 *   `redirectTo` (Req 8.4/8.5).
 * - On error, surfaces a derived message via `onError`, stores no tokens, and stays on
 *   the current view with the controls re-enabled (Req 8.8).
 *
 * Security: the component only forwards the provider credential to the backend exchange
 * endpoint; it performs no token verification or trust decisions itself.
 */
export default function OAuthButtons({
    redirectTo = '/',
    onError,
    containerClassName,
    buttonClassName,
    iconClassName,
}: OAuthButtonsProps) {
    const router = useRouter();
    const { setSession } = useAuth();

    const mutation = useApiMutation<{ provider: Provider; credential: string }, AuthResult>(
        ({ provider, credential }) =>
            provider === 'google'
                ? (api.loginWithGoogle(credential) as Promise<AuthResult>)
                : (api.loginWithFacebook(credential) as Promise<AuthResult>),
        {
            onSuccess: (result) => {
                // Store tokens + set the auth user, then navigate (Req 8.4/8.5).
                setSession(result);
                router.push(redirectTo);
            },
        },
    );

    // Surface backend / timeout errors to the caller (Req 8.7/8.8).
    useEffect(() => {
        if (mutation.error) {
            onError?.(mutation.error.message);
        }
    }, [mutation.error, onError]);

    const handleSignIn = useCallback(
        async (provider: Provider) => {
            // Ignore activations while a request is in flight (Req 8.6).
            if (mutation.submitting) {
                return;
            }

            const credential =
                provider === 'google'
                    ? await requestGoogleCredential()
                    : await requestFacebookCredential();

            // Cancelled / no credential / SDK not configured: do not call the backend (Req 8.3).
            if (!credential) {
                onError?.(NOT_COMPLETED_MESSAGE);
                return;
            }

            await mutation.submit({ provider, credential });
        },
        [mutation, onError],
    );

    const containerClass = containerClassName ?? styles.socialButtons;
    const buttonClass = buttonClassName ?? styles.socialButton;
    const iconClass = iconClassName ?? styles.socialIcon;

    return (
        <div className={containerClass}>
            <button
                type="button"
                className={buttonClass}
                onClick={() => handleSignIn('google')}
                disabled={mutation.submitting}
            >
                <svg className={iconClass} viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
            </button>

            <button
                type="button"
                className={buttonClass}
                onClick={() => handleSignIn('facebook')}
                disabled={mutation.submitting}
            >
                <svg className={iconClass} viewBox="0 0 24 24">
                    <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Continue with Facebook
            </button>
        </div>
    );
}
