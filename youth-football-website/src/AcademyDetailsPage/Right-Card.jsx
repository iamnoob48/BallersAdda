import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Phone, Mail, Share2, Heart, ShieldCheck, Zap, X, Copy, Check, CalendarDays, ChevronLeft, ChevronRight, Loader2, Eye } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { useGetTrialAvailabilityQuery, useGetMyTrialsQuery, useBookTrialMutation } from "../redux/slices/academySlice";

const CYCLE_LABELS = {
  MONTH: "Monthly",
  YEAR: "Yearly",
  SESSION: "Per Session",
};

function formatPrice(priceCents, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(priceCents);
}

function isBatchEligible(batch, playerAge) {
  if (!batch.isActive) return false;
  if (playerAge == null) return true;
  const match = batch.ageGroup?.match(/U[-\s]?(\d+)/i);
  if (!match) return true;
  const maxAge = parseInt(match[1], 10);
  return playerAge <= maxAge;
}

const sectionVariants = {
  hidden: { opacity: 0, height: 0, marginTop: 0 },
  visible: {
    opacity: 1,
    height: "auto",
    marginTop: 16,
    transition: { duration: 0.35, ease: "easeOut" },
  },
  exit: { opacity: 0, height: 0, marginTop: 0, transition: { duration: 0.2 } },
};

const ShareMenu = ({ dm, academyName, onClose }) => {
  const menuRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const shareUrl = window.location.href;
  const shareText = `Check out ${academyName} on BallersAdda!`;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const platforms = [
    {
      name: "WhatsApp",
      color: "#25D366",
      href: `https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`,
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      ),
    },
    {
      name: "X",
      color: dm ? "#fff" : "#000",
      href: `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      name: "Facebook",
      color: "#1877F2",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    {
      name: "LinkedIn",
      color: "#0A66C2",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      ),
    },
  ];

  return (
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0, y: 8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className={`absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-64 rounded-2xl border shadow-xl p-4 z-50 ${dm
          ? "bg-[#1a1a1a] border-white/[0.08] shadow-black/40"
          : "bg-white border-gray-200 shadow-gray-200/60"
        }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className={`text-xs font-bold uppercase tracking-wider ${dm ? "text-gray-400" : "text-gray-500"}`}>
          Share via
        </span>
        <button onClick={onClose} className={`p-1 rounded-lg transition-colors ${dm ? "hover:bg-white/10 text-gray-500" : "hover:bg-gray-100 text-gray-400"}`}>
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-3">
        {platforms.map(({ name, color, href, icon }) => (
          <a
            key={name}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl transition-all hover:scale-105 ${dm ? "hover:bg-white/[0.06]" : "hover:bg-gray-50"
              }`}
            style={{ color }}
          >
            {icon}
            <span className={`text-[9px] font-medium ${dm ? "text-gray-500" : "text-gray-400"}`}>{name}</span>
          </a>
        ))}
      </div>

      <button
        onClick={copyLink}
        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all ${copied
            ? dm
              ? "bg-[#00FF88]/15 text-[#00FF88]"
              : "bg-emerald-50 text-emerald-600"
            : dm
              ? "bg-white/[0.06] text-gray-300 hover:bg-white/[0.1]"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
      >
        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        {copied ? "Link Copied!" : "Copy Link"}
      </button>
    </motion.div>
  );
};

// ── Mini calendar for trial date picking ──
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const PRISMA_DAYS = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

function TrialDatePicker({ dm, academyId, schedule, maxPerDay, bookedCounts, onSelect, selectedDate }) {
  const [viewMonth, setViewMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const activeDays = useMemo(() => {
    const set = new Set();
    (schedule || []).forEach((s) => set.add(s.dayOfWeek));
    return set;
  }, [schedule]);

  const daysInMonth = new Date(viewMonth.year, viewMonth.month + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewMonth.year, viewMonth.month, 1).getDay();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const cells = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const prevMonth = () => {
    setViewMonth((v) => v.month === 0 ? { year: v.year - 1, month: 11 } : { ...v, month: v.month - 1 });
  };
  const nextMonth = () => {
    setViewMonth((v) => v.month === 11 ? { year: v.year + 1, month: 0 } : { ...v, month: v.month + 1 });
  };

  const monthLabel = new Date(viewMonth.year, viewMonth.month).toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth} className={`p-1 rounded-lg ${dm ? "hover:bg-white/10 text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}>
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className={`text-xs font-bold ${dm ? "text-gray-300" : "text-gray-700"}`}>{monthLabel}</span>
        <button onClick={nextMonth} className={`p-1 rounded-lg ${dm ? "hover:bg-white/10 text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAY_NAMES.map((d) => (
          <div key={d} className={`text-center text-[9px] font-bold uppercase ${dm ? "text-gray-600" : "text-gray-400"}`}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} />;
          const date = new Date(viewMonth.year, viewMonth.month, day);
          const dateStr = `${viewMonth.year}-${String(viewMonth.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const dayOfWeek = PRISMA_DAYS[date.getDay()];
          const isScheduleDay = activeDays.has(dayOfWeek);
          const isPast = date <= today;
          const diffDays = Math.ceil((date - today) / (1000 * 60 * 60 * 24));
          const tooFar = diffDays > 30;
          const booked = bookedCounts?.[dateStr] || 0;
          const isFull = booked >= (maxPerDay || 3);
          const disabled = !isScheduleDay || isPast || tooFar || isFull;
          const isSelected = selectedDate === dateStr;

          return (
            <button
              key={dateStr}
              disabled={disabled}
              onClick={() => onSelect(dateStr)}
              className={`h-8 rounded-lg text-xs font-medium transition-all ${isSelected
                  ? dm ? "bg-[#00FF88] text-[#0a0a0a] font-bold" : "bg-emerald-600 text-white font-bold"
                  : disabled
                    ? dm ? "text-gray-700 cursor-not-allowed" : "text-gray-300 cursor-not-allowed"
                    : dm
                      ? "text-gray-300 hover:bg-[#00FF88]/15 hover:text-[#00FF88]"
                      : "text-gray-700 hover:bg-emerald-50 hover:text-emerald-700"
                }`}
            >
              {day}
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-3 mt-3">
        <div className="flex items-center gap-1.5">
          <div className={`w-2.5 h-2.5 rounded-full ${dm ? "bg-[#00FF88]" : "bg-emerald-500"}`} />
          <span className={`text-[9px] ${dm ? "text-gray-500" : "text-gray-400"}`}>Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className={`w-2.5 h-2.5 rounded-full ${dm ? "bg-gray-700" : "bg-gray-200"}`} />
          <span className={`text-[9px] ${dm ? "text-gray-500" : "text-gray-400"}`}>Unavailable</span>
        </div>
      </div>
    </div>
  );
}

const RightCard = ({ ACADEMY_DATA, triggerTrial }) => {
  const dm = useSelector((state) => state.theme.darkMode);
  const isLoading = useSelector((state) => state.player.loading);
  const playerAge = useSelector(
    (state) => state.player.profile?.age ?? null
  );
  const playerAcademyId = useSelector(
    (state) => state.player.profile?.academyId ?? null
  );
  const navigate = useNavigate();

  const alreadyMember = playerAcademyId !== null && playerAcademyId;

  // ── Trial state ──
  const academyId = ACADEMY_DATA?.academy?.id;
  const haveFreeTrial = ACADEMY_DATA?.academy?.haveFreeTrial;
  const [trialMode, setTrialMode] = useState(false);
  const [selectedTrialDate, setSelectedTrialDate] = useState(null);
  const [bookError, setBookError] = useState(null);

  const { data: trialAvailability } = useGetTrialAvailabilityQuery(
    { academyId, month: undefined },
    { skip: !academyId || !haveFreeTrial }
  );
  const { data: myTrialsData } = useGetMyTrialsQuery(undefined, { skip: !haveFreeTrial });
  const [bookTrial, { isLoading: isBooking }] = useBookTrialMutation();

  const existingTrial = myTrialsData?.trials?.find((t) => t.academyId === academyId);
  const trialUsed = existingTrial && ["ATTENDED", "CONVERTED", "NO_SHOW", "EXPIRED"].includes(existingTrial.status);
  const trialPending = existingTrial?.status === "BOOKED";
  const canTrial = haveFreeTrial && !alreadyMember && !trialUsed && !trialPending;

  useEffect(() => {
    if (triggerTrial && canTrial) setTrialMode(true);
  }, [triggerTrial]);

  const handleBookTrial = async () => {
    if (!selectedTrialDate || isBooking) return;
    setBookError(null);
    try {
      const result = await bookTrial({ academyId, date: selectedTrialDate }).unwrap();
      navigate(`/academy/trial-confirmed/${academyId}`, { state: result });
    } catch (err) {
      setBookError(err?.data?.message || "Failed to book trial");
    }
  };

  const [selectedService, setSelectedService] = useState("");
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [hoveredContact, setHoveredContact] = useState(null);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const activePlans = (ACADEMY_DATA.academy.pricing || []).filter(
    (p) => p.active
  );
  const eligibleBatches = (ACADEMY_DATA.academy.batches || []).filter((b) =>
    isBatchEligible(b, playerAge)
  );

  const completedSteps = [
    !!selectedService,
    !!selectedPlan,
    !!selectedBatch,
  ].filter(Boolean).length;
  const currentStep = !selectedService
    ? 0
    : !selectedPlan
      ? 1
      : !selectedBatch
        ? 2
        : 3;
  const allSelected = selectedService && selectedPlan && selectedBatch;

  const handleJoinAcademy = () => {
    if (!allSelected) return;
    navigate(`/academy/payment/${ACADEMY_DATA.academy.id}`, {
      state: {
        academy: {
          id: ACADEMY_DATA.academy.id,
          name: ACADEMY_DATA.academy.name,
        },
        plan: selectedPlan.title,
        planId: selectedPlan.id,
        price: selectedPlan.priceCents,
        batchId: selectedBatch,
      },
    });
  };

  const stepLabels = ["Service", "Plan", "Batch"];

  return (
    <motion.aside
      id="join-academy"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
      className="lg:col-span-4 space-y-6"
    >
      {/* Join Card */}
      <div
        className={`rounded-2xl overflow-hidden shadow-xl border sticky top-24 transition-colors duration-300 ${dm
          ? "bg-[#141414] shadow-black/30 border-white/[0.06]"
          : "bg-white shadow-gray-200/60 border-gray-100"
          }`}
      >
        {/* Card header accent */}
        <div
          className={`h-1.5 w-full ${dm
            ? "bg-gradient-to-r from-[#00FF88] via-[#00FF88]/60 to-transparent"
            : "bg-gradient-to-r from-emerald-500 via-emerald-400 to-transparent"
            }`}
        />

        <div className="p-6">
          {/* ── FREE TRIAL BANNER ── */}
          {canTrial && !trialMode && (
            <motion.button
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setTrialMode(true)}
              className={`w-full mb-5 p-4 rounded-2xl border-2 border-dashed flex items-center gap-3 text-left transition-all group ${dm
                  ? "border-[#00FF88]/30 bg-[#00FF88]/5 hover:bg-[#00FF88]/10 hover:border-[#00FF88]/50"
                  : "border-emerald-300 bg-emerald-50/50 hover:bg-emerald-50 hover:border-emerald-400"
                }`}
            >
              <div className={`p-2 rounded-xl ${dm ? "bg-[#00FF88]/15" : "bg-emerald-100"}`}>
                <CalendarDays className={`w-5 h-5 ${dm ? "text-[#00FF88]" : "text-emerald-600"}`} />
              </div>
              <div className="flex-1">
                <p className={`text-sm font-bold ${dm ? "text-[#00FF88]" : "text-emerald-700"}`}>Try a Free Session</p>
                <p className={`text-xs ${dm ? "text-gray-500" : "text-gray-500"}`}>Book one free trial before you commit</p>
              </div>
              <ChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${dm ? "text-[#00FF88]/60" : "text-emerald-400"}`} />
            </motion.button>
          )}

          {trialPending && !trialMode && (
            <div className={`mb-5 p-4 rounded-2xl border flex items-center gap-3 ${dm ? "border-amber-500/20 bg-amber-500/5" : "border-amber-200 bg-amber-50"
              }`}>
              <CalendarDays className={`w-5 h-5 flex-shrink-0 ${dm ? "text-amber-400" : "text-amber-600"}`} />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold ${dm ? "text-amber-300" : "text-amber-700"}`}>Trial Booked</p>
                <p className={`text-xs ${dm ? "text-gray-500" : "text-gray-500"}`}>
                  {new Date(existingTrial.scheduledDate).toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" })}
                </p>
              </div>
              <button
                onClick={() =>
                  navigate(`/academy/trial-confirmed/${academyId}`, {
                    state: {
                      booking: {
                        id: existingTrial.id,
                        academyId: existingTrial.academyId,
                        scheduledDate: existingTrial.scheduledDate,
                        dayOfWeek: existingTrial.dayOfWeek,
                        status: existingTrial.status,
                        hasRebooked: existingTrial.hasRebooked,
                        bookedAt: existingTrial.bookedAt,
                      },
                      academy: {
                        name: ACADEMY_DATA?.academy?.name,
                        city: ACADEMY_DATA?.academy?.city,
                        state: ACADEMY_DATA?.academy?.state,
                        academyLogoURL: ACADEMY_DATA?.academy?.academyLogoURL,
                      },
                    },
                  })
                }
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex-shrink-0 ${dm
                    ? "bg-amber-500/15 text-amber-300 hover:bg-amber-500/25"
                    : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                  }`}
              >
                <Eye className="w-3.5 h-3.5" />
                See Details
              </button>
            </div>
          )}

          {/* ── TRIAL MODE: DATE PICKER ── */}
          <AnimatePresence>
            {trialMode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <CalendarDays className={`w-5 h-5 ${dm ? "text-[#00FF88]" : "text-emerald-600"}`} />
                      <h3 className={`text-lg font-bold ${dm ? "text-gray-100" : "text-gray-900"}`}>Pick a Date</h3>
                    </div>
                    <button
                      onClick={() => { setTrialMode(false); setSelectedTrialDate(null); setBookError(null); }}
                      className={`p-1.5 rounded-lg ${dm ? "hover:bg-white/10 text-gray-500" : "hover:bg-gray-100 text-gray-400"}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <TrialDatePicker
                    dm={dm}
                    academyId={academyId}
                    schedule={trialAvailability?.schedule}
                    maxPerDay={trialAvailability?.maxPerDay}
                    bookedCounts={trialAvailability?.bookedCounts}
                    selectedDate={selectedTrialDate}
                    onSelect={setSelectedTrialDate}
                  />

                  {bookError && (
                    <p className="text-xs text-red-400 mt-3">{bookError}</p>
                  )}

                  <motion.button
                    whileHover={selectedTrialDate ? { scale: 1.02 } : {}}
                    whileTap={selectedTrialDate ? { scale: 0.98 } : {}}
                    onClick={handleBookTrial}
                    disabled={!selectedTrialDate || isBooking}
                    className={`w-full font-bold py-3.5 rounded-xl mt-4 flex items-center justify-center gap-2 text-sm transition-all ${selectedTrialDate
                        ? dm
                          ? "bg-[#00FF88] text-[#0a0a0a] hover:bg-[#00FF88]/90 cursor-pointer"
                          : "bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                        : dm
                          ? "bg-[#00FF88]/20 text-[#0a0a0a]/40 cursor-not-allowed"
                          : "bg-emerald-200 text-white cursor-not-allowed"
                      }`}
                  >
                    {isBooking ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <CalendarDays className="w-4 h-4" />
                        Book Free Trial
                      </>
                    )}
                  </motion.button>

                  <p className={`text-[10px] text-center mt-2 ${dm ? "text-gray-600" : "text-gray-400"}`}>
                    No payment required. One trial per academy.
                  </p>

                  <div className={`h-px w-full my-5 ${dm ? "bg-white/[0.06]" : "bg-gray-100"}`} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-xl ${dm ? "bg-[#00FF88]/10" : "bg-emerald-50"
                  }`}
              >
                <Zap
                  className={`w-5 h-5 ${dm ? "text-[#00FF88]" : "text-emerald-600"
                    }`}
                />
              </div>
              <div>
                <h3
                  className={`text-xl font-bold ${dm ? "text-gray-100" : "text-gray-900"
                    }`}
                >
                  Join Academy
                </h3>
                <p
                  className={`text-xs ${dm ? "text-gray-500" : "text-gray-400"
                    }`}
                >
                  Enrollment open
                </p>
              </div>
            </div>
            <span className="flex h-3 w-3 relative">
              <span
                className={`animate-ping absolute inline-flex h-3 w-3 rounded-full opacity-75 ${dm ? "bg-[#00FF88]" : "bg-emerald-400"
                  }`}
              ></span>
              <span
                className={`relative inline-flex rounded-full h-3 w-3 ${dm ? "bg-[#00FF88]" : "bg-emerald-500"
                  }`}
              ></span>
            </span>
          </div>

          {/* Already a member */}
          {alreadyMember ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-2xl p-6 flex flex-col items-center gap-3 text-center border ${dm
                ? "bg-[#00FF88]/5 border-[#00FF88]/20"
                : "bg-emerald-50 border-emerald-200"
                }`}
            >
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center ${dm ? "bg-[#00FF88]/15" : "bg-emerald-100"
                  }`}
              >
                <svg
                  className={`w-7 h-7 ${dm ? "text-[#00FF88]" : "text-emerald-600"
                    }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p
                  className={`text-sm font-bold ${dm ? "text-gray-100" : "text-gray-800"
                    }`}
                >
                  You&apos;re already part of an academy
                </p>
                <p
                  className={`text-xs mt-1 ${dm ? "text-gray-500" : "text-gray-500"
                    }`}
                >
                  Visit your dashboard to manage your membership.
                </p>
              </div>
            </motion.div>
          ) : (
            <>
              {/* Step Indicator */}
              <div className="flex items-center justify-between mb-6">
                {[1, 2, 3].map((step) => {
                  const stepIndex = step - 1;
                  const isCompleted = stepIndex < completedSteps;
                  const isCurrent = stepIndex === currentStep;
                  return (
                    <div
                      key={step}
                      className="flex items-center gap-2 flex-1"
                    >
                      <div className="flex flex-col items-center gap-1.5">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all duration-300 ${isCompleted
                            ? dm
                              ? "bg-[#00FF88] text-[#0a0a0a]"
                              : "bg-emerald-600 text-white"
                            : isCurrent
                              ? dm
                                ? "bg-[#00FF88]/15 text-[#00FF88] ring-2 ring-[#00FF88]/40"
                                : "bg-emerald-50 text-emerald-700 ring-2 ring-emerald-400"
                              : dm
                                ? "bg-white/[0.04] text-gray-600 border border-white/[0.08]"
                                : "bg-gray-50 text-gray-400 border border-gray-200"
                            }`}
                        >
                          {isCompleted ? (
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={3}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          ) : (
                            step
                          )}
                        </div>
                        <span
                          className={`text-[10px] font-medium ${isCompleted || isCurrent
                            ? dm
                              ? "text-[#00FF88]"
                              : "text-emerald-600"
                            : dm
                              ? "text-gray-600"
                              : "text-gray-400"
                            }`}
                        >
                          {stepLabels[stepIndex]}
                        </span>
                      </div>
                      {step < 3 && (
                        <div
                          className={`flex-1 h-px mx-1 mt-[-18px] transition-colors duration-300 ${stepIndex < completedSteps
                            ? dm
                              ? "bg-[#00FF88]/40"
                              : "bg-emerald-400"
                            : dm
                              ? "bg-white/[0.06]"
                              : "bg-gray-200"
                            }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="space-y-0">
                {/* Step 1 -- Service Selection */}
                <div>
                  <label
                    className={`text-xs font-bold uppercase tracking-wider mb-2 block ${dm ? "text-gray-500" : "text-gray-500"
                      }`}
                  >
                    Select Service
                  </label>
                  <select
                    value={selectedService}
                    onChange={(e) => {
                      setSelectedService(e.target.value);
                      setSelectedPlan(null);
                      setSelectedBatch("");
                    }}
                    className={`w-full border text-sm rounded-xl block p-3.5 outline-none transition-all ${dm
                      ? "bg-[#0a0a0a] border-white/[0.08] text-gray-300 focus:ring-2 focus:ring-[#00FF88]/20 focus:border-[#00FF88]/40"
                      : "bg-gray-50 border-gray-200 text-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                      }`}
                  >
                    <option value="" disabled>
                      Choose a service...
                    </option>
                    {ACADEMY_DATA.academy.services.map((service, idx) => (
                      <option
                        key={idx}
                        value={service}
                        className={dm ? "text-white" : "text-gray-900"}
                      >
                        {service}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Step 2 -- Membership Plan */}
                <div
                  className={`transition-all duration-300 ${!selectedService ? "opacity-40 pointer-events-none" : ""
                    }`}
                >
                  <AnimatePresence>
                    {selectedService && (
                      <motion.div
                        variants={sectionVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                      >
                        <label
                          className={`text-xs font-bold uppercase tracking-wider mb-2 block ${dm ? "text-gray-500" : "text-gray-500"
                            }`}
                        >
                          Choose Plan
                        </label>
                        <div
                          className="space-y-2.5"
                          role="radiogroup"
                          aria-label="Membership plans"
                        >
                          {activePlans.length > 0 ? (
                            activePlans.map((plan) => {
                              const isSelected =
                                selectedPlan?.id === plan.id;
                              return (
                                <label
                                  key={plan.id}
                                  className={`relative flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${isSelected
                                    ? dm
                                      ? "border-[#00FF88]/50 ring-2 ring-[#00FF88]/30 bg-[#00FF88]/5"
                                      : "border-emerald-400 ring-2 ring-emerald-500/30 bg-emerald-50/50"
                                    : dm
                                      ? "border-white/[0.06] bg-[#0a0a0a] hover:border-white/[0.12]"
                                      : "border-gray-200 bg-gray-50 hover:border-gray-300"
                                    }`}
                                >
                                  <input
                                    type="radio"
                                    name="plan"
                                    className="sr-only"
                                    checked={isSelected}
                                    onChange={() => {
                                      setSelectedPlan(plan);
                                      setSelectedBatch("");
                                    }}
                                  />

                                  {/* Radio dot */}
                                  <div
                                    className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${isSelected
                                      ? dm
                                        ? "border-[#00FF88]"
                                        : "border-emerald-500"
                                      : dm
                                        ? "border-gray-600"
                                        : "border-gray-300"
                                      }`}
                                  >
                                    {isSelected && (
                                      <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className={`w-2 h-2 rounded-full ${dm
                                          ? "bg-[#00FF88]"
                                          : "bg-emerald-500"
                                          }`}
                                      />
                                    )}
                                  </div>

                                  {/* Plan info */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span
                                        className={`text-sm font-semibold ${dm
                                          ? "text-gray-200"
                                          : "text-gray-800"
                                          }`}
                                      >
                                        {plan.title}
                                      </span>
                                      {plan.recommended && (
                                        <span
                                          className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${dm
                                            ? "bg-[#00FF88]/15 text-[#00FF88]"
                                            : "bg-emerald-100 text-emerald-700"
                                            }`}
                                        >
                                          Best
                                        </span>
                                      )}
                                    </div>
                                    <span
                                      className={`text-xs ${dm ? "text-gray-500" : "text-gray-400"
                                        }`}
                                    >
                                      {CYCLE_LABELS[plan.billingCycle] ||
                                        plan.billingCycle}
                                    </span>
                                  </div>

                                  {/* Price */}
                                  <span
                                    className={`text-sm font-bold flex-shrink-0 ${isSelected
                                      ? dm
                                        ? "text-[#00FF88]"
                                        : "text-emerald-600"
                                      : dm
                                        ? "text-gray-300"
                                        : "text-gray-700"
                                      }`}
                                  >
                                    {formatPrice(
                                      plan.priceCents,
                                      plan.currency || "INR"
                                    )}
                                  </span>
                                </label>
                              );
                            })
                          ) : (
                            <p
                              className={`text-sm text-center py-3 ${dm ? "text-gray-500" : "text-gray-400"
                                }`}
                            >
                              No active plans available
                            </p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Step 3 -- Batch / Squad */}
                <div
                  className={`transition-all duration-300 ${!selectedPlan ? "opacity-40 pointer-events-none" : ""
                    }`}
                >
                  <AnimatePresence>
                    {selectedPlan && (
                      <motion.div
                        variants={sectionVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                      >
                        <label
                          className={`text-xs font-bold uppercase tracking-wider mb-2 block ${dm ? "text-gray-500" : "text-gray-500"
                            }`}
                        >
                          Select Batch
                        </label>
                        {eligibleBatches.length > 0 ? (
                          <select
                            value={selectedBatch}
                            onChange={(e) =>
                              setSelectedBatch(e.target.value)
                            }
                            className={`w-full border text-sm rounded-xl block p-3.5 outline-none transition-all ${dm
                              ? "bg-[#0a0a0a] border-white/[0.08] text-gray-300 focus:ring-2 focus:ring-[#00FF88]/20 focus:border-[#00FF88]/40"
                              : "bg-gray-50 border-gray-200 text-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                              }`}
                          >
                            <option value="" disabled>
                              Choose a batch...
                            </option>
                            {eligibleBatches.map((batch) => {
                              const spotsLeft =
                                batch.capacity -
                                (batch._count?.players || 0);
                              const isFull = spotsLeft <= 0;
                              return (
                                <option
                                  key={batch.id}
                                  value={batch.id}
                                  disabled={isFull}
                                  className={
                                    isFull
                                      ? "italic text-gray-400"
                                      : dm
                                        ? "text-white"
                                        : "text-gray-900"
                                  }
                                >
                                  {batch.name}
                                  {batch.ageGroup
                                    ? ` · ${batch.ageGroup}`
                                    : ""}
                                  {" — "}
                                  {isFull
                                    ? "WAITLIST FULL"
                                    : `${spotsLeft} spots left`}
                                </option>
                              );
                            })}
                          </select>
                        ) : (
                          <p
                            className={`text-sm py-3 px-3 rounded-xl text-center ${dm
                              ? "text-gray-500 bg-[#0a0a0a]"
                              : "text-gray-400 bg-gray-50"
                              }`}
                          >
                            No batches match your age group
                          </p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* CTA */}
                <motion.button
                  whileHover={allSelected ? { scale: 1.02, y: -1 } : {}}
                  whileTap={allSelected ? { scale: 0.98 } : {}}
                  onClick={handleJoinAcademy}
                  disabled={!allSelected}
                  className={`w-full font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mt-5 text-base ${allSelected
                    ? dm
                      ? "bg-[#00FF88] text-[#0a0a0a] hover:bg-[#00FF88]/90 shadow-[#00FF88]/15 cursor-pointer"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200 cursor-pointer"
                    : dm
                      ? "bg-[#00FF88]/20 text-[#0a0a0a]/40 cursor-not-allowed shadow-none"
                      : "bg-emerald-200 text-white cursor-not-allowed shadow-none"
                    }`}
                >
                  <ShieldCheck className="w-5 h-5" />
                  Join This Academy
                </motion.button>

                {/* Trust signals */}
                <p
                  className={`text-[10px] text-center mt-3 ${dm ? "text-gray-600" : "text-gray-400"
                    }`}
                >
                  Secure enrollment. Cancel anytime.
                </p>

                {/* Contact Row */}
                <div
                  className={`pt-5 border-t flex justify-center gap-5 mt-5 ${dm ? "border-white/[0.06]" : "border-gray-100"
                    }`}
                >
                  {/* Call */}
                  <div className="relative">
                    <a
                      href={ACADEMY_DATA.academy.contactPhone ? `tel:${ACADEMY_DATA.academy.contactPhone}` : undefined}
                      onMouseEnter={() => setHoveredContact("call")}
                      onMouseLeave={() => setHoveredContact(null)}
                      className={`flex flex-col items-center gap-1.5 transition-colors ${dm ? "text-gray-500 hover:text-[#00FF88]" : "text-gray-400 hover:text-emerald-600"}`}
                    >
                      <div className={`p-2.5 rounded-xl transition-colors ${dm ? "bg-white/[0.04] hover:bg-white/[0.08]" : "bg-gray-50 hover:bg-gray-100"}`}>
                        <Phone className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-medium">Call</span>
                    </a>
                    <AnimatePresence>
                      {hoveredContact === "call" && ACADEMY_DATA.academy.contactPhone && (
                        <motion.div
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 4 }}
                          className={`absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap z-50 ${dm ? "bg-[#1a1a1a] text-gray-300 border border-white/[0.08]" : "bg-gray-800 text-white"}`}
                        >
                          {ACADEMY_DATA.academy.contactPhone}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Email */}
                  <div className="relative">
                    <a
                      href={ACADEMY_DATA.academy.contactEmail ? `mailto:${ACADEMY_DATA.academy.contactEmail}` : undefined}
                      onMouseEnter={() => setHoveredContact("email")}
                      onMouseLeave={() => setHoveredContact(null)}
                      className={`flex flex-col items-center gap-1.5 transition-colors ${dm ? "text-gray-500 hover:text-[#00DCFF]" : "text-gray-400 hover:text-emerald-600"}`}
                    >
                      <div className={`p-2.5 rounded-xl transition-colors ${dm ? "bg-white/[0.04] hover:bg-white/[0.08]" : "bg-gray-50 hover:bg-gray-100"}`}>
                        <Mail className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-medium">Email</span>
                    </a>
                    <AnimatePresence>
                      {hoveredContact === "email" && ACADEMY_DATA.academy.contactEmail && (
                        <motion.div
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 4 }}
                          className={`absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap z-50 ${dm ? "bg-[#1a1a1a] text-gray-300 border border-white/[0.08]" : "bg-gray-800 text-white"}`}
                        >
                          {ACADEMY_DATA.academy.contactEmail}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Share */}
                  <div className="relative">
                    <button
                      onClick={() => setShowShareMenu((prev) => !prev)}
                      className={`flex flex-col items-center gap-1.5 transition-colors ${dm ? "text-gray-500 hover:text-[#00FF88]" : "text-gray-400 hover:text-emerald-600"}`}
                    >
                      <div className={`p-2.5 rounded-xl transition-colors ${dm ? "bg-white/[0.04] hover:bg-white/[0.08]" : "bg-gray-50 hover:bg-gray-100"}`}>
                        <Share2 className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-medium">Share</span>
                    </button>
                    <AnimatePresence>
                      {showShareMenu && (
                        <ShareMenu
                          dm={dm}
                          academyName={ACADEMY_DATA.academy.name}
                          onClose={() => setShowShareMenu(false)}
                        />
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Save */}
                  <button
                    className={`flex flex-col items-center gap-1.5 transition-colors ${dm ? "text-gray-500" : "text-gray-400"} hover:text-red-500`}
                  >
                    <div className={`p-2.5 rounded-xl transition-colors ${dm ? "bg-white/[0.04] hover:bg-white/[0.08]" : "bg-gray-50 hover:bg-gray-100"}`}>
                      <Heart className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-medium">Save</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.aside>
  );
};

export default RightCard;
