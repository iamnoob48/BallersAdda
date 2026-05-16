import { useState } from "react";
import { motion } from "framer-motion";
import { FaUsers } from "react-icons/fa";
import { Loader2, ShieldCheck, Users, CreditCard } from "lucide-react";
import {
  useCreateTournamentOrderMutation,
  useVerifyTournamentPaymentMutation,
} from "../redux/slices/paymentApi.js";

const MIN_PLAYERS = 5;

export function RosterTab({ dm, players, captain, team, tournament, isCaptain, paymentComplete, onPaymentSuccess }) {
  const [createTournamentOrder] = useCreateTournamentOrderMutation();
  const [verifyTournamentPayment] = useVerifyTournamentPaymentMutation();
  const [paymentStep, setPaymentStep] = useState(null);
  const [paymentError, setPaymentError] = useState("");

  const currentCount = players.length;
  const minPlayers = tournament?.maxPlayersPerTeam || MIN_PLAYERS;
  const quotaMet = currentCount >= MIN_PLAYERS;
  const needsPayment = tournament?.registrationFeeCents > 0 && !paymentComplete;
  const isPending = team?.status === "PENDING";
  const remaining = Math.max(0, MIN_PLAYERS - currentCount);

  const handlePay = async () => {
    setPaymentError("");
    setPaymentStep("processing");
    try {
      const orderRes = await createTournamentOrder({
        tournamentId: tournament.id,
        teamId: team.id,
      }).unwrap();

      const options = {
        key: orderRes.keyId,
        amount: orderRes.amount,
        currency: orderRes.currency,
        name: "BallersAdda",
        description: `${orderRes.tournament.name} — Registration Fee`,
        order_id: orderRes.orderId,
        prefill: orderRes.prefill,
        theme: { color: dm ? "#00FF88" : "#059669" },
        handler: async (response) => {
          setPaymentStep("verifying");
          try {
            await verifyTournamentPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }).unwrap();
            setPaymentStep(null);
            onPaymentSuccess?.();
          } catch (err) {
            setPaymentStep(null);
            setPaymentError(err?.data?.message || "Payment verification failed.");
          }
        },
        modal: {
          ondismiss: () => {
            setPaymentStep(null);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response) => {
        setPaymentStep(null);
        setPaymentError(response.error?.description || "Payment failed.");
      });
      rzp.open();
    } catch (err) {
      setPaymentStep(null);
      setPaymentError(err?.data?.message || "Could not create payment order.");
    }
  };

  const feeFmt = tournament?.registrationFeeCents
    ? `₹${(tournament.registrationFeeCents / 100).toLocaleString("en-IN")}`
    : null;

  return (
    <div className="space-y-6">
      {/* Roster Progress Banner */}
      <div className={`rounded-2xl border p-5 space-y-4 ${dm ? "bg-[#1a1a1a] border-[#87A98D]/15" : "bg-white border-gray-200"}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className={`w-5 h-5 ${dm ? "text-[#00FF88]" : "text-emerald-600"}`} />
            <span className="text-sm font-black">
              {quotaMet ? "Squad Ready!" : `${remaining} more player${remaining !== 1 ? "s" : ""} needed`}
            </span>
          </div>
          <span className={`text-sm font-black ${dm ? "text-[#00FF88]" : "text-emerald-600"}`}>
            {currentCount} / {MIN_PLAYERS}
          </span>
        </div>

        <div className={`h-3 rounded-full overflow-hidden ${dm ? "bg-gray-800" : "bg-gray-200"}`}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, (currentCount / MIN_PLAYERS) * 100)}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={`h-full rounded-full ${
              quotaMet
                ? dm ? "bg-[#00FF88]" : "bg-emerald-500"
                : dm ? "bg-yellow-500" : "bg-yellow-400"
            }`}
          />
        </div>

        {/* Payment section */}
        {isPending && needsPayment && quotaMet && isCaptain && (
          <div className="space-y-3 pt-2">
            {paymentStep ? (
              <div className={`flex items-center justify-center gap-3 py-4 rounded-xl ${dm ? "bg-[#121212]" : "bg-gray-50"}`}>
                <Loader2 className={`w-5 h-5 animate-spin ${dm ? "text-[#00FF88]" : "text-emerald-500"}`} />
                <span className={`text-sm font-bold ${dm ? "text-gray-400" : "text-gray-500"}`}>
                  {paymentStep === "verifying" ? "Verifying payment..." : "Opening payment gateway..."}
                </span>
              </div>
            ) : (
              <button
                onClick={handlePay}
                className={`w-full py-4 rounded-xl font-black text-base flex items-center justify-center gap-3 transition-transform hover:scale-[1.01] shadow-xl ${
                  dm
                    ? "bg-[#00FF88] text-[#121212] shadow-[#00FF88]/20"
                    : "bg-emerald-600 text-white shadow-emerald-500/30 hover:bg-emerald-700"
                }`}
              >
                <CreditCard className="w-5 h-5" />
                Pay {feeFmt} & Lock In Squad
              </button>
            )}
            {paymentError && (
              <p className="text-sm font-bold text-red-500 text-center">{paymentError}</p>
            )}
          </div>
        )}

        {isPending && needsPayment && quotaMet && !isCaptain && (
          <div className={`flex items-center gap-3 p-3 rounded-xl ${dm ? "bg-[#00FF88]/5 border border-[#00FF88]/20" : "bg-emerald-50 border border-emerald-200"}`}>
            <ShieldCheck className={`w-4 h-4 shrink-0 ${dm ? "text-[#00FF88]" : "text-emerald-600"}`} />
            <p className={`text-xs font-bold ${dm ? "text-gray-300" : "text-gray-600"}`}>
              Waiting for captain to pay the registration fee
            </p>
          </div>
        )}

        {!isPending && paymentComplete && (
          <div className={`flex items-center gap-3 p-3 rounded-xl ${dm ? "bg-[#00FF88]/10 border border-[#00FF88]/20" : "bg-emerald-50 border border-emerald-200"}`}>
            <ShieldCheck className={`w-4 h-4 shrink-0 ${dm ? "text-[#00FF88]" : "text-emerald-600"}`} />
            <p className={`text-xs font-bold ${dm ? "text-[#00FF88]" : "text-emerald-700"}`}>
              Registration complete — squad is locked in!
            </p>
          </div>
        )}

        {isPending && !quotaMet && isCaptain && (
          <p className={`text-xs font-bold text-center ${dm ? "text-gray-500" : "text-gray-400"}`}>
            Share your invite link to fill the roster
          </p>
        )}
      </div>

      {/* Player Grid */}
      {players.length === 0 ? (
        <div className={`text-center py-16 rounded-2xl border ${dm ? "bg-[#1a1a1a] border-[#87A98D]/15" : "bg-white border-gray-200"}`}>
          <FaUsers className={`text-4xl mx-auto mb-3 ${dm ? "text-gray-600" : "text-gray-300"}`} />
          <p className={`font-semibold ${dm ? "text-gray-400" : "text-gray-500"}`}>No players on the roster yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {players.map((p) => {
            const pic = p.user?.profilePic;
            const isCpt = captain && captain.id === p.userId;
            const initials = `${(p.firstName || "?")[0]}${(p.lastName || "?")[0]}`.toUpperCase();

            return (
              <motion.div
                key={p.id}
                whileHover={{ y: -3 }}
                className={`flex items-center gap-4 p-4 rounded-2xl border transition-shadow hover:shadow-lg ${dm ? "bg-[#1a1a1a] border-[#87A98D]/15" : "bg-white border-gray-200"}`}
              >
                {pic ? (
                  <img src={pic} alt="" className="w-12 h-12 rounded-full object-cover ring-2 ring-offset-2 ring-offset-transparent ring-[#00FF88]/30" />
                ) : (
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold ${dm ? "bg-[#2a2a2a] text-gray-400" : "bg-gray-200 text-gray-500"}`}>
                    {initials}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className={`font-bold text-sm truncate ${dm ? "text-gray-100" : "text-gray-900"}`}>
                    {p.firstName} {p.lastName}
                    {isCpt && (
                      <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded font-bold ${dm ? "bg-yellow-500/15 text-yellow-400" : "bg-yellow-100 text-yellow-700"}`}>
                        C
                      </span>
                    )}
                  </p>
                  {p.position && (
                    <p className={`text-xs ${dm ? "text-gray-500" : "text-gray-400"}`}>
                      {p.position.replace(/_/g, " ")}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
