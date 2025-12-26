import { Link } from 'react-router-dom'

export default function Terms() {
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
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
        <p className="text-lg text-gray-600">for RecollectKits</p>
        <div className="mt-4 inline-block bg-gray-100 px-4 py-2 rounded-lg">
          <p className="text-sm text-gray-600">
            <span className="font-semibold">Last Updated:</span> December 26, 2025
          </p>
        </div>
      </div>

      {/* Terms Content */}
      <div className="text-gray-700">

        {/* 1. Acceptance of Terms */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
          <p className="leading-relaxed">
            Welcome to RecollectKits! These Terms of Service ("Terms") govern your access to and use of the RecollectKits platform at recollectkits.com (the "Platform"), including any content, functionality, and services offered on or through the Platform.
          </p>
          <p className="leading-relaxed mt-4">
            By creating an account, accessing, or using the Platform, you agree to be bound by these Terms and our <Link to="/privacy" className="text-green-600 hover:text-green-700 font-medium">Privacy Policy</Link>. If you do not agree to these Terms, you may not use the Platform.
          </p>
        </section>

        {/* 2. Eligibility */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Eligibility</h2>
          <p className="leading-relaxed">
            You must be at least 13 years of age to use this Platform. If you are under 18, you represent that you have your parent's or guardian's permission to use the Platform. By using the Platform, you represent and warrant that you meet these eligibility requirements.
          </p>
        </section>

        {/* 3. Account Registration and Security */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Account Registration and Security</h2>

          <div className="mb-6">
            <h4 className="font-semibold text-gray-800 mb-2">Account Creation:</h4>
            <div style={{ paddingLeft: '1.5rem' }}>
              <ul className="list-disc list-outside space-y-1">
                <li>You must provide accurate, current, and complete information during registration</li>
                <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                <li>You are responsible for all activities that occur under your account</li>
                <li>You must notify us immediately of any unauthorized access or security breach</li>
              </ul>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="font-semibold text-gray-800 mb-2">Account Approval:</h4>
            <p>During our early access phase, new accounts are subject to approval. We reserve the right to approve or deny account applications at our sole discretion.</p>
          </div>

          <div className="mb-6">
            <h4 className="font-semibold text-gray-800 mb-2">One Account Per User:</h4>
            <p>You may only maintain one account. Multiple accounts per user are not permitted.</p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Account Termination:</h4>
            <p>We reserve the right to suspend or terminate your account at any time for violation of these Terms, fraudulent activity, or any reason we deem appropriate, with or without notice.</p>
          </div>
        </section>

        {/* 4. User Content and Ownership */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">4. User Content and Ownership</h2>

          <div className="mb-6">
            <h4 className="font-semibold text-gray-800 mb-2">Your Content:</h4>
            <p className="mb-2">You retain all ownership rights to content you submit to the Platform, including:</p>
            <div style={{ paddingLeft: '1.5rem' }}>
              <ul className="list-disc list-outside space-y-1">
                <li>Jersey/kit catalog data</li>
                <li>Photos you upload</li>
                <li>Descriptions and notes</li>
                <li>Collection organization</li>
              </ul>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="font-semibold text-gray-800 mb-2">License Grant to RecollectKits:</h4>
            <p className="mb-2">By submitting content to the Platform, you grant RecollectKits a worldwide, non-exclusive, royalty-free, transferable license to:</p>
            <div style={{ paddingLeft: '1.5rem' }}>
              <ul className="list-disc list-outside space-y-1 mb-3">
                <li>Use, display, reproduce, and distribute your content on the Platform</li>
                <li>Create derivative works for platform features (e.g., statistics, trends, aggregated data)</li>
                <li>Share your content with other users according to your privacy settings</li>
                <li>Use your content for marketing and promotional purposes (only public content)</li>
              </ul>
            </div>
            <p>This license continues even if you stop using the Platform, but ends when you delete specific content or your account.</p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Your Representations:</h4>
            <p className="mb-2">You represent and warrant that:</p>
            <div style={{ paddingLeft: '1.5rem' }}>
              <ul className="list-disc list-outside space-y-1">
                <li>You own or have the necessary rights to all content you submit</li>
                <li>Your content does not infringe any third-party rights (copyright, trademark, privacy, etc.)</li>
                <li>Your content complies with these Terms and applicable laws</li>
                <li>You have permission to upload any photos that you did not personally take</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 5. User Responsibilities and Prohibited Conduct */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">5. User Responsibilities and Prohibited Conduct</h2>

          <div className="mb-6">
            <h4 className="font-semibold text-gray-800 mb-2">You agree NOT to:</h4>
            <div style={{ paddingLeft: '1.5rem' }}>
              <ul className="list-disc list-outside space-y-1">
                <li>Upload false, inaccurate, or misleading information</li>
                <li>Upload content you do not have rights to use</li>
                <li>Upload copyrighted images without permission (e.g., manufacturer photos, photos from other websites)</li>
                <li>Impersonate any person or entity</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Use the Platform for any illegal purpose</li>
                <li>Attempt to gain unauthorized access to any part of the Platform</li>
                <li>Interfere with or disrupt the Platform's functionality</li>
                <li>Use automated systems (bots, scrapers) without permission</li>
                <li>Sell or transfer your account</li>
                <li>Create multiple accounts</li>
                <li>Upload viruses, malware, or harmful code</li>
                <li>Spam or send unsolicited communications to other users</li>
                <li>Violate any applicable laws or regulations</li>
              </ul>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Consequences:</h4>
            <p>Violation of these prohibitions may result in immediate account termination and legal action if necessary.</p>
          </div>
        </section>

        {/* 6. Intellectual Property Rights */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Intellectual Property Rights</h2>

          <div className="mb-6">
            <h4 className="font-semibold text-gray-800 mb-2">RecollectKits Property:</h4>
            <p>The Platform, including its design, features, text, graphics, logos, and software, is owned by RecollectKits and protected by copyright, trademark, and other intellectual property laws.</p>
          </div>

          <div className="mb-6">
            <h4 className="font-semibold text-gray-800 mb-2">RecollectKits™ Trademark:</h4>
            <p>"RecollectKits" and the RecollectKits logo are trademarks of RecollectKits. You may not use these trademarks without our prior written consent.</p>
          </div>

          <div className="mb-6">
            <h4 className="font-semibold text-gray-800 mb-2">User Content:</h4>
            <p>Users retain ownership of their submitted content, but grant RecollectKits the license described in Section 4.</p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Feedback:</h4>
            <p>If you provide feedback, suggestions, or ideas about the Platform, you grant us the right to use them without compensation or attribution.</p>
          </div>
        </section>

        {/* 7. Copyright and DMCA */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Copyright and DMCA</h2>
          <p className="leading-relaxed mb-4">
            We respect intellectual property rights. If you believe content on our Platform infringes your copyright, please contact us at{' '}
            <a href="mailto:hello@recollectkits.com" className="text-green-600 hover:text-green-700 font-medium">hello@recollectkits.com</a> with:
          </p>
          <div style={{ paddingLeft: '1.5rem' }}>
            <ul className="list-disc list-outside space-y-1 mb-4">
              <li>Identification of the copyrighted work</li>
              <li>Identification of the infringing material and its location</li>
              <li>Your contact information</li>
              <li>A statement of good faith belief that use is not authorized</li>
              <li>A statement that the information is accurate and you are authorized to act</li>
              <li>Your physical or electronic signature</li>
            </ul>
          </div>
          <p className="leading-relaxed">
            We will respond to valid DMCA notices and may terminate accounts of repeat infringers.
          </p>
        </section>

        {/* 8. Disclaimers About Platform Content */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Disclaimers About Platform Content</h2>

          <div className="mb-6">
            <h4 className="font-semibold text-gray-800 mb-2">User-Generated Content:</h4>
            <p>RecollectKits is a platform for users to catalog and share information about football jerseys/kits. All information submitted by users is user-generated and not verified by RecollectKits.</p>
          </div>

          <div className="mb-6">
            <h4 className="font-semibold text-gray-800 mb-2">We Make No Warranties About:</h4>
            <div style={{ paddingLeft: '1.5rem' }}>
              <ul className="list-disc list-outside space-y-1">
                <li>Accuracy of jersey information (year, manufacturer, edition, etc.)</li>
                <li>Authenticity of items cataloged by users</li>
                <li>Value or appraisal of items</li>
                <li>Completeness of the jersey database</li>
                <li>Availability of specific information</li>
              </ul>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="font-semibold text-gray-800 mb-2">Not Professional Advice:</h4>
            <p>The Platform does not provide professional authentication, appraisal, or valuation services. Information on the Platform should not be relied upon for purchase decisions, authentication, or financial purposes.</p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Third-Party Content:</h4>
            <p>We are not responsible for content, accuracy, or opinions expressed by users or third parties.</p>
          </div>
        </section>

        {/* 9. Platform Availability and Modifications */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Platform Availability and Modifications</h2>

          <div className="mb-6">
            <h4 className="font-semibold text-gray-800 mb-2">"As Is" Service:</h4>
            <p className="mb-2">The Platform is provided on an "as is" and "as available" basis. We do not guarantee:</p>
            <div style={{ paddingLeft: '1.5rem' }}>
              <ul className="list-disc list-outside space-y-1">
                <li>Uninterrupted or error-free operation</li>
                <li>Freedom from viruses or harmful components</li>
                <li>Accuracy or reliability of content</li>
                <li>That the Platform will meet your specific requirements</li>
              </ul>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="font-semibold text-gray-800 mb-2">Modifications:</h4>
            <p className="mb-2">We reserve the right to:</p>
            <div style={{ paddingLeft: '1.5rem' }}>
              <ul className="list-disc list-outside space-y-1">
                <li>Modify, suspend, or discontinue any part of the Platform at any time</li>
                <li>Change features or add new functionality</li>
                <li>Impose limits on features or storage</li>
              </ul>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Maintenance:</h4>
            <p>The Platform may be unavailable during maintenance periods. We will attempt to provide advance notice when possible.</p>
          </div>
        </section>

        {/* 10. Limitation of Liability */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Limitation of Liability</h2>

          <div className="mb-6">
            <h4 className="font-semibold text-gray-800 mb-2">To the Maximum Extent Permitted by Law:</h4>
            <p className="mb-2">RecollectKits and its operators shall not be liable for:</p>
            <div style={{ paddingLeft: '1.5rem' }}>
              <ul className="list-disc list-outside space-y-1">
                <li>Indirect, incidental, special, consequential, or punitive damages</li>
                <li>Loss of profits, revenue, data, or use</li>
                <li>Damages resulting from user content or conduct</li>
                <li>Damages from unauthorized access to your account</li>
                <li>Any damages arising from use or inability to use the Platform</li>
              </ul>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="font-semibold text-gray-800 mb-2">Maximum Liability:</h4>
            <p>Our total liability to you for any claims arising from your use of the Platform shall not exceed $100.</p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Exceptions:</h4>
            <p>Some jurisdictions do not allow limitation of liability, so these limitations may not apply to you.</p>
          </div>
        </section>

        {/* 11. Indemnification */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Indemnification</h2>
          <p className="leading-relaxed mb-2">
            You agree to indemnify, defend, and hold harmless RecollectKits and its operators from any claims, damages, losses, liabilities, and expenses (including attorney's fees) arising from:
          </p>
          <div style={{ paddingLeft: '1.5rem' }}>
            <ul className="list-disc list-outside space-y-1">
              <li>Your use of the Platform</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any third-party rights</li>
              <li>Your user content</li>
              <li>Your violation of any applicable laws</li>
            </ul>
          </div>
        </section>

        {/* 12. Dispute Resolution */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Dispute Resolution</h2>

          <div className="mb-6">
            <h4 className="font-semibold text-gray-800 mb-2">Governing Law:</h4>
            <p>These Terms shall be governed by the laws of the State of New York, United States, without regard to conflict of law principles.</p>
          </div>

          <div className="mb-6">
            <h4 className="font-semibold text-gray-800 mb-2">Venue:</h4>
            <p>Any legal action or proceeding arising under these Terms shall be brought exclusively in the state or federal courts located in New York, and you consent to personal jurisdiction in those courts.</p>
          </div>

          <div className="mb-6">
            <h4 className="font-semibold text-gray-800 mb-2">Informal Resolution:</h4>
            <p>
              Before filing any formal claim, you agree to contact us at{' '}
              <a href="mailto:hello@recollectkits.com" className="text-green-600 hover:text-green-700 font-medium">hello@recollectkits.com</a>{' '}
              to attempt to resolve the dispute informally.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Time Limit:</h4>
            <p>Any claim must be filed within one (1) year after the claim arose, or it will be permanently barred.</p>
          </div>
        </section>

        {/* 13. Export Control */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Export Control</h2>
          <p className="leading-relaxed">
            You may not use or export anything from the Platform in violation of U.S. export laws and regulations.
          </p>
        </section>

        {/* 14. Severability */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Severability</h2>
          <p className="leading-relaxed">
            If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary, and the remaining provisions shall remain in full force and effect.
          </p>
        </section>

        {/* 15. Entire Agreement */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">15. Entire Agreement</h2>
          <p className="leading-relaxed">
            These Terms, together with our <Link to="/privacy" className="text-green-600 hover:text-green-700 font-medium">Privacy Policy</Link>, constitute the entire agreement between you and RecollectKits regarding your use of the Platform and supersede any prior agreements.
          </p>
        </section>

        {/* 16. Waiver */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">16. Waiver</h2>
          <p className="leading-relaxed">
            Our failure to enforce any right or provision in these Terms shall not constitute a waiver of such right or provision unless acknowledged and agreed to by us in writing.
          </p>
        </section>

        {/* 17. Assignment */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">17. Assignment</h2>
          <p className="leading-relaxed">
            You may not assign or transfer these Terms or your account without our prior written consent. We may assign these Terms without restriction.
          </p>
        </section>

        {/* 18. Changes to Terms */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">18. Changes to Terms</h2>
          <p className="leading-relaxed mb-4">
            We reserve the right to modify these Terms at any time. We will notify you of material changes by:
          </p>
          <div style={{ paddingLeft: '1.5rem' }}>
            <ul className="list-disc list-outside space-y-1 mb-4">
              <li>Posting the updated Terms on this page</li>
              <li>Updating the "Last Updated" date</li>
              <li>Sending email notification (for significant changes)</li>
            </ul>
          </div>
          <p className="leading-relaxed">
            Your continued use of the Platform after changes constitutes acceptance of the updated Terms. If you do not agree to the changes, you must stop using the Platform and may delete your account.
          </p>
        </section>

        {/* 19. Contact Information */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">19. Contact Information</h2>
          <p className="leading-relaxed mb-4">
            If you have questions about these Terms, please contact us:
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

        {/* Agreement Notice */}
        <div className="bg-gray-100 p-6 rounded-lg">
          <p className="text-center font-medium text-gray-800">
            By using RecollectKits, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
          </p>
        </div>

      </div>
    </div>
  )
}
