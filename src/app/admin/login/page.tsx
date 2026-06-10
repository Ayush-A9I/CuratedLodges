'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { AdminInput, SaveButton } from '@/components/admin';
import styles from '@/components/admin/admin.module.css';

export default function AdminLoginPage() {
    const router = useRouter();
    const { login, error, clearError, isAuthenticated, isLoading } = useAdminAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // If already authenticated, skip the login screen.
    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            router.replace('/admin');
        }
    }, [isLoading, isAuthenticated, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();
        setSubmitting(true);
        try {
            await login(email, password);
            router.replace('/admin');
        } catch {
            // Error is surfaced via context `error`.
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className={styles.loginScreen}>
            <form className={styles.loginCard} onSubmit={handleSubmit}>
                <Image
                    src="/assests/images/curatedlodges_logo.svg"
                    alt="Curated Lodges"
                    width={200}
                    height={40}
                    className={styles.loginLogo}
                    priority
                />
                <p className={styles.loginSubtitle}>Admin panel — sign in to continue</p>

                {error && <div className={styles.loginError}>{error}</div>}

                <AdminInput
                    label="Email"
                    type="email"
                    name="email"
                    autoComplete="username"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@curatedlodges.com"
                />
                <AdminInput
                    label="Password"
                    type="password"
                    name="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                />

                <SaveButton type="submit" loading={submitting} className={styles.fullWidth}>
                    Sign in
                </SaveButton>

                <p className={styles.loginHint}>Use your admin credentials to access the dashboard.</p>
            </form>
        </div>
    );
}
