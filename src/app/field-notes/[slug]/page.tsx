"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import styles from './note.module.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import api from '@/lib/api';

const FieldNotePage = () => {
  const params = useParams();
  const slug = params.slug as string;
  const [note, setNote] = useState<any>(null);
  const [relatedNotes, setRelatedNotes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    if (!slug) return;
    api.getFieldNoteBySlug(slug)
      .then((data) => {
        setNote(data.fieldNote || data);
        setRelatedNotes(data.relatedNotes || []);
      })
      .catch((err) => console.error('Failed to load field note:', err))
      .finally(() => setIsLoading(false));
  }, [slug]);

  if (isLoading) {
    return (
      <>
        <Header forceVisible={true} forceScrolled={true} />
        <main className={styles.main}>
          <div className={styles.container} style={{ display: 'flex', justifyContent: 'center', padding: '8rem 0' }}>
            <div style={{ width: '2rem', height: '2rem', border: '2px solid #1E2D27', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!note) {
    return (
      <>
        <Header forceVisible={true} forceScrolled={true} />
        <main className={styles.main}>
          <div className={styles.container} style={{ textAlign: 'center', padding: '8rem 0' }}>
            <h1>Field Note Not Found</h1>
            <Link href="/field-notes" style={{ color: '#F1663F', marginTop: '1rem', display: 'inline-block' }}>
              ← Back to Field Notes
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
      });
    } catch { return dateStr; }
  };

  // Support both API format (content as array) and string content
  const contentParagraphs = Array.isArray(note.content) 
    ? note.content 
    : (note.body || note.content || '').split('\n\n').filter(Boolean);

  const heroVideoSrc = '/assests/videos/Outpost12.mp4';

  return (
    <>
      <Header forceVisible={true} forceScrolled={true} />
      
      <main className={styles.main}>
        <div className={styles.container}>
          {/* Breadcrumb */}
          <nav className={styles.breadcrumb}>
            <Link href="/field-notes" className={styles.breadcrumbLink}>
              Field Notes
            </Link>
            <span className={styles.breadcrumbSeparator}>/</span>
            <span className={styles.breadcrumbCurrent}>{note.title.toLowerCase()}</span>
          </nav>

          {/* Article Header */}
          <header className={styles.header}>
            <h1 className={styles.title}>{note.title.toLowerCase()}</h1>
            <div className={styles.meta}>
              <span className={styles.author}>By {note.author}</span>
              <span className={styles.dot}>•</span>
              <span className={styles.date}>
                {formatDate(note.publishedDate || note.date)}
              </span>
              <span className={styles.dot}>•</span>
              <span className={styles.readTime}>{note.readTime}</span>
            </div>
          </header>

          {/* Featured Media */}
          <div className={styles.featuredImage}>
            {videoError ? (
              <img 
                src={note.image} 
                alt={note.title}
                className={styles.image}
              />
            ) : (
              <video
                className={styles.image}
                controls
                playsInline
                preload="metadata"
                poster={note.image}
                onError={() => setVideoError(true)}
              >
                <source src={heroVideoSrc} type="video/mp4" />
              </video>
            )}
          </div>

          {/* Article Content */}
          <article className={styles.content}>
            {contentParagraphs.map((paragraph: string, index: number) => (
              <p key={index} className={styles.paragraph}>
                {paragraph}
              </p>
            ))}
          </article>

          {/* Share Section */}
          <div className={styles.shareSection}>
            <h3 className={styles.shareTitle}>Share this article</h3>
            <div className={styles.shareButtons}>
              <button 
                className={styles.shareButton}
                onClick={() => setIsShareModalOpen(true)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                  <polyline points="16 6 12 2 8 6" />
                  <line x1="12" y1="2" x2="12" y2="15" />
                </svg>
                Share
              </button>
            </div>
          </div>
        </div>

        {/* Related Notes Section */}
        {relatedNotes.length > 0 && (
          <section className={styles.relatedSection}>
            <div className={styles.container}>
              <h2 className={styles.relatedTitle}>Related Field Notes</h2>
              <div className={styles.relatedGrid}>
                {relatedNotes.map((relatedNote: any) => (
                  <Link 
                    key={relatedNote.id}
                    href={`/field-notes/${relatedNote.slug}`}
                    className={styles.relatedCard}
                  >
                    <div className={styles.relatedImageWrapper}>
                      <img 
                        src={relatedNote.image} 
                        alt={relatedNote.title}
                        className={styles.relatedImage}
                      />
                    </div>
                    <div className={styles.relatedContent}>
                      <span className={styles.relatedPark}>{relatedNote.park}</span>
                      <h3 className={styles.relatedCardTitle}>{relatedNote.title.toLowerCase()}</h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Share Modal */}
      {isShareModalOpen && (
        <div className={styles.shareModalOverlay} onClick={() => setIsShareModalOpen(false)}>
          <div className={styles.shareModalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.shareModalClose} onClick={() => setIsShareModalOpen(false)}>×</button>
            
            <div className={styles.sharePreview}>
              <img 
                src={note.image} 
                alt={note.title}
                className={styles.sharePreviewImage}
              />
              <h3 className={styles.sharePreviewTitle}>{note.title}</h3>
              <p className={styles.sharePreviewLocation}>{note.park}</p>
            </div>

            <div className={styles.shareActions}>
              <div 
                className={styles.shareActionItem}
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(window.location.href);
                    setLinkCopied(true);
                    setTimeout(() => setLinkCopied(false), 2000);
                  } catch (err) {
                    console.log('Error copying link:', err);
                  }
                }}
              >
                <div className={styles.shareActionIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                </div>
                <span className={styles.shareActionLabel}>{linkCopied ? 'Copied!' : 'Copy Link'}</span>
              </div>

              <div 
                className={styles.shareActionItem}
                onClick={() => {
                  const text = `Check out this field note: ${note.title}`;
                  const url = window.location.href;
                  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
                  window.open(whatsappUrl, '_blank');
                }}
              >
                <div className={`${styles.shareActionIcon} ${styles.whatsappIcon}`}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                </div>
                <span className={styles.shareActionLabel}>WhatsApp</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default FieldNotePage;
