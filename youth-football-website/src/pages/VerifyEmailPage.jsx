import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Loader2, Mail } from "lucide-react";
import { useSelector } from "react-redux";
import api from "../api/axios";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const dm = useSelector((s) => s.theme.darkMode);
  const token = searchParams.get("token");

  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token found in the link.");
      return;
    }

    api
      .get(`/auth/verify-email?token=${token}`)
      .then((res) => {
        setStatus("success");
        setMessage(res.data.message || "Email verified successfully.");
      })
      .catch((err) => {
        setStatus("error");
        setMessage(
          err.response?.data?.message || "Invalid or expired verification link."
        );
      });
  }, [token]);

  const bg = dm ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900";
  const card = dm ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200";

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 ${bg}`}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={`w-full max-w-md rounded-2xl border shadow-lg p-8 text-center ${card}`}
      >
        {status === "loading" && (
          <>
            <Loader2 className="mx-auto mb-4 h-12 w-12 text-green-500 animate-spin" />
            <h2 className="text-xl font-semibold mb-2">Verifying your email…</h2>
            <p className={`text-sm ${dm ? "text-gray-400" : "text-gray-500"}`}>
              Please wait a moment.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-green-500" />
            <h2 className="text-xl font-semibold mb-2">Email Verified!</h2>
            <p className={`text-sm mb-6 ${dm ? "text-gray-400" : "text-gray-500"}`}>
              {message}
            </p>
            <Link
              to="/Login"
              className="inline-block px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
            >
              Go to Login
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
            <h2 className="text-xl font-semibold mb-2">Verification Failed</h2>
            <p className={`text-sm mb-6 ${dm ? "text-gray-400" : "text-gray-500"}`}>
              {message}
            </p>
            <div className="flex flex-col gap-3">
              <Link
                to="/Login"
                className="inline-block px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
              >
                Go to Login
              </Link>
              <p className={`text-xs ${dm ? "text-gray-500" : "text-gray-400"}`}>
                <Mail className="inline h-3.5 w-3.5 mr-1" />
                Log in and resend the verification email from your account settings.
              </p>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
