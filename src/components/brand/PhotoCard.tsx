interface PhotoCardProps {
  src: string
  alt: string
  name: string
  role?: string
  quote?: string
  className?: string
}

export function PhotoCard({ src, alt, name, role, quote, className = '' }: PhotoCardProps) {
  return (
    <div className={`card overflow-hidden group ${className}`}>
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <div className="p-4">
        <h3 className="font-bold text-gray-900">{name}</h3>
        {role && <p className="text-sm text-teal-700 font-medium">{role}</p>}
        {quote && (
          <p className="text-xs text-gray-600 mt-2 italic line-clamp-2">"{quote}"</p>
        )}
      </div>
    </div>
  )
}
