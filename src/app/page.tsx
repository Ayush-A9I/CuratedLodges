// import Header from '../components/layout/Header'
// import Footer from '../components/layout/Footer'
// import SearchBox from '../components/domain/SearchBox'
// import FeaturesSection from '../components/domain/FeaturesSection'
// import LodgeCard from '../components/domain/LodgeCard'
// import Testimonials from '../components/domain/Testimonials'
// import HouseOfJunglore from '../components/domain/HouseOfJunglore'
// import { lodgeCardsData } from '../data/lodgeCards'

// export default function Home() {
//   return (
//     <>
//       <Header />
      
//       {/* Hero Section with Video/Image Background */}
//       <section className="relative h-screen w-full overflow-hidden">
//         {/* Image Background (Fallback/Alternative) */}
//         <div 
//           className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
//           style={{
//             backgroundImage: 'url(https://images.unsplash.com/photo-1729605412184-8d796f9c6f66?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)'
//           }}
//         />
        
//         {/* Video Background (Overlays image if video exists) */}
//         {/* <video
//           autoPlay
//           loop
//           muted
//           playsInline
//           className="absolute inset-0 w-full h-full object-cover"
//           poster="https://images.unsplash.com/photo-1549366021-9f761d450615?q=80&w=2000&auto=format&fit=crop"
//         >
//           <source src="/assests/videos/hero_bg.mp4" type="video/mp4" />
//           <source src="/assests/videos/hero_bg.webm" type="video/webm" />
//         </video> */}
        
//         {/* Gradient Overlay */}
//         <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/60" />
        
//         {/* Hero Content */}
//         <div className="relative z-10 h-full flex items-center justify-center px-6 md:px-12">
//           <div className="max-w-5xl w-full">
//             {/* Text Content - Left Aligned */}
//             <div className="mb-12">
//               <div className="inline-block mb-4">
//                 <span className="text-[#F1663F] text-xs md:text-sm font-bold uppercase tracking-[0.3em] mb-3 block">
//                   Wild Stays • Curated Experiences
//                 </span>
//               </div>
//               <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-5 tracking-tight leading-[1.1]">
//                 Find Your Perfect<br />Basecamp
//               </h1>
//               <p className="text-base md:text-lg lg:text-xl text-white/80 max-w-2xl font-light leading-relaxed">
//                 Discover curated stays in the world's most extraordinary wild places. Where luxury meets wilderness.
//               </p>
//             </div>
            
//             {/* Search Box - Redesigned */}
//             <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 max-w-3xl">
//               <div className="flex flex-col md:flex-row gap-4">
//                 <SearchBox />
//               </div>
//             </div>
//           </div>
//         </div>
        
//         {/* Scroll Indicator */}
//         <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
//           <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
//             <div className="w-1.5 h-3 bg-white/70 rounded-full" />
//           </div>
//         </div>
//       </section>
      
//       {/* Main Content */}
//       <main className="relative z-20">
//         <FeaturesSection />
        
//         {/* Our Founding Collection */}
//         <section className="py-16 px-6 bg-[#FAFAFA]">
//           <div className="max-w-[1400px] mx-auto">
//             <h2 className="text-3xl md:text-4xl font-bold text-[#1E2D27] mb-3">
//               Our Founding Collection
//             </h2>
//             <p className="text-sm md:text-base text-[#6B7B75] font-light mb-8">
//               A curation of our most soul-stirring stays to get you started.
//             </p>
            
//             {/* Lodge Cards Grid with Horizontal Scroll */}
//             <div className="relative">
//               <div className="overflow-x-auto pb-4 scrollbar-hide">
//                 <div className="flex gap-6 min-w-min">
//                   {lodgeCardsData.map((lodge) => (
//                     <div key={lodge.id} className="flex-shrink-0 w-[340px]">
//                       <LodgeCard
//                         image={lodge.image}
//                         title={lodge.title}
//                         location={lodge.location}
//                         rating={lodge.rating}
//                         price={lodge.price}
//                         link={lodge.link}
//                       />
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* Guided Adventures Section */}
//         <section className="py-16 px-6 bg-[#1E2D27]">
//           <div className="max-w-[1400px] mx-auto">
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
//               {/* Left Side - Content */}
//               <div className="space-y-5">
//                 <div>
//                   <p className="text-[#F1663F] text-xs md:text-sm font-semibold uppercase tracking-wider mb-2">
//                     Explore
//                   </p>
//                   <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
//                     Guided Adventures
//                   </h2>
//                 </div>
//                 <p className="text-base md:text-lg text-white/80 font-light leading-relaxed">
//                   Complete your journey with a Junglore Expedition. Expertly led tours through the heart of the wild.
//                 </p>
//                 <a href="https://www.junglore.com/explore" target="_blank" rel="noopener noreferrer" className="inline-block bg-[#F1663F] hover:bg-[#d55535] text-white font-semibold px-6 py-3 rounded-full transition-all duration-300 uppercase text-xs tracking-wide">
//                   Explore Expeditions
//                 </a>
//               </div>

//               {/* Right Side - Brick Style Image Grid */}
//               <div className="columns-2 gap-3 space-y-3 h-auto max-w-7xl mx-auto">
                
//                 {/* Top Left - Resort/Pool */}
//                 <div className="break-inside-avoid rounded-3xl overflow-hidden mb-4">
//                   <img 
//                     src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800" 
//                     alt="Luxury resort pool" 
//                     className="w-full aspect-[4/3] object-cover hover:scale-105 transition-transform duration-500"
//                   />
//                 </div>

//                 {/* Bottom Left - Tiger */}
//                 <div className="break-inside-avoid rounded-3xl overflow-hidden">
//                   <img 
//                     src="https://images.unsplash.com/photo-1615963244664-5b845b2025ee?w=800" 
//                     alt="Bengal tiger" 
//                     className="w-full aspect-[6/7] object-cover hover:scale-105 transition-transform duration-500"
//                   />
//                 </div>

//                 {/* Top Right - Elephants */}
//                 <div className="break-inside-avoid rounded-3xl overflow-hidden mb-4">
//                   <img 
//                     src="https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=800" 
//                     alt="Elephant herd" 
//                     className="w-full aspect-[6/7] object-cover hover:scale-105 transition-transform duration-500"
//                   />
//                 </div>

//                 {/* Bottom Right - Safari */}
//                 <div className="break-inside-avoid rounded-3xl overflow-hidden">
//                   <img 
//                     src="https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800" 
//                     alt="Safari vehicles" 
//                     className="w-full aspect-[4/3] object-cover hover:scale-105 transition-transform duration-500"
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* Testimonials Section */}
//         <Testimonials />

//         {/* House of Junglore Section */}
//         <HouseOfJunglore />

//         {/* Latest Field Notes Section */}
//         <section className="py-16 px-6 bg-white">
//           <div className="max-w-[1400px] mx-auto">
//             <div className="text-center mb-10">
//               <h2 className="text-3xl md:text-4xl font-bold text-[#1E2D27] mb-2">
//                 Latest Field Notes
//               </h2>
//               <p className="text-sm md:text-base text-[#6B7B75] font-light">
//                 Expert insights, stories from the ground, and wildlife photography tips.
//               </p>
//             </div>

//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-[1200px] mx-auto">
//               {/* Left Side - Featured Article */}
//               <div className="relative rounded-3xl overflow-hidden group cursor-pointer h-[450px]">
//                 <img 
//                   src="https://images.unsplash.com/photo-1549366021-9f761d450615?w=800" 
//                   alt="Tracking in Kanha" 
//                   className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
//                 />
//                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
//                 <div className="absolute bottom-0 left-0 right-0 p-6">
//                   <span className="inline-block bg-[#F1F5F3] text-[#1E2D27] text-xs font-semibold px-3 py-1.5 rounded-full mb-3 uppercase tracking-wide">
//                     Field Notes
//                   </span>
//                   <h3 className="text-xl md:text-2xl font-bold text-white mb-2 leading-tight">
//                     The Art of Tracking: A Guide to Kanha
//                   </h3>
//                   <p className="text-white/90 text-xs flex items-center gap-2">
//                     By <span className="font-semibold">Dr. Aris Thorne</span>
//                   </p>
//                 </div>
//               </div>

//               {/* Right Side - Article List */}
//               <div className="flex flex-col gap-5">
//                 {/* Article 1 */}
//                 <div className="flex gap-3 group cursor-pointer">
//                   <div className="flex-shrink-0 w-32 h-32 rounded-2xl overflow-hidden">
//                     <img 
//                       src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400" 
//                       alt="Golden Hour Photography" 
//                       className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
//                     />
//                   </div>
//                   <div className="flex-1">
//                     <span className="inline-block text-[#F1663F] text-xs font-semibold uppercase tracking-wide mb-1.5">
//                       Technique
//                     </span>
//                     <h4 className="text-base font-bold text-[#1E2D27] mb-1.5 leading-tight group-hover:text-[#F1663F] transition-colors">
//                       Photography in the Golden Hour
//                     </h4>
//                     <p className="text-[#6B7B75] text-xs">
//                       By Maya Krishnan
//                     </p>
//                   </div>
//                 </div>

//                 {/* Article 2 */}
//                 <div className="flex gap-3 group cursor-pointer">
//                   <div className="flex-shrink-0 w-32 h-32 rounded-2xl overflow-hidden">
//                     <img 
//                       src="https://images.unsplash.com/photo-1542401886-65d6c61db217?w=400" 
//                       alt="Sustainable Lodging" 
//                       className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
//                     />
//                   </div>
//                   <div className="flex-1">
//                     <span className="inline-block text-[#F1663F] text-xs font-semibold uppercase tracking-wide mb-1.5">
//                       Impact
//                     </span>
//                     <h4 className="text-base font-bold text-[#1E2D27] mb-1.5 leading-tight group-hover:text-[#F1663F] transition-colors">
//                       Sustainable Lodging: More than a Buzzword
//                     </h4>
//                     <p className="text-[#6B7B75] text-xs">
//                       By Junglore Team
//                     </p>
//                   </div>
//                 </div>

//                 {/* Article 3 */}
//                 <div className="flex gap-3 group cursor-pointer">
//                   <div className="flex-shrink-0 w-32 h-32 rounded-2xl overflow-hidden">
//                     <img 
//                       src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400" 
//                       alt="Safari Packing" 
//                       className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
//                     />
//                   </div>
//                   <div className="flex-1">
//                     <span className="inline-block text-[#F1663F] text-xs font-semibold uppercase tracking-wide mb-1.5">
//                       Prep
//                     </span>
//                     <h4 className="text-base font-bold text-[#1E2D27] mb-1.5 leading-tight group-hover:text-[#F1663F] transition-colors">
//                       What to Pack for Your First Safari
//                     </h4>
//                     <p className="text-[#6B7B75] text-xs">
//                       By Samuel Ott
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </section>
//       </main>
      
//       <Footer />
//     </>
//   )
// }

import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import SearchBox from '../components/domain/SearchBox'
import FeaturesSection from '../components/domain/FeaturesSection'
import LodgeCard from '../components/domain/LodgeCard'
import Testimonials from '../components/domain/Testimonials'
import HouseOfJunglore from '../components/domain/HouseOfJunglore'
import { lodgeCardsData } from '../data/lodgeCards'
import { fieldNotesData } from '../data/mock/FieldNotesData'
import Link from 'next/link'

export default function Home() {
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
            Find Your Perfect Basecamp
          </h1>
          <p className="text-base md:text-lg lg:text-xl text-white/90 max-w-2xl font-light leading-relaxed mb-6">
            Discover curated stays in the world&apos;s most extraordinary wild places
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
              Our Founding Collection
            </h2>
            <p className="text-sm md:text-base text-[#6B7B75] font-light mb-8">
              A curation of our most soul-stirring stays to get you started.
            </p>
            
            {/* Lodge Cards Grid with Horizontal Scroll */}
            <div className="relative">
              <div className="overflow-x-auto pb-4 scrollbar-hide">
                <div className="flex gap-6 min-w-min">
                  {lodgeCardsData.map((lodge) => (
                    <div key={lodge.id} className="flex-shrink-0 w-[400px]">
                      <LodgeCard
                        image={lodge.image}
                        images={lodge.images}
                        title={lodge.title}
                        location={lodge.location}
                        rating={lodge.rating}
                        price={lodge.price}
                        link={lodge.link}
                        amenities={lodge.amenities}
                        ecoCertified={lodge.ecoCertified}
                      />
                    </div>
                  ))}
                </div>
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
                    Explore
                  </p>
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
                    Guided Adventures
                  </h2>
                </div>
                <p className="text-base md:text-lg text-white/80 font-light leading-relaxed">
                  Complete your journey with a Junglore Expedition. Expertly led tours through the heart of the wild.
                </p>
                <a href="https://www.junglore.com/explore" target="_blank" rel="noopener noreferrer" className="inline-block bg-[#F1663F] hover:bg-[#d55535] text-white font-semibold px-6 py-3 rounded-full transition-all duration-300 uppercase text-xs tracking-wide">
                  Explore Expeditions
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
                Latest Field Notes
              </h2>
              <p className="text-sm md:text-base text-[#6B7B75] font-light">
                Expert insights, stories from the ground, and wildlife photography tips.
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