"use client";

import React, { useState } from 'react';
import styles from './fieldnotes.module.css';
import { fieldNotesData } from '@/data/mock/FieldNotesData';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const FieldNotesPage = () => {
  const [activeFilter, setActiveFilter] = useState<string>('ALL');

  // Get unique parks for filters
  const allParks = ['ALL', ...Array.from(new Set(fieldNotesData.map(note => note.park))), 'OTHERS'];

  // Filter notes based on active filter
  const filteredNotes = activeFilter === 'ALL' 
    ? fieldNotesData 
    : fieldNotesData.filter(note => note.park === activeFilter);

  return (
    <>
      <Header forceVisible={true} darkMode={true} />
      
      <main className={styles.main}>
        <div className={styles.container}>
          {/* Header Section */}
          <div className={styles.headerSection}>
            <p className={styles.eyebrow}>EXPEDITION JAUNTERS</p>
            <h1 className={styles.title}>FIELD NOTES</h1>
            <p className={styles.subtitle}>
              Dispatches from the wild. Technical reports, sighting logs, and conservation stories from our network of naturalists.
            </p>
          </div>

          {/* Filter Buttons */}
          <div className={styles.filterSection}>
            <button className={styles.filterByButton}>
              FILTER BY PARKS
            </button>
            {allParks.map((park) => (
              <button
                key={park}
                className={`${styles.filterButton} ${activeFilter === park ? styles.filterButtonActive : ''}`}
                onClick={() => setActiveFilter(park)}
              >
                {park}
              </button>
            ))}
          </div>

          {/* Articles Grid */}
          <div className={styles.articlesGrid}>
            {filteredNotes.map((note) => (
              <Link 
                key={note.id} 
                href={`/field-notes/${note.slug}`}
                className={styles.articleCard}
              >
                <div className={styles.imageWrapper}>
                  <img 
                    src={note.image} 
                    alt={note.title}
                    className={styles.articleImage}
                  />
                  <div className={styles.parkTag}>{note.park}</div>
                </div>
                <div className={styles.articleContent}>
                  <div className={styles.articleMeta}>
                    <span className={styles.date}>{note.date}</span>
                    <span className={styles.dot}>•</span>
                    <span className={styles.readTime}>{note.readTime}</span>
                  </div>
                  <h3 className={styles.articleTitle}>{note.title.toLowerCase()}</h3>
                  <p className={styles.articleExcerpt}>{note.excerpt}</p>
                  <div className={styles.readMore}>
                    Read More
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default FieldNotesPage;
