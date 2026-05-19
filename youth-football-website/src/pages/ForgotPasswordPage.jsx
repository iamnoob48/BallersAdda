import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { useSelector } from "react-redux";
import { forgetPassword } from "../lib/auth-client.js";

export default function ForgotPasswordPage() {
  const dm = useSelector((s) => s.theme.darkMode);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const bg = dm ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900";
  const card = dm ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200";
  const input = dm
    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-green-500"
    : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-green-600";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { error: err } = await forgetPassword({ email: email.trim(), redirectTo: "/reset-password" });
      if (err) {
        setError(err.message || "Something went wrong. Please try again.");
      } else {
        setSubmitted(true);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 ${bg}`}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={`w-full max-w-md rounded-2xl border shadow-lg p-8 ${card}`}
      >
        {submitted ? (
          <div className="text-center">
            <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-green-500" />
            <h2 className="text-xl font-semibold mb-2">Check your inbox</h2>
            <p className={`text-sm mb-6 ${dm ? "text-gray-400" : "text-gray-500"}`}>
              If that email is registered, a reset link has been sent. It expires in 1 hour.
            </p>
            <Link
              to="/Login"
              className="inline-flex items-center gap-2 text-sm font-medium text-green-600 hover:text-green-700"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Login
            </Link>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-1">Forgot password?</h2>
            <p className={`text-sm mb-6 ${dm ? "text-gray-400" : "text-gray-500"}`}>
              Enter your email and we'll send you a reset link.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${dm ? "text-gray-300" : "text-gray-700"}`}>
                  Email address
                </label>
                <div className="relative">
                  <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${dm ? "text-gray-400" : "text-gray-400"}`} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border outline-none transition focus:ring-2 focus:ring-green-500/30 ${input}`}
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Send reset link
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link
                to="/Login"
                className="inline-flex items-center gap-1 text-sm font-medium text-green-600 hover:text-green-700"
              >
                <ArrowLeft className="h-4 w-4" /> Back to Login
              </Link>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
