import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiArrowRight, FiArrowLeft } from "react-icons/fi";
import { useSelector } from "react-redux";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

// ── Constants (must match backend validation) ───────────────────────────
const POSITIONS = [
  "Goalkeeper", "Defender", "Midfielder", "Forward",
  "Center Back", "Full Back", "Wing Back",
  "Central Midfielder", "Attacking Midfielder", "Defensive Midfielder",
  "Winger", "Striker",
];
const GENDERS = ["Male", "Female", "Other"];
const FEET = ["Right", "Left", "Both"];

export default function CompleteProfilePage() {
  const dm = useSelector((state) => state.theme.darkMode);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    displayName: "",
    bio: "",
    age: "",
    gender: "",
    height: "",
    weight: "",
    position: "",
    dominantFoot: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const next = () => {
    // Validate step 1 required fields before proceeding
    if (step === 1) {
      if (!form.firstName.trim() || !form.lastName.trim()) {
        setError("First name and last name are required.");
        return;
      }
    }
    setError("");
    setStep((s) => Math.min(s + 1, 3));
  };
  const prev = () => { setError(""); setStep((s) => Math.max(s - 1, 1)); };

  /**
   * Sanitize form data before sending — convert empty strings to null,
   * parse numeric fields, trim text fields.
   */
  const sanitizeFormData = () => {
    const trimOrNull = (v) => (v && v.trim() ? v.trim() : null);
    const intOrNull = (v) => {
      const n = parseInt(v, 10);
      return isNaN(n) ? null : n;
    };
    const floatOrNull = (v) => {
      const n = parseFloat(v);
      return isNaN(n) ? null : n;
    };

    return {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      displayName: trimOrNull(form.displayName),
      bio: trimOrNull(form.bio),
      age: intOrNull(form.age),
      gender: trimOrNull(form.gender),
      height: floatOrNull(form.height),
      weight: floatOrNull(form.weight),
      position: trimOrNull(form.position),
      dominantFoot: trimOrNull(form.dominantFoot),
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Final validation
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError("First name and last name are required.");
      return;
    }

    const age = parseInt(form.age, 10);
    if (form.age && (isNaN(age) || age < 3 || age > 100)) {
      setError("Age must be between 3 and 100.");
      return;
    }

    try {
      setSubmitting(true);
      await api.post("/player/createPlayerProfile", sanitizeFormData());
      navigate("/profile");
    } catch (err) {
      const message = err.response?.data?.message || "Failed to create profile. Please try again.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = dm
    ? "w-full px-4 py-3 border border-[#87A98D]/20 rounded-lg bg-[#121212] text-gray-200 placeholder:text-gray-600 focus:ring-2 focus:ring-[#00FF88]/20 focus:border-[#00FF88]/50 focus:outline-none"
    : "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none";

  const labelCls = dm
    ? "block text-sm font-medium text-gray-400 mb-1"
    : "block text-sm font-medium text-gray-700 mb-1";

  return (
    <section className={`min-h-screen flex items-center justify-center py-10 px-6 transition-colors duration-300 ${dm ? "bg-[#121212]" : "bg-gradient-to-br from-green-50 to-white"}`}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`rounded-2xl shadow-xl border w-full max-w-2xl p-8 transition-colors duration-300 ${dm ? "bg-[#1a1a1a] border-[#87A98D]/15 shadow-black/20" : "bg-white border-gray-200"}`}
      >
        <h1 className={`text-3xl font-extrabold text-center mb-8 ${dm ? "text-[#00FF88]" : "text-green-700"}`}>
          Complete Your Player Profile
        </h1>

        {error && (
          <p className="text-sm text-red-400 text-center mb-4">{error}</p>
        )}

        <AnimatePresence mode="wait">
          <motion.form
            key={step}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {step === 1 && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>First Name *</label>
                    <input name="firstName" value={form.firstName} onChange={handleChange} required className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Last Name *</label>
                    <input name="lastName" value={form.lastName} onChange={handleChange} required className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Display Name</label>
                  <input name="displayName" value={form.displayName} onChange={handleChange} placeholder="Your public name (optional)" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Bio</label>
                  <textarea name="bio" value={form.bio} onChange={handleChange} rows={3} placeholder="Introduce yourself as a player (optional)" className={`${inputCls} resize-none`} />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Age</label>
                    <input name="age" type="number" min="3" max="100" value={form.age} onChange={handleChange} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Gender</label>
                    <select name="gender" value={form.gender} onChange={handleChange} className={inputCls}>
                      <option value="">Select...</option>
                      {GENDERS.map((opt) => <option key={opt}>{opt}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Height (cm)</label>
                    <input name="height" type="number" min="1" max="300" value={form.height} onChange={handleChange} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Weight (kg)</label>
                    <input name="weight" type="number" min="1" max="300" value={form.weight} onChange={handleChange} className={inputCls} />
                  </div>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div>
                  <label className={labelCls}>Preferred Position</label>
                  <select name="position" value={form.position} onChange={handleChange} className={inputCls}>
                    <option value="">Select...</option>
                    {POSITIONS.map((opt) => <option key={opt}>{opt}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Dominant Foot</label>
                  <select name="dominantFoot" value={form.dominantFoot} onChange={handleChange} className={inputCls}>
                    <option value="">Select...</option>
                    {FEET.map((opt) => <option key={opt}>{opt}</option>)}
                  </select>
                </div>
                <p className={`text-sm text-center mt-4 ${dm ? "text-gray-500" : "text-gray-500"}`}>
                  You can always update your profile later from settings.
                </p>
              </>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={prev}
                  className={`flex items-center gap-2 font-semibold hover:underline ${dm ? "text-[#00FF88]" : "text-green-600"}`}
                >
                  <FiArrowLeft /> Back
                </button>
              ) : (
                <div />
              )}
              {step < 3 ? (
                <button
                  type="button"
                  onClick={next}
                  className={`flex items-center gap-2 px-5 py-2 rounded-full shadow-md font-semibold ${dm ? "bg-[#00FF88] text-[#121212] hover:bg-[#00FF88]/90" : "bg-green-600 hover:bg-green-700 text-white"}`}
                >
                  Next <FiArrowRight />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-6 py-2 rounded-full font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${dm ? "bg-[#00FF88] text-[#121212] hover:bg-[#00FF88]/90" : "bg-green-600 hover:bg-green-700 text-white"}`}
                >
                  {submitting ? "Submitting..." : "Submit"}
                </button>
              )}
            </div>

            {/* Step indicators */}
            <div className="flex justify-center mt-6 gap-2">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-2 w-8 rounded-full transition-all duration-300 ${
                    s <= step
                      ? dm ? "bg-[#00FF88]" : "bg-green-600"
                      : dm ? "bg-[#2a2a2a]" : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
          </motion.form>
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
