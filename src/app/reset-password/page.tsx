"use client";

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import api from '@/lib/api';
import { useApiMutation } from '@/hooks/useApiMutation';
import {
    validateResetPassword,
    type ResetPasswordErrors,
} from '@/logic/passwordValidation';
import Field from '@/components/form/Field';
import TextInput from '@/components/form/TextInput';
import SubmitButton from '@/components/form/SubmitButton';
import styles from './resetpassword.module.css';
import '@/i18n/config';

const CAROUSEL_IMAGES = [
    'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=1920&q=80',
    'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1920&q=80',
    'https://images.unsplash.com/photo-1535083783855-76ae62b2914e?w=1920&q=80',
    'https://images.unsplash.com/photo-1549366021-9f761d450615?w=1920&q=80',
];

interface ResetArgs {
    token: string;
    newPassword: string;
}

function ResetPasswordContent() {
    const { t } = useTranslation();
    const searchParams = useSearchParams();
    // Req 7.1 — read the reset token from the URL query parameters.
    const token = searchParams.get('token');
    const hasToken = Boolean(token);

    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [password, setPassword] = useState('');
    const [confirmation, setConfirmation] = useState('');
    const [fieldErrors, setFieldErrors] = useState<ResetPasswordErrors>({});
    const [succeeded, setSucceeded] = useState(false);

    // Req 7.6 — single-flight mutation prevents duplicate submissions while in flight.
    const mutation = useApiMutation<ResetArgs, unknown>(
        ({ token: resetToken, newPassword }) =>
            api.resetPassword(resetToken, newPassword),
        {
            // Req 7.7 — on success, show the confirmation view.
            onSuccess: () => setSucceeded(true),
        },
    );

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Req 7.2 — without a token, withhold the call entirely.
        if (!token) {
            return;
        }

        // Req 7.4 / 7.5 — validate length and confirmation match before submitting.
        const result = validateResetPassword(password, confirmation);
        if (!result.isValid) {
            setFieldErrors(result.errors);
            return;
        }
        setFieldErrors({});

        // Req 7.3 — submit the token and the new password.
        await mutation.submit({ token, newPassword: password });
    };

    const lengthError = fieldErrors.length
        ? t('resetPassword.errorLength')
        : null;
    const mismatchError = fieldErrors.mismatch
        ? t('resetPassword.errorMismatch')
        : null;

    return (
        <div className={styles.pageContainer}>
            {/* Left Side - Images */}
            <div className={styles.leftPanel}>
                <div className={styles.leftLogoContainer}>
                    <Link href="/" className={styles.leftLogo}>
                        <Image
                            src="/assests/images/CL_whitelogo.svg"
                            alt="Curated Lodges"
                            width={220}
                            height={55}
                            priority
                            className={styles.leftLogoImage}
                        />
                    </Link>
                </div>

                <div className={styles.imageCarousel}>
                    {CAROUSEL_IMAGES.map((image, index) => (
                        <div
                            key={image}
                            className={`${styles.carouselImage} ${index === currentImageIndex ? styles.active : ''
                                }`}
                            style={{ backgroundImage: `url(${image})` }}
                        />
                    ))}
                </div>
                <div className={styles.imageOverlay}>
                    <h2 className={styles.imageTitle}>{t('resetPassword.imageTitle')}</h2>
                    <p className={styles.imageSubtitle}>
                        {t('resetPassword.imageSubtitle')}
                    </p>
                </div>
                <div className={styles.indicators}>
                    {CAROUSEL_IMAGES.map((image, index) => (
                        <button
                            key={image}
                            type="button"
                            className={`${styles.indicator} ${index === currentImageIndex ? styles.activeIndicator : ''
                                }`}
                            onClick={() => setCurrentImageIndex(index)}
                            aria-label={t('resetPassword.goToImage', { index: index + 1 })}
                        />
                    ))}
                </div>
            </div>

            {/* Right Side - Form */}
            <div className={styles.rightPanel}>
                <div className={styles.formContainer}>
                    {succeeded ? (
                        // Req 7.7 — success confirmation + link to the sign-in page.
                        <>
                            <div className={styles.formHeader}>
                                <div className={styles.successIcon}>
                                    <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                                        <circle cx="32" cy="32" r="32" fill="#E8F5E9" />
                                        <path
                                            d="M20 32L28 40L44 24"
                                            stroke="#4CAF50"
                                            strokeWidth="3"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </div>
                                <h2 className={styles.formTitle}>
                                    {t('resetPassword.successTitle')}
                                </h2>
                                <p className={styles.formSubtitle}>
                                    {t('resetPassword.successSubtitle')}
                                </p>
                            </div>

                            <Link href="/signin" className={styles.primaryLink}>
                                {t('resetPassword.goToSignIn')}
                            </Link>
                        </>
                    ) : !hasToken ? (
                        // Req 7.2 — missing token: error state + disabled submission.
                        <>
                            <div className={styles.formHeader}>
                                <h2 className={styles.formTitle}>
                                    {t('resetPassword.title')}
                                </h2>
                            </div>

                            <div className={styles.errorBanner} role="alert">
                                {t('resetPassword.missingToken')}
                            </div>

                            <form className={styles.form} onSubmit={handleSubmit}>
                                <Field
                                    id="newPassword"
                                    label={t('resetPassword.newPasswordLabel')}
                                >
                                    <TextInput
                                        type="password"
                                        placeholder={t('resetPassword.newPasswordPlaceholder')}
                                        value=""
                                        readOnly
                                        disabled
                                    />
                                </Field>
                                <Field
                                    id="confirmPassword"
                                    label={t('resetPassword.confirmPasswordLabel')}
                                >
                                    <TextInput
                                        type="password"
                                        placeholder={t('resetPassword.confirmPasswordPlaceholder')}
                                        value=""
                                        readOnly
                                        disabled
                                    />
                                </Field>
                                {/* Submission control is disabled when no token is present. */}
                                <SubmitButton disabled>
                                    {t('resetPassword.submit')}
                                </SubmitButton>
                            </form>

                            <div className={styles.signupPrompt}>
                                <p>
                                    <Link href="/forgot-password" className={styles.signupLink}>
                                        {t('resetPassword.requestNewLink')}
                                    </Link>
                                </p>
                            </div>
                        </>
                    ) : (
                        // Reset form
                        <>
                            <div className={styles.formHeader}>
                                <h2 className={styles.formTitle}>
                                    {t('resetPassword.title')}
                                </h2>
                                <p className={styles.formSubtitle}>
                                    {t('resetPassword.subtitle')}
                                </p>
                            </div>

                            {/* Req 7.8 — submission error state; values are retained. */}
                            {mutation.error && (
                                <div className={styles.errorBanner} role="alert">
                                    {mutation.error.message}
                                </div>
                            )}

                            <form className={styles.form} onSubmit={handleSubmit} noValidate>
                                <Field
                                    id="newPassword"
                                    label={t('resetPassword.newPasswordLabel')}
                                    error={lengthError}
                                    required
                                >
                                    <TextInput
                                        type="password"
                                        placeholder={t('resetPassword.newPasswordPlaceholder')}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        autoComplete="new-password"
                                    />
                                </Field>

                                <Field
                                    id="confirmPassword"
                                    label={t('resetPassword.confirmPasswordLabel')}
                                    error={mismatchError}
                                    required
                                >
                                    <TextInput
                                        type="password"
                                        placeholder={t('resetPassword.confirmPasswordPlaceholder')}
                                        value={confirmation}
                                        onChange={(e) => setConfirmation(e.target.value)}
                                        autoComplete="new-password"
                                    />
                                </Field>

                                <SubmitButton
                                    loading={mutation.submitting}
                                    loadingText={t('resetPassword.submitting')}
                                >
                                    {t('resetPassword.submit')}
                                </SubmitButton>
                            </form>

                            <div className={styles.signupPrompt}>
                                <p>
                                    {t('resetPassword.rememberPassword')}{' '}
                                    <Link href="/signin" className={styles.signupLink}>
                                        {t('resetPassword.signIn')}
                                    </Link>
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    // useSearchParams requires a Suspense boundary in the App Router.
    return (
        <Suspense fallback={null}>
            <ResetPasswordContent />
        </Suspense>
    );
}
