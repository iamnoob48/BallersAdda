import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaUser, FaPen, FaTimes, FaCamera } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { updatePlayerProfile } from "../redux/slices/playerSlice";

// ── Shared wrapper ──────────────────────────────────────────────────────────
const SectionWrapper = ({ children, dm }) => (
  <motion.div
    initial={{ opacity: 0, y: 10, scale: 0.98 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -10, scale: 0.98 }}
    transition={{ duration: 0.3 }}
    className={`rounded-3xl shadow-xl p-6 md:p-8 transition-colors duration-300 ${dm ? "bg-[#141414] border border-green-900/20 shadow-green-950/20" : "bg-white border border-white shadow-gray-200/50"}`}
  >
    {children}
  </motion.div>
);

const InfoCard = ({ label, value, highlight, dm }) => (
  <div className={`border-b py-2 ${dm ? "border-green-900/20" : "border-gray-100"}`}>
    <p className={`text-xs font-bold uppercase tracking-wide ${dm ? "text-gray-500" : "text-gray-400"}`}>{label}</p>
    <p className={`text-lg font-semibold mt-1 ${highlight ? (dm ? "text-yellow-400" : "text-green-600") : (dm ? "text-gray-200" : "text-gray-900")}`}>
      {value || "—"}
    </p>
  </div>
);

const FormField = ({ label, name, type = "text", value, onChange }) => (
  <div>
    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">{label}</label>
    <input
      type={type}
      name={name}
      value={value || ""}
      onChange={onChange}
      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all placeholder:text-gray-400"
      placeholder={`Enter ${label}`}
    />
  </div>
);

const EditModal = ({ onClose, formData, setFormData, onSubmit }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl max-h-[85vh] flex flex-col overflow-hidden"
      >
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-lg text-gray-800">Edit Profile</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition">
            <FaTimes />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          <form
            className="grid grid-cols-1 md:grid-cols-2 gap-5"
            onSubmit={(e) => { e.preventDefault(); onSubmit(); }}
          >
            <FormField label="First Name"    name="firstName"    value={formData.firstName}    onChange={handleChange} />
            <FormField label="Last Name"     name="lastName"     value={formData.lastName}     onChange={handleChange} />
            <FormField label="Display Name"  name="displayName"  value={formData.displayName}  onChange={handleChange} />
            <FormField label="Age"           name="age"          type="number" value={formData.age} onChange={handleChange} />
            <div className="md:col-span-2 grid grid-cols-2 gap-5">
              <FormField label="Height (cm)" name="height" type="number" value={formData.height} onChange={handleChange} />
              <FormField label="Weight (kg)" name="weight" type="number" value={formData.weight} onChange={handleChange} />
            </div>
            <FormField label="Position" name="position" value={formData.position} onChange={handleChange} />
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Dominant Foot</label>
              <select
                name="dominantFoot"
                value={formData.dominantFoot}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
              >
                <option value="">Select Foot</option>
                <option value="Right">Right</option>
                <option value="Left">Left</option>
                <option value="Both">Both</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Bio</label>
              <textarea
                name="bio"
                rows="3"
                value={formData.bio}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-green-500 outline-none resize-none"
              />
            </div>
          </form>
        </div>

        <div className="p-5 border-t border-gray-100 bg-white flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl text-gray-600 font-bold hover:bg-gray-50 transition">
            Cancel
          </button>
          <button onClick={onSubmit} className="px-8 py-2.5 rounded-xl bg-green-600 text-white font-bold shadow-lg shadow-green-200 hover:bg-green-700 transition">
            Save Changes
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ── Main component ──────────────────────────────────────────────────────────
export default function ProfileTab() {
  const dm     = useSelector((state) => state.theme.darkMode);
  const player = useSelector((state) => state.player.profile);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    firstName:     player?.firstName     || "",
    lastName:      player?.lastName      || "",
    displayName:   player?.displayName   || "",
    age:           player?.age           || "",
    gender:        player?.gender        || "",
    position:      player?.position      || "",
    height:        player?.height        || "",
    weight:        player?.weight        || "",
    dominantFoot:  player?.dominantFoot  || "",
    bio:           player?.bio           || "",
  });

  const handleUpdate = async () => {
    await dispatch(updatePlayerProfile(formData));
    setShowEditModal(false);
  };

  if (!player) {
    return (
      <SectionWrapper dm={dm}>
        <div className="text-center py-16 px-4">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl ${dm ? "bg-green-950/50 text-green-400" : "bg-green-100 text-green-600"}`}>
            <FaUser />
          </div>
          <h3 className={`text-xl font-bold ${dm ? "text-gray-100" : "text-gray-900"}`}>Incomplete Profile</h3>
          <p className={`max-w-sm mx-auto mt-2 mb-6 ${dm ? "text-gray-400" : "text-gray-500"}`}>
            Complete your profile to unlock stats, academy features, and tournament tracking.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/profile-complete")}
            className="bg-green-600 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-green-200 hover:bg-green-700 transition"
          >
            Complete Now
          </motion.button>
        </div>
      </SectionWrapper>
    );
  }

  return (
    <>
      <SectionWrapper dm={dm}>
        <div className="flex justify-between items-start mb-8">
          <div>
            <h3 className={`text-2xl font-bold ${dm ? "text-gray-100" : "text-gray-900"}`}>About {player.firstName}</h3>
            <p className={`text-sm mt-1 ${dm ? "text-gray-500" : "text-gray-500"}`}>Manage your personal details and bio.</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowEditModal(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition-colors ${dm ? "bg-[#1a1a1a] border border-green-900/30 text-gray-300 hover:border-yellow-500/50 hover:text-yellow-400" : "bg-white border border-gray-200 text-gray-700 hover:border-green-400 hover:text-green-600"}`}
          >
            <FaPen className="text-xs" /> Edit
          </motion.button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <InfoCard label="Full Name"   value={`${player.firstName} ${player.lastName}`} dm={dm} />
          <InfoCard label="Age"         value={`${player.age} Years`} dm={dm} />
          <InfoCard label="Gender"      value={player.gender} dm={dm} />
          <InfoCard label="Experience"  value={player.experienceLevel} highlight dm={dm} />

          <div className="md:col-span-2 grid grid-cols-3 gap-4 mt-2">
            {[
              { label: "Height", value: player.height, unit: "cm" },
              { label: "Weight", value: player.weight, unit: "kg" },
              { label: "Foot",   value: player.dominantFoot, unit: null },
            ].map(({ label, value, unit }) => (
              <div key={label} className={`rounded-2xl p-4 text-center border ${dm ? "bg-green-950/30 border-green-900/30" : "bg-green-50 border-green-100"}`}>
                <p className={`text-xs uppercase font-bold tracking-wider ${dm ? "text-gray-500" : "text-gray-500"}`}>{label}</p>
                <p className={`text-lg font-bold mt-1 ${dm ? "text-gray-100" : "text-gray-900"}`}>
                  {value || "-"}{" "}
                  {unit && <span className={`text-xs font-normal ${dm ? "text-gray-500" : "text-gray-400"}`}>{unit}</span>}
                </p>
              </div>
            ))}
          </div>

          <div className="md:col-span-2 mt-4">
            <h4 className={`text-sm font-bold mb-3 ${dm ? "text-gray-200" : "text-gray-900"}`}>Bio</h4>
            <div className={`p-5 rounded-2xl border text-sm leading-relaxed italic ${dm ? "bg-[#1a1a1a] border-green-900/20 text-gray-400" : "bg-gray-50 border-gray-100 text-gray-600"}`}>
              "{player.bio || "No bio added yet. Click edit to add a description about your playing style."}"
            </div>
          </div>
        </div>
      </SectionWrapper>

      <AnimatePresence>
        {showEditModal && (
          <EditModal
            onClose={() => setShowEditModal(false)}
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleUpdate}
          />
        )}
      </AnimatePresence>
    </>
  );
}
