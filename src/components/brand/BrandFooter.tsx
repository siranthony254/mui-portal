interface BrandFooterProps {
  className?: string
}

export function BrandFooter({ className = '' }: BrandFooterProps) {
  return (
    <footer className={`bg-gray-900 text-white py-12 ${className}`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-lg mb-4">MUI Forge</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Shaping the future of campuses through intentional formation, authentic mentorship, and purpose-driven leadership.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="/about" className="hover:text-teal-400 transition-colors">About Us</a></li>
              <li><a href="/programs" className="hover:text-teal-400 transition-colors">Our Programs</a></li>
              <li><a href="/mentors" className="hover:text-teal-400 transition-colors">Become a Mentor</a></li>
              <li><a href="/contact" className="hover:text-teal-400 transition-colors">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Connect</h4>
            <p className="text-gray-400 text-sm mb-4">
              Join the movement shaping the next generation of African leaders.
            </p>
            <a 
              href="https://micdupinitiative.site" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-teal-400 hover:text-teal-300 transition-colors text-sm font-medium"
            >
              Visit Mic'd Up Initiative →
            </a>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Mic'd Up Initiative. All rights reserved.
          </p>
          <p className="text-xs text-gray-500">
            Built with intention. Designed for impact.
          </p>
        </div>
      </div>
    </footer>
  )
}
