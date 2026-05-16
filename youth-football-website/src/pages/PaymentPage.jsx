import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { useSelector } from "react-redux";
import {
  CreditCard,
  CheckCircle,
  Shield,
  ArrowLeft,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  useCreateAcademyOrderMutation,
  useVerifyAcademyPaymentMutation,
} from "../redux/slices/paymentApi";

export default function PaymentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dm = useSelector((state) => state.theme.darkMode);

  const academy = location.state?.academy;
  const selectedPlan = location.state?.plan;
  const price = location.state?.price || 0;
  const planId = location.state?.planId;
  const batchId = location.state?.batchId;

  const [createOrder] = useCreateAcademyOrderMutation();
  const [verifyPayment] = useVerifyAcademyPaymentMutation();

  const [step, setStep] = useState("summary");
  const [error, setError] = useState(null);
  const [txnId, setTxnId] = useState(null);

  const handlePay = async () => {
    setError(null);
    setStep("processing");

    try {
      const orderRes = await createOrder({
        academyId: Number(id),
        planId: Number(planId),
        batchId: batchId ? Number(batchId) : undefined,
      }).unwrap();

      const options = {
        key: orderRes.keyId,
        amount: orderRes.amount,
        currency: orderRes.currency,
        name: "BallersAdda",
        description: `${orderRes.academy.name} — ${orderRes.plan.title}`,
        order_id: orderRes.orderId,
        prefill: orderRes.prefill,
        theme: { color: dm ? "#00FF88" : "#059669" },
        handler: async (response) => {
          setStep("verifying");
          try {
            const verifyRes = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }).unwrap();
            setTxnId(verifyRes.transactionId);
            setStep("success");
          } catch (err) {
            setError(err?.data?.message || "Payment verification failed. Contact support.");
            setStep("error");
          }
        },
        modal: {
          ondismiss: () => {
            setStep("summary");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response) => {
        setError(response.error?.description || "Payment failed. Please try again.");
        setStep("error");
      });
      rzp.open();
    } catch (err) {
      setError(err?.data?.message || "Could not create payment order. Try again.");
      setStep("error");
    }
  };

  return (
    <div className={`min-h-screen py-8 px-4 ${dm ? "bg-[#121212]" : "bg-gray-50"}`}>
      <div className="max-w-lg mx-auto">
        <button
          onClick={() => navigate(-1)}
          className={`flex items-center gap-2 mb-6 text-sm font-medium transition-colors ${
            dm ? "text-gray-400 hover:text-[#00FF88]" : "text-gray-500 hover:text-emerald-600"
          }`}
        >
          <ArrowLeft className="w-4 h-4" /> Back to Academy
        </button>

        <AnimatePresence mode="wait">
          {step === "summary" && (
            <motion.div
              key="summary"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`rounded-2xl border shadow-xl overflow-hidden ${
                dm ? "bg-[#1a1a1a] border-[#87A98D]/15 shadow-black/30" : "bg-white border-gray-200 shadow-gray-200/60"
              }`}
            >
              <div className={`px-6 py-5 border-b ${dm ? "border-[#87A98D]/10 bg-[#0a0f12]" : "border-gray-100 bg-gray-50"}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-xl ${dm ? "bg-[#00FF88]/10" : "bg-emerald-50"}`}>
                    <CreditCard className={`w-5 h-5 ${dm ? "text-[#00FF88]" : "text-emerald-600"}`} />
                  </div>
                  <h2 className={`text-lg font-bold ${dm ? "text-gray-100" : "text-gray-900"}`}>Order Summary</h2>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className={`p-4 rounded-xl ${dm ? "bg-[#0a0f12]" : "bg-gray-50"}`}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className={`text-xs ${dm ? "text-gray-500" : "text-gray-400"}`}>Academy</p>
                      <p className={`font-semibold text-sm ${dm ? "text-gray-200" : "text-gray-800"}`}>
                        {academy?.name || "Academy"}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className={`text-xs ${dm ? "text-gray-500" : "text-gray-400"}`}>Plan</p>
                      <p className={`font-semibold text-sm ${dm ? "text-gray-200" : "text-gray-800"}`}>
                        {selectedPlan || "Selected Plan"}
                      </p>
                    </div>
                    <p className={`text-xl font-bold ${dm ? "text-[#00FF88]" : "text-emerald-600"}`}>
                      ₹{price.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>

                <div className={`p-3 rounded-xl text-xs ${dm ? "bg-[#00FF88]/5 text-[#00FF88]/70" : "bg-emerald-50 text-emerald-700"}`}>
                  You'll be redirected to Razorpay's secure checkout. Supports UPI, Cards, Netbanking & Wallets.
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handlePay}
                  className={`w-full font-bold py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${
                    dm
                      ? "bg-[#00FF88] text-[#121212] hover:bg-[#00FF88]/90 shadow-[#00FF88]/10"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200"
                  }`}
                >
                  Pay ₹{price.toLocaleString("en-IN")}
                </motion.button>

                <div className={`flex items-center justify-center gap-2 pt-1 text-xs ${dm ? "text-gray-600" : "text-gray-400"}`}>
                  <Shield className="w-3.5 h-3.5" />
                  <span>Secured by Razorpay</span>
                </div>
              </div>
            </motion.div>
          )}

          {(step === "processing" || step === "verifying") && (
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
                  {step === "verifying" ? "Verifying Payment" : "Processing"}
                </h3>
                <p className={`text-sm ${dm ? "text-gray-500" : "text-gray-400"}`}>
                  {step === "verifying"
                    ? "Confirming your payment and creating enrollment..."
                    : "Opening payment gateway..."}
                </p>
              </div>
            </motion.div>
          )}

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
                You've joined <span className="font-semibold">{academy?.name || "the academy"}</span>
              </p>
              {txnId && (
                <p className={`text-xs mb-8 ${dm ? "text-gray-600" : "text-gray-400"}`}>
                  Transaction ID: {txnId}
                </p>
              )}

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

          {step === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`rounded-2xl border shadow-xl p-10 text-center ${
                dm ? "bg-[#1a1a1a] border-[#87A98D]/15" : "bg-white border-gray-200"
              }`}
            >
              <div className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center ${
                dm ? "bg-red-500/10" : "bg-red-50"
              }`}>
                <AlertCircle className={`w-10 h-10 ${dm ? "text-red-400" : "text-red-500"}`} />
              </div>

              <h3 className={`text-xl font-bold mb-2 ${dm ? "text-gray-100" : "text-gray-900"}`}>
                Payment Failed
              </h3>
              <p className={`text-sm mb-8 ${dm ? "text-gray-400" : "text-gray-500"}`}>
                {error}
              </p>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setError(null);
                  setStep("summary");
                }}
                className={`w-full py-3 rounded-xl font-semibold text-sm transition-colors ${
                  dm
                    ? "bg-[#00FF88] text-[#121212] hover:bg-[#00FF88]/90"
                    : "bg-emerald-600 text-white hover:bg-emerald-700"
                }`}
              >
                Try Again
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
