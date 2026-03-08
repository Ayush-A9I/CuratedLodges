"use client";

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './fieldnotes.module.css';
import { fieldNotesData } from '@/data/mock/FieldNotesData';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const FieldNotesPage = () => {
  const { t } = useTranslation();
  const [activeFilter, setActiveFilter] = useState<string>('__ALL__');

  // Get unique parks for filters - use internal keys
  const parkFilters = ['__ALL__', ...Array.from(new Set(fieldNotesData.map(note => note.park))), '__OTHERS__'];
  
  // Map internal keys to display labels
  const getFilterLabel = (filter: string) => {
    if (filter === '__ALL__') return t('fieldNotesPage.all');
    if (filter === '__OTHERS__') return t('fieldNotesPage.others');
    return filter;
  };

  // Filter notes based on active filter
  const filteredNotes = activeFilter === '__ALL__' 
    ? fieldNotesData 
    : fieldNotesData.filter(note => note.park === activeFilter);

  return (
    <>
      <Header forceVisible={true} forceScrolled={true} />
      
      <main className={styles.main}>
        <div className={styles.container}>
          {/* Header Section */}
          <div className={styles.headerSection}>
            <p className={styles.eyebrow}>{t('sections.expeditionJournal')}</p>
            <h1 className={styles.title}>{t('sections.fieldNotes')}</h1>
            <p className={styles.subtitle}>
              {t('sections.fieldNotesDesc')}
            </p>
          </div>

          {/* Filter Buttons */}
          <div className={styles.filterSection}>
            <button className={styles.filterByButton}>
              {t('fieldNotesPage.filterByParks')}
            </button>
            {parkFilters.map((filter) => (
              <button
                key={filter}
                className={`${styles.filterButton} ${activeFilter === filter ? styles.filterButtonActive : ''}`}
                onClick={() => setActiveFilter(filter)}
              >
                {getFilterLabel(filter)}
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
                    {t('fieldNotesPage.readMore')}
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
