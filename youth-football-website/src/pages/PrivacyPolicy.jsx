import { Link } from "react-router-dom";

function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#080b0a] text-white/70 px-6 lg:px-20 py-20">
      <div className="max-w-[800px] mx-auto" style={{ fontFamily: "'Inter', sans-serif" }}>
        <Link to="/" className="text-emerald-400/70 text-sm hover:text-emerald-400 transition-colors mb-10 inline-block">&larr; Back to home</Link>

        <h1 className="text-white text-3xl lg:text-4xl font-bold mb-2" style={{ letterSpacing: "-0.03em" }}>Privacy Policy</h1>
        <p className="text-white/30 text-sm mb-12">Last updated: May 2026</p>

        <div className="flex flex-col gap-8 text-sm leading-relaxed">
          <section>
            <h2 className="text-white text-lg font-semibold mb-3">1. Information We Collect</h2>
            <p>We collect information you provide when creating an account, including your name, email address, date of birth, and football-related details such as position, skill level, and academy affiliation. We also collect usage data such as pages visited, features used, and device information.</p>
          </section>

          <section>
            <h2 className="text-white text-lg font-semibold mb-3">2. How We Use Your Information</h2>
            <p>Your information is used to provide and improve the BallersAdda platform, including matching players with academies, facilitating tournament registrations, enabling coach-player connections, and personalizing your experience. We do not sell your personal data to third parties.</p>
          </section>

          <section>
            <h2 className="text-white text-lg font-semibold mb-3">3. Data Sharing</h2>
            <p>We may share your profile information with academies, coaches, and scouts on the platform as part of the discovery feature. Payment information is processed securely through Razorpay and is never stored on our servers. We may share anonymized, aggregated data for analytics purposes.</p>
          </section>

          <section>
            <h2 className="text-white text-lg font-semibold mb-3">4. Data Security</h2>
            <p>We implement industry-standard security measures including encrypted data transmission (HTTPS), secure password hashing, and access controls. However, no method of electronic storage is 100% secure, and we cannot guarantee absolute security.</p>
          </section>

          <section>
            <h2 className="text-white text-lg font-semibold mb-3">5. Your Rights</h2>
            <p>You may access, update, or delete your personal information at any time through your account settings. You can request a copy of your data or ask us to delete your account by contacting us at support@ballersadda.com.</p>
          </section>

          <section>
            <h2 className="text-white text-lg font-semibold mb-3">6. Contact</h2>
            <p>For questions about this privacy policy, contact us at <span className="text-emerald-400">support@ballersadda.com</span>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicy;
