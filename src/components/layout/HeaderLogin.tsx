"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './Header.module.css';

const HeaderLogin: React.FC<{ userName: string }> = ({ userName }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
      <Link href="/" className={styles.logo}>Curated Lodges</Link>
      <nav className={styles.nav}>
        <ul className={styles.navList}>
          <li className={styles.navItem}>Destinations</li>
          <li className={styles.navItem}>Expeditions</li>
          <li className={styles.navItem}>Blogs</li>
        </ul>
      </nav>
      <div className={styles.userSection}>
        <span className={styles.userName}>Hi, {userName}</span>
        <button className={styles.logoutButton}>Log out</button>
      </div>
    </header>
  );
};

export default HeaderLogin;
