import { motion } from "motion/react";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowRight, FiMapPin } from "react-icons/fi";
import { GiSoccerBall, GiBootKick, GiTrophy, GiTShirt } from "react-icons/gi";
import { fetchPlayerProfile, fetchPlayerAcademy, fetchMyTournaments } from "../redux/slices/playerSlice";

const POSITION_ABBR = {
  GOALKEEPER: "GK",
  DEFENDER: "CB",
  MIDFIELDER: "CM",
  FORWARD: "FW",
  STRIKER: "ST",
  WINGER: "WG",
  FULLBACK: "FB",
  CENTREBACK: "CB",
  CENTRAL_MIDFIELDER: "CM",
  ATTACKING_MIDFIELDER: "AM",
  DEFENSIVE_MIDFIELDER: "DM",
};

const POSITION_LABEL = {
  GOALKEEPER: "Goalkeeper",
  DEFENDER: "Defender",
  MIDFIELDER: "Midfielder",
  FORWARD: "Forward",
  STRIKER: "Striker",
  WINGER: "Winger",
  FULLBACK: "Full Back",
  CENTREBACK: "Centre Back",
  CENTRAL_MIDFIELDER: "Central Mid",
  ATTACKING_MIDFIELDER: "Attacking Mid",
  DEFENSIVE_MIDFIELDER: "Defensive Mid",
};

const getPositionGroup = (position) => {
  if (!position) return "FORWARD";
  const attackers = ["STRIKER", "FORWARD", "WINGER"];
  const midfielders = ["MIDFIELDER", "ATTACKING_MIDFIELDER", "CENTRAL_MIDFIELDER", "DEFENSIVE_MIDFIELDER"];
  const defenders = ["DEFENDER", "FULLBACK", "CENTREBACK"];
  if (attackers.includes(position)) return "ATTACKER";
  if (midfielders.includes(position)) return "MIDFIELDER";
  if (defenders.includes(position)) return "DEFENDER";
  if (position === "GOALKEEPER") return "GOALKEEPER";
  return "FORWARD";
};

const calcAge = (dob) => {
  if (!dob) return null;
  const birth = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
};

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 60 } },
};
const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const getRatingColor = (rating) => {
  if (rating >= 8.0) return "text-green-400";
  if (rating >= 7.0) return "text-lime-400";
  return "text-amber-400";
};

export default function HeroHome({ user, profile, academy, loading, dm }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const academyStats = useSelector((state) => state.player.academyStats);
  const profilePic = useSelector((state) => state.player.profilePic);

  useEffect(() => {
    dispatch(fetchPlayerProfile());
    dispatch(fetchPlayerAcademy());
    dispatch(fetchMyTournaments());
  }, [dispatch]);

  const firstName = useMemo(() => {
    const name = user?.username || "Player";
    return name.split(/[#\s]/)[0];
  }, [user?.username]);

  const fullName = useMemo(() => {
    if (profile?.displayName) return profile.displayName;
    if (profile?.firstName) {
      return profile.lastName ? `${profile.firstName} ${profile.lastName}` : profile.firstName;
    }
    return user?.username?.split("#")[0] || "Player";
  }, [profile?.displayName, profile?.firstName, profile?.lastName, user?.username]);

  const hasAcademy = !!academy;
  const hasProfile = !!profile;

  const posAbbr = POSITION_ABBR[profile?.position] || null;
  const posLabel = POSITION_LABEL[profile?.position] || null;
  const posGroup = getPositionGroup(profile?.position);
  const age = calcAge(profile?.dateOfBirth);

  const rating = useMemo(() => {
    if (profile?.tournamentRatings && profile.tournamentRatings > 0) return profile.tournamentRatings;
    if (academyStats?.officialAvgRating && academyStats.officialAvgRating > 0) return academyStats.officialAvgRating;
    return 0;
  }, [profile?.tournamentRatings, academyStats?.officialAvgRating]);

  const bottomStats = useMemo(() => {
    const caps = academyStats?.officialCaps ?? null;
    const goals = academyStats?.officialGoals ?? null;
    const assists = academyStats?.officialAssists ?? null;
    const motm = academyStats?.officialMotm ?? null;

    const fmt = (v) => (v !== null && v !== undefined ? String(v).padStart(2, "0") : "—");

    switch (posGroup) {
      case "ATTACKER":
        return [
          { label: "Goals", val: fmt(goals), icon: GiSoccerBall },
          { label: "Assists", val: fmt(assists), icon: GiBootKick },
          { label: "M.O.M", val: motm !== null ? `${motm}x` : "—", icon: GiTrophy },
        ];
      case "MIDFIELDER":
        return [
          { label: "Assists", val: fmt(assists), icon: GiBootKick },
          { label: "Goals", val: fmt(goals), icon: GiSoccerBall },
          { label: "M.O.M", val: motm !== null ? `${motm}x` : "—", icon: GiTrophy },
        ];
      case "DEFENDER":
        return [
          { label: "Caps", val: fmt(caps), icon: GiTShirt },
          { label: "Goals", val: fmt(goals), icon: GiSoccerBall },
          { label: "M.O.M", val: motm !== null ? `${motm}x` : "—", icon: GiTrophy },
        ];
      case "GOALKEEPER":
        return [
          { label: "Caps", val: fmt(caps), icon: GiTShirt },
          { label: "M.O.M", val: motm !== null ? `${motm}x` : "—", icon: GiTrophy },
          { label: "Rating", val: rating > 0 ? rating.toFixed(1) : "—", icon: GiSoccerBall },
        ];
      default:
        return [
          { label: "Goals", val: fmt(goals), icon: GiSoccerBall },
          { label: "Assists", val: fmt(assists), icon: GiBootKick },
          { label: "M.O.M", val: motm !== null ? `${motm}x` : "—", icon: GiTrophy },
        ];
    }
  }, [posGroup, academyStats, rating]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const location = [profile?.city, profile?.state].filter(Boolean).join(", ") || profile?.country || null;

  const heightWeight = useMemo(() => {
    const parts = [];
    if (profile?.height) {
      const ft = Math.floor(profile.height / 30.48);
      const inch = Math.round((profile.height % 30.48) / 2.54);
      parts.push(`${ft}'${inch}"`);
    }
    if (profile?.weight) parts.push(`${Math.round(profile.weight)} kg`);
    return parts.length ? parts.join(", ") : null;
  }, [profile?.height, profile?.weight]);

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="relative pt-24 pb-32 px-6 sm:px-12 md:px-20 overflow-visible"
    >
      {/* Background */}
      <div className={`absolute inset-0 -z-20 ${dm ? "bg-gradient-to-br from-[#0a1a0f] via-[#121212] to-[#0f1f1a]" : "bg-gradient-to-br from-green-50 via-white to-emerald-100"}`} />
      <motion.div
        animate={{ scale: [1, 1.1, 1], x: [0, 20, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
        className={`absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-3xl -z-10 ${dm ? "bg-gradient-to-bl from-[#00FF88]/10 to-[#00DCFF]/5" : "bg-gradient-to-bl from-green-200/40 to-emerald-300/30"}`}
      />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
        {/* LEFT: Welcome + CTA */}
        <div className="flex-1 text-center md:text-left space-y-6 z-10">
          <motion.div variants={fadeInUp} className="space-y-3">
            <p className={`text-lg ${dm ? "text-gray-500" : "text-gray-500"}`}>
              {getGreeting()},
            </p>
            <h1 className={`text-4xl md:text-5xl font-extrabold leading-tight ${dm ? "text-gray-100" : "text-gray-900"}`}>
              Welcome back,{" "}
              <span className={`text-transparent bg-clip-text ${dm ? "bg-gradient-to-r from-[#00FF88] to-[#00DCFF]" : "bg-gradient-to-r from-green-600 to-emerald-500"}`}>
                {firstName} 👋
              </span>
            </h1>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-2"
          >
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: dm ? "0px 10px 20px rgba(0, 255, 136, 0.15)" : "0px 10px 20px rgba(22, 163, 74, 0.2)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/tournaments")}
              className={`px-8 py-3.5 rounded-xl font-bold text-lg shadow-xl transition-all flex items-center justify-center gap-2 ${dm ? "bg-[#00FF88] text-[#121212] hover:bg-[#00FF88]/90" : "bg-green-600 text-white hover:bg-green-700"}`}
            >
              Browse Tournaments
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => hasAcademy ? navigate("/my-academy") : navigate("/academies")}
              className={`px-8 py-3.5 rounded-xl font-bold text-lg shadow-sm transition-all border-2 ${dm ? "bg-transparent border-[#87A98D]/30 text-[#00FF88] hover:bg-[#00FF88]/10" : "bg-white border-green-100 text-green-700 hover:bg-green-50"}`}
            >
              {hasAcademy ? "View Academy" : "Find Academy"}
            </motion.button>
          </motion.div>

          {/* Complete profile CTA */}
          {!hasProfile && !loading && (
            <motion.div
              variants={fadeInUp}
              className={`mt-2 p-4 rounded-2xl border flex items-center justify-between gap-4 ${dm ? "bg-[#1a1a1a] border-[#87A98D]/15" : "bg-white border-gray-200 shadow-sm"}`}
            >
              <div>
                <h3 className={`font-bold text-sm ${dm ? "text-gray-100" : "text-gray-900"}`}>Complete your player profile</h3>
                <p className={`text-xs ${dm ? "text-gray-500" : "text-gray-500"}`}>Add your position, stats, and bio.</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/profile-complete")}
                className={`px-4 py-2 rounded-xl font-semibold text-sm whitespace-nowrap flex items-center gap-2 ${dm ? "bg-[#00FF88] text-[#121212]" : "bg-green-600 text-white"}`}
              >
                Complete <FiArrowRight />
              </motion.button>
            </motion.div>
          )}
        </div>

        {/* RIGHT: Sports Player Card */}
        <motion.div variants={fadeInUp} className="relative flex-1 w-full max-w-sm">
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-10"
          >
            <motion.div
              whileHover={{ scale: 1.03, boxShadow: dm ? "0 0 50px rgba(0,255,136,0.3)" : "0 8px 40px rgba(22,163,74,0.25)" }}
              transition={{ duration: 0.3 }}
              className={`relative rounded-3xl p-[2px] overflow-hidden ${dm ? "bg-gradient-to-b from-[#00FF88] via-[#00DCFF]/60 to-[#00FF88] shadow-[0_0_30px_rgba(0,255,136,0.2)]" : "bg-gradient-to-b from-green-400 via-emerald-500 to-green-600 shadow-xl shadow-green-200/60"}`}
            >
              <div className={`relative rounded-[22px] overflow-hidden ${dm ? "bg-[#111]" : "bg-white"}`}>

                {/* Profile Header Area */}
                <div className={`relative w-full pt-8 pb-4 flex flex-col items-center ${dm ? "bg-gradient-to-b from-[#0a2a1a] to-[#111]" : "bg-gradient-to-b from-green-50 to-white"}`}>
                   <div className={`relative w-28 h-28 rounded-full p-[3px] mb-3 ${dm ? "bg-gradient-to-tr from-[#00FF88] to-[#00DCFF]" : "bg-gradient-to-tr from-green-400 to-emerald-500"}`}>
                      <div className={`w-full h-full rounded-full overflow-hidden border-4 ${dm ? "border-[#111]" : "border-white"}`}>
                        {profilePic ? (
                          <img
                            src={profilePic}
                            alt={fullName}
                            className="w-full h-full object-cover object-center"
                          />
                        ) : (
                          <div className={`w-full h-full flex items-center justify-center text-4xl font-black ${dm ? "bg-[#222] text-[#00FF88]" : "bg-green-50 text-green-600"}`}>
                            {firstName[0]?.toUpperCase()}
                          </div>
                        )}
                      </div>
                   </div>

                   {/* Level and XP */}
                   <div className="w-full px-8 mt-1 flex flex-col items-center">
                     <div className="flex justify-between w-full text-xs font-bold mb-1.5">
                       <span className={dm ? "text-gray-300" : "text-gray-600"}>Level {profile?.level || 1}</span>
                       <span className={dm ? "text-[#00FF88]" : "text-green-600"}>{profile?.exp || 150} / {profile?.expNext || 500} XP</span>
                     </div>
                     <div className={`w-full h-2 rounded-full overflow-hidden ${dm ? "bg-gray-800" : "bg-gray-200"}`}>
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${Math.min(100, (((profile?.exp || 150) / (profile?.expNext || 500)) * 100))}%` }}
                         transition={{ duration: 1, ease: "easeOut" }}
                         className={`h-full rounded-full ${dm ? "bg-gradient-to-r from-[#00FF88] to-[#00DCFF]" : "bg-gradient-to-r from-green-400 to-emerald-500"}`}
                       />
                     </div>
                   </div>

                  {/* Position badge — top left */}
                  {posAbbr && (
                    <div className={`absolute top-4 left-4 px-2.5 py-1 rounded-lg text-xs font-black tracking-wide backdrop-blur-md ${dm ? "bg-[#00FF88]/20 text-[#00FF88] border border-[#00FF88]/30" : "bg-green-100 text-green-700"}`}>
                      {posAbbr}
                    </div>
                  )}

                  {/* Rating — top right */}
                  {rating > 0 && (
                    <div className={`absolute top-4 right-4 px-3 py-1.5 rounded-xl backdrop-blur-md border ${dm ? "bg-black/50 border-white/10" : "bg-white border-gray-200 shadow-sm"}`}>
                      <p className={`text-lg font-black leading-none ${getRatingColor(rating)}`}>
                        {rating.toFixed(1)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Info Section */}
                <div className="px-5 pb-5 pt-3">
                  {/* Name + Position */}
                  <div className="mb-4 text-center">
                    <h3 className={`text-2xl font-black tracking-tight leading-tight ${dm ? "text-white" : "text-gray-900"}`}>
                      {fullName}
                    </h3>
                    {posLabel && (
                      <p className={`text-sm font-semibold mt-1 ${dm ? "text-[#00FF88]/70" : "text-green-600"}`}>
                        {posLabel}
                      </p>
                    )}
                  </div>

                  {/* Info Row — Location, Age, Height/Weight */}
                  <div className={`flex items-center justify-center gap-4 text-xs font-semibold pb-4 border-b ${dm ? "text-gray-400 border-white/10" : "text-gray-500 border-gray-100"}`}>
                    {location && (
                      <div className="flex items-center gap-1">
                        <FiMapPin className="w-3 h-3" />
                        <span>{location}</span>
                      </div>
                    )}
                    {age && (
                      <div className="flex items-center gap-1">
                        <span className={`font-black ${dm ? "text-white" : "text-gray-800"}`}>{age}</span>
                        <span>YRS</span>
                      </div>
                    )}
                    {heightWeight && (
                      <span>{heightWeight}</span>
                    )}
                  </div>

                  {/* Stats Grid — Position Personalized */}
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    {bottomStats.map((s, i) => {
                      const Icon = s.icon;
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.8 + i * 0.12 }}
                          className={`rounded-xl p-3 text-center ${dm ? "bg-white/[0.05] border border-white/[0.08]" : "bg-gray-50 border border-gray-100"}`}
                        >
                          <div className="flex items-center justify-center gap-1 mb-1.5">
                            <Icon className={`w-3 h-3 ${dm ? "text-[#00FF88]/60" : "text-green-500/60"}`} />
                            <p className={`text-[10px] font-bold uppercase tracking-wider ${dm ? "text-gray-500" : "text-gray-400"}`}>
                              {s.label}
                            </p>
                          </div>
                          <p className={`text-2xl font-black ${dm ? "text-white" : "text-gray-900"}`}>{s.val}</p>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* External glows */}
            <div className={`absolute -z-10 top-10 -right-10 w-24 h-24 rounded-full blur-2xl opacity-20 animate-pulse ${dm ? "bg-[#00FF88]" : "bg-green-400"}`} />
            <div className={`absolute -z-10 -bottom-5 -left-5 w-32 h-32 rounded-full blur-3xl opacity-20 ${dm ? "bg-[#00DCFF]" : "bg-emerald-300"}`} />
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
}
