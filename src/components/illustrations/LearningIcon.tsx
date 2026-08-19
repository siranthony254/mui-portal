export function LearningIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Book base */}
      <path d="M40 60 L40 150 Q40 160 50 160 L150 160 Q160 160 160 150 L160 60" fill="#E1F5EE" stroke="#0F6E56" strokeWidth="2" />
      
      {/* Book spine */}
      <path d="M100 60 L100 160" stroke="#0F6E56" strokeWidth="2" />
      
      {/* Book pages */}
      <path d="M45 65 L95 65 L95 155 L45 155 Z" fill="white" stroke="#E1F5EE" strokeWidth="1" />
      <path d="M105 65 L155 65 L155 155 L105 155 Z" fill="white" stroke="#E1F5EE" strokeWidth="1" />
      
      {/* Light bulb */}
      <circle cx="100" cy="35" r="20" fill="#F59E0B" />
      <path d="M90 50 L110 50 L105 65 L95 65 Z" fill="#D97706" />
      <path d="M95 65 L105 65 L105 70 L95 70 Z" fill="#92400E" />
      
      {/* Light rays */}
      <line x1="100" y1="5" x2="100" y2="10" stroke="#F59E0B" strokeWidth="2" />
      <line x1="70" y1="15" x2="75" y2="20" stroke="#F59E0B" strokeWidth="2" />
      <line x1="130" y1="15" x2="125" y2="20" stroke="#F59E0B" strokeWidth="2" />
      <line x1="60" y1="35" x2="65" y2="35" stroke="#F59E0B" strokeWidth="2" />
      <line x1="140" y1="35" x2="135" y2="35" stroke="#F59E0B" strokeWidth="2" />
    </svg>
  )
}
