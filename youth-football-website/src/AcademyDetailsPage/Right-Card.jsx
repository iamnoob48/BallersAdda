import { motion } from "framer-motion";
import { Phone, Mail, Share2, Heart } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const RightCard = ({ ACADEMY_DATA }) => {
  const dm = useSelector((state) => state.theme.darkMode);
  const navigate = useNavigate();

  const handleJoinAcademy = () => {
    navigate(`/academy/payment/${ACADEMY_DATA.academy.id}`, {
      state: {
        academy: {
          id: ACADEMY_DATA.academy.id,
          name: ACADEMY_DATA.academy.name,
        },
        plan: "Football Coaching",
        price: ACADEMY_DATA.pricing?.[0]?.priceCents
          ? ACADEMY_DATA.pricing[0].priceCents / 100
          : 2999,
      },
    });
  };

  return (
    <motion.aside
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="lg:col-span-3 space-y-6"
    >
      {/* Join Card */}
      <div className={`rounded-3xl p-6 shadow-lg border sticky top-24 transition-colors duration-300 ${dm ? "bg-[#1a1a1a] shadow-black/20 border-[#87A98D]/15" : "bg-white shadow-emerald-100/50 border-emerald-50"}`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-xl font-bold ${dm ? "text-gray-100" : "text-gray-900"}`}>Join Academy</h3>
          <span className="flex h-3 w-3">
            <span className={`animate-ping absolute inline-flex h-3 w-3 rounded-full opacity-75 ${dm ? "bg-[#00FF88]" : "bg-emerald-400"}`}></span>
            <span className={`relative inline-flex rounded-full h-3 w-3 ${dm ? "bg-[#00FF88]" : "bg-emerald-500"}`}></span>
          </span>
        </div>

        <div className="space-y-4">
          <div>
            <label className={`text-xs font-bold uppercase tracking-wide mb-1.5 block ${dm ? "text-gray-500" : "text-gray-500"}`}>
              Select Service
            </label>
            <select className={`w-full border text-sm rounded-xl block p-3 outline-none ${dm ? "bg-[#121212] border-[#87A98D]/20 text-gray-300 focus:ring-[#00FF88]/20 focus:border-[#00FF88]/50" : "bg-gray-50 border-gray-200 text-gray-900 focus:ring-emerald-500 focus:border-emerald-500"}`}>
              <option>Football Coaching</option>
              <option>Fitness Training</option>
              <option>Summer Camp</option>
            </select>
          </div>

          <div>
            <label className={`text-xs font-bold uppercase tracking-wide mb-1.5 block ${dm ? "text-gray-500" : "text-gray-500"}`}>
              Add Message (Optional)
            </label>
            <textarea
              rows="3"
              className={`w-full border text-sm rounded-xl block p-3 outline-none resize-none ${dm ? "bg-[#121212] border-[#87A98D]/20 text-gray-300 placeholder:text-gray-600 focus:ring-[#00FF88]/20 focus:border-[#00FF88]/50" : "bg-gray-50 border-gray-200 text-gray-900 focus:ring-emerald-500 focus:border-emerald-500"}`}
              placeholder="Hi, I'm interested in..."
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleJoinAcademy}
            className={`w-full font-bold py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${dm ? "bg-[#00FF88] text-[#121212] hover:bg-[#00FF88]/90 shadow-[#00FF88]/10" : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200"}`}
          >
            Join This Academy
          </motion.button>

          <div className={`pt-4 border-t flex justify-center gap-6 ${dm ? "border-[#87A98D]/10" : "border-gray-100"}`}>
            {[
              { icon: Phone, label: "Call", hoverColor: dm ? "hover:text-[#00FF88]" : "hover:text-emerald-600" },
              { icon: Mail, label: "Email", hoverColor: dm ? "hover:text-[#00DCFF]" : "hover:text-emerald-600" },
              { icon: Share2, label: "Share", hoverColor: dm ? "hover:text-[#00FF88]" : "hover:text-emerald-600" },
              { icon: Heart, label: "Save", hoverColor: "hover:text-red-500" },
            ].map(({ icon: Icon, label, hoverColor }) => (
              <button key={label} className={`flex flex-col items-center gap-1 transition-colors ${dm ? "text-gray-500" : "text-gray-400"} ${hoverColor}`}>
                <div className={`p-2 rounded-full ${dm ? "bg-[#121212]" : "bg-gray-50"}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.aside>
  );
};

export default RightCard;
