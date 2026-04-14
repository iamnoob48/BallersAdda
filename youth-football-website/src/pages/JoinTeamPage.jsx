import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, ShieldAlert, Users, Trophy, MapPin, Calendar } from "lucide-react";
import { useValidateInviteTokenQuery, useRedeemInviteTokenMutation } from "../redux/slices/tournamentSlice.js";

const STORAGE_KEY = "pendingInviteToken";

export default function JoinTeamPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dm = useSelector((s) => s.theme.darkMode);
  const { isAuthenticated } = useSelector((s) => s.auth);

  // Persist token from URL into sessionStorage so it survives the login redirect
  const urlToken = searchParams.get("token");
  const token = urlToken || sessionStorage.getItem(STORAGE_KEY) || "";

  useEffect(() => {
    if (urlToken) sessionStorage.setItem(STORAGE_KEY, urlToken);
  }, [urlToken]);

  const {
    data: invite,
    isLoading,
    isError,
    error,
  } = useValidateInviteTokenQuery(token, { skip: !token });

  const [redeemToken, { isLoading: isRedeeming }] = useRedeemInviteTokenMutation();
  const [redeemError, setRedeemError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleJoin = async () => {
    setRedeemError("");
    try {
      await redeemToken(token).unwrap();
      setSuccess(true);
      sessionStorage.removeItem(STORAGE_KEY);
      setTimeout(() => navigate("/home"), 3000);
    } catch (err) {
      setRedeemError(err?.data?.message || "Failed to join team. Please try again.");
    }
  };

  const handleLoginRedirect = (path) => {
    // Token is already in sessionStorage; the login page will send the user back here
    navigate(`${path}?next=/join`);
  };

  // ── Render ──────────────────────────────────────────────────────────────
  const card = `w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden ${
    dm
      ? "bg-[#1a1a1a] text-white border border-[#87A98D]/20"
      : "bg-white text-gray-900 border border-gray-200"
  }`;

  const input = `px-4 py-3 rounded-xl border text-sm outline-none ${
    dm
      ? "bg-[#121212] border-gray-800 text-white"
      : "bg-gray-50 border-gray-200 text-gray-900"
  }`;

  if (!token) {
    return (
      <PageShell dm={dm}>
        <div className={card}>
          <div className="p-10 text-center">
            <ShieldAlert className="w-14 h-14 mx-auto mb-4 text-yellow-500" />
            <h2 className="text-2xl font-black mb-2">Invalid Invite Link</h2>
            <p className={`text-sm ${dm ? "text-gray-400" : "text-gray-500"}`}>
              This link appears to be broken or missing. Ask your team captain to resend the invite.
            </p>
            <Link
              to="/"
              className={`inline-block mt-6 px-6 py-3 rounded-xl font-bold text-sm transition ${
                dm
                  ? "bg-white text-[#121212] hover:bg-gray-100"
                  : "bg-gray-900 text-white hover:bg-gray-800"
              }`}
            >
              Go Home
            </Link>
          </div>
        </div>
      </PageShell>
    );
  }

  if (isLoading) {
    return (
      <PageShell dm={dm}>
        <div className={card}>
          <div className="p-10 flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
            <p className={`text-sm font-bold ${dm ? "text-gray-400" : "text-gray-500"}`}>
              Validating your invite…
            </p>
          </div>
        </div>
      </PageShell>
    );
  }

  if (isError) {
    const msg =
      error?.data?.message || "This invite is no longer valid.";
    return (
      <PageShell dm={dm}>
        <div className={card}>
          <div className="p-10 text-center">
            <ShieldAlert className="w-14 h-14 mx-auto mb-4 text-red-500" />
            <h2 className="text-2xl font-black mb-2">Invite Unavailable</h2>
            <p className={`text-sm ${dm ? "text-gray-400" : "text-gray-500"}`}>{msg}</p>
            <Link
              to="/"
              className={`inline-block mt-6 px-6 py-3 rounded-xl font-bold text-sm transition ${
                dm
                  ? "bg-white text-[#121212] hover:bg-gray-100"
                  : "bg-gray-900 text-white hover:bg-gray-800"
              }`}
            >
              Go Home
            </Link>
          </div>
        </div>
      </PageShell>
    );
  }

  if (success) {
    return (
      <PageShell dm={dm}>
        <div className={card}>
          <div className="p-10 flex flex-col items-center text-center gap-4">
            <CheckCircle2 className={`w-20 h-20 ${dm ? "text-[#00FF88]" : "text-emerald-500"}`} />
            <h2 className="text-2xl font-black">You're on the squad!</h2>
            <p className={`text-sm ${dm ? "text-gray-400" : "text-gray-500"}`}>
              You've been added to <strong>{invite?.team?.name}</strong>. Redirecting you home…
            </p>
          </div>
        </div>
      </PageShell>
    );
  }

  const tournament = invite?.team?.tournament;
  const startDate = tournament?.startDate
    ? new Date(tournament.startDate).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <PageShell dm={dm}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className={card}
      >
        {/* Header */}
        <div
          className={`px-8 py-6 border-b ${dm ? "border-gray-800" : "border-gray-100"}`}
        >
          <p
            className={`text-xs font-bold uppercase tracking-widest mb-1 ${
              dm ? "text-[#00FF88]" : "text-emerald-600"
            }`}
          >
            Team Invite
          </p>
          <h1 className="text-2xl font-black">You've been drafted!</h1>
          <p className={`text-sm mt-1 ${dm ? "text-gray-400" : "text-gray-500"}`}>
            {invite?.team?.captain?.username
              ? `${invite.team.captain.username} wants you on their squad.`
              : "A captain wants you on their squad."}
          </p>
        </div>

        {/* Team details */}
        <div className="px-8 py-6 space-y-4">
          <DetailRow
            dm={dm}
            icon={<Users className="w-4 h-4" />}
            label="Team"
            value={invite?.team?.name}
          />
          {tournament?.name && (
            <DetailRow
              dm={dm}
              icon={<Trophy className="w-4 h-4" />}
              label="Tournament"
              value={`${tournament.name} · ${tournament.category}`}
            />
          )}
          {tournament?.location && (
            <DetailRow
              dm={dm}
              icon={<MapPin className="w-4 h-4" />}
              label="Location"
              value={tournament.location}
            />
          )}
          {startDate && (
            <DetailRow
              dm={dm}
              icon={<Calendar className="w-4 h-4" />}
              label="Kicks off"
              value={startDate}
            />
          )}
          <div className={`pt-2 text-xs font-bold ${dm ? "text-gray-500" : "text-gray-400"}`}>
            Invite sent to: {invite?.email}
          </div>
        </div>

        {/* Error */}
        {redeemError && (
          <div className="mx-8 mb-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold text-center">
            {redeemError}
          </div>
        )}

        {/* Actions */}
        <div className={`px-8 py-5 border-t ${dm ? "border-gray-800" : "border-gray-100"}`}>
          {isAuthenticated ? (
            <button
              onClick={handleJoin}
              disabled={isRedeeming}
              className={`w-full py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 ${
                dm
                  ? "bg-[#00FF88] text-[#121212] shadow-lg shadow-[#00FF88]/20"
                  : "bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-700"
              }`}
            >
              {isRedeeming ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Accept & Join Team"
              )}
            </button>
          ) : (
            <div className="space-y-3">
              <p
                className={`text-xs text-center font-bold mb-3 ${
                  dm ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Log in or create an account with{" "}
                <span className={dm ? "text-[#00FF88]" : "text-emerald-600"}>
                  {invite?.email}
                </span>{" "}
                to accept this invite.
              </p>
              <button
                onClick={() => handleLoginRedirect("/Login")}
                className={`w-full py-3 rounded-xl font-black text-sm transition hover:scale-[1.02] ${
                  dm
                    ? "bg-white text-[#121212] hover:bg-gray-100"
                    : "bg-gray-900 text-white hover:bg-gray-800"
                }`}
              >
                Log In
              </button>
              <button
                onClick={() => handleLoginRedirect("/Register")}
                className={`w-full py-3 rounded-xl font-bold text-sm border transition hover:scale-[1.02] ${
                  dm
                    ? "border-gray-700 text-white hover:bg-gray-800"
                    : "border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                Create Account
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </PageShell>
  );
}

// ── Small helpers ────────────────────────────────────────────────────────────

function PageShell({ dm, children }) {
  return (
    <div
      className={`min-h-screen flex items-center justify-center px-4 ${
        dm ? "bg-[#0d0d0d]" : "bg-gray-50"
      }`}
    >
      {children}
    </div>
  );
}

function DetailRow({ dm, icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <span className={dm ? "text-gray-500" : "text-gray-400"}>{icon}</span>
      <span className={`text-xs font-bold uppercase w-20 shrink-0 ${dm ? "text-gray-500" : "text-gray-400"}`}>
        {label}
      </span>
      <span className="text-sm font-bold truncate">{value}</span>
    </div>
  );
}
