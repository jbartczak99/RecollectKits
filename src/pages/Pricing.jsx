import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  CheckIcon,
  ArrowRightIcon,
  EnvelopeIcon,
  ChevronDownIcon,
  SparklesIcon,
  ShieldCheckIcon,
  TrophyIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline'

// Section Header Component with decorative line
const SectionHeader = ({ title, subtitle, light = false }) => (
  <div className="text-center section-padding-header">
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

// CSS styles
const pricingStyles = `
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

  /* ===== Pricing Grid ===== */
  .pricing-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }
  @media (max-width: 767px) {
    .pricing-grid {
      grid-template-columns: 1fr;
      max-width: 400px;
      margin-left: auto;
      margin-right: auto;
    }
  }

  /* ===== Enterprise Grid ===== */
  .enterprise-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0;
  }
  @media (max-width: 767px) {
    .enterprise-grid {
      grid-template-columns: 1fr;
    }
    .enterprise-right {
      border-left: none !important;
      border-top: 1px solid rgba(76, 29, 149, 0.08);
    }
  }

  /* ===== Pricing Cards ===== */
  .pricing-card {
    background: linear-gradient(145deg, rgba(124, 58, 237, 0.03) 0%, rgba(255, 255, 255, 1) 100%);
    border: 2px solid transparent;
    border-radius: 1rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease-out;
    overflow: hidden;
  }
  .pricing-card:hover {
    transform: translateY(-8px);
    border-color: #7C3AED;
    box-shadow: 0 20px 25px -5px rgba(124, 58, 237, 0.15), 0 8px 10px -6px rgba(124, 58, 237, 0.1);
  }
  .pricing-card.featured {
    border-color: #7C3AED;
    box-shadow: 0 10px 30px -5px rgba(124, 58, 237, 0.25);
    position: relative;
  }
  .pricing-card.featured:hover {
    box-shadow: 0 25px 35px -5px rgba(124, 58, 237, 0.3), 0 10px 15px -6px rgba(124, 58, 237, 0.15);
  }

  /* ===== Section Backgrounds ===== */
  .section-purple-light {
    background-color: #F5F3FF;
  }
  .section-gray-light {
    background-color: #F9FAFB;
  }

  /* ===== Background Patterns ===== */
  .pattern-diagonal {
    background-image: repeating-linear-gradient(
      45deg,
      transparent,
      transparent 20px,
      rgba(124, 58, 237, 0.03) 20px,
      rgba(124, 58, 237, 0.03) 40px
    );
  }

  /* ===== FAQ ===== */
  .faq-item {
    background: white;
    border-radius: 12px;
    border: 1px solid #E5E7EB;
    transition: all 0.3s ease-out;
    overflow: hidden;
  }
  .faq-item:hover {
    border-color: rgba(124, 58, 237, 0.3);
    box-shadow: 0 4px 12px -2px rgba(124, 58, 237, 0.1);
  }
  .faq-item.open {
    border-color: rgba(124, 58, 237, 0.4);
    box-shadow: 0 4px 12px -2px rgba(124, 58, 237, 0.1);
  }
  .faq-trigger {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px;
    background: none;
    border: none;
    cursor: pointer;
    text-align: left;
    transition: background-color 0.2s ease-out;
  }
  .faq-trigger:hover {
    background-color: #FAFAFA;
  }
  .faq-trigger:focus-visible {
    outline: 3px solid #7C3AED;
    outline-offset: -3px;
    border-radius: 12px;
  }
  .faq-chevron {
    transition: transform 0.3s ease-out;
    flex-shrink: 0;
  }
  .faq-chevron.open {
    transform: rotate(180deg);
  }
  .faq-answer {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease-out, padding 0.3s ease-out;
  }
  .faq-answer.open {
    max-height: 500px;
  }

  /* ===== Legends Pass ===== */
  .legends-card {
    background: linear-gradient(145deg, #ffffff 0%, #F9FAFB 100%);
    border-radius: 1.5rem;
    box-shadow: 0 10px 40px -10px rgba(124, 58, 237, 0.15);
    border: 1px solid rgba(124, 58, 237, 0.12);
    overflow: hidden;
    transition: all 0.3s ease-out;
    position: relative;
  }
  .legends-card:hover {
    box-shadow: 0 15px 50px -10px rgba(124, 58, 237, 0.2);
    border-color: rgba(124, 58, 237, 0.2);
  }
  .legends-blurred {
    filter: blur(8px);
    user-select: none;
    pointer-events: none;
  }
  .legends-card:hover .legends-blurred {
    filter: blur(6px);
  }
  .legends-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: linear-gradient(145deg, rgba(245, 243, 255, 0.65) 0%, rgba(255, 255, 255, 0.7) 100%);
    z-index: 10;
    text-align: center;
    padding: 24px;
  }
  .legends-lock-circle {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
    box-shadow: 0 8px 24px rgba(124, 58, 237, 0.3);
  }
  .legends-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0;
  }
  .legends-features-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  @media (max-width: 767px) {
    .legends-grid {
      grid-template-columns: 1fr;
    }
    .legends-right {
      border-left: none !important;
      border-top: 1px solid rgba(124, 58, 237, 0.08);
    }
    .legends-features-grid {
      grid-template-columns: 1fr;
    }
  }

  /* ===== Enterprise Card ===== */
  .enterprise-card {
    background: linear-gradient(145deg, #ffffff 0%, #F9FAFB 100%);
    border-radius: 1.5rem;
    box-shadow: 0 10px 40px -10px rgba(76, 29, 149, 0.15);
    border: 1px solid rgba(76, 29, 149, 0.12);
    overflow: hidden;
    transition: all 0.3s ease-out;
  }
  .enterprise-card:hover {
    box-shadow: 0 15px 50px -10px rgba(76, 29, 149, 0.2);
    border-color: rgba(76, 29, 149, 0.2);
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

export default function Pricing() {
  const [visibleSections, setVisibleSections] = useState({})
  const [openFaq, setOpenFaq] = useState(null)
  const sectionRefs = useRef({})

  // Intersection observer for section fade-in
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => ({
              ...prev,
              [entry.target.id]: true
            }))
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

  const tiers = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      period: '',
      description: 'Get started with the essentials for casual collectors.',
      features: [
        'Up to 15 jerseys in collection',
        '3 custom collections',
        '15 wishlist items',
        'Public profile with Top 3 showcase',
        'Unlimited friends',
        'Basic search & filters',
        'Jersey submissions'
      ],
      cta: 'Get Started',
      ctaLink: '/auth',
      featured: false
    },
    {
      id: 'pro',
      name: 'Pro',
      comingSoon: true,
      description: 'For serious collectors who want the full experience.',
      features: [
        'Everything in Free',
        'Unlimited jerseys',
        'Unlimited collections',
        'Unlimited wishlist',
        'Analytics dashboard & charts',
        'Growth timeline & insights',
        'Pro member badge',
        'Friend analytics',
        'Advanced search & filters',
        'Export collection data'
      ],
      cta: 'Coming Soon',
      ctaLink: null,
      featured: true
    },
    {
      id: 'creator',
      name: 'Creator',
      comingSoon: true,
      subtitle: 'Feature set in development',
      description: 'For content creators, influencers, and kit reviewers.',
      features: [
        'Everything in Pro',
        'Social media export templates',
        'Streaming overlays (OBS-compatible)',
        'Bulk export operations',
        'Custom branding & watermarks',
        'Content planning tools',
        'Creator badge on profile',
        'Priority support'
      ],
      cta: 'Coming Soon',
      ctaLink: null,
      featured: false
    }
  ]

  const faqs = [
    {
      id: 'free-forever',
      question: 'Is the Free plan really free forever?',
      answer: 'Yes! Free is free forever with no credit card required. You can catalog up to 15 jerseys, create 3 collections, and track 15 wishlist items at no cost. Upgrade to Pro only if you need more.'
    },
    {
      id: 'free-limits',
      question: 'What happens when I hit my Free tier limits?',
      answer: 'You can still view and manage your existing collection, but you won\'t be able to add new items until you upgrade to Pro or remove some items to get back under the limit. We never delete your data.'
    },
    {
      id: 'cancel',
      question: 'Can I cancel my subscription at any time?',
      answer: 'Yes. You can cancel anytime from your account settings. You\'ll keep access to paid features until the end of your billing period, then your account reverts to Free.'
    },
    {
      id: 'downgrade',
      question: 'If I downgrade, what happens to my jerseys?',
      answer: 'Your jerseys stay safe. You\'ll still be able to view your entire collection, but you won\'t be able to add new items until you\'re back under Free tier limits.'
    },
    {
      id: 'payment',
      question: 'What payment methods do you accept?',
      answer: 'We\'ll accept all major credit cards when paid plans launch. More payment options may be added based on demand.'
    },
    {
      id: 'switch',
      question: 'Can I switch plans later?',
      answer: 'Yes. Upgrade anytime and get immediate access to new features. If you downgrade, you\'ll keep your current plan until the end of your billing period.'
    },
    {
      id: 'launch',
      question: 'When will paid plans be available?',
      answer: 'Paid plans are coming soon. Sign up for Free now to be first to know when Pro and Creator launch — early adopters may receive special founding member pricing.'
    },
    {
      id: 'legends-pass',
      question: 'What is Legends Pass?',
      answer: 'Legends Pass is a premium add-on that gives you exclusive access to celebrity and pro player collections, behind-the-scenes interviews, and Q&A sessions. It will be available as an add-on to Pro or Creator tiers.'
    },
    {
      id: 'vintage-only',
      question: 'Is RecollectKits only for vintage jerseys?',
      answer: 'No! RecollectKits is for all soccer jerseys — vintage, retro, current season, match-worn, replicas, authentics, and everything in between from any league or country.'
    }
  ]

  const scrollToContact = () => {
    const contactSection = document.getElementById('contact')
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="space-y-0">
      <style>{pricingStyles}</style>

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
            Simple, Transparent Pricing
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
            Choose the plan that fits your collecting journey
          </p>

          <p
            className="max-w-xl mx-auto"
            style={{
              fontSize: '18px',
              lineHeight: 1.6,
              color: 'rgba(255, 255, 255, 0.8)'
            }}
          >
            Start for free and upgrade when you're ready. No hidden fees, no surprises.
          </p>
        </div>
      </section>

      {/* ===== Pricing Tiers Section ===== */}
      <section
        id="pricing-tiers"
        ref={setSectionRef('pricing-tiers')}
        className={`section-padding transition-all duration-700 ${visibleSections['pricing-tiers'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      >
        <SectionHeader
          title="Plans & Pricing"
          subtitle="Whether you're just getting started or managing a serious collection, we have a plan for you."
        />

        <div className="max-w-5xl mx-auto pricing-grid">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`pricing-card ${tier.featured ? 'featured' : ''}`}
              style={{ display: 'flex', flexDirection: 'column' }}
            >
              {/* Most Popular badge */}
              {tier.featured && (
                <div
                  style={{
                    backgroundColor: '#7C3AED',
                    padding: '8px 0',
                    textAlign: 'center'
                  }}
                >
                  <div className="flex items-center justify-center gap-2">
                    <SparklesIcon className="flex-shrink-0" style={{ width: '14px', height: '14px', color: '#ffffff' }} aria-hidden="true" />
                    <span
                      style={{
                        color: '#ffffff',
                        fontSize: '13px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}
                    >
                      Most Popular
                    </span>
                  </div>
                </div>
              )}

              <div className="p-6 md:p-8" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Tier name */}
                <h3
                  style={{
                    color: '#1F2937',
                    fontFamily: 'Darker Grotesque, sans-serif',
                    fontSize: '24px',
                    fontWeight: 800,
                    lineHeight: 1.2,
                    marginBottom: '8px'
                  }}
                >
                  {tier.name}
                </h3>

                {/* Subtitle */}
                {tier.subtitle && (
                  <p
                    style={{
                      color: '#7C3AED',
                      fontSize: '13px',
                      fontWeight: 600,
                      fontStyle: 'italic',
                      marginBottom: '8px'
                    }}
                  >
                    {tier.subtitle}
                  </p>
                )}

                {/* Price */}
                <div className="flex items-baseline gap-1" style={{ marginBottom: '8px' }}>
                  {tier.comingSoon ? (
                    <span
                      style={{
                        fontFamily: 'Darker Grotesque, sans-serif',
                        fontSize: '36px',
                        fontWeight: 800,
                        lineHeight: 1.2,
                        letterSpacing: '-0.5px',
                        color: '#7C3AED'
                      }}
                    >
                      Coming Soon
                    </span>
                  ) : (
                    <>
                      <span
                        style={{
                          fontFamily: 'Darker Grotesque, sans-serif',
                          fontSize: '48px',
                          fontWeight: 800,
                          lineHeight: 1.2,
                          letterSpacing: '-0.5px',
                          color: tier.featured ? '#7C3AED' : '#1F2937'
                        }}
                      >
                        {tier.price}
                      </span>
                      <span style={{ color: '#4B5563', fontSize: '16px', lineHeight: 1.6 }}>
                        {tier.period}
                      </span>
                    </>
                  )}
                </div>

                {/* Description */}
                <p
                  style={{
                    color: '#4B5563',
                    fontSize: '16px',
                    lineHeight: 1.6,
                    marginBottom: '24px'
                  }}
                >
                  {tier.description}
                </p>

                {/* Divider */}
                <div style={{ height: '1px', backgroundColor: '#E5E7EB', marginBottom: '24px' }} />

                {/* Features */}
                <ul className="space-y-3" style={{ flex: 1 }}>
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span
                        className="flex-shrink-0 mt-0.5 font-bold"
                        style={{ color: '#205A40', fontSize: '16px' }}
                        aria-hidden="true"
                      >
                        &#10003;
                      </span>
                      <span style={{ color: '#1F2937', fontSize: '15px', lineHeight: 1.6 }}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <div style={{ marginTop: '32px' }}>
                  {tier.ctaLink ? (
                    <Link
                      to={tier.ctaLink}
                      className="focus-ring"
                      style={{
                        display: 'block',
                        width: '100%',
                        textAlign: 'center',
                        padding: '14px 24px',
                        borderRadius: '12px',
                        fontWeight: 600,
                        fontSize: '16px',
                        lineHeight: 1.6,
                        backgroundColor: tier.featured ? '#7C3AED' : 'transparent',
                        color: tier.featured ? '#ffffff' : '#7C3AED',
                        border: tier.featured ? '2px solid #7C3AED' : '2px solid #7C3AED',
                        transition: 'all 0.3s ease-out',
                        textDecoration: 'none'
                      }}
                    >
                      {tier.cta}
                    </Link>
                  ) : (
                    <button
                      disabled
                      className="focus-ring"
                      style={{
                        display: 'block',
                        width: '100%',
                        textAlign: 'center',
                        padding: '14px 24px',
                        borderRadius: '12px',
                        fontWeight: 600,
                        fontSize: '16px',
                        lineHeight: 1.6,
                        backgroundColor: tier.featured ? '#7C3AED' : 'transparent',
                        color: tier.featured ? '#ffffff' : '#7C3AED',
                        border: '2px solid #7C3AED',
                        cursor: 'default',
                        opacity: 0.7,
                        transition: 'all 0.3s ease-out'
                      }}
                    >
                      {tier.cta}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

      </section>

      {/* ===== Legends Pass Section ===== */}
      <section
        id="legends-pass"
        ref={setSectionRef('legends-pass')}
        className={`-mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 section-purple-light section-padding transition-all duration-700 ${visibleSections['legends-pass'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      >
        {/* Visible header content */}
        <div className="text-center section-padding-header">
          <div
            className="mx-auto mb-6"
            style={{
              width: '60px',
              height: '4px',
              backgroundColor: '#7C3AED',
              borderRadius: '2px'
            }}
          />
          <div
            className="inline-flex items-center gap-2 rounded-full mb-4"
            style={{ padding: '6px 16px', backgroundColor: 'rgba(124, 58, 237, 0.08)' }}
          >
            <TrophyIcon className="flex-shrink-0" style={{ color: '#7C3AED', width: '14px', height: '14px' }} aria-hidden="true" />
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#7C3AED', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Premium Add-On
            </span>
          </div>
          <h2
            style={{
              color: '#7C3AED',
              fontFamily: 'Darker Grotesque, sans-serif',
              fontSize: '36px',
              fontWeight: 800,
              lineHeight: 1.2,
              letterSpacing: '-0.5px',
              marginBottom: '16px'
            }}
          >
            Legends Pass
          </h2>
        </div>

        {/* Blurred card with overlay */}
        <div className="max-w-3xl mx-auto">
          <div className="legends-card">
            {/* Overlay */}
            <div className="legends-overlay">
              <div className="legends-lock-circle">
                <LockClosedIcon className="flex-shrink-0" style={{ width: '28px', height: '28px', color: '#ffffff' }} aria-hidden="true" />
              </div>
              <h3
                style={{
                  fontFamily: 'Darker Grotesque, sans-serif',
                  fontSize: '28px',
                  fontWeight: 800,
                  lineHeight: 1.2,
                  letterSpacing: '-0.5px',
                  color: '#1F2937'
                }}
              >
                Coming Soon
              </h3>
            </div>

            {/* Blurred background content (teaser) */}
            <div className="legends-blurred" aria-hidden="true">
              <div className="legends-grid">
                <div className="p-6 md:p-10">
                  <p style={{ color: '#4B5563', fontSize: '16px', lineHeight: 1.6, marginBottom: '16px' }}>
                    Legends Pass unlocks a world of premium content from the biggest names in football. See how legends organize their personal collections and hear the stories behind their most prized jerseys.
                  </p>
                  <p style={{ color: '#4B5563', fontSize: '16px', lineHeight: 1.6 }}>
                    Get early access to new celebrity partnerships, exclusive behind-the-scenes footage, and connect directly with legendary collectors.
                  </p>
                </div>
                <div
                  className="legends-right p-6 md:p-10"
                  style={{
                    backgroundColor: 'rgba(124, 58, 237, 0.03)',
                    borderLeft: '1px solid rgba(124, 58, 237, 0.08)'
                  }}
                >
                  <p style={{ color: '#7C3AED', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>
                    What's Included
                  </p>
                  <div className="legends-features-grid">
                    {[
                      'Celebrity & pro player collections',
                      'Exclusive video interviews',
                      'Q&A access with legends',
                      'Behind-the-scenes content',
                      'Collection tour videos',
                      'Early access to partnerships'
                    ].map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <span className="flex-shrink-0 mt-0.5 font-bold" style={{ color: '#205A40', fontSize: '16px' }}>&#10003;</span>
                        <span style={{ color: '#1F2937', fontSize: '15px', lineHeight: 1.6 }}>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== League & Club Partners Section ===== */}
      <section
        id="league-club"
        ref={setSectionRef('league-club')}
        className={`-mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 section-gray-light section-padding transition-all duration-700 ${visibleSections['league-club'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      >
        <SectionHeader
          title="League & Club Partners"
          subtitle="Custom digital museum solutions for clubs and leagues of all sizes"
        />

        <div className="max-w-3xl mx-auto">
          <div className="enterprise-card">
            <div className="enterprise-grid">
              {/* Left side - Info */}
              <div className="p-6 md:p-10" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div
                  className="inline-flex items-center gap-2 rounded-full mb-6"
                  style={{ padding: '6px 16px', backgroundColor: 'rgba(76, 29, 149, 0.08)', alignSelf: 'flex-start' }}
                >
                  <ShieldCheckIcon className="flex-shrink-0" style={{ color: '#4C1D95', width: '14px', height: '14px' }} aria-hidden="true" />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#4C1D95', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Custom Solutions
                  </span>
                </div>

                <h3
                  style={{
                    fontFamily: 'Darker Grotesque, sans-serif',
                    fontSize: '28px',
                    fontWeight: 800,
                    lineHeight: 1.2,
                    letterSpacing: '-0.5px',
                    color: '#1F2937',
                    marginBottom: '12px'
                  }}
                >
                  Digital Museum Services
                </h3>

                <p style={{ color: '#4B5563', fontSize: '16px', lineHeight: 1.6, marginBottom: '24px' }}>
                  We help football clubs and leagues preserve their kit heritage with stunning digital archives. Every club has a story — let us help you tell it.
                </p>

                <button
                  onClick={scrollToContact}
                  className="hero-cta-btn inline-flex items-center gap-2 rounded-xl font-semibold"
                  style={{
                    padding: '14px 28px',
                    backgroundColor: '#4C1D95',
                    color: '#ffffff',
                    fontSize: '16px',
                    lineHeight: 1.6,
                    border: 'none',
                    alignSelf: 'flex-start',
                    cursor: 'pointer'
                  }}
                >
                  <EnvelopeIcon className="flex-shrink-0" style={{ width: '18px', height: '18px', color: '#ffffff' }} aria-hidden="true" />
                  <span>Get in Touch</span>
                  <ArrowRightIcon className="flex-shrink-0" style={{ width: '16px', height: '16px', color: '#ffffff' }} aria-hidden="true" />
                </button>
              </div>

              {/* Right side - Feature list */}
              <div
                className="enterprise-right p-6 md:p-10"
                style={{
                  backgroundColor: 'rgba(76, 29, 149, 0.03)',
                  borderLeft: '1px solid rgba(76, 29, 149, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}
              >
                <p
                  style={{
                    color: '#4C1D95',
                    fontWeight: 700,
                    fontSize: '13px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '16px'
                  }}
                >
                  What's Included
                </p>
                <ul className="space-y-4">
                  {[
                    'Interactive kit history timelines',
                    'Heritage archive with detailed provenance',
                    'Fan engagement & voting tools',
                    'Merchandise & retail integration',
                    'Dedicated account management'
                  ].map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span
                        className="flex-shrink-0 mt-0.5 font-bold"
                        style={{ color: '#205A40', fontSize: '16px' }}
                        aria-hidden="true"
                      >
                        &#10003;
                      </span>
                      <span style={{ color: '#1F2937', fontSize: '15px', lineHeight: 1.6 }}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ===== FAQ Section ===== */}
      <section
        id="faq"
        ref={setSectionRef('faq')}
        className={`-mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 section-purple-light pattern-diagonal section-padding transition-all duration-700 ${visibleSections['faq'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      >
        <SectionHeader
          title="Frequently Asked Questions"
          subtitle="Everything you need to know about our plans"
        />

        <div className="max-w-2xl mx-auto" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {faqs.map((faq) => {
            const isOpen = openFaq === faq.id
            return (
              <div key={faq.id} className={`faq-item ${isOpen ? 'open' : ''}`}>
                <button
                  className="faq-trigger"
                  onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                  aria-expanded={isOpen}
                >
                  <span
                    style={{
                      fontFamily: 'Darker Grotesque, sans-serif',
                      fontSize: '18px',
                      fontWeight: 800,
                      lineHeight: 1.3,
                      color: '#1F2937',
                      paddingRight: '16px'
                    }}
                  >
                    {faq.question}
                  </span>
                  <ChevronDownIcon
                    className={`faq-chevron ${isOpen ? 'open' : ''}`}
                    style={{ width: '20px', height: '20px', color: '#7C3AED' }}
                    aria-hidden="true"
                  />
                </button>
                <div className={`faq-answer ${isOpen ? 'open' : ''}`}>
                  <div style={{ padding: '0 24px 20px' }}>
                    <p style={{ color: '#4B5563', fontSize: '16px', lineHeight: 1.6 }}>
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
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
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(255, 255, 255, 0.07)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.12)'
            }}
          >
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
                Have Questions?
              </h2>
              <p style={{ fontSize: '16px', lineHeight: 1.6, color: 'rgba(209, 250, 229, 0.8)', marginBottom: '24px' }}>
                Need help choosing a plan or have a custom request? We'd love to hear from you.
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
            Ready to start your collection journey?
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center" style={{ gap: '16px' }}>
            <Link
              to="/auth"
              className="btn btn-primary inline-flex items-center gap-2 focus-ring"
              style={{ backgroundColor: '#7C3AED' }}
            >
              <span>Sign Up Free</span>
              <ArrowRightIcon className="flex-shrink-0" style={{ width: '16px', height: '16px' }} aria-hidden="true" />
            </Link>
            <Link
              to="/partners"
              className="btn btn-secondary inline-flex items-center gap-2 focus-ring"
            >
              <span>Become a Partner</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
