import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, KeyRound, Loader2, XCircle } from "lucide-react";
import { useSelector } from "react-redux";
import { resetPassword as betterAuthResetPassword } from "../lib/auth-client.js";

function StrengthBar({ password }) {
  if (!password) return null;
  let s = 0;
  if (password.length >= 8) s++;
  if (/[A-Z]/.test(password)) s++;
  if (/[0-9]/.test(password)) s++;
  if (/[^A-Za-z0-9]/.test(password)) s++;
  const colors = ["bg-red-500", "bg-red-500", "bg-amber-400", "bg-emerald-400", "bg-emerald-400"];
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i < s ? colors[s] : "bg-gray-300 dark:bg-gray-600"}`} />
        ))}
      </div>
      <p className="text-xs text-gray-400">{labels[s]}</p>
    </div>
  );
}

export default function ResetPasswordPage() {
  const dm = useSelector((s) => s.theme.darkMode);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const bg = dm ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900";
  const card = dm ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200";
  const input = dm
    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-green-500"
    : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-green-600";

  if (!token) {
    return (
      <div className={`min-h-screen flex items-center justify-center px-4 ${bg}`}>
        <div className={`w-full max-w-md rounded-2xl border shadow-lg p-8 text-center ${card}`}>
          <XCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h2 className="text-xl font-semibold mb-2">Invalid link</h2>
          <p className={`text-sm mb-6 ${dm ? "text-gray-400" : "text-gray-500"}`}>
            No reset token found. Request a new link.
          </p>
          <Link to="/forgot-password" className="text-sm font-medium text-green-600 hover:text-green-700">
            Request new link
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setLoading(true);
    try {
      const { error: err } = await betterAuthResetPassword({ token, newPassword: password });
      if (err) {
        setError(err.message || "Invalid or expired link. Request a new one.");
      } else {
        navigate("/Login", { state: { message: "Password reset. Please log in." } });
      }
    } catch (err) {
      setError(err?.message || "Invalid or expired link. Request a new one.");
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
        <KeyRound className="mb-4 h-10 w-10 text-green-500" />
        <h2 className="text-2xl font-bold mb-1">Set new password</h2>
        <p className={`text-sm mb-6 ${dm ? "text-gray-400" : "text-gray-500"}`}>
          Must be at least 8 characters. All existing sessions will be signed out.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-1.5 ${dm ? "text-gray-300" : "text-gray-700"}`}>
              New password
            </label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className={`w-full pr-10 px-4 py-3 rounded-lg border outline-none transition focus:ring-2 focus:ring-green-500/30 ${input}`}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <StrengthBar password={password} />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1.5 ${dm ? "text-gray-300" : "text-gray-700"}`}>
              Confirm password
            </label>
            <input
              type={showPw ? "text" : "password"}
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat password"
              className={`w-full px-4 py-3 rounded-lg border outline-none transition focus:ring-2 focus:ring-green-500/30 ${input}`}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Reset password
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/forgot-password" className={`text-xs ${dm ? "text-gray-500" : "text-gray-400"} hover:text-green-600`}>
            Need a new link?
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
