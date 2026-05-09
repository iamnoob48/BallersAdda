import { motion } from "framer-motion";
import { Trophy } from "lucide-react";

function formatKickoff(iso) {
  if (!iso) return null;
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return null;
  }
}

function MatchCard({ match, dm, isFinal }) {
  const isCompleted = match.status === "COMPLETED";
  const homeWin = isCompleted && match.winner === "HOME";
  const awayWin = isCompleted && match.winner === "AWAY";

  const winnerNameClass = dm ? "text-[#00FF88] font-bold" : "text-emerald-600 font-bold";
  const loserNameClass = "text-gray-500";
  const neutralNameClass = dm ? "text-gray-200" : "text-gray-800";

  const finalGlow =
    isFinal && isCompleted ? "ring-2 ring-yellow-400/50 bg-yellow-400/5" : "";

  return (
    <div
      className={`w-[200px] shrink-0 rounded-xl px-3 py-2.5 transition-colors ${
        dm
          ? "bg-[#1a1a1a] border border-[#87A98D]/15"
          : "bg-white border border-gray-200 shadow-sm"
      } ${finalGlow}`}
    >
      <Row
        name={match.homeTeam?.name || "TBD"}
        score={isCompleted ? match.homeScore : null}
        isWinner={homeWin}
        isLoser={awayWin}
        isCompleted={isCompleted}
        dm={dm}
        winnerCls={winnerNameClass}
        loserCls={loserNameClass}
        neutralCls={neutralNameClass}
      />

      <div className={`my-1.5 h-px ${dm ? "bg-[#87A98D]/10" : "bg-gray-100"}`} />

      <Row
        name={match.awayTeam?.name || "TBD"}
        score={isCompleted ? match.awayScore : null}
        isWinner={awayWin}
        isLoser={homeWin}
        isCompleted={isCompleted}
        dm={dm}
        winnerCls={winnerNameClass}
        loserCls={loserNameClass}
        neutralCls={neutralNameClass}
      />

      {!isCompleted && (
        <div className="mt-2 text-center text-[10px] uppercase tracking-wider text-gray-500">
          {match.status === "LIVE" ? (
            <span className="inline-flex items-center gap-1 text-red-500 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> Live
            </span>
          ) : formatKickoff(match.kickoffAt) ? (
            formatKickoff(match.kickoffAt)
          ) : (
            "Scheduled"
          )}
        </div>
      )}
    </div>
  );
}

function Row({ name, score, isWinner, isLoser, isCompleted, winnerCls, loserCls, neutralCls }) {
  const cls = isWinner ? winnerCls : isLoser ? loserCls : neutralCls;
  return (
    <div className="flex items-center justify-between text-sm">
      <span className={`truncate ${cls}`}>{name}</span>
      <span className={`font-mono tabular-nums ml-2 ${cls}`}>
        {isCompleted ? score : <span className="text-xs text-gray-500">vs</span>}
      </span>
    </div>
  );
}

export default function TournamentBracket({ bracket, dm }) {
  if (!bracket?.rounds?.length) {
    return (
      <div className={`p-6 text-center text-sm ${dm ? "text-gray-500" : "text-gray-400"}`}>
        Bracket not available yet.
      </div>
    );
  }

  const rounds = bracket.rounds;
  const lastRoundIdx = rounds.length - 1;

  return (
    <div className="overflow-x-auto -mx-2 px-2 pb-4">
      <div className="flex items-stretch gap-6 min-w-fit">
        {rounds.map((round, rIdx) => {
          const isFinalCol = rIdx === lastRoundIdx;
          const matches = round.matches || [];
          const isFirst = rIdx === 0;

          return (
            <motion.div
              key={round.round}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * rIdx }}
              className="flex flex-col"
            >
              <div
                className={`mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] ${
                  dm ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {isFinalCol && (
                  <Trophy className="w-4 h-4 text-yellow-400" aria-hidden="true" />
                )}
                {round.name}
              </div>

              <div
                className="flex flex-col justify-around flex-1 gap-4"
                style={{
                  minHeight: matches.length > 1 ? `${matches.length * 80}px` : "120px",
                }}
              >
                {matches.map((match, mIdx) => (
                  <div
                    key={match.id}
                    className="relative flex items-center"
                  >
                    {!isFirst && (
                      <span
                        aria-hidden="true"
                        className={`absolute -left-6 top-1/2 w-6 h-px ${
                          dm ? "bg-[#87A98D]/30" : "bg-gray-300"
                        }`}
                      />
                    )}

                    {!isFinalCol && (
                      <span
                        aria-hidden="true"
                        className={`absolute -right-6 top-1/2 w-6 h-px ${
                          dm ? "bg-[#87A98D]/30" : "bg-gray-300"
                        }`}
                      />
                    )}

                    {!isFinalCol && mIdx % 2 === 0 && matches[mIdx + 1] && (
                      <span
                        aria-hidden="true"
                        className={`absolute -right-6 top-1/2 w-px ${
                          dm ? "bg-[#87A98D]/30" : "bg-gray-300"
                        }`}
                        style={{ height: "calc(100% + 1rem)" }}
                      />
                    )}

                    <MatchCard match={match} dm={dm} isFinal={isFinalCol} />
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
