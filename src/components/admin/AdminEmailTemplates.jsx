import { useState } from 'react'

// Import all email templates
import WaitlistConfirmationEmail from '../../../lib/emails/templates/WaitlistConfirmationEmail'
import WelcomeEmail from '../../../lib/emails/templates/WelcomeEmail'
import PasswordResetEmail from '../../../lib/emails/templates/PasswordResetEmail'
import FriendRequestEmail from '../../../lib/emails/templates/FriendRequestEmail'
import FeaturedOnHomepageEmail from '../../../lib/emails/templates/FeaturedOnHomepageEmail'
import BadgeEarnedEmail from '../../../lib/emails/templates/BadgeEarnedEmail'
import SubscriptionConfirmEmail from '../../../lib/emails/templates/SubscriptionConfirmEmail'
import SubscriptionExpiringEmail from '../../../lib/emails/templates/SubscriptionExpiringEmail'
import PartnerAppReceivedEmail from '../../../lib/emails/templates/PartnerAppReceivedEmail'
import PartnerAppApprovedEmail from '../../../lib/emails/templates/PartnerAppApprovedEmail'
import PartnerAppDeniedEmail from '../../../lib/emails/templates/PartnerAppDeniedEmail'

const TEMPLATES = [
  {
    name: 'Waitlist Confirmation',
    category: 'Transactional',
    description: 'Sent when someone joins the waitlist',
    subject: 'RecollectKits Waitlist Confirmation',
    sender: 'hello@recollectkits.com',
    component: WaitlistConfirmationEmail,
    props: {
      firstName: { type: 'string', description: "User's first name" },
      interest: { type: 'string', description: 'Interest type (collector, creator, shop, club)' },
    },
    previewProps: { firstName: '{firstName}', interest: '{interest}' },
  },
  {
    name: 'Welcome',
    category: 'Transactional',
    description: 'Sent on successful signup',
    subject: 'Welcome to RecollectKits!',
    sender: 'hello@recollectkits.com',
    component: WelcomeEmail,
    props: {
      username: { type: 'string', description: "User's username" },
    },
    previewProps: { username: '{username}' },
  },
  {
    name: 'Password Reset',
    category: 'Transactional',
    description: 'Sent when user requests password reset',
    subject: 'Reset your RecollectKits password',
    sender: 'hello@recollectkits.com',
    component: PasswordResetEmail,
    props: {
      resetLink: { type: 'string', description: 'Password reset URL with token' },
    },
    previewProps: { resetLink: 'https://recollectkits.com/reset-password?token=...' },
  },
  {
    name: 'Friend Request',
    category: 'Notification',
    description: 'Sent when someone receives a friend request',
    subject: '{senderUsername} sent you a friend request',
    sender: 'notifications@recollectkits.com',
    component: FriendRequestEmail,
    props: {
      recipientName: { type: 'string', description: "Recipient's display name" },
      senderUsername: { type: 'string', description: "Sender's username" },
      senderAvatarUrl: { type: 'string|null', description: "Sender's avatar URL" },
      viewRequestUrl: { type: 'string', description: 'URL to view the request' },
    },
    previewProps: {
      recipientName: '{recipientName}',
      senderUsername: '{senderUsername}',
      senderAvatarUrl: null,
      viewRequestUrl: 'https://recollectkits.com/@{senderUsername}',
    },
  },
  {
    name: 'Featured on Homepage',
    category: 'Notification',
    description: 'Sent when a collection is featured',
    subject: "You're featured on the homepage!",
    sender: 'notifications@recollectkits.com',
    component: FeaturedOnHomepageEmail,
    props: {
      username: { type: 'string', description: "User's username" },
    },
    previewProps: { username: '{username}' },
  },
  {
    name: 'Badge Earned',
    category: 'Notification',
    description: 'Sent when user earns a badge',
    subject: 'You earned the {badgeName} badge!',
    sender: 'notifications@recollectkits.com',
    component: BadgeEarnedEmail,
    props: {
      username: { type: 'string', description: "User's username" },
      badgeName: { type: 'string', description: 'Name of the badge earned' },
      badgeDescription: { type: 'string', description: 'Description of the badge' },
    },
    previewProps: { username: '{username}', badgeName: '{badgeName}', badgeDescription: '{badgeDescription}' },
  },
  {
    name: 'Subscription Confirmed',
    category: 'Subscription',
    description: 'Sent on successful plan upgrade',
    subject: 'Welcome to {planName}!',
    sender: 'hello@recollectkits.com',
    component: SubscriptionConfirmEmail,
    props: {
      username: { type: 'string', description: "User's username" },
      planName: { type: 'string', description: 'Subscription plan name' },
      price: { type: 'string', description: 'Monthly price' },
      nextBillingDate: { type: 'string', description: 'Next billing date' },
    },
    previewProps: { username: '{username}', planName: '{planName}', price: '{price}', nextBillingDate: '{nextBillingDate}' },
  },
  {
    name: 'Subscription Expiring',
    category: 'Subscription',
    description: 'Sent before subscription expires',
    subject: 'Your subscription expires soon',
    sender: 'hello@recollectkits.com',
    component: SubscriptionExpiringEmail,
    props: {
      username: { type: 'string', description: "User's username" },
      planName: { type: 'string', description: 'Subscription plan name' },
      expirationDate: { type: 'string', description: 'Expiration date' },
    },
    previewProps: { username: '{username}', planName: '{planName}', expirationDate: '{expirationDate}' },
  },
  {
    name: 'Partner App Received',
    category: 'Partner',
    description: 'Sent when partner application is submitted',
    subject: "We've received your partner application",
    sender: 'partners@recollectkits.com',
    component: PartnerAppReceivedEmail,
    props: {
      partnerName: { type: 'string', description: 'Partner business name' },
      partnerType: { type: 'string', description: 'Type of partner' },
    },
    previewProps: { partnerName: '{partnerName}', partnerType: '{partnerType}' },
  },
  {
    name: 'Partner App Approved',
    category: 'Partner',
    description: 'Sent when partner application is approved',
    subject: 'Your partner application was approved!',
    sender: 'partners@recollectkits.com',
    component: PartnerAppApprovedEmail,
    props: {
      partnerName: { type: 'string', description: 'Partner business name' },
      partnerType: { type: 'string', description: 'Type of partner' },
    },
    previewProps: { partnerName: '{partnerName}', partnerType: '{partnerType}' },
  },
  {
    name: 'Partner App Denied',
    category: 'Partner',
    description: 'Sent when partner application is denied',
    subject: 'Update on your partner application',
    sender: 'partners@recollectkits.com',
    component: PartnerAppDeniedEmail,
    props: {
      partnerName: { type: 'string', description: 'Partner business name' },
      reason: { type: 'string|null', description: 'Denial reason (optional)' },
    },
    previewProps: { partnerName: '{partnerName}', reason: '{reason}' },
  },
]

const CATEGORIES = ['All', 'Transactional', 'Notification', 'Subscription', 'Partner']

const CATEGORY_COLORS = {
  Transactional: { bg: '#dbeafe', text: '#1e40af' },
  Notification: { bg: '#f3e8ff', text: '#6b21a8' },
  Subscription: { bg: '#d1fae5', text: '#065f46' },
  Partner: { bg: '#fef3c7', text: '#92400e' },
}

export default function AdminEmailTemplates() {
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [filterCategory, setFilterCategory] = useState('All')
  const [viewMode, setViewMode] = useState('desktop') // desktop | mobile
  const [previewTab, setPreviewTab] = useState('preview') // preview | code

  const filtered = filterCategory === 'All'
    ? TEMPLATES
    : TEMPLATES.filter(t => t.category === filterCategory)

  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '16px', flexWrap: 'wrap', gap: '12px'
      }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1F2937', margin: 0 }}>
          Email Templates ({TEMPLATES.length})
        </h2>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              style={{
                padding: '4px 12px',
                fontSize: '13px',
                fontWeight: filterCategory === cat ? 600 : 400,
                borderRadius: '9999px',
                border: 'none',
                cursor: 'pointer',
                background: filterCategory === cat ? '#7C3AED' : '#f3f4f6',
                color: filterCategory === cat ? 'white' : '#4b5563',
                transition: 'all 0.15s',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Template Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px', marginBottom: '16px' }}>
        {filtered.map(template => {
          const catColor = CATEGORY_COLORS[template.category]
          const isSelected = selectedTemplate?.name === template.name
          return (
            <button
              key={template.name}
              onClick={() => {
                setSelectedTemplate(isSelected ? null : template)
                setPreviewTab('preview')
              }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: '16px',
                backgroundColor: isSelected ? '#faf5ff' : 'white',
                borderRadius: '10px',
                border: isSelected ? '2px solid #7C3AED' : '1px solid #e5e7eb',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s',
                width: '100%',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', width: '100%' }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#1F2937' }}>{template.name}</span>
              </div>
              <span style={{
                display: 'inline-block',
                padding: '2px 8px',
                fontSize: '11px',
                fontWeight: 500,
                borderRadius: '9999px',
                background: catColor.bg,
                color: catColor.text,
                marginBottom: '6px',
              }}>
                {template.category}
              </span>
              <span style={{ fontSize: '12px', color: '#6B7280', lineHeight: 1.4 }}>
                {template.description}
              </span>
            </button>
          )
        })}
      </div>

      {/* Preview Panel */}
      {selectedTemplate && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          overflow: 'hidden',
        }}>
          {/* Preview Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 20px',
            borderBottom: '1px solid #e5e7eb',
            backgroundColor: '#fafafa',
            flexWrap: 'wrap',
            gap: '8px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '15px', fontWeight: 600, color: '#1F2937' }}>
                {selectedTemplate.name}
              </span>
              <span style={{
                padding: '2px 8px', fontSize: '11px', fontWeight: 500,
                borderRadius: '9999px',
                background: CATEGORY_COLORS[selectedTemplate.category].bg,
                color: CATEGORY_COLORS[selectedTemplate.category].text,
              }}>
                {selectedTemplate.category}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {/* Preview / Code toggle */}
              <button
                onClick={() => setPreviewTab('preview')}
                style={{
                  padding: '6px 10px', border: 'none', borderRadius: '6px', cursor: 'pointer',
                  background: previewTab === 'preview' ? '#7C3AED' : '#f3f4f6',
                  color: previewTab === 'preview' ? 'white' : '#6b7280',
                  fontSize: '13px', fontWeight: 500,
                }}
              >
                Preview
              </button>
              <button
                onClick={() => setPreviewTab('code')}
                style={{
                  padding: '6px 10px', border: 'none', borderRadius: '6px', cursor: 'pointer',
                  background: previewTab === 'code' ? '#7C3AED' : '#f3f4f6',
                  color: previewTab === 'code' ? 'white' : '#6b7280',
                  fontSize: '13px', fontWeight: 500,
                }}
              >
                Code
              </button>

              {/* Separator */}
              <div style={{ width: '1px', height: '20px', backgroundColor: '#e5e7eb', margin: '0 4px' }} />

              {/* Viewport toggle (only in preview mode) */}
              {previewTab === 'preview' && (
                <>
                  <button
                    onClick={() => setViewMode('desktop')}
                    title="Desktop view"
                    style={{
                      padding: '6px 10px', border: 'none', borderRadius: '6px', cursor: 'pointer',
                      background: viewMode === 'desktop' ? '#374151' : '#f3f4f6',
                      color: viewMode === 'desktop' ? 'white' : '#6b7280',
                      fontSize: '13px', fontWeight: 500,
                    }}
                  >
                    Desktop
                  </button>
                  <button
                    onClick={() => setViewMode('mobile')}
                    title="Mobile view"
                    style={{
                      padding: '6px 10px', border: 'none', borderRadius: '6px', cursor: 'pointer',
                      background: viewMode === 'mobile' ? '#374151' : '#f3f4f6',
                      color: viewMode === 'mobile' ? 'white' : '#6b7280',
                      fontSize: '13px', fontWeight: 500,
                    }}
                  >
                    Mobile
                  </button>
                </>
              )}

              <button
                onClick={() => setSelectedTemplate(null)}
                title="Close preview"
                style={{
                  padding: '6px 10px', border: 'none', borderRadius: '6px', cursor: 'pointer',
                  background: '#f3f4f6', color: '#6b7280', fontSize: '13px', marginLeft: '4px',
                }}
              >
                Close
              </button>
            </div>
          </div>

          {/* Email metadata */}
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #f3f4f6', fontSize: '13px', color: '#6B7280' }}>
            <div style={{ marginBottom: '4px' }}>
              <strong style={{ color: '#374151' }}>From:</strong> RecollectKits &lt;{selectedTemplate.sender}&gt;
            </div>
            <div style={{ marginBottom: '4px' }}>
              <strong style={{ color: '#374151' }}>To:</strong> {'<recipient>'}
            </div>
            <div>
              <strong style={{ color: '#374151' }}>Subject:</strong>{' '}
              <span style={{ color: '#1F2937' }}>{selectedTemplate.subject}</span>
            </div>
          </div>

          {previewTab === 'preview' ? (
            <>
              {/* Rendered Email Preview */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                padding: '24px',
                backgroundColor: '#f9fafb',
                minHeight: '400px',
              }}>
                <div style={{
                  width: viewMode === 'mobile' ? '375px' : '100%',
                  maxWidth: '700px',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  overflow: 'hidden',
                  transition: 'width 0.3s ease',
                }}>
                  {selectedTemplate.component(selectedTemplate.previewProps)}
                </div>
              </div>

              {/* Props reference */}
              <div style={{
                padding: '16px 20px',
                borderTop: '1px solid #f3f4f6',
                backgroundColor: '#fafafa',
              }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
                  Template Variables
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {Object.entries(selectedTemplate.props).map(([key, info]) => (
                    <span
                      key={key}
                      title={info.description}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '3px 10px',
                        fontSize: '12px',
                        fontFamily: 'monospace',
                        backgroundColor: '#f3e8ff',
                        color: '#6b21a8',
                        borderRadius: '4px',
                        cursor: 'help',
                      }}
                    >
                      {'{' + key + '}'}
                      <span style={{ color: '#a78bfa', fontSize: '10px' }}>{info.type}</span>
                    </span>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* Code View */
            <div style={{
              padding: '20px',
              backgroundColor: '#1e1b4b',
              minHeight: '400px',
              overflow: 'auto',
            }}>
              <TemplateCodeView template={selectedTemplate} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/** Renders a syntax-highlighted-ish view of the template's props and file path */
function TemplateCodeView({ template }) {
  const fileName = template.name.replace(/\s+/g, '') + 'Email'
  const propsEntries = Object.entries(template.props)

  return (
    <pre style={{
      margin: 0,
      fontFamily: "'SF Mono', 'Fira Code', 'Consolas', monospace",
      fontSize: '13px',
      lineHeight: 1.7,
      color: '#e0e7ff',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
    }}>
      <span style={{ color: '#818cf8' }}>{'// '}</span>
      <span style={{ color: '#6b7280' }}>lib/emails/templates/{fileName}.jsx</span>
      {'\n\n'}
      <span style={{ color: '#c084fc' }}>import</span>
      {' { '}
      <span style={{ color: '#fbbf24' }}>{fileName}</span>
      {' } '}
      <span style={{ color: '#c084fc' }}>from</span>
      {' '}
      <span style={{ color: '#34d399' }}>'{`./templates/${fileName}`}'</span>
      {'\n\n'}
      <span style={{ color: '#818cf8' }}>{'// '}</span>
      <span style={{ color: '#6b7280' }}>Props</span>
      {'\n'}
      {'{\n'}
      {propsEntries.map(([key, info], i) => (
        <span key={key}>
          {'  '}
          <span style={{ color: '#fbbf24' }}>{key}</span>
          <span style={{ color: '#818cf8' }}>: </span>
          <span style={{ color: '#34d399' }}>{info.type}</span>
          <span style={{ color: '#6b7280' }}>{' // ' + info.description}</span>
          {i < propsEntries.length - 1 ? ',' : ''}
          {'\n'}
        </span>
      ))}
      {'}\n\n'}
      <span style={{ color: '#818cf8' }}>{'// '}</span>
      <span style={{ color: '#6b7280' }}>Sender</span>
      {'\n'}
      <span style={{ color: '#c084fc' }}>from</span>
      {': '}
      <span style={{ color: '#34d399' }}>'{template.sender}'</span>
      {'\n'}
      <span style={{ color: '#c084fc' }}>subject</span>
      {': '}
      <span style={{ color: '#34d399' }}>'{template.subject}'</span>
      {'\n\n'}
      <span style={{ color: '#818cf8' }}>{'// '}</span>
      <span style={{ color: '#6b7280' }}>Usage in sender.js</span>
      {'\n'}
      <span style={{ color: '#c084fc' }}>await</span>
      {' '}
      <span style={{ color: '#fbbf24' }}>send{fileName}</span>
      {'('}
      {template.category === 'Notification' || template.name.includes('Approved') || template.name.includes('Denied')
        ? <>
            <span style={{ color: '#e0e7ff' }}>userId</span>
            {', '}
            <span style={{ color: '#e0e7ff' }}>recipientEmail</span>
            {', '}
            {'{ '}
            {propsEntries.map(([key], i) => (
              <span key={key}>
                <span style={{ color: '#fbbf24' }}>{key}</span>
                {i < propsEntries.length - 1 ? ', ' : ''}
              </span>
            ))}
            {' }'}
          </>
        : <>
            <span style={{ color: '#e0e7ff' }}>recipientEmail</span>
            {', '}
            {'{ '}
            {propsEntries.map(([key], i) => (
              <span key={key}>
                <span style={{ color: '#fbbf24' }}>{key}</span>
                {i < propsEntries.length - 1 ? ', ' : ''}
              </span>
            ))}
            {' }'}
          </>
      }
      {')\n'}
    </pre>
  )
}
