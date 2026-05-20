import { Link } from "react-router-dom";

function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#080b0a] text-white/70 px-6 lg:px-20 py-20">
      <div className="max-w-[800px] mx-auto" style={{ fontFamily: "'Inter', sans-serif" }}>
        <Link to="/" className="text-emerald-400/70 text-sm hover:text-emerald-400 transition-colors mb-10 inline-block">&larr; Back to home</Link>

        <h1 className="text-white text-3xl lg:text-4xl font-bold mb-2" style={{ letterSpacing: "-0.03em" }}>Terms of Service</h1>
        <p className="text-white/30 text-sm mb-12">Last updated: May 2026</p>

        <div className="flex flex-col gap-8 text-sm leading-relaxed">
          <section>
            <h2 className="text-white text-lg font-semibold mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using BallersAdda, you agree to be bound by these terms. If you do not agree, please do not use the platform. You must be at least 13 years old to create an account. Users under 18 must have parental or guardian consent.</p>
          </section>

          <section>
            <h2 className="text-white text-lg font-semibold mb-3">2. Account Responsibilities</h2>
            <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. You agree to provide accurate, current, and complete information during registration and to keep your profile updated.</p>
          </section>

          <section>
            <h2 className="text-white text-lg font-semibold mb-3">3. Platform Usage</h2>
            <p>BallersAdda provides tools for academy discovery, tournament registration, player profile management, and coach-player connections. You agree not to misuse the platform, submit false information, harass other users, or attempt to circumvent any security features.</p>
          </section>

          <section>
            <h2 className="text-white text-lg font-semibold mb-3">4. Payments & Fees</h2>
            <p>Certain features, including tournament registrations and academy enrollments, may require payment. All payments are processed through Razorpay. Fees are non-refundable unless specified in our Refund Policy. Prices are displayed in INR and include applicable taxes.</p>
          </section>

          <section>
            <h2 className="text-white text-lg font-semibold mb-3">5. Content & Intellectual Property</h2>
            <p>You retain ownership of content you upload (photos, stats, profile information). By posting content, you grant BallersAdda a non-exclusive license to display it on the platform. All platform branding, design, and code are the intellectual property of BallersAdda.</p>
          </section>

          <section>
            <h2 className="text-white text-lg font-semibold mb-3">6. Termination</h2>
            <p>We reserve the right to suspend or terminate accounts that violate these terms. You may delete your account at any time through your account settings.</p>
          </section>

          <section>
            <h2 className="text-white text-lg font-semibold mb-3">7. Contact</h2>
            <p>For questions about these terms, contact us at <span className="text-emerald-400">support@ballersadda.com</span>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default TermsOfService;
