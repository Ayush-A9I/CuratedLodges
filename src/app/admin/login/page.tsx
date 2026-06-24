'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { AdminInput, SaveButton } from '@/components/admin';
import { AUTH_HERO_IMAGES } from '@/lib/authHeroImages';
import styles from '@/components/admin/admin.module.css';

export default function AdminLoginPage() {
    const router = useRouter();
    const { login, error, clearError, isAuthenticated, isLoading } = useAdminAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [heroIndex, setHeroIndex] = useState(0);

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            router.replace('/admin');
        }
    }, [isLoading, isAuthenticated, router]);

    useEffect(() => {
        const interval = setInterval(() => {
            setHeroIndex((prev) => (prev + 1) % AUTH_HERO_IMAGES.length);
        }, 6000);
        return () => clearInterval(interval);
    }, []);

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
            <aside className={styles.loginHero} aria-hidden="true">
                <div className={styles.loginHeroLogoWrap}>
                    <Image
                        src="/assests/images/CL_whitelogo.svg"
                        alt=""
                        width={240}
                        height={60}
                        className={styles.loginHeroLogo}
                        priority
                    />
                </div>

                <div className={styles.loginCarousel}>
                    {AUTH_HERO_IMAGES.map((src, index) => (
                        <div
                            key={src}
                            className={`${styles.loginCarouselSlide} ${
                                index === heroIndex ? styles.loginCarouselSlideActive : ''
                            }`.trim()}
                            style={{ backgroundImage: `url(${src})` }}
                        />
                    ))}
                </div>

                <div className={styles.loginHeroScrim} />

                <div className={styles.loginHeroCopy}>
                    <p className={styles.loginHeroEyebrow}>Powered by Junglore</p>
                    <h1 className={styles.loginHeroTitle}>Curated Lodges Admin</h1>
                    <p className={styles.loginHeroSubtitle}>
                        Manage lodges, content, and bookings for extraordinary wildlife stays.
                    </p>
                </div>

                <div className={styles.loginHeroDots}>
                    {AUTH_HERO_IMAGES.map((_, index) => (
                        <button
                            key={index}
                            type="button"
                            className={`${styles.loginHeroDot} ${
                                index === heroIndex ? styles.loginHeroDotActive : ''
                            }`.trim()}
                            aria-label={`Show hero image ${index + 1}`}
                            onClick={() => setHeroIndex(index)}
                        />
                    ))}
                </div>
            </aside>

            <div className={styles.loginPanel}>
                <form className={styles.loginCard} onSubmit={handleSubmit}>
                    <Image
                        src="/assests/images/curatedlodges_logo.svg"
                        alt="Curated Lodges"
                        width={200}
                        height={40}
                        className={styles.loginLogo}
                        priority
                    />
                    <h2 className={styles.loginFormTitle}>Sign in</h2>
                    <p className={styles.loginSubtitle}>Admin panel — enter your credentials to continue.</p>

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

                    <p className={styles.loginHint}>Authorized team members only.</p>
                </form>
            </div>
        </div>
    );
}
