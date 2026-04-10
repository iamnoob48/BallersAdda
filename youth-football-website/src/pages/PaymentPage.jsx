import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import {
  CreditCard,
  Lock,
  CheckCircle,
  Shield,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { useJoinAcademyMutation } from "../redux/slices/academySlice";

export default function PaymentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dm = useSelector((state) => state.theme.darkMode);

  // Academy info passed via router state
  const academy = location.state?.academy;
  const selectedPlan = location.state?.plan || "Football Coaching";
  const price = location.state?.price || 2999;

  const [joinAcademy, { isLoading: isJoining }] = useJoinAcademyMutation();

  const [form, setForm] = useState({
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvv: "",
  });
  const [step, setStep] = useState("form"); // form → processing → success
  const [errors, setErrors] = useState({});

  // Format card number with spaces
  const formatCard = (val) =>
    val
      .replace(/\D/g, "")
      .slice(0, 16)
      .replace(/(\d{4})(?=\d)/g, "$1 ");

  const formatExpiry = (val) => {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  };

  const validate = () => {
    const e = {};
    if (form.cardNumber.replace(/\s/g, "").length !== 16) e.cardNumber = "Enter 16-digit card number";
    if (!form.cardName.trim()) e.cardName = "Name is required";
    if (!/^\d{2}\/\d{2}$/.test(form.expiry)) e.expiry = "MM/YY format";
    if (!/^\d{3,4}$/.test(form.cvv)) e.cvv = "3 or 4 digits";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setStep("processing");

    // Simulate payment delay
    await new Promise((r) => setTimeout(r, 2500));

    try {
      await joinAcademy(Number(id)).unwrap();
      setStep("success");
    } catch (err) {
      setStep("form");
      setErrors({ api: err?.data?.message || "Payment failed. Try again." });
    }
  };

  const inputClass = (field) =>
    `w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all ${
      errors[field]
        ? "border-red-500 ring-2 ring-red-500/20"
        : dm
        ? "bg-[#0a0f12] border-[#87A98D]/20 text-gray-200 placeholder:text-gray-600 focus:border-[#00FF88]/50 focus:ring-2 focus:ring-[#00FF88]/20"
        : "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
    }`;

  return (
    <div className={`min-h-screen py-8 px-4 ${dm ? "bg-[#121212]" : "bg-gray-50"}`}>
      <div className="max-w-lg mx-auto">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className={`flex items-center gap-2 mb-6 text-sm font-medium transition-colors ${
            dm ? "text-gray-400 hover:text-[#00FF88]" : "text-gray-500 hover:text-emerald-600"
          }`}
        >
          <ArrowLeft className="w-4 h-4" /> Back to Academy
        </button>

        <AnimatePresence mode="wait">
          {/* ─── FORM STEP ─── */}
          {step === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`rounded-2xl border shadow-xl overflow-hidden ${
                dm ? "bg-[#1a1a1a] border-[#87A98D]/15 shadow-black/30" : "bg-white border-gray-200 shadow-gray-200/60"
              }`}
            >
              {/* Header */}
              <div className={`px-6 py-5 border-b ${dm ? "border-[#87A98D]/10 bg-[#0a0f12]" : "border-gray-100 bg-gray-50"}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-xl ${dm ? "bg-[#00FF88]/10" : "bg-emerald-50"}`}>
                    <CreditCard className={`w-5 h-5 ${dm ? "text-[#00FF88]" : "text-emerald-600"}`} />
                  </div>
                  <h2 className={`text-lg font-bold ${dm ? "text-gray-100" : "text-gray-900"}`}>Payment Details</h2>
                </div>
                <div className={`flex items-center justify-between p-3 rounded-xl ${dm ? "bg-[#1a1a1a]" : "bg-white"}`}>
                  <div>
                    <p className={`text-xs ${dm ? "text-gray-500" : "text-gray-400"}`}>Joining</p>
                    <p className={`font-semibold text-sm ${dm ? "text-gray-200" : "text-gray-800"}`}>
                      {academy?.name || "Academy"} — {selectedPlan}
                    </p>
                  </div>
                  <p className={`text-xl font-bold ${dm ? "text-[#00FF88]" : "text-emerald-600"}`}>₹{price.toLocaleString("en-IN")}</p>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {errors.api && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {errors.api}
                  </div>
                )}

                <div>
                  <label className={`text-xs font-bold uppercase tracking-wide mb-1.5 block ${dm ? "text-gray-500" : "text-gray-500"}`}>
                    Card Number
                  </label>
                  <input
                    type="text"
                    value={form.cardNumber}
                    onChange={(e) => setForm({ ...form, cardNumber: formatCard(e.target.value) })}
                    placeholder="1234 5678 9012 3456"
                    className={inputClass("cardNumber")}
                  />
                  {errors.cardNumber && <p className="text-red-400 text-xs mt-1">{errors.cardNumber}</p>}
                </div>

                <div>
                  <label className={`text-xs font-bold uppercase tracking-wide mb-1.5 block ${dm ? "text-gray-500" : "text-gray-500"}`}>
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    value={form.cardName}
                    onChange={(e) => setForm({ ...form, cardName: e.target.value })}
                    placeholder="John Doe"
                    className={inputClass("cardName")}
                  />
                  {errors.cardName && <p className="text-red-400 text-xs mt-1">{errors.cardName}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`text-xs font-bold uppercase tracking-wide mb-1.5 block ${dm ? "text-gray-500" : "text-gray-500"}`}>
                      Expiry
                    </label>
                    <input
                      type="text"
                      value={form.expiry}
                      onChange={(e) => setForm({ ...form, expiry: formatExpiry(e.target.value) })}
                      placeholder="MM/YY"
                      className={inputClass("expiry")}
                    />
                    {errors.expiry && <p className="text-red-400 text-xs mt-1">{errors.expiry}</p>}
                  </div>
                  <div>
                    <label className={`text-xs font-bold uppercase tracking-wide mb-1.5 block ${dm ? "text-gray-500" : "text-gray-500"}`}>
                      CVV
                    </label>
                    <input
                      type="password"
                      value={form.cvv}
                      onChange={(e) => setForm({ ...form, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                      placeholder="•••"
                      className={inputClass("cvv")}
                    />
                    {errors.cvv && <p className="text-red-400 text-xs mt-1">{errors.cvv}</p>}
                  </div>
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  disabled={isJoining}
                  className={`w-full mt-2 font-bold py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${
                    dm
                      ? "bg-[#00FF88] text-[#121212] hover:bg-[#00FF88]/90 shadow-[#00FF88]/10"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200"
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  Pay ₹{price.toLocaleString("en-IN")}
                </motion.button>

                <div className={`flex items-center justify-center gap-2 pt-2 text-xs ${dm ? "text-gray-600" : "text-gray-400"}`}>
                  <Shield className="w-3.5 h-3.5" />
                  <span>Secured with 256-bit SSL encryption</span>
                </div>
              </form>
            </motion.div>
          )}

          {/* ─── PROCESSING STEP ─── */}
          {step === "processing" && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`rounded-2xl border shadow-xl p-12 flex flex-col items-center gap-6 ${
                dm ? "bg-[#1a1a1a] border-[#87A98D]/15" : "bg-white border-gray-200"
              }`}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              >
                <Loader2 className={`w-12 h-12 ${dm ? "text-[#00FF88]" : "text-emerald-500"}`} />
              </motion.div>
              <div className="text-center">
                <h3 className={`text-lg font-bold mb-1 ${dm ? "text-gray-100" : "text-gray-900"}`}>
                  Processing Payment
                </h3>
                <p className={`text-sm ${dm ? "text-gray-500" : "text-gray-400"}`}>
                  Please wait while we process your payment...
                </p>
              </div>
            </motion.div>
          )}

          {/* ─── SUCCESS STEP ─── */}
          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`rounded-2xl border shadow-xl p-10 text-center ${
                dm ? "bg-[#1a1a1a] border-[#87A98D]/15" : "bg-white border-gray-200"
              }`}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center ${
                  dm ? "bg-[#00FF88]/10" : "bg-emerald-50"
                }`}
              >
                <CheckCircle className={`w-10 h-10 ${dm ? "text-[#00FF88]" : "text-emerald-500"}`} />
              </motion.div>

              <h3 className={`text-2xl font-bold mb-2 ${dm ? "text-gray-100" : "text-gray-900"}`}>
                Payment Successful!
              </h3>
              <p className={`text-sm mb-1 ${dm ? "text-gray-400" : "text-gray-500"}`}>
                You've successfully joined <span className="font-semibold">{academy?.name || "the academy"}</span>
              </p>
              <p className={`text-xs mb-8 ${dm ? "text-gray-600" : "text-gray-400"}`}>
                Transaction ID: TXN{Date.now().toString(36).toUpperCase()}
              </p>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate("/home")}
                  className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-colors ${
                    dm
                      ? "bg-[#00FF88] text-[#121212] hover:bg-[#00FF88]/90"
                      : "bg-emerald-600 text-white hover:bg-emerald-700"
                  }`}
                >
                  Go to Dashboard
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(`/academy/details/${id}`)}
                  className={`flex-1 py-3 rounded-xl font-semibold text-sm border transition-colors ${
                    dm
                      ? "border-[#87A98D]/20 text-gray-300 hover:bg-[#87A98D]/10"
                      : "border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  View Academy
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
