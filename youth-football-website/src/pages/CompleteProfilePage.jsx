import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiArrowRight, FiArrowLeft } from "react-icons/fi";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function CompleteProfilePage() {
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

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white py-10 px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-2xl p-8"
      >
        <h1 className="text-3xl font-extrabold text-center text-green-700 mb-8">
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
                  <InputField
                    label="First Name"
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    required
                  />
                  <InputField
                    label="Last Name"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <InputField
                  label="Display Name"
                  name="displayName"
                  value={form.displayName}
                  onChange={handleChange}
                  placeholder="Your public name (optional)"
                />
                <TextAreaField
                  label="Bio"
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  placeholder="Introduce yourself as a player (optional)"
                />
              </>
            )}

            {step === 2 && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField
                    label="Age"
                    name="age"
                    type="number"
                    value={form.age}
                    onChange={handleChange}
                  />
                  <SelectField
                    label="Gender"
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    options={["Male", "Female", "Other"]}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField
                    label="Height (cm)"
                    name="height"
                    type="number"
                    value={form.height}
                    onChange={handleChange}
                  />
                  <InputField
                    label="Weight (kg)"
                    name="weight"
                    type="number"
                    value={form.weight}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <SelectField
                  label="Preferred Position"
                  name="position"
                  value={form.position}
                  onChange={handleChange}
                  options={[
                    "Goalkeeper",
                    "Defender",
                    "Midfielder",
                    "Forward",
                    "Winger",
                  ]}
                />
                <SelectField
                  label="Dominant Foot"
                  name="dominantFoot"
                  value={form.dominantFoot}
                  onChange={handleChange}
                  options={["Right", "Left", "Both"]}
                />
                <p className="text-sm text-gray-500 text-center mt-4">
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
                  className="flex items-center gap-2 text-green-600 font-semibold hover:underline"
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
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-full shadow-md font-semibold"
                >
                  Next <FiArrowRight />
                </button>
              ) : (
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full font-semibold shadow-md"
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
                    s <= step ? "bg-green-600" : "bg-gray-200"
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

function InputField({ label, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        {...props}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
      />
    </div>
  );
}

function TextAreaField({ label, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <textarea
        {...props}
        rows={3}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none resize-none"
      />
    </div>
  );
}

function SelectField({ label, options, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <select
        {...props}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
      >
        <option value="">Select...</option>
        {options.map((opt) => (
          <option key={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}
