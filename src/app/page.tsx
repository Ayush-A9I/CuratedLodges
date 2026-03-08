"use client";

import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import SearchBox from '../components/domain/SearchBox'
import FeaturesSection from '../components/domain/FeaturesSection'
import LodgeCard from '../components/domain/LodgeCard'
import Testimonials from '../components/domain/Testimonials'
import HouseOfJunglore from '../components/domain/HouseOfJunglore'
import { lodgesData } from '../data/mock/LodgeData'
import { fieldNotesData } from '../data/mock/FieldNotesData'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'

export default function Home() {
  const { t } = useTranslation();
  
  // Collect all lodges from all regions and parks
  const allLodges = Object.entries(lodgesData).flatMap(([region, parks]) =>
    Object.entries(parks).flatMap(([parkName, parkData]) =>
      parkData.lodges.map(lodge => ({
        ...lodge,
        parkName,
        region,
      }))
    )
  );

  // Helper function to create URL-friendly slugs
  const createSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };
  
  return (
    <>
      <Header />
      
      {/* Hero Section with Video/Image Background */}
      <section className="relative h-screen w-full overflow-hidden">
        {/* Image Background (Fallback/Alternative) */}
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1655102736801-dc15c6552a16?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)'
          }}
        />
        
        {/* Video Background (Overlays image if video exists) */}
        {/* <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          poster="https://images.unsplash.com/photo-1549366021-9f761d450615?q=80&w=2000&auto=format&fit=crop"
        >
          <source src="/assests/videos/hero_bg.mp4" type="video/mp4" />
          <source src="/assests/videos/hero_bg.webm" type="video/webm" />
        </video> */}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/40" />
        
        {/* Hero Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6 md:px-12 pt-20">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 tracking-tight">
            {t('hero.title')}
          </h1>
          <p className="text-base md:text-lg lg:text-xl text-white/90 max-w-2xl font-light leading-relaxed mb-6">
            {t('hero.subtitle')}
          </p>
          
          {/* Search Box */}
          <SearchBox />
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
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
                  {allLodges.map((lodge) => {
                    // Get the minimum price from room types or fall back to pricePerNight
                    const minPrice = lodge.roomTypes && lodge.roomTypes.length > 0
                      ? Math.min(...lodge.roomTypes.map(room => room.price))
                      : lodge.pricePerNight;

                    const lodgeUrl = `/park/${lodge.region}/${createSlug(lodge.parkName)}/${createSlug(lodge.name)}`;

                    return (
                      <div key={lodge.id} className="flex-shrink-0 w-[380px] md:w-[400px]">
                        <LodgeCard
                          image={lodge.image}
                          images={lodge.images || [lodge.image]}
                          title={lodge.name}
                          location={lodge.location}
                          rating={lodge.rating}
                          price={minPrice}
                          link={lodgeUrl}
                          amenities={lodge.amenities}
                          ecoCertified={lodge.ecoCertified}
                          bestSeason={lodge.bestSeason}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Swipe indicator - Mobile only */}
              <div className="md:hidden text-center mt-4">
                <p className="text-sm text-[#6B7B75] font-light flex items-center justify-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
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
              {/* Left Side - Content */}
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

              {/* Right Side - Brick Style Image Grid */}
              <div className="columns-2 gap-3 space-y-3 h-auto max-w-7xl mx-auto">
                
                {/* Top Left - Resort/Pool */}
                <div className="break-inside-avoid rounded-3xl overflow-hidden mb-4">
                  <img 
                    src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800" 
                    alt="Luxury resort pool" 
                    className="w-full aspect-[4/3] object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Bottom Left - Tiger */}
                <div className="break-inside-avoid rounded-3xl overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1615963244664-5b845b2025ee?w=800" 
                    alt="Bengal tiger" 
                    className="w-full aspect-[6/7] object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Top Right - Elephants */}
                <div className="break-inside-avoid rounded-3xl overflow-hidden mb-4">
                  <img 
                    src="https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=800" 
                    alt="Elephant herd" 
                    className="w-full aspect-[6/7] object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Bottom Right - Safari */}
                <div className="break-inside-avoid rounded-3xl overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800" 
                    alt="Safari vehicles" 
                    className="w-full aspect-[4/3] object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <Testimonials />

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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-[1200px]">
              {/* Left Side - Featured Article */}
              <Link href={`/field-notes/${fieldNotesData[0].slug}`} className="relative rounded-3xl overflow-hidden group cursor-pointer h-[450px]">
                <img 
                  src={fieldNotesData[0].image} 
                  alt={fieldNotesData[0].title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <span className="inline-block bg-[#F1F5F3] text-[#1E2D27] text-xs font-semibold px-3 py-1.5 rounded-full mb-3 uppercase tracking-wide">
                    {fieldNotesData[0].park}
                  </span>
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-2 leading-tight capitalize">
                    {fieldNotesData[0].title.toLowerCase()}
                  </h3>
                  <p className="text-white/90 text-xs flex items-center gap-2">
                    By <span className="font-semibold">{fieldNotesData[0].author}</span>
                  </p>
                </div>
              </Link>

              {/* Right Side - Article List */}
              <div className="flex flex-col gap-5">
                {fieldNotesData.slice(1, 4).map((note) => (
                  <Link key={note.id} href={`/field-notes/${note.slug}`} className="flex gap-3 group cursor-pointer">
                    <div className="flex-shrink-0 w-32 h-32 rounded-2xl overflow-hidden">
                      <img 
                        src={note.image} 
                        alt={note.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
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
          </div>
        </section>
      </main>
      
      <Footer />
    </>
  )
}