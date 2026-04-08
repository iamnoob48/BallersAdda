import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiArrowRight, FiArrowLeft } from "react-icons/fi";
import { useSelector } from "react-redux";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function CompleteProfilePage() {
  const dm = useSelector((state) => state.theme.darkMode);
  const [step, setStep] = useState(1);
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

  const next = () => setStep((s) => Math.min(s + 1, 3));
  const prev = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      await api
        .post("/player/createPlayerProfile", {
          firstName: form.firstName,
          lastName: form.lastName,
          displayName: form.displayName,
          bio: form.bio,
          age: form.age,
          gender: form.gender,
          height: form.height,
          weight: form.weight,
          position: form.position,
          dominantFoot: form.dominantFoot,
        })
        .then(() => {
          console.log("Profile submitted successfully");
        });
      navigate("/profile");
    } catch (error) {
      console.log("Error submitting profile:", error);
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
                    <label className={labelCls}>First Name</label>
                    <input name="firstName" value={form.firstName} onChange={handleChange} required className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Last Name</label>
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
                    <input name="age" type="number" value={form.age} onChange={handleChange} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Gender</label>
                    <select name="gender" value={form.gender} onChange={handleChange} className={inputCls}>
                      <option value="">Select...</option>
                      {["Male", "Female", "Other"].map((opt) => <option key={opt}>{opt}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Height (cm)</label>
                    <input name="height" type="number" value={form.height} onChange={handleChange} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Weight (kg)</label>
                    <input name="weight" type="number" value={form.weight} onChange={handleChange} className={inputCls} />
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
                    {["Goalkeeper", "Defender", "Midfielder", "Forward", "Winger"].map((opt) => <option key={opt}>{opt}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Dominant Foot</label>
                  <select name="dominantFoot" value={form.dominantFoot} onChange={handleChange} className={inputCls}>
                    <option value="">Select...</option>
                    {["Right", "Left", "Both"].map((opt) => <option key={opt}>{opt}</option>)}
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
                  className={`px-6 py-2 rounded-full font-semibold shadow-md ${dm ? "bg-[#00FF88] text-[#121212] hover:bg-[#00FF88]/90" : "bg-green-600 hover:bg-green-700 text-white"}`}
                >
                  Submit
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
