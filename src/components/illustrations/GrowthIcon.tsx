export function GrowthIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Plant stem */}
      <path
        d="M100 180 Q100 140 100 100 Q100 60 80 40"
        stroke="#0F6E56"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M100 180 Q100 140 100 100 Q100 60 120 40"
        stroke="#0F6E56"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      
      {/* Leaves */}
      <ellipse cx="70" cy="50" rx="20" ry="10" fill="#4BC387" transform="rotate(-30 70 50)" />
      <ellipse cx="130" cy="50" rx="20" ry="10" fill="#4BC387" transform="rotate(30 130 50)" />
      <ellipse cx="60" cy="80" rx="15" ry="8" fill="#1DAF6B" transform="rotate(-45 60 80)" />
      <ellipse cx="140" cy="80" rx="15" ry="8" fill="#1DAF6B" transform="rotate(45 140 80)" />
      
      {/* Small sprout */}
      <circle cx="100" cy="180" r="8" fill="#E1F5EE" />
      <circle cx="100" cy="180" r="4" fill="#0F6E56" />
    </svg>
  )
}
