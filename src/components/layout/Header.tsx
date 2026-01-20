"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './Header.module.css';

interface HeaderProps {
  forceVisible?: boolean;
  forceScrolled?: boolean;
  darkMode?: boolean;
}

const Header: React.FC<HeaderProps> = ({ forceVisible = false, forceScrolled = false, darkMode = false }) => {
  const [isScrolled, setIsScrolled] = useState(forceScrolled);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    // If forced states are enabled, don't add scroll listener
    if (forceVisible && forceScrolled) {
      setIsVisible(true);
      setIsScrolled(true);
      return;
    }

    const onScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Glassmorphic transition: transparent at top, frosted when scrolled
      if (!forceScrolled) {
        setIsScrolled(currentScrollY > 20);
      }
      
      // Show/hide based on scroll direction
      if (!forceVisible) {
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
          // Scrolling down and past 100px
          setIsVisible(false);
        } else if (currentScrollY < lastScrollY) {
          // Scrolling up
          setIsVisible(true);
        }
      }
      
      setLastScrollY(currentScrollY);
    };
    
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [lastScrollY, forceVisible, forceScrolled]);

  return (
    <header className={`${styles.header} ${isScrolled ? styles.scrolled : styles.transparent} ${!isVisible ? styles.hidden : ''} ${darkMode ? styles.darkMode : ''}`}>
      <div className={styles.container}>
        {/* Logo Section */}
        <div className={styles.logoWrapper}>
          <Link href="/" className={styles.logo}>
            Curated Lodges<span className={styles.dot}>.</span>
          </Link>
          <div className={styles.poweredBy}>Powered by Junglore</div>
        </div>
        
        {/* Center Navigation Links */}
        <nav className={styles.nav} aria-label="Primary navigation">
          <a href="/expeditions" className={styles.navLink}>
            Expeditions
            <span className={styles.underline}></span>
          </a>
          <a href="/basecamps" className={styles.navLink}>
            Basecamps
            <span className={styles.underline}></span>
          </a>
          <a href="/field-notes" className={styles.navLink}>
            Field Notes
            <span className={styles.underline}></span>
          </a>
        </nav>

        {/* Right Action Button */}
        <div className={styles.actions}>
          <a href="/signin" className={styles.conciergeButton}>
            Sign In 
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
