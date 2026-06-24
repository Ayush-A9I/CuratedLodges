"use client";

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import Header from '../../../../../components/layout/Header';
import Footer from '../../../../../components/layout/Footer';
import ReadMoreModal from '../../../../../components/ui/ReadMoreModal';
import { MapPin, Compass, Leaf, Users, Bed, Wind, Waves, Check, Coffee, Shield, ArrowRight, Tent, Volume2 } from 'lucide-react';
import styles from './lodge.module.css';
import api from '../../../../../lib/api';
import type { LodgeDetail } from '@/types/api';
import { resolveImageUrl } from '@/lib/fallbackImages';
import {
    LODGE_CONSERVATION_CARD_MAX,
    LODGE_HERO_QUOTE_MAX,
    LODGE_TEASER_MAX,
    exceedsDisplayLimit,
    truncateForDisplay,
} from '@/lib/lodgeDisplayLimits';
import { resolveSectionTitle } from '@/lib/lodgeSectionTitles';
import {
  readSectionImages,
  resolveOriginStoryGrid,
  resolveSectionHeroSrc,
} from '@/lib/lodgeSectionImages';
import { formatMoney } from '@/lib/money';
import SectionTitleHeading from '@/components/domain/SectionTitleHeading';

type MediaItem = {
  src: string;
  alt: string;
};

// ─── Helper: map API response to page data shape ──────────────
function mapApiToProfile(data: any) {
  // jungloreStory.highlights carries the lodge's flexible content. Different
  // hotels submit content differently, so this can be EITHER:
  //  - a keyed content object ({ natureBlend, naturalistPhilosophy, afterSafariVibe,
  //    conservation, usps, originStory, contact, paymentInfo, cancellationPolicy, ... }), or
  //  - the legacy contract array of { icon, text } highlights.
  // Read whatever shape is present and render only the sections that exist.
  const rawHighlights = data.jungloreStory?.highlights;
  const content: any =
    rawHighlights && typeof rawHighlights === 'object' && !Array.isArray(rawHighlights)
      ? rawHighlights
      : {};
  const highlights: { icon: string; text: string }[] = Array.isArray(rawHighlights)
    ? rawHighlights
    : [];

  return {
    name: data.name || '',
    category: data.category || 'Wildlife Lodge',
    location: data.location || '',
    roomTypes: (data.roomTypes || []).map((rt: any) => ({
      id: rt.id,
      name: rt.name,
      description: rt.description,
      price: rt.price,
      image: rt.image,
      amenities: rt.amenities || [],
      maxOccupancy: rt.maxOccupancy,
      totalUnits: rt.totalUnits ?? 1,
    })),
    totalUnits: (data.roomTypes || []).reduce(
      (sum: number, rt: any) => sum + (rt.totalUnits ?? 0),
      0
    ),
    mealPlans: data.mealPlans || [],
    // Prefer the structured content object, falling back to the dedicated
    // about/reasons fields and the legacy highlights array.
    originStory: content.originStory || data.about?.description || [],
    natureBlend: content.natureBlend || [],
    naturalistPhilosophy: content.naturalistPhilosophy || [],
    afterSafariVibe: content.afterSafariVibe || [],
    sectionTitles:
      content.sectionTitles &&
      typeof content.sectionTitles === 'object' &&
      !Array.isArray(content.sectionTitles)
        ? content.sectionTitles
        : {},
    sectionImages: readSectionImages(content.sectionImages),
    // Conservation may be an object ({ intro, wildlifeEcosystem, indigenousCommunities })
    // or a flat array; the render layer handles both.
    conservation: content.conservation || [],
    uniquePoints: data.jungloreStory?.reasons || [],
    // USPs come either as structured { title, text } objects from the content
    // object, or are derived from the legacy { icon, text } highlights array.
    usps:
      Array.isArray(content.usps) && content.usps.length > 0
        ? content.usps
        : highlights.map((h) => ({ icon: h.icon, title: h.text, desc: '' })),
    // Extra flexible content (rendered where the page has sections for them).
    contact: content.contact || null,
    paymentInfo: content.paymentInfo || null,
    cancellationPolicy: content.cancellationPolicy || null,
    parkName: data.park?.name || '',
    parkSlug: data.park?.slug || '',
    regionSlug: data.park?.region?.slug || '',
    ecoCertified: data.ecoCertified || false,
    bestSeason: data.bestSeason || null,
    rating: data.rating || 0,
    externalLink: data.externalLink || '',
  };
}

function mapApiImages(data: any): MediaItem[] {
  const thumb = resolveImageUrl(data.thumbnail, 'lodge');
  if (!data.images || data.images.length === 0) {
    return [{ src: thumb, alt: data.name || '' }];
  }
  return data.images.map((img: any) => ({
    src: resolveImageUrl(img.url, 'lodgeGallery'),
    alt: img.altText || data.name || '',
  }));
}

export default function LodgeDetailPage() {
  const params = useParams();
  const lodgeSlug = params?.lodge as string;

  const [lodge, setLodge] = useState<LodgeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [visibleSections, setVisibleSections] = useState<Record<string, boolean>>({});
  const [isHeroMuted, setIsHeroMuted] = useState(false);
  const [showSoundPrompt, setShowSoundPrompt] = useState(false);
  const heroVideoRef = useRef<HTMLVideoElement | null>(null);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [expandedUsps, setExpandedUsps] = useState<Record<number, boolean>>({});

  // ─── Fetch lodge data ───────────────────────────────────────
  useEffect(() => {
    if (!lodgeSlug) return;

    setLoading(true);
    api.getLodgeBySlug(lodgeSlug)
      .then((data: any) => {
        setLodge(data);
        setError(null);
      })
      .catch((err: any) => {
        console.error('Failed to fetch lodge:', err);
        setError('Lodge not found');
      })
      .finally(() => setLoading(false));
  }, [lodgeSlug]);

  // ─── Scroll reveal observer ────────────────────────────────
  useEffect(() => {
    if (loading || !lodge) return;

    // Small delay to allow DOM to render
    const timer = setTimeout(() => {
      const targets = Array.from(document.querySelectorAll('[data-reveal-id]'));
      if (!targets.length) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const id = (entry.target as HTMLElement).dataset.revealId;
            if (!id) return;
            setVisibleSections((prev) => ({ ...prev, [id]: true }));
            observer.unobserve(entry.target);
          });
        },
        { threshold: 0.2, rootMargin: '0px 0px -8% 0px' }
      );

      targets.forEach((node) => observer.observe(node));
      return () => observer.disconnect();
    }, 100);

    return () => clearTimeout(timer);
  }, [loading, lodge]);

  // ─── Hero video logic ──────────────────────────────────────
  useEffect(() => {
    const video = heroVideoRef.current;
    if (!video) return;

    const startHeroVideo = async () => {
      try {
        video.muted = false;
        video.volume = 1;
        await video.play();
        setIsHeroMuted(false);
        setShowSoundPrompt(false);
      } catch {
        video.muted = true;
        setIsHeroMuted(true);
        setShowSoundPrompt(true);
        try {
          await video.play();
        } catch (err) {
          console.error('Unable to start hero video playback:', err);
        }
      }
    };

    startHeroVideo();
  }, [lodge]);

  const enableHeroAudio = useCallback(async () => {
    const video = heroVideoRef.current;
    if (!video) return;

    video.muted = false;
    video.volume = 1;
    setIsHeroMuted(false);
    setShowSoundPrompt(false);

    try {
      await video.play();
    } catch (err) {
      console.error('Unable to start hero video with audio after interaction:', err);
    }
  }, []);

  useEffect(() => {
    const opts: AddEventListenerOptions = { once: true, passive: true };
    window.addEventListener('pointerdown', enableHeroAudio, opts);
    window.addEventListener('touchstart', enableHeroAudio, opts);
    window.addEventListener('wheel', enableHeroAudio, opts);
    window.addEventListener('keydown', enableHeroAudio, opts);

    return () => {
      window.removeEventListener('pointerdown', enableHeroAudio);
      window.removeEventListener('touchstart', enableHeroAudio);
      window.removeEventListener('wheel', enableHeroAudio);
      window.removeEventListener('keydown', enableHeroAudio);
    };
  }, [enableHeroAudio]);

  const revealClass = (id: string, extra = '') =>
    `${styles.scrollReveal} ${visibleSections[id] ? styles.inView : ''} ${extra}`.trim();

  const getUspIcon = (icon: string) => {
    if (icon === 'leaf') return Leaf;
    if (icon === 'users') return Users;
    return Compass;
  };

  // ─── Loading state ─────────────────────────────────────────
  if (loading) {
    return (
      <>
        <Header darkMode={false} whiteTextAlways={true} />
        <main className={styles.main}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#1E2D27' }}>
            <div style={{ textAlign: 'center', color: '#FFFFFF' }}>
              <div style={{ width: 40, height: 40, border: '3px solid #F1663F', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
              <p style={{ fontFamily: 'serif', fontSize: '1.2rem', opacity: 0.8 }}>Loading lodge...</p>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error || !lodge) {
    return (
      <>
        <Header darkMode={false} whiteTextAlways={true} />
        <main className={styles.main}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#1E2D27' }}>
            <div style={{ textAlign: 'center', color: '#FFFFFF' }}>
              <h1 style={{ fontFamily: 'serif', fontSize: '2rem', marginBottom: 16 }}>Lodge Not Found</h1>
              <p style={{ opacity: 0.7 }}>The lodge you&apos;re looking for doesn&apos;t exist.</p>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // ─── Map API data ──────────────────────────────────────────
  const lodgeProfile = mapApiToProfile(lodge);
  const allImages = mapApiImages(lodge);
  const lodgeThumbnail = resolveImageUrl(lodge.thumbnail, 'lodge');
  const sectionImages = lodgeProfile.sectionImages;
  const customSectionTitles = lodgeProfile.sectionTitles as Record<string, string>;
  const originSectionTitle = resolveSectionTitle('originStory', customSectionTitles);
  const philosophySectionTitle = resolveSectionTitle('naturalistPhilosophy', customSectionTitles);
  const afterSafariSectionTitle = resolveSectionTitle('afterSafariVibe', customSectionTitles);

  const originGridImages = resolveOriginStoryGrid(
    sectionImages,
    lodge.thumbnail || '',
    allImages,
    lodge.name || ''
  );
  const natureBlendImageSrc = resolveSectionHeroSrc(
    'natureBlend',
    sectionImages,
    lodge.thumbnail || ''
  );
  const philosophyImageSrc = resolveSectionHeroSrc(
    'naturalistPhilosophy',
    sectionImages,
    lodge.thumbnail || ''
  );
  const afterSafariImageSrc = resolveSectionHeroSrc(
    'afterSafariVibe',
    sectionImages,
    lodge.thumbnail || ''
  );

  // Gallery images for expedition carousel and other blocks below.
  const propertyImages: MediaItem[] = originGridImages;

  const heroVideo = {
    src: '/assests/videos/Outpost12.mp4',
    poster: lodgeThumbnail || propertyImages[0]?.src,
  };

  const expeditionImages: MediaItem[] = [...allImages];

  // ─── Conservation data — handle both object and array formats ──
  let conservationItems: string[] = [];
  if (Array.isArray(lodgeProfile.conservation)) {
    conservationItems = lodgeProfile.conservation;
  } else if (typeof lodgeProfile.conservation === 'object') {
    const c = lodgeProfile.conservation as any;
    conservationItems = [
      ...(c.intro || []),
      ...(c.wildlifeEcosystem || []),
      ...(c.indigenousCommunities || []),
    ];
  }

  // ─── USPs — handle both object and string formats ──────────
  const uspItems: { icon: string; title: string; desc: string }[] = [];
  if (Array.isArray(lodgeProfile.usps)) {
    lodgeProfile.usps.forEach((usp: any) => {
      if (typeof usp === 'string') {
        uspItems.push({ icon: 'compass', title: usp, desc: '' });
      } else if (typeof usp === 'object') {
        uspItems.push({
          icon: usp.icon || 'compass',
          title: usp.title || '',
          desc: usp.desc || usp.text || '',
        });
      }
    });
  }
  // Fill to at least 3 for the layout
  while (uspItems.length < 3) {
    const reason = lodgeProfile.uniquePoints[uspItems.length];
    uspItems.push({ icon: 'compass', title: reason || '', desc: '' });
  }

  return (
    <>
      <Header darkMode={false} whiteTextAlways={true} />

      <main className={styles.main}>
        <section className={styles.hero}>
          <video
            ref={heroVideoRef}
            className={styles.heroVideo}
            autoPlay
            muted={isHeroMuted}
            loop
            playsInline
            preload="metadata"
            poster={heroVideo.poster}
          >
            <source src={heroVideo.src} type="video/mp4" />
          </video>
          <div className={styles.heroOverlay} />
          <div className={styles.heroGlow} />

          {showSoundPrompt && (
            <button
              type="button"
              className={styles.heroSoundGate}
              onClick={enableHeroAudio}
              aria-label="Tap anywhere to enable sound"
            >
              <span className={styles.heroSoundGateChip}>
                <Volume2 size={18} /> Tap anywhere for sound
              </span>
            </button>
          )}

          <div className={styles.heroInner}>
            <div className={`${styles.heroBadge} ${styles.revealUp}`}>
              <MapPin size={14} /> {lodgeProfile.parkName}
            </div>
            <h1 className={`${styles.heroTitle} ${styles.revealUp} ${styles.stagger1}`}>{lodgeProfile.name}</h1>
            <p className={`${styles.heroSubtitle} ${styles.revealUp} ${styles.stagger2}`}>
              {lodgeProfile.originStory[0]?.substring(0, 150)}...{' '}
              <button
                onClick={() => setActiveModal('origin')}
                className="text-[#F1663F] font-semibold hover:underline"
              >
                Read more
              </button>
            </p>

          </div>
        </section>

        <section className="relative z-30 max-w-[1400px] mx-auto px-6 -mt-8 md:-mt-12">
          <div className="bg-[#FFFFFF] shadow-2xl flex flex-col md:flex-row items-stretch justify-between p-8 md:p-12 border-t-4 border-[#F1663F]">
            {uspItems.slice(0, 3).map((usp, i) => {
              const Icon = getUspIcon(usp.icon);
              const isLong = usp.desc && usp.desc.length > 120;
              const isExpanded = expandedUsps[i];
              const displayText = isLong && !isExpanded ? usp.desc.substring(0, 120) + '...' : usp.desc;
              return (
                <div
                  key={i}
                  className={`flex items-start space-x-6 w-full md:w-1/3 ${i < 2 ? 'mb-8 md:mb-0' : ''} ${i === 0 ? 'md:pr-8 md:border-r border-[#1E2D27]/10' : i === 1 ? 'md:px-8 md:border-r border-[#1E2D27]/10' : 'md:pl-8'} group`}
                >
                  <div className="bg-[#1E2D27]/5 p-4 rounded-full text-[#F1663F] group-hover:bg-[#F1663F] group-hover:text-[#FFFFFF] transition-colors flex-shrink-0">
                    <Icon size={24} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl mb-2 text-[#1E2D27]">{usp.title}</h3>
                    <p className="text-[#1E2D27]/70 text-sm leading-relaxed">
                      {displayText}
                      {isLong && (
                        <button
                          onClick={() => setExpandedUsps(prev => ({ ...prev, [i]: !prev[i] }))}
                          className="ml-1 text-[#F1663F] font-semibold hover:underline focus:outline-none"
                        >
                          {isExpanded ? 'Show less' : 'Read more'}
                        </button>
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ─── Origin Story ─────────────────────────────────── */}
        <section className="py-24 md:py-32 px-6 max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <div className={revealClass('origin-copy')} data-reveal-id="origin-copy">
              <span className="text-[#F1663F] uppercase tracking-[0.2em] text-sm font-semibold mb-6 block">The Origin Story</span>
              <SectionTitleHeading
                display={originSectionTitle}
                className="text-4xl md:text-5xl lg:text-6xl font-serif text-[#1E2D27] leading-tight mb-8"
              />
              <div className="space-y-6 text-[#1E2D27]/70 text-lg leading-relaxed">
                <p>{lodgeProfile.originStory[0]?.length > 350 ? lodgeProfile.originStory[0].substring(0, 350) + '...' : lodgeProfile.originStory[0]}</p>
              </div>
              {lodgeProfile.originStory.length > 1 && (
                <button
                  onClick={() => setActiveModal('origin')}
                  className="mt-8 inline-flex items-center gap-2 text-[#F1663F] font-semibold text-sm uppercase tracking-widest hover:gap-4 transition-all duration-300"
                >
                  Read the full story <ArrowRight size={16} />
                </button>
              )}
            </div>

            <div className={`grid grid-cols-2 gap-4 relative ${revealClass('origin-media', styles.revealFromRight)}`} data-reveal-id="origin-media">
              <div className="space-y-4 mt-12">
                <img src={propertyImages[0].src} alt={propertyImages[0].alt} className="w-full h-[250px] md:h-[350px] object-cover rounded-sm" />
                <img src={propertyImages[2].src} alt={propertyImages[2].alt} className="w-full h-[200px] md:h-[250px] object-cover rounded-sm" />
              </div>
              <div className="space-y-4">
                <img src={propertyImages[1].src} alt={propertyImages[1].alt} className="w-full h-[300px] md:h-[400px] object-cover rounded-sm" />
                <img src={propertyImages[3].src} alt={propertyImages[3].alt} className="w-full h-[150px] md:h-[200px] object-cover rounded-sm" />
              </div>
            </div>
          </div>
        </section>

        {/* ─── Nature Blend ─────────────────────────────────── */}
        <section className="bg-[#1E2D27] py-20 md:py-28">
          <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-stretch">
            <div className={`lg:col-span-6 relative group overflow-hidden ${revealClass('arch-media', styles.revealFromLeft)}`} data-reveal-id="arch-media">
              <img src={natureBlendImageSrc} alt={lodge.name || 'Lodge'} className="w-full h-full min-h-[500px] object-cover rounded-sm transition-transform duration-1000 group-hover:scale-105 opacity-90" />
            </div>

            <div className={`lg:col-span-6 lg:pl-16 lg:h-full lg:flex lg:flex-col lg:justify-center ${revealClass('arch-copy')}`} data-reveal-id="arch-copy">
              <span className="text-[#CCDD99] uppercase tracking-[0.2em] text-sm font-semibold mb-6 block">Blurring the Lines</span>
              <h2 className="text-3xl md:text-5xl font-serif text-[#FFFFFF] leading-tight mb-8">
                &ldquo;{truncateForDisplay(lodgeProfile.natureBlend[0], LODGE_HERO_QUOTE_MAX) || 'Where architecture meets wilderness.'}&rdquo;
              </h2>
              <div className="space-y-6 text-[#FFFFFF]/80 text-lg font-light leading-relaxed">
                <p>{truncateForDisplay(lodgeProfile.natureBlend[1], LODGE_TEASER_MAX)}</p>
              </div>
              {(lodgeProfile.natureBlend.length > 1 ||
                exceedsDisplayLimit(lodgeProfile.natureBlend[0], LODGE_HERO_QUOTE_MAX)) && (
                <button
                  onClick={() => setActiveModal('nature')}
                  className="mt-8 inline-flex items-center gap-2 text-[#CCDD99] font-semibold text-sm uppercase tracking-widest hover:gap-4 transition-all duration-300"
                >
                  Read more <ArrowRight size={16} />
                </button>
              )}
            </div>
          </div>
        </section>

        {/* ─── Naturalist Philosophy ────────────────────────── */}
        <section className="bg-[#1E2D27] text-[#FFFFFF] py-24 md:py-32 border-t border-[#FFFFFF]/10">
          <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-stretch">
            <div className={`lg:col-span-6 relative group overflow-hidden lg:h-full ${revealClass('philosophy-media', styles.revealFromTop)}`} data-reveal-id="philosophy-media">
              <img src={philosophyImageSrc} alt={lodge.name || 'Safari'} className="w-full h-full min-h-[500px] object-cover rounded-sm transition-transform duration-1000 group-hover:scale-105 opacity-90" />
            </div>

            <div className={`lg:col-span-6 lg:pl-16 lg:h-full lg:flex lg:flex-col lg:justify-center ${revealClass('philosophy-copy')}`} data-reveal-id="philosophy-copy">
              <span className="text-[#FFE8A1] uppercase tracking-[0.2em] text-sm font-semibold mb-4 block">The Philosophy</span>
              <SectionTitleHeading
                display={philosophySectionTitle}
                className="text-4xl md:text-5xl font-serif leading-tight mb-8"
              />
              <div className="space-y-6 text-[#FFFFFF]/70 text-lg font-light leading-relaxed mb-10">
                {lodgeProfile.naturalistPhilosophy.length > 0 ? (
                  <>
                    <p className="font-serif italic text-xl text-[#FFFFFF]/90 pb-4">
                      &ldquo;{truncateForDisplay(lodgeProfile.naturalistPhilosophy[0], LODGE_HERO_QUOTE_MAX)}&rdquo;
                    </p>
                  </>
                ) : (
                  <p>Our naturalist team brings deep field knowledge with ethical, guest-focused wildlife experiences.</p>
                )}
                {lodgeProfile.naturalistPhilosophy.length > 1 ||
                exceedsDisplayLimit(lodgeProfile.naturalistPhilosophy[0], LODGE_HERO_QUOTE_MAX) ? (
                  <button
                    onClick={() => setActiveModal('philosophy')}
                    className="inline-flex items-center gap-2 text-[#FFE8A1] font-semibold text-sm uppercase tracking-widest hover:gap-4 transition-all duration-300"
                  >
                    Read our philosophy <ArrowRight size={16} />
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        {/* ─── Conservation & Community ─────────────────────── */}
        <section className="bg-[#FFFFFF] py-24 px-6">
          <div className="max-w-[1400px] mx-auto">
            <div className={`text-center mb-16 ${revealClass('conservation-head')}`} data-reveal-id="conservation-head">
              <Leaf className="mx-auto text-[#1E2D27] mb-4" size={32} strokeWidth={1.5} />
              <h2 className="text-3xl md:text-4xl font-serif text-[#1E2D27] mb-4">Conservation &amp; Community</h2>
              <p className="text-[#1E2D27]/70 max-w-2xl mx-auto">
                {conservationItems[0] || 'Our commitment to conservation and community is built into how we operate.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {conservationItems.slice(0, 3).map((item: string, i: number) => {
                const icons = [Shield, Users, Coffee];
                const titles = ['The Ecological Footprint', 'Community Empowerment', 'The Simple Truth'];
                const Icon = icons[i] || Shield;
                return (
                  <div key={i} className={`bg-[#FFFFFF] p-10 md:p-12 hover:-translate-y-2 transition-transform duration-300 border-t-4 border-[#F1663F] shadow-[0_4px_40px_rgba(30,45,39,0.06)] ${revealClass(`cons-${i + 1}`)}`} data-reveal-id={`cons-${i + 1}`}>
                    <Icon className="text-[#F1663F] mb-6" size={32} strokeWidth={1.5} />
                    <h3 className="font-serif text-xl mb-4 text-[#1E2D27]">{titles[i] || 'Our Commitment'}</h3>
                    <p className="text-[#1E2D27]/70 text-sm leading-relaxed">
                      {truncateForDisplay(item, LODGE_CONSERVATION_CARD_MAX)}
                    </p>
                  </div>
                );
              })}
            </div>
            {conservationItems.length > 3 && (
              <div className="text-center mt-12">
                <button
                  onClick={() => setActiveModal('conservation')}
                  className="inline-flex items-center gap-2 text-[#F1663F] font-semibold text-sm uppercase tracking-widest hover:gap-4 transition-all duration-300"
                >
                  Read our conservation story <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ─── After-Safari Vibe ────────────────────────────── */}
        <section className="py-24 md:py-32 px-6 max-w-[1400px] mx-auto space-y-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
            <div className={revealClass('evenings-copy')} data-reveal-id="evenings-copy">
              <span className="text-[#F1663F] uppercase tracking-[0.2em] text-sm font-semibold mb-4 block">The Evenings</span>
              <SectionTitleHeading
                display={afterSafariSectionTitle}
                className="text-4xl md:text-5xl font-serif text-[#1E2D27] mb-6"
              />
              <div className="space-y-6 text-[#1E2D27]/70 text-lg leading-relaxed mb-8">
                <p>{lodgeProfile.afterSafariVibe[0]}</p>
                {lodgeProfile.afterSafariVibe.length > 1 && (
                  <p>{lodgeProfile.afterSafariVibe[1]?.length > 250 ? lodgeProfile.afterSafariVibe[1].substring(0, 250) + '...' : lodgeProfile.afterSafariVibe[1]}</p>
                )}
              </div>
              {lodgeProfile.afterSafariVibe.length > 2 && (
                <button
                  onClick={() => setActiveModal('evening')}
                  className="inline-flex items-center gap-2 text-[#F1663F] font-semibold text-sm uppercase tracking-widest hover:gap-4 transition-all duration-300"
                >
                  Read the full evening experience <ArrowRight size={16} />
                </button>
              )}
            </div>
            <div className={`relative group overflow-hidden rounded-sm shadow-xl ${revealClass('evenings-media', styles.revealFromRight)}`} data-reveal-id="evenings-media">
              <img src={afterSafariImageSrc} alt={lodge.name || 'Evening at the lodge'} className="w-full h-[600px] object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
          </div>

          {/* ─── Accommodation (one block per room type) ───── */}
          {lodgeProfile.roomTypes.map((room: any, index: number) => {
            const imageOnLeft = index % 2 === 0;
            const unitsLabel =
              room.totalUnits === 1 ? '1 Unit' : `${room.totalUnits} Units`;
            const amenitiesLabel =
              Array.isArray(room.amenities) && room.amenities.length > 0
                ? room.amenities.join(', ')
                : '—';

            return (
              <div
                key={room.id || `${room.name}-${index}`}
                className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center"
              >
                <div
                  className={`relative group overflow-hidden rounded-sm shadow-xl ${imageOnLeft ? 'order-2 lg:order-1' : 'order-2 lg:order-2'} ${revealClass(`acc-media-${index}`, imageOnLeft ? styles.revealFromLeft : styles.revealFromRight)}`}
                  data-reveal-id={`acc-media-${index}`}
                >
                  <img
                    src={resolveImageUrl(room.image, 'room')}
                    alt={room.name}
                    className="w-full h-[600px] object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div
                  className={`${imageOnLeft ? 'order-1 lg:order-2' : 'order-1 lg:order-1'} ${revealClass(`acc-copy-${index}`)}`}
                  data-reveal-id={`acc-copy-${index}`}
                >
                  {index === 0 && (
                    <span className="text-[#F1663F] uppercase tracking-[0.2em] text-sm font-semibold mb-4 block">
                      Accommodation
                    </span>
                  )}
                  <h2 className="text-4xl md:text-5xl font-serif text-[#1E2D27] mb-6">{room.name}</h2>
                  <div className="inline-flex items-center space-x-2 bg-[#CCDD99] px-4 py-1.5 rounded-full mb-8">
                    <Tent size={14} className="text-[#1E2D27]" />
                    <span className="text-xs uppercase tracking-widest font-bold text-[#1E2D27]">
                      {unitsLabel}
                    </span>
                  </div>
                  <p className="text-[#1E2D27]/70 text-lg leading-relaxed mb-10">
                    {room.description || 'Thoughtfully designed rooms connecting you to the wilderness.'}
                  </p>

                  <div className="grid grid-cols-2 gap-x-8 gap-y-6 border-t border-b border-[#1E2D27]/10 py-8">
                    <div className="flex flex-col space-y-1">
                      <span className="text-xs uppercase tracking-widest text-[#1E2D27]/50">From</span>
                      <span className="font-medium text-[#1E2D27]">
                        {formatMoney(room.price ?? 0, 'INR')}/night
                      </span>
                    </div>
                    <div className="flex flex-col space-y-1">
                      <span className="text-xs uppercase tracking-widest text-[#1E2D27]/50">Max Occupancy</span>
                      <span className="font-medium text-[#1E2D27]">
                        {room.maxOccupancy || 'N/A'} guests
                      </span>
                    </div>
                    {index === 0 && (
                      <>
                        <div className="flex flex-col space-y-1">
                          <span className="text-xs uppercase tracking-widest text-[#1E2D27]/50">Category</span>
                          <span className="font-medium text-[#1E2D27]">{lodgeProfile.category}</span>
                        </div>
                        <div className="flex flex-col space-y-1">
                          <span className="text-xs uppercase tracking-widest text-[#1E2D27]/50">Dining</span>
                          <span className="font-medium text-[#1E2D27]">
                            {lodgeProfile.mealPlans[0] || 'Available'}
                          </span>
                        </div>
                      </>
                    )}
                    <div className="col-span-2 flex flex-col space-y-1">
                      <span className="text-xs uppercase tracking-widest text-[#1E2D27]/50">Amenities</span>
                      <span className="font-medium text-[#1E2D27]">{amenitiesLabel}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {/* ─── Immerse Divider ──────────────────────────────── */}
        <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[#1E2D27]/50 z-10" />
          <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
            <source src="/assests/videos/Outpost12.mp4" type="video/mp4" />
          </video>
          <div className={`relative z-20 text-center px-6 ${revealClass('divider-copy')}`} data-reveal-id="divider-copy">
            <h2 className="text-4xl md:text-6xl font-serif text-white mb-6 drop-shadow-lg">Immerse in the Wild</h2>
          </div>
        </section>

        {/* ─── Gallery ─────────────────────────────────────── */}
        <section id="gallery" className="py-24 bg-[#FFFFFF]">
          <div className="max-w-[1400px] mx-auto px-6">
            <div className={`text-center mb-16 ${revealClass('gallery-head')}`} data-reveal-id="gallery-head">
              <h2 className="text-3xl md:text-5xl font-serif text-[#1E2D27] mb-4">Visual Expedition</h2>
              <p className="text-[#1E2D27]/50 uppercase tracking-widest text-sm">A glimpse into the {lodgeProfile.name} experience</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 auto-rows-[180px] md:auto-rows-[230px]">
              {expeditionImages.map((image, idx) => {
                const galleryDirection = idx % 3 === 0
                  ? styles.revealFromTop
                  : idx % 3 === 1
                    ? styles.revealFromLeft
                    : styles.revealFromRight;

                return (
                  <button
                    key={image.src + idx}
                    onClick={() => setLightboxIndex(idx)}
                    data-reveal-id={`gallery-item-${idx}`}
                    className={`relative group overflow-hidden rounded-sm shadow-[0_8px_30px_rgba(30,45,39,0.12)] ${idx % 9 === 0 ? 'col-span-2 row-span-2 ' : ''}${idx % 7 === 0 ? 'row-span-2 ' : ''}${revealClass(`gallery-item-${idx}`, galleryDirection)}`}
                  >
                    <img src={image.src} alt={image.alt} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-4">
                      <span className="text-white uppercase tracking-widest text-xs font-semibold">View</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {lightboxIndex !== null && (
        <div className={styles.lightbox} onClick={() => setLightboxIndex(null)}>
          <button className={styles.lightboxClose} onClick={() => setLightboxIndex(null)} aria-label="Close gallery">X</button>
          <div className={styles.lightboxBody} onClick={(event) => event.stopPropagation()}>
            <img src={expeditionImages[lightboxIndex]?.src} alt={expeditionImages[lightboxIndex]?.alt || 'Gallery item'} />
            <div className={styles.lightboxControls}>
              <button
                onClick={() => setLightboxIndex((prev) => {
                  if (prev === null) return 0;
                  return prev === 0 ? expeditionImages.length - 1 : prev - 1;
                })}
              >
                Prev
              </button>
              <span>{lightboxIndex + 1} / {expeditionImages.length}</span>
              <button
                onClick={() => setLightboxIndex((prev) => {
                  if (prev === null) return 0;
                  return prev === expeditionImages.length - 1 ? 0 : prev + 1;
                })}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ─── Read More Modals ─────────────────────────────── */}
      <ReadMoreModal
        isOpen={activeModal === 'origin'}
        onClose={() => setActiveModal(null)}
        title={originSectionTitle.title}
        subtitle={lodgeProfile.name}
      >
        {lodgeProfile.originStory.map((para: string, i: number) => (
          <p key={i}>{para}</p>
        ))}
      </ReadMoreModal>

      <ReadMoreModal
        isOpen={activeModal === 'nature'}
        onClose={() => setActiveModal(null)}
        title="Nature & Architecture"
        subtitle="Blurring the Lines"
      >
        {lodgeProfile.natureBlend.map((para: string, i: number) => (
          <p key={i}>{para}</p>
        ))}
      </ReadMoreModal>

      <ReadMoreModal
        isOpen={activeModal === 'philosophy'}
        onClose={() => setActiveModal(null)}
        title={philosophySectionTitle.title}
        subtitle="Our Approach"
      >
        {lodgeProfile.naturalistPhilosophy.map((para: string, i: number) => (
          <p key={i}>{para}</p>
        ))}
      </ReadMoreModal>

      <ReadMoreModal
        isOpen={activeModal === 'conservation'}
        onClose={() => setActiveModal(null)}
        title="Conservation & Community"
        subtitle="Giving Back"
      >
        {conservationItems.map((item: string, i: number) => (
          <div key={i}>
            {item.includes('\n') ? (
              <>
                <h4>{item.split('\n')[0]}</h4>
                {item.split('\n').slice(1).map((line: string, j: number) => (
                  <p key={j}>{line}</p>
                ))}
              </>
            ) : (
              <p>{item}</p>
            )}
          </div>
        ))}
      </ReadMoreModal>

      <ReadMoreModal
        isOpen={activeModal === 'evening'}
        onClose={() => setActiveModal(null)}
        title={afterSafariSectionTitle.title}
        subtitle="The Evenings"
      >
        {lodgeProfile.afterSafariVibe.map((para: string, i: number) => (
          <p key={i} style={para.length < 40 ? { fontFamily: 'serif', fontSize: '1.15rem', fontWeight: 600, color: '#1E2D27', marginTop: '1.5em' } : undefined}>
            {para}
          </p>
        ))}
      </ReadMoreModal>

      <Footer />
    </>
  );
}
