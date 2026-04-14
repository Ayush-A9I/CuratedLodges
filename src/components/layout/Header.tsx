"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Globe, DollarSign } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocalization } from '@/contexts/LocalizationContext';
import styles from './Header.module.css';

interface HeaderProps {
  forceVisible?: boolean;
  forceScrolled?: boolean;
  darkMode?: boolean;
  whiteTextAlways?: boolean;
}

const Header: React.FC<HeaderProps> = ({ forceVisible = false, forceScrolled = false, darkMode = false, whiteTextAlways = false }) => {
  const [isScrolled, setIsScrolled] = useState(forceScrolled);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { setIsModalOpen, currency, language } = useLocalization();
  const { t } = useTranslation();

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

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
    <header className={`${styles.header} ${isScrolled ? styles.scrolled : styles.transparent} ${!isVisible ? styles.hidden : ''} ${darkMode ? styles.darkMode : ''} ${whiteTextAlways ? styles.whiteTextAlways : ''}`}>
      <div className={styles.container}>
        {/* Logo Section */}
        <div className={styles.logoWrapper}>
          <Link href="/" className={styles.logo}>
            <Image 
              src={whiteTextAlways ? "/assests/images/CL_whitelogo.svg" : (isScrolled ? "/assests/images/curatedlodges_logo.svg" : "/assests/images/CL_whitelogo.svg")}
              alt="Curated Lodges"
              width={180}
              height={45}
              priority
              className={styles.logoImage}
            />
          </Link>
        </div>
        
        {/* Center Navigation Links */}
        <nav className={styles.nav} aria-label="Primary navigation">
          <a href="/experience" className={`${styles.navLink} ${pathname === '/experience' ? styles.active : ''}`}>
            {t('header.experience')}
            <span className={styles.underline}></span>
          </a>
          <a href="/basecamps" className={`${styles.navLink} ${pathname === '/basecamps' ? styles.active : ''}`}>
            {t('header.basecamps')}
            <span className={styles.underline}></span>
          </a>
          <a href="/field-notes" className={`${styles.navLink} ${pathname?.startsWith('/field-notes') ? styles.active : ''}`}>
            {t('header.fieldNotes')}
            <span className={styles.underline}></span>
          </a>
        </nav>

        {/* Mobile Menu Button */}
        {!isMobileMenuOpen && (
          <button 
            className={styles.hamburger}
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open mobile menu"
          >
            <span className={styles.hamburgerLine}></span>
            <span className={styles.hamburgerLine}></span>
            <span className={styles.hamburgerLine}></span>
          </button>
        )}

        {/* Right Action Button */}
        <div className={styles.actions}>
          <button 
            onClick={() => setIsModalOpen(true)}
            className={styles.localizationButton}
            aria-label="Change language and currency"
          >
            <Globe size={18} />
            <span>{language.toUpperCase()}</span>
            <span style={{ margin: '0 4px', opacity: 0.5 }}>•</span>
            <DollarSign size={18} />
            <span>{currency}</span>
          </button>
          <Link href="/signin" className={styles.conciergeButton}>
            {t('header.signIn')}
          </Link>
        </div>
      </div>

      {/* Mobile Menu Overlay and Drawer */}
      {isMobileMenuOpen && (
        <>
          <div className={styles.mobileOverlay} onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className={styles.mobileMenu}>
            <div className={styles.mobileMenuHeader}>
              <button 
                className={styles.closeButton}
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <span className={styles.closeIcon}></span>
                <span className={styles.closeIcon}></span>
              </button>
            </div>
            <nav className={styles.mobileNav}>
              <Link href="/experience" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>
                {t('header.experience')}
              </Link>
              <Link href="/basecamps" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>
                {t('header.basecamps')}
              </Link>
              <Link href="/field-notes" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>
                {t('header.fieldNotes')}
              </Link>
              <button 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsModalOpen(true);
                }}
                className={styles.mobileNavLink}
              >
                <Globe size={18} />
                <span>{language.toUpperCase()}</span>
                <span style={{ margin: '0 8px', opacity: 0.5 }}>•</span>
                <DollarSign size={18} />
                <span>{currency}</span>
              </button>
              <Link href="/signin" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>
                {t('header.signIn')}
              </Link>
            </nav>
          </div>
        </>
      )}
    </header>
  );
};

export default Header;
