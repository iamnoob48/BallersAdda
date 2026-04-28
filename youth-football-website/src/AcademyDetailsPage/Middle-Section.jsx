import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Users, Clock, ShieldCheck, Trophy, CheckCircle2, XCircle, BookOpen, UserCircle, Sparkles } from "lucide-react";
import { useSelector } from "react-redux";
import BorderBeam from "../components/ui/BorderBeam";

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
    pictures.length > 0 ? pictures[currentImage] : fallbackImages[currentImage];

  const coaches = ACADEMY_DATA?.academy?.coaches;

  const formatPrice = (plan) => {
    if (!plan.priceCents) return plan.price || "Free";
    try {
      let code = 'INR';
      if (plan.currency && /^[A-Z]{3}$/i.test(plan.currency)) code = plan.currency;
      else if (plan.currency === '$') code = 'USD';
      else if (plan.currency === '€') code = 'EUR';
      else if (plan.currency === '£') code = 'GBP';

      return new Intl.NumberFormat('en-IN', { style: 'currency', currency: code, maximumFractionDigits: 0 }).format(plan.priceCents);
    } catch (e) {
      return `${plan.currency || '₹'}${plan.priceCents}`;
    }
  };

  return (
    <motion.main
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="lg:col-span-6 space-y-8"
    >
      {/* 1. Carousel */}
      <div className="relative h-[350px] rounded-3xl overflow-hidden group shadow-sm">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentImage}
            src={displayImages}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full object-cover"
          />
        </AnimatePresence>

        <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={prevImage}
            className="p-2 rounded-full bg-white/30 backdrop-blur hover:bg-white text-white hover:text-black transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextImage}
            className="p-2 rounded-full bg-white/30 backdrop-blur hover:bg-white text-white hover:text-black transition-all"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {pictures.map((_, idx) => (
            <div
              key={idx}
              className={`w-2 h-2 rounded-full transition-all ${idx === currentImage ? "bg-white w-6" : "bg-white/50"
                }`}
            />
          ))}
        </div>
      </div>
      {/* 5. About */}
      <section className={`rounded-3xl p-6 shadow-sm border transition-colors duration-300 ${dm ? "bg-[#1a1a1a] border-[#87A98D]/15" : "bg-white border-gray-100"}`}>
        <h3 className={`text-lg font-bold mb-3 flex items-center gap-2 ${dm ? "text-gray-100" : "text-gray-900"}`}>
          <Trophy className={`w-5 h-5 ${dm ? "text-[#00FF88]" : "text-emerald-600"}`} /> About the Academy
        </h3>
        <p className={`text-sm leading-7 ${dm ? "text-gray-400" : "text-gray-600"}`}>{ACADEMY_DATA?.academy?.description || "No description provided."}</p>
      </section>

      {/* 2. Coaches Section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Users className={`w-5 h-5 ${dm ? "text-[#00FF88]" : "text-emerald-600"}`} />
          <h3 className={`text-lg font-bold ${dm ? "text-gray-100" : "text-gray-900"}`}>Expert Coaches</h3>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {coaches.map((coach, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -5 }}
              className={`p-4 rounded-2xl shadow-sm border flex flex-col items-center text-center cursor-pointer group transition-colors duration-300 ${dm ? "bg-[#1a1a1a] border-[#87A98D]/15" : "bg-white border-gray-100"}`}
            >
              <div className={`w-20 h-20 rounded-full overflow-hidden mb-3 border-2 transition-colors ${dm ? "border-[#87A98D]/30 group-hover:border-[#00FF88]" : "border-emerald-100 group-hover:border-emerald-500"}`}>
                <img
                  src={coach.image}
                  alt={coach.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h4 className={`font-bold text-sm ${dm ? "text-gray-200" : "text-gray-800"}`}>{coach.name}</h4>
              <span className={`text-xs font-medium mb-1 ${dm ? "text-[#00FF88]" : "text-emerald-600"}`}>
                {coach.role}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded ${dm ? "text-gray-500 bg-[#121212]" : "text-gray-400 bg-gray-50"}`}>
                {coach.exp} Exp
              </span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 3. Training Schedule */}
      <section className={`rounded-3xl p-6 shadow-sm border transition-colors duration-300 ${dm ? "bg-[#1a1a1a] border-[#87A98D]/15" : "bg-white border-gray-100"}`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Clock className={`w-5 h-5 ${dm ? "text-[#00FF88]" : "text-emerald-600"}`} />
            <h3 className={`text-lg font-bold ${dm ? "text-gray-100" : "text-gray-900"}`}>
              Training Schedule
            </h3>
          </div>
          <span className={`text-xs font-medium ${dm ? "text-gray-500" : "text-gray-400"}`}>
            Updates Weekly
          </span>
        </div>

        <div className={`flex justify-between items-center p-4 rounded-2xl ${dm ? "bg-[#121212]" : "bg-gray-50"}`}>
          {Object.entries(ACADEMY_DATA.academy.schedule).map(
            ([dayOfWeek, { active }], i) => (
              <div key={dayOfWeek} className="flex flex-col items-center gap-3">
                <span className={`text-xs font-bold uppercase ${dm ? "text-gray-500" : "text-gray-500"}`}>
                  {dayOfWeek}
                </span>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                >
                  {active ? (
                    <CheckCircle2 className={`w-6 h-6 ${dm ? "text-[#00FF88] fill-[#00FF88]/10" : "text-emerald-500 fill-emerald-50"}`} />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-400 fill-red-50 opacity-50" />
                  )}
                </motion.div>
              </div>
            )
          )}
        </div>
      </section>

      {/* 4. Pricing */}
      <section>
        <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${dm ? "text-gray-100" : "text-gray-900"}`}>
          <ShieldCheck className={`w-5 h-5 ${dm ? "text-[#00FF88]" : "text-emerald-600"}`} /> Membership Plans
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ACADEMY_DATA?.academy?.pricing?.map((plan, idx) => (
            <motion.div
              key={idx}
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
                    borderColor: dm ? "rgba(135, 169, 141, 0.35)" : "rgba(16, 185, 129, 0.4)",
                  }),
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={`relative rounded-3xl shadow-sm transition-colors duration-300 ${plan.recommended ? "overflow-hidden" : ""
                } ${plan.recommended
                  ? "border-transparent"
                  : dm
                    ? "border border-[#87A98D]/15"
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
                className={`relative z-10 p-6 rounded-3xl ${plan.recommended
                  ? dm
                    ? "bg-gradient-to-br from-[#00FF88]/80 to-[#00DCFF]/60 text-[#121212]"
                    : "bg-gradient-to-br from-emerald-600 to-emerald-800 text-white"
                  : dm
                    ? "bg-[#1a1a1a] text-gray-200"
                    : "bg-white text-gray-900"
                  }`}
              >
                {/* Popular badge */}
                {plan.recommended && (
                  <motion.div
                    className={`absolute top-4 right-4 backdrop-blur px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 overflow-hidden ${dm ? "bg-[#121212]/30 text-[#121212]" : "bg-white/20 text-white"
                      }`}
                    whileHover={{ scale: 1.05 }}
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Popular</span>

                  </motion.div>
                )}

                <h4
                  className={`text-sm font-medium ${plan.recommended
                    ? dm ? "text-[#121212]/70" : "text-emerald-100"
                    : dm ? "text-gray-500" : "text-gray-500"
                    }`}
                >
                  {plan.title}
                </h4>

                {/* Price with hover scale */}
                <motion.div
                  className="text-3xl font-bold my-2 inline-block"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                >
                  {formatPrice(plan)}
                  <span
                    className={`text-sm font-normal opacity-80 ${plan.recommended ? (dm ? "text-[#121212]" : "text-white") : ""
                      }`}
                  >
                    /{plan.billingCycle?.toLowerCase()}
                  </span>
                </motion.div>

                {/* Feature list with stagger on hover */}
                <ul className="space-y-2 mt-4 mb-4">
                  {(Array.isArray(plan.features) ? plan.features : []).map(
                    (feat, i) => (
                      <motion.li
                        key={i}
                        className="text-xs flex items-center gap-2 opacity-90"
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
                        <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" /> {feat}
                      </motion.li>
                    )
                  )}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </section>



      {/* 6. Batches */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className={`w-5 h-5 ${dm ? "text-[#00FF88]" : "text-emerald-600"}`} />
          <h3 className={`text-lg font-bold ${dm ? "text-gray-100" : "text-gray-900"}`}>Training Batches</h3>
        </div>

        {!ACADEMY_DATA?.academy?.batches?.length ? (
          <div className={`rounded-3xl p-8 shadow-sm border text-center transition-colors duration-300 ${dm ? "bg-[#1a1a1a] border-[#87A98D]/15" : "bg-white border-gray-100"}`}>
            <BookOpen className={`w-10 h-10 mx-auto mb-3 ${dm ? "text-gray-600" : "text-gray-300"}`} />
            <p className={`text-sm font-medium ${dm ? "text-gray-400" : "text-gray-500"}`}>No batches available yet.</p>
            <p className={`text-xs mt-1 ${dm ? "text-gray-600" : "text-gray-400"}`}>Check back soon for upcoming training batches.</p>
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
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08, duration: 0.4 }}
                  whileHover={{ y: -4 }}
                  className={`p-5 rounded-3xl shadow-sm border transition-colors duration-300 cursor-pointer group ${dm ? "bg-[#1a1a1a] border-[#87A98D]/15" : "bg-white border-gray-100"}`}
                >
                  {/* Header: Name + Age Group Badge */}
                  <div className="flex items-start justify-between mb-3">
                    <h4 className={`font-bold text-sm ${dm ? "text-gray-200" : "text-gray-800"}`}>{batch.name}</h4>
                    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${dm ? "bg-[#00FF88]/10 text-[#00FF88]" : "bg-emerald-50 text-emerald-700"}`}>
                      {batch.ageGroup}
                    </span>
                  </div>

                  {/* Description */}
                  {batch.description && (
                    <p className={`text-xs leading-5 mb-4 line-clamp-2 ${dm ? "text-gray-500" : "text-gray-500"}`}>
                      {batch.description}
                    </p>
                  )}

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-[11px] font-medium flex items-center gap-1 ${dm ? "text-gray-400" : "text-gray-600"}`}>
                        <Users className="w-3.5 h-3.5" />
                        {enrolled} / {capacity}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${isFull
                        ? "bg-red-500/10 text-red-400"
                        : spotsLeft <= 3
                          ? dm ? "bg-amber-500/10 text-amber-400" : "bg-amber-50 text-amber-600"
                          : dm ? "bg-[#00FF88]/10 text-[#00FF88]" : "bg-emerald-50 text-emerald-600"
                        }`}>
                        {isFull ? "Full" : `${spotsLeft} spot${spotsLeft !== 1 ? "s" : ""} left`}
                      </span>
                    </div>
                    <div className={`w-full h-1.5 rounded-full overflow-hidden ${dm ? "bg-[#121212]" : "bg-gray-100"}`}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${fillPercent}%` }}
                        transition={{ delay: index * 0.08 + 0.3, duration: 0.6, ease: "easeOut" }}
                        className={`h-full rounded-full ${isFull
                          ? "bg-red-400"
                          : spotsLeft <= 3
                            ? "bg-amber-400"
                            : dm ? "bg-[#00FF88]" : "bg-emerald-500"
                          }`}
                      />
                    </div>
                  </div>

                  {/* Coach */}
                  {batch.coach && (
                    <div className={`flex items-center gap-2 pt-3 border-t ${dm ? "border-[#87A98D]/10" : "border-gray-100"}`}>
                      <UserCircle className={`w-4 h-4 ${dm ? "text-gray-500" : "text-gray-400"}`} />
                      <span className={`text-xs ${dm ? "text-gray-400" : "text-gray-500"}`}>Coach</span>
                      <span className={`text-xs font-semibold ${dm ? "text-gray-300" : "text-gray-700"}`}>
                        {batch.coach.firstName} {batch.coach.lastName}
                      </span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

    </motion.main>


  );
};

export default MiddleSection;
