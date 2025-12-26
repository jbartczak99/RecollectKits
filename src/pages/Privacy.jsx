import { Link } from 'react-router-dom'

export default function Privacy() {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Navigation */}
      <div className="mb-8">
        <Link
          to="/"
          className="inline-flex items-center text-green-600 hover:text-green-700 font-medium"
        >
          <svg width="20" height="20" className="mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>
      </div>

      {/* Page Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
        <p className="text-lg text-gray-600">for RecollectKits</p>
        <div className="mt-4 inline-block bg-gray-100 px-4 py-2 rounded-lg">
          <p className="text-sm text-gray-600">
            <span className="font-semibold">Last Updated:</span> December 26, 2025
          </p>
        </div>
      </div>

      {/* Privacy Policy Content */}
      <div className="text-gray-700">

        {/* Introduction */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
          <p className="leading-relaxed">
            Welcome to RecollectKits ("we," "our," or "us"). We are committed to protecting your privacy and personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform at recollectkits.com (the "Platform").
          </p>
          <p className="leading-relaxed mt-4">
            By creating an account or using our Platform, you agree to the collection and use of information in accordance with this Privacy Policy.
          </p>
        </section>

        {/* Information We Collect */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Information We Collect</h2>

          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Information You Provide to Us</h3>

            <div className="mb-6">
              <h4 className="font-semibold text-gray-800 mb-2">Account Information:</h4>
              <div style={{ paddingLeft: '1.5rem' }}>
                <ul className="list-disc list-outside space-y-1">
                  <li>Email address</li>
                  <li>Password (stored encrypted)</li>
                  <li>Username</li>
                  <li>Profile information you choose to provide</li>
                </ul>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-semibold text-gray-800 mb-2">Collection Data:</h4>
              <div style={{ paddingLeft: '1.5rem' }}>
                <ul className="list-disc list-outside space-y-1">
                  <li>Information about jerseys/kits you catalog</li>
                  <li>Photos you upload</li>
                  <li>Descriptions and notes you add</li>
                  <li>Collection organization and categorization</li>
                </ul>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-semibold text-gray-800 mb-2">Communications:</h4>
              <div style={{ paddingLeft: '1.5rem' }}>
                <ul className="list-disc list-outside space-y-1">
                  <li>Messages you send to us</li>
                  <li>Feedback and correspondence</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Information Collected Automatically</h3>

            <div className="mb-6">
              <h4 className="font-semibold text-gray-800 mb-2">Usage Information:</h4>
              <div style={{ paddingLeft: '1.5rem' }}>
                <ul className="list-disc list-outside space-y-1">
                  <li>Pages you visit on our Platform</li>
                  <li>Features you use</li>
                  <li>Time and date of your visits</li>
                  <li>Time spent on pages</li>
                  <li>Links you click</li>
                </ul>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-semibold text-gray-800 mb-2">Device Information:</h4>
              <div style={{ paddingLeft: '1.5rem' }}>
                <ul className="list-disc list-outside space-y-1">
                  <li>IP address</li>
                  <li>Browser type and version</li>
                  <li>Device type</li>
                  <li>Operating system</li>
                  <li>Referring website</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* How We Use Your Information */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Use Your Information</h2>
          <p className="leading-relaxed mb-4">We use the information we collect to:</p>
          <div style={{ paddingLeft: '1.5rem' }}>
            <ul className="list-disc list-outside space-y-2">
              <li><strong>Provide and maintain the Platform:</strong> Create and manage your account, display your collection, enable platform features</li>
              <li><strong>Improve our services:</strong> Analyze usage patterns, fix bugs, develop new features</li>
              <li><strong>Communicate with you:</strong> Send account-related notifications, respond to inquiries, provide customer support</li>
              <li><strong>Ensure security:</strong> Detect and prevent fraud, abuse, and security incidents</li>
              <li><strong>Comply with legal obligations:</strong> Meet regulatory requirements and respond to legal requests</li>
              <li><strong>With your consent:</strong> For any other purpose with your explicit consent</li>
            </ul>
          </div>
        </section>

        {/* How We Share Your Information */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Share Your Information</h2>
          <p className="leading-relaxed mb-6">We may share your information in the following circumstances:</p>

          <div className="mb-6">
            <h4 className="font-semibold text-gray-800 mb-2">Service Providers:</h4>
            <div style={{ paddingLeft: '1.5rem' }}>
              <ul className="list-disc list-outside space-y-1 mb-2">
                <li>Hosting services (Vercel)</li>
                <li>Database services (Supabase)</li>
                <li>Email services</li>
              </ul>
              <p className="text-sm">These third parties are obligated to protect your information and use it only for the purposes we specify.</p>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="font-semibold text-gray-800 mb-2">Legal Requirements:</h4>
            <p>We may disclose your information if required by law, court order, or governmental authority, or to protect our rights, property, or safety.</p>
          </div>

          <div className="mb-6">
            <h4 className="font-semibold text-gray-800 mb-2">Business Transfers:</h4>
            <p>If RecollectKits is involved in a merger, acquisition, or sale of assets, your information may be transferred. We will notify you before your information becomes subject to a different privacy policy.</p>
          </div>

          <div className="mb-6">
            <h4 className="font-semibold text-gray-800 mb-2">Public Information:</h4>
            <p>Content you choose to make public on the Platform (such as public collections or profiles) will be visible to other users.</p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Aggregated Data:</h4>
            <p>We may share aggregated or de-identified information that cannot reasonably be used to identify you.</p>
          </div>
        </section>

        {/* Your Rights and Choices */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Rights and Choices</h2>
          <p className="leading-relaxed mb-4">You have the following rights regarding your personal information:</p>
          <div style={{ paddingLeft: '1.5rem' }}>
            <ul className="list-disc list-outside space-y-2 mb-4">
              <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
              <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
              <li><strong>Deletion:</strong> Request deletion of your account and personal information</li>
              <li><strong>Export:</strong> Request a copy of your collection data in a portable format</li>
              <li><strong>Opt-out:</strong> Unsubscribe from marketing communications (account-related communications may still be sent)</li>
            </ul>
          </div>
          <p>
            To exercise these rights, contact us at{' '}
            <a href="mailto:hello@recollectkits.com" className="text-green-600 hover:text-green-700 font-medium">
              hello@recollectkits.com
            </a>.
          </p>
        </section>

        {/* Data Retention */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Retention</h2>
          <p className="leading-relaxed">
            We retain your information for as long as your account is active or as needed to provide services. If you delete your account, we will delete or anonymize your personal information within 30 days, except where we are required to retain it for legal purposes.
          </p>
          <p className="leading-relaxed mt-4">
            Backup copies may be retained for an additional 90 days.
          </p>
        </section>

        {/* Data Security */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Security</h2>
          <p className="leading-relaxed mb-4">
            We implement appropriate technical and organizational measures to protect your personal information, including:
          </p>
          <div style={{ paddingLeft: '1.5rem' }}>
            <ul className="list-disc list-outside space-y-1 mb-4">
              <li>Encryption of passwords and sensitive data</li>
              <li>Secure hosting infrastructure</li>
              <li>Regular security assessments</li>
              <li>Access controls and authentication</li>
              <li>Secure data transmission (HTTPS/SSL)</li>
            </ul>
          </div>
          <p className="leading-relaxed">
            However, no method of transmission over the internet is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
          </p>
        </section>

        {/* Children's Privacy */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Children's Privacy</h2>
          <p className="leading-relaxed">
            Our Platform is not intended for users under 13 years of age. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.
          </p>
        </section>

        {/* International Users */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">International Users</h2>
          <p className="leading-relaxed mb-6">
            RecollectKits is based in the United States. If you are accessing our Platform from outside the United States, please be aware that your information may be transferred to, stored, and processed in the United States where our servers are located.
          </p>

          <div className="bg-gray-50 p-5 rounded-lg mb-4">
            <h4 className="font-semibold text-gray-800 mb-3">For European Union Users (GDPR):</h4>
            <p className="mb-3">We process your personal information based on the following legal grounds:</p>
            <div style={{ paddingLeft: '1.5rem' }}>
              <ul className="list-disc list-outside space-y-1 mb-3">
                <li>Performance of our contract with you (providing the Platform)</li>
                <li>Your consent (where applicable)</li>
                <li>Our legitimate interests (improving our services, preventing fraud)</li>
                <li>Legal obligations</li>
              </ul>
            </div>
            <p className="text-sm">You have additional rights under GDPR, including the right to lodge a complaint with a supervisory authority.</p>
          </div>

          <div className="bg-gray-50 p-5 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-3">For California Residents (CCPA):</h4>
            <p className="mb-3">California residents have specific rights regarding personal information, including:</p>
            <div style={{ paddingLeft: '1.5rem' }}>
              <ul className="list-disc list-outside space-y-1">
                <li>Right to know what personal information is collected</li>
                <li>Right to know if personal information is sold or disclosed</li>
                <li>Right to opt-out of sale of personal information (we do not sell personal information)</li>
                <li>Right to deletion</li>
                <li>Right to non-discrimination</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Third-Party Links */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Third-Party Links</h2>
          <p className="leading-relaxed">
            Our Platform may contain links to third-party websites. We are not responsible for the privacy practices of these external sites. We encourage you to review their privacy policies.
          </p>
        </section>

        {/* Changes to This Privacy Policy */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to This Privacy Policy</h2>
          <p className="leading-relaxed mb-4">
            We may update this Privacy Policy from time to time. We will notify you of material changes by:
          </p>
          <div style={{ paddingLeft: '1.5rem' }}>
            <ul className="list-disc list-outside space-y-1 mb-4">
              <li>Posting the new Privacy Policy on this page</li>
              <li>Updating the "Last Updated" date</li>
              <li>Sending an email notification (for significant changes)</li>
            </ul>
          </div>
          <p className="leading-relaxed">
            Your continued use of the Platform after changes constitutes acceptance of the updated Privacy Policy.
          </p>
        </section>

        {/* Contact Us */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
          <p className="leading-relaxed mb-4">
            If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us at:
          </p>
          <div className="bg-gray-50 p-5 rounded-lg">
            <p className="mb-2">
              <strong>Email:</strong>{' '}
              <a href="mailto:hello@recollectkits.com" className="text-green-600 hover:text-green-700 font-medium">
                hello@recollectkits.com
              </a>
            </p>
            <p>
              <strong>Website:</strong>{' '}
              <a href="https://recollectkits.com" className="text-green-600 hover:text-green-700 font-medium">
                recollectkits.com
              </a>
            </p>
          </div>
        </section>

      </div>
    </div>
  )
}
