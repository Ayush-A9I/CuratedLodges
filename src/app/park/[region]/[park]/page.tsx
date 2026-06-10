"use client";

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import ParkPageHeader from '../../../../components/layout/ParkPageHeader';
import Footer from '../../../../components/layout/Footer';
import LodgeCard from '../../../../components/domain/LodgeCard';
import { StateBoundary } from '@/components/feedback';
import { useApiResource } from '@/hooks/useApiResource';
import api from '@/lib/api';
import type { ParkDetail, LodgeListItem } from '@/types/api';
import styles from './park.module.css';

interface LodgesByParkResponse {
  lodges: LodgeListItem[];
}

export default function ParkPage() {
  const { t } = useTranslation();
  const params = useParams();
  const regionSlug = decodeURIComponent((params.region as string) ?? '');
  const parkSlug = decodeURIComponent((params.park as string) ?? '');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Park content (Req 10.1, 10.2, 10.6, 10.7).
  const parkResource = useApiResource<ParkDetail>(
    () => api.getParkBySlug(parkSlug),
    { enabled: Boolean(parkSlug), deps: [parkSlug] },
  );

  // Lodge grid — fetched independently so a grid error never replaces the
  // park content (Req 10.3, 10.8).
  const lodgesResource = useApiResource<LodgesByParkResponse>(
    () => api.getLodgesByPark(parkSlug),
    { enabled: Boolean(parkSlug), deps: [parkSlug] },
  );

  const park = parkResource.data;
  const lodges = lodgesResource.data?.lodges ?? [];

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const displayName = park?.name ?? parkSlug;
  const features = park?.features ?? [];
  const faqs = park?.faqs ?? [];
  const hasBestTime = Boolean(park?.bestTime && park.bestTime.trim().length > 0);
  const hasFeatures = features.length > 0;
  const hasFaqs = faqs.length > 0;
  const hasAboutCard = hasBestTime || hasFeatures;

  // 404 from getParkBySlug → friendly "park not found" message (Req 10.7).
  const parkErrorPayload =
    parkResource.error && parkResource.error.status === 404
      ? t('park.notFound')
      : parkResource.error;

  return (
    <>
      <ParkPageHeader region={regionSlug} park={displayName} />

      <main className={styles.main}>
        <StateBoundary
          loading={parkResource.loading}
          error={parkErrorPayload}
          onRetry={parkResource.retry}
        >
          {park && (
            <>
              {/* Top breadcrumb */}
              <section className={styles.heroSection}>
                <div className={styles.heroContainer}>
                  <nav className={styles.breadcrumb}>
                    <Link href="/" className={styles.breadcrumbLink}>
                      {t('park.home')}
                    </Link>
                    <span className={styles.breadcrumbSeparator}>/</span>
                    <span className={styles.breadcrumbCurrent}>
                      {t('park.breadcrumbCurrent', { park: park.name })}
                    </span>
                  </nav>
                </div>
              </section>

              {/* Hero with park image, name, and description (Req 10.2) */}
              {park.heroImage && (
                <section className={styles.hero}>
                  <div className={styles.heroImage}>
                    <img src={park.heroImage} alt={park.name} />
                  </div>
                  <div className={styles.heroOverlay} />
                  <div className={styles.heroContent}>
                    <h1 className={styles.parkTitle}>{park.name}</h1>
                    {park.description && (
                      <p className={styles.parkDescription}>{park.description}</p>
                    )}
                  </div>
                </section>
              )}

              {/* About card: best time + features (Req 10.2, 10.4) */}
              {hasAboutCard && (
                <section className={styles.aboutSection}>
                  <div className={styles.aboutContainer}>
                    <div className={styles.aboutCard}>
                      {hasBestTime && (
                        <>
                          <h2 className={styles.aboutCardTitle}>
                            {t('park.bestTime')}
                          </h2>
                          <p className={styles.aboutCardText}>{park.bestTime}</p>
                        </>
                      )}
                      {hasFeatures && (
                        <>
                          <h2 className={styles.aboutCardTitle}>
                            {t('park.features')}
                          </h2>
                          <div className={styles.featuresGrid}>
                            {features.map((feature, idx) => (
                              <div
                                key={`${feature.name}-${idx}`}
                                className={styles.featureItem}
                              >
                                <span className={styles.featureIcon}>
                                  {feature.icon}
                                </span>
                                <span className={styles.featureName}>
                                  {feature.name}
                                </span>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </section>
              )}

              {/* Lodge grid — its own boundary so the park content survives a
                  grid error (Req 10.3, 10.5, 10.8) */}
              <section className={styles.lodgesSection}>
                <div className={styles.lodgesContainer}>
                  <div className={styles.filterWrapper}>
                    <div className={styles.filterDropdown}>
                      <select className={styles.gateFilter} disabled>
                        <option value="">Filter by : All Gates</option>
                      </select>
                    </div>
                  </div>

                  <StateBoundary
                    loading={lodgesResource.loading}
                    error={lodgesResource.error}
                    empty={lodges.length === 0}
                    emptyMessageKey="park.lodgesEmpty"
                    onRetry={lodgesResource.retry}
                  >
                    <div className={styles.lodgeGrid}>
                      {lodges.map((lodge) => {
                        const minPrice =
                          lodge.minRoomPrice ?? lodge.pricePerNight ?? 0;
                        const lodgeUrl = `/park/${regionSlug}/${parkSlug}/${lodge.slug}`;

                        return (
                          <div
                            key={lodge.id}
                            className={styles.lodgeCardWrapper}
                          >
                            {/* LodgeCard formats `price` through convertPrice
                                (LocalizationContext) — Req 10.5 */}
                            <LodgeCard
                              image={lodge.thumbnail}
                              images={lodge.images || [lodge.thumbnail]}
                              title={lodge.name}
                              location={lodge.location}
                              rating={lodge.rating}
                              price={minPrice}
                              link={lodgeUrl}
                              amenities={lodge.amenities}
                              ecoCertified={lodge.ecoCertified}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </StateBoundary>
                </div>
              </section>

              {/* Editorial Field Intel section (static UI, dynamic park name) */}
              <section className={styles.planningSection}>
                <div className={styles.planningContainer}>
                  <h2 className={styles.planningTitle}>
                    Planning to stay at {park.name}?
                  </h2>
                  <p className={styles.planningSubtitle}>
                    Read our field intelligence before you land. Expert tracking
                    tips, gear recommendations, and the secret history of{' '}
                    {park.name}.
                  </p>

                  <div className={styles.planningGrid}>
                    <div className={styles.planningCard}>
                      <div className={styles.planningImageWrapper}>
                        <img
                          src="https://images.unsplash.com/photo-1549366021-9f761d450615?w=800"
                          alt="Wildlife tracking"
                          className={styles.planningImage}
                        />
                      </div>
                      <div className={styles.planningContent}>
                        <span className={styles.planningBadge}>Field Intel</span>
                        <h3 className={styles.planningCardTitle}>
                          Mastering the morning track in {park.name}
                        </h3>
                        <p className={styles.planningCardText}>
                          Why the Mukki grasslands hold the key to the
                          tiger&apos;s morning patrol...
                        </p>
                        <a href="#" className={styles.planningLink}>
                          Know More
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M5 12h14M12 5l7 7-7 7" />
                          </svg>
                        </a>
                      </div>
                    </div>

                    <div className={styles.planningCard}>
                      <div className={styles.planningImageWrapper}>
                        <img
                          src="https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800"
                          alt="Safari experience"
                          className={styles.planningImage}
                        />
                      </div>
                      <div className={styles.planningContent}>
                        <span className={styles.planningBadge}>Field Intel</span>
                        <h3 className={styles.planningCardTitle}>
                          Safari prep: what guides won&apos;t tell you
                        </h3>
                        <p className={styles.planningCardText}>
                          Essential gear, timing strategies, and etiquette for
                          maximizing your wildlife encounters...
                        </p>
                        <a href="#" className={styles.planningLink}>
                          Know More
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M5 12h14M12 5l7 7-7 7" />
                          </svg>
                        </a>
                      </div>
                    </div>

                    <div className={styles.planningCard}>
                      <div className={styles.planningImageWrapper}>
                        <img
                          src="https://images.unsplash.com/photo-1615963244664-5b845b2025ee?w=800"
                          alt="Tiger in the wild"
                          className={styles.planningImage}
                        />
                      </div>
                      <div className={styles.planningContent}>
                        <span className={styles.planningBadge}>Field Intel</span>
                        <h3 className={styles.planningCardTitle}>
                          Understanding tiger territories
                        </h3>
                        <p className={styles.planningCardText}>
                          A naturalist&apos;s guide to reading signs, tracking
                          patterns, and predicting movement...
                        </p>
                        <a href="#" className={styles.planningLink}>
                          Know More
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M5 12h14M12 5l7 7-7 7" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Explore Jungles CTA */}
                  <div className={styles.exploreJunglesCTA}>
                    <div className={styles.exploreJunglesContent}>
                      <div className={styles.exploreJunglesLeft}>
                        <div className={styles.exploreJunglesImageWrapper}>
                          <img
                            src="https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=800&q=80"
                            alt="Wildlife Research"
                            className={styles.exploreJunglesImage}
                          />
                        </div>
                      </div>
                      <div className={styles.exploreJunglesRight}>
                        <div className={styles.exploreJunglesTextWrapper}>
                          <span className={styles.exploreJunglesLabel}>
                            Wildlife Knowledge Hub
                          </span>
                          <h3 className={styles.exploreJunglesTitle}>
                            Dive Deeper Into Wildlife Exploration
                          </h3>
                          <p className={styles.exploreJunglesDescription}>
                            Access expert insights, conservation research, and
                            comprehensive guides on wildlife behavior and natural
                            habitats
                          </p>
                          <a
                            href="https://explorejungles.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.exploreJunglesButton}
                          >
                            <span>Explore Jungles</span>
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* FAQs (Req 10.2, 10.4) */}
              {hasFaqs && (
                <section className={styles.faqSection}>
                  <div className={styles.faqContainer}>
                    <h2 className={styles.faqTitle}>{t('park.faqs')}</h2>
                    <p className={styles.faqSubtitle}>
                      {t('park.faqsSubtitle', { park: park.name })}
                    </p>

                    <div className={styles.faqList}>
                      {faqs.map((faq, index) => (
                        <div
                          key={`${faq.question}-${index}`}
                          className={styles.faqItem}
                        >
                          <div
                            className={styles.faqQuestion}
                            onClick={() => toggleFaq(index)}
                          >
                            <h3>{faq.question}</h3>
                            <span
                              className={`${styles.faqIcon} ${openFaqIndex === index ? styles.open : ''}`}
                            >
                              +
                            </span>
                          </div>
                          {openFaqIndex === index && (
                            <div className={styles.faqAnswer}>
                              <p>{faq.answer}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              )}
            </>
          )}
        </StateBoundary>
      </main>

      <Footer />
    </>
  );
}
