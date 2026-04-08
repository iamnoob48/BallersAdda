import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Users, Clock, ShieldCheck, Trophy, CheckCircle2, XCircle } from "lucide-react";
import { useSelector } from "react-redux";

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
              className={`w-2 h-2 rounded-full transition-all ${
                idx === currentImage ? "bg-white w-6" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>

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
            ([dayOfWeek, {isActive}], i) => (
              <div key={dayOfWeek} className="flex flex-col items-center gap-3">
                <span className={`text-xs font-bold uppercase ${dm ? "text-gray-500" : "text-gray-500"}`}>
                  {dayOfWeek}
                </span>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                >
                  {isActive ? (
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
            <div
              key={idx}
              className={`relative p-6 rounded-3xl border shadow-sm ${
                plan.recommended
                  ? dm
                    ? "bg-gradient-to-br from-[#00FF88]/80 to-[#00DCFF]/60 text-[#121212] border-transparent"
                    : "bg-gradient-to-br from-emerald-600 to-emerald-800 text-white border-transparent"
                  : dm
                    ? "bg-[#1a1a1a] border-[#87A98D]/15 text-gray-200"
                    : "bg-white border-gray-100 text-gray-900"
              }`}
            >
              {plan.recommended && (
                <div className={`absolute top-4 right-4 backdrop-blur px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${dm ? "bg-[#121212]/30 text-[#121212]" : "bg-white/20 text-white"}`}>
                  Popular
                </div>
              )}
              <h4
                className={`text-sm font-medium ${
                  plan.recommended
                    ? dm ? "text-[#121212]/70" : "text-emerald-100"
                    : dm ? "text-gray-500" : "text-gray-500"
                }`}
              >
                {plan.title}
              </h4>
              <div className="text-3xl font-bold my-2">
                {formatPrice(plan)}
                <span className={`text-sm font-normal opacity-80 ${plan.recommended ? (dm ? "text-[#121212]" : "text-white") : ""}`}>/{plan.billingCycle?.toLowerCase()}</span>
              </div>
              <ul className="space-y-2 mt-4 mb-4">
                {(Array.isArray(plan.features) ? plan.features : []).map((feat, i) => (
                  <li
                    key={i}
                    className="text-xs flex items-center gap-2 opacity-90"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> {feat}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* 5. About */}
      <section className={`rounded-3xl p-6 shadow-sm border transition-colors duration-300 ${dm ? "bg-[#1a1a1a] border-[#87A98D]/15" : "bg-white border-gray-100"}`}>
        <h3 className={`text-lg font-bold mb-3 flex items-center gap-2 ${dm ? "text-gray-100" : "text-gray-900"}`}>
          <Trophy className={`w-5 h-5 ${dm ? "text-[#00FF88]" : "text-emerald-600"}`} /> About the Academy
        </h3>
        <p className={`text-sm leading-7 ${dm ? "text-gray-400" : "text-gray-600"}`}>{ACADEMY_DATA?.academy?.description || "No description provided."}</p>
      </section>
    </motion.main>
  );
};

export default MiddleSection;
