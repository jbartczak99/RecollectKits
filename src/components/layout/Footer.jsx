import { Link } from 'react-router-dom'

export default function Footer() {
  const startYear = 2025
  const currentYear = new Date().getFullYear()
  const yearDisplay = currentYear > startYear
    ? `${startYear}-${currentYear}`
    : `${startYear}`

  return (
    <footer className="border-t border-gray-200 bg-gray-50 mt-12" style={{ paddingBottom: '2rem' }}>
      <div className="container py-6">
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
                style={{ width: '32px', height: '32px', minWidth: '30px', minHeight: '30px' }}
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
                style={{ width: '38px', height: '38px', minWidth: '30px', minHeight: '30px' }}
              />
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
