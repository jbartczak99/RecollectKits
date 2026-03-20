import { Link } from 'react-router-dom'
import Logo from './Logo'

export default function Footer() {
  const startYear = 2025
  const currentYear = new Date().getFullYear()
  const yearDisplay = currentYear > startYear
    ? `${startYear}-${currentYear}`
    : `${startYear}`

  return (
    <footer className="border-t border-gray-200 bg-gray-50 mt-12" style={{ paddingBottom: '2rem' }}>
      <div className="container py-6">
        {/* Logo */}
        <div className="flex flex-col items-center justify-center" style={{ marginBottom: '1.5rem' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <Logo layout="stacked" iconSize={90} fontSize={32} showTagline />
          </Link>
        </div>

        {/* Social Links */}
        <div className="flex flex-col items-center justify-center gap-3">
          <p className="text-gray-600 font-medium">Follow us on</p>
          <div className="flex items-center gap-4">
            <a
              href="https://www.instagram.com/recollectkits/"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-opacity hover:opacity-80"
              aria-label="Follow us on Instagram"
            >
              <img
                src="/instagram-logo.png"
                alt="Instagram"
                style={{ width: '30px', height: '30px' }}
              />
            </a>
            <a
              href="https://www.tiktok.com/@recollectkits"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-opacity hover:opacity-80"
              aria-label="Follow us on TikTok"
            >
              <img
                src="/tiktok-logo.png"
                alt="TikTok"
                style={{ width: '34px', height: '34px' }}
              />
            </a>
            <a
              href="https://www.youtube.com/@recollectkits"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-opacity hover:opacity-80"
              aria-label="Subscribe on YouTube"
            >
              <img
                src="/youtube-icon.png"
                alt="YouTube"
                style={{ width: '46px', height: '46px' }}
              />
            </a>
            <a
              href="https://www.linkedin.com/company/recollectkits/"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-opacity hover:opacity-80"
              aria-label="Follow us on LinkedIn"
            >
              <svg style={{ width: '28px', height: '28px' }} viewBox="0 0 24 24" fill="#0A66C2">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-center text-gray-500 text-sm">
            &copy; {yearDisplay} RecollectKits™. All rights reserved.
          </p>
          <p className="text-center text-gray-500 text-sm mt-2">
            <Link to="/privacy" className="hover:text-gray-700 underline">
              Privacy Policy
            </Link>
            <span className="text-gray-400" style={{ margin: '0 12px' }}>|</span>
            <Link to="/terms" className="hover:text-gray-700 underline">
              Terms of Service
            </Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
