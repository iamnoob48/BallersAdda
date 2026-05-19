import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import {
  FiAlertCircle,
  FiEye,
  FiEyeOff,
  FiMail,
  FiPhone,
  FiX,
  FiArrowRight,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import OTP from "../LandingComponents/OTP.jsx";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { signUp as betterAuthSignUp, signIn } from "../lib/auth-client.js";

// ── Hero slides for desktop ─────────────────────────────────────────────
const SLIDES = [
  { src: "/images/players-celebration.png", tagline: "From Grassroots to Glory.\nJoin the Movement." },
  { src: "/images/stadium-hero.png", tagline: "Where Ballers Rise.\nYour Journey Starts Here." },
];

const INPUT_CLS =
  "w-full bg-[#111] border border-[#2a2a2a] text-white placeholder-[#555] rounded-xl px-4 py-3.5 outline-none transition-all duration-200 hover:border-[#3a3a3a] focus:border-[#00FF88]/60 focus:ring-2 focus:ring-[#00FF88]/20";

// ── Password strength bar ───────────────────────────────────────────────
function PasswordStrengthBar({ password }) {
  const strength = (() => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();

  const colors = ["bg-red-500", "bg-red-500", "bg-amber-400", "bg-emerald-400", "bg-emerald-400"];
  const labels = ["", "Weak", "Fair", "Good", "Strong"];

  if (!password) return null;

  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              i < strength ? colors[strength] : "bg-[#2a2a2a]"
            }`}
          />
        ))}
      </div>
      {strength > 0 && (
        <p className={`text-xs ${strength <= 1 ? "text-red-400" : strength <= 2 ? "text-amber-400" : "text-emerald-400"}`}>
          {labels[strength]}
        </p>
      )}
    </div>
  );
}

export default function SignUp() {
  const [signUpData, setSignUpData] = useState({ email: "", password: "", username: "" });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPhone, setIsPhone] = useState(false);
  const [isPhoneLogin, setIsPhoneLogin] = useState(false);
  const [phoneNum, setPhoneNum] = useState("");
  const [errors, setErrors] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [shakeKey, setShakeKey] = useState(0);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const [slide, setSlide] = useState(0);

  const reduce = useReducedMotion();

  // Auto-advance desktop carousel
  useEffect(() => {
    const id = setInterval(() => setSlide((s) => (s + 1) % SLIDES.length), 6000);
    return () => clearInterval(id);
  }, []);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors("");

    const trimmedUsername = signUpData.username.trim();
    const trimmedEmail = signUpData.email.trim().toLowerCase();

    if (!trimmedUsername) { setErrors("Username is required."); setShakeKey((k) => k + 1); return; }
    if (!validateEmail(trimmedEmail)) { setErrors("Please enter a valid email address."); setShakeKey((k) => k + 1); return; }
    if (!signUpData.password || signUpData.password.length < 8) { setErrors("Password must be at least 8 characters long."); setShakeKey((k) => k + 1); return; }
    if (signUpData.password !== confirmPassword) { setErrors("Passwords do not match."); setShakeKey((k) => k + 1); return; }

    try {
      setSubmitting(true);
      const { data, error } = await betterAuthSignUp.email({
        name: trimmedUsername,
        email: trimmedEmail,
        password: signUpData.password,
      });
      if (error) { setErrors(error.message || "Registration failed. Please try again."); setShakeKey((k) => k + 1); return; }
      setRegisteredEmail(trimmedEmail);
      setRegistered(true);
    } catch (error) {
      setErrors(error?.message || "An unexpected error occurred. Please try again later.");
      setShakeKey((k) => k + 1);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || resendLoading) return;
    setResendLoading(true);
    try {
      await betterAuthSignUp.email({ name: signUpData.username.trim(), email: registeredEmail, password: signUpData.password });
      setResendCooldown(30);
    } catch { setResendCooldown(30); } finally { setResendLoading(false); }
  };

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const id = setInterval(() => setResendCooldown((c) => (c <= 1 ? 0 : c - 1)), 1000);
    return () => clearInterval(id);
  }, [resendCooldown]);

  const handleGoogleSignIn = async () => {
    await signIn.social({ provider: "google", callbackURL: "/home" });
  };

  const handleChange = (e) => {
    setSignUpData({ ...signUpData, [e.target.name]: e.target.value });
  };

  // ── Phone sub-view ────────────────────────────────────────────────
  if (isPhoneLogin) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-[#0e0e10] px-4">
        <OTP key="otp" onBack={() => setIsPhoneLogin(false)} />
      </section>
    );
  }

  if (isPhone) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-[#0e0e10] px-4">
        <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="w-full max-w-md bg-[#1a1a1a] rounded-3xl border border-[#00FF88]/8 shadow-2xl shadow-black/40 p-8">
          <h1 className="text-2xl font-extrabold text-white mb-1">Register With Phone</h1>
          <p className="text-sm text-[#888] mb-6">We'll send you a one-time code</p>
          <form className="space-y-5">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-[#aaa] mb-1.5">Phone Number</label>
              <PhoneInput country="in" value={phoneNum} onChange={(phone) => setPhoneNum(phone)}
                inputProps={{ id: "phone", name: "phone", required: true }}
                inputClass="!w-full !text-white !font-medium !bg-[#111] !rounded-xl !border !border-[#2a2a2a] !px-14 !py-3.5 focus:!outline-none focus:!border-[#00FF88]/60 focus:!ring-2 focus:!ring-[#00FF88]/20 transition-all"
                buttonClass="!bg-transparent !border-none !absolute !left-3" containerClass="!w-full" dropdownClass="!bg-[#1a1a1a] !text-white" />
              <p className="text-xs text-[#666] mt-1.5">You'll receive an OTP on this number</p>
            </div>
            <motion.button type="button" onClick={() => setIsPhoneLogin(true)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="w-full py-3.5 rounded-xl font-bold text-[#0e0e10] bg-gradient-to-r from-[#00FF88] to-[#00CC6A] shadow-lg shadow-[#00FF88]/20">
              Get OTP
            </motion.button>
            <button type="button" onClick={() => setIsPhone(false)} className="w-full text-sm text-[#00FF88] font-medium hover:underline">
              ← Back to Email Registration
            </button>
          </form>
        </motion.div>
      </section>
    );
  }

  // ── Email verification success ────────────────────────────────────
  if (registered) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-[#0e0e10] px-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-[#1a1a1a] rounded-3xl border border-[#00FF88]/8 shadow-2xl shadow-black/40 p-8 text-center">
          <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
            className="mx-auto w-20 h-20 rounded-full bg-[#00FF88]/10 flex items-center justify-center mb-6">
            <FiMail className="w-9 h-9 text-[#00FF88]" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white mb-2">Check your email</h2>
          <p className="text-[#888] mb-8 text-sm leading-relaxed">
            We sent a verification link to <span className="text-[#00FF88] font-medium">{registeredEmail}</span>. Click it to activate your account.
          </p>
          <div className="space-y-3">
            <motion.button type="button" onClick={handleResend} disabled={resendCooldown > 0 || resendLoading}
              whileHover={{ scale: resendCooldown > 0 ? 1 : 1.02 }} whileTap={{ scale: resendCooldown > 0 ? 1 : 0.98 }}
              className="w-full py-3 rounded-xl border border-[#00FF88]/30 text-[#00FF88] hover:bg-[#00FF88]/5 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium">
              {resendLoading ? "Sending..." : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend email"}
            </motion.button>
            <Link to="/Login" className="block text-sm text-[#888] hover:text-white transition py-2">I'll verify later — go to login</Link>
          </div>
          <p className="mt-6 text-xs text-[#555]">Didn't get it? Check your spam folder.</p>
        </motion.div>
      </section>
    );
  }

  // ── Main signup view ──────────────────────────────────────────────
  return (
    <section className="min-h-screen flex items-center justify-center bg-[#0e0e10] px-4 py-8">
      <motion.div
        key={`form-${shakeKey}`}
        initial={errors && shakeKey > 0 ? { x: 0, opacity: 1 } : { y: 30, opacity: 0 }}
        animate={errors && shakeKey > 0 ? { x: [0, -8, 8, -6, 6, 0], opacity: 1 } : { y: 0, opacity: 1 }}
        transition={{ duration: errors && shakeKey > 0 ? 0.4 : 0.6, ease: "easeOut" }}
        className="w-full max-w-[960px] flex rounded-3xl overflow-hidden border border-[#00FF88]/8 shadow-2xl shadow-black/50 lg:flex-row flex-col lg:bg-transparent bg-[#1a1a1a]"
      >
        {/* ── Desktop Left Image Panel ─────────────────────────────── */}
        <div className="hidden lg:flex lg:w-[45%] relative flex-col justify-between overflow-hidden bg-[#111]">
          <AnimatePresence mode="wait">
            <motion.img key={slide} src={SLIDES[slide].src} alt="BallersAdda"
              initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.8 }}
              className="absolute inset-0 w-full h-full object-cover" />
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
              <motion.p key={slide} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.5 }}
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
          <div className="lg:hidden text-center mb-4">
            <span className="text-lg font-extrabold text-[#00FF88]">BallersAdda</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-1.5 lg:text-left text-center">Create an account</h1>
          <p className="text-sm text-[#888] mb-5 lg:mb-7 lg:text-left text-center">
            Already have an account?{" "}
            <Link to="/Login" className="text-[#00FF88] font-medium hover:underline">Log in</Link>
          </p>

          {/* Error */}
          <AnimatePresence>
            {errors && (
              <motion.div initial={{ opacity: 0, y: -8, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -8, height: 0 }}
                className="flex items-start gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 mb-4 overflow-hidden">
                <FiAlertCircle size={16} className="shrink-0 mt-0.5" />
                <p className="text-sm flex-1">{errors}</p>
                <button onClick={() => setErrors("")} className="text-red-300/60 hover:text-red-300 p-0.5"><FiX size={14} /></button>
              </motion.div>
            )}
          </AnimatePresence>

          <form className="space-y-3.5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-[#aaa] mb-1.5">Username</label>
              <input type="text" name="username" value={signUpData.username} onChange={handleChange}
                placeholder="Choose a username" autoComplete="username" className={INPUT_CLS} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#aaa] mb-1.5">Email</label>
              <input type="email" name="email" value={signUpData.email} onChange={handleChange}
                placeholder="Enter your email" autoComplete="email" className={INPUT_CLS} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#aaa] mb-1.5">Password</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} name="password" value={signUpData.password}
                  onChange={handleChange} placeholder="Min. 8 characters" autoComplete="new-password"
                  className={`${INPUT_CLS} pr-12`} />
                <button type="button" onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#555] hover:text-[#00FF88] transition p-0.5">
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
              <PasswordStrengthBar password={signUpData.password} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#aaa] mb-1.5">Confirm Password</label>
              <div className="relative">
                <input type={showConfirm ? "text" : "password"} value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat your password"
                  autoComplete="new-password"
                  className={`${INPUT_CLS} pr-12 ${
                    confirmPassword && confirmPassword !== signUpData.password
                      ? "border-red-500/50 focus:border-red-400 focus:ring-red-400/20"
                      : confirmPassword && confirmPassword === signUpData.password ? "border-[#00FF88]/40" : ""
                  }`} />
                <button type="button" onClick={() => setShowConfirm((s) => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#555] hover:text-[#00FF88] transition p-0.5">
                  {showConfirm ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
              {confirmPassword && confirmPassword !== signUpData.password && (
                <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
              )}
            </div>

            <motion.button type="submit" disabled={submitting} whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.985 }}
              className="w-full py-3.5 rounded-xl font-bold text-[#0e0e10] bg-gradient-to-r from-[#00FF88] to-[#00CC6A] shadow-lg shadow-[#00FF88]/20 hover:shadow-[#00FF88]/30 transition-shadow disabled:opacity-50 disabled:cursor-not-allowed mt-1">
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-[#0e0e10] border-t-transparent rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : "Continue"}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4 lg:my-5">
            <div className="flex-1 h-px bg-[#2a2a2a]" />
            <span className="text-xs text-[#555]">Or sign up with</span>
            <div className="flex-1 h-px bg-[#2a2a2a]" />
          </div>

          {/* Social buttons */}
          <div className="flex gap-3">
            <motion.button type="button" onClick={handleGoogleSignIn} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="flex items-center justify-center gap-2.5 flex-1 py-3 rounded-xl border border-[#2a2a2a] bg-[#222] hover:border-[#3a3a3a] hover:bg-[#282828] transition-all text-white">
              <FcGoogle className="text-lg" /><span className="text-sm font-medium">Google</span>
            </motion.button>
            <motion.button type="button" onClick={() => setIsPhone(true)} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="flex items-center justify-center gap-2.5 flex-1 py-3 rounded-xl border border-[#2a2a2a] bg-[#222] hover:border-[#3a3a3a] hover:bg-[#282828] transition-all text-white">
              <FiPhone className="text-[#00FF88]" /><span className="text-sm font-medium">Phone</span>
            </motion.button>
          </div>

          {/* Footer */}
          <p className="mt-5 text-center text-xs text-[#555]">
            Already have an account?{" "}
            <Link to="/Login" className="text-[#00FF88] font-medium hover:underline">Login</Link>
            {" · "}
            <Link to="/" className="text-[#00FF88] font-medium hover:underline">Back to Home</Link>
          </p>
        </div>
      </motion.div>
    </section>
  );
}
