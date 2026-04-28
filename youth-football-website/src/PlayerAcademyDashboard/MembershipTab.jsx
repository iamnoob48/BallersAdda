// ── MembershipTab ─────────────────────────────────────────────────────────
// Tab: Membership — active billing plan + Leave Academy workflow.
//
// Sections:
//   Active Plan Card  → current plan name, price, next billing date
//   Danger Zone       → "Leave Academy" button with consequence notice
//   Confirmation Modal → Framer Motion overlay with simulated loading state
//
// FRONTEND ONLY — leave the Redux dispatch as a TODO comment.

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch } from "react-redux";
import { CreditCard, CalendarClock, AlertTriangle, X, Loader2 } from "lucide-react";
import { leaveAcademy } from "../redux/slices/playerSlice";

// ── Mock billing data (replace with real API data) ────────────────────────
const MOCK_PLAN = {
  name: "Elite U-15 Squad",
  price: "₹2,500",
  cycle: "monthly",
  nextBillingDate: "April 30, 2026",
  status: "Active",
};

export default function MembershipTab({ profile, academy, dm }) {
  const dispatch = useDispatch();
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [leaveError, setLeaveError] = useState(null);

  const handleLeaveConfirm = async () => {
    setIsLeaving(true);
    setLeaveError(null);
    const result = await dispatch(leaveAcademy());
    if (leaveAcademy.fulfilled.match(result)) {
      setIsLeaveModalOpen(false);
    } else {
      setLeaveError(result.payload || "Something went wrong. Please try again.");
    }
    setIsLeaving(false);
  };

  // ── Card / section base styles ────────────────────────────────────────
  const card = dm
    ? "bg-[#1a1a1a] border-[#87A98D]/15 text-white"
    : "bg-white border-gray-200 text-gray-900 shadow-sm";

  return (
    <div className="space-y-6">

      {/* ══════ Active Plan Card ══════ */}
      <section
        aria-label="Active membership plan"
        className={`rounded-2xl border p-6 md:p-8 ${card}`}
      >
        <div className="flex items-center gap-2 mb-5">
          <CreditCard className={`w-5 h-5 ${dm ? "text-[#00FF88]" : "text-emerald-600"}`} />
          <h2 className="text-lg font-bold">Active Plan</h2>
        </div>

        <div className={`rounded-xl p-5 border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${
          dm ? "bg-[#121212] border-[#87A98D]/15" : "bg-gray-50 border-gray-100"
        }`}>
          {/* Plan identity */}
          <div>
            <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${dm ? "text-gray-500" : "text-gray-400"}`}>
              Plan
            </p>
            <p className={`text-xl font-extrabold ${dm ? "text-white" : "text-gray-900"}`}>
              {MOCK_PLAN.name}
            </p>
            <p className={`text-sm mt-0.5 ${dm ? "text-gray-400" : "text-gray-500"}`}>
              {academy?.name || "Your Academy"}
            </p>
          </div>

          {/* Price */}
          <div className="text-center sm:text-right">
            <p className={`text-2xl font-black ${dm ? "text-[#00FF88]" : "text-emerald-600"}`}>
              {MOCK_PLAN.price}
            </p>
            <p className={`text-xs ${dm ? "text-gray-500" : "text-gray-400"}`}>
              / {MOCK_PLAN.cycle}
            </p>
          </div>

          {/* Status badge */}
          <span className={`self-start sm:self-center px-3 py-1 text-xs font-bold rounded-full ${
            dm ? "bg-[#00FF88]/15 text-[#00FF88]" : "bg-emerald-50 text-emerald-700"
          }`}>
            {MOCK_PLAN.status}
          </span>
        </div>

        {/* Next billing date */}
        <div className={`mt-4 flex items-center gap-2 text-sm ${dm ? "text-gray-400" : "text-gray-500"}`}>
          <CalendarClock className="w-4 h-4 shrink-0" />
          <span>
            Next billing date: <span className={`font-semibold ${dm ? "text-gray-200" : "text-gray-700"}`}>
              {MOCK_PLAN.nextBillingDate}
            </span>
          </span>
        </div>
      </section>

      {/* ══════ Danger Zone ══════ */}
      <section
        aria-label="Leave academy"
        className={`rounded-2xl border p-6 md:p-8 ${
          dm ? "bg-[#1a1a1a] border-red-900/30" : "bg-white border-red-100 shadow-sm"
        }`}
      >
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <h2 className={`text-lg font-bold ${dm ? "text-red-400" : "text-red-600"}`}>
            Leave Academy
          </h2>
        </div>

        <p className={`text-sm mb-1 ${dm ? "text-gray-400" : "text-gray-500"}`}>
          Submitting a leave request will <strong>notify your coach</strong>, but your membership
          remains active until the end of the current billing cycle (
          <span className={`font-semibold ${dm ? "text-gray-200" : "text-gray-700"}`}>
            {MOCK_PLAN.nextBillingDate}
          </span>
          ). This is a <em>notice</em>, not an immediate removal.
        </p>

        <p className={`text-xs mb-5 ${dm ? "text-gray-600" : "text-gray-400"}`}>
          No refunds are issued for the remaining billing period.
        </p>

        <button
          onClick={() => setIsLeaveModalOpen(true)}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold border transition-colors ${
            dm
              ? "border-red-800 text-red-400 hover:bg-red-500/10"
              : "border-red-200 text-red-600 hover:bg-red-50"
          }`}
        >
          Initiate Leave Request
        </button>
      </section>

      {/* ══════ Confirmation Modal ══════ */}
      <AnimatePresence>
        {isLeaveModalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { if (!isLeaving) { setIsLeaveModalOpen(false); setLeaveError(null); } }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={`fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none`}
            >
              <div
                className={`pointer-events-auto w-full max-w-md rounded-2xl border p-6 shadow-2xl ${
                  dm
                    ? "bg-[#1a1a1a] border-red-900/40 text-white"
                    : "bg-white border-red-100 text-gray-900"
                }`}
                role="dialog"
                aria-modal="true"
                aria-label="Confirm leave academy"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      dm ? "bg-red-500/15" : "bg-red-50"
                    }`}>
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    </div>
                    <h3 className={`text-base font-bold ${dm ? "text-white" : "text-gray-900"}`}>
                      Leave Academy?
                    </h3>
                  </div>
                  <button
                    onClick={() => { if (!isLeaving) { setIsLeaveModalOpen(false); setLeaveError(null); } }}
                    disabled={isLeaving}
                    className={`p-1 rounded-lg transition-colors ${
                      dm ? "text-gray-500 hover:text-gray-300 hover:bg-white/5" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Body */}
                <p className={`text-sm mb-2 ${dm ? "text-gray-300" : "text-gray-600"}`}>
                  Your membership will remain <strong>active until{" "}
                  <span className={dm ? "text-white" : "text-gray-900"}>{MOCK_PLAN.nextBillingDate}</span>
                  </strong>. After that date, you will be removed from the squad roster.
                </p>
                <p className={`text-xs mb-6 ${dm ? "text-gray-500" : "text-gray-400"}`}>
                  Your coach will receive a notification immediately. This action cannot be undone.
                </p>

                {/* Inline error */}
                {leaveError && (
                  <p className="text-xs text-red-500 mb-3">{leaveError}</p>
                )}

                {/* Actions */}
                <div className="flex flex-col-reverse sm:flex-row gap-3">
                  <button
                    onClick={() => { setIsLeaveModalOpen(false); setLeaveError(null); }}
                    disabled={isLeaving}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                      dm
                        ? "border-[#87A98D]/20 text-gray-300 hover:bg-white/5"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleLeaveConfirm}
                    disabled={isLeaving}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
                      isLeaving
                        ? dm ? "bg-red-900/40 text-red-300 cursor-not-allowed" : "bg-red-100 text-red-400 cursor-not-allowed"
                        : dm ? "bg-red-500/80 hover:bg-red-500 text-white" : "bg-red-600 hover:bg-red-700 text-white"
                    }`}
                  >
                    {isLeaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing…
                      </>
                    ) : (
                      "Yes, Leave Academy"
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
