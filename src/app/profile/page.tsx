'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { ProtectedRoute } from '@/components/auth';
import { LoadingState, ErrorState } from '@/components/feedback';
import { Field, TextInput, FieldError, SubmitButton } from '@/components/form';
import { useApiResource } from '@/hooks/useApiResource';
import { useApiMutation } from '@/hooks/useApiMutation';
import { useLocalization } from '@/contexts/LocalizationContext';
import {
    SUPPORTED_LANGUAGES,
    SUPPORTED_CURRENCIES,
} from '@/logic/supported';
import {
    displayValue,
    validateProfile,
    type ProfileFormState,
    type ProfileFieldErrors,
} from '@/logic/profileValidation';
import { diffProfile } from '@/logic/profileDiff';
import api from '@/lib/api';
import type { MeResponse, UpdateMeRequest } from '@/types/api';

import styles from './profile.module.css';

/** Minimum time the success confirmation stays visible (Req 6.6). */
const SUCCESS_VISIBLE_MS = 3000;

/** Build the editable form state from a `getMe` response (Req 6.1, 6.2). */
function toFormState(me: MeResponse): ProfileFormState {
    return {
        firstName: displayValue(me.firstName),
        lastName: displayValue(me.lastName),
        phone: displayValue(me.phone),
        whatsappEnabled: Boolean(me.whatsappEnabled),
        preferredLanguage: displayValue(me.preferredLanguage),
        preferredCurrency: displayValue(me.preferredCurrency),
    };
}

/**
 * Profile_Page content (Req 6). Rendered only once {@link ProtectedRoute}
 * resolves an authenticated user.
 */
function ProfileContent() {
    const { t } = useTranslation();
    const { setLanguage, setCurrency } = useLocalization();

    // Read the current profile (Req 6.1). Loading/error/retry are uniform (Req 6.9, 6.11).
    const {
        data: me,
        loading: loadingMe,
        error: meError,
        retry,
    } = useApiResource<MeResponse>(() => api.getMe());

    // Editable form state and the baseline used for the changed-fields diff.
    const [form, setForm] = useState<ProfileFormState | null>(null);
    const [original, setOriginal] = useState<ProfileFormState | null>(null);
    const [fieldErrors, setFieldErrors] = useState<ProfileFieldErrors>({});
    const [showSuccess, setShowSuccess] = useState(false);

    const successTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    // Seed the form once the profile arrives (Req 6.1, 6.2).
    useEffect(() => {
        if (me) {
            const next = toFormState(me);
            setForm(next);
            setOriginal(next);
        }
    }, [me]);

    // Clear any pending success timer on unmount.
    useEffect(
        () => () => {
            if (successTimerRef.current !== undefined) {
                clearTimeout(successTimerRef.current);
            }
        },
        [],
    );

    const {
        submit,
        submitting,
        error: updateError,
    } = useApiMutation<Partial<UpdateMeRequest>, MeResponse>(
        (diff) => api.updateMe(diff),
        {
            onSuccess: (updated) => {
                // Render the updated values and reset the diff baseline (Req 6.6).
                const next = toFormState(updated);
                setForm(next);
                setOriginal(next);

                // Sync language/currency preferences into the Localization_Context
                // (Req 6.7, 6.8).
                if (updated.preferredLanguage) {
                    setLanguage(updated.preferredLanguage);
                }
                if (updated.preferredCurrency) {
                    setCurrency(updated.preferredCurrency);
                }

                // Persist the confirmation for at least 3 seconds (Req 6.6).
                setShowSuccess(true);
                if (successTimerRef.current !== undefined) {
                    clearTimeout(successTimerRef.current);
                }
                successTimerRef.current = setTimeout(() => {
                    setShowSuccess(false);
                }, SUCCESS_VISIBLE_MS);
            },
        },
    );

    const updateField = <K extends keyof ProfileFormState>(
        key: K,
        value: ProfileFormState[K],
    ) => {
        setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (!form || !original || submitting) {
            return;
        }

        // Field-level validation; withhold the submission when invalid (Req 6.12).
        const result = validateProfile(form);
        if (!result.isValid) {
            setFieldErrors(result.fieldErrors);
            return;
        }
        setFieldErrors({});

        // Send only changed fields; withhold the call entirely when nothing
        // changed (Req 6.3, 6.4).
        const diff = diffProfile(original, form);
        if (Object.keys(diff).length === 0) {
            return;
        }

        setShowSuccess(false);
        void submit(diff);
    };

    const fieldErrorText = (field: keyof ProfileFieldErrors): string | null =>
        fieldErrors[field] ? t(`profile.errors.${field}`) : null;

    // Initial load: show a Loading_State while getMe is in flight (Req 6.9).
    if (loadingMe && !form) {
        return (
            <main className={styles.main}>
                <div className={styles.container}>
                    <LoadingState message={t('profile.loading')} />
                </div>
            </main>
        );
    }

    // getMe failed before we had any data: surface an Error_State with retry
    // (Req 6.11).
    if (meError && !form) {
        return (
            <main className={styles.main}>
                <div className={styles.container}>
                    <ErrorState message={meError.message} onRetry={retry} />
                </div>
            </main>
        );
    }

    if (!form) {
        return null;
    }

    return (
        <main className={styles.main}>
            <div className={styles.container}>
                <header className={styles.heading}>
                    <h1 className={styles.title}>{t('profile.title')}</h1>
                    <p className={styles.subtitle}>{t('profile.subtitle')}</p>
                </header>

                {showSuccess && (
                    <div className={styles.success} role="status" aria-live="polite">
                        {t('profile.success')}
                    </div>
                )}

                {/* updateMe error: surface a message and retain entered values (Req 6.11). */}
                {updateError && (
                    <ErrorState
                        className={styles.formError}
                        message={updateError.message}
                    />
                )}

                <form className={styles.form} onSubmit={handleSubmit} noValidate>
                    <div className={styles.row}>
                        <Field
                            id="firstName"
                            label={t('profile.firstName')}
                            error={fieldErrorText('firstName')}
                        >
                            <TextInput
                                type="text"
                                value={form.firstName}
                                onChange={(e) => updateField('firstName', e.target.value)}
                                disabled={submitting}
                                autoComplete="given-name"
                            />
                        </Field>

                        <Field
                            id="lastName"
                            label={t('profile.lastName')}
                            error={fieldErrorText('lastName')}
                        >
                            <TextInput
                                type="text"
                                value={form.lastName}
                                onChange={(e) => updateField('lastName', e.target.value)}
                                disabled={submitting}
                                autoComplete="family-name"
                            />
                        </Field>
                    </div>

                    {/* Email is read-only; the API does not accept email changes (Req 6.1). */}
                    <Field id="email" label={t('profile.email')}>
                        <TextInput
                            type="email"
                            value={displayValue(me?.email)}
                            readOnly
                            disabled
                            autoComplete="email"
                        />
                    </Field>

                    <Field
                        id="phone"
                        label={t('profile.phone')}
                        error={fieldErrorText('phone')}
                    >
                        <TextInput
                            type="tel"
                            value={form.phone}
                            onChange={(e) => updateField('phone', e.target.value)}
                            disabled={submitting}
                            autoComplete="tel"
                        />
                    </Field>

                    <div className={styles.row}>
                        <div className={styles.selectField}>
                            <label htmlFor="preferredLanguage" className={styles.label}>
                                {t('profile.language')}
                            </label>
                            <select
                                id="preferredLanguage"
                                className={`${styles.select} ${fieldErrors.preferredLanguage ? styles.selectError : ''
                                    }`}
                                value={form.preferredLanguage}
                                onChange={(e) =>
                                    updateField('preferredLanguage', e.target.value)
                                }
                                disabled={submitting}
                                aria-invalid={fieldErrors.preferredLanguage || undefined}
                                aria-describedby={
                                    fieldErrors.preferredLanguage
                                        ? 'preferredLanguage-error'
                                        : undefined
                                }
                            >
                                {SUPPORTED_LANGUAGES.map((lang) => (
                                    <option key={lang} value={lang}>
                                        {lang.toUpperCase()}
                                    </option>
                                ))}
                            </select>
                            <FieldError
                                id="preferredLanguage-error"
                                message={fieldErrorText('preferredLanguage')}
                            />
                        </div>

                        <div className={styles.selectField}>
                            <label htmlFor="preferredCurrency" className={styles.label}>
                                {t('profile.currency')}
                            </label>
                            <select
                                id="preferredCurrency"
                                className={`${styles.select} ${fieldErrors.preferredCurrency ? styles.selectError : ''
                                    }`}
                                value={form.preferredCurrency}
                                onChange={(e) =>
                                    updateField('preferredCurrency', e.target.value)
                                }
                                disabled={submitting}
                                aria-invalid={fieldErrors.preferredCurrency || undefined}
                                aria-describedby={
                                    fieldErrors.preferredCurrency
                                        ? 'preferredCurrency-error'
                                        : undefined
                                }
                            >
                                {SUPPORTED_CURRENCIES.map((curr) => (
                                    <option key={curr} value={curr}>
                                        {curr}
                                    </option>
                                ))}
                            </select>
                            <FieldError
                                id="preferredCurrency-error"
                                message={fieldErrorText('preferredCurrency')}
                            />
                        </div>
                    </div>

                    <label className={styles.checkboxRow}>
                        <input
                            type="checkbox"
                            className={styles.checkbox}
                            checked={form.whatsappEnabled}
                            onChange={(e) =>
                                updateField('whatsappEnabled', e.target.checked)
                            }
                            disabled={submitting}
                        />
                        <span className={styles.checkboxText}>
                            <span className={styles.checkboxLabel}>
                                {t('profile.whatsapp')}
                            </span>
                            <span className={styles.checkboxHint}>
                                {t('profile.whatsappHint')}
                            </span>
                        </span>
                    </label>

                    {/* Loading_State while updateMe is in progress (Req 6.10). */}
                    {submitting && (
                        <LoadingState message={t('profile.saving')} size={24} />
                    )}

                    <SubmitButton
                        loading={submitting}
                        loadingText={t('profile.saving')}
                        className={styles.submit}
                    >
                        {t('profile.save')}
                    </SubmitButton>
                </form>
            </div>
        </main>
    );
}

/**
 * Profile_Page route. Guards content behind authentication (Req 12) and
 * composes the shared Header/Footer per the Theme_Conventions.
 */
export default function ProfilePage() {
    return (
        <>
            <Header forceVisible={true} forceScrolled={true} />
            <ProtectedRoute>
                <ProfileContent />
            </ProtectedRoute>
            <Footer />
        </>
    );
}
