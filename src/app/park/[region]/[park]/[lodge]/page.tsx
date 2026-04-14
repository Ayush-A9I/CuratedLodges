"use client";

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Header from '../../../../../components/layout/Header';
import Footer from '../../../../../components/layout/Footer';
import { MapPin, Compass, Leaf, Users, Bed, Wind, Waves, Check, Coffee, Shield, ArrowRight, Tent, Volume2 } from 'lucide-react';
import styles from './lodge.module.css';

type MediaItem = {
  src: string;
  alt: string;
};

const lodgeProfile = {
  name: 'Outpost 12',
  legalName: 'Sinali Experiences Private Limited',
  category: 'Boutique Wildlife Resort',
  roomCount: 9,
  location: 'Kanha, Madhya Pradesh',
  roomTypes: [
    {
      name: 'Luxury Cottage',
      description: 'Spacious cottage with a private deck.',
    },
  ],
  mealPlans: ['AP - All Meals', 'MAP - Breakfast & One Meal', 'CP - Breakfast Only', 'EP - Room Only'],
  originStory: [
    'Outpost 12 was born out of a deep, almost instinctive pull toward the wilderness, not just as a place to visit, but as a place to call home.',
    "We didn\'t want to build just another lodge. We wanted to create a space that feels like a natural extension of the forest, where the boundaries between inside and outside blur, where luxury is defined by stillness, space and authenticity rather than excess.",
    'That became the starting point of our vision.',
    'At its core, Outpost 12 is a passion project, shaped by our love for Kanha, a desire to preserve its integrity and a belief that meaningful hospitality can coexist with sustainability.',
    'We are just Kanha fans, and that is pretty much reason enough.',
  ],
  natureBlend: [
    'At Outpost 12, the architecture was never meant to stand out, it was meant to settle in.',
    'From the very beginning, we approached design with a light footprint philosophy. Instead of reshaping the land, we worked around it while retaining existing trees, following the natural contours and ensuring that the built spaces feel quietly embedded within the forest rather than imposed on it.',
    'Materiality plays a big role in this. We have prioritized locally sourced stone, natural wood and earthy finishes that age with the landscape rather than against it.',
    'Ultimately, the goal was to create a space that feels like it has always belonged here, where architecture quietly recedes, and the forest continues to lead.',
  ],
  naturalistPhilosophy: [
    'Being a naturalist-owned and run property, our guiding team sits at the heart of the guest experience. Many guides come from the region and bring an intuitive understanding of the forest.',
    'This is complemented by formal training and certifications, including recognized naturalist programs, wildlife interpretation courses and continuous skill development.',
    'We follow a strict code of ethical wildlife viewing: prioritizing animal welfare over sightings, maintaining distance, and respecting regulations at all times.',
    'Guests get more than sightings. We focus on interpretation: tracks, alarm calls, habitat relationships, and ecosystem connections.',
  ],
  afterSafariVibe: [
    'As guests return from the evening drive, the lodge eases into a slower rhythm. The light fades, the air cools and the sounds of the jungle begin to take over.',
    'There is time to pause, a drink in hand, stories from the safari unfolding naturally, often with our naturalists adding context to what was seen and heard.',
    'Dinner is unhurried, whether under the open sky or in a warm, intimate setting. Evenings are not structured, they simply unfold.',
    'Conversations by the fire, quiet moments under the stars, and the awareness that the jungle is alive all around you. There is always a scary story to hear.',
  ],
  conservation: [
    'At Outpost 12, giving back is not a parallel effort, it is built into how we operate.',
    'On the ecological side, we consciously maintain a low-impact footprint and support habitat preservation by keeping large parts of the land undisturbed.',
    'The majority of our team comes from nearby villages and we invest in training and long-term employment to create meaningful livelihood opportunities.',
    'Wherever possible, we source locally so tourism benefits remain within the region.',
    'If the forest and its communities thrive, so do we.',
  ],
  uniquePoints: [
    'Naturalist-owned and naturalist-run, that sets the tone for every guest interaction.',
    'Low-density, intimate layout that keeps guests constantly connected to the forest.',
    'Highly personalized guest journeys across wildlife, food and comfort.',
  ],
  usps: [
    {
      icon: 'compass',
      title: 'Naturalist Owned & Run',
      desc: 'That sets the tone for your entire authentic wilderness experience.',
    },
    {
      icon: 'leaf',
      title: 'Intimate Connection',
      desc: 'Low density, intimate layout allowing guests to feel constantly connected to the forest.',
    },
    {
      icon: 'users',
      title: 'Hyper-Personalized',
      desc: "Everything is centered around our guests' desires-whether it be wildlife, food, or luxury.",
    },
  ],
};

const propertyImages: MediaItem[] = [
  {
    src: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&auto=format&fit=crop',
    alt: 'Outpost 12 exterior in forest setting',
  },
  {
    src: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=1600&auto=format&fit=crop',
    alt: 'Luxury cottage deck',
  },
  {
    src: 'https://images.unsplash.com/photo-1616594039964-3f6d8b5e318f?w=1600&auto=format&fit=crop',
    alt: 'Warm interior and lounge lighting',
  },
  {
    src: 'https://images.unsplash.com/photo-1598928636135-d146006ff4be?w=1600&auto=format&fit=crop',
    alt: 'Evening bonfire atmosphere',
  },
];

const safariImages: MediaItem[] = [
  {
    src: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1600&auto=format&fit=crop',
    alt: 'Tiger in forest habitat',
  },
  {
    src: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1600&auto=format&fit=crop',
    alt: 'Safari jeep in jungle trail',
  },
  {
    src: 'https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=1600&auto=format&fit=crop',
    alt: 'Wildlife tracking moment',
  },
  {
    src: 'https://images.unsplash.com/photo-1516934024742-b461fba47600?w=1600&auto=format&fit=crop',
    alt: 'Birdlife in Kanha landscape',
  },
];

const heroVideo = {
  src: '/assests/videos/Outpost12.mp4',
  poster: propertyImages[0]?.src,
};

const expeditionImages: MediaItem[] = [...propertyImages, ...safariImages];

export default function LodgeDetailPage() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [visibleSections, setVisibleSections] = useState<Record<string, boolean>>({});
  const [isHeroMuted, setIsHeroMuted] = useState(false);
  const [showSoundPrompt, setShowSoundPrompt] = useState(false);
  const heroVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
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
  }, []);

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
  }, []);

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
              <MapPin size={14} /> Kanha National Park
            </div>
            <h1 className={`${styles.heroTitle} ${styles.revealUp} ${styles.stagger1}`}>{lodgeProfile.name}</h1>
            <p className={`${styles.heroSubtitle} ${styles.revealUp} ${styles.stagger2}`}>A naturalist-led wilderness retreat shaped by stillness, forest rhythm, and meaningful hospitality.</p>

          </div>
        </section>

        <section className="relative z-30 max-w-[1400px] mx-auto px-6 -mt-8 md:-mt-12">
          <div className="bg-[#FFFFFF] shadow-2xl flex flex-col md:flex-row items-center justify-between p-8 md:p-12 border-t-4 border-[#F1663F]">
            <div className="flex items-start space-x-6 w-full md:w-1/3 mb-8 md:mb-0 md:pr-8 md:border-r border-[#1E2D27]/10 group">
              <div className="bg-[#1E2D27]/5 p-4 rounded-full text-[#F1663F] group-hover:bg-[#F1663F] group-hover:text-[#FFFFFF] transition-colors">
                <Compass size={24} strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="font-serif text-xl mb-2 text-[#1E2D27]">Naturalist Owned</h3>
                <p className="text-[#1E2D27]/70 text-sm leading-relaxed">Setting the definitive tone for a deeply authentic, expert-led wilderness experience.</p>
              </div>
            </div>
            <div className="flex items-start space-x-6 w-full md:w-1/3 mb-8 md:mb-0 md:px-8 md:border-r border-[#1E2D27]/10 group">
              <div className="bg-[#1E2D27]/5 p-4 rounded-full text-[#F1663F] group-hover:bg-[#F1663F] group-hover:text-[#FFFFFF] transition-colors">
                <Leaf size={24} strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="font-serif text-xl mb-2 text-[#1E2D27]">Intimate Connection</h3>
                <p className="text-[#1E2D27]/70 text-sm leading-relaxed">A low-density layout allowing guests to feel constantly and quietly connected to the forest.</p>
              </div>
            </div>
            <div className="flex items-start space-x-6 w-full md:w-1/3 md:pl-8 group">
              <div className="bg-[#1E2D27]/5 p-4 rounded-full text-[#F1663F] group-hover:bg-[#F1663F] group-hover:text-[#FFFFFF] transition-colors">
                <Users size={24} strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="font-serif text-xl mb-2 text-[#1E2D27]">Hyper-Personalized</h3>
                <p className="text-[#1E2D27]/70 text-sm leading-relaxed">Everything is centered around your desires-whether it be wildlife, culinary journeys, or pure luxury.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 md:py-32 px-6 max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <div className={revealClass('origin-copy')} data-reveal-id="origin-copy">
              <span className="text-[#F1663F] uppercase tracking-[0.2em] text-sm font-semibold mb-6 block">The Origin Story</span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-[#1E2D27] leading-tight mb-8">
                Not just a place to visit, but a place to <span className="italic bg-[#FFE8A1]/50 px-2 rounded-sm">call home.</span>
              </h2>
              <div className="space-y-6 text-[#1E2D27]/70 text-lg leading-relaxed">
                <p>{lodgeProfile.originStory[0]}</p>
                <p>{lodgeProfile.originStory[1]} {lodgeProfile.originStory[2]}</p>
                <p>{lodgeProfile.originStory[3]}</p>
              </div>

              <div className="mt-12 pl-6 border-l-2 border-[#F1663F]">
                <p className="font-serif text-xl md:text-2xl text-[#1E2D27] italic leading-snug">
                  {lodgeProfile.originStory[4]}
                </p>
              </div>
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

        <section className="bg-[#1E2D27] py-20 md:py-28">
          <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-stretch">
            <div className={`lg:col-span-6 relative group overflow-hidden ${revealClass('arch-media', styles.revealFromLeft)}`} data-reveal-id="arch-media">
              <img src={propertyImages[0].src} alt={propertyImages[0].alt} className="w-full h-full min-h-[500px] object-cover rounded-sm transition-transform duration-1000 group-hover:scale-105 opacity-90" />
            </div>

            <div className={`lg:col-span-6 lg:pl-16 lg:h-full lg:flex lg:flex-col lg:justify-center ${revealClass('arch-copy')}`} data-reveal-id="arch-copy">
              <span className="text-[#CCDD99] uppercase tracking-[0.2em] text-sm font-semibold mb-6 block">Blurring the Lines</span>
              <h2 className="text-3xl md:text-5xl font-serif text-[#FFFFFF] leading-tight mb-8">
                &ldquo;{lodgeProfile.natureBlend[0]}&rdquo;
              </h2>
              <div className="space-y-6 text-[#FFFFFF]/80 text-lg font-light leading-relaxed">
                <p>{lodgeProfile.natureBlend[1]}</p>
                <p>{lodgeProfile.natureBlend[2]}</p>
                <p>{lodgeProfile.natureBlend[3]}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#1E2D27] text-[#FFFFFF] py-24 md:py-32 border-t border-[#FFFFFF]/10">
          <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-stretch">
            <div className={`lg:col-span-6 relative group overflow-hidden lg:h-full ${revealClass('philosophy-media', styles.revealFromTop)}`} data-reveal-id="philosophy-media">
              <img src={safariImages[0].src} alt={safariImages[0].alt} className="w-full h-full min-h-[500px] object-cover rounded-sm transition-transform duration-1000 group-hover:scale-105 opacity-90" />
            </div>

            <div className={`lg:col-span-6 lg:pl-16 lg:h-full lg:flex lg:flex-col lg:justify-center ${revealClass('philosophy-copy')}`} data-reveal-id="philosophy-copy">
              <span className="text-[#FFE8A1] uppercase tracking-[0.2em] text-sm font-semibold mb-4 block">The Philosophy</span>
              <h2 className="text-4xl md:text-5xl font-serif leading-tight mb-8">Deeply educational and ethical wildlife tracking.</h2>
              <div className="space-y-6 text-[#FFFFFF]/70 text-lg font-light leading-relaxed mb-10">
                <p className="font-serif italic text-xl text-[#FFFFFF]/90 pb-4">
                  &ldquo;Instead of just chasing sightings, we focus on interpretation; helping guests understand tracks, alarm calls, habitat relationships and the interconnectedness of the ecosystem. Even a quiet drive becomes rich with insight.&rdquo;
                </p>
                <p>
                  Being a naturalist owned and run property, at Outpost 12, our guiding team sits at the heart of the guest
                  experience. We have built a group of naturalists who are not only knowledgeable, but deeply rooted in the
                  landscape they interpret.
                </p>
                <p>
                  Many of our guides come from the region itself, bringing with them an intuitive understanding of the forest.
                  This is complemented by formal training and certifications, including recognized naturalist programs,
                  wildlife interpretation courses and continuous skill development.
                </p>
                <div className="pt-6 border-t border-[#FFFFFF]/20">
                  <h4 className="text-[#FFFFFF] uppercase tracking-widest text-sm mb-3">Strict Code of Ethics</h4>
                  <p className="text-sm">
                    We prioritize animal welfare over sightings. This means maintaining appropriate distances, avoiding any
                    form of disturbance or baiting and respecting park regulations at all times. Our guides are trained to
                    read animal cues and vehicle dynamics to ensure encounters remain calm, natural, and non-intrusive.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#FFFFFF] py-24 px-6">
          <div className="max-w-[1400px] mx-auto">
            <div className={`text-center mb-16 ${revealClass('conservation-head')}`} data-reveal-id="conservation-head">
              <Leaf className="mx-auto text-[#1E2D27] mb-4" size={32} strokeWidth={1.5} />
              <h2 className="text-3xl md:text-4xl font-serif text-[#1E2D27] mb-4">Conservation &amp; Community</h2>
              <p className="text-[#1E2D27]/70 max-w-2xl mx-auto">At Outpost 12, giving back is not a parallel effort-it&apos;s built into how we operate.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className={`bg-[#FFFFFF] p-10 md:p-12 hover:-translate-y-2 transition-transform duration-300 border-t-4 border-[#F1663F] shadow-[0_4px_40px_rgba(30,45,39,0.06)] ${revealClass('cons-1')}`} data-reveal-id="cons-1">
                <Shield className="text-[#F1663F] mb-6" size={32} strokeWidth={1.5} />
                <h3 className="font-serif text-xl mb-4 text-[#1E2D27]">The Ecological Footprint</h3>
                <p className="text-[#1E2D27]/70 text-sm leading-relaxed">
                  We consciously maintain a low-impact footprint and actively support habitat preservation by keeping
                  large parts of the land undisturbed and free from intrusive development.
                </p>
              </div>
              <div className={`bg-[#FFFFFF] p-10 md:p-12 hover:-translate-y-2 transition-transform duration-300 border-t-4 border-[#F1663F] shadow-[0_4px_40px_rgba(30,45,39,0.06)] ${revealClass('cons-2')}`} data-reveal-id="cons-2">
                <Users className="text-[#F1663F] mb-6" size={32} strokeWidth={1.5} />
                <h3 className="font-serif text-xl mb-4 text-[#1E2D27]">Community Empowerment</h3>
                <p className="text-[#1E2D27]/70 text-sm leading-relaxed">
                  The majority of our team comes from nearby villages and we invest in training and long-term employment to create meaningful livelihood opportunities.
                </p>
              </div>
              <div className={`bg-[#FFFFFF] p-10 md:p-12 hover:-translate-y-2 transition-transform duration-300 border-t-4 border-[#F1663F] shadow-[0_4px_40px_rgba(30,45,39,0.06)] ${revealClass('cons-3')}`} data-reveal-id="cons-3">
                <Coffee className="text-[#F1663F] mb-6" size={32} strokeWidth={1.5} />
                <h3 className="font-serif text-xl mb-4 text-[#1E2D27]">The Simple Truth</h3>
                <p className="text-[#1E2D27]/70 text-sm leading-relaxed">
                  Wherever possible, we source locally. From produce to materials, ensuring that the economic benefits of tourism remain within the region. Ultimately: if the forest thrives, so do we.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 md:py-32 px-6 max-w-[1400px] mx-auto space-y-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
            <div className={revealClass('evenings-copy')} data-reveal-id="evenings-copy">
              <span className="text-[#F1663F] uppercase tracking-[0.2em] text-sm font-semibold mb-4 block">The Evenings</span>
              <h2 className="text-4xl md:text-5xl font-serif text-[#1E2D27] mb-6">
                The After-Safari <span className="italic bg-[#CCDD99]/40 px-2 rounded-sm">Rhythm.</span>
              </h2>
              <div className="space-y-6 text-[#1E2D27]/70 text-lg leading-relaxed mb-8">
                <p>{lodgeProfile.afterSafariVibe[0]}</p>
                <p>
                  There&apos;s time to pause, a drink in hand, stories from the safari unfolding naturally, often with our
                  naturalists adding depth and context to what was seen and heard. As night settles in, lighting remains
                  soft and minimal, allowing the forest to stay present.
                </p>
                <p>{lodgeProfile.afterSafariVibe[2]}</p>
              </div>
              <div className="p-6 bg-[#1E2D27] text-[#FFFFFF]/90 rounded-sm border-l-4 border-[#F1663F]">
                <p className="font-serif italic text-lg leading-snug">
                  &ldquo;Conversations by the fire, quiet moments under the stars, and the steady awareness that the jungle is alive all around you. There is always a scary story to tell in the jungle and our Naturalists make sure you hear one!&rdquo;
                </p>
              </div>
            </div>
            <div className={`relative group overflow-hidden rounded-sm shadow-xl ${revealClass('evenings-media', styles.revealFromRight)}`} data-reveal-id="evenings-media">
              <img src={propertyImages[3].src} alt={propertyImages[3].alt} className="w-full h-[600px] object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
            <div className={`order-2 lg:order-1 relative group overflow-hidden rounded-sm shadow-xl ${revealClass('acc-media', styles.revealFromLeft)}`} data-reveal-id="acc-media">
              <img src={propertyImages[1].src} alt="Luxury Cottage" className="w-full h-[600px] object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
            <div className={`order-1 lg:order-2 ${revealClass('acc-copy')}`} data-reveal-id="acc-copy">
              <span className="text-[#F1663F] uppercase tracking-[0.2em] text-sm font-semibold mb-4 block">Accommodation</span>
              <h2 className="text-4xl md:text-5xl font-serif text-[#1E2D27] mb-6">The Luxury Cottage</h2>
              <div className="inline-flex items-center space-x-2 bg-[#CCDD99] px-4 py-1.5 rounded-full mb-8">
                <Tent size={14} className="text-[#1E2D27]" />
                <span className="text-xs uppercase tracking-widest font-bold text-[#1E2D27]">{lodgeProfile.roomCount} Exclusive Units</span>
              </div>
              <p className="text-[#1E2D27]/70 text-lg leading-relaxed mb-10">
                Spacious cottages featuring a private deck. Designed to act as an intimate sanctuary, keeping you
                connected to the sights and sounds of the jungle after a day of tracking.
              </p>

              <div className="grid grid-cols-2 gap-x-8 gap-y-6 border-t border-b border-[#1E2D27]/10 py-8">
                <div className="flex flex-col space-y-1">
                  <span className="text-xs uppercase tracking-widest text-[#1E2D27]/50">Exterior</span>
                  <span className="font-medium text-[#1E2D27]">Spacious Private Deck</span>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-xs uppercase tracking-widest text-[#1E2D27]/50">Comfort</span>
                  <span className="font-medium text-[#1E2D27]">Climate Controlled</span>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-xs uppercase tracking-widest text-[#1E2D27]/50">Dining</span>
                  <span className="font-medium text-[#1E2D27]">{lodgeProfile.mealPlans[0]}</span>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-xs uppercase tracking-widest text-[#1E2D27]/50">Bath</span>
                  <span className="font-medium text-[#1E2D27]">En-suite Bathrooms</span>
                </div>
              </div>

            </div>
          </div>
        </section>

        <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[#1E2D27]/50 z-10" />
          <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
            <source src="/assests/videos/Outpost12.mp4" type="video/mp4" />
          </video>
          <div className={`relative z-20 text-center px-6 ${revealClass('divider-copy')}`} data-reveal-id="divider-copy">
            <h2 className="text-4xl md:text-6xl font-serif text-white mb-6 drop-shadow-lg">Immerse in the Wild</h2>
          </div>
        </section>

        <section id="gallery" className="py-24 bg-[#FFFFFF]">
          <div className="max-w-[1400px] mx-auto px-6">
            <div className={`text-center mb-16 ${revealClass('gallery-head')}`} data-reveal-id="gallery-head">
              <h2 className="text-3xl md:text-5xl font-serif text-[#1E2D27] mb-4">Visual Expedition</h2>
              <p className="text-[#1E2D27]/50 uppercase tracking-widest text-sm">A glimpse into the Outpost 12 experience</p>
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

      <Footer />
    </>
  );
}
