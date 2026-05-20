import { Link } from "react-router-dom";

function RefundPolicy() {
  return (
    <div className="min-h-screen bg-[#080b0a] text-white/70 px-6 lg:px-20 py-20">
      <div className="max-w-[800px] mx-auto" style={{ fontFamily: "'Inter', sans-serif" }}>
        <Link to="/" className="text-emerald-400/70 text-sm hover:text-emerald-400 transition-colors mb-10 inline-block">&larr; Back to home</Link>

        <h1 className="text-white text-3xl lg:text-4xl font-bold mb-2" style={{ letterSpacing: "-0.03em" }}>Refund Policy</h1>
        <p className="text-white/30 text-sm mb-12">Last updated: May 2026</p>

        <div className="flex flex-col gap-8 text-sm leading-relaxed">
          <section>
            <h2 className="text-white text-lg font-semibold mb-3">1. Tournament Registration Fees</h2>
            <p>Tournament registration fees are refundable up to 48 hours before the tournament start date. Refund requests made within 48 hours of the tournament are non-refundable. If a tournament is cancelled by the organizer, a full refund will be issued automatically.</p>
          </section>

          <section>
            <h2 className="text-white text-lg font-semibold mb-3">2. Academy Enrollment Fees</h2>
            <p>Academy enrollment fees are subject to the refund policy of the individual academy. BallersAdda facilitates payments but refund decisions for academy services are made by the respective academy. Contact the academy directly for enrollment refund requests.</p>
          </section>

          <section>
            <h2 className="text-white text-lg font-semibold mb-3">3. Processing Time</h2>
            <p>Approved refunds are processed within 5-7 business days. Refunds are credited back to the original payment method used during the transaction. You will receive an email confirmation once the refund is initiated.</p>
          </section>

          <section>
            <h2 className="text-white text-lg font-semibold mb-3">4. How to Request a Refund</h2>
            <p>To request a refund, email <span className="text-emerald-400">support@ballersadda.com</span> with your transaction ID, registered email, and reason for the refund. Our team will review and respond within 2 business days.</p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default RefundPolicy;
