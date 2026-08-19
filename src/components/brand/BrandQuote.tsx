interface BrandQuoteProps {
  quote: string
  author?: string
  className?: string
}

export function BrandQuote({ quote, author, className = '' }: BrandQuoteProps) {
  return (
    <div className={`relative py-8 px-6 ${className}`}>
      <div className="absolute top-0 left-0 text-8xl font-black text-teal-100 opacity-50 leading-none">"</div>
      <blockquote className="relative z-10">
        <p className="text-xl md:text-2xl font-medium text-gray-800 leading-relaxed italic">
          {quote}
        </p>
        {author && (
          <footer className="mt-4 flex items-center gap-3">
            <div className="h-px w-12 bg-teal-600" />
            <cite className="text-sm font-semibold text-teal-700 not-italic uppercase tracking-wider">
              {author}
            </cite>
          </footer>
        )}
      </blockquote>
      <div className="absolute bottom-0 right-0 text-8xl font-black text-teal-100 opacity-50 leading-none rotate-180">"</div>
    </div>
  )
}
