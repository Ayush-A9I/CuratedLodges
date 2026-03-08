"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './forgotpassword.module.css';

export default function ForgotPasswordPage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [emailSent, setEmailSent] = useState(false);
  
  const images = [
    'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=1920&q=80',
    'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1920&q=80',
    'https://images.unsplash.com/photo-1535083783855-76ae62b2914e?w=1920&q=80',
    'https://images.unsplash.com/photo-1549366021-9f761d450615?w=1920&q=80'
  ];

  useEffect(() => {
    // Rotate images every 5 seconds
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [images.length]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate sending email
    setEmailSent(true);
  };

  return (
    <div className={styles.pageContainer}>
      {/* Left Side - Images */}
      <div className={styles.leftPanel}>
        {/* Logo on Left Panel */}
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
              className={`${styles.carouselImage} ${
                index === currentImageIndex ? styles.active : ''
              }`}
              style={{ backgroundImage: `url(${image})` }}
            />
          ))}
        </div>
        <div className={styles.imageOverlay}>
          <h2 className={styles.imageTitle}>
            Reset Your Password
          </h2>
          <p className={styles.imageSubtitle}>
            Don&apos;t worry, it happens to the best of us. We&apos;ll help you get back to planning your next adventure.
          </p>
        </div>
        {/* Image Indicators */}
        <div className={styles.indicators}>
          {images.map((_, index) => (
            <button
              key={index}
              className={`${styles.indicator} ${
                index === currentImageIndex ? styles.activeIndicator : ''
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
          {!emailSent ? (
            // Forgot Password Form
            <>
              <div className={styles.formHeader}>
                <h2 className={styles.formTitle}>Forgot Password?</h2>
                <p className={styles.formSubtitle}>
                  Enter your email address and we&apos;ll send you a link to reset your password.
                </p>
              </div>

              <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.inputGroup}>
                  <label htmlFor="email" className={styles.label}>Email</label>
                  <input
                    type="email"
                    id="email"
                    placeholder="your@email.com"
                    className={styles.input}
                    required
                  />
                </div>

                <button type="submit" className={styles.submitButton}>
                  Send Reset Link
                </button>
              </form>

              <div className={styles.signupPrompt}>
                <p>
                  Remember your password?{' '}
                  <Link href="/signin" className={styles.signupLink}>
                    Sign In
                  </Link>
                </p>
              </div>
            </>
          ) : (
            // Success Message
            <>
              <div className={styles.formHeader}>
                <div className={styles.successIcon}>
                  <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                    <circle cx="32" cy="32" r="32" fill="#E8F5E9"/>
                    <path d="M20 32L28 40L44 24" stroke="#4CAF50" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h2 className={styles.formTitle}>Check Your Email</h2>
                <p className={styles.formSubtitle}>
                  We&apos;ve sent a password reset link to your email address. Please check your inbox and follow the instructions.
                </p>
              </div>

              <div className={styles.successInfo}>
                <p className={styles.successInfoText}>
                  Didn&apos;t receive the email? Check your spam folder or{' '}
                  <button 
                    onClick={() => setEmailSent(false)} 
                    className={styles.resendLink}
                  >
                    try again
                  </button>
                </p>
              </div>

              <div className={styles.signupPrompt}>
                <p>
                  <Link href="/signin" className={styles.signupLink}>
                    Back to Sign In
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
