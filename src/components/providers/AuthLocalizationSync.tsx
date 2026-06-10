'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocalization } from '@/contexts/LocalizationContext';
import { resolvePreferences } from '@/logic/supported';

/**
 * Bridges AuthContext and LocalizationContext without coupling the two providers.
 *
 * When a user signs in (or is resolved on initial load) with stored
 * preferredLanguage/preferredCurrency, those preferences are resolved against the
 * supported options and pushed into LocalizationContext via setLanguage/setCurrency.
 *
 * The sync only runs on sign-in transitions (tracked via the previous user id) so a
 * manual language/currency change the user makes afterward is never overridden.
 *
 * Requirements: 6.7, 6.8, 15.4, 15.5.
 */
export default function AuthLocalizationSync(): null {
    const { user } = useAuth();
    const { language, currency, setLanguage, setCurrency } = useLocalization();
    const previousUserIdRef = useRef<string | null>(null);

    useEffect(() => {
        const currentUserId = user?.id ?? null;
        const previousUserId = previousUserIdRef.current;

        // Only act on a sign-in transition (no user -> user, or a different user).
        const isSignInTransition = currentUserId !== null && currentUserId !== previousUserId;
        previousUserIdRef.current = currentUserId;

        if (!isSignInTransition || !user) {
            return;
        }

        const { language: resolvedLanguage, currency: resolvedCurrency } = resolvePreferences(
            user.preferredLanguage,
            user.preferredCurrency,
        );

        if (resolvedLanguage !== language) {
            setLanguage(resolvedLanguage);
        }
        if (resolvedCurrency !== currency) {
            setCurrency(resolvedCurrency);
        }
    }, [user, language, currency, setLanguage, setCurrency]);

    return null;
}
