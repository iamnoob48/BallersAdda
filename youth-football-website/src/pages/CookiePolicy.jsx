import { Link } from "react-router-dom";

function CookiePolicy() {
  return (
    <div className="min-h-screen bg-[#080b0a] text-white/70 px-6 lg:px-20 py-20">
      <div className="max-w-[800px] mx-auto" style={{ fontFamily: "'Inter', sans-serif" }}>
        <Link to="/" className="text-emerald-400/70 text-sm hover:text-emerald-400 transition-colors mb-10 inline-block">&larr; Back to home</Link>

        <h1 className="text-white text-3xl lg:text-4xl font-bold mb-2" style={{ letterSpacing: "-0.03em" }}>Cookie Policy</h1>
        <p className="text-white/30 text-sm mb-12">Last updated: May 2026</p>

        <div className="flex flex-col gap-8 text-sm leading-relaxed">
          <section>
            <h2 className="text-white text-lg font-semibold mb-3">1. What Are Cookies</h2>
            <p>Cookies are small text files stored on your device when you visit BallersAdda. They help us remember your preferences, keep you logged in, and understand how you use the platform.</p>
          </section>

          <section>
            <h2 className="text-white text-lg font-semibold mb-3">2. Cookies We Use</h2>
            <p><strong className="text-white/90">Essential cookies:</strong> Required for authentication and security. These include your access token and refresh token stored as HttpOnly cookies. The platform cannot function without these.</p>
            <p className="mt-2"><strong className="text-white/90">Analytics cookies:</strong> Help us understand usage patterns and improve the platform. These are anonymized and do not contain personal information.</p>
          </section>

          <section>
            <h2 className="text-white text-lg font-semibold mb-3">3. Managing Cookies</h2>
            <p>You can control cookies through your browser settings. Disabling essential cookies will prevent you from logging in and using authenticated features. Most browsers allow you to block or delete cookies — refer to your browser's help section for instructions.</p>
          </section>

          <section>
            <h2 className="text-white text-lg font-semibold mb-3">4. Contact</h2>
            <p>Questions about our cookie usage? Contact us at <span className="text-emerald-400">support@ballersadda.com</span>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default CookiePolicy;
