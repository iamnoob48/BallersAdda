import { Link } from "react-router-dom";

function AboutUs() {
  return (
    <div className="min-h-screen bg-[#080b0a] text-white/70 px-6 lg:px-20 py-20">
      <div className="max-w-[800px] mx-auto" style={{ fontFamily: "'Inter', sans-serif" }}>
        <Link to="/" className="text-emerald-400/70 text-sm hover:text-emerald-400 transition-colors mb-10 inline-block">&larr; Back to home</Link>

        <h1 className="text-white text-3xl lg:text-4xl font-bold mb-2" style={{ letterSpacing: "-0.03em" }}>About Us</h1>
        <p className="text-white/30 text-sm mb-12">The story behind BallersAdda</p>

        <div className="flex flex-col gap-8 text-sm leading-relaxed">
          <section>
            <h2 className="text-white text-lg font-semibold mb-3">Our Mission</h2>
            <p>BallersAdda exists to bridge the gap between young football talent and opportunity. In India, thousands of skilled players go unnoticed because they lack access to the right academies, tournaments, and scouts. We're building the platform that changes that.</p>
          </section>

          <section>
            <h2 className="text-white text-lg font-semibold mb-3">What We Do</h2>
            <p>We connect players, academies, coaches, and scouts on a single platform. Players can discover academies, register for tournaments, build verified profiles with stats and match history, and get discovered by coaches. Academies can manage sessions, showcase their programs, and grow enrollment. Coaches can track player development and scout talent across the platform.</p>
          </section>

          <section>
            <h2 className="text-white text-lg font-semibold mb-3">Why It Matters</h2>
            <p>Youth football in India is fragmented. Information about academies is scattered, tournament registration is manual, and player talent often goes unseen. BallersAdda brings structure, visibility, and opportunity to the grassroots football ecosystem.</p>
          </section>

          <section>
            <h2 className="text-white text-lg font-semibold mb-3">Our Team</h2>
            <p>We're a small team of football enthusiasts and engineers who believe technology can make youth football more accessible, organized, and fair. We're based in India and building for the next generation of ballers.</p>
          </section>

          <section>
            <h2 className="text-white text-lg font-semibold mb-3">Get in Touch</h2>
            <p>Have questions, feedback, or partnership ideas? Reach us at <span className="text-emerald-400">support@ballersadda.com</span>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default AboutUs;
