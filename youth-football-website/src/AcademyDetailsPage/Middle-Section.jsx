import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronLeft,
  ChevronRight,
  Users,
  Clock,
  ShieldCheck,
  Trophy,
  CheckCircle2,
  XCircle,
  BookOpen,
  UserCircle,
  Sparkles,
  Quote,
  Star,
  Medal,
  GraduationCap,
  Target,
} from "lucide-react";
import { useSelector } from "react-redux";
import BorderBeam from "../components/ui/BorderBeam";

/* ---------- FALLBACK DATA ---------- */
const FALLBACK_TESTIMONIALS = [
  {
    name: "Priya Sharma",
    role: "Parent",
    rating: 5,
    text: "My son has been training here for 2 years and the transformation is incredible. The coaches are patient, professional, and truly care about each child's development.",
    avatar: "PS",
  },
  {
    name: "Rajesh Patel",
    role: "Parent",
    rating: 5,
    text: "Best decision we made for our daughter. She went from a beginner to representing the district team in just 18 months. The structured training program is world-class.",
    avatar: "RP",
  },
  {
    name: "Anita Desai",
    role: "Parent",
    rating: 4,
    text: "The academy provides a safe, competitive environment. My child looks forward to every session. The coaches communicate well with parents about progress.",
    avatar: "AD",
  },
];

const getInitials = (name) => {
  if (!name) return "??";
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
};

const MiddleSection = ({ ACADEMY_DATA }) => {
  const dm = useSelector((state) => state.theme.darkMode);

  const fallbackImages = [
    "https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&q=80&w=1200",
  ];
  const pictures = ACADEMY_DATA?.academy.pictures || fallbackImages;
  const [currentImage, setCurrentImage] = useState(0);
  const safeLength = pictures?.length || fallbackImages.length;

  const nextImage = () => setCurrentImage((prev) => (prev + 1) % safeLength);
  const prevImage = () =>
    setCurrentImage((prev) => (prev - 1 + safeLength) % safeLength);
  const displayImages =
    pictures.length > 0
      ? (pictures[currentImage]?.pictureURL || pictures[currentImage])
      : fallbackImages[currentImage];

  const coaches = ACADEMY_DATA?.academy?.coaches;
  const academy = ACADEMY_DATA?.academy;

  const yearsActive = academy?.establishedAt
    ? new Date().getFullYear() - new Date(academy.establishedAt).getFullYear()
    : null;

  const achievementBadges = [
    { icon: Users, label: "Players Trained", value: academy?.noOfStudents ? `${academy.noOfStudents}+` : "500+" },
    { icon: Trophy, label: "Years of Excellence", value: yearsActive != null ? `${yearsActive}` : "15" },
    { icon: Medal, label: "Trophies Won", value: academy?.tournamentsWon ? `${academy.tournamentsWon}+` : "20+" },
    { icon: GraduationCap, label: "Certified Coaches", value: `${coaches?.length || 0}` },
  ];

  const apiReviews = (academy?.reviews || []).map((r) => ({
    name: r.user?.username || "Anonymous",
    role: r.reviewerRole?.charAt(0) + r.reviewerRole?.slice(1).toLowerCase(),
    rating: r.rating,
    text: r.text,
    avatar: r.user?.profilePic || getInitials(r.user?.username),
    isImage: !!r.user?.profilePic,
    isVerified: r.isVerified,
  }));
  const testimonials = apiReviews.length > 0 ? apiReviews : FALLBACK_TESTIMONIALS;

  const formatPrice = (plan) => {
    if (!plan.priceCents) return plan.price || "Free";
    try {
      let code = "INR";
      if (plan.currency && /^[A-Z]{3}$/i.test(plan.currency))
        code = plan.currency;
      else if (plan.currency === "$") code = "USD";
      else if (plan.currency === "€") code = "EUR";
      else if (plan.currency === "£") code = "GBP";

      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: code,
        maximumFractionDigits: 0,
      }).format(plan.priceCents);
    } catch (e) {
      return `${plan.currency || "₹"}${plan.priceCents}`;
    }
  };

  /* ---------- SHARED SECTION WRAPPER ---------- */
  const SectionCard = ({ children, className = "", alternate = false }) => (
    <div
      className={`rounded-2xl p-6 md:p-8 border transition-colors duration-300 ${
        alternate
          ? dm
            ? "bg-[#111111] border-white/[0.06]"
            : "bg-gray-50/80 border-gray-100"
          : dm
          ? "bg-[#141414] border-white/[0.06]"
          : "bg-white border-gray-100"
      } ${className}`}
    >
      {children}
    </div>
  );

  const SectionTitle = ({ icon: Icon, title, subtitle }) => (
    <div className="mb-6">
      <div className="flex items-center gap-2.5">
        <div
          className={`p-2 rounded-xl ${
            dm ? "bg-[#00FF88]/10" : "bg-emerald-50"
          }`}
        >
          <Icon
            className={`w-5 h-5 ${
              dm ? "text-[#00FF88]" : "text-emerald-600"
            }`}
          />
        </div>
        <h3
          className={`text-2xl font-bold tracking-tight ${
            dm ? "text-gray-100" : "text-gray-900"
          }`}
        >
          {title}
        </h3>
      </div>
      {subtitle && (
        <p
          className={`text-sm mt-1.5 ml-[46px] ${
            dm ? "text-gray-500" : "text-gray-400"
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );

  return (
    <motion.main
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="lg:col-span-8 space-y-6"
    >
      {/* ===== 1. IMAGE GALLERY ===== */}
      <div className="relative h-[300px] md:h-[400px] rounded-2xl overflow-hidden group shadow-sm">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentImage}
            src={displayImages}
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full object-cover"
          />
        </AnimatePresence>

        {/* Subtle gradient at bottom */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />

        <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <motion.button
            onClick={prevImage}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2.5 rounded-full bg-black/40 backdrop-blur-md hover:bg-black/60 text-white transition-all border border-white/10"
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>
          <motion.button
            onClick={nextImage}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2.5 rounded-full bg-black/40 backdrop-blur-md hover:bg-black/60 text-white transition-all border border-white/10"
          >
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {pictures.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentImage(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentImage
                  ? "bg-white w-8"
                  : "bg-white/40 w-1.5 hover:bg-white/60"
              }`}
            />
          ))}
        </div>

        {/* Image counter */}
        <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md text-white text-xs font-medium border border-white/10">
          {currentImage + 1} / {safeLength}
        </div>
      </div>

      {/* ===== 2. ABOUT ===== */}
      <SectionCard>
        <SectionTitle
          icon={Trophy}
          title="About the Academy"
          subtitle="What makes us different"
        />
        <p
          className={`text-sm md:text-base leading-7 md:leading-8 ${
            dm ? "text-gray-400" : "text-gray-600"
          }`}
        >
          {ACADEMY_DATA?.academy?.description || "No description provided."}
        </p>
      </SectionCard>

      {/* ===== 3. ACHIEVEMENTS ===== */}
      <SectionCard alternate>
        <SectionTitle
          icon={Target}
          title="Our Achievements"
          subtitle="Numbers that speak for themselves"
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {achievementBadges.map(({ icon: Icon, label, value }, idx) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08 }}
              className={`p-4 rounded-2xl text-center border transition-colors ${
                dm
                  ? "bg-[#0a0a0a] border-white/[0.06] hover:border-[#00FF88]/20"
                  : "bg-white border-gray-100 hover:border-emerald-200"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center ${
                  dm ? "bg-[#00FF88]/10" : "bg-emerald-50"
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${
                    dm ? "text-[#00FF88]" : "text-emerald-600"
                  }`}
                />
              </div>
              <p
                className={`text-xl font-black tracking-tight ${
                  dm ? "text-gray-100" : "text-gray-900"
                }`}
              >
                {value}
              </p>
              <p
                className={`text-xs mt-0.5 ${
                  dm ? "text-gray-500" : "text-gray-400"
                }`}
              >
                {label}
              </p>
            </motion.div>
          ))}
        </div>
      </SectionCard>

      {/* ===== 4. COACHES ===== */}
      <SectionCard>
        <SectionTitle
          icon={Users}
          title="Expert Coaches"
          subtitle="Learn from the best in the field"
        />
        <div className="flex md:grid md:grid-cols-3 gap-4 overflow-x-auto md:overflow-visible pb-2 md:pb-0 -mx-2 px-2 md:mx-0 md:px-0 snap-x snap-mandatory md:snap-none">
          {coaches.map((coach, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              whileHover={{ y: -4 }}
              className={`min-w-[200px] md:min-w-0 snap-start p-5 rounded-2xl border flex flex-col items-center text-center cursor-pointer group transition-all duration-300 ${
                dm
                  ? "bg-[#0a0a0a] border-white/[0.06] hover:border-[#00FF88]/20 hover:shadow-lg hover:shadow-[#00FF88]/5"
                  : "bg-white border-gray-100 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-100/50"
              }`}
            >
              <div
                className={`w-20 h-20 rounded-full overflow-hidden mb-4 border-2 transition-all duration-300 ring-4 ${
                  dm
                    ? "border-white/10 group-hover:border-[#00FF88] ring-[#00FF88]/5 group-hover:ring-[#00FF88]/10"
                    : "border-emerald-100 group-hover:border-emerald-500 ring-emerald-50 group-hover:ring-emerald-100"
                }`}
              >
                <img
                  src={coach.image}
                  alt={coach.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h4
                className={`font-bold text-sm ${
                  dm ? "text-gray-200" : "text-gray-800"
                }`}
              >
                {coach.name}
              </h4>
              <span
                className={`text-xs font-semibold mt-1 ${
                  dm ? "text-[#00FF88]" : "text-emerald-600"
                }`}
              >
                {coach.role}
              </span>
              <span
                className={`text-[10px] mt-2 px-3 py-1 rounded-full font-medium ${
                  dm
                    ? "text-gray-500 bg-white/[0.04]"
                    : "text-gray-400 bg-gray-50"
                }`}
              >
                {coach.exp} Exp
              </span>
            </motion.div>
          ))}
        </div>
      </SectionCard>

      {/* ===== 5. TRAINING SCHEDULE ===== */}
      <SectionCard alternate>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-xl ${
                dm ? "bg-[#00FF88]/10" : "bg-emerald-50"
              }`}
            >
              <Clock
                className={`w-5 h-5 ${
                  dm ? "text-[#00FF88]" : "text-emerald-600"
                }`}
              />
            </div>
            <div>
              <h3
                className={`text-2xl font-bold tracking-tight ${
                  dm ? "text-gray-100" : "text-gray-900"
                }`}
              >
                Training Schedule
              </h3>
              <p
                className={`text-sm ${
                  dm ? "text-gray-500" : "text-gray-400"
                }`}
              >
                Weekly training days
              </p>
            </div>
          </div>
          <span
            className={`text-xs font-medium px-3 py-1.5 rounded-full ${
              dm
                ? "text-gray-500 bg-white/[0.04]"
                : "text-gray-400 bg-gray-100"
            }`}
          >
            Updates Weekly
          </span>
        </div>

        <div
          className={`flex justify-between items-center p-4 md:p-5 rounded-2xl ${
            dm ? "bg-[#0a0a0a]" : "bg-white"
          }`}
        >
          {Object.entries(ACADEMY_DATA.academy.schedule).map(
            ([dayOfWeek, { active }], i) => (
              <motion.div
                key={dayOfWeek}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex flex-col items-center gap-3"
              >
                <span
                  className={`text-xs font-bold uppercase tracking-wider ${
                    active
                      ? dm
                        ? "text-[#00FF88]"
                        : "text-emerald-600"
                      : dm
                      ? "text-gray-600"
                      : "text-gray-400"
                  }`}
                >
                  {dayOfWeek}
                </span>
                <div
                  className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center transition-all ${
                    active
                      ? dm
                        ? "bg-[#00FF88]/15 border border-[#00FF88]/30"
                        : "bg-emerald-50 border border-emerald-200"
                      : dm
                      ? "bg-white/[0.02] border border-white/[0.06]"
                      : "bg-gray-50 border border-gray-100"
                  }`}
                >
                  {active ? (
                    <CheckCircle2
                      className={`w-5 h-5 ${
                        dm
                          ? "text-[#00FF88]"
                          : "text-emerald-500"
                      }`}
                    />
                  ) : (
                    <XCircle className="w-5 h-5 text-gray-300 dark:text-gray-600 opacity-50" />
                  )}
                </div>
              </motion.div>
            )
          )}
        </div>
      </SectionCard>

      {/* ===== 6. PRICING ===== */}
      <SectionCard>
        <SectionTitle
          icon={ShieldCheck}
          title="Membership Plans"
          subtitle="Choose the plan that fits your goals"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ACADEMY_DATA?.academy?.pricing?.map((plan, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08, type: "spring", stiffness: 300, damping: 20 }}
              whileHover={{
                y: -6,
                scale: 1.02,
                ...(plan.recommended
                  ? {
                      boxShadow: dm
                        ? "0 20px 60px -12px rgba(0, 255, 136, 0.35)"
                        : "0 20px 60px -12px rgba(16, 185, 129, 0.4)",
                    }
                  : {
                      borderColor: dm
                        ? "rgba(135, 169, 141, 0.35)"
                        : "rgba(16, 185, 129, 0.4)",
                    }),
              }}
              className={`relative rounded-2xl shadow-sm transition-colors duration-300 ${
                plan.recommended ? "overflow-hidden" : ""
              } ${
                plan.recommended
                  ? "border-transparent"
                  : dm
                  ? "border border-white/[0.06]"
                  : "border border-gray-100"
              }`}
            >
              {/* Border beam for recommended card */}
              {plan.recommended && (
                <BorderBeam
                  colorFrom={dm ? "gold" : "yellow"}
                  colorTo={dm ? "violet" : "yellow"}
                  size={100}
                  duration={8}
                  borderWidth={2}
                  wrapperClassName="z-20"
                />
              )}

              {/* Card body */}
              <div
                className={`relative z-10 p-6 md:p-7 rounded-2xl ${
                  plan.recommended
                    ? dm
                      ? "bg-gradient-to-br from-[#00FF88]/80 to-[#00DCFF]/60 text-[#0a0a0a]"
                      : "bg-gradient-to-br from-emerald-600 to-emerald-800 text-white"
                    : dm
                    ? "bg-[#0a0a0a] text-gray-200"
                    : "bg-white text-gray-900"
                }`}
              >
                {/* Popular badge */}
                {plan.recommended && (
                  <motion.div
                    className={`absolute top-4 right-4 backdrop-blur-md px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 overflow-hidden border ${
                      dm
                        ? "bg-[#0a0a0a]/30 text-[#0a0a0a] border-[#0a0a0a]/10"
                        : "bg-white/25 text-white border-white/20"
                    }`}
                    whileHover={{ scale: 1.05 }}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Most Popular</span>
                  </motion.div>
                )}

                <h4
                  className={`text-sm font-medium ${
                    plan.recommended
                      ? dm
                        ? "text-[#0a0a0a]/70"
                        : "text-emerald-100"
                      : dm
                      ? "text-gray-500"
                      : "text-gray-500"
                  }`}
                >
                  {plan.title}
                </h4>

                {/* Price */}
                <motion.div
                  className="text-4xl font-black my-3 inline-block tracking-tight"
                  whileHover={{ scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                >
                  {formatPrice(plan)}
                  <span
                    className={`text-sm font-normal opacity-70 ml-1 ${
                      plan.recommended
                        ? dm
                          ? "text-[#0a0a0a]"
                          : "text-white"
                        : ""
                    }`}
                  >
                    /{plan.billingCycle?.toLowerCase()}
                  </span>
                </motion.div>

                {/* Feature list */}
                <ul className="space-y-2.5 mt-4 mb-5">
                  {(Array.isArray(plan.features) ? plan.features : []).map(
                    (feat, i) => (
                      <motion.li
                        key={i}
                        className="text-sm flex items-center gap-2.5 opacity-90"
                        initial={{ x: -4, opacity: 0.7 }}
                        whileInView={{ x: 0, opacity: 0.9 }}
                        transition={{
                          delay: i * 0.06,
                          type: "spring",
                          stiffness: 300,
                          damping: 20,
                        }}
                        viewport={{ once: true }}
                      >
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />{" "}
                        {feat}
                      </motion.li>
                    )
                  )}
                </ul>

                {/* CTA on recommended */}
                {plan.recommended && (
                  <motion.a
                    href="#join-academy"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`inline-flex items-center justify-center w-full py-3 rounded-xl font-bold text-sm mt-2 transition-colors ${
                      dm
                        ? "bg-[#0a0a0a] text-[#00FF88] hover:bg-[#0a0a0a]/80"
                        : "bg-white text-emerald-700 hover:bg-white/90"
                    }`}
                  >
                    Get Started
                  </motion.a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </SectionCard>

      {/* ===== 7. BATCHES ===== */}
      <SectionCard alternate>
        <SectionTitle
          icon={BookOpen}
          title="Training Batches"
          subtitle="Find the right batch for your skill level"
        />

        {!ACADEMY_DATA?.academy?.batches?.length ? (
          <div
            className={`rounded-2xl p-10 text-center border ${
              dm
                ? "bg-[#0a0a0a] border-white/[0.06]"
                : "bg-white border-gray-100"
            }`}
          >
            <BookOpen
              className={`w-10 h-10 mx-auto mb-3 ${
                dm ? "text-gray-600" : "text-gray-300"
              }`}
            />
            <p
              className={`text-sm font-medium ${
                dm ? "text-gray-400" : "text-gray-500"
              }`}
            >
              No batches available yet.
            </p>
            <p
              className={`text-xs mt-1 ${
                dm ? "text-gray-600" : "text-gray-400"
              }`}
            >
              Check back soon for upcoming training batches.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ACADEMY_DATA.academy.batches.map((batch, index) => {
              const enrolled = batch._count?.players || 0;
              const capacity = batch.capacity || 1;
              const fillPercent = Math.min((enrolled / capacity) * 100, 100);
              const isFull = enrolled >= capacity;
              const spotsLeft = Math.max(capacity - enrolled, 0);

              return (
                <motion.div
                  key={batch.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08, duration: 0.4 }}
                  whileHover={{ y: -4 }}
                  className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer group ${
                    dm
                      ? "bg-[#0a0a0a] border-white/[0.06] hover:border-[#00FF88]/15"
                      : "bg-white border-gray-100 hover:border-emerald-200 hover:shadow-md"
                  }`}
                >
                  {/* Header: Name + Age Group Badge */}
                  <div className="flex items-start justify-between mb-3">
                    <h4
                      className={`font-bold text-sm ${
                        dm ? "text-gray-200" : "text-gray-800"
                      }`}
                    >
                      {batch.name}
                    </h4>
                    <span
                      className={`text-[10px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${
                        dm
                          ? "bg-[#00FF88]/10 text-[#00FF88]"
                          : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {batch.ageGroup}
                    </span>
                  </div>

                  {/* Description */}
                  {batch.description && (
                    <p
                      className={`text-xs leading-5 mb-4 line-clamp-2 ${
                        dm ? "text-gray-500" : "text-gray-500"
                      }`}
                    >
                      {batch.description}
                    </p>
                  )}

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className={`text-[11px] font-medium flex items-center gap-1 ${
                          dm ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        <Users className="w-3.5 h-3.5" />
                        {enrolled} / {capacity}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          isFull
                            ? "bg-red-500/10 text-red-400"
                            : spotsLeft <= 3
                            ? dm
                              ? "bg-amber-500/10 text-amber-400"
                              : "bg-amber-50 text-amber-600"
                            : dm
                            ? "bg-[#00FF88]/10 text-[#00FF88]"
                            : "bg-emerald-50 text-emerald-600"
                        }`}
                      >
                        {isFull
                          ? "Full"
                          : `${spotsLeft} spot${
                              spotsLeft !== 1 ? "s" : ""
                            } left`}
                      </span>
                    </div>
                    <div
                      className={`w-full h-1.5 rounded-full overflow-hidden ${
                        dm ? "bg-white/[0.04]" : "bg-gray-100"
                      }`}
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${fillPercent}%` }}
                        viewport={{ once: true }}
                        transition={{
                          delay: index * 0.08 + 0.3,
                          duration: 0.6,
                          ease: "easeOut",
                        }}
                        className={`h-full rounded-full ${
                          isFull
                            ? "bg-red-400"
                            : spotsLeft <= 3
                            ? "bg-amber-400"
                            : dm
                            ? "bg-[#00FF88]"
                            : "bg-emerald-500"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Coach */}
                  {batch.coach && (
                    <div
                      className={`flex items-center gap-2 pt-3 border-t ${
                        dm ? "border-white/[0.06]" : "border-gray-100"
                      }`}
                    >
                      <UserCircle
                        className={`w-4 h-4 ${
                          dm ? "text-gray-500" : "text-gray-400"
                        }`}
                      />
                      <span
                        className={`text-xs ${
                          dm ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        Coach
                      </span>
                      <span
                        className={`text-xs font-semibold ${
                          dm ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        {batch.coach.firstName} {batch.coach.lastName}
                      </span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </SectionCard>

      {/* ===== 8. TESTIMONIALS ===== */}
      <SectionCard>
        <SectionTitle
          icon={Quote}
          title="What Parents Say"
          subtitle="Hear from families in our community"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {testimonials.map((testimonial, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -4 }}
              className={`p-5 rounded-2xl border transition-all duration-300 ${
                dm
                  ? "bg-[#0a0a0a] border-white/[0.06] hover:border-[#00FF88]/15"
                  : "bg-white border-gray-100 hover:border-emerald-200 hover:shadow-md"
              }`}
            >
              <Quote
                className={`w-6 h-6 mb-3 ${
                  dm ? "text-[#00FF88]/30" : "text-emerald-200"
                }`}
              />
              <p
                className={`text-sm leading-relaxed mb-4 ${
                  dm ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {testimonial.text}
              </p>
              <div className="flex items-center gap-3">
                {testimonial.isImage ? (
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${
                      dm
                        ? "bg-[#00FF88]/10 text-[#00FF88]"
                        : "bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    {testimonial.avatar}
                  </div>
                )}
                <div>
                  <p
                    className={`text-sm font-semibold ${
                      dm ? "text-gray-200" : "text-gray-800"
                    }`}
                  >
                    {testimonial.name}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-xs ${
                        dm ? "text-gray-500" : "text-gray-400"
                      }`}
                    >
                      {testimonial.role}
                    </span>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-2.5 h-2.5 ${
                            s <= testimonial.rating
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </SectionCard>
    </motion.main>
  );
};

export default MiddleSection;
