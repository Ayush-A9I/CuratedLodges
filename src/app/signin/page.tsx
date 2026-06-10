"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { OAuthButtons } from '@/components/auth';
import { consumePostLoginPath } from '@/lib/auth-redirect';
import styles from './signin.module.css';

export default function SignInPage() {
  const router = useRouter();
  const { login, register, isAuthenticated, error: authError, clearError } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Sign In form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Sign Up form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');
  // Honor a stored protected-route destination (consumed once on mount), falling
  // back to '/' when none was stored (Req 12.2/12.4).
  const [postLoginPath] = useState(() => consumePostLoginPath());

  const images = [
    'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=1920&q=80',
    'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1920&q=80',
    'https://images.unsplash.com/photo-1535083783855-76ae62b2914e?w=1920&q=80',
    'https://images.unsplash.com/photo-1549366021-9f761d450615?w=1920&q=80'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    clearError();
    setIsLoading(true);
    try {
      await login(email, password);
      router.push('/');
    } catch {
      // Error is set in AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    clearError();

    if (signupPassword !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }
    if (signupPassword.length < 8) {
      setLocalError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);
    try {
      await register({
        firstName,
        lastName,
        email: signupEmail,
        password: signupPassword,
      });
      setSuccessMessage('Account created successfully! Redirecting...');
      setTimeout(() => router.push('/'), 1500);
    } catch {
      // Error is set in AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  const displayError = localError || authError;

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
          {images.map((image, index) => (
            <div
              key={index}
              className={`${styles.carouselImage} ${index === currentImageIndex ? styles.active : ''
                }`}
              style={{ backgroundImage: `url(${image})` }}
            />
          ))}
        </div>
        <div className={styles.imageOverlay}>
          <h2 className={styles.imageTitle}>
            {isSignUp ? 'Begin Your Wild Journey' : 'Welcome Back to Your Wild Journey'}
          </h2>
          <p className={styles.imageSubtitle}>
            {isSignUp
              ? 'Create an account to book extraordinary stays and explore the wilderness'
              : 'Sign in to manage bookings and discover new adventures'
            }
          </p>
        </div>
        <div className={styles.indicators}>
          {images.map((_, index) => (
            <button
              key={index}
              className={`${styles.indicator} ${index === currentImageIndex ? styles.activeIndicator : ''
                }`}
              onClick={() => setCurrentImageIndex(index)}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Right Side - Form */}
      <div className={styles.rightPanel}>
        <div className={styles.formContainer}>
          {displayError && (
            <div style={{
              color: '#e74c3c',
              fontSize: '0.85rem',
              padding: '0.75rem 1rem',
              background: '#ffeaea',
              borderRadius: '8px',
              marginBottom: '1rem'
            }}>
              {displayError}
            </div>
          )}
          {successMessage && (
            <div style={{
              color: '#27ae60',
              fontSize: '0.85rem',
              padding: '0.75rem 1rem',
              background: '#eafff0',
              borderRadius: '8px',
              marginBottom: '1rem'
            }}>
              {successMessage}
            </div>
          )}

          {!isSignUp ? (
            <>
              <div className={styles.formHeader}>
                <h2 className={styles.formTitle}>Sign In</h2>
                <p className={styles.formSubtitle}>Have a Junglore.com account? Use the same credentials to sign in.</p>
              </div>

              <form className={styles.form} onSubmit={handleSignIn}>
                <div className={styles.inputGroup}>
                  <label htmlFor="email" className={styles.label}>Email</label>
                  <input
                    type="email"
                    id="email"
                    placeholder="your@email.com"
                    className={styles.input}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="password" className={styles.label}>Password</label>
                  <input
                    type="password"
                    id="password"
                    placeholder="Enter your password"
                    className={styles.input}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.forgotPassword}>
                  <a href="/forgot-password" className={styles.forgotLink}>
                    Forgot password?
                  </a>
                </div>

                <button type="submit" className={styles.submitButton} disabled={isLoading}>
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </button>

                <div className={styles.divider}>
                  <span>OR</span>
                </div>

                <OAuthButtons
                  redirectTo={postLoginPath}
                  onError={(msg) => setLocalError(msg)}
                  containerClassName={styles.socialButtons}
                  buttonClassName={styles.socialButton}
                  iconClassName={styles.socialIcon}
                />
              </form>

              <div className={styles.signupPrompt}>
                <p>Don&apos;t have an account? <button onClick={() => { setIsSignUp(true); clearError(); setLocalError(''); }} className={styles.signupLink}>Sign Up</button></p>
              </div>

            </>
          ) : (
            <>
              <div className={styles.formHeader}>
                <h2 className={styles.formTitle}>Create Account</h2>
                <p className={styles.formSubtitle}>Join us to discover your perfect basecamp</p>
              </div>

              <form className={styles.form} onSubmit={handleSignUp}>
                <div className={styles.nameRow}>
                  <div className={styles.inputGroup}>
                    <label htmlFor="firstName" className={styles.label}>First Name</label>
                    <input
                      type="text"
                      id="firstName"
                      placeholder="John"
                      className={styles.input}
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label htmlFor="lastName" className={styles.label}>Last Name</label>
                    <input
                      type="text"
                      id="lastName"
                      placeholder="Doe"
                      className={styles.input}
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="signupEmail" className={styles.label}>Email</label>
                  <input
                    type="email"
                    id="signupEmail"
                    placeholder="your@email.com"
                    className={styles.input}
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="signupPassword" className={styles.label}>Password</label>
                  <input
                    type="password"
                    id="signupPassword"
                    placeholder="Create a password"
                    className={styles.input}
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="confirmPassword" className={styles.label}>Confirm Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    placeholder="Confirm your password"
                    className={styles.input}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className={styles.submitButton} disabled={isLoading}>
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </button>

                <div className={styles.divider}>
                  <span>OR</span>
                </div>

                <OAuthButtons
                  redirectTo={postLoginPath}
                  onError={(msg) => setLocalError(msg)}
                  containerClassName={styles.socialButtons}
                  buttonClassName={styles.socialButton}
                  iconClassName={styles.socialIcon}
                />
              </form>

              <div className={styles.signupPrompt}>
                <p>Already have an account? <button onClick={() => { setIsSignUp(false); clearError(); setLocalError(''); }} className={styles.signupLink}>Sign In</button></p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
