"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import SearchBox from '../domain/SearchBox';
import styles from './ParkPageHeader.module.css';

interface ParkPageHeaderProps {
  region?: string;
  park?: string;
}

const ParkPageHeader: React.FC<ParkPageHeaderProps> = ({ region = '', park = '' }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Prevent body scroll when mobile menu or edit modal is open
  useEffect(() => {
    if (isMobileMenuOpen || isEditModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen, isEditModalOpen]);

  const handleBack = () => {
    window.history.back();
  };

  // Format park name to show truncated version on mobile
  const formatParkName = (name: string) => {
    if (name.length > 25) {
      return name.substring(0, 25) + '...';
    }
    return name;
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Back Button - Mobile Only */}
        <button className={styles.backButton} onClick={handleBack} aria-label="Go back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Mobile Compact Search Display */}
        <div className={styles.mobileSearchDisplay} onClick={() => setIsEditModalOpen(true)}>
          <div className={styles.mobileSearchContent}>
            <div className={styles.mobileRegion}>{region || 'Select region'}</div>
            <div className={styles.mobilePark}>{formatParkName(park) || 'Select park'}</div>
          </div>
        </div>
        
        {/* Logo Section */}
        <div className={styles.logoWrapper}>
          <Link href="/" className={styles.logo}>
            Curated Lodges<span className={styles.dot}>.</span>
          </Link>
          <div className={styles.poweredBy}>Powered by Junglore</div>
        </div>
        
        {/* Integrated Search Box - Desktop */}
        <div className={styles.searchWrapper}>
          <SearchBox initialRegion={region} initialPark={park} compact={true} />
        </div>

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
          <a href="/signin" className={styles.signInButton}>
            Sign In 
          </a>
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
                Experience
              </Link>
              <Link href="/basecamps" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>
                Basecamps
              </Link>
              <Link href="/field-notes" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>
                Field Notes
              </Link>
              <Link href="/signin" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>
                Sign In
              </Link>
            </nav>
          </div>
        </>
      )}

      {/* Edit Details Modal - Mobile Only */}
      {isEditModalOpen && (
        <>
          <div className={styles.modalOverlay} onClick={() => setIsEditModalOpen(false)}></div>
          <div className={styles.editModal}>
            <div className={styles.modalHandle}></div>
            <div className={styles.modalContent}>
              <h2 className={styles.modalTitle}>Edit Details</h2>
              
              <div className={styles.fieldGroup}>
                <div className={styles.fieldIcon}>📍</div>
                <div className={styles.fieldContent}>
                  <label className={styles.fieldLabel}>Destination</label>
                  <input 
                    type="text" 
                    className={styles.fieldInput}
                    defaultValue={park}
                    placeholder="Search Location"
                  />
                </div>
                <button className={styles.fieldArrow}>▲</button>
              </div>

              <div className={styles.fieldGroup}>
                <div className={styles.fieldIcon}>📅</div>
                <div className={styles.fieldContent}>
                  <label className={styles.fieldLabel}>Dates</label>
                  <div className={styles.fieldCollapsed}>Checkin - Checkout, 1 Guests</div>
                </div>
                <button className={styles.fieldArrow}>▼</button>
              </div>

              <div className={styles.fieldGroup}>
                <div className={styles.fieldIcon}>👤</div>
                <div className={styles.fieldContent}>
                  <label className={styles.fieldLabel}>Guests</label>
                </div>
                <button className={styles.fieldArrow}>▼</button>
              </div>
            </div>
            
            <div className={styles.modalActions}>
              <button className={styles.clearButton} onClick={() => setIsEditModalOpen(false)}>
                Clear All
              </button>
              <button className={styles.searchButton}>
                Search
              </button>
            </div>
          </div>
        </>
      )}
    </header>
  );
};

export default ParkPageHeader;
