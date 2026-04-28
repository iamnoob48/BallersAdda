import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUser, FaTrophy, FaSchool, FaChartLine, FaMedal, FaCog, FaPen, FaTimes,
} from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { uploadProfilePic } from "../redux/slices/playerSlice";

const sections = [
  { key: "personal",     icon: <FaUser />,      label: "Profile"     },
  { key: "tournaments",  icon: <FaTrophy />,    label: "Tournaments" },
  { key: "academy",      icon: <FaSchool />,    label: "Academy"     },
  { key: "performance",  icon: <FaChartLine />, label: "Stats"       },
  { key: "achievements", icon: <FaMedal />,     label: "Badges"      },
  { key: "settings",     icon: <FaCog />,       label: "Settings"    },
];

// ── Profile Picture Upload Modal ────────────────────────────────────────────
function ProfilePicModal({ onClose }) {
  const dispatch   = useDispatch();
  const fileRef    = useRef(null);
  const [preview, setPreview]   = useState(null);
  const [base64,  setBase64]    = useState(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError]       = useState(null);

  const processFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Only image files allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Max file size is 5 MB.");
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
      setBase64(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => processFile(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    processFile(e.dataTransfer.files[0]);
  };

  const handleSave = async () => {
    if (!base64) return;
    setUploading(true);
    try {
      await dispatch(uploadProfilePic(base64)).unwrap();
      onClose();
    } catch (err) {
      setError(err || "Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="font-bold text-gray-800 text-lg">Update Profile Picture</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition">
            <FaTimes className="text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Drop zone / preview */}
          <div
            onClick={() => !uploading && fileRef.current.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center overflow-hidden
              ${dragging ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-green-400 bg-gray-50 hover:bg-green-50/40"}
              ${preview ? "h-56" : "h-48"}`}
          >
            {preview ? (
              <>
                <img src={preview} alt="preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <p className="text-white text-sm font-semibold">Click to change</p>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 text-gray-400 select-none">
                <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-2xl">
                  <FaUser />
                </div>
                <p className="text-sm font-semibold text-gray-500">Click or drag & drop</p>
                <p className="text-xs text-gray-400">PNG, JPG, WEBP — max 5 MB</p>
              </div>
            )}
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          {error && (
            <p className="text-sm text-red-500 font-medium text-center">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={uploading}
            className="px-5 py-2.5 rounded-xl text-gray-600 font-bold hover:bg-gray-100 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!base64 || uploading}
            className="px-6 py-2.5 rounded-xl bg-green-600 text-white font-bold shadow-md shadow-green-200 hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {uploading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Uploading…
              </>
            ) : "Save"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Left Sidebar ────────────────────────────────────────────────────────────
export default function LeftCardProfile({ activeSection, setActiveSection }) {
  const dm         = useSelector((state) => state.theme.darkMode);
  const player     = useSelector((state) => state.player.profile);
  const profilePic = useSelector((state) => state.player.profilePic);
  const user       = useSelector((state) => state.auth.user);
  const isPlayerData = Boolean(player);

  const [showUpload, setShowUpload] = useState(false);

  const avatarSrc = profilePic || user?.profilePic || null;

  return (
    <>
      <motion.aside
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="md:w-1/4 flex-shrink-0"
      >
        {/* Profile card */}
        <div className={`rounded-3xl p-6 shadow-xl relative overflow-hidden group transition-colors duration-300 ${dm ? "bg-[#141414] border border-green-900/30 shadow-green-950/30" : "bg-white border border-green-50 shadow-green-100/50"}`}>
          <div className={`absolute top-0 left-0 w-full h-24 ${dm ? "bg-gradient-to-br from-green-800 to-emerald-950" : "bg-gradient-to-br from-green-400 to-emerald-600"}`} />

          <div className="relative flex flex-col items-center mt-8">
            <div className="relative">
              <div className={`w-28 h-28 rounded-full border-4 flex items-center justify-center text-4xl font-bold shadow-md overflow-hidden transition-colors duration-300 ${dm ? "border-[#1a1a1a] bg-green-950/50 text-green-400" : "border-white bg-green-50 text-green-600"}`}>
                {avatarSrc ? (
                  <img src={avatarSrc} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span>{player?.firstName?.[0] || user?.username?.[0] || "P"}</span>
                )}
              </div>
              {isPlayerData && (
                <button
                  onClick={() => setShowUpload(true)}
                  className={`absolute bottom-1 right-1 p-2 rounded-full text-xs shadow-lg hover:scale-110 transition ${dm ? "bg-green-700 text-white hover:bg-green-600" : "bg-gray-900 text-white hover:bg-gray-700"}`}
                  title="Edit profile picture"
                >
                  <FaPen />
                </button>
              )}
            </div>

            <h2 className={`mt-4 text-xl font-extrabold ${dm ? "text-gray-100" : "text-gray-900"}`}>
              {player?.displayName || user?.username || "Guest Player"}
            </h2>
            <p className={`text-sm font-medium px-3 py-1 rounded-full mt-1 border ${dm ? "text-green-400 bg-green-950/50 border-green-800/50" : "text-green-600 bg-green-50 border-green-100"}`}>
              {player?.position || "Position Unassigned"}
            </p>
          </div>

          {/* Desktop vertical nav */}
          <nav className="mt-8 space-y-1 hidden md:block">
            {sections.map((s) => (
              <button
                key={s.key}
                disabled={!isPlayerData && s.key !== "personal"}
                onClick={() => setActiveSection(s.key)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group/btn ${
                  activeSection === s.key
                    ? (dm ? "bg-green-700 text-yellow-300 shadow-lg shadow-green-900/40" : "bg-green-600 text-white shadow-lg shadow-green-200")
                    : (dm ? "text-gray-400 hover:bg-green-950/40 hover:text-green-400 disabled:opacity-40 disabled:cursor-not-allowed" : "text-gray-500 hover:bg-green-50 hover:text-green-700 disabled:opacity-40 disabled:cursor-not-allowed")
                }`}
              >
                <span className={`text-lg transition-transform group-hover/btn:scale-110 ${activeSection === s.key ? (dm ? "text-yellow-300" : "text-white") : (dm ? "text-green-600" : "text-green-500")}`}>
                  {s.icon}
                </span>
                {s.label}
                {activeSection === s.key && (
                  <motion.div layoutId="active-pill" className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Mobile horizontal scroll nav */}
        <div className={`md:hidden mt-6 -mx-4 px-4 overflow-x-auto no-scrollbar flex gap-3 pb-2 sticky top-2 z-40 backdrop-blur-md py-2 ${dm ? "bg-[#0a0a0a]/90" : "bg-[#F0FDF4]/90"}`}>
          {sections.map((s) => (
            <button
              key={s.key}
              disabled={!isPlayerData && s.key !== "personal"}
              onClick={() => setActiveSection(s.key)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${
                activeSection === s.key
                  ? (dm ? "bg-green-700 text-yellow-300 border-green-700 shadow-md" : "bg-green-600 text-white border-green-600 shadow-md")
                  : (dm ? "bg-[#1a1a1a] text-gray-400 border-green-900/30" : "bg-white text-gray-600 border-gray-200")
              } disabled:opacity-50`}
            >
              {s.icon} {s.label}
            </button>
          ))}
        </div>
      </motion.aside>

      <AnimatePresence>
        {showUpload && <ProfilePicModal onClose={() => setShowUpload(false)} />}
      </AnimatePresence>
    </>
  );
}
