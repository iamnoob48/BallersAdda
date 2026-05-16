import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Link2,
  Copy,
  Check,
  Trash2,
  AlertTriangle,
  UserMinus,
  Shield,
  X,
} from "lucide-react";
import {
  useLazyGetTeamInviteLinkQuery,
  useRemoveTeamPlayerMutation,
  useDisbandTeamMutation,
} from "../redux/slices/tournamentSlice";

// =====================================================================
//  ManageTab — captain-only team management
// =====================================================================
export function ManageTab({ dm, team, players, captain, tournament, teamId, onTeamUpdate }) {
  const navigate = useNavigate();

  const card = `rounded-2xl border p-5 ${dm ? "bg-[#1a1a1a] border-[#87A98D]/15" : "bg-white border-gray-200"}`;
  const label = `text-xs font-bold uppercase tracking-wider ${dm ? "text-gray-500" : "text-gray-400"}`;
  const heading = `text-sm font-bold uppercase tracking-wider ${dm ? "text-[#00FF88]" : "text-green-700"}`;

  return (
    <div className="space-y-6">
      <InviteLinkSection dm={dm} teamId={teamId} card={card} label={label} heading={heading} />
      <SquadManagementSection
        dm={dm}
        teamId={teamId}
        players={players}
        captain={captain}
        card={card}
        heading={heading}
        onTeamUpdate={onTeamUpdate}
      />
      <DisbandSection
        dm={dm}
        teamId={teamId}
        team={team}
        tournament={tournament}
        card={card}
        heading={heading}
        navigate={navigate}
      />
    </div>
  );
}

// ─── Invite Link Section ────────────────────────────────────────────────
function InviteLinkSection({ dm, teamId, card, label, heading }) {
  const [trigger, { data, isFetching }] = useLazyGetTeamInviteLinkQuery();
  const [copied, setCopied] = useState(false);

  const inviteUrl = data?.inviteUrl || null;
  const usedCount = data?.usedCount;

  const handleGenerate = () => {
    trigger(teamId);
  };

  const handleCopy = async () => {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback — should not happen in secure context
    }
  };

  return (
    <div className={card}>
      <div className="flex items-center gap-2 mb-4">
        <Link2 className={`w-4 h-4 ${dm ? "text-[#00FF88]" : "text-emerald-600"}`} />
        <h3 className={heading}>Invite Link</h3>
      </div>

      {inviteUrl ? (
        <div className="space-y-3">
          <div
            className={`flex items-center gap-2 p-3 rounded-xl text-sm font-mono break-all ${
              dm ? "bg-[#121212] text-gray-300" : "bg-gray-50 text-gray-700"
            }`}
          >
            <span className="flex-1 min-w-0 truncate">{inviteUrl}</span>
            <button
              onClick={handleCopy}
              className={`shrink-0 p-2 rounded-lg transition ${
                copied
                  ? dm
                    ? "bg-[#00FF88]/20 text-[#00FF88]"
                    : "bg-emerald-100 text-emerald-600"
                  : dm
                  ? "hover:bg-white/5 text-gray-400"
                  : "hover:bg-gray-200 text-gray-500"
              }`}
              title="Copy link"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {usedCount != null && (
            <p className={`text-xs ${dm ? "text-gray-500" : "text-gray-400"}`}>
              Link used <span className="font-bold">{usedCount}</span> time{usedCount !== 1 ? "s" : ""}
            </p>
          )}

          <button
            onClick={handleCopy}
            className={`w-full py-2.5 rounded-xl font-semibold text-sm transition ${
              dm
                ? "bg-[#00FF88] text-[#121212] hover:bg-[#00FF88]/90"
                : "bg-emerald-600 text-white hover:bg-emerald-700"
            }`}
          >
            {copied ? "Copied!" : "Copy Invite Link"}
          </button>
        </div>
      ) : (
        <button
          onClick={handleGenerate}
          disabled={isFetching}
          className={`w-full py-2.5 rounded-xl font-semibold text-sm transition ${
            dm
              ? "bg-[#00FF88] text-[#121212] hover:bg-[#00FF88]/90"
              : "bg-emerald-600 text-white hover:bg-emerald-700"
          } disabled:opacity-50`}
        >
          {isFetching ? "Generating..." : "Generate Invite Link"}
        </button>
      )}
    </div>
  );
}

// ─── Squad Management Section ───────────────────────────────────────────
function SquadManagementSection({ dm, teamId, players, captain, card, heading, onTeamUpdate }) {
  const [removePlayer, { isLoading: isRemoving }] = useRemoveTeamPlayerMutation();
  const [confirmTarget, setConfirmTarget] = useState(null);

  const handleRemove = async () => {
    if (!confirmTarget) return;
    try {
      await removePlayer({ teamId, playerId: confirmTarget.id }).unwrap();
      setConfirmTarget(null);
      onTeamUpdate?.();
    } catch {
      // error handled via RTK Query
      setConfirmTarget(null);
    }
  };

  return (
    <>
      <div className={card}>
        <div className="flex items-center gap-2 mb-4">
          <Shield className={`w-4 h-4 ${dm ? "text-[#00FF88]" : "text-emerald-600"}`} />
          <h3 className={heading}>Squad Management</h3>
          <span
            className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${
              dm ? "bg-[#00FF88]/10 text-[#00FF88]" : "bg-green-100 text-green-700"
            }`}
          >
            {players.length} Player{players.length !== 1 ? "s" : ""}
          </span>
        </div>

        {players.length === 0 ? (
          <p className={`text-sm ${dm ? "text-gray-500" : "text-gray-400"}`}>No players on the roster yet.</p>
        ) : (
          <div className="space-y-2">
            {players.map((p) => {
              const pic = p.user?.profilePic;
              const isCpt = captain && captain.id === p.userId;
              const initials = `${(p.firstName || "?")[0]}${(p.lastName || "?")[0]}`.toUpperCase();

              return (
                <motion.div
                  key={p.id}
                  layout
                  className={`flex items-center gap-3 p-3 rounded-xl border transition ${
                    dm ? "bg-[#121212] border-[#87A98D]/10" : "bg-gray-50 border-gray-100"
                  }`}
                >
                  {pic ? (
                    <img
                      src={pic}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-offset-2 ring-offset-transparent ring-[#00FF88]/30"
                    />
                  ) : (
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${
                        dm ? "bg-[#2a2a2a] text-gray-400" : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {initials}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className={`font-bold text-sm truncate ${dm ? "text-gray-100" : "text-gray-900"}`}>
                      {p.firstName} {p.lastName}
                      {isCpt && (
                        <span
                          className={`ml-2 text-[10px] px-1.5 py-0.5 rounded font-bold ${
                            dm ? "bg-yellow-500/15 text-yellow-400" : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          Captain
                        </span>
                      )}
                    </p>
                    {p.position && (
                      <p className={`text-xs ${dm ? "text-gray-500" : "text-gray-400"}`}>
                        {p.position.replace(/_/g, " ")}
                      </p>
                    )}
                  </div>

                  {!isCpt && (
                    <button
                      onClick={() => setConfirmTarget(p)}
                      className={`p-2 rounded-lg text-xs font-semibold transition ${
                        dm
                          ? "text-red-400 hover:bg-red-500/10"
                          : "text-red-500 hover:bg-red-50"
                      }`}
                      title="Remove player"
                    >
                      <UserMinus className="w-4 h-4" />
                    </button>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Remove confirmation modal */}
      <AnimatePresence>
        {confirmTarget && (
          <ConfirmModal
            dm={dm}
            title="Remove Player"
            description={`Are you sure you want to remove ${confirmTarget.firstName} ${confirmTarget.lastName} from the squad?`}
            confirmLabel={isRemoving ? "Removing..." : "Remove"}
            confirmVariant="danger"
            onConfirm={handleRemove}
            onCancel={() => setConfirmTarget(null)}
            isLoading={isRemoving}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Disband Team Section ───────────────────────────────────────────────
function DisbandSection({ dm, teamId, team, tournament, card, heading, navigate }) {
  const [disbandTeam, { isLoading }] = useDisbandTeamMutation();
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const canDisband =
    tournament?.status === "UPCOMING" &&
    tournament?.registrationDeadline &&
    new Date() < new Date(tournament.registrationDeadline);

  if (!canDisband) return null;

  const feePaid = team.paymentComplete && tournament?.registrationFeeCents > 0;
  const feeFmt = tournament?.registrationFeeCents
    ? `₹${(tournament.registrationFeeCents / 100).toLocaleString("en-IN")}`
    : null;

  const handleDisband = async () => {
    try {
      await disbandTeam(teamId).unwrap();
      navigate("/home");
    } catch {
      // error handled via RTK Query
    }
  };

  return (
    <>
      <div className={`rounded-2xl border-2 p-5 ${dm ? "bg-red-500/5 border-red-500/30" : "bg-red-50 border-red-200"}`}>
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className={`w-4 h-4 ${dm ? "text-red-400" : "text-red-600"}`} />
          <h3 className={`text-sm font-bold uppercase tracking-wider ${dm ? "text-red-400" : "text-red-700"}`}>
            Danger Zone
          </h3>
        </div>

        <p className={`text-sm mb-4 ${dm ? "text-gray-400" : "text-gray-600"}`}>
          {feePaid
            ? `Your team will be disbanded and the registration fee of ${feeFmt} will be refunded.`
            : "Your team will be disbanded and all players will be removed."}
        </p>

        <button
          onClick={() => setShowConfirm(true)}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm transition ${
            dm
              ? "bg-red-500/15 text-red-400 hover:bg-red-500/25"
              : "bg-red-600 text-white hover:bg-red-700"
          }`}
        >
          Disband Team
        </button>
      </div>

      {/* Disband confirmation modal */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl ${
                dm ? "bg-[#1a1a1a] border-[#87A98D]/15" : "bg-white border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <h3 className={`text-lg font-bold ${dm ? "text-gray-100" : "text-gray-900"}`}>
                    Disband Team
                  </h3>
                </div>
                <button
                  onClick={() => setShowConfirm(false)}
                  className={`p-1.5 rounded-lg transition ${dm ? "hover:bg-white/5 text-gray-500" : "hover:bg-gray-100 text-gray-400"}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className={`text-sm mb-4 ${dm ? "text-gray-400" : "text-gray-600"}`}>
                This action cannot be undone. Type{" "}
                <span className="font-bold text-red-500">DISBAND</span> to confirm.
              </p>

              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder='Type "DISBAND"'
                className={`w-full px-4 py-2.5 rounded-xl border text-sm font-mono mb-4 outline-none transition ${
                  dm
                    ? "bg-[#121212] border-[#87A98D]/20 text-gray-200 placeholder-gray-600 focus:border-red-500/50"
                    : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-red-300"
                }`}
              />

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowConfirm(false);
                    setConfirmText("");
                  }}
                  className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition ${
                    dm
                      ? "bg-[#121212] text-gray-400 hover:bg-[#2a2a2a]"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDisband}
                  disabled={confirmText !== "DISBAND" || isLoading}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition ${
                    confirmText === "DISBAND"
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : dm
                      ? "bg-red-500/10 text-red-500/30 cursor-not-allowed"
                      : "bg-red-100 text-red-300 cursor-not-allowed"
                  }`}
                >
                  {isLoading ? "Disbanding..." : "Disband Team"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Generic Confirm Modal ──────────────────────────────────────────────
function ConfirmModal({ dm, title, description, confirmLabel, confirmVariant, onConfirm, onCancel, isLoading }) {
  const isDanger = confirmVariant === "danger";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.15 }}
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-sm rounded-2xl border p-6 shadow-2xl ${
          dm ? "bg-[#1a1a1a] border-[#87A98D]/15" : "bg-white border-gray-200"
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className={`text-base font-bold ${dm ? "text-gray-100" : "text-gray-900"}`}>{title}</h3>
          <button
            onClick={onCancel}
            className={`p-1.5 rounded-lg transition ${dm ? "hover:bg-white/5 text-gray-500" : "hover:bg-gray-100 text-gray-400"}`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className={`text-sm mb-5 ${dm ? "text-gray-400" : "text-gray-600"}`}>{description}</p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition ${
              dm
                ? "bg-[#121212] text-gray-400 hover:bg-[#2a2a2a]"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition disabled:opacity-50 ${
              isDanger
                ? "bg-red-600 text-white hover:bg-red-700"
                : dm
                ? "bg-[#00FF88] text-[#121212]"
                : "bg-emerald-600 text-white"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
