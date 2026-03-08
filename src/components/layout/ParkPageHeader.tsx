"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import Image from 'next/image';
import { Globe, DollarSign } from 'lucide-react';
import { useLocalization } from '@/contexts/LocalizationContext';
import SearchBox from '../domain/SearchBox';
import { lodgesData } from '@/data/mock/LodgeData';
import styles from './ParkPageHeader.module.css';

interface ParkPageHeaderProps {
  region?: string;
  park?: string;
}

const ParkPageHeader: React.FC<ParkPageHeaderProps> = ({ region = '', park = '' }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string>(region);
  const [selectedPark, setSelectedPark] = useState<string>(park);
  const { setIsModalOpen, currency, language } = useLocalization();
  
  // Drag-to-close state
  const [dragStartY, setDragStartY] = useState<number>(0);
  const [dragOffset, setDragOffset] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const regions = [
    { value: 'india', label: 'India' },
    { value: 'africa', label: 'Africa' }
  ];

  const getNationalParks = () => {
    if (!selectedRegion) return [];
    const regionData = lodgesData[selectedRegion as keyof typeof lodgesData];
    if (!regionData) return [];
    return Object.keys(regionData).map(parkName => ({
      value: parkName,
      label: parkName
    }));
  };

  const createSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleSearch = () => {
    if (selectedRegion && selectedPark) {
      window.location.href = `/park/${selectedRegion}/${createSlug(selectedPark)}`;
      setIsEditModalOpen(false);
    }
  };

  const handleClearAll = () => {
    setSelectedRegion('');
    setSelectedPark('');
  };

  const handleSearchClick = () => {
    // Only open modal on mobile screens (768px and below)
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      setIsEditModalOpen(true);
    }
  };

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

  // Reset drag state when modal closes
  useEffect(() => {
    if (!isEditModalOpen) {
      setDragOffset(0);
      setIsDragging(false);
    }
  }, [isEditModalOpen]);

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

  // Drag-to-close handlers for mobile modal
  const handleTouchStart = (e: React.TouchEvent) => {
    // Only enable dragging on mobile screens
    if (typeof window !== 'undefined' && window.innerWidth > 768) return;
    
    setDragStartY(e.touches[0].clientY);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || typeof window === 'undefined' || window.innerWidth > 768) return;
    
    const currentY = e.touches[0].clientY;
    const diff = currentY - dragStartY;
    
    // Only allow dragging downward
    if (diff > 0) {
      setDragOffset(diff);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    // Close modal if dragged down more than 150px
    if (dragOffset > 150) {
      setIsEditModalOpen(false);
    }
    
    // Reset drag offset (will animate back to position if not closed)
    setDragOffset(0);
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
        <div className={styles.mobileSearchDisplay} onClick={handleSearchClick}>
          <div className={styles.mobileSearchContent}>
            <div className={styles.mobileRegion}>{region || 'Select region'}</div>
            <div className={styles.mobilePark}>{formatParkName(park) || 'Select park'}</div>
          </div>
        </div>
        
        {/* Logo Section */}
        <div className={styles.logoWrapper}>
          <Link href="/" className={styles.logo}>
            <Image 
              src="/assests/images/curatedlodges_logo.svg"
              alt="Curated Lodges"
              width={180}
              height={45}
              priority
              className={styles.logoImage}
            />
          </Link>
        </div>
        
        {/* Integrated Search Box - Desktop - Clickable to open modal */}
        <div className={styles.searchWrapper} onClick={handleSearchClick}>
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
                Sign In
              </Link>
            </nav>
          </div>
        </>
      )}

      {/* Edit Details Modal - Rendered via Portal to overlay entire page */}
      {isEditModalOpen && typeof document !== 'undefined' && createPortal(
        <>
          <div 
            className={styles.modalOverlay} 
            onClick={() => setIsEditModalOpen(false)}
            style={{
              opacity: dragOffset > 0 ? Math.max(0, 1 - dragOffset / 300) : 1,
              transition: isDragging ? 'none' : 'opacity 0.3s ease-out'
            }}
          ></div>
          <div 
            className={styles.editModal}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
              transform: `translateY(${dragOffset}px)`,
              transition: isDragging ? 'none' : 'transform 0.3s ease-out'
            }}
          >
            <div className={styles.modalHandle}></div>
            <h2 className={styles.modalTitle}>Edit Details</h2>
            
            <div className={styles.modalContent}>
              {/* Select Region Section */}
              <div className={styles.simpleSection}>
                <label className={styles.sectionLabel}>Select Region</label>
                <div className={styles.optionsGrid}>
                  {regions.map((regionItem) => (
                    <button
                      key={regionItem.value}
                      className={`${styles.optionButton} ${selectedRegion === regionItem.value ? styles.optionButtonActive : ''}`}
                      onClick={() => {
                        setSelectedRegion(regionItem.value);
                        setSelectedPark('');
                      }}
                    >
                      {regionItem.label}
                      {selectedRegion === regionItem.value && (
                        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                          <path d="M16.6667 5L7.50004 14.1667L3.33337 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Select National Park Section */}
              {selectedRegion && (
                <div className={styles.simpleSection}>
                  <label className={styles.sectionLabel}>Select National Park</label>
                  <div className={styles.optionsGrid}>
                    {getNationalParks().map((parkItem) => (
                      <button
                        key={parkItem.value}
                        className={`${styles.optionButton} ${selectedPark === parkItem.value ? styles.optionButtonActive : ''}`}
                        onClick={() => setSelectedPark(parkItem.value)}
                      >
                        {parkItem.label}
                        {selectedPark === parkItem.value && (
                          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                            <path d="M16.6667 5L7.50004 14.1667L3.33337 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className={styles.modalActions}>
              <button className={styles.clearButton} onClick={handleClearAll}>
                Clear All
              </button>
              <button 
                className={`${styles.searchButton} ${(!selectedRegion || !selectedPark) ? styles.disabled : ''}`}
                onClick={handleSearch}
                disabled={!selectedRegion || !selectedPark}
              >
                Search
              </button>
            </div>
          </div>
        </>,
        document.body
      )}
    </header>
  );
};

export default ParkPageHeader;
