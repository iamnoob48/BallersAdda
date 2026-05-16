import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Phone, Mail, Share2, Heart, ShieldCheck, Zap } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const CYCLE_LABELS = {
  MONTH: "Monthly",
  YEAR: "Yearly",
  SESSION: "Per Session",
};

function formatPrice(priceCents, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(priceCents / 100);
}

function isBatchEligible(batch, playerAge) {
  if (!batch.isActive) return false;
  if (playerAge == null) return true;
  const match = batch.ageGroup?.match(/U[-\s]?(\d+)/i);
  if (!match) return true;
  const maxAge = parseInt(match[1], 10);
  return playerAge <= maxAge;
}

const sectionVariants = {
  hidden: { opacity: 0, height: 0, marginTop: 0 },
  visible: {
    opacity: 1,
    height: "auto",
    marginTop: 16,
    transition: { duration: 0.35, ease: "easeOut" },
  },
  exit: { opacity: 0, height: 0, marginTop: 0, transition: { duration: 0.2 } },
};

const RightCard = ({ ACADEMY_DATA }) => {
  const dm = useSelector((state) => state.theme.darkMode);
  const isLoading = useSelector((state) => state.player.loading);
  const playerAge = useSelector(
    (state) => state.player.profile?.age ?? null
  );
  const playerAcademyId = useSelector(
    (state) => state.player.profile?.academyId ?? null
  );
  const navigate = useNavigate();

  const alreadyMember = playerAcademyId !== null && playerAcademyId;

  const [selectedService, setSelectedService] = useState("");
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState("");

  const activePlans = (ACADEMY_DATA.academy.pricing || []).filter(
    (p) => p.active
  );
  const eligibleBatches = (ACADEMY_DATA.academy.batches || []).filter((b) =>
    isBatchEligible(b, playerAge)
  );

  const completedSteps = [
    !!selectedService,
    !!selectedPlan,
    !!selectedBatch,
  ].filter(Boolean).length;
  const currentStep = !selectedService
    ? 0
    : !selectedPlan
    ? 1
    : !selectedBatch
    ? 2
    : 3;
  const allSelected = selectedService && selectedPlan && selectedBatch;

  const handleJoinAcademy = () => {
    if (!allSelected) return;
    navigate(`/academy/payment/${ACADEMY_DATA.academy.id}`, {
      state: {
        academy: {
          id: ACADEMY_DATA.academy.id,
          name: ACADEMY_DATA.academy.name,
        },
        plan: selectedPlan.title,
        planId: selectedPlan.id,
        price: selectedPlan.priceCents / 100,
        batchId: selectedBatch,
      },
    });
  };

  const stepLabels = ["Service", "Plan", "Batch"];

  return (
    <motion.aside
      id="join-academy"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
      className="lg:col-span-4 space-y-6"
    >
      {/* Join Card */}
      <div
        className={`rounded-2xl overflow-hidden shadow-xl border sticky top-24 transition-colors duration-300 ${
          dm
            ? "bg-[#141414] shadow-black/30 border-white/[0.06]"
            : "bg-white shadow-gray-200/60 border-gray-100"
        }`}
      >
        {/* Card header accent */}
        <div
          className={`h-1.5 w-full ${
            dm
              ? "bg-gradient-to-r from-[#00FF88] via-[#00FF88]/60 to-transparent"
              : "bg-gradient-to-r from-emerald-500 via-emerald-400 to-transparent"
          }`}
        />

        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-xl ${
                  dm ? "bg-[#00FF88]/10" : "bg-emerald-50"
                }`}
              >
                <Zap
                  className={`w-5 h-5 ${
                    dm ? "text-[#00FF88]" : "text-emerald-600"
                  }`}
                />
              </div>
              <div>
                <h3
                  className={`text-xl font-bold ${
                    dm ? "text-gray-100" : "text-gray-900"
                  }`}
                >
                  Join Academy
                </h3>
                <p
                  className={`text-xs ${
                    dm ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  Enrollment open
                </p>
              </div>
            </div>
            <span className="flex h-3 w-3 relative">
              <span
                className={`animate-ping absolute inline-flex h-3 w-3 rounded-full opacity-75 ${
                  dm ? "bg-[#00FF88]" : "bg-emerald-400"
                }`}
              ></span>
              <span
                className={`relative inline-flex rounded-full h-3 w-3 ${
                  dm ? "bg-[#00FF88]" : "bg-emerald-500"
                }`}
              ></span>
            </span>
          </div>

          {/* Already a member */}
          {alreadyMember ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-2xl p-6 flex flex-col items-center gap-3 text-center border ${
                dm
                  ? "bg-[#00FF88]/5 border-[#00FF88]/20"
                  : "bg-emerald-50 border-emerald-200"
              }`}
            >
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center ${
                  dm ? "bg-[#00FF88]/15" : "bg-emerald-100"
                }`}
              >
                <svg
                  className={`w-7 h-7 ${
                    dm ? "text-[#00FF88]" : "text-emerald-600"
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p
                  className={`text-sm font-bold ${
                    dm ? "text-gray-100" : "text-gray-800"
                  }`}
                >
                  You&apos;re already part of an academy
                </p>
                <p
                  className={`text-xs mt-1 ${
                    dm ? "text-gray-500" : "text-gray-500"
                  }`}
                >
                  Visit your dashboard to manage your membership.
                </p>
              </div>
            </motion.div>
          ) : (
            <>
              {/* Step Indicator */}
              <div className="flex items-center justify-between mb-6">
                {[1, 2, 3].map((step) => {
                  const stepIndex = step - 1;
                  const isCompleted = stepIndex < completedSteps;
                  const isCurrent = stepIndex === currentStep;
                  return (
                    <div
                      key={step}
                      className="flex items-center gap-2 flex-1"
                    >
                      <div className="flex flex-col items-center gap-1.5">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                            isCompleted
                              ? dm
                                ? "bg-[#00FF88] text-[#0a0a0a]"
                                : "bg-emerald-600 text-white"
                              : isCurrent
                              ? dm
                                ? "bg-[#00FF88]/15 text-[#00FF88] ring-2 ring-[#00FF88]/40"
                                : "bg-emerald-50 text-emerald-700 ring-2 ring-emerald-400"
                              : dm
                              ? "bg-white/[0.04] text-gray-600 border border-white/[0.08]"
                              : "bg-gray-50 text-gray-400 border border-gray-200"
                          }`}
                        >
                          {isCompleted ? (
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={3}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          ) : (
                            step
                          )}
                        </div>
                        <span
                          className={`text-[10px] font-medium ${
                            isCompleted || isCurrent
                              ? dm
                                ? "text-[#00FF88]"
                                : "text-emerald-600"
                              : dm
                              ? "text-gray-600"
                              : "text-gray-400"
                          }`}
                        >
                          {stepLabels[stepIndex]}
                        </span>
                      </div>
                      {step < 3 && (
                        <div
                          className={`flex-1 h-px mx-1 mt-[-18px] transition-colors duration-300 ${
                            stepIndex < completedSteps
                              ? dm
                                ? "bg-[#00FF88]/40"
                                : "bg-emerald-400"
                              : dm
                              ? "bg-white/[0.06]"
                              : "bg-gray-200"
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="space-y-0">
                {/* Step 1 -- Service Selection */}
                <div>
                  <label
                    className={`text-xs font-bold uppercase tracking-wider mb-2 block ${
                      dm ? "text-gray-500" : "text-gray-500"
                    }`}
                  >
                    Select Service
                  </label>
                  <select
                    value={selectedService}
                    onChange={(e) => {
                      setSelectedService(e.target.value);
                      setSelectedPlan(null);
                      setSelectedBatch("");
                    }}
                    className={`w-full border text-sm rounded-xl block p-3.5 outline-none transition-all ${
                      dm
                        ? "bg-[#0a0a0a] border-white/[0.08] text-gray-300 focus:ring-2 focus:ring-[#00FF88]/20 focus:border-[#00FF88]/40"
                        : "bg-gray-50 border-gray-200 text-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                    }`}
                  >
                    <option value="" disabled>
                      Choose a service...
                    </option>
                    {ACADEMY_DATA.academy.services.map((service, idx) => (
                      <option
                        key={idx}
                        value={service}
                        className={dm ? "text-white" : "text-gray-900"}
                      >
                        {service}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Step 2 -- Membership Plan */}
                <div
                  className={`transition-all duration-300 ${
                    !selectedService ? "opacity-40 pointer-events-none" : ""
                  }`}
                >
                  <AnimatePresence>
                    {selectedService && (
                      <motion.div
                        variants={sectionVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                      >
                        <label
                          className={`text-xs font-bold uppercase tracking-wider mb-2 block ${
                            dm ? "text-gray-500" : "text-gray-500"
                          }`}
                        >
                          Choose Plan
                        </label>
                        <div
                          className="space-y-2.5"
                          role="radiogroup"
                          aria-label="Membership plans"
                        >
                          {activePlans.length > 0 ? (
                            activePlans.map((plan) => {
                              const isSelected =
                                selectedPlan?.id === plan.id;
                              return (
                                <label
                                  key={plan.id}
                                  className={`relative flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
                                    isSelected
                                      ? dm
                                        ? "border-[#00FF88]/50 ring-2 ring-[#00FF88]/30 bg-[#00FF88]/5"
                                        : "border-emerald-400 ring-2 ring-emerald-500/30 bg-emerald-50/50"
                                      : dm
                                      ? "border-white/[0.06] bg-[#0a0a0a] hover:border-white/[0.12]"
                                      : "border-gray-200 bg-gray-50 hover:border-gray-300"
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    name="plan"
                                    className="sr-only"
                                    checked={isSelected}
                                    onChange={() => {
                                      setSelectedPlan(plan);
                                      setSelectedBatch("");
                                    }}
                                  />

                                  {/* Radio dot */}
                                  <div
                                    className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                                      isSelected
                                        ? dm
                                          ? "border-[#00FF88]"
                                          : "border-emerald-500"
                                        : dm
                                        ? "border-gray-600"
                                        : "border-gray-300"
                                    }`}
                                  >
                                    {isSelected && (
                                      <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className={`w-2 h-2 rounded-full ${
                                          dm
                                            ? "bg-[#00FF88]"
                                            : "bg-emerald-500"
                                        }`}
                                      />
                                    )}
                                  </div>

                                  {/* Plan info */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span
                                        className={`text-sm font-semibold ${
                                          dm
                                            ? "text-gray-200"
                                            : "text-gray-800"
                                        }`}
                                      >
                                        {plan.title}
                                      </span>
                                      {plan.recommended && (
                                        <span
                                          className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                                            dm
                                              ? "bg-[#00FF88]/15 text-[#00FF88]"
                                              : "bg-emerald-100 text-emerald-700"
                                          }`}
                                        >
                                          Best
                                        </span>
                                      )}
                                    </div>
                                    <span
                                      className={`text-xs ${
                                        dm ? "text-gray-500" : "text-gray-400"
                                      }`}
                                    >
                                      {CYCLE_LABELS[plan.billingCycle] ||
                                        plan.billingCycle}
                                    </span>
                                  </div>

                                  {/* Price */}
                                  <span
                                    className={`text-sm font-bold flex-shrink-0 ${
                                      isSelected
                                        ? dm
                                          ? "text-[#00FF88]"
                                          : "text-emerald-600"
                                        : dm
                                        ? "text-gray-300"
                                        : "text-gray-700"
                                    }`}
                                  >
                                    {formatPrice(
                                      plan.priceCents,
                                      plan.currency || "INR"
                                    )}
                                  </span>
                                </label>
                              );
                            })
                          ) : (
                            <p
                              className={`text-sm text-center py-3 ${
                                dm ? "text-gray-500" : "text-gray-400"
                              }`}
                            >
                              No active plans available
                            </p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Step 3 -- Batch / Squad */}
                <div
                  className={`transition-all duration-300 ${
                    !selectedPlan ? "opacity-40 pointer-events-none" : ""
                  }`}
                >
                  <AnimatePresence>
                    {selectedPlan && (
                      <motion.div
                        variants={sectionVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                      >
                        <label
                          className={`text-xs font-bold uppercase tracking-wider mb-2 block ${
                            dm ? "text-gray-500" : "text-gray-500"
                          }`}
                        >
                          Select Batch
                        </label>
                        {eligibleBatches.length > 0 ? (
                          <select
                            value={selectedBatch}
                            onChange={(e) =>
                              setSelectedBatch(e.target.value)
                            }
                            className={`w-full border text-sm rounded-xl block p-3.5 outline-none transition-all ${
                              dm
                                ? "bg-[#0a0a0a] border-white/[0.08] text-gray-300 focus:ring-2 focus:ring-[#00FF88]/20 focus:border-[#00FF88]/40"
                                : "bg-gray-50 border-gray-200 text-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                            }`}
                          >
                            <option value="" disabled>
                              Choose a batch...
                            </option>
                            {eligibleBatches.map((batch) => {
                              const spotsLeft =
                                batch.capacity -
                                (batch._count?.players || 0);
                              const isFull = spotsLeft <= 0;
                              return (
                                <option
                                  key={batch.id}
                                  value={batch.id}
                                  disabled={isFull}
                                  className={
                                    isFull
                                      ? "italic text-gray-400"
                                      : dm
                                      ? "text-white"
                                      : "text-gray-900"
                                  }
                                >
                                  {batch.name}
                                  {batch.ageGroup
                                    ? ` · ${batch.ageGroup}`
                                    : ""}
                                  {" — "}
                                  {isFull
                                    ? "WAITLIST FULL"
                                    : `${spotsLeft} spots left`}
                                </option>
                              );
                            })}
                          </select>
                        ) : (
                          <p
                            className={`text-sm py-3 px-3 rounded-xl text-center ${
                              dm
                                ? "text-gray-500 bg-[#0a0a0a]"
                                : "text-gray-400 bg-gray-50"
                            }`}
                          >
                            No batches match your age group
                          </p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Optional Message */}
                <div className="mt-4">
                  <label
                    className={`text-xs font-bold uppercase tracking-wider mb-2 block ${
                      dm ? "text-gray-500" : "text-gray-500"
                    }`}
                  >
                    Add Message (Optional)
                  </label>
                  <textarea
                    rows="3"
                    className={`w-full border text-sm rounded-xl block p-3.5 outline-none resize-none transition-all ${
                      dm
                        ? "bg-[#0a0a0a] border-white/[0.08] text-gray-300 placeholder:text-gray-600 focus:ring-2 focus:ring-[#00FF88]/20 focus:border-[#00FF88]/40"
                        : "bg-gray-50 border-gray-200 text-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                    }`}
                    placeholder="Hi, I'm interested in..."
                  />
                </div>

                {/* CTA */}
                <motion.button
                  whileHover={allSelected ? { scale: 1.02, y: -1 } : {}}
                  whileTap={allSelected ? { scale: 0.98 } : {}}
                  onClick={handleJoinAcademy}
                  disabled={!allSelected}
                  className={`w-full font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mt-5 text-base ${
                    allSelected
                      ? dm
                        ? "bg-[#00FF88] text-[#0a0a0a] hover:bg-[#00FF88]/90 shadow-[#00FF88]/15 cursor-pointer"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200 cursor-pointer"
                      : dm
                      ? "bg-[#00FF88]/20 text-[#0a0a0a]/40 cursor-not-allowed shadow-none"
                      : "bg-emerald-200 text-white cursor-not-allowed shadow-none"
                  }`}
                >
                  <ShieldCheck className="w-5 h-5" />
                  Join This Academy
                </motion.button>

                {/* Trust signals */}
                <p
                  className={`text-[10px] text-center mt-3 ${
                    dm ? "text-gray-600" : "text-gray-400"
                  }`}
                >
                  Secure enrollment. Cancel anytime.
                </p>

                {/* Contact Row */}
                <div
                  className={`pt-5 border-t flex justify-center gap-5 mt-5 ${
                    dm ? "border-white/[0.06]" : "border-gray-100"
                  }`}
                >
                  {[
                    {
                      icon: Phone,
                      label: "Call",
                      hoverColor: dm
                        ? "hover:text-[#00FF88]"
                        : "hover:text-emerald-600",
                    },
                    {
                      icon: Mail,
                      label: "Email",
                      hoverColor: dm
                        ? "hover:text-[#00DCFF]"
                        : "hover:text-emerald-600",
                    },
                    {
                      icon: Share2,
                      label: "Share",
                      hoverColor: dm
                        ? "hover:text-[#00FF88]"
                        : "hover:text-emerald-600",
                    },
                    {
                      icon: Heart,
                      label: "Save",
                      hoverColor: "hover:text-red-500",
                    },
                  ].map(({ icon: Icon, label, hoverColor }) => (
                    <button
                      key={label}
                      className={`flex flex-col items-center gap-1.5 transition-colors ${
                        dm ? "text-gray-500" : "text-gray-400"
                      } ${hoverColor}`}
                    >
                      <div
                        className={`p-2.5 rounded-xl transition-colors ${
                          dm
                            ? "bg-white/[0.04] hover:bg-white/[0.08]"
                            : "bg-gray-50 hover:bg-gray-100"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-medium">
                        {label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.aside>
  );
};

export default RightCard;
