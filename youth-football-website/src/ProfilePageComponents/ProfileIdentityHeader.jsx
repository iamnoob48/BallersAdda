import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FaPen, FaTimes, FaUser } from "react-icons/fa";
import { FiMapPin, FiCalendar, FiCamera } from "react-icons/fi";
import { Zap } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { uploadProfilePic } from "../redux/slices/playerSlice";
import { useNavigate } from "react-router-dom";

function ProfilePicModal({ onClose }) {
  const dispatch = useDispatch();
  const fileRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [base64, setBase64] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

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
        className="bg-white w-full max-w-md rounded-2xl shadow-[0_8px_0_0_rgba(0,0,0,0.08)] overflow-hidden font-['Nunito']"
      >
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="font-extrabold text-gray-800 text-lg">Update Profile Picture</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition">
            <FaTimes className="text-gray-600" />
          </button>
        </div>
        <div className="p-6 space-y-5">
          <div
            onClick={() => !uploading && fileRef.current.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); processFile(e.dataTransfer.files[0]); }}
            className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center overflow-hidden
              ${dragging ? "border-green-600 bg-green-50" : "border-gray-200 hover:border-green-600 bg-gray-50 hover:bg-green-50/40"}
              ${preview ? "h-56" : "h-48"}`}
          >
            {preview ? (
              <>
                <img src={preview} alt="preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <p className="text-white text-sm font-bold">Click to change</p>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 text-gray-400 select-none">
                <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-2xl"><FaUser /></div>
                <p className="text-sm font-bold text-gray-500">Click or drag & drop</p>
                <p className="text-xs text-gray-400">PNG, JPG, WEBP — max 5 MB</p>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => processFile(e.target.files[0])} />
          {error && <p className="text-sm text-red-500 font-bold text-center">{error}</p>}
        </div>
        <div className="px-6 pb-6 flex gap-3 justify-end">
          <button onClick={onClose} disabled={uploading} className="px-5 py-2.5 rounded-xl text-gray-600 font-extrabold hover:bg-gray-100 transition disabled:opacity-50">Cancel</button>
          <button onClick={handleSave} disabled={!base64 || uploading} className="px-6 py-2.5 rounded-xl bg-green-600 text-white font-extrabold shadow-[0_4px_0_0_#15803d] hover:bg-green-700 active:shadow-none active:translate-y-[4px] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
            {uploading ? (<><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Uploading...</>) : "Save"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function ProfileIdentityHeader({ dm, player, profilePic, user, academy, achievementData, onEditProfile }) {
  const [showUpload, setShowUpload] = useState(false);
  const navigate = useNavigate();

  const avatarSrc = profilePic || user?.profilePic || null;
  const displayName = player?.displayName || (player?.firstName ? `${player.firstName} ${player.lastName || ""}`.trim() : user?.username || "Player");
  const position = player?.position || null;
  const location = [player?.city, player?.state].filter(Boolean).join(", ") || player?.country || null;
  const joinDate = player?.createdAt ? new Date(player.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : null;
  const xp = achievementData?.xp ?? 0;
  const level = achievementData?.level ?? 1;

  if (!player) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl p-8 text-center shadow-[0_4px_0_0_rgba(0,0,0,0.06)] ${
          dm
            ? "bg-[#1a1a1a] border border-[#87A98D]/15"
            : "bg-white border border-gray-200"
        }`}
      >
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl ${dm ? "bg-[#00FF88]/10 text-[#00FF88]" : "bg-green-100 text-green-600"}`}>
          <FaUser />
        </div>
        <h3 className={`text-xl font-extrabold ${dm ? "text-gray-100" : "text-gray-900"}`}>Incomplete Profile</h3>
        <p className={`max-w-sm mx-auto mt-2 mb-6 ${dm ? "text-gray-400" : "text-gray-500"}`}>
          Complete your profile to unlock stats, badges, and tournament tracking.
        </p>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97, y: 4 }}
          onClick={() => navigate("/profile-complete")}
          className={`px-8 py-3 rounded-xl font-extrabold active:shadow-none active:translate-y-[4px] transition-all ${
            dm
              ? "bg-[#00FF88] text-[#121212] shadow-[0_4px_0_0_#00CC6A] hover:bg-[#33FF9F]"
              : "bg-green-600 text-white shadow-[0_4px_0_0_#15803d] hover:bg-green-700"
          }`}
        >
          Complete Now
        </motion.button>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl overflow-hidden shadow-[0_4px_0_0_rgba(0,0,0,0.06)] ${
          dm
            ? "bg-[#1a1a1a] border border-[#87A98D]/15"
            : "bg-white border border-gray-200"
        }`}
      >
        {/* Green gradient banner */}
        <div className={`h-24 relative ${
          dm
            ? "bg-gradient-to-r from-[#00FF88]/25 via-[#00FF88]/15 to-[#00FF88]/25"
            : "bg-gradient-to-r from-green-600 via-green-500 to-green-600"
        }`}>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9zdmc+')] opacity-50" />
        </div>

        <div className="px-6 pb-6 -mt-12">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className={`w-24 h-24 rounded-full border-4 flex items-center justify-center text-3xl font-extrabold overflow-hidden shadow-lg ${
                dm ? "border-[#1a1a1a] bg-[#00FF88]/10 text-[#00FF88]" : "border-white bg-green-50 text-green-600"
              }`}>
                {avatarSrc ? (
                  <img src={avatarSrc} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span>{player?.firstName?.[0] || user?.username?.[0] || "P"}</span>
                )}
              </div>
              <button
                onClick={() => setShowUpload(true)}
                className={`absolute bottom-0 right-0 p-2 rounded-full text-white active:shadow-none active:translate-y-[2px] transition-all ${
                  dm
                    ? "bg-[#00FF88] text-[#121212] shadow-[0_2px_0_0_#00CC6A] hover:bg-[#33FF9F]"
                    : "bg-green-600 shadow-[0_2px_0_0_#15803d] hover:bg-green-700"
                }`}
              >
                <FiCamera className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left pt-2">
              <h2 className={`text-2xl font-extrabold ${dm ? "text-gray-100" : "text-gray-900"}`}>
                {displayName}
              </h2>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
                {position && (
                  <span className={`inline-flex items-center gap-1 text-xs font-extrabold px-3 py-1 rounded-full ${
                    dm
                      ? "bg-[#00FF88]/10 text-[#00FF88] border border-[#00FF88]/20"
                      : "bg-green-50 text-green-700 border border-green-200"
                  }`}>
                    {position}
                  </span>
                )}
                <span className={`inline-flex items-center gap-1 text-xs font-extrabold px-3 py-1 rounded-full ${
                  dm
                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    : "bg-amber-50 text-amber-600 border border-amber-200"
                }`}>
                  <Zap className="w-3 h-3" /> Lvl {level} — {xp.toLocaleString()} XP
                </span>
              </div>
              <div className={`flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-2.5 text-xs font-semibold ${dm ? "text-gray-400" : "text-gray-500"}`}>
                {location && (
                  <span className="flex items-center gap-1.5">
                    <FiMapPin className="w-3.5 h-3.5" /> {location}
                  </span>
                )}
                {joinDate && (
                  <span className="flex items-center gap-1.5">
                    <FiCalendar className="w-3.5 h-3.5" /> Joined {joinDate}
                  </span>
                )}
                {academy && (
                  <span className={`flex items-center gap-1.5 font-bold ${dm ? "text-[#00FF88]" : "text-green-600"}`}>
                    {academy.name}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Edit Profile Button */}
          <div className="flex gap-3 mt-5 justify-center sm:justify-start">
            <motion.button
              whileTap={{ y: 4 }}
              onClick={onEditProfile}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-extrabold transition-all active:shadow-none active:translate-y-[4px] ${
                dm
                  ? "bg-[#00FF88] text-[#121212] shadow-[0_4px_0_0_#00CC6A] hover:bg-[#33FF9F]"
                  : "bg-green-600 text-white shadow-[0_4px_0_0_#15803d] hover:bg-green-700"
              }`}
            >
              <FaPen className="w-3 h-3" /> Edit Profile
            </motion.button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showUpload && <ProfilePicModal onClose={() => setShowUpload(false)} />}
      </AnimatePresence>
    </>
  );
}
