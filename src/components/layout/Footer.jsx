export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 mt-12">
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
                style={{ width: '32px', height: '32px', minWidth: '29px', minHeight: '29px' }}
              />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
