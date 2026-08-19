interface HeroImageProps {
  src: string
  alt: string
  overlay?: boolean
  className?: string
}

export function HeroImage({ src, alt, overlay = true, className = '' }: HeroImageProps) {
  return (
    <div className={`relative w-full h-full ${className}`}>
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
      />
      {overlay && (
        <div className="absolute inset-0 bg-gradient-to-r from-teal-900/80 via-teal-900/40 to-transparent" />
      )}
    </div>
  )
}
