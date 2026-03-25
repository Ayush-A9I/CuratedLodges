"use client";

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './fieldnotes.module.css';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import api from '@/lib/api';

const FieldNotesPage = () => {
  const { t } = useTranslation();
  const [activeFilter, setActiveFilter] = useState<string>('__ALL__');
  const [fieldNotes, setFieldNotes] = useState<any[]>([]);
  const [parks, setParks] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.getFieldNotes()
      .then((data) => {
        setFieldNotes(data.fieldNotes || []);
        // Extract unique parks for filters
        const uniqueParks = Array.from(new Set((data.fieldNotes || []).map((n: any) => n.park))) as string[];
        setParks(uniqueParks);
      })
      .catch((err) => console.error('Failed to load field notes:', err))
      .finally(() => setIsLoading(false));
  }, []);

  // Get park filters
  const parkFilters = ['__ALL__', ...parks, '__OTHERS__'];
  
  // Map internal keys to display labels
  const getFilterLabel = (filter: string) => {
    if (filter === '__ALL__') return t('fieldNotesPage.all');
    if (filter === '__OTHERS__') return t('fieldNotesPage.others');
    return filter;
  };

  // Filter notes based on active filter
  const filteredNotes = activeFilter === '__ALL__' 
    ? fieldNotes 
    : fieldNotes.filter(note => note.park === activeFilter);

  // Format date
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
      });
    } catch { return dateStr; }
  };

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
          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
              <div style={{ width: '2rem', height: '2rem', border: '2px solid #1E2D27', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            </div>
          ) : (
            <div className={styles.articlesGrid}>
              {filteredNotes.map((note: any) => (
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
                      <span className={styles.date}>{formatDate(note.publishedDate || note.date)}</span>
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
          )}
        </div>
      </main>

      <Footer />
    </>
  );
};

export default FieldNotesPage;
