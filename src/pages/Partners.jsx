import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { supabase, supabasePublic } from '../lib/supabase'
import {
  ShoppingBagIcon,
  VideoCameraIcon,
  ShieldCheckIcon,
  SparklesIcon,
  ArrowRightIcon,
  RectangleStackIcon,
  UsersIcon,
  GlobeAltIcon,
  CheckCircleIcon,
  UserIcon,
  BuildingStorefrontIcon
} from '@heroicons/react/24/outline'

// Section Header Component with decorative line
const SectionHeader = ({ title, subtitle, light = false, badge = null }) => (
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
    {badge && (
      <div
        className="inline-flex items-center gap-2 rounded-full mb-4"
        style={{ padding: '6px 16px', backgroundColor: 'rgba(124, 58, 237, 0.08)' }}
      >
        <SparklesIcon className="flex-shrink-0" style={{ color: '#7C3AED', width: '14px', height: '14px' }} aria-hidden="true" />
        <span style={{ fontSize: '13px', fontWeight: 700, color: '#7C3AED', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {badge}
        </span>
      </div>
    )}
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

  /* ===== Spotlight Cards ===== */
  .spotlight-card {
    background: linear-gradient(145deg, rgba(124, 58, 237, 0.03) 0%, rgba(255, 255, 255, 1) 100%);
    border: 2px solid transparent;
    border-radius: 1rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease-out;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  .spotlight-card:hover {
    transform: translateY(-8px);
    border-color: rgba(124, 58, 237, 0.4);
    box-shadow: 0 20px 25px -5px rgba(124, 58, 237, 0.15), 0 8px 10px -6px rgba(124, 58, 237, 0.1);
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
`

// Tier-specific success messages
const TIER_MESSAGES = {
  collector: "Application submitted! We'll review your collection and be in touch within 48 hours.",
  creator: "Application submitted! We'll reach out within 48 hours to discuss Founding Partner rates.",
  shop: "Application submitted! We'll reach out within 48 hours to discuss Founding Partner rates.",
  club: "Thanks for your interest! We'll reach out within 48 hours to discuss partnership opportunities.",
  retail: "Thanks for your interest! We'll reach out within 48 hours to discuss partnership opportunities."
}

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
        supabasePublic.from('public_jerseys').select('id', { count: 'exact', head: true }),
        supabasePublic.from('profiles').select('id', { count: 'exact', head: true }),
        supabasePublic.from('profiles').select('country').not('country', 'is', null)
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

  // Application form
  const { register, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm()
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [submittedType, setSubmittedType] = useState(null)
  const [submitError, setSubmitError] = useState(null)
  const watchPartnerType = watch('partner_type')

  const TIER_MAP = {
    collector: 'free',
    creator: 'creator',
    shop: 'shop',
    club: 'club',
    retail: 'retail'
  }

  const onSubmitApplication = async (data) => {
    setSubmitError(null)
    try {
      const { error } = await supabase.from('partner_applications').insert({
        name: data.name,
        email: data.email,
        username: data.username || null,
        partner_type: data.partner_type,
        description: data.description,
        links: data.links || null,
        tier: TIER_MAP[data.partner_type] || data.partner_type
      })
      if (error) throw error
      setSubmittedType(data.partner_type)
      setFormSubmitted(true)
      reset()
    } catch (err) {
      setSubmitError('Something went wrong. Please try again or email hello@recollectkits.com.')
    }
  }

  // Scroll to apply form
  const scrollToApplyForm = () => {
    const el = document.getElementById('apply-form')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
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

  // ===== SECTION 1: Partnership Opportunities (2 cards, no pricing) =====
  const partnershipCards = [
    {
      id: 'retail',
      icon: ShoppingBagIcon,
      title: 'Retail Partners',
      subtitle: 'Vintage retailers, online shops, marketplace sellers',
      iconColor: '#7C3AED',
      iconGlow: 'rgba(124, 58, 237, 0.4)',
      benefits: [
        'Database contribution for kits you have in stock',
        'Photo credit on new kits added to our database',
        'Affiliate links and revenue sharing'
      ],
      mailto: 'mailto:hello@recollectkits.com?subject=Retail%20Partnership%20Inquiry'
    },
    {
      id: 'club',
      icon: ShieldCheckIcon,
      title: 'Club & League Partners',
      subtitle: 'Leagues & clubs seeking digital heritage archives',
      iconColor: '#4C1D95',
      iconGlow: 'rgba(76, 29, 149, 0.4)',
      benefits: [
        'Digital museum solutions',
        'Historical kit archives',
        'Fan engagement tools'
      ],
      mailto: 'mailto:hello@recollectkits.com?subject=Club%20Partnership%20Inquiry'
    }
  ]

  // ===== SECTION 2: Get Featured on Homepage (3 cards) =====
  const spotlightCards = [
    {
      id: 'community',
      icon: UserIcon,
      title: 'Community Spotlight',
      subtitle: 'For collectors with unique collections',
      priceBadge: 'FREE',
      priceBadgeColor: '#059669',
      originalPrice: null,
      benefits: [
        'Homepage feature (1-2 weeks)',
        '"Featured Collector" badge on profile',
        'Social media shoutout'
      ]
    },
    {
      id: 'creator',
      icon: VideoCameraIcon,
      title: 'Creator Spotlight',
      subtitle: 'Kit influencers, YouTubers, Instagram collectors',
      priceBadge: '$25/week',
      priceBadgeColor: '#7C3AED',
      originalPrice: '$50/week',
      benefits: [
        'Homepage feature (1 week)',
        '"Creator" badge on profile',
        'Link to your social channels',
        'Newsletter inclusion (coming soon)'
      ]
    },
    {
      id: 'shop',
      icon: BuildingStorefrontIcon,
      title: 'Shop Spotlight',
      subtitle: 'Vintage kit shops & marketplace sellers',
      priceBadge: '$75/week',
      priceBadgeColor: '#7C3AED',
      originalPrice: '$150/week',
      benefits: [
        'Homepage feature (1 week)',
        '"Official Shop" badge',
        'Direct link to your store',
        'Analytics on views & clicks'
      ]
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

  // Form radio options
  const partnerTypeOptions = [
    { value: 'collector', label: 'Collector (free community spotlight)' },
    { value: 'creator', label: 'Content Creator ($25/week spotlight)' },
    { value: 'shop', label: 'Shop/Retailer ($75/week spotlight)' },
    { value: 'club', label: 'Club/Organization (digital museum partnership)' },
    { value: 'retail', label: 'Retail Partner (database/affiliate partnership)' }
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
            onClick={scrollToApplyForm}
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

      {/* ===== SECTION 1: Partnership Opportunities (2 cards) ===== */}
      <section
        id="partner-types"
        ref={setSectionRef('partner-types')}
        className={`section-padding transition-all duration-700 ${visibleSections['partner-types'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      >
        <SectionHeader
          title="Partnership Opportunities"
          subtitle="We're building partnerships across the football kit ecosystem"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto" style={{ gap: '24px' }}>
          {partnershipCards.map((partner) => {
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
                  <ul className="space-y-4 mb-8">
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

                  {/* Contact Us button */}
                  <a
                    href={partner.mailto}
                    className="hero-cta-btn inline-flex items-center gap-2 rounded-xl font-semibold"
                    style={{
                      padding: '12px 28px',
                      backgroundColor: partner.iconColor,
                      color: 'white',
                      fontSize: '16px',
                      border: 'none',
                      textDecoration: 'none'
                    }}
                  >
                    <span>Contact Us</span>
                    <ArrowRightIcon className="flex-shrink-0" style={{ width: '16px', height: '16px' }} aria-hidden="true" />
                  </a>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ===== SECTION 2: Get Featured on Homepage ===== */}
      <section
        id="featured"
        ref={setSectionRef('featured')}
        className={`-mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 section-gray-light section-padding transition-all duration-700 ${visibleSections['featured'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      >
        <SectionHeader
          title="Get Featured on Homepage"
          subtitle="Showcase your collection to thousands of kit collectors"
          badge="Founding Partner Rates"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 max-w-5xl mx-auto" style={{ gap: '24px' }}>
          {spotlightCards.map((card) => {
            const Icon = card.icon
            return (
              <div
                key={card.id}
                className="spotlight-card stagger-card"
              >
                <div className="p-6 md:p-8 flex-1 flex flex-col">
                  {/* Icon */}
                  <div
                    className="partner-icon-circle mb-5"
                    style={{
                      backgroundColor: card.priceBadgeColor,
                      boxShadow: `0 8px 20px ${card.priceBadgeColor}40`,
                      width: '64px',
                      height: '64px'
                    }}
                  >
                    <Icon className="flex-shrink-0" style={{ width: '32px', height: '32px', color: '#ffffff' }} aria-hidden="true" />
                  </div>

                  {/* Title */}
                  <h3
                    className="mb-2"
                    style={{
                      color: '#1F2937',
                      fontFamily: 'Darker Grotesque, sans-serif',
                      fontSize: '22px',
                      fontWeight: 800,
                      lineHeight: 1.2
                    }}
                  >
                    {card.title}
                  </h3>

                  {/* Pricing */}
                  <div className="mb-3">
                    {card.originalPrice && (
                      <p style={{ color: '#9CA3AF', fontSize: '14px', lineHeight: 1.6 }}>
                        <span style={{ textDecoration: 'line-through' }}>{card.originalPrice}</span>
                      </p>
                    )}
                    <span
                      className="inline-block rounded-full font-bold"
                      style={{
                        padding: '5px 14px',
                        backgroundColor: card.priceBadgeColor,
                        color: '#ffffff',
                        fontSize: '16px',
                        letterSpacing: '-0.3px'
                      }}
                    >
                      {card.priceBadge}
                    </span>
                    {card.originalPrice && (
                      <p style={{ color: '#7C3AED', fontSize: '13px', fontStyle: 'italic', marginTop: '4px' }}>
                        Founding Partner Rate
                      </p>
                    )}
                  </div>

                  {/* Subtitle */}
                  <p
                    className="mb-5"
                    style={{
                      color: '#4B5563',
                      fontSize: '15px',
                      lineHeight: 1.6,
                      fontStyle: 'italic'
                    }}
                  >
                    {card.subtitle}
                  </p>

                  {/* Benefits */}
                  <ul className="space-y-3 mb-6 flex-1">
                    {card.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span
                          className="flex-shrink-0 mt-0.5 font-bold"
                          style={{ color: '#205A40', fontSize: '15px' }}
                          aria-hidden="true"
                        >
                          &#10003;
                        </span>
                        <span style={{ color: '#1F2937', fontSize: '15px', lineHeight: 1.6 }}>
                          {benefit}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Apply Now button */}
                  <button
                    onClick={scrollToApplyForm}
                    className="hero-cta-btn w-full inline-flex items-center justify-center gap-2 rounded-xl font-semibold"
                    style={{
                      padding: '12px 24px',
                      backgroundColor: '#7C3AED',
                      color: 'white',
                      fontSize: '15px',
                      border: 'none'
                    }}
                  >
                    <span>Apply Now</span>
                    <ArrowRightIcon className="flex-shrink-0" style={{ width: '16px', height: '16px' }} aria-hidden="true" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer note */}
        <p
          className="text-center mt-6 max-w-2xl mx-auto"
          style={{ color: '#6B7280', fontSize: '15px', lineHeight: 1.6 }}
        >
          Only 3 featured slots available. Founding Partner rates for our first 10 paid partners.
        </p>
      </section>

      {/* ===== SECTION 3: Growing Community ===== */}
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

      {/* ===== SECTION 4: Founding Partner Program ===== */}
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
                onClick={scrollToApplyForm}
                className="hero-cta-btn mt-8 inline-flex items-center gap-2 rounded-xl font-semibold"
                style={{
                  padding: '12px 32px',
                  backgroundColor: '#7C3AED',
                  color: 'white',
                  fontSize: '16px',
                  border: 'none'
                }}
              >
                <span>Apply Now</span>
                <ArrowRightIcon className="flex-shrink-0" style={{ width: '16px', height: '16px' }} aria-hidden="true" />
              </button>
          </div>
        </div>
      </section>

      {/* ===== SECTION 5: Application Form ===== */}
      <section
        id="apply-form"
        ref={setSectionRef('apply-form')}
        className={`-mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 section-padding transition-all duration-700 ${visibleSections['apply-form'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        style={{ backgroundColor: '#205A40' }}
      >
        <div className="max-w-2xl mx-auto">
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(255, 255, 255, 0.07)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.12)'
            }}
          >
            <div style={{ padding: '32px 24px' }}>
              {formSubmitted ? (
                <div className="text-center py-8">
                  <CheckCircleIcon style={{ width: '64px', height: '64px', color: '#86efac', margin: '0 auto 16px' }} />
                  <h2
                    style={{
                      fontFamily: 'Darker Grotesque, sans-serif',
                      fontSize: '32px',
                      fontWeight: 800,
                      lineHeight: 1.2,
                      color: '#ffffff',
                      marginBottom: '12px'
                    }}
                  >
                    Application Submitted!
                  </h2>
                  <p style={{ fontSize: '16px', lineHeight: 1.6, color: 'rgba(209, 250, 229, 0.9)' }}>
                    {TIER_MESSAGES[submittedType] || "We'll be in touch within 48 hours."}
                  </p>
                </div>
              ) : (
                <>
                  <div className="text-center mb-8">
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
                      Apply to Partner
                    </h2>
                    <p style={{ fontSize: '16px', lineHeight: 1.6, color: 'rgba(209, 250, 229, 0.8)' }}>
                      Founding Partner spots are limited. Apply now and we'll respond within 48 hours.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit(onSubmitApplication)} className="space-y-5">
                    {/* Name */}
                    <div>
                      <label htmlFor="name" style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#ecfdf5', marginBottom: '6px' }}>
                        Your name <span style={{ color: '#f87171' }}>*</span>
                      </label>
                      <input
                        id="name"
                        type="text"
                        {...register('name', { required: 'Name is required' })}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          borderRadius: '12px',
                          border: errors.name ? '2px solid #f87171' : '1px solid rgba(255, 255, 255, 0.15)',
                          backgroundColor: 'rgba(255, 255, 255, 0.08)',
                          color: '#ffffff',
                          fontSize: '16px',
                          outline: 'none'
                        }}
                      />
                      {errors.name && <p style={{ color: '#fca5a5', fontSize: '13px', marginTop: '4px' }}>{errors.name.message}</p>}
                    </div>

                    {/* Email */}
                    <div>
                      <label htmlFor="email" style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#ecfdf5', marginBottom: '6px' }}>
                        Email address <span style={{ color: '#f87171' }}>*</span>
                      </label>
                      <input
                        id="email"
                        type="email"
                        {...register('email', {
                          required: 'Email is required',
                          pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' }
                        })}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          borderRadius: '12px',
                          border: errors.email ? '2px solid #f87171' : '1px solid rgba(255, 255, 255, 0.15)',
                          backgroundColor: 'rgba(255, 255, 255, 0.08)',
                          color: '#ffffff',
                          fontSize: '16px',
                          outline: 'none'
                        }}
                      />
                      {errors.email && <p style={{ color: '#fca5a5', fontSize: '13px', marginTop: '4px' }}>{errors.email.message}</p>}
                    </div>

                    {/* Username */}
                    <div>
                      <label htmlFor="username" style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#ecfdf5', marginBottom: '6px' }}>
                        RecollectKits username
                      </label>
                      <input
                        id="username"
                        type="text"
                        placeholder="If you already have an account"
                        {...register('username')}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          borderRadius: '12px',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          backgroundColor: 'rgba(255, 255, 255, 0.08)',
                          color: '#ffffff',
                          fontSize: '16px',
                          outline: 'none'
                        }}
                      />
                    </div>

                    {/* Partner Type */}
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#ecfdf5', marginBottom: '10px' }}>
                        I am a: <span style={{ color: '#f87171' }}>*</span>
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: '10px' }}>
                        {partnerTypeOptions.map((option) => (
                          <label
                            key={option.value}
                            className="flex items-center gap-3 cursor-pointer rounded-lg"
                            style={{
                              padding: '12px 16px',
                              backgroundColor: watchPartnerType === option.value ? 'rgba(124, 58, 237, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                              border: watchPartnerType === option.value ? '2px solid rgba(124, 58, 237, 0.6)' : '1px solid rgba(255, 255, 255, 0.1)',
                              borderRadius: '12px',
                              transition: 'all 0.2s ease-out'
                            }}
                          >
                            <input
                              type="radio"
                              value={option.value}
                              {...register('partner_type', { required: 'Please select a type' })}
                              style={{ accentColor: '#7C3AED', width: '18px', height: '18px' }}
                            />
                            <span style={{ color: '#ecfdf5', fontSize: '15px', lineHeight: 1.4 }}>{option.label}</span>
                          </label>
                        ))}
                      </div>
                      {errors.partner_type && <p style={{ color: '#fca5a5', fontSize: '13px', marginTop: '4px' }}>{errors.partner_type.message}</p>}
                    </div>

                    {/* Description */}
                    <div>
                      <label htmlFor="description" style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#ecfdf5', marginBottom: '6px' }}>
                        Tell us about your collection or business <span style={{ color: '#f87171' }}>*</span>
                      </label>
                      <textarea
                        id="description"
                        rows={4}
                        placeholder="2-3 sentences about what you do"
                        {...register('description', { required: 'Please tell us about yourself' })}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          borderRadius: '12px',
                          border: errors.description ? '2px solid #f87171' : '1px solid rgba(255, 255, 255, 0.15)',
                          backgroundColor: 'rgba(255, 255, 255, 0.08)',
                          color: '#ffffff',
                          fontSize: '16px',
                          outline: 'none',
                          resize: 'vertical'
                        }}
                      />
                      {errors.description && <p style={{ color: '#fca5a5', fontSize: '13px', marginTop: '4px' }}>{errors.description.message}</p>}
                    </div>

                    {/* Links */}
                    <div>
                      <label htmlFor="links" style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#ecfdf5', marginBottom: '6px' }}>
                        Social/website links
                      </label>
                      <input
                        id="links"
                        type="text"
                        placeholder="Instagram, website, shop URL, etc."
                        {...register('links')}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          borderRadius: '12px',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          backgroundColor: 'rgba(255, 255, 255, 0.08)',
                          color: '#ffffff',
                          fontSize: '16px',
                          outline: 'none'
                        }}
                      />
                    </div>

                    {submitError && (
                      <p style={{ color: '#fca5a5', fontSize: '14px', textAlign: 'center' }}>{submitError}</p>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="hero-cta-btn w-full flex items-center justify-center gap-2 rounded-xl font-semibold"
                      style={{
                        padding: '14px 32px',
                        backgroundColor: isSubmitting ? '#6B7280' : '#7C3AED',
                        color: 'white',
                        fontSize: '17px',
                        border: '2px solid rgba(255, 255, 255, 0.15)',
                        cursor: isSubmitting ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Application'}
                    </button>
                  </form>
                </>
              )}
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
