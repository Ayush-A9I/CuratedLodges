'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { LoadingState } from '@/components/feedback'
import { shouldRenderTestimonials, resolveTestimonialImage } from '@/logic/predicates'
import type { Testimonial } from '@/types/api'
import api from '@/lib/api'
import styles from './Testimonials.module.css'

// Placeholder used when a testimonial has no image (Req 11.6).
const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop'

interface TestimonialsProps {
  /**
   * Testimonials supplied by the homepage bundle (`getHomepage().testimonials`).
   * When omitted, the component fetches its own data via `getTestimonials()`.
   */
  testimonials?: Testimonial[]
}

export default function Testimonials({ testimonials: propTestimonials }: TestimonialsProps) {
  const { t } = useTranslation()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  // Self-fetch state — only used when the homepage does not provide testimonials.
  const shouldSelfFetch = propTestimonials === undefined
  const [fetched, setFetched] = useState<Testimonial[] | null>(null)
  const [isLoading, setIsLoading] = useState(shouldSelfFetch)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    if (!shouldSelfFetch) return
    let active = true
    setIsLoading(true)
    setHasError(false)
    api
      .getTestimonials()
      .then((data: { testimonials: Testimonial[] }) => {
        if (!active) return
        setFetched(data?.testimonials ?? [])
      })
      .catch(() => {
        if (active) setHasError(true)
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => {
      active = false
    }
  }, [shouldSelfFetch])

  const testimonials = shouldSelfFetch ? fetched : propTestimonials

  // Auto-rotation — guarded so it is a no-op when there is no data.
  useEffect(() => {
    if (!testimonials || testimonials.length === 0) return
    const interval = setInterval(() => {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length)
        setIsAnimating(false)
      }, 500)
    }, 5000)

    return () => clearInterval(interval)
  }, [testimonials])

  // While self-fetching, show a themed loading state without disturbing the rest
  // of the homepage layout.
  if (shouldSelfFetch && isLoading) {
    return (
      <section className="py-20 px-8 bg-white relative overflow-hidden">
        <div className="max-w-[1400px] mx-auto relative">
          <LoadingState />
        </div>
      </section>
    )
  }

  // Omit the section entirely on error or empty list (Req 11.4, 11.5).
  if (!shouldRenderTestimonials(hasError, testimonials)) {
    return null
  }

  // `shouldRenderTestimonials` guarantees a non-empty array here.
  const list = testimonials as Testimonial[]
  const safeIndex = currentIndex % list.length
  const currentTestimonial = list[safeIndex]
  const testimonialImage = resolveTestimonialImage(currentTestimonial, PLACEHOLDER_IMAGE)

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
                src={testimonialImage}
                alt={currentTestimonial.name}
              />
            </div>
          </div>

          {/* Testimonial Content */}
          <div className={`${styles.testimonialContent} ${isAnimating ? styles.fadeOut : styles.fadeIn}`}>
            <p className="text-lg md:text-xl text-[#6B7B75] leading-relaxed mb-8 max-w-3xl mx-auto">
              {currentTestimonial.text}
            </p>

            <div>
              <h4 className="text-xl font-bold text-[#1E2D27] mb-1">
                {currentTestimonial.name}
              </h4>
              {currentTestimonial.company && (
                <p className="text-[#6B7B75] text-sm">
                  {currentTestimonial.company}
                </p>
              )}
            </div>
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center gap-3 mt-12">
            {list.map((_: Testimonial, index: number) => (
              <button
                key={index}
                onClick={() => {
                  setIsAnimating(true)
                  setTimeout(() => {
                    setCurrentIndex(index)
                    setIsAnimating(false)
                  }, 300)
                }}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${index === safeIndex
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
