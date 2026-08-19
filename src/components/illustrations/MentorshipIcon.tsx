export function MentorshipIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Mentor figure */}
      <circle cx="70" cy="60" r="25" fill="#0F6E56" />
      <path d="M70 90 L70 140 L40 180 L100 180 L70 140" fill="#0F6E56" opacity="0.8" />
      
      {/* Student figure */}
      <circle cx="130" cy="100" r="20" fill="#4BC387" />
      <path d="M130 125 L130 170 L105 195 L155 195 L130 170" fill="#4BC387" opacity="0.8" />
      
      {/* Connection line */}
      <path d="M85 75 Q100 85 115 95" stroke="#F59E0B" strokeWidth="3" strokeDasharray="5,5" />
      
      {/* Heart symbol */}
      <path
        d="M100 85 C95 80 85 80 85 90 C85 98 100 105 100 105 C100 105 115 98 115 90 C115 80 105 80 100 85"
        fill="#F59E0B"
      />
    </svg>
  )
}
