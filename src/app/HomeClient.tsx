"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import SearchBox from '../components/domain/SearchBox'
import HomeHero from '../components/domain/HomeHero'
import FeaturesSection from '../components/domain/FeaturesSection'
import LodgeCard from '../components/domain/LodgeCard'
import Testimonials from '../components/domain/Testimonials'
import HouseOfJunglore from '../components/domain/HouseOfJunglore'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import api from '@/lib/api'
import type { HomepageResponse, LodgeListItem, Testimonial } from '@/types/api'

type LatestFieldNote = HomepageResponse['latestFieldNotes'][number];

export interface HomeClientProps {
  initialData: HomepageResponse | null;
}

// Neutral light-gray blur placeholder for S3 content images on white/#FAFAFA backgrounds.
const CONTENT_BLUR_PLACEHOLDER =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/OdXPQAIoAM4G2QPBQAAAABJRU5ErkJggg==';

export interface HomeClientProps {
  initialData: HomepageResponse | null;
}

export default function HomeClient({ initialData }: HomeClientProps) {
  const { t } = useTranslation();
  const [lodges, setLodges] = useState<LodgeListItem[]>(initialData?.featuredLodges ?? []);
  const [fieldNotes, setFieldNotes] = useState<LatestFieldNote[]>(initialData?.latestFieldNotes ?? []);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(initialData?.testimonials ?? []);
  const [hero, setHero] = useState(initialData?.hero ?? { imageUrl: '', videoUrl: null });
  const [isLoading, setIsLoading] = useState(!initialData);

  useEffect(() => {
    if (initialData) {
      setLodges(initialData.featuredLodges || []);
      setFieldNotes(initialData.latestFieldNotes || []);
      setTestimonials(initialData.testimonials || []);
      setHero(initialData.hero ?? { imageUrl: '', videoUrl: null });
      setIsLoading(false);
      return;
    }

    api.getHomepage()
      .then((data: HomepageResponse) => {
        setLodges(data.featuredLodges || []);
        setFieldNotes(data.latestFieldNotes || []);
        setTestimonials(data.testimonials || []);
        setHero(data.hero ?? { imageUrl: '', videoUrl: null });
      })
      .catch((err) => console.error('Failed to load homepage:', err))
      .finally(() => setIsLoading(false));
  }, [initialData]);

  return (
    <>
      <Header whiteTextAlways />

      <section className="relative h-screen w-full overflow-hidden">
        <HomeHero imageUrl={hero.imageUrl} videoUrl={hero.videoUrl} />

        {/* Hero Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6 md:px-12 pt-20">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 tracking-tight">
            {t('hero.title')}
          </h1>
          <p className="text-base md:text-lg lg:text-xl text-white/90 max-w-2xl font-light leading-relaxed mb-6">
            {t('hero.subtitle')}
          </p>

          <SearchBox />
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce motion-reduce:animate-none">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-white/70 rounded-full" />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="relative z-20">
        <FeaturesSection />

        {/* Our Founding Collection */}
        <section className="py-16 px-6 bg-[#FAFAFA]">
          <div className="max-w-[1400px] mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1E2D27] mb-3">
              {t('sections.foundingCollection')}
            </h2>
            <p className="text-sm md:text-base text-[#6B7B75] font-light mb-8">
              {t('sections.foundingCollectionDesc')}
            </p>

            {/* Lodge Cards Grid with Horizontal Scroll */}
            <div className="relative">
              <div className="overflow-x-auto pb-4 scrollbar-hide">
                <div className="flex gap-6 min-w-min">
                  {isLoading ? (
                    <div className="flex items-center justify-center w-full py-20">
                      <div className="w-8 h-8 border-2 border-[#1E2D27] border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : (
                    lodges.map((lodge) => {
                      const lodgeUrl = `/park/${lodge.regionSlug}/${lodge.parkSlug}/${lodge.slug}`;
                      return (
                        <div key={lodge.id} className="flex-shrink-0 w-[380px] md:w-[400px]">
                          <LodgeCard
                            image={lodge.thumbnail}
                            images={lodge.images || [lodge.thumbnail]}
                            title={lodge.name}
                            location={lodge.location}
                            rating={lodge.rating}
                            price={lodge.minRoomPrice || lodge.pricePerNight || 0}
                            link={lodgeUrl}
                            amenities={lodge.amenities}
                            ecoCertified={lodge.ecoCertified}
                          />
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Swipe indicator - Mobile only */}
              <div className="md:hidden text-center mt-4">
                <p className="text-sm text-[#6B7B75] font-light flex items-center justify-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                  Swipe left to view collection
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Guided Adventures Section */}
        <section className="py-16 px-6 bg-[#1E2D27]">
          <div className="max-w-[1400px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div className="space-y-5">
                <div>
                  <p className="text-[#F1663F] text-xs md:text-sm font-semibold uppercase tracking-wider mb-2">
                    {t('sections.guidedAdventuresLabel')}
                  </p>
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
                    {t('sections.guidedAdventures')}
                  </h2>
                </div>
                <p className="text-base md:text-lg text-white/80 font-light leading-relaxed">
                  {t('sections.guidedAdventuresDesc')}
                </p>
                <a href="https://www.junglore.com/explore" target="_blank" rel="noopener noreferrer" className="inline-block bg-[#F1663F] hover:bg-[#d55535] text-white font-semibold px-6 py-3 rounded-full transition-all duration-300 uppercase text-xs tracking-wide">
                  {t('sections.exploreExpeditions')}
                </a>
              </div>

              <div className="columns-2 gap-3 space-y-3 h-auto max-w-7xl mx-auto">
                <div className="break-inside-avoid rounded-3xl overflow-hidden mb-4">
                  <img src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800" alt="Luxury resort pool" className="w-full aspect-[4/3] object-cover hover:scale-105 transition-transform duration-500" loading="lazy" decoding="async" />
                </div>
                <div className="break-inside-avoid rounded-3xl overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1615963244664-5b845b2025ee?w=800" alt="Bengal tiger" className="w-full aspect-[6/7] object-cover hover:scale-105 transition-transform duration-500" loading="lazy" decoding="async" />
                </div>
                <div className="break-inside-avoid rounded-3xl overflow-hidden mb-4">
                  <img src="https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=800" alt="Elephant herd" className="w-full aspect-[6/7] object-cover hover:scale-105 transition-transform duration-500" loading="lazy" decoding="async" />
                </div>
                <div className="break-inside-avoid rounded-3xl overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800" alt="Safari vehicles" className="w-full aspect-[4/3] object-cover hover:scale-105 transition-transform duration-500" loading="lazy" decoding="async" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <Testimonials testimonials={testimonials} />

        {/* House of Junglore Section */}
        <HouseOfJunglore />

        {/* Latest Field Notes Section */}
        <section className="py-16 px-6 bg-white">
          <div className="max-w-[1400px] mx-auto flex flex-col items-center">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-[#1E2D27] mb-2">
                {t('sections.latestFieldNotes')}
              </h2>
              <p className="text-sm md:text-base text-[#6B7B75] font-light">
                {t('sections.latestFieldNotesDesc')}
              </p>
            </div>

            {fieldNotes.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-[1200px]">
                {/* Left Side - Featured Article */}
                <Link href={`/field-notes/${fieldNotes[0].slug}`} className="relative rounded-3xl overflow-hidden group cursor-pointer h-[450px]">
                  <Image
                    src={fieldNotes[0].image}
                    alt={fieldNotes[0].title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 600px"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    style={{ objectFit: 'cover' }}
                    placeholder="blur"
                    blurDataURL={CONTENT_BLUR_PLACEHOLDER}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <span className="inline-block bg-[#F1F5F3] text-[#1E2D27] text-xs font-semibold px-3 py-1.5 rounded-full mb-3 uppercase tracking-wide">
                      {fieldNotes[0].park}
                    </span>
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-2 leading-tight capitalize">
                      {fieldNotes[0].title.toLowerCase()}
                    </h3>
                    <p className="text-white/90 text-xs flex items-center gap-2">
                      By <span className="font-semibold">{fieldNotes[0].author}</span>
                    </p>
                  </div>
                </Link>

                {/* Right Side - Article List */}
                <div className="flex flex-col gap-5">
                  {fieldNotes.slice(1, 4).map((note) => (
                    <Link key={note.id} href={`/field-notes/${note.slug}`} className="flex gap-3 group cursor-pointer">
                      <div className="relative flex-shrink-0 w-32 h-32 rounded-2xl overflow-hidden">
                        <Image
                          src={note.image}
                          alt={note.title}
                          fill
                          sizes="128px"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          style={{ objectFit: 'cover' }}
                          placeholder="blur"
                          blurDataURL={CONTENT_BLUR_PLACEHOLDER}
                        />
                      </div>
                      <div className="flex-1">
                        <span className="inline-block text-[#F1663F] text-xs font-semibold uppercase tracking-wide mb-1.5">
                          {note.park}
                        </span>
                        <h4 className="text-base font-bold text-[#1E2D27] mb-1.5 leading-tight group-hover:text-[#F1663F] transition-colors capitalize">
                          {note.title.toLowerCase()}
                        </h4>
                        <p className="text-[#6B7B75] text-xs">
                          By {note.author}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}