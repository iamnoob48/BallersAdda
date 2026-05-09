import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion, useAnimation } from "framer-motion";
import { FaCrown, FaTrophy } from "react-icons/fa";
import { ChevronLeft } from "lucide-react";
import { useGetPlayerLeaderboardQuery } from "../redux/slices/leaderboardApi.js";

const POSITIONS = [
  { key: "OVERALL", label: "Overall" },
  { key: "GOALKEEPER", label: "GK" },
  { key: "DEFENDER", label: "DEF" },
  { key: "MIDFIELDER", label: "MID" },
  { key: "ATTACKER", label: "ATT" },
];

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("") || "?";

const Avatar = ({ src, name, sizeClass = "w-12 h-12", textClass = "text-sm", dm }) => {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizeClass} rounded-full object-cover border-2 ${dm ? "border-[#87A98D]/30" : "border-emerald-200"
          }`}
      />
    );
  }
  return (
    <div
      className={`${sizeClass} ${textClass} rounded-full flex items-center justify-center font-semibold ${dm ? "bg-[#2a2a2a] text-[#00FF88] border-2 border-[#87A98D]/30" : "bg-emerald-100 text-emerald-700 border-2 border-emerald-200"
        }`}
    >
      {getInitials(name)}
    </div>
  );
};

const RankBadge = ({ rank }) => {
  const colors =
    rank === 1
      ? "bg-yellow-400 text-black"
      : rank === 2
        ? "bg-gray-400 text-black"
        : "bg-orange-400 text-black";
  return (
    <div
      className={`absolute -bottom-2 left-1/2 -translate-x-1/2 ${colors} w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-md`}
    >
      {rank}
    </div>
  );
};

const PodiumCard = ({ entry, isFirst, isMe, dm }) => {
  const crownControls = useAnimation();
  const [hovered, setHovered] = useState(false);

  const handleHoverStart = useCallback(() => {
    setHovered(true);
    if (isFirst) {
      crownControls.start({
        y: -12,
        scale: 1.25,
        rotate: [0, -6, 6, -3, 0],
        transition: {
          y: { type: "spring", stiffness: 260, damping: 12 },
          scale: { type: "spring", stiffness: 260, damping: 12 },
          rotate: { type: "tween", duration: 0.4, ease: "easeInOut" },
        },
      });
    }
  }, [isFirst, crownControls]);

  const handleHoverEnd = useCallback(() => {
    setHovered(false);
    if (isFirst) {
      crownControls.start({
        y: 0,
        scale: 1,
        rotate: 0,
        transition: { type: "spring", stiffness: 300, damping: 18 },
      });
    }
  }, [isFirst, crownControls]);

  if (!entry) {
    return (
      <div className="flex flex-col items-center opacity-30">
        <div className={`${isFirst ? "w-[72px] h-[72px] sm:w-20 sm:h-20" : "w-14 h-14 sm:w-16 sm:h-16"} rounded-full ${dm ? "bg-[#2a2a2a]" : "bg-gray-200"}`} />
        <div className="mt-3 text-xs">—</div>
      </div>
    );
  }
  const { player, stats, rank } = entry;
  const points = (stats?.compositeScore ?? 0).toFixed(1);

  return (
    <motion.div
      onHoverStart={handleHoverStart}
      onHoverEnd={handleHoverEnd}
      onTapStart={handleHoverStart}
      animate={{ scale: hovered ? 1.08 : 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`flex flex-col items-center cursor-pointer ${isFirst ? "-mt-4 sm:-mt-6" : ""}`}
    >
      <div className="relative">
        {isFirst && (
          <motion.div
            animate={crownControls}
            className="absolute left-1/2 -translate-x-1/2 -top-7 z-10 pointer-events-none"
          >
            <FaCrown className="text-yellow-400 text-2xl sm:text-3xl drop-shadow-lg" />
          </motion.div>
        )}
        <Avatar
          src={player?.profilePic}
          name={player?.displayName}
          sizeClass={isFirst ? "w-[72px] h-[72px] sm:w-20 sm:h-20" : "w-14 h-14 sm:w-16 sm:h-16"}
          textClass={isFirst ? "text-base sm:text-lg" : "text-sm sm:text-base"}
          dm={dm}
        />
        <RankBadge rank={rank} />
      </div>
      <div
        className={`mt-3 sm:mt-4 text-xs sm:text-sm font-semibold text-center max-w-[80px] sm:max-w-[90px] truncate ${isMe
            ? dm
              ? "text-[#00FF88]"
              : "text-emerald-700"
            : dm
              ? "text-white"
              : "text-gray-900"
          }`}
        title={player?.displayName}
      >
        {player?.displayName}
        {isMe && <span className="ml-1 text-[10px] sm:text-xs">(You)</span>}
      </div>
      <div className={`text-[10px] sm:text-xs mt-0.5 sm:mt-1 ${dm ? "text-gray-400" : "text-gray-500"}`}>
        {points} pts
      </div>
    </motion.div>
  );
};

const ListRow = ({ entry, isMe, dm, index }) => {
  const { player, stats, rank } = entry;
  const goals = stats?.totalGoals ?? 0;
  const assists = stats?.totalAssists ?? 0;
  const rating = (stats?.avgRating ?? 0).toFixed(1);

  const baseRow = dm ? "bg-[#2a2a2a]" : "bg-gray-100";
  const meRow = dm ? "bg-[#00FF88] text-[#121212]" : "bg-emerald-500 text-white";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.04 * index }}
      whileHover={isMe ? {} : { x: 4 }}
      className={`flex items-center gap-2.5 sm:gap-3 rounded-xl px-2.5 sm:px-3 py-2 sm:py-2.5 min-h-[48px] ${isMe ? meRow : baseRow
        }`}
    >
      <div
        className={`w-6 sm:w-7 text-center font-bold text-xs sm:text-sm shrink-0 ${isMe ? "" : dm ? "text-gray-300" : "text-gray-600"
          }`}
      >
        {rank}
      </div>
      <Avatar src={player?.profilePic} name={player?.displayName} sizeClass="w-8 h-8 sm:w-9 sm:h-9" textClass="text-xs" dm={dm} />
      <div className="flex-1 min-w-0">
        <div className={`font-semibold text-xs sm:text-sm truncate ${isMe ? "" : dm ? "text-white" : "text-gray-900"}`}>
          {player?.displayName}
          {isMe && <span className="ml-1 text-[10px] sm:text-xs opacity-80">(You)</span>}
        </div>
        <div className={`text-[10px] sm:text-xs ${isMe ? "opacity-90" : dm ? "text-gray-400" : "text-gray-500"}`}>
          {goals}G {assists}A · {rating}⭐
        </div>
      </div>
      <div className={`text-xs sm:text-sm font-bold shrink-0 ${isMe ? "" : dm ? "text-[#00FF88]" : "text-emerald-600"}`}>
        {(stats?.compositeScore ?? 0).toFixed(1)}
      </div>
    </motion.div>
  );
};

const PodiumSkeleton = ({ dm }) => {
  const baseColor = dm ? "bg-[#2a2a2a]" : "bg-gray-200";
  return (
    <div className="flex items-end justify-around gap-3 py-8">
      {[16, 20, 16].map((s, i) => (
        <div key={i} className="flex flex-col items-center animate-pulse">
          <div className={`${i === 1 ? "w-20 h-20" : "w-16 h-16"} rounded-full ${baseColor}`} />
          <div className={`mt-3 h-3 w-16 rounded ${baseColor}`} />
          <div className={`mt-2 h-2 w-10 rounded ${baseColor}`} />
        </div>
      ))}
    </div>
  );
};

const ListSkeleton = ({ dm }) => {
  const baseColor = dm ? "bg-[#2a2a2a]" : "bg-gray-200";
  return (
    <div className="space-y-2">
      {Array.from({ length: 7 }).map((_, i) => (
        <div
          key={i}
          className={`h-14 rounded-xl ${baseColor} animate-pulse`}
          style={{ animationDelay: `${i * 60}ms` }}
        />
      ))}
    </div>
  );
};

const Pill = ({ active, disabled, onClick, children, dm, title }) => {
  const activeCls = dm ? "bg-[#00FF88] text-[#121212]" : "bg-emerald-600 text-white";
  const idleCls = dm
    ? "bg-[#1a1a1a] text-gray-300 border border-[#87A98D]/15"
    : "bg-gray-50 text-gray-700 border border-gray-200";
  const disabledCls = "opacity-40 cursor-not-allowed";
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      title={title}
      className={`px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-colors ${active ? activeCls : idleCls
        } ${disabled ? disabledCls : ""}`}
    >
      {children}
    </button>
  );
};

const LeaderboardPage = () => {
  const navigate = useNavigate();
  const profile = useSelector((s) => s.player?.profile);

  const dm = useSelector((s) => s.theme.darkMode);
  const meId = profile?.id;

  const initialScope = profile?.city ? "REGIONAL" : "NATIONAL";
  const [scope, setScope] = useState(initialScope);
  const [position, setPosition] = useState("OVERALL");
  const [page] = useState(1);

  useEffect(() => {
    if (scope === "REGIONAL" && !profile?.city) setScope("NATIONAL");
    if (scope === "STATE" && !profile?.state) setScope("NATIONAL");
  }, [scope, profile?.city, profile?.state]);

  const scopeValue =
    scope === "REGIONAL"
      ? profile?.city || "Mumbai"
      : scope === "STATE"
        ? profile?.state || "Maharashtra"
        : "India";

  const { data, isLoading, isFetching, isError, refetch } = useGetPlayerLeaderboardQuery({
    scope,
    scopeValue,
    position,
    page,
    limit: 10,
  });

  const leaderboard = data?.leaderboard ?? [];
  const myEntry = data?.myEntry ?? null;

  const top3 = leaderboard.slice(0, 3);
  const rank1 = top3.find((e) => e.rank === 1) ?? top3[0];
  const rank2 = top3.find((e) => e.rank === 2) ?? top3[1];
  const rank3 = top3.find((e) => e.rank === 3) ?? top3[2];
  const restRows = leaderboard.slice(3, 10);

  const inTop10 = !!leaderboard.slice(0, 10).find((r) => r.player?.id === meId);
  const showPinnedMe = myEntry && !inTop10;

  const positionLabel = POSITIONS.find((p) => p.key === position)?.label ?? "Overall";
  const scopeLabel =
    scope === "REGIONAL" ? scopeValue : scope === "STATE" ? scopeValue : "India";

  return (
    <div className={`min-h-screen pb-28 sm:pb-24 ${dm ? "bg-[#121212]" : "bg-white"}`}>
      <div className="max-w-lg mx-auto px-3 sm:px-4 pt-20 sm:pt-24">
        <div className="relative flex items-center justify-center mb-4 sm:mb-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Back"
            className={`absolute left-0 p-2 rounded-full transition-colors ${dm ? "hover:bg-[#1a1a1a] text-white" : "hover:bg-gray-100 text-gray-700"
              }`}
          >
            <ChevronLeft size={22} />
          </button>
          <div className="text-center">
            <h1 className={`text-xl font-bold ${dm ? "text-white" : "text-gray-900"}`}>
              Leaderboard
            </h1>
            <p className={`text-xs mt-0.5 ${dm ? "text-gray-400" : "text-gray-500"}`}>
              {scopeLabel} · {positionLabel}
            </p>
          </div>
          <FaTrophy
            className={`absolute right-0 ${dm ? "text-[#00FF88]" : "text-emerald-600"}`}
            size={20}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl p-4 mb-4 ${dm
              ? "bg-[#1a1a1a] border border-[#87A98D]/15"
              : "bg-gray-50 border border-gray-200 shadow-sm"
            }`}
        >
          <div className="flex justify-center gap-1.5 sm:gap-2 mb-2.5 sm:mb-3">
            <Pill
              active={scope === "REGIONAL"}
              disabled={!profile?.city}
              onClick={() => setScope("REGIONAL")}
              dm={dm}
              title={!profile?.city ? "Complete your profile to see regional ranking" : ""}
            >
              Regional
            </Pill>
            <Pill
              active={scope === "STATE"}
              disabled={!profile?.state}
              onClick={() => setScope("STATE")}
              dm={dm}
              title={!profile?.state ? "Complete your profile to see state ranking" : ""}
            >
              State
            </Pill>
            <Pill active={scope === "NATIONAL"} onClick={() => setScope("NATIONAL")} dm={dm}>
              National
            </Pill>
          </div>

          <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
            {POSITIONS.map((p) => (
              <Pill
                key={p.key}
                active={position === p.key}
                onClick={() => setPosition(p.key)}
                dm={dm}
              >
                {p.label}
              </Pill>
            ))}
          </div>
        </motion.div>

        {isError ? (
          <div
            className={`rounded-2xl p-8 text-center ${dm ? "bg-[#1a1a1a] border border-[#87A98D]/15" : "bg-gray-50 border border-gray-200"
              }`}
          >
            <p className={`mb-4 ${dm ? "text-gray-300" : "text-gray-700"}`}>
              Couldn't load the leaderboard.
            </p>
            <button
              type="button"
              onClick={refetch}
              className={`px-5 py-2 rounded-full font-semibold ${dm ? "bg-[#00FF88] text-[#121212]" : "bg-emerald-600 text-white"
                }`}
            >
              Retry
            </button>
          </div>
        ) : isLoading ? (
          <>
            <div
              className={`rounded-2xl p-4 mb-4 ${dm
                  ? "bg-[#1a1a1a] border border-[#87A98D]/15"
                  : "bg-gray-50 border border-gray-200 shadow-sm"
                }`}
            >
              <PodiumSkeleton dm={dm} />
            </div>
            <ListSkeleton dm={dm} />
          </>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`rounded-2xl p-6 mb-4 ${dm
                  ? "bg-[#1a1a1a] border border-[#87A98D]/15"
                  : "bg-gray-50 border border-gray-200 shadow-sm"
                } ${isFetching ? "opacity-70" : ""}`}
            >
              {leaderboard.length === 0 ? (
                <div className="text-center py-8">
                  <FaTrophy
                    className={`mx-auto mb-3 ${dm ? "text-gray-600" : "text-gray-300"}`}
                    size={36}
                  />
                  <p className={dm ? "text-gray-400" : "text-gray-500"}>
                    No rankings yet for this filter.
                  </p>
                </div>
              ) : (
                <div className="flex items-end justify-around gap-1 sm:gap-2 pt-8 sm:pt-6">
                  <PodiumCard entry={rank2} isFirst={false} isMe={meId === rank2?.player?.id} dm={dm} />
                  <PodiumCard entry={rank1} isFirst={true} isMe={meId === rank1?.player?.id} dm={dm} />
                  <PodiumCard entry={rank3} isFirst={false} isMe={meId === rank3?.player?.id} dm={dm} />
                </div>
              )}
            </motion.div>

            {restRows.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={`rounded-2xl p-2 sm:p-3 space-y-1.5 sm:space-y-2 ${dm
                    ? "bg-[#1a1a1a] border border-[#87A98D]/15"
                    : "bg-gray-50 border border-gray-200 shadow-sm"
                  }`}
              >
                {restRows.map((entry, i) => (
                  <ListRow
                    key={entry.player?.id ?? entry.rank}
                    entry={entry}
                    isMe={meId === entry.player?.id}
                    dm={dm}
                    index={i}
                  />
                ))}

                {showPinnedMe && (
                  <>
                    <div
                      className={`text-center py-1 text-lg tracking-widest ${dm ? "text-gray-600" : "text-gray-400"
                        }`}
                    >
                      ···
                    </div>
                    <ListRow entry={myEntry} isMe={true} dm={dm} index={0} />
                  </>
                )}
              </motion.div>
            )}

            {leaderboard.length > 0 && !myEntry && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className={`mt-4 rounded-2xl p-4 text-center text-sm ${dm
                    ? "bg-[#1a1a1a] border border-[#87A98D]/15 text-gray-400"
                    : "bg-gray-50 border border-gray-200 text-gray-500"
                  }`}
              >
                You're not ranked yet. Play more matches!
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;
