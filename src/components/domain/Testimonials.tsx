'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import styles from './Testimonials.module.css'

interface Testimonial {
  id: number
  name: string
  company: string
  text: string
  image: string
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Leslie Alexander',
    company: 'The Walt Disney Company',
    text: 'Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet.',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop'
  },
  {
    id: 2,
    name: 'Sarah Mitchell',
    company: 'National Geographic',
    text: 'The experience was absolutely transformative. Every detail was carefully curated, and the connection with nature was profound. Junglore truly understands what travelers seek.',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop'
  },
  {
    id: 3,
    name: 'Michael Chen',
    company: 'Wildlife Conservation Society',
    text: 'Outstanding service and attention to sustainable tourism. The lodges are perfectly integrated into their environments, and the wildlife experiences exceeded all expectations.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop'
  },
  {
    id: 4,
    name: 'Emma Rodriguez',
    company: 'Adventure Travel Trade',
    text: 'From booking to departure, everything was seamless. The guides were knowledgeable, the accommodations luxurious yet eco-conscious. A perfect blend of adventure and comfort.',
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&h=200&fit=crop'
  },
  {
    id: 5,
    name: 'James Patterson',
    company: 'Travel + Leisure',
    text: 'Junglore has redefined wildlife tourism. The curated experiences are unmatched, and every moment felt special. This is how nature travel should be done.',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop'
  }
]

const decorativeImages = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1521119989659-a83eee488004?w=200&h=200&fit=crop'
]

export default function Testimonials() {
  const { t } = useTranslation()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length)
        setIsAnimating(false)
      }, 500)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const currentTestimonial = testimonials[currentIndex]

  return (
    <section className="py-20 px-8 bg-white relative overflow-hidden">
      <div className="max-w-[1400px] mx-auto relative">
        {/* Header */}
        <div className="text-center mb-16 relative z-10">
          <p className="text-[#F1663F] text-sm md:text-base font-semibold uppercase tracking-wider mb-3">
            {t('testimonials.label')}
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-[#1E2D27]">
            {t('testimonials.heading')}
          </h2>
        </div>

        {/* Main Testimonial */}
        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Large Profile Image */}
          <div className={`${styles.mainProfile} ${isAnimating ? styles.animating : ''}`}>
            <div className={styles.mainProfileInner}>
              <img 
                src={currentTestimonial.image} 
                alt={currentTestimonial.name}
              />
            </div>
          </div>

          {/* Testimonial Content */}
          <div className={`${styles.testimonialContent} ${isAnimating ? styles.fadeOut : styles.fadeIn}`}>
            {/* Testimonial Text */}
            <p className="text-lg md:text-xl text-[#6B7B75] leading-relaxed mb-8 max-w-3xl mx-auto">
              {currentTestimonial.text}
            </p>

            {/* Author Info */}
            <div>
              <h4 className="text-xl font-bold text-[#1E2D27] mb-1">
                {currentTestimonial.name}
              </h4>
              <p className="text-[#6B7B75] text-sm">
                {currentTestimonial.company}
              </p>
            </div>
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center gap-3 mt-12">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setIsAnimating(true)
                  setTimeout(() => {
                    setCurrentIndex(index)
                    setIsAnimating(false)
                  }, 300)
                }}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'bg-[#1E2D27] w-8' 
                    : 'bg-[#6B7B75]/30 hover:bg-[#6B7B75]/50'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
