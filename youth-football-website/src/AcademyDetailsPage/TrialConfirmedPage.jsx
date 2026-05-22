import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  CalendarCheck,
  MapPin,
  Clock,
  ArrowLeft,
  CheckCircle2,
  Info,
  X as XIcon,
  AlertTriangle,
  RefreshCw,
  Loader2,
} from "lucide-react";
import NavBar from "../components/Navbar.jsx";
import TopNav from "../components/TopNav.jsx";
import BottomNav from "../components/BottomNav.jsx";
import { useIsMobile } from "../hooks/useIsMobile.js";
import { useCancelTrialMutation } from "../redux/slices/academySlice";

const INSTRUCTIONS = [
  "Arrive 15 minutes early to complete registration",
  "Bring water bottle and football boots (studs or turf shoes)",
  "Wear comfortable sports clothing",
  "Bring shin guards if you have them",
  "A parent or guardian must accompany players under 14",
];

export default function TrialConfirmedPage() {
  const dm = useSelector((state) => state.theme.darkMode);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { state } = useLocation();

  const [cancelTrial, { isLoading: isCancelling }] = useCancelTrialMutation();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [cancelError, setCancelError] = useState(null);

  if (!state?.booking) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${dm ? "bg-[#0a0a0a] text-gray-200" : "bg-[#F8F9FA] text-gray-800"}`}
      >
        <div className="text-center">
          <p className="text-lg font-semibold mb-2">No booking data found</p>
          <button
            onClick={() => navigate("/academies")}
            className={`text-sm font-medium ${dm ? "text-[#00FF88]" : "text-emerald-600"}`}
          >
            Browse Academies
          </button>
        </div>
      </div>
    );
  }

  const { booking, session, academy } = state;
  const date = new Date(booking.scheduledDate);
  const formattedDate = date.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const isBooked = booking.status === "BOOKED";
  const canReschedule = isBooked && booking.hasRebooked === false;

  const handleCancel = async () => {
    setCancelError(null);
    try {
      await cancelTrial({ academyId: booking.academyId }).unwrap();
      setShowCancelModal(false);
      navigate(`/academy/details/${booking.academyId}`);
    } catch (err) {
      setCancelError(err?.data?.message || "Failed to cancel trial");
    }
  };

  const handleReschedule = async () => {
    setCancelError(null);
    try {
      await cancelTrial({ academyId: booking.academyId }).unwrap();
      setShowRescheduleModal(false);
      navigate(`/academy/details/${booking.academyId}`, {
        state: { openTrial: true },
      });
    } catch (err) {
      setCancelError(err?.data?.message || "Failed to cancel trial");
    }
  };

  return (
    <div
      className={`min-h-screen font-sans pb-20 ${dm ? "bg-[#0a0a0a] text-gray-200" : "bg-[#F8F9FA] text-gray-800"}`}
    >
      {isMobile ? <TopNav /> : <NavBar />}

      <div className="max-w-2xl mx-auto px-4 pt-8 md:pt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className={`w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center ${dm ? "bg-[#00FF88]/15" : "bg-emerald-100"}`}
          >
            <CheckCircle2
              className={`w-10 h-10 ${dm ? "text-[#00FF88]" : "text-emerald-600"}`}
            />
          </motion.div>
          <h1
            className={`text-2xl md:text-3xl font-black tracking-tight ${dm ? "text-gray-100" : "text-gray-900"}`}
          >
            Free Trial Booked!
          </h1>
          <p
            className={`text-sm mt-2 ${dm ? "text-gray-500" : "text-gray-500"}`}
          >
            Your trial session has been confirmed
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className={`rounded-2xl border overflow-hidden ${dm ? "bg-[#141414] border-white/[0.06]" : "bg-white border-gray-100"}`}
        >
          <div
            className={`h-1.5 w-full ${dm ? "bg-gradient-to-r from-[#00FF88] via-[#00FF88]/60 to-transparent" : "bg-gradient-to-r from-emerald-500 via-emerald-400 to-transparent"}`}
          />

          <div className="p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div
                className={`p-2.5 rounded-xl ${dm ? "bg-[#00FF88]/10" : "bg-emerald-50"}`}
              >
                <CalendarCheck
                  className={`w-5 h-5 ${dm ? "text-[#00FF88]" : "text-emerald-600"}`}
                />
              </div>
              <div>
                <p
                  className={`text-xs font-medium uppercase tracking-wider ${dm ? "text-gray-500" : "text-gray-400"}`}
                >
                  Academy
                </p>
                <p
                  className={`text-lg font-bold ${dm ? "text-gray-100" : "text-gray-900"}`}
                >
                  {academy?.name}
                </p>
              </div>
            </div>

            <div className={`h-px ${dm ? "bg-white/[0.06]" : "bg-gray-100"}`} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-lg ${dm ? "bg-white/[0.04]" : "bg-gray-50"}`}
                >
                  <CalendarCheck
                    className={`w-4 h-4 ${dm ? "text-gray-400" : "text-gray-500"}`}
                  />
                </div>
                <div>
                  <p
                    className={`text-xs font-medium ${dm ? "text-gray-500" : "text-gray-400"}`}
                  >
                    Date
                  </p>
                  <p
                    className={`text-sm font-semibold ${dm ? "text-gray-200" : "text-gray-800"}`}
                  >
                    {formattedDate}
                  </p>
                </div>
              </div>

              {session?.date && (
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-lg ${dm ? "bg-white/[0.04]" : "bg-gray-50"}`}
                  >
                    <Clock
                      className={`w-4 h-4 ${dm ? "text-gray-400" : "text-gray-500"}`}
                    />
                  </div>
                  <div>
                    <p
                      className={`text-xs font-medium ${dm ? "text-gray-500" : "text-gray-400"}`}
                    >
                      Session Time
                    </p>
                    <p
                      className={`text-sm font-semibold ${dm ? "text-gray-200" : "text-gray-800"}`}
                    >
                      {new Date(session.date).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              )}

              {academy?.city && (
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-lg ${dm ? "bg-white/[0.04]" : "bg-gray-50"}`}
                  >
                    <MapPin
                      className={`w-4 h-4 ${dm ? "text-gray-400" : "text-gray-500"}`}
                    />
                  </div>
                  <div>
                    <p
                      className={`text-xs font-medium ${dm ? "text-gray-500" : "text-gray-400"}`}
                    >
                      Location
                    </p>
                    <p
                      className={`text-sm font-semibold ${dm ? "text-gray-200" : "text-gray-800"}`}
                    >
                      {academy.city}
                      {academy.state ? `, ${academy.state}` : ""}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`rounded-2xl border mt-5 p-6 ${dm ? "bg-[#141414] border-white/[0.06]" : "bg-white border-gray-100"}`}
        >
          <div className="flex items-center gap-2 mb-4">
            <Info
              className={`w-4 h-4 ${dm ? "text-[#00FF88]" : "text-emerald-600"}`}
            />
            <h3
              className={`text-sm font-bold ${dm ? "text-gray-200" : "text-gray-800"}`}
            >
              Before You Arrive
            </h3>
          </div>
          <ul className="space-y-3">
            {INSTRUCTIONS.map((inst, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <CheckCircle2
                  className={`w-4 h-4 flex-shrink-0 mt-0.5 ${dm ? "text-[#00FF88]/60" : "text-emerald-400"}`}
                />
                <span
                  className={`text-sm ${dm ? "text-gray-400" : "text-gray-600"}`}
                >
                  {inst}
                </span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Cancel / Reschedule buttons */}
        {isBooked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
            className={`flex flex-row gap-2 sm:gap-3 mt-3 pt-3 border-t ${dm ? "border-white/[0.06]" : "border-gray-100"}`}
          >
            {canReschedule && (
              <button
                onClick={() => setShowRescheduleModal(true)}
                className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 px-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${dm
                  ? "bg-white/[0.06] text-amber-300 hover:bg-amber-500/10"
                  : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                  }`}
              >
                <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span className="truncate">Reschedule</span>
              </button>
            )}
            <button
              onClick={() => setShowCancelModal(true)}
              className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 px-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${dm
                ? "bg-white/[0.06] text-red-400 hover:bg-red-500/10"
                : "bg-red-50 text-red-600 hover:bg-red-100"
                }`}
            >
              <XIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="truncate">Cancel Trial</span>
            </button>
          </motion.div>
        )}

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className={`flex flex-row gap-2 sm:gap-3 mt-3 pt-3 border-t ${dm ? "border-white/[0.06]" : "border-gray-100"}`}
        >
          <button
            onClick={() =>
              navigate(`/academy/details/${booking.academyId}`)
            }
            className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 px-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${dm
              ? "bg-white/[0.06] text-gray-300 hover:bg-white/[0.1]"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">Back</span>
          </button>
          <button
            onClick={() => navigate("/academies")}
            className={`flex-1 flex items-center justify-center py-2.5 sm:py-3 px-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${dm
              ? "bg-[#00FF88] text-[#0a0a0a] hover:bg-[#00FF88]/90"
              : "bg-emerald-600 text-white hover:bg-emerald-700"
              }`}
          >
            <span className="truncate">Browse Academies</span>
          </button>
        </motion.div>
      </div>

      {/* Cancel confirmation modal */}
      <AnimatePresence>
        {showCancelModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
          >
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => {
                if (!isCancelling) {
                  setShowCancelModal(false);
                  setCancelError(null);
                }
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className={`relative w-full max-w-sm rounded-2xl border p-6 shadow-xl ${dm
                ? "bg-[#141414] border-white/[0.06]"
                : "bg-white border-gray-100"
                }`}
            >
              <div className="flex flex-col items-center text-center">
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${dm ? "bg-red-500/10" : "bg-red-50"
                    }`}
                >
                  <AlertTriangle
                    className={`w-7 h-7 ${dm ? "text-red-400" : "text-red-500"}`}
                  />
                </div>
                <h3
                  className={`text-lg font-bold mb-1 ${dm ? "text-gray-100" : "text-gray-900"}`}
                >
                  Cancel Trial?
                </h3>
                <p
                  className={`text-sm mb-5 ${dm ? "text-gray-500" : "text-gray-500"}`}
                >
                  Are you sure you want to cancel your free trial at{" "}
                  <span className="font-semibold">{academy?.name}</span>?
                  {!booking.hasRebooked
                    ? " You can rebook once after cancelling."
                    : " You have already used your rebook."}
                </p>

                {cancelError && (
                  <p className="text-xs text-red-400 mb-3">{cancelError}</p>
                )}

                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => {
                      setShowCancelModal(false);
                      setCancelError(null);
                    }}
                    disabled={isCancelling}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${dm
                      ? "bg-white/[0.06] text-gray-300 hover:bg-white/[0.1]"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                  >
                    Keep Trial
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={isCancelling}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${dm
                      ? "bg-red-500/15 text-red-400 hover:bg-red-500/25"
                      : "bg-red-50 text-red-600 hover:bg-red-100"
                      }`}
                  >
                    {isCancelling ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Yes, Cancel"
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reschedule confirmation modal */}
      <AnimatePresence>
        {showRescheduleModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
          >
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => {
                if (!isCancelling) {
                  setShowRescheduleModal(false);
                  setCancelError(null);
                }
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className={`relative w-full max-w-sm rounded-2xl border p-6 shadow-xl ${dm
                ? "bg-[#141414] border-white/[0.06]"
                : "bg-white border-gray-100"
                }`}
            >
              <div className="flex flex-col items-center text-center">
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${dm ? "bg-amber-500/10" : "bg-amber-50"
                    }`}
                >
                  <RefreshCw
                    className={`w-7 h-7 ${dm ? "text-amber-400" : "text-amber-500"}`}
                  />
                </div>
                <h3
                  className={`text-lg font-bold mb-1 ${dm ? "text-gray-100" : "text-gray-900"}`}
                >
                  Reschedule Trial?
                </h3>
                <p
                  className={`text-sm mb-5 ${dm ? "text-gray-500" : "text-gray-500"}`}
                >
                  This will cancel your current booking and take you back to
                  pick a new date. You can only reschedule once.
                </p>

                {cancelError && (
                  <p className="text-xs text-red-400 mb-3">{cancelError}</p>
                )}

                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => {
                      setShowRescheduleModal(false);
                      setCancelError(null);
                    }}
                    disabled={isCancelling}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${dm
                      ? "bg-white/[0.06] text-gray-300 hover:bg-white/[0.1]"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                  >
                    Keep Date
                  </button>
                  <button
                    onClick={handleReschedule}
                    disabled={isCancelling}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${dm
                      ? "bg-amber-500/15 text-amber-300 hover:bg-amber-500/25"
                      : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                      }`}
                  >
                    {isCancelling ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Reschedule"
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {isMobile && <BottomNav />}
    </div>
  );
}
