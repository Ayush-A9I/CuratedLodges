"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '../../../../../components/layout/Header';
import Footer from '../../../../../components/layout/Footer';
import { lodgesData } from '../../../../../data/mock/LodgeData';
import { Wifi, Waves, Droplet, Car, Dumbbell, Wind, Flame, Book, Wine, MapPin, Leaf, Send, Share, Bed, Coffee, Bath, Tv, Utensils, Shield, Sparkles, Calendar, User, Baby } from 'lucide-react';
import styles from './lodge.module.css';

export default function LodgeDetailPage() {
  const params = useParams();
  const region = params.region as string;
  const park = decodeURIComponent(params.park as string);
  const lodgeSlug = decodeURIComponent(params.lodge as string);

  // Helper function to create URL-friendly slugs
  const createSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // Get actual lodge data
  const lodgeData = useMemo(() => {
    if (!region || !park) return null;
    const regionData = lodgesData[region as keyof typeof lodgesData];
    if (!regionData) return null;
    const parkData = regionData[park];
    if (!parkData) return null;
    
    // Find lodge by matching slug
    return parkData.lodges.find(lodge => createSlug(lodge.name) === lodgeSlug);
  }, [region, park, lodgeSlug]);

  // Amenity icon mapping
  const amenityIcons: { [key: string]: { icon: React.ReactNode; label: string } } = {
    'WiFi': { icon: <Wifi size={16} />, label: 'WiFi' },
    'Pool': { icon: <Waves size={16} />, label: 'Pool' },
    'Spa': { icon: <Droplet size={16} />, label: 'Spa' },
    'Safari': { icon: <Car size={16} />, label: 'Gate Pick-up' },
    'Gym': { icon: <Dumbbell size={16} />, label: 'Gym' },
    'AC': { icon: <Wind size={16} />, label: 'AC' },
    'Bonfire': { icon: <Flame size={16} />, label: 'Bonfire' },
    'Library': { icon: <Book size={16} />, label: 'Library' },
    'Bar': { icon: <Wine size={16} />, label: 'Bar' },
  };

  // Room amenity icon mapping
  const roomAmenityIcons: { [key: string]: React.ReactNode } = {
    'King Bed': <Bed size={14} />,
    'Queen Bed': <Bed size={14} />,
    'Twin Bed': <Bed size={14} />,
    'AC': <Wind size={14} />,
    'WiFi': <Wifi size={14} />,
    'Mini Bar': <Wine size={14} />,
    'Bathtub': <Bath size={14} />,
    'TV': <Tv size={14} />,
    'Coffee Maker': <Coffee size={14} />,
    'Room Service': <Utensils size={14} />,
    'Safe': <Shield size={14} />,
    'Private Deck': <Sparkles size={14} />,
    'Plunge Pool': <Waves size={14} />,
    'Butler Service': <Sparkles size={14} />,
  };

  // Sample data - must be declared before using in functions
  const hotelImages = [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200",
    "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200",
    "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200",
    "https://images.unsplash.com/photo-1615460549969-36fa19521a4f?w=1200",
    "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=1200",
  ];

  const [selectedImage, setSelectedImage] = useState(0);
  const [mobileHeroIndex, setMobileHeroIndex] = useState(0);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentGalleryImage, setCurrentGalleryImage] = useState(0);
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [selectedRoomDetails, setSelectedRoomDetails] = useState<any | null>(null);
  const [currentModalImage, setCurrentModalImage] = useState(0);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [checkoutCheckIn, setCheckoutCheckIn] = useState('');
  const [checkoutCheckOut, setCheckoutCheckOut] = useState('');
  const [checkoutAdults, setCheckoutAdults] = useState(2);
  const [checkoutChildren, setCheckoutChildren] = useState(0);
  const [checkoutRoomType, setCheckoutRoomType] = useState<string>('');
  const [naturalistSessions, setNaturalistSessions] = useState(0);
  const [sessionAllocations, setSessionAllocations] = useState<{[date: string]: number}>({});
  const [selectedNaturalist, setSelectedNaturalist] = useState<string>('');

  const handleMobileHeroPrev = () => {
    setMobileHeroIndex(prev => 
      prev === 0 ? (lodgeData?.images || hotelImages).length - 1 : prev - 1
    );
  };

  const handleMobileHeroNext = () => {
    setMobileHeroIndex(prev => 
      prev === (lodgeData?.images || hotelImages).length - 1 ? 0 : prev + 1
    );
  };

  const getVisibleDots = () => {
    const totalImages = (lodgeData?.images || hotelImages).length;
    if (totalImages <= 3) {
      return Array.from({ length: totalImages }, (_, i) => i);
    }
    
    if (mobileHeroIndex === 0) return [0, 1, 2];
    if (mobileHeroIndex === totalImages - 1) return [totalImages - 3, totalImages - 2, totalImages - 1];
    return [mobileHeroIndex - 1, mobileHeroIndex, mobileHeroIndex + 1];
  };

  const visibleDots = getVisibleDots();
  const totalImages = (lodgeData?.images || hotelImages).length;

  // Get dates between check-in and check-out
  const getStayDates = () => {
    if (!checkoutCheckIn || !checkoutCheckOut) return [];
    const dates = [];
    const start = new Date(checkoutCheckIn);
    const end = new Date(checkoutCheckOut);
    const current = new Date(start);
    
    while (current < end) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  const formatDateForDisplay = (date: Date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
  };

  const formatDateRange = (start: string, end: string) => {
    if (!start || !end) return '';
    const startDate = new Date(start);
    const endDate = new Date(end);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[startDate.getMonth()]} ${startDate.getDate()} — ${months[endDate.getMonth()]} ${endDate.getDate()}`;
  };

  const calculateNights = () => {
    if (!checkoutCheckIn || !checkoutCheckOut) return 0;
    const start = new Date(checkoutCheckIn);
    const end = new Date(checkoutCheckOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleSessionAllocation = (dateStr: string, increment: number) => {
    const currentAllocation = sessionAllocations[dateStr] || 0;
    const newAllocation = currentAllocation + increment;
    
    // Check constraints
    if (newAllocation < 0 || newAllocation > 2) return;
    
    const totalAllocated = Object.values(sessionAllocations).reduce((sum, val) => sum + val, 0);
    if (increment > 0 && totalAllocated >= naturalistSessions) return;
    
    setSessionAllocations(prev => ({
      ...prev,
      [dateStr]: newAllocation
    }));
  };

  const getTotalAllocated = () => {
    return Object.values(sessionAllocations).reduce((sum, val) => sum + val, 0);
  };

  const calculateRoomTotal = () => {
    if (!checkoutRoomType) return 0;
    const room = lodgeData?.roomTypes?.find(r => r.name === checkoutRoomType);
    if (!room) return 0;
    const nights = calculateNights();
    return room.price * nights;
  };

  const calculateExperienceTotal = () => {
    if (!selectedNaturalist || naturalistSessions === 0) return 0;
    const naturalist = lodgeData?.naturalists?.find((n: any) => n.name === selectedNaturalist);
    if (!naturalist) return 0;
    return naturalist.price * naturalistSessions;
  };

  const calculateTaxes = () => {
    const subtotal = calculateRoomTotal() + calculateExperienceTotal();
    return Math.round(subtotal * 0.18);
  };

  const calculateTotal = () => {
    return calculateRoomTotal() + calculateExperienceTotal() + calculateTaxes();
  };

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isCheckoutModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isCheckoutModalOpen]);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const handleShare = async () => {
    const shareData = {
      title: lodgeData?.name || 'Lodge',
      text: `Check out ${lodgeData?.name || 'this amazing lodge'} at ${lodgeData?.location || 'a beautiful location'}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.log('Error sharing:', err);
    }
  };

  return (
    <>
      <Header forceVisible={true} forceScrolled={true} />
      
      <main className={styles.main}>
        {/* Hero Section with Images */}
        <section className={styles.heroSection}>
          <div className={styles.heroContainer}>
            <div className={styles.imageGallery}>
              {/* Desktop Images */}
              <div 
                className={`${styles.mainImageWrapper} ${styles.desktopOnly}`}
                onClick={() => {
                  setCurrentGalleryImage(0);
                  setIsGalleryOpen(true);
                }}
              >
                <img src={lodgeData?.images[0] || hotelImages[0]} alt={lodgeData?.name || 'Lodge'} className={styles.mainImage} />
              </div>
              
              <div 
                className={`${styles.sideImageWrapper} ${styles.desktopOnly}`}
                onClick={() => {
                  setCurrentGalleryImage(1);
                  setIsGalleryOpen(true);
                }}
              >
                <img src={(lodgeData?.images || hotelImages)[1]} alt="View 2" className={styles.sideImage} />
              </div>
              
              <div 
                className={`${styles.sideImageWrapper} ${styles.desktopOnly}`}
                onClick={() => {
                  setCurrentGalleryImage(2);
                  setIsGalleryOpen(true);
                }}
              >
                <img src={(lodgeData?.images || hotelImages)[2]} alt="View 3" className={styles.sideImage} />
                <div className={styles.viewGalleryButton}>
                  <div className={styles.galleryNumber}>+{(lodgeData?.images || hotelImages).length - 3}</div>
                  <div className={styles.galleryText}>More</div>
                </div>
              </div>

              {/* Mobile Carousel */}
              <div className={styles.mobileCarousel}>
                <div 
                  className={styles.mobileCarouselImage}
                  onClick={() => {
                    setCurrentGalleryImage(mobileHeroIndex);
                    setIsGalleryOpen(true);
                  }}
                >
                  <img 
                    src={(lodgeData?.images || hotelImages)[mobileHeroIndex]} 
                    alt={`View ${mobileHeroIndex + 1}`} 
                    className={styles.carouselImage} 
                  />
                  
                  {/* Navigation Arrows */}
                  <button 
                    className={styles.carouselPrev}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMobileHeroPrev();
                    }}
                    aria-label="Previous image"
                  >
                    ‹
                  </button>
                  
                  <button 
                    className={styles.carouselNext}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMobileHeroNext();
                    }}
                    aria-label="Next image"
                  >
                    ›
                  </button>
                  
                  {/* Pagination Dots */}
                  <div className={styles.carouselDots}>
                    {visibleDots.map((dotIndex) => (
                      <button
                        key={dotIndex}
                        className={`${styles.carouselDot} ${dotIndex === mobileHeroIndex ? styles.activeDot : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setMobileHeroIndex(dotIndex);
                        }}
                        aria-label={`Go to image ${dotIndex + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className={styles.contentWrapper}>
          <div className={styles.mainContent}>
            {/* Hotel Info */}
            <section className={styles.hotelInfo}>
              <div className={styles.hotelHeader}>
                <div>
                  <h1 className={styles.hotelTitle}>{lodgeData?.name || 'Lodge Name'}</h1>
                  <div className={styles.hotelLocation}>
                    <MapPin size={16} />
                    <span>{lodgeData?.location || 'Location'}</span>
                  </div>
                </div>
                <div className={styles.headerActions}>
                  {lodgeData?.ecoCertified && (
                    <div className={styles.ecoBadge}>
                      <Leaf size={16} />
                      <span>Eco-Certified</span>
                    </div>
                  )}
                  <button className={styles.shareButton} onClick={handleShare}>
                    <Share size={20} />
                  </button>
                </div>
              </div>

              {lodgeData?.amenities && lodgeData.amenities.length > 0 && (
                <div className={styles.amenitiesRow}>
                  {lodgeData.amenities.slice(0, 5).map((amenity, index) => (
                    <div key={index} className={styles.amenityBadge}>
                      {amenityIcons[amenity] ? (
                        <>
                          {amenityIcons[amenity].icon}
                          <span>{amenityIcons[amenity].label}</span>
                        </>
                      ) : (
                        <span>{amenity}</span>
                      )}
                    </div>
                  ))}
                  {lodgeData.amenities.length > 5 && (
                    <div className={styles.amenityCount}>+{lodgeData.amenities.length - 5}</div>
                  )}
                </div>
              )}

              <div className={styles.description}>
                <h2>About this Lodge</h2>
                {lodgeData?.about?.description ? (
                  lodgeData.about.description.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))
                ) : (
                  <>
                    <p>
                      Experience luxury in the heart of the wilderness at {lodgeData?.name || 'this lodge'}. Our resort offers an unparalleled blend of comfort and adventure, 
                      situated just minutes from the park entrance. With stunning views of the surrounding forest and world-class amenities, 
                      your stay promises to be memorable.
                    </p>
                    <p>
                      Each room is thoughtfully designed to provide maximum comfort while maintaining harmony with nature. 
                      Wake up to the sounds of the jungle and enjoy breakfast on your private deck as you spot wildlife from your room.
                    </p>
                  </>
                )}
              </div>
            </section>

            {/* Junglore Story */}
            <section className={styles.jungloreStory}>
              <h2 style={{ color: '#F1663F' }}>The Junglore Story</h2>
              <div className={styles.storyContent}>
                <p>
                  After extensive research and personal visits, we selected {lodgeData?.name || 'this lodge'} for its exceptional commitment to conservation and 
                  authentic wildlife experiences. The lodge&apos;s experienced naturalists and prime location near prime tiger territories 
                  make it an ideal base for serious wildlife enthusiasts.
                </p>
                <p>
                  What sets this property apart is their dedication to sustainable tourism. They work closely with local communities, 
                  employ eco-friendly practices, and contribute significantly to conservation efforts in the region. Their guides are 
                  among the best we&apos;ve encountered, with deep knowledge of animal behavior and tracking skills honed over decades.
                </p>
              </div>
            </section>

            {/* Room Types */}
            <section className={styles.roomsSection}>
              <h2>Accomodation</h2>
              <div className={styles.roomsGrid}>
                {(lodgeData?.roomTypes || []).map((room) => (
                  <div 
                    key={room.id} 
                    className={styles.roomCard}
                  >
                    <img src={room.image} alt={room.name} className={styles.roomImage} />
                    <div className={styles.roomOverlay}>
                      <h3>{room.name}</h3>
                      <p className={styles.roomDescription}>{room.description}</p>
                      <div className={styles.roomPriceRow}>
                        <div className={styles.roomPrice}>
                          <span className={styles.priceLabel}>From</span>
                          <span className={styles.priceAmount}>₹{room.price.toLocaleString()}</span>
                          <span className={styles.priceNight}>/ night</span>
                        </div>
                        <button 
                          className={styles.knowMoreLink}
                          onClick={() => {
                            setSelectedRoomDetails(room);
                            setCurrentModalImage(0);
                            setRoomModalOpen(true);
                          }}
                        >
                          Room Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Naturalists Section */}
            <section className={styles.naturalistsSection}>
              <div className={styles.naturalistHeader}>
                <div>
                  <h2>Expert Guides</h2>
                  <p className={styles.sectionSubtitle}>Enhance your safari with our resident experts. Book a private session with them during checkout</p>
                </div>
              </div>
              <div className={styles.naturalistsGrid}>
                {(lodgeData?.naturalists || []).map((naturalist) => (
                  <div 
                    key={naturalist.id}
                    className={styles.naturalistCard}
                  >
                    <div className={styles.naturalistImageCircle}>
                      <img src={naturalist.image} alt={naturalist.name} />
                    </div>
                    <h3>{naturalist.name}</h3>
                    <p className={styles.naturalistRole}>{naturalist.role}</p>
                    <p className={styles.naturalistSpecialty}>{naturalist.specialty}</p>
                    <div className={styles.naturalistPrice}>
                      <span className={styles.priceAmount}>₹{naturalist.price}</span>
                      <span className={styles.priceSession}>/Session</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Junglore Expedition Ad */}
            <section className={styles.expeditionAd}>
              <div className={styles.expeditionLeft}>
                <div className={styles.expeditionBadge}>ALL-IN-ONE PACKAGE</div>
                <h2>Junglore Expedition</h2>
                <p>
                  Don&apos;t just stay, explore. Our curated expedition includes accommodation, all meals, safaris, and more.
                </p>
                <div className={styles.expeditionFeatures}>
                  <div className={styles.expeditionFeature}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <span>Accommodation</span>
                  </div>
                  <div className={styles.expeditionFeature}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <span>All Meals Included</span>
                  </div>
                  <div className={styles.expeditionFeature}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <span>Safaris</span>
                  </div>
                </div>
                <button className={styles.expeditionButton}>
                  Know More
                </button>
              </div>
              <div className={styles.expeditionRight}>
                <img src="https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800" alt="Wildlife Expedition" className={styles.expeditionImage} />
              </div>
            </section>

            {/* Bank Offers */}
            <section className={styles.bankOffers}>
              <h2>Bank Offers</h2>
              <div className={styles.offersGrid}>
                <div className={styles.offerCard}>
                  <div className={styles.offerBadge}>T&C&apos;S APPLY</div>
                  <div className={styles.offerCardContent}>
                    <div className={styles.offerLeft}>
                      <img src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=200" alt="Premium Upgrade" className={styles.offerImage} />
                    </div>
                    <div className={styles.offerRight}>
                      <h3>10% Off with HDFC Bank</h3>
                      <p>Get instant 10% discount on bookings above ₹20,000 with HDFC Credit Cards</p>
                      {/* <button className={styles.offerButton}>BOOK NOW</button> */}
                    </div>
                  </div>
                </div>
                <div className={styles.offerCard}>
                  <div className={styles.offerBadge}>T&C&apos;S APPLY</div>
                  <div className={styles.offerCardContent}>
                    <div className={styles.offerLeft}>
                      <img src="https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=200" alt="Bank Offer" className={styles.offerImage} />
                    </div>
                    <div className={styles.offerRight}>
                      <h3>15% Off with SBI Cards</h3>
                      <p>Save 15% on your stay with SBI Credit/Debit Cards. Maximum discount ₹5,000</p>
                      {/* <button className={styles.offerButton}>EXPLORE NOW</button> */}
                    </div>
                  </div>
                </div>
                <div className={styles.offerCard}>
                  <div className={styles.offerBadge}>T&C&apos;S APPLY</div>
                  <div className={styles.offerCardContent}>
                    <div className={styles.offerLeft}>
                      <img src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=200" alt="Travel Benefits" className={styles.offerImage} />
                    </div>
                    <div className={styles.offerRight}>
                      <h3>EMI Options Available</h3>
                      <p>Convert your booking to No Cost EMI for 3, 6, or 9 months with select banks</p>
                      {/* <button className={styles.offerButton}>REGISTER NOW</button> */}
                    </div>
                  </div>
                </div>
                <div className={styles.offerCard}>
                  <div className={styles.offerBadge}>T&C&apos;S APPLY</div>
                  <div className={styles.offerCardContent}>
                    <div className={styles.offerLeft}>
                      <img src="https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=200" alt="Corporate Benefits" className={styles.offerImage} />
                    </div>
                    <div className={styles.offerRight}>
                      <h3>Friday: Up to 15% OFF* on Dom. Flights & Hotels</h3>
                      <p>Valid on ICICI Bank Business Credit Cards.</p>
                      {/* <button className={styles.offerButton}>BOOK NOW</button> */}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* FAQs */}
            <section className={styles.faqSection}>
              <h2>FAQs</h2>
              <div className={styles.faqList}>
                {(lodgeData?.faqs || []).map((faq, index) => (
                  <div key={index} className={styles.faqItem}>
                    <div className={styles.faqQuestion} onClick={() => toggleFaq(index)}>
                      <h3>{faq.question}</h3>
                      <span className={`${styles.faqIcon} ${openFaqIndex === index ? styles.open : ''}`}>+</span>
                    </div>
                    {openFaqIndex === index && (
                      <div className={styles.faqAnswer}>
                        <p>{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* Room Details Modal */}
        {roomModalOpen && selectedRoomDetails && (
          <div className={styles.roomModal} onClick={() => setRoomModalOpen(false)}>
            <div className={styles.roomModalContent} onClick={(e) => e.stopPropagation()}>
              <button className={styles.closeModal} onClick={() => setRoomModalOpen(false)}>
                ×
              </button>
              <div className={styles.roomModalHeader}>
                <img 
                  src={(lodgeData?.images || [])[currentModalImage] || selectedRoomDetails.image} 
                  alt={selectedRoomDetails.name} 
                  className={styles.roomModalImage} 
                />
                <button 
                  className={styles.modalImagePrev}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentModalImage(prev => 
                      prev === 0 ? (lodgeData?.images || []).length - 1 : prev - 1
                    );
                  }}
                >
                  ‹
                </button>
                <button 
                  className={styles.modalImageNext}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentModalImage(prev => 
                      prev === (lodgeData?.images || []).length - 1 ? 0 : prev + 1
                    );
                  }}
                >
                  ›
                </button>
                <div className={styles.modalImageCounter}>
                  {currentModalImage + 1} / {(lodgeData?.images || []).length}
                </div>
              </div>
              <div className={styles.roomModalInfo}>
                <h2>{selectedRoomDetails.name}</h2>
                <p className={styles.roomModalDescription}>{selectedRoomDetails.description}</p>
                <div className={styles.modalPrice}>
                  <span className={styles.priceLabel}>From</span>
                  <span className={styles.priceAmount}>₹{selectedRoomDetails.price.toLocaleString()}</span>
                  <span className={styles.priceNight}>/ night</span>
                </div>
              </div>
              <div className={styles.roomModalBody}>
                <div className={styles.modalSection}>
                  <h3>Amenities</h3>
                  <div className={styles.modalAmenities}>
                    {selectedRoomDetails.amenities.map((amenity: string, index: number) => (
                      <div key={index} className={styles.modalAmenityItem}>
                        {roomAmenityIcons[amenity] || null}
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className={styles.modalSection}>
                  <h3>Inclusions</h3>
                  <ul className={styles.modalList}>
                    <li>Daily breakfast for all guests</li>
                    <li>Complimentary Wi-Fi access</li>
                    <li>Welcome drink on arrival</li>
                    <li>Daily housekeeping service</li>
                    <li>Access to hotel facilities</li>
                    <li>Taxes and service charges</li>
                  </ul>
                </div>
                <div className={styles.modalSection}>
                  <h3>Exclusions</h3>
                  <ul className={styles.modalList}>
                    <li>Safari/game drive charges</li>
                    <li>Lunch and dinner (available on request)</li>
                    <li>Personal expenses and tips</li>
                    <li>Alcoholic beverages</li>
                    <li>Spa and wellness treatments</li>
                    <li>Transportation to/from the lodge</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Gallery Modal */}
        {isGalleryOpen && (
          <div className={styles.galleryModal} onClick={() => setIsGalleryOpen(false)}>
            <button className={styles.closeGallery} onClick={() => setIsGalleryOpen(false)}>
              ×
            </button>
            <button 
              className={styles.galleryPrev} 
              onClick={(e) => {
                e.stopPropagation();
                setCurrentGalleryImage(prev => prev === 0 ? (lodgeData?.images || hotelImages).length - 1 : prev - 1);
              }}
            >
              ‹
            </button>
            <div className={styles.galleryContent} onClick={(e) => e.stopPropagation()}>
              <img 
                src={(lodgeData?.images || hotelImages)[currentGalleryImage]} 
                alt={`Gallery ${currentGalleryImage + 1}`}
                className={styles.galleryImage}
              />
              <div className={styles.galleryCounter}>
                {currentGalleryImage + 1} / {(lodgeData?.images || hotelImages).length}
              </div>
            </div>
            <button 
              className={styles.galleryNext} 
              onClick={(e) => {
                e.stopPropagation();
                setCurrentGalleryImage(prev => prev === (lodgeData?.images || hotelImages).length - 1 ? 0 : prev + 1);
              }}
            >
              ›
            </button>
          </div>
        )}

        {/* Floating Bottom Button */}
        <div className={styles.floatingButton} onClick={() => setIsCheckoutModalOpen(true)}>
          <div className={styles.floatingButtonContent}>
            <div className={styles.floatingButtonLeft}>
              <div className={styles.floatingPrice}>From ₹{lodgeData?.roomTypes?.[0]?.price?.toLocaleString() || '9,000'}/night</div>
              <div className={styles.floatingButtonText}>Check Availability</div>
            </div>
            <button className={styles.floatingButtonIcon}>
              <Calendar size={24} />
            </button>
          </div>
        </div>

        {/* Checkout Modal */}
        {isCheckoutModalOpen && (
          <div className={styles.checkoutModal} onClick={() => setIsCheckoutModalOpen(false)}>
            <div className={styles.checkoutModalContent} onClick={(e) => e.stopPropagation()}>
              {/* Left Panel - Reservation Summary */}
              <div className={styles.checkoutLeft}>
                <div className={styles.checkoutImage}>
                  <img src={lodgeData?.images?.[0] || hotelImages[0]} alt={lodgeData?.name || 'Lodge'} />
                </div>
                <div className={styles.checkoutSummary}>
                  <div className={styles.checkoutLabel}>YOUR RESERVATION</div>
                  <h2 className={styles.checkoutLodgeName}>{lodgeData?.name || 'The Lodge'}</h2>
                  <div className={styles.checkoutLocation}>
                    <MapPin size={14} />
                    {lodgeData?.location || 'Location'}
                  </div>

                  {checkoutCheckIn && checkoutCheckOut && (
                    <div className={styles.checkoutDates}>
                      <div className={styles.checkoutDatesLabel}>DATES</div>
                      <div className={styles.checkoutDatesValue}>{formatDateRange(checkoutCheckIn, checkoutCheckOut)}</div>
                      <div className={styles.checkoutNights}>{calculateNights()} Nights</div>
                    </div>
                  )}

                  <div className={styles.checkoutPricing}>
                    {checkoutRoomType && (
                      <div className={styles.checkoutPriceRow}>
                        <span>Room Total</span>
                        <span>₹{calculateRoomTotal().toLocaleString()}</span>
                      </div>
                    )}
                    {selectedNaturalist && naturalistSessions > 0 && (
                      <div className={styles.checkoutPriceRow}>
                        <span>Experiences</span>
                        <span>₹{calculateExperienceTotal().toLocaleString()}</span>
                      </div>
                    )}
                    {(checkoutRoomType || (selectedNaturalist && naturalistSessions > 0)) && (
                      <div className={styles.checkoutPriceRow}>
                        <span>Taxes (18%)</span>
                        <span>₹{calculateTaxes().toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  {(checkoutRoomType || (selectedNaturalist && naturalistSessions > 0)) && (
                    <div className={styles.checkoutTotal}>
                      <div className={styles.checkoutTotalLabel}>Total Payble</div>
                      <div className={styles.checkoutTotalAmount}>₹{calculateTotal().toLocaleString()}</div>
                      <div className={styles.checkoutTotalNote}>*Includes all taxes & fees</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Panel - Form */}
              <div className={styles.checkoutRight}>
                <button className={styles.checkoutClose} onClick={() => setIsCheckoutModalOpen(false)}>×</button>
                <h2 className={styles.checkoutTitle}>Configure Your Stay</h2>

                {/* Section 1: Dates & Guests */}
                <div className={styles.checkoutSection}>
                  <div className={styles.checkoutSectionHeader}>
                    <span className={styles.checkoutSectionNumber}>1</span>
                    <h3>DATES & GUESTS</h3>
                  </div>
                  
                  <div className={styles.checkoutDateInputs}>
                    <div className={styles.checkoutInputGroup}>
                      <label>CHECK-IN</label>
                      <input 
                        type="date" 
                        value={checkoutCheckIn}
                        onChange={(e) => {
                          setCheckoutCheckIn(e.target.value);
                          setSessionAllocations({});
                        }}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div className={styles.checkoutInputGroup}>
                      <label>CHECK-OUT</label>
                      <input 
                        type="date" 
                        value={checkoutCheckOut}
                        onChange={(e) => {
                          setCheckoutCheckOut(e.target.value);
                          setSessionAllocations({});
                        }}
                        min={checkoutCheckIn || new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>

                  <div className={styles.checkoutGuestCounters}>
                    <div className={styles.checkoutCounter}>
                      <div className={styles.checkoutCounterInfo}>
                        <div className={styles.checkoutCounterIcon}><User size={20} /></div>
                        <div>
                          <div className={styles.checkoutCounterLabel}>Adults</div>
                          <div className={styles.checkoutCounterAge}>Age 12+</div>
                        </div>
                      </div>
                      <div className={styles.checkoutCounterControls}>
                        <button onClick={() => setCheckoutAdults(Math.max(1, checkoutAdults - 1))}>-</button>
                        <span>{checkoutAdults}</span>
                        <button onClick={() => setCheckoutAdults(checkoutAdults + 1)}>+</button>
                      </div>
                    </div>

                    <div className={styles.checkoutCounter}>
                      <div className={styles.checkoutCounterInfo}>
                        <div className={styles.checkoutCounterIcon}><Baby size={20} /></div>
                        <div>
                          <div className={styles.checkoutCounterLabel}>Children</div>
                          <div className={styles.checkoutCounterAge}>Age 2-12</div>
                        </div>
                      </div>
                      <div className={styles.checkoutCounterControls}>
                        <button onClick={() => setCheckoutChildren(Math.max(0, checkoutChildren - 1))}>-</button>
                        <span>{checkoutChildren}</span>
                        <button onClick={() => setCheckoutChildren(checkoutChildren + 1)}>+</button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: Accommodation */}
                <div className={styles.checkoutSection}>
                  <div className={styles.checkoutSectionHeader}>
                    <span className={styles.checkoutSectionNumber}>2</span>
                    <h3>ACCOMMODATION</h3>
                  </div>

                  <div className={styles.checkoutRoomSelection}>
                    {lodgeData?.roomTypes?.map((room: any, index: number) => (
                      <div 
                        key={index}
                        className={`${styles.checkoutRoomOption} ${checkoutRoomType === room.name ? styles.checkoutRoomSelected : ''}`}
                        onClick={() => setCheckoutRoomType(room.name)}
                      >
                        <div className={styles.checkoutRoomIcon}><Bed size={20} /></div>
                        <div className={styles.checkoutRoomInfo}>
                          <div className={styles.checkoutRoomName}>{room.name}</div>
                          <div className={styles.checkoutRoomPrice}>₹{room.price?.toLocaleString()}/night</div>
                        </div>
                        <div className={styles.checkoutRoomRadio}>
                          {checkoutRoomType === room.name && <div className={styles.checkoutRoomRadioChecked}></div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 3: Experiences */}
                <div className={styles.checkoutSection}>
                  <div className={styles.checkoutSectionHeader}>
                    <span className={styles.checkoutSectionNumber}>3</span>
                    <h3>EXPERIENCES</h3>
                    <span className={styles.checkoutOptional}>OPTIONAL</span>
                  </div>

                  <div className={styles.checkoutInputGroup}>
                    <label>SELECT NATURALIST</label>
                    <select 
                      value={selectedNaturalist}
                      onChange={(e) => {
                        setSelectedNaturalist(e.target.value);
                        setNaturalistSessions(0);
                        setSessionAllocations({});
                      }}
                    >
                      <option value="">Choose a naturalist</option>
                      {lodgeData?.naturalists?.map((naturalist: any, index: number) => (
                        <option key={index} value={naturalist.name}>
                          {naturalist.name} ({naturalist.specialty}) - ₹{naturalist.price?.toLocaleString()}/session
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedNaturalist && (
                    <>
                      <div className={styles.checkoutSessionCounter}>
                        <label>HOW MANY SESSIONS?</label>
                        <div className={styles.checkoutCounterControls}>
                          <button onClick={() => {
                            setNaturalistSessions(Math.max(0, naturalistSessions - 1));
                            setSessionAllocations({});
                          }}>-</button>
                          <span>{naturalistSessions}</span>
                          <button onClick={() => {
                            setNaturalistSessions(naturalistSessions + 1);
                            setSessionAllocations({});
                          }}>+</button>
                        </div>
                      </div>

                      {naturalistSessions > 0 && checkoutCheckIn && checkoutCheckOut && (
                        <div className={styles.checkoutSchedule}>
                          <div className={styles.checkoutScheduleHeader}>
                            <label>SCHEDULE DATES</label>
                            <span className={styles.checkoutAllocated}>
                              Allocated: {getTotalAllocated()}/{naturalistSessions}
                            </span>
                          </div>
                          
                          {(() => {
                            const dates = [];
                            const start = new Date(checkoutCheckIn);
                            const end = new Date(checkoutCheckOut);
                            const current = new Date(start);
                            
                            while (current < end) {
                              dates.push(new Date(current));
                              current.setDate(current.getDate() + 1);
                            }
                            
                            return dates.map((date, index) => {
                              const dateStr = date.toISOString().split('T')[0];
                              const allocated = sessionAllocations[dateStr] || 0;
                              
                              return (
                                <div key={index} className={styles.checkoutDateSlot}>
                                  <div className={styles.checkoutDateLabel}>{formatDateForDisplay(date)}</div>
                                  <div className={styles.checkoutCounterControls}>
                                    <button 
                                      onClick={() => handleSessionAllocation(dateStr, -1)}
                                      disabled={allocated === 0}
                                    >-</button>
                                    <span>{allocated}</span>
                                    <button 
                                      onClick={() => handleSessionAllocation(dateStr, 1)}
                                      disabled={allocated >= 2 || getTotalAllocated() >= naturalistSessions}
                                    >+</button>
                                  </div>
                                </div>
                              );
                            });
                          })()}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Complete Reservation Button */}
                <button 
                  className={styles.checkoutCompleteBtn}
                  disabled={!checkoutCheckIn || !checkoutCheckOut || !checkoutRoomType || (naturalistSessions > 0 && getTotalAllocated() < naturalistSessions)}
                >
                  Complete Reservation →
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </>
  );
}
