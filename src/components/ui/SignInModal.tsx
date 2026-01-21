"use client";

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import styles from './SignInModal.module.css';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SignInModal: React.FC<SignInModalProps> = ({ isOpen, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const images = [
    '/assests/images/tiger-close.jpg',
    '/assests/images/lodge-exterior.jpg',
    '/assests/images/safari-jeep.jpg',
    '/assests/images/wildlife-nature.jpg'
  ];

  useEffect(() => {
    if (!isOpen) return;

    // Rotate images every 5 seconds
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 5000);

    // Handle escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden'; // Prevent body scroll

    return () => {
      clearInterval(interval);
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, images.length]);

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className={styles.closeButton} onClick={onClose} aria-label="Close modal">
          <X size={24} />
        </button>

        {/* Left Side - Images */}
        <div className={styles.leftPanel}>
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
            <h2 className={styles.imageTitle}>Welcome Back to Your Wild Journey</h2>
            <p className={styles.imageSubtitle}>Sign in to manage bookings and discover new adventures</p>
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
            <div className={styles.formHeader}>
              <h2 className={styles.formTitle}>Sign In</h2>
              <p className={styles.formSubtitle}>Enter your credentials to access your account</p>
            </div>

            <form className={styles.form}>
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

              <div className={styles.inputGroup}>
                <label htmlFor="password" className={styles.label}>Password</label>
                <input
                  type="password"
                  id="password"
                  placeholder="Enter your password"
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.forgotPassword}>
                <a href="/forgot-password" className={styles.forgotLink}>
                  Forgot password?
                </a>
              </div>

              <button type="submit" className={styles.submitButton}>
                Sign In
              </button>

              <div className={styles.divider}>
                <span>OR</span>
              </div>

              <div className={styles.socialButtons}>
                <button type="button" className={styles.socialButton}>
                  <svg className={styles.socialIcon} viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>

                <button type="button" className={styles.socialButton}>
                  <svg className={styles.socialIcon} viewBox="0 0 24 24">
                    <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Continue with Facebook
                </button>
              </div>
            </form>

            <div className={styles.signupPrompt}>
              <p>Don't have an account? <a href="/signup" className={styles.signupLink}>Sign Up</a></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInModal;
