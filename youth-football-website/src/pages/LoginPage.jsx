import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FiPhone, FiEye, FiEyeOff, FiArrowRight, FiAlertCircle, FiX } from "react-icons/fi";
import OTP from "../LandingComponents/OTP";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useDispatch } from "react-redux";
import { verifyUser } from "../redux/slices/authSlice.js";
import { signIn } from "../lib/auth-client.js";

// ── Hero slides for desktop left panel ──────────────────────────────────
const SLIDES = [
  { src: "/images/stadium-hero.png", tagline: "Where Ballers Rise.\nYour Journey Starts Here." },
  { src: "/images/players-celebration.png", tagline: "From Grassroots to Glory.\nJoin the Movement." },
];

// ── Mobile carousel images (scattered collage style) ────────────────────
const CAROUSEL_IMAGES = [
  { src: "/images/carousel-1.png", rotate: -6 },
  { src: "/images/carousel-2.png", rotate: 4 },
  { src: "/images/carousel-3.png", rotate: -3 },
  { src: "/images/carousel-4.png", rotate: 5 },
  { src: "/images/carousel-5.png", rotate: -4 },
];

const INPUT_CLS =
  "w-full bg-[#111] border border-[#2a2a2a] text-white placeholder-[#555] rounded-xl px-4 py-3.5 outline-none transition-all duration-200 hover:border-[#3a3a3a] focus:border-[#00FF88]/60 focus:ring-2 focus:ring-[#00FF88]/20";

export default function LoginPage() {
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [phoneNum, setPhoneNum] = useState("");
  const [isPhone, setIsPhone] = useState(false);
  const [isPhoneLogin, setIsPhoneLogin] = useState(false);
  const [errors, setErrors] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [slide, setSlide] = useState(0);
  const scrollRef = useRef(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const nextPath = searchParams.get("next") || "/home";

  // Auto-advance desktop carousel
  useEffect(() => {
    const id = setInterval(() => setSlide((s) => (s + 1) % SLIDES.length), 6000);
    return () => clearInterval(id);
  }, []);

  // Auto-scroll mobile carousel
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let pos = 0;
    const id = setInterval(() => {
      pos += 1;
      if (pos >= el.scrollWidth - el.clientWidth) pos = 0;
      el.scrollTo({ left: pos, behavior: "smooth" });
    }, 30);
    return () => clearInterval(id);
  }, [isPhone, isPhoneLogin]);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors("");
    const trimmedEmail = loginData.email.trim().toLowerCase();

    if (!validateEmail(trimmedEmail)) { setErrors("Please enter a valid email address."); return; }
    if (!loginData.password || loginData.password.length < 8) { setErrors("Password must be at least 8 characters long."); return; }

    try {
      setSubmitting(true);
      const { data, error } = await signIn.email({ email: trimmedEmail, password: loginData.password });
      if (error) { setErrors(error.message || "Invalid email or password"); return; }
      await dispatch(verifyUser()).unwrap();
      navigate(nextPath);
    } catch (error) {
      setErrors(error?.message || "An unexpected error occurred. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    await signIn.social({ provider: "google", callbackURL: window.location.origin + nextPath });
  };

  const handleChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  // ── Phone login sub-views ──────────────────────────────────────────
  if (isPhoneLogin) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-[#0e0e10] px-4">
        <OTP onBack={() => setIsPhoneLogin(false)} onVerify={() => navigate("/home")} />
      </section>
    );
  }

  if (isPhone) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-[#0e0e10] px-4">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-full max-w-md bg-[#1a1a1a] rounded-3xl border border-[#00FF88]/8 shadow-2xl shadow-black/40 p-8"
        >
          <h1 className="text-2xl font-extrabold text-white mb-1">Phone Login</h1>
          <p className="text-sm text-[#888] mb-6">We'll send you a one-time code</p>
          <form className="space-y-5">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-[#aaa] mb-1.5">Phone Number</label>
              <PhoneInput
                country={"in"}
                value={phoneNum}
                onChange={(phone) => setPhoneNum(phone)}
                inputProps={{ name: "phone", required: true }}
                inputClass="!w-full !text-white !font-medium !bg-[#111] !rounded-xl !border !border-[#2a2a2a] !px-14 !py-3.5 focus:!outline-none focus:!border-[#00FF88]/60 focus:!ring-2 focus:!ring-[#00FF88]/20 transition-all"
                buttonClass="!bg-transparent !border-none !absolute !left-3"
                containerClass="!w-full"
                dropdownClass="!bg-[#1a1a1a] !text-white"
              />
              <p className="text-xs text-[#666] mt-1.5">You'll receive an OTP on this number</p>
            </div>
            <motion.button type="button" onClick={() => setIsPhoneLogin(true)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="w-full py-3.5 rounded-xl font-bold text-[#0e0e10] bg-gradient-to-r from-[#00FF88] to-[#00CC6A] shadow-lg shadow-[#00FF88]/20">
              Get OTP
            </motion.button>
            <button type="button" onClick={() => setIsPhone(false)} className="w-full text-sm text-[#00FF88] font-medium hover:underline">
              ← Back to Email Login
            </button>
          </form>
        </motion.div>
      </section>
    );
  }

  // ── Main login view ────────────────────────────────────────────────
  return (
    <section className="min-h-screen flex items-center justify-center bg-[#0e0e10] px-4 py-8">
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-[960px] flex rounded-3xl overflow-hidden border border-[#00FF88]/8 shadow-2xl shadow-black/50 lg:flex-row flex-col lg:bg-transparent bg-[#1a1a1a]"
      >
        {/* ── Desktop Left Image Panel ─────────────────────────────── */}
        <div className="hidden lg:flex lg:w-[45%] relative flex-col justify-between overflow-hidden bg-[#111]">
          <AnimatePresence mode="wait">
            <motion.img
              key={slide}
              src={SLIDES[slide].src}
              alt="BallersAdda"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />
          <div className="relative z-10 flex items-center justify-between p-6">
            <span className="text-lg font-extrabold tracking-tight text-[#00FF88]">BallersAdda</span>
            <Link to="/" className="flex items-center gap-1.5 text-xs font-medium text-white/80 hover:text-white border border-white/20 hover:border-white/40 rounded-full px-3.5 py-1.5 transition-all backdrop-blur-sm">
              Back to website <FiArrowRight className="text-[10px]" />
            </Link>
          </div>
          <div className="relative z-10 p-6 pb-8">
            <AnimatePresence mode="wait">
              <motion.p key={slide} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.5 }}
                className="text-2xl font-bold text-white leading-tight whitespace-pre-line">
                {SLIDES[slide].tagline}
              </motion.p>
            </AnimatePresence>
            <div className="flex gap-2 mt-5">
              {SLIDES.map((_, i) => (
                <button key={i} onClick={() => setSlide(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === slide ? "w-6 bg-white" : "w-3 bg-white/30 hover:bg-white/50"}`} />
              ))}
            </div>
          </div>
        </div>

        {/* ── Form Panel ───────────────────────────────────────────── */}
        <div className="w-full lg:w-[55%] bg-[#1a1a1a] p-6 sm:p-8 lg:p-12 flex flex-col justify-center">
          {/* Mobile header */}
          <div className="lg:hidden text-center mb-6">
            <span className="text-lg font-extrabold text-[#00FF88]">BallersAdda</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-1.5 lg:text-left text-center">
            Welcome Back<span className="lg:hidden"> to <span className="text-[#00FF88]">BallersAdda</span></span>
          </h1>
          <p className="text-sm text-[#888] mb-6 lg:mb-8 lg:text-left text-center">
            Don't have an account?{" "}
            <Link to="/Register" className="text-[#00FF88] font-medium hover:underline">Register</Link>
          </p>

          {/* Error */}
          <AnimatePresence>
            {errors && (
              <motion.div initial={{ opacity: 0, y: -8, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }} exit={{ opacity: 0, y: -8, height: 0 }}
                className="flex items-start gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 mb-5 overflow-hidden">
                <FiAlertCircle size={16} className="shrink-0 mt-0.5" />
                <p className="text-sm flex-1">{errors}</p>
                <button onClick={() => setErrors("")} className="text-red-300/60 hover:text-red-300 p-0.5"><FiX size={14} /></button>
              </motion.div>
            )}
          </AnimatePresence>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-[#aaa] mb-1.5">Email</label>
              <input type="email" name="email" value={loginData.email} onChange={handleChange}
                placeholder="Enter your email" autoComplete="email" className={INPUT_CLS} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-[#aaa]">Password</label>
                <Link to="/forgot-password" className="text-xs font-medium text-[#00FF88] hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} name="password" value={loginData.password}
                  onChange={handleChange} placeholder="Enter your password" autoComplete="current-password"
                  className={`${INPUT_CLS} pr-12`} />
                <button type="button" onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#555] hover:text-[#00FF88] transition p-0.5">
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            <motion.button type="submit" disabled={submitting} whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.985 }}
              className="w-full py-3.5 rounded-xl font-bold text-[#0e0e10] bg-gradient-to-r from-[#00FF88] to-[#00CC6A] shadow-lg shadow-[#00FF88]/20 hover:shadow-[#00FF88]/30 transition-shadow disabled:opacity-50 disabled:cursor-not-allowed mt-2">
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-[#0e0e10] border-t-transparent rounded-full animate-spin" />
                  Logging in...
                </span>
              ) : "Log in"}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5 lg:my-6">
            <div className="flex-1 h-px bg-[#2a2a2a]" />
            <span className="text-xs text-[#555]">Or continue with</span>
            <div className="flex-1 h-px bg-[#2a2a2a]" />
          </div>

          {/* Social buttons */}
          <div className="flex gap-3">
            <motion.button type="button" onClick={handleGoogleLogin} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="flex items-center justify-center gap-2.5 flex-1 py-3 rounded-xl border border-[#2a2a2a] bg-[#222] hover:border-[#3a3a3a] hover:bg-[#282828] transition-all text-white">
              <FcGoogle className="text-lg" /><span className="text-sm font-medium">Google</span>
            </motion.button>
            <motion.button type="button" onClick={() => setIsPhone(true)} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="flex items-center justify-center gap-2.5 flex-1 py-3 rounded-xl border border-[#2a2a2a] bg-[#222] hover:border-[#3a3a3a] hover:bg-[#282828] transition-all text-white">
              <FiPhone className="text-[#00FF88]" /><span className="text-sm font-medium">Phone</span>
            </motion.button>
          </div>

          {/* ── Mobile photo carousel ──────────────────────────────── */}
          <div className="lg:hidden mt-6 -mx-6 overflow-hidden">
            <div ref={scrollRef} className="flex gap-3 px-6 overflow-x-auto scrollbar-hide" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
              {CAROUSEL_IMAGES.map((img, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  style={{ transform: `rotate(${img.rotate}deg)` }}
                  className="shrink-0 w-24 h-24 rounded-2xl overflow-hidden border-2 border-[#2a2a2a] shadow-lg shadow-black/30"
                >
                  <img src={img.src} alt="" className="w-full h-full object-cover" loading="lazy" />
                </motion.div>
              ))}
              {/* Duplicate for infinite feel */}
              {CAROUSEL_IMAGES.map((img, i) => (
                <div
                  key={`dup-${i}`}
                  style={{ transform: `rotate(${img.rotate}deg)` }}
                  className="shrink-0 w-24 h-24 rounded-2xl overflow-hidden border-2 border-[#2a2a2a] shadow-lg shadow-black/30"
                >
                  <img src={img.src} alt="" className="w-full h-full object-cover" loading="lazy" />
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <p className="mt-5 text-center text-xs text-[#555] lg:hidden">
            <Link to="/" className="text-[#00FF88] font-medium hover:underline">Back to Home</Link>
          </p>
        </div>
      </motion.div>
    </section>
  );
}
