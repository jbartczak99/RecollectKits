import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import {
  ShoppingBagIcon,
  VideoCameraIcon,
  ShieldCheckIcon,
  CheckIcon,
  EnvelopeIcon,
  SparklesIcon,
  ArrowRightIcon,
  RectangleStackIcon,
  UsersIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'

// Section Header Component with decorative line
const SectionHeader = ({ title, subtitle, light = false }) => (
  <div className="text-center section-padding-header">
    {/* Decorative line */}
    <div
      className="mx-auto mb-6"
      style={{
        width: '60px',
        height: '4px',
        backgroundColor: light ? 'rgba(255, 255, 255, 0.6)' : '#7C3AED',
        borderRadius: '2px'
      }}
    />
    <h2
      style={{
        color: light ? '#ffffff' : '#7C3AED',
        fontFamily: 'Darker Grotesque, sans-serif',
        fontSize: '36px',
        fontWeight: 800,
        lineHeight: 1.2,
        letterSpacing: '-0.5px',
        marginBottom: '16px'
      }}
    >
      {title}
    </h2>
    {subtitle && (
      <p
        className="max-w-2xl mx-auto"
        style={{
          fontSize: '18px',
          lineHeight: 1.6,
          color: light ? 'rgba(209, 250, 229, 0.9)' : '#4B5563'
        }}
      >
        {subtitle}
      </p>
    )}
  </div>
)

// Animated Counter Hook
const useAnimatedCounter = (end, duration = 2000, startCounting = false) => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!startCounting) return

    let startTime = null
    const startValue = 0

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const currentValue = Math.floor(startValue + (end - startValue) * easeOutQuart)

      setCount(currentValue)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [end, duration, startCounting])

  return count
}

// CSS for animated gradient and partner cards
const heroStyles = `
  /* ===== Reduced Motion ===== */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
    .hero-gradient {
      animation: none !important;
    }
  }

  /* ===== Section Padding ===== */
  .section-padding {
    padding-top: 40px;
    padding-bottom: 40px;
  }
  .section-padding-header {
    padding-top: 0;
    padding-bottom: 24px;
  }
  @media (min-width: 768px) {
    .section-padding {
      padding-top: 64px;
      padding-bottom: 64px;
    }
    .section-padding-header {
      padding-top: 0;
      padding-bottom: 32px;
    }
  }

  /* ===== Focus Visible ===== */
  .focus-ring:focus-visible {
    outline: 3px solid #7C3AED;
    outline-offset: 2px;
    border-radius: 8px;
  }

  /* ===== Hero ===== */
  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  .hero-gradient {
    background: linear-gradient(-45deg, #7C3AED, #5B21B6, #4C1D95, #3730A3, #312E81);
    background-size: 400% 400%;
    animation: gradientShift 15s ease infinite;
  }

  .hero-cta-btn {
    transition: all 0.3s ease-out;
  }
  .hero-cta-btn:hover {
    transform: scale(1.05);
    box-shadow: 0 0 30px rgba(124, 58, 237, 0.5);
  }
  .hero-cta-btn:focus-visible {
    outline: 3px solid white;
    outline-offset: 3px;
  }

  /* ===== Partner Cards ===== */
  .partner-card {
    background: linear-gradient(145deg, rgba(124, 58, 237, 0.03) 0%, rgba(255, 255, 255, 1) 100%);
    border: 2px solid transparent;
    border-radius: 1rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease-out;
    overflow: hidden;
  }
  .partner-card:hover {
    transform: translateY(-8px);
    border-color: #7C3AED;
    box-shadow: 0 20px 25px -5px rgba(124, 58, 237, 0.15), 0 8px 10px -6px rgba(124, 58, 237, 0.1);
  }

  .partner-icon-circle {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease-out;
  }
  .partner-card:hover .partner-icon-circle {
    animation: iconPulse 1s ease infinite;
  }
  @keyframes iconPulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }

  /* Stagger animation for cards */
  .stagger-card {
    opacity: 0;
    transform: translateY(24px);
    transition: opacity 0.5s ease-out, transform 0.5s ease-out;
  }
  .stagger-card.visible {
    opacity: 1;
    transform: translateY(0);
  }

  /* ===== Stats Cards ===== */
  .stat-card {
    background: white;
    border-radius: 1rem;
    padding: 20px;
    text-align: center;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease-out;
    border: 2px solid transparent;
  }
  @media (min-width: 768px) {
    .stat-card {
      padding: 32px;
    }
  }
  .stat-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 20px -5px rgba(124, 58, 237, 0.15);
    border-color: rgba(124, 58, 237, 0.2);
  }
  .stat-number {
    font-size: 48px;
    font-weight: 800;
    color: #7C3AED;
    font-family: 'Darker Grotesque', sans-serif;
    line-height: 1.2;
    letter-spacing: -0.5px;
  }
  .stat-label {
    font-size: 16px;
    color: #4B5563;
    margin-top: 0.5rem;
    font-weight: 500;
    line-height: 1.6;
  }

  /* ===== Section Backgrounds ===== */
  .section-purple-light {
    background-color: #F5F3FF;
  }
  .section-gray-light {
    background-color: #F9FAFB;
  }

  /* ===== Partner Tabs ===== */
  .partner-tab {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.25rem 1.5rem;
    border-radius: 1rem;
    cursor: pointer;
    transition: all 0.3s ease-out;
    border: 2px solid transparent;
    background: white;
  }
  .partner-tab:hover {
    background: #F5F3FF;
  }
  .partner-tab:focus-visible {
    outline: 3px solid #7C3AED;
    outline-offset: 2px;
  }
  .partner-tab.active {
    border-color: #7C3AED;
    background: linear-gradient(135deg, rgba(124, 58, 237, 0.08) 0%, rgba(124, 58, 237, 0.02) 100%);
    box-shadow: 0 4px 15px -3px rgba(124, 58, 237, 0.2);
  }
  .partner-tab-icon {
    width: 56px;
    height: 56px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease-out;
  }
  .partner-tab.active .partner-tab-icon {
    transform: scale(1.05);
  }

  /* ===== Content Panel ===== */
  .partner-content-panel {
    background: white;
    border-radius: 1.5rem;
    padding: 20px;
    box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(124, 58, 237, 0.1);
    min-height: 500px;
  }
  @media (min-width: 768px) {
    .partner-content-panel {
      padding: 32px;
    }
  }

  /* Fade animation */
  .partner-content-enter {
    opacity: 0;
    transform: translateY(10px);
  }
  .partner-content-active {
    opacity: 1;
    transform: translateY(0);
    transition: all 0.4s ease-out;
  }

  /* ===== Mockup Preview ===== */
  .mockup-preview {
    background: linear-gradient(145deg, #F9FAFB 0%, #f1f5f9 100%);
    border-radius: 1rem;
    padding: 1.5rem;
    border: 1px solid #e2e8f0;
    position: relative;
    overflow: hidden;
  }
  .mockup-preview::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 32px;
    background: linear-gradient(90deg, #e2e8f0 0%, #f1f5f9 100%);
    border-radius: 1rem 1rem 0 0;
  }
  .mockup-dots {
    position: absolute;
    top: 10px;
    left: 12px;
    display: flex;
    gap: 6px;
  }
  .mockup-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }

  /* ===== Background Patterns ===== */
  .pattern-jersey {
    background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 8 L36 12 L36 22 L40 25 L36 28 L36 48 L30 52 L24 48 L24 28 L20 25 L24 22 L24 12 Z' fill='none' stroke='%237C3AED' stroke-width='0.5' opacity='0.08'/%3E%3C/svg%3E");
  }
  .pattern-diagonal {
    background-image: repeating-linear-gradient(
      45deg,
      transparent,
      transparent 20px,
      rgba(124, 58, 237, 0.03) 20px,
      rgba(124, 58, 237, 0.03) 40px
    );
  }

  /* ===== Keyframes ===== */
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }

  /* ===== Email Link ===== */
  .email-link {
    transition: all 0.3s ease-out;
  }
  .email-link:hover {
    background-color: #F9FAFB;
  }
  .email-link:focus-visible {
    outline: 3px solid white;
    outline-offset: 3px;
  }
`

export default function Partners() {
  const [visibleSections, setVisibleSections] = useState({})
  const [jerseyCount, setJerseyCount] = useState(0)
  const [profileCount, setProfileCount] = useState(0)
  const [countryCount, setCountryCount] = useState(0)
  const sectionRefs = useRef({})

  // Fetch live counts
  useEffect(() => {
    const roundCount = (count) => count < 100 ? count : Math.floor(count / 25) * 25

    const fetchCounts = async () => {
      const [jerseys, profiles, countriesResult] = await Promise.all([
        supabase.from('public_jerseys').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('country').not('country', 'is', null)
      ])
      if (!jerseys.error && jerseys.count != null) {
        setJerseyCount(roundCount(jerseys.count))
      }
      if (!profiles.error && profiles.count != null) {
        setProfileCount(roundCount(profiles.count))
      }
      if (!countriesResult.error && countriesResult.data) {
        const unique = new Set(countriesResult.data.map(p => p.country).filter(Boolean))
        setCountryCount(unique.size)
      }
    }
    fetchCounts()
  }, [])

  // Scroll to contact section
  const scrollToContact = () => {
    const contactSection = document.getElementById('contact')
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Intersection observer for fade-in animations
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => ({
              ...prev,
              [entry.target.id]: true
            }))

            // Stagger child cards
            if (!prefersReducedMotion) {
              const cards = entry.target.querySelectorAll('.stagger-card')
              cards.forEach((card, index) => {
                setTimeout(() => {
                  card.classList.add('visible')
                }, index * 100)
              })
            } else {
              const cards = entry.target.querySelectorAll('.stagger-card')
              cards.forEach((card) => card.classList.add('visible'))
            }
          }
        })
      },
      { threshold: 0.1 }
    )

    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref)
    })

    return () => observer.disconnect()
  }, [])

  const setSectionRef = (id) => (el) => {
    sectionRefs.current[id] = el
  }

  const partnerTypes = [
    {
      id: 'retail',
      icon: ShoppingBagIcon,
      title: 'Retail Partners',
      subtitle: 'Vintage retailers, online shops, marketplace sellers',
      iconColor: '#7C3AED',
      iconGlow: 'rgba(124, 58, 237, 0.4)',
      gradientFrom: 'rgba(124, 58, 237, 0.08)',
      gradientTo: 'rgba(124, 58, 237, 0.02)',
      benefits: [
        'Brand exposure to serious collectors',
        'Photo credit on new kits added to our database',
        'Purchase links for kits you have in stock'
      ],
      details: {
        title: 'For Retail Partners',
        description: 'Whether you run a vintage kit shop, sell on marketplaces, or operate an online store, we want to help you reach passionate collectors who are actively searching for the kits you carry.',
        features: [
          'List your inventory directly in our database with links to your shop',
          'Get featured placement when collectors search for kits you carry',
          'Receive photo credit for any products added to our database',
          'Build credibility with verified seller badges'
        ],
        scenarios: [
          { title: 'Catalog Integration', desc: 'Your inventory syncs with our kit database, automatically matching your listings with collector wishlists' },
          { title: 'Affiliate Dashboard', desc: 'Track clicks, conversions, and earnings in real-time with detailed analytics' },
          { title: 'Featured Placement', desc: 'Premium visibility when collectors browse or search for kits in your inventory' }
        ],
        mockupType: 'catalog'
      }
    },
    {
      id: 'creator',
      icon: VideoCameraIcon,
      title: 'Creator Partners',
      subtitle: 'Content creators, influencers, jersey reviewers',
      iconColor: '#205A40',
      iconGlow: 'rgba(32, 90, 64, 0.4)',
      gradientFrom: 'rgba(32, 90, 64, 0.08)',
      gradientTo: 'rgba(32, 90, 64, 0.02)',
      benefits: [
        'Featured profile placement',
        'Affiliate opportunities',
        'Professional tools for content'
      ],
      details: {
        title: 'For Creator Partners',
        description: 'If you create content about football kits—reviews, unboxings, history deep-dives, or collecting tips—we want to amplify your voice and connect you with an engaged audience of fellow enthusiasts.',
        features: [
          'Showcase your collection and content on a featured creator profile',
          'Get early access to new features before public release',
          'Participate in revenue sharing for referred sales',
          'Access professional tools for tracking and showcasing your content',
          'Collaborate with us on exclusive content and partnerships'
        ],
        scenarios: [
          { title: 'Creator Profile', desc: 'A dedicated page showcasing your collection, content links, and follower engagement' },
          { title: 'Content Integration', desc: 'Embed your reviews and videos directly on kit pages for maximum exposure' },
          { title: 'Analytics Suite', desc: 'Track your reach, engagement, and earning potential across the platform' }
        ],
        mockupType: 'profile'
      }
    },
    {
      id: 'team',
      icon: ShieldCheckIcon,
      title: 'League and Club Partners',
      subtitle: 'Leagues & clubs seeking digital heritage archives',
      iconColor: '#4C1D95',
      iconGlow: 'rgba(76, 29, 149, 0.4)',
      gradientFrom: 'rgba(76, 29, 149, 0.08)',
      gradientTo: 'rgba(76, 29, 149, 0.02)',
      benefits: [
        'Digital museum solutions',
        'Historical kit archives',
        'Fan engagement tools'
      ],
      details: {
        title: 'For League and Club Partners',
        description: 'Football clubs of all sizes have rich kit histories worth preserving. We help teams create stunning digital archives that engage fans, preserve heritage, and celebrate the stories behind every shirt.',
        features: [
          'Custom digital museum showcasing your complete kit history',
          'Archive rare and historic kits with detailed provenance',
          'Engage fans with interactive kit timelines and stories',
          'White-label solutions for your own website or app',
          'Integration with merchandise and retail operations'
        ],
        scenarios: [
          { title: 'Digital Museum', desc: 'An interactive timeline of your club\'s kit history, accessible to fans worldwide' },
          { title: 'Heritage Archive', desc: 'Detailed records of every kit, including rare match-worn and prototype designs' },
          { title: 'Fan Engagement', desc: 'Let supporters vote on classic kits, share memories, and connect with history' }
        ],
        mockupType: 'museum'
      }
    }
  ]

  // Stats data
  const stats = [
    {
      id: 'jerseys',
      icon: RectangleStackIcon,
      value: jerseyCount,
      suffix: jerseyCount >= 100 ? '+' : '',
      label: 'Kits in Database'
    },
    {
      id: 'collectors',
      icon: UsersIcon,
      value: profileCount,
      suffix: profileCount >= 100 ? '+' : '',
      label: 'Active Collectors'
    },
    {
      id: 'countries',
      icon: GlobeAltIcon,
      value: countryCount,
      suffix: '',
      label: 'Countries Represented'
    }
  ]

  const earlyBenefits = [
    'Featured placement at launch',
    'Input on partnership features',
    'Preferential terms',
    'Co-marketing opportunities'
  ]

  const contactRequirements = [
    'Type of partnership you\'re interested in',
    'Brief description of your business/channel',
    'How you think we could work together',
    'Any relevant links (website, Instagram, etc.)'
  ]

  return (
    <div className="space-y-0">
      {/* Inject styles */}
      <style>{heroStyles}</style>

      {/* ===== Hero Section ===== */}
      <section className="hero-gradient relative overflow-hidden -mx-4 sm:-mx-6 lg:-mx-8 -mt-8">
        {/* Pattern overlay */}
        <div
          className="absolute inset-0"
          aria-hidden="true"
          style={{
            opacity: 0.05,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff'%3E%3Cpath d='M40 10 L50 20 L50 35 L55 40 L50 45 L50 60 L40 70 L30 60 L30 45 L25 40 L30 35 L30 20 Z' stroke='%23ffffff' stroke-width='1' fill='none'/%3E%3Ccircle cx='40' cy='40' r='3'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Mobile background image overlay */}
        <div
          className="absolute inset-0 md:hidden"
          aria-hidden="true"
          role="img"
          style={{
            backgroundImage: 'url("/jerseys/hero-collection.jpg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.15
          }}
        />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-12 md:py-20">
          <h1
            className="mb-4"
            style={{
              fontFamily: 'Darker Grotesque, sans-serif',
              fontSize: 'clamp(36px, 5vw, 48px)',
              fontWeight: 800,
              lineHeight: 1.2,
              letterSpacing: '-0.5px',
              color: '#ffffff',
              textShadow: '0 2px 20px rgba(0, 0, 0, 0.3)'
            }}
          >
            Partner with RecollectKits
          </h1>

          <p
            className="mb-4"
            style={{
              fontFamily: 'Darker Grotesque, sans-serif',
              fontSize: 'clamp(20px, 3vw, 24px)',
              fontWeight: 800,
              color: 'rgba(255, 255, 255, 0.9)',
              lineHeight: 1.2,
              letterSpacing: '-0.5px'
            }}
          >
            Help us build the premier platform for jersey collectors
          </p>

          <p
            className="max-w-xl mx-auto mb-8"
            style={{
              fontSize: '18px',
              lineHeight: 1.6,
              color: 'rgba(255, 255, 255, 0.8)'
            }}
          >
            We're looking for retailers, content creators, and teams to join us in building something special. Be part of the community that's preserving football kit history.
          </p>

          {/* CTA Button */}
          <button
            onClick={scrollToContact}
            className="hero-cta-btn inline-flex items-center gap-3 px-8 py-4 rounded-xl font-semibold"
            style={{
              backgroundColor: '#7C3AED',
              color: 'white',
              fontSize: '18px',
              lineHeight: 1.6,
              border: '2px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            <span>Become a Partner</span>
            <ArrowRightIcon className="flex-shrink-0" style={{ width: '20px', height: '20px' }} aria-hidden="true" />
          </button>
        </div>
      </section>

      {/* ===== Partner Types Section ===== */}
      <section
        id="partner-types"
        ref={setSectionRef('partner-types')}
        className={`section-padding transition-all duration-700 ${visibleSections['partner-types'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      >
        <SectionHeader
          title="Partnership Opportunities"
          subtitle="We're building partnerships across the football kit ecosystem"
        />

        <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: '24px' }}>
          {partnerTypes.map((partner) => {
            const Icon = partner.icon
            return (
              <div
                key={partner.id}
                className="partner-card stagger-card"
              >
                <div className="p-6 md:p-10">
                  {/* Icon Circle */}
                  <div
                    className="partner-icon-circle mb-6"
                    style={{
                      backgroundColor: partner.iconColor,
                      boxShadow: `0 8px 20px ${partner.iconGlow}`
                    }}
                  >
                    <Icon className="flex-shrink-0" style={{ width: '40px', height: '40px', color: '#ffffff' }} aria-hidden="true" />
                  </div>

                  {/* Title */}
                  <h3
                    className="mb-2"
                    style={{
                      color: '#1F2937',
                      fontFamily: 'Darker Grotesque, sans-serif',
                      fontSize: '24px',
                      fontWeight: 800,
                      lineHeight: 1.2
                    }}
                  >
                    {partner.title}
                  </h3>

                  {/* Subtitle */}
                  <p
                    className="mb-6"
                    style={{
                      color: '#4B5563',
                      fontSize: '16px',
                      lineHeight: 1.6,
                      fontStyle: 'italic'
                    }}
                  >
                    {partner.subtitle}
                  </p>

                  {/* Benefits */}
                  <ul className="space-y-4">
                    {partner.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span
                          className="flex-shrink-0 mt-0.5 font-bold"
                          style={{ color: '#205A40', fontSize: '16px' }}
                          aria-hidden="true"
                        >
                          &#10003;
                        </span>
                        <span style={{ color: '#1F2937', fontSize: '16px', lineHeight: 1.6 }}>
                          {benefit}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ===== Stats Section ===== */}
      <section
        id="stats"
        ref={setSectionRef('stats')}
        className={`-mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 section-purple-light pattern-diagonal section-padding transition-all duration-700 ${visibleSections['stats'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      >
        <SectionHeader
          title="Growing Community"
          subtitle="Join a thriving ecosystem of collectors and enthusiasts"
        />

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: '24px' }}>
            {stats.map((stat) => {
              const Icon = stat.icon
              const animatedValue = useAnimatedCounter(
                stat.value,
                2000,
                visibleSections['stats']
              )

              return (
                <div key={stat.id} className="stat-card stagger-card">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ backgroundColor: 'rgba(124, 58, 237, 0.1)' }}
                  >
                    <Icon className="flex-shrink-0" style={{ color: '#7C3AED', width: '32px', height: '32px' }} aria-hidden="true" />
                  </div>
                  <div className="stat-number" aria-live="polite">
                    {animatedValue.toLocaleString()}{stat.suffix}
                  </div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ===== Early Partner Benefits ===== */}
      <section
        id="early-benefits"
        ref={setSectionRef('early-benefits')}
        className={`-mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 section-purple-light pattern-jersey section-padding transition-all duration-700 ${visibleSections['early-benefits'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      >
        <SectionHeader
          title="Founding Partner Program"
          subtitle="Be among the first to shape the future of RecollectKits"
        />

        <div className="max-w-2xl mx-auto text-center">
          <div
            className="rounded-2xl overflow-hidden p-6 md:p-10"
            style={{
              background: 'linear-gradient(145deg, #ffffff 0%, #F9FAFB 100%)',
              boxShadow: '0 10px 40px -10px rgba(124, 58, 237, 0.2)',
              border: '1px solid rgba(124, 58, 237, 0.1)'
            }}
          >
              <div
                className="inline-flex items-center gap-2 rounded-full mb-6"
                style={{ padding: '6px 16px', backgroundColor: 'rgba(124, 58, 237, 0.08)' }}
              >
                <SparklesIcon className="flex-shrink-0" style={{ color: '#7C3AED', width: '14px', height: '14px' }} aria-hidden="true" />
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#7C3AED', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Limited Availability
                </span>
              </div>

              <h3
                className="mb-3"
                style={{
                  fontFamily: 'Darker Grotesque, sans-serif',
                  fontSize: '24px',
                  fontWeight: 800,
                  lineHeight: 1.2,
                  letterSpacing: '-0.5px',
                  color: '#1F2937'
                }}
              >
                We're building our initial partner network
              </h3>

              <p style={{ color: '#4B5563', fontSize: '16px', lineHeight: 1.6, marginBottom: '24px' }}>
                Join now and help shape the future of RecollectKits.
              </p>

              <div
                className="text-left"
                style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}
              >
                {earlyBenefits.map((benefit, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 rounded-lg"
                    style={{ padding: '12px 16px', backgroundColor: 'rgba(124, 58, 237, 0.05)' }}
                  >
                    <span
                      className="flex-shrink-0 font-bold"
                      style={{ color: '#205A40', fontSize: '14px' }}
                      aria-hidden="true"
                    >
                      &#10003;
                    </span>
                    <span style={{ fontWeight: 600, color: '#1F2937', fontSize: '15px', lineHeight: 1.4 }}>{benefit}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={scrollToContact}
                className="hero-cta-btn mt-8 inline-flex items-center gap-2 rounded-xl font-semibold"
                style={{
                  padding: '12px 32px',
                  backgroundColor: '#7C3AED',
                  color: 'white',
                  fontSize: '16px',
                  border: 'none'
                }}
              >
                <span>Get in Touch</span>
                <ArrowRightIcon className="flex-shrink-0" style={{ width: '16px', height: '16px' }} aria-hidden="true" />
              </button>
          </div>
        </div>
      </section>

      {/* ===== Contact Section ===== */}
      <section
        id="contact"
        ref={setSectionRef('contact')}
        className={`-mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 section-padding transition-all duration-700 ${visibleSections['contact'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        style={{ backgroundColor: '#205A40' }}
      >
        <div className="max-w-2xl mx-auto">
          {/* Main card */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(255, 255, 255, 0.07)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.12)'
            }}
          >
            {/* Top section - heading + email CTA */}
            <div className="text-center" style={{ padding: '32px 24px 28px' }}>
              <h2
                style={{
                  fontFamily: 'Darker Grotesque, sans-serif',
                  fontSize: '32px',
                  fontWeight: 800,
                  lineHeight: 1.2,
                  letterSpacing: '-0.5px',
                  color: '#ffffff',
                  marginBottom: '8px'
                }}
              >
                Interested in Partnering?
              </h2>
              <p style={{ fontSize: '16px', lineHeight: 1.6, color: 'rgba(209, 250, 229, 0.8)', marginBottom: '24px' }}>
                We'd love to hear from you
              </p>
              <a
                href="mailto:hello@recollectkits.com"
                className="email-link inline-flex items-center gap-3 font-semibold rounded-xl"
                style={{
                  color: '#1F2937',
                  fontSize: '17px',
                  lineHeight: 1.6,
                  padding: '14px 28px',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
                }}
              >
                <EnvelopeIcon className="flex-shrink-0" style={{ color: '#7C3AED', width: '20px', height: '20px' }} aria-hidden="true" />
                <span>hello@recollectkits.com</span>
              </a>
            </div>

            {/* Divider */}
            <div style={{ height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.1)', margin: '0 24px' }} />

            {/* Bottom section - requirements in 2-col grid */}
            <div style={{ padding: '24px' }}>
              <p style={{ color: 'rgba(209, 250, 229, 0.7)', fontWeight: 600, fontSize: '13px', lineHeight: 1.6, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '14px', textAlign: 'center' }}>
                Please include in your email
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {contactRequirements.map((req, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 rounded-lg"
                    style={{ padding: '10px 12px', backgroundColor: 'rgba(255, 255, 255, 0.06)' }}
                  >
                    <span className="flex-shrink-0" style={{ color: '#86efac', fontSize: '14px', marginTop: '1px' }} aria-hidden="true">&#10003;</span>
                    <span style={{ fontSize: '14px', lineHeight: 1.5, color: '#ecfdf5' }}>{req}</span>
                  </div>
                ))}
              </div>
              <p style={{ color: 'rgba(187, 247, 208, 0.6)', fontSize: '13px', lineHeight: 1.6, textAlign: 'center', marginTop: '16px' }}>
                We'll respond within 2 business days.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Footer CTA ===== */}
      <section
        id="footer-cta"
        ref={setSectionRef('footer-cta')}
        className={`section-padding transition-all duration-700 ${visibleSections['footer-cta'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      >
        <div className="text-center">
          <p style={{ color: '#4B5563', fontSize: '18px', lineHeight: 1.6, marginBottom: '24px' }}>
            Want to learn more about RecollectKits?
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center" style={{ gap: '16px' }}>
            <Link
              to="/about"
              className="btn btn-primary inline-flex items-center gap-2 focus-ring"
              style={{ backgroundColor: '#7C3AED' }}
            >
              <span>About Us</span>
              <ArrowRightIcon className="flex-shrink-0" style={{ width: '16px', height: '16px' }} aria-hidden="true" />
            </Link>
            <Link
              to="/"
              className="btn btn-secondary inline-flex items-center gap-2 focus-ring"
            >
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
