import { useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FiArrowRight, FiArrowLeft, FiCamera, FiUser, FiCheck } from "react-icons/fi";
import api from "../api/axios.js";
import { setPlayerProfileComplete, updateCredentials } from "../redux/slices/authSlice.js";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTH_FULL  = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

// ── Constants (values = Prisma enum) ─────────────────────────────────────
const POSITIONS = [
  { label: "Goalkeeper", value: "GOALKEEPER", abbr: "GK", zone: "keeper" },
  { label: "Centre Back", value: "CENTREBACK", abbr: "CB", zone: "def" },
  { label: "Full Back", value: "FULLBACK", abbr: "FB", zone: "def" },
  { label: "Defender", value: "DEFENDER", abbr: "DEF", zone: "def" },
  { label: "Def. Mid", value: "DEFENSIVE_MIDFIELDER", abbr: "DM", zone: "mid" },
  { label: "Midfielder", value: "MIDFIELDER", abbr: "MID", zone: "mid" },
  { label: "Central Mid", value: "CENTRAL_MIDFIELDER", abbr: "CM", zone: "mid" },
  { label: "Att. Mid", value: "ATTACKING_MIDFIELDER", abbr: "AM", zone: "mid" },
  { label: "Winger", value: "WINGER", abbr: "WG", zone: "att" },
  { label: "Forward", value: "FORWARD", abbr: "FWD", zone: "att" },
  { label: "Striker", value: "STRIKER", abbr: "ST", zone: "att" },
];

const ZONE_DARK = { keeper: "border-amber-500/60 bg-amber-500/10 text-amber-400", def: "border-blue-500/60 bg-blue-500/10 text-blue-400", mid: "border-purple-500/60 bg-purple-500/10 text-purple-400", att: "border-rose-500/60 bg-rose-500/10 text-rose-400" };
const ZONE_LIGHT = { keeper: "border-amber-500 bg-amber-50 text-amber-700", def: "border-blue-500 bg-blue-50 text-blue-700", mid: "border-purple-500 bg-purple-50 text-purple-700", att: "border-rose-500 bg-rose-50 text-rose-700" };

// Male (Mars Symbol)
const MaleIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-blue-500 ${className || ''}`}>
    <circle cx="10" cy="14" r="5" />
    <line x1="13.5" y1="10.5" x2="21" y2="3" />
    <polyline points="16 3 21 3 21 8" />
  </svg>
);

// Female (Venus Symbol)
const FemaleIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-pink-500 ${className || ''}`}>
    <circle cx="12" cy="9" r="5" />
    <line x1="12" y1="14" x2="12" y2="22" />
    <line x1="9" y1="19" x2="15" y2="19" />
  </svg>
);

// Others (Inclusive / Unified Symbol)
const OtherIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-gray-500 ${className || ''}`}>
    <circle cx="12" cy="12" r="4" />
    <line x1="15" y1="9" x2="20" y2="4" />
    <polyline points="16 4 20 4 20 8" />
    <line x1="12" y1="16" x2="12" y2="21" />
    <line x1="9" y1="19" x2="15" y2="19" />
  </svg>
);

// Football Cleat / Boot SVG — faces right by default, flip for left
const CleatSVG = ({ flip, className }) => (
  <svg viewBox="0 0 64 48" fill="none" className={className} style={{ transform: flip ? 'scaleX(-1)' : 'none' }}>
    {/* Boot body */}
    <path
      d="M12 12 C12 8, 16 4, 22 4 L40 4 C44 4, 48 6, 50 10 L56 22 C58 26, 58 30, 54 34 L18 38 C12 38, 8 34, 8 28 L8 20 C8 16, 10 14, 12 12Z"
      fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"
    />
    {/* Toe cap */}
    <path
      d="M50 10 L56 22 C58 26, 56 30, 54 34 L46 34 C44 30, 46 26, 48 22 L50 10Z"
      fill="currentColor" opacity="0.25" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"
    />
    {/* Ankle collar */}
    <path d="M14 12 C14 8, 18 5, 24 5 L34 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
    {/* Lace detail */}
    <line x1="28" y1="8" x2="28" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="24" y1="10" x2="32" y2="10" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    <line x1="25" y1="14" x2="31" y2="14" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    {/* Sole / plate */}
    <path d="M16 36 L52 34" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    {/* Studs */}
    <circle cx="20" cy="42" r="2" fill="currentColor" />
    <circle cx="30" cy="42" r="2" fill="currentColor" />
    <circle cx="40" cy="41" r="2" fill="currentColor" />
    <circle cx="50" cy="40" r="2" fill="currentColor" />
  </svg>
);

const FieldIcon = ({ zone, className }) => {
  let cx, cy;
  if (zone === 'keeper') { cx = 50; cy = 90; }
  else if (zone === 'def') { cx = 50; cy = 75; }
  else if (zone === 'mid') { cx = 50; cy = 50; }
  else if (zone === 'att') { cx = 50; cy = 25; }

  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="4" className={className}>
      <rect x="15" y="5" width="70" height="90" rx="4" />
      <line x1="15" y1="50" x2="85" y2="50" />
      <circle cx="50" cy="50" r="10" />
      <rect x="35" y="5" width="30" height="15" />
      <rect x="35" y="80" width="30" height="15" />
      <circle cx={cx} cy={cy} r="7" fill="currentColor" stroke="none" />
    </svg>
  );
};
const GENDERS = [
  { label: "Male", value: "MALE", icon: MaleIcon },
  { label: "Female", value: "FEMALE", icon: FemaleIcon },
  { label: "Other", value: "OTHER", icon: OtherIcon },
];

const FEET = [
  { label: "Right", value: "RIGHT" },
  { label: "Left", value: "LEFT" },
  { label: "Both", value: "BOTH" },
];

const TOTAL_STEPS = 6;
const STEPS = [
  { title: "What's your name?", subtitle: "Your identity on the platform." },
  { title: "About you", subtitle: "Help the community know you better." },
  { title: "Your physique", subtitle: "Help coaches find the right fit." },
  { title: "Play style", subtitle: "Where do you shine on the pitch?" },
  { title: "Your story", subtitle: "Tell us what makes you special." },
  { title: "Profile photo", subtitle: "Put a face to the name." },
];

const variants = {
  enter: (d) => ({ x: d > 0 ? 64 : -64, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.28, ease: "easeOut" } },
  exit: (d) => ({ x: d > 0 ? -64 : 64, opacity: 0, transition: { duration: 0.18, ease: "easeIn" } }),
};

// ── DOB bounds ────────────────────────────────────────────────────────────
const _now = new Date();
const MAX_DOB = new Date(_now.getFullYear() - 3, _now.getMonth(), _now.getDate()).toISOString().split("T")[0];
const MIN_DOB = new Date(_now.getFullYear() - 100, _now.getMonth(), _now.getDate()).toISOString().split("T")[0];

export default function CompleteProfilePage() {
  const dm = useSelector((s) => s.theme.darkMode);
  const { user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [step, setStep] = useState(1);
  const [dir, setDir] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.profilePic || "");

  // DOB picker state: year → month → day flow
  const [dobYear, setDobYear] = useState(null);
  const [dobMonth, setDobMonth] = useState(null);
  const [dobDay, setDobDay] = useState(null);

  const maxDobDate = new Date(MAX_DOB);
  const minDobDate = new Date(MIN_DOB);

  const dobYears = useMemo(() => {
    const years = [];
    for (let y = maxDobDate.getFullYear(); y >= minDobDate.getFullYear(); y--) years.push(y);
    return years;
  }, []);

  const dobMonths = useMemo(() => {
    if (dobYear === null) return [];
    return MONTH_NAMES.map((m, i) => i);
  }, [dobYear]);

  const dobDays = useMemo(() => {
    if (dobYear === null || dobMonth === null) return [];
    const count = daysInMonth(dobYear, dobMonth);
    const days = [];
    for (let d = 1; d <= count; d++) days.push(d);
    return days;
  }, [dobYear, dobMonth]);

  // Sync DOB parts into form.dateOfBirth
  const setDobPart = (part, value) => {
    let y = dobYear, m = dobMonth, d = dobDay;
    if (part === 'year') { y = value; setDobYear(value); setDobMonth(null); setDobDay(null); }
    if (part === 'month') { m = value; setDobMonth(value); setDobDay(null); }
    if (part === 'day') {
      d = value; setDobDay(value);
      // All three selected — write the ISO string
      const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(value).padStart(2, '0')}`;
      setForm(p => ({ ...p, dateOfBirth: dateStr }));
    }
    setError("");
  };

  const [form, setForm] = useState({
    firstName: "", lastName: "", displayName: "",
    gender: "", dateOfBirth: "",
    height: "", weight: "",
    position: "", dominantFoot: "",
    bio: "",
  });

  const set = (field, value) => { setForm((p) => ({ ...p, [field]: value })); setError(""); };

  const next = () => {
    if (step === 1 && (!form.firstName.trim() || !form.lastName.trim())) {
      setError("First and last name required.");
      return;
    }
    setDir(1);
    setStep((s) => s + 1);
  };

  const prev = () => { setError(""); setDir(-1); setStep((s) => s - 1); };

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const submit = async (skipAvatar = false) => {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError("First and last name required.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      if (!skipAvatar && avatarFile && avatarPreview) {
        const picRes = await api.post("/player/uploadProfilePic", { image: avatarPreview });
        dispatch(updateCredentials({ profilePic: picRes.data.profilePic }));
      }
      await api.post("/player/createPlayerProfile", {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        displayName: form.displayName.trim() || null,
        gender: form.gender || null,
        dateOfBirth: form.dateOfBirth || null,
        height: form.height ? parseFloat(form.height) : null,
        weight: form.weight ? parseFloat(form.weight) : null,
        position: form.position || null,
        dominantFoot: form.dominantFoot || null,
        bio: form.bio.trim() || null,
      });
      dispatch(setPlayerProfileComplete());
      navigate("/home");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Theme helpers ─────────────────────────────────────────────────────
  const bg = dm ? "bg-[#0e0e0e]" : "bg-gray-50";
  const cardCls = dm ? "bg-[#1a1a1a] border-[#87A98D]/15 shadow-black/30" : "bg-white border-gray-200 shadow-gray-100";
  const inputCls = dm
    ? "w-full px-4 py-3 rounded-xl bg-[#111] border border-[#87A98D]/20 text-gray-200 placeholder:text-gray-600 focus:ring-2 focus:ring-[#00FF88]/25 focus:border-[#00FF88]/50 focus:outline-none transition-colors"
    : "w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-green-500/25 focus:border-green-500 focus:outline-none transition-colors";
  const labelCls = dm ? "block text-sm font-medium text-gray-400 mb-1.5" : "block text-sm font-medium text-gray-600 mb-1.5";
  const optTag = dm ? "text-xs font-normal text-gray-600" : "text-xs font-normal text-gray-400";

  const selCard = (selected) => selected
    ? dm ? "border-[#00FF88] bg-[#00FF88]/10 text-[#00FF88]"
      : "border-green-500 bg-green-50 text-green-700"
    : dm ? "border-[#87A98D]/20 bg-[#111] text-gray-400 hover:border-[#00FF88]/40"
      : "border-gray-200 bg-white text-gray-600 hover:border-green-300";

  const accentBtn = dm
    ? "bg-[#00FF88] text-[#121212] hover:bg-[#00FF88]/90"
    : "bg-green-600 text-white hover:bg-green-700";

  return (
    <div className={`min-h-screen flex flex-col ${bg}`}>

      {/* ── Minimal Navbar ─────────────────────────────────────────────── */}
      <nav className={`flex items-center px-6 py-4 border-b ${dm ? "border-[#87A98D]/10" : "border-gray-100"}`}>
        <span className={`text-lg font-extrabold tracking-tight ${dm ? "text-[#00FF88]" : "text-green-700"}`}>
          BallersAdda
        </span>
      </nav>

      {/* ── Progress Bar ───────────────────────────────────────────────── */}
      <div className={`h-0.5 ${dm ? "bg-[#1e1e1e]" : "bg-gray-100"}`}>
        <motion.div
          className={`h-full ${dm ? "bg-[#00FF88]" : "bg-green-600"}`}
          animate={{ width: `${((step - 1) / (TOTAL_STEPS - 1)) * 100}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>

      {/* ── Wizard card ────────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className={`w-full max-w-2xl rounded-3xl border shadow-xl p-8 sm:p-12 ${cardCls}`}>

          {/* Step header */}
          <div className="mb-7">

            <h1 className={`text-2xl font-extrabold leading-tight ${dm ? "text-gray-100" : "text-gray-900"}`}>
              {STEPS[step - 1].title}
            </h1>
            <p className={`text-sm mt-1 ${dm ? "text-gray-500" : "text-gray-500"}`}>
              {STEPS[step - 1].subtitle}
            </p>
          </div>

          {error && (
            <p className="text-sm text-red-400 mb-4 text-center">{error}</p>
          )}

          {/* ── Step content ─────────────────────────────────────────── */}
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div key={step} custom={dir} variants={variants} initial="enter" animate="center" exit="exit">

              {/* Step 1 — Name */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>First Name <span className="text-red-400">*</span></label>
                      <input
                        value={form.firstName}
                        onChange={(e) => set("firstName", e.target.value)}
                        placeholder="Rahul"
                        className={inputCls}
                        autoFocus
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Last Name <span className="text-red-400">*</span></label>
                      <input
                        value={form.lastName}
                        onChange={(e) => set("lastName", e.target.value)}
                        placeholder="Sharma"
                        className={inputCls}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Display Name <span className={optTag}>optional</span></label>
                    <input
                      value={form.displayName}
                      onChange={(e) => set("displayName", e.target.value)}
                      placeholder="How coaches and teams see you"
                      className={inputCls}
                    />
                  </div>
                </div>
              )}

              {/* Step 2 — Demographics */}
              {step === 2 && (
                <div className="space-y-5">
                  <div>
                    <label className={labelCls}>Gender <span className={optTag}>optional</span></label>
                    <div className="grid grid-cols-2 gap-2">
                      {GENDERS.map((g) => (
                        <button
                          key={g.value}
                          type="button"
                          onClick={() => set("gender", form.gender === g.value ? "" : g.value)}
                          className={`flex items-center gap-2 px-3 py-3 rounded-xl border text-sm font-medium transition-all duration-200 ${selCard(form.gender === g.value)}`}
                        >
                          <span className="text-base"><g.icon className="w-5 h-5" /></span>
                          {g.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Date of Birth <span className={optTag}>optional</span></label>

                    {/* Show selected DOB summary if complete */}
                    {form.dateOfBirth && (
                      <div className="flex items-center justify-between mb-3">
                        <p className={`text-sm font-semibold ${dm ? 'text-[#00FF88]' : 'text-green-600'}`}>
                          {dobDay} {MONTH_FULL[dobMonth]} {dobYear}
                        </p>
                        <button
                          type="button"
                          onClick={() => { setDobYear(null); setDobMonth(null); setDobDay(null); set('dateOfBirth', ''); }}
                          className={`text-xs font-medium hover:underline ${dm ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                          Change
                        </button>
                      </div>
                    )}

                    {/* Year picker */}
                    {!form.dateOfBirth && dobYear === null && (
                      <div>
                        <p className={`text-xs font-medium mb-2 ${dm ? 'text-gray-500' : 'text-gray-400'}`}>Select your birth year</p>
                        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-52 overflow-y-auto pr-1 custom-scrollbar">
                          {dobYears.map(y => (
                            <motion.button
                              key={y} type="button" whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }}
                              onClick={() => setDobPart('year', y)}
                              className={`py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200 ${selCard(false)}`}
                            >
                              {y}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Month picker */}
                    {!form.dateOfBirth && dobYear !== null && dobMonth === null && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <button type="button" onClick={() => setDobYear(null)} className={`text-xs font-medium hover:underline ${dm ? 'text-gray-500' : 'text-gray-400'}`}>← {dobYear}</button>
                          <p className={`text-xs font-medium ${dm ? 'text-gray-500' : 'text-gray-400'}`}>Select month</p>
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                          {dobMonths.map(m => (
                            <motion.button
                              key={m} type="button" whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }}
                              onClick={() => setDobPart('month', m)}
                              className={`py-3 rounded-xl border text-sm font-semibold transition-all duration-200 ${selCard(false)}`}
                            >
                              {MONTH_NAMES[m]}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Day picker */}
                    {!form.dateOfBirth && dobYear !== null && dobMonth !== null && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <button type="button" onClick={() => setDobMonth(null)} className={`text-xs font-medium hover:underline ${dm ? 'text-gray-500' : 'text-gray-400'}`}>← {MONTH_NAMES[dobMonth]} {dobYear}</button>
                          <p className={`text-xs font-medium ${dm ? 'text-gray-500' : 'text-gray-400'}`}>Select day</p>
                        </div>
                        <div className="grid grid-cols-7 gap-1.5">
                          {dobDays.map(d => (
                            <motion.button
                              key={d} type="button" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                              onClick={() => setDobPart('day', d)}
                              className={`py-2 rounded-lg border text-sm font-semibold transition-all duration-200 ${selCard(false)}`}
                            >
                              {d}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3 — Physicals */}
              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>Height <span className={optTag}>optional</span></label>
                    <div className="relative">
                      <input
                        type="number"
                        min={100}
                        max={250}
                        value={form.height}
                        onChange={(e) => set("height", e.target.value)}
                        placeholder="175"
                        className={`${inputCls} pr-14`}
                      />
                      <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium ${dm ? "text-gray-500" : "text-gray-400"}`}>cm</span>
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Weight <span className={optTag}>optional</span></label>
                    <div className="relative">
                      <input
                        type="number"
                        min={30}
                        max={200}
                        value={form.weight}
                        onChange={(e) => set("weight", e.target.value)}
                        placeholder="70"
                        className={`${inputCls} pr-14`}
                      />
                      <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium ${dm ? "text-gray-500" : "text-gray-400"}`}>kg</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4 — Play Style */}
              {step === 4 && (
                <div className="space-y-5">
                  <div>
                    <label className={labelCls}>Preferred Position <span className={optTag}>optional</span></label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {POSITIONS.map((p) => {
                        const isSelected = form.position === p.value;
                        const zoneCls = isSelected
                          ? (dm ? ZONE_DARK[p.zone] : ZONE_LIGHT[p.zone])
                          : selCard(false);
                        return (
                          <button
                            key={p.value}
                            type="button"
                            onClick={() => set("position", form.position === p.value ? "" : p.value)}
                            className={`group flex flex-col items-center py-4 px-1 rounded-xl border text-xs font-semibold transition-all duration-200 ${zoneCls}`}
                          >
                            <FieldIcon zone={p.zone} className="w-7 h-7 mb-2 opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-transform" />
                            <span className="text-base font-black">{p.abbr}</span>
                            <span className="text-[10px] mt-0.5 opacity-75 text-center leading-tight">{p.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Dominant Foot <span className={optTag}>optional</span></label>
                    <div className="grid grid-cols-3 gap-3">
                      {FEET.map((f) => (
                        <motion.button
                          key={f.value}
                          type="button"
                          whileHover="hover"
                          whileTap="tap"
                          onClick={() => set("dominantFoot", form.dominantFoot === f.value ? "" : f.value)}
                          className={`group flex flex-col items-center gap-3 py-5 rounded-xl border text-sm font-semibold transition-all duration-200 ${selCard(form.dominantFoot === f.value)}`}
                        >
                          <div className="flex gap-1 h-12 items-center justify-center">
                            {f.value === 'LEFT' && (
                              <motion.div variants={{ hover: { scale: 1.3, rotate: -6, y: -2 }, tap: { scale: 0.9 } }} transition={{ type: 'spring', stiffness: 300 }}>
                                <CleatSVG flip={true} className={`w-12 h-12 ${dm ? 'text-gray-500 group-hover:text-gray-200' : 'text-gray-400 group-hover:text-gray-700'} ${form.dominantFoot === f.value ? (dm ? '!text-[#00FF88]' : '!text-green-600') : ''}`} />
                              </motion.div>
                            )}
                            {f.value === 'RIGHT' && (
                              <motion.div variants={{ hover: { scale: 1.3, rotate: 6, y: -2 }, tap: { scale: 0.9 } }} transition={{ type: 'spring', stiffness: 300 }}>
                                <CleatSVG flip={false} className={`w-12 h-12 ${dm ? 'text-gray-500 group-hover:text-gray-200' : 'text-gray-400 group-hover:text-gray-700'} ${form.dominantFoot === f.value ? (dm ? '!text-[#00FF88]' : '!text-green-600') : ''}`} />
                              </motion.div>
                            )}
                            {f.value === 'BOTH' && (
                              <>
                                <motion.div variants={{ hover: { scale: 1.2, rotate: -6, x: -3 }, tap: { scale: 0.9 } }} transition={{ type: 'spring', stiffness: 300 }}>
                                  <CleatSVG flip={true} className={`w-10 h-10 ${dm ? 'text-gray-500 group-hover:text-gray-200' : 'text-gray-400 group-hover:text-gray-700'} ${form.dominantFoot === f.value ? (dm ? '!text-[#00FF88]' : '!text-green-600') : ''}`} />
                                </motion.div>
                                <motion.div variants={{ hover: { scale: 1.2, rotate: 6, x: 3 }, tap: { scale: 0.9 } }} transition={{ type: 'spring', stiffness: 300 }}>
                                  <CleatSVG flip={false} className={`w-10 h-10 ${dm ? 'text-gray-500 group-hover:text-gray-200' : 'text-gray-400 group-hover:text-gray-700'} ${form.dominantFoot === f.value ? (dm ? '!text-[#00FF88]' : '!text-green-600') : ''}`} />
                                </motion.div>
                              </>
                            )}
                          </div>
                          {f.label}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5 — Bio */}
              {step === 5 && (
                <div>
                  <label className={labelCls}>
                    Describe yourself as a player.{" "}
                    <span className={optTag}>What makes you stand out on the pitch?</span>
                  </label>
                  <textarea
                    value={form.bio}
                    onChange={(e) => set("bio", e.target.value)}
                    rows={6}
                    maxLength={500}
                    placeholder="e.g. Creative left-footed playmaker with sharp vision and the ability to unlock defenses. Strongest in tight spaces..."
                    className={`${inputCls} resize-none`}
                  />
                  <p className={`text-xs mt-1.5 text-right ${dm ? "text-gray-600" : "text-gray-400"}`}>
                    {form.bio.length} / 500
                  </p>
                </div>
              )}

              {/* Step 6 — Avatar */}
              {step === 6 && (
                <div className="flex flex-col items-center gap-5">
                  <div
                    className={`relative w-32 h-32 rounded-full border-4 overflow-hidden cursor-pointer group ${dm ? "border-[#87A98D]/20" : "border-gray-200"}`}
                    onClick={() => fileRef.current?.click()}
                  >
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center ${dm ? "bg-[#111]" : "bg-gray-100"}`}>
                        <FiUser className={`text-4xl ${dm ? "text-gray-600" : "text-gray-400"}`} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <FiCamera className="text-white text-2xl" />
                    </div>
                  </div>

                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />

                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className={`text-sm font-semibold hover:underline ${dm ? "text-[#00FF88]" : "text-green-600"}`}
                  >
                    {avatarPreview ? "Change photo" : "Upload photo"}
                  </button>

                  {user?.profilePic && !avatarFile && (
                    <p className={`text-xs text-center ${dm ? "text-gray-600" : "text-gray-400"}`}>
                      Using your Google profile photo
                    </p>
                  )}
                </div>
              )}

            </motion.div>
          </AnimatePresence>

          {/* ── Navigation ───────────────────────────────────────────── */}
          <div className={`flex ${step === 1 ? "justify-end" : "justify-between"} mt-8 items-center`}>
            {step > 1 && (
              <button
                type="button"
                onClick={prev}
                className={`flex items-center gap-1.5 text-sm font-semibold transition-colors ${dm ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"}`}
              >
                <FiArrowLeft /> Back
              </button>
            )}

            {step < TOTAL_STEPS ? (
              <button
                type="button"
                onClick={next}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold text-sm shadow-md transition-all ${accentBtn}`}
              >
                Next <FiArrowRight />
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => submit(true)}
                  disabled={submitting}
                  className={`text-sm font-medium transition-colors disabled:opacity-40 ${dm ? "text-gray-500 hover:text-gray-400" : "text-gray-400 hover:text-gray-500"}`}
                >
                  {submitting ? "..." : "Skip for now"}
                </button>
                <button
                  type="button"
                  onClick={() => submit(false)}
                  disabled={submitting}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold text-sm shadow-md disabled:opacity-50 transition-all ${accentBtn}`}
                >
                  {submitting ? "Saving..." : <><FiCheck /> Finish</>}
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
