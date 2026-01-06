"use client";

import React from 'react';
import SearchBox from '../domain/SearchBox';
import styles from './ParkPageHeader.module.css';

interface ParkPageHeaderProps {
  region?: string;
  park?: string;
}

const ParkPageHeader: React.FC<ParkPageHeaderProps> = ({ region = '', park = '' }) => {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Logo Section */}
        <div className={styles.logoWrapper}>
          <a href="/" className={styles.logo}>
            Curated Lodges<span className={styles.dot}>.</span>
          </a>
          <div className={styles.poweredBy}>Powered by Junglore</div>
        </div>
        
        {/* Integrated Search Box */}
        <div className={styles.searchWrapper}>
          <SearchBox initialRegion={region} initialPark={park} />
        </div>

        {/* Right Action Button */}
        <div className={styles.actions}>
          <a href="/signin" className={styles.signInButton}>
            Sign In 
          </a>
        </div>
      </div>
    </header>
  );
};

export default ParkPageHeader;
