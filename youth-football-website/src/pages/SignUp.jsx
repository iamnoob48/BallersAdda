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
} from "react-icons/fi";
import { Link } from "react-router-dom";
import OTP from "../LandingComponents/OTP.jsx";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import api from "../api/axios.js";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.15 },
  },
};
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const INPUT_CLASS =
  "w-full bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 rounded-lg px-4 py-3 outline-none transition hover:border-slate-600 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30";

const LABEL_CLASS = "block text-sm font-medium text-slate-300 mb-1.5";

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
      <div
        className="flex gap-1"
        aria-label={`Password strength: ${labels[strength]}`}
      >
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              i < strength ? colors[strength] : "bg-slate-700"
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
  const [signUpData, setSignUpData] = useState({
    email: "",
    password: "",
    username: "",
  });
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

  const reduce = useReducedMotion();

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors("");

    const trimmedUsername = signUpData.username.trim();
    const trimmedEmail = signUpData.email.trim().toLowerCase();

    if (!trimmedUsername) {
      setErrors("Username is required.");
      setShakeKey((k) => k + 1);
      return;
    }
    if (!validateEmail(trimmedEmail)) {
      setErrors("Please enter a valid email address.");
      setShakeKey((k) => k + 1);
      return;
    }
    if (!signUpData.password || signUpData.password.length < 8) {
      setErrors("Password must be at least 8 characters long.");
      setShakeKey((k) => k + 1);
      return;
    }
    if (signUpData.password !== confirmPassword) {
      setErrors("Passwords do not match.");
      setShakeKey((k) => k + 1);
      return;
    }

    try {
      setSubmitting(true);
      await api.post("/auth/register", {
        username: trimmedUsername,
        email: trimmedEmail,
        password: signUpData.password,
      });
      setRegisteredEmail(trimmedEmail);
      setRegistered(true);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error?.message ||
        "An unexpected error occurred. Please try again later.";
      setErrors(message);
      setShakeKey((k) => k + 1);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || resendLoading) return;
    setResendLoading(true);
    try {
      await api.post("/auth/resend-verification");
      setResendCooldown(30);
    } catch {
      // silent — always show cooldown to prevent enumeration
      setResendCooldown(30);
    } finally {
      setResendLoading(false);
    }
  };

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const id = setInterval(
      () => setResendCooldown((c) => (c <= 1 ? 0 : c - 1)),
      1000
    );
    return () => clearInterval(id);
  }, [resendCooldown]);

  const handleGoogleSignIn = () => {
    const base = import.meta.env.VITE_BACKEND_URL || '';
    window.location.href = `${base}/api/v1/auth/google`;
  };

  const handleChange = (e) => {
    setSignUpData({ ...signUpData, [e.target.name]: e.target.value });
  };

  return (
    <section className="min-h-screen flex items-center justify-center relative bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 overflow-hidden py-12 px-4">
      {/* Pitch dot grid */}
      <div className="absolute inset-0 opacity-[0.07] bg-[radial-gradient(circle_at_50%_50%,white_1px,transparent_1px)] bg-[size:24px_24px]" />

      {/* Diagonal field stripes */}
      <div className="absolute inset-0 opacity-[0.04] bg-[repeating-linear-gradient(115deg,transparent,transparent_80px,white_80px,white_160px)]" />

      {/* Ambient orbs */}
      <motion.div
        animate={reduce ? {} : { x: [0, 40, 0], y: [0, -30, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-10 -left-20 w-72 h-72 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none"
      />
      <motion.div
        animate={reduce ? {} : { x: [0, -30, 0], y: [0, 40, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-0 -right-20 w-96 h-96 rounded-full bg-lime-400/15 blur-3xl pointer-events-none"
      />
      <motion.div
        animate={reduce ? {} : { rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        className="absolute top-1/2 left-1/2 w-[700px] h-[700px] -translate-x-1/2 -translate-y-1/2 border border-emerald-500/10 rounded-full pointer-events-none"
      />

      <AnimatePresence mode="wait">
        {isPhoneLogin ? (
          <OTP key="otp" onBack={() => setIsPhoneLogin(false)} />
        ) : isPhone ? (
          /* ── Phone number card ── */
          <motion.div
            key="phone"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative bg-slate-900/70 backdrop-blur-xl rounded-2xl shadow-[0_20px_70px_-15px_rgba(16,185,129,0.3)] p-8 w-full max-w-md border border-emerald-500/20 ring-1 ring-white/5"
          >
            <div className="mb-6 text-center">
              <div className="inline-block w-12 h-1 bg-gradient-to-r from-emerald-400 to-lime-400 rounded-full mb-4" />
              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                Register With{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-lime-400">
                  Phone
                </span>
              </h1>
            </div>

            <form className="space-y-5">
              <div>
                <label htmlFor="phone" className={LABEL_CLASS}>
                  Phone Number
                </label>
                <div className="relative group">
                  <PhoneInput
                    country="in"
                    value={phoneNum}
                    onChange={(phone) => setPhoneNum(phone)}
                    inputProps={{ id: "phone", name: "phone", required: true }}
                    inputClass="!w-full !text-white !font-medium !bg-slate-800/50 !rounded-lg !border !border-slate-700 !px-14 !py-3 focus:!outline-none focus:!border-emerald-400 focus:!ring-2 focus:!ring-emerald-400/30 transition-all duration-200"
                    buttonClass="!bg-transparent !border-none !absolute !left-3"
                    containerClass="!w-full"
                    dropdownClass="!bg-slate-800 !text-white"
                  />
                  <span className="absolute left-0 bottom-0 h-[2px] w-0 bg-emerald-500 transition-all duration-300 group-focus-within:w-full rounded-full" />
                </div>
                <p className="text-xs text-slate-500 mt-1.5">
                  You'll receive an OTP on this number
                </p>
              </div>

              <motion.button
                type="button"
                onClick={() => setIsPhoneLogin(true)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-emerald-500 to-lime-500 text-slate-950 font-bold py-3 rounded-lg shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all"
              >
                Get OTP
              </motion.button>

              <button
                type="button"
                onClick={() => setIsPhone(false)}
                className="w-full text-emerald-400 font-medium mt-1 hover:underline text-sm"
              >
                Back to Email Registration
              </button>
            </form>
          </motion.div>
        ) : registered ? (
          /* ── Email verification success ── */
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="relative bg-slate-900/70 backdrop-blur-xl rounded-2xl shadow-[0_20px_70px_-15px_rgba(16,185,129,0.3)] p-8 w-full max-w-md border border-emerald-500/20 ring-1 ring-white/5 text-center"
            role="status"
            aria-live="polite"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
              className="mx-auto w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mb-6"
            >
              <FiMail className="w-9 h-9 text-emerald-400" aria-hidden="true" />
            </motion.div>

            <h2 className="text-2xl font-bold text-white mb-2">Check your email</h2>
            <p className="text-slate-400 mb-8 text-sm leading-relaxed">
              We sent a verification link to{" "}
              <span className="text-emerald-400 font-medium">{registeredEmail}</span>.
              Click it to activate your account.
            </p>

            <div className="space-y-3">
              <motion.button
                type="button"
                onClick={handleResend}
                disabled={resendCooldown > 0 || resendLoading}
                whileHover={{ scale: resendCooldown > 0 ? 1 : 1.02 }}
                whileTap={{ scale: resendCooldown > 0 ? 1 : 0.98 }}
                className="w-full py-3 rounded-lg border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {resendLoading
                  ? "Sending..."
                  : resendCooldown > 0
                  ? `Resend in ${resendCooldown}s`
                  : "Resend email"}
              </motion.button>

              <Link
                to="/Login"
                className="block text-sm text-slate-400 hover:text-white transition py-2"
              >
                I'll verify later — go to login
              </Link>
            </div>

            <p className="mt-6 text-xs text-slate-600">
              Didn't get it? Check your spam folder.
            </p>
          </motion.div>
        ) : (
          /* ── Main registration form ── */
          <motion.div
            key={`form-${shakeKey}`}
            initial={{ y: 40, opacity: 0 }}
            animate={
              errors && shakeKey > 0
                ? { y: 0, opacity: 1, x: [0, -8, 8, -6, 6, 0] }
                : { y: 0, opacity: 1 }
            }
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: errors && shakeKey > 0 ? 0.4 : 0.6, ease: "easeOut" }}
            className="relative bg-slate-900/70 backdrop-blur-xl rounded-2xl shadow-[0_20px_70px_-15px_rgba(16,185,129,0.3)] p-8 w-full max-w-md border border-emerald-500/20 ring-1 ring-white/5"
          >
            {/* Header */}
            <div className="mb-8 text-center">
              <div className="inline-block w-12 h-1 bg-gradient-to-r from-emerald-400 to-lime-400 rounded-full mb-4" />
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                Join{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-lime-400">
                  BallersAdda
                </span>
              </h1>
              <p className="text-sm text-slate-400 mt-2">
                Build your football journey — grassroots to glory.
              </p>
            </div>

            {/* Error banner */}
            <AnimatePresence>
              {errors && (
                <motion.div
                  initial={{ opacity: 0, y: -8, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -8, height: 0 }}
                  role="alert"
                  aria-live="assertive"
                  className="flex items-start gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 mb-5 overflow-hidden"
                >
                  <FiAlertCircle size={18} className="shrink-0 mt-0.5" aria-hidden="true" />
                  <p className="text-sm flex-1">{errors}</p>
                  <button
                    type="button"
                    onClick={() => setErrors("")}
                    aria-label="Dismiss error"
                    className="text-red-300/60 hover:text-red-300 transition focus:outline-none focus:ring-2 focus:ring-red-400/50 rounded p-0.5"
                  >
                    <FiX size={16} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.form
              className="space-y-5"
              onSubmit={handleSubmit}
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              {/* Username */}
              <motion.div variants={itemVariants}>
                <label htmlFor="username" className={LABEL_CLASS}>
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  name="username"
                  value={signUpData.username}
                  onChange={handleChange}
                  placeholder="Choose a username"
                  autoComplete="username"
                  className={INPUT_CLASS}
                />
              </motion.div>

              {/* Email */}
              <motion.div variants={itemVariants}>
                <label htmlFor="email" className={LABEL_CLASS}>
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={signUpData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  autoComplete="email"
                  className={INPUT_CLASS}
                />
              </motion.div>

              {/* Password */}
              <motion.div variants={itemVariants}>
                <label htmlFor="password" className={LABEL_CLASS}>
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={signUpData.password}
                    onChange={handleChange}
                    placeholder="Min. 8 characters"
                    autoComplete="new-password"
                    className={`${INPUT_CLASS} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-400 transition p-1 rounded focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
                <PasswordStrengthBar password={signUpData.password} />
              </motion.div>

              {/* Confirm password */}
              <motion.div variants={itemVariants}>
                <label htmlFor="confirmPassword" className={LABEL_CLASS}>
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat your password"
                    autoComplete="new-password"
                    className={`${INPUT_CLASS} pr-12 ${
                      confirmPassword && confirmPassword !== signUpData.password
                        ? "border-red-500/60 focus:border-red-400 focus:ring-red-400/30"
                        : confirmPassword && confirmPassword === signUpData.password
                        ? "border-emerald-500/60"
                        : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((s) => !s)}
                    aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-400 transition p-1 rounded focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                  >
                    {showConfirm ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
                {confirmPassword && confirmPassword !== signUpData.password && (
                  <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
                )}
              </motion.div>

              {/* Submit */}
              <motion.div variants={itemVariants}>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={submitting}
                  className="w-full relative overflow-hidden bg-gradient-to-r from-emerald-500 to-lime-500 text-slate-950 font-bold py-3 rounded-lg shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      Creating account...
                    </span>
                  ) : (
                    "Kick Off Your Journey"
                  )}
                </motion.button>
              </motion.div>

              {/* OAuth buttons */}
              <motion.div variants={itemVariants} className="flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-700" />
                <span className="text-xs text-slate-500">or continue with</span>
                <div className="flex-1 h-px bg-slate-700" />
              </motion.div>

              <motion.div variants={itemVariants} className="flex gap-3">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleGoogleSignIn}
                  className="flex items-center justify-center gap-2 flex-1 py-2.5 border border-slate-700 rounded-lg hover:bg-slate-800 hover:border-slate-600 transition text-slate-300"
                >
                  <FcGoogle className="text-xl" />
                  <span className="font-medium text-sm">Google</span>
                </motion.button>

                <motion.button
                  type="button"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setIsPhone(true)}
                  className="flex items-center justify-center gap-2 flex-1 py-2.5 border border-slate-700 rounded-lg hover:bg-slate-800 hover:border-slate-600 transition text-slate-300"
                >
                  <FiPhone className="text-lg text-emerald-400" />
                  <span className="font-medium text-sm">Phone</span>
                </motion.button>
              </motion.div>
            </motion.form>

            <p className="mt-6 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link to="/Login" className="text-emerald-400 font-medium hover:underline">
                Login
              </Link>
            </p>
            <p className="mt-2 text-center text-sm text-slate-500">
              <Link to="/" className="text-emerald-400 font-medium hover:underline">
                Back to Home
              </Link>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
