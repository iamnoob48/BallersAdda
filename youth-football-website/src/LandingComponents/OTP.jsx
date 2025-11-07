import { useState, useRef } from "react";
import { motion } from "framer-motion";

export default function OTPVerification({ onVerify, onBack }) {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const inputsRef = useRef([]);

  const handleChange = (value, index) => {
    if (/^[0-9]?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < otp.length - 1) {
        inputsRef.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        inputsRef.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < otp.length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleSubmit = () => {
    const enteredOtp = otp.join("");
    if (enteredOtp.length === otp.length) onVerify(enteredOtp);
    else alert("Please enter the full OTP");
  };

  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-200"
    >
      <h1 className="text-3xl font-extrabold text-center text-gray-900 mb-2">
        Verify OTP
      </h1>

      <p className="text-center text-gray-600 mb-6 text-sm">
        We’ve sent a 4-digit OTP to your registered phone number.
        <br />
        Please enter it below to continue.
      </p>

      <div className="flex justify-between mb-6">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputsRef.current[index] = el)}
            id={`otp-${index}`}
            type="text"
            maxLength="1"
            value={digit}
            onChange={(e) => handleChange(e.target.value, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className="w-14 h-14 text-center text-xl font-semibold border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none shadow-sm"
          />
        ))}
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleSubmit}
        className="w-full bg-green-600 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-green-700 transition"
      >
        Verify & Continue
      </motion.button>

      <div className="flex justify-between items-center mt-4">
        <button
          onClick={onBack}
          className="text-green-600 text-sm font-medium hover:underline"
        >
          Back
        </button>
        <button className="text-gray-500 text-sm hover:text-green-600 transition">
          Resend OTP
        </button>
      </div>
    </motion.div>
  );
}
