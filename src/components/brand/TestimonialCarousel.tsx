'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface Testimonial {
  name: string
  role: string
  quote: string
  image?: string
}

interface TestimonialCarouselProps {
  testimonials: Testimonial[]
  className?: string
}

export function TestimonialCarousel({ testimonials, className = '' }: TestimonialCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  return (
    <div className={className}>
      <div className="relative overflow-hidden">
        <div className="transition-transform duration-500 ease-out" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
          {testimonials.map((testimonial, index) => (
            <div key={index} className="w-full flex-shrink-0 px-4">
              <div className="max-w-3xl mx-auto text-center py-8">
                {testimonial.image && (
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-20 h-20 rounded-full mx-auto mb-4 object-cover border-4 border-teal-100"
                  />
                )}
                <blockquote className="text-xl md:text-2xl font-medium text-gray-800 leading-relaxed mb-4">
                  "{testimonial.quote}"
                </blockquote>
                <cite className="not-italic">
                  <p className="font-bold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-teal-700">{testimonial.role}</p>
                </cite>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Navigation */}
      <div className="flex items-center justify-center gap-4 mt-6">
        <button
          onClick={prev}
          className="p-2 rounded-full bg-teal-100 text-teal-700 hover:bg-teal-200 transition-colors"
          aria-label="Previous testimonial"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <div className="flex gap-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                'w-2 h-2 rounded-full transition-colors',
                index === currentIndex ? 'bg-teal-600' : 'bg-gray-300'
              )}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
        
        <button
          onClick={next}
          className="p-2 rounded-full bg-teal-100 text-teal-700 hover:bg-teal-200 transition-colors"
          aria-label="Next testimonial"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}
