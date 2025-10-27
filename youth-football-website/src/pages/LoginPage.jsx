import { motion } from "framer-motion";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FiPhone } from "react-icons/fi";
import OTP from "../components/OTP";

export default function LoginPage() {
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const [phoneNum, setPhoneNum] = useState("");
  const [isPhone, setIsPhone] = useState(false);
  const [isPhoneLogin, setIsPhoneLogin] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  return (
    <section
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{
        backgroundImage: "url()", // add background image if needed
      }}
    >
      <div className="absolute inset-0 bg-black/60"></div>

      {!isPhone && (
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-200"
        >
          <h1 className="text-3xl font-extrabold text-center text-gray-900 mb-6">
            Login to <span className="text-green-600">BallersAdda</span>
          </h1>

          <form className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={loginData.email}
                placeholder="Enter your email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={loginData.password}
                placeholder="Enter your password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                onChange={handleChange}
              />
            </div>

            <motion.button
              type="button"
              onClick={() => navigate("/")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-green-600 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-green-700 transition"
            >
              Login
            </motion.button>

            <div className="flex items-center justify-center gap-4 mt-4">
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center gap-2 w-1/2 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                <FcGoogle className="text-xl" />
                <span className="font-medium text-gray-700">Google</span>
              </motion.button>

              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsPhone(true)}
                className="flex items-center justify-center gap-2 w-1/2 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                <FiPhone className="text-xl text-green-600" />
                <span className="font-medium text-gray-700">Phone</span>
              </motion.button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Don’t have an account?{" "}
            <Link
              to="/Register"
              className="text-green-600 font-medium hover:underline"
            >
              Register
            </Link>
          </p>
          <p className="mt-6 text-center text-sm text-gray-600">
            <Link to="/" className="text-green-600 font-medium hover:underline">
              Back To Home
            </Link>
          </p>
        </motion.div>
      )}

      {isPhone && !isPhoneLogin && (
        <motion.div
          key="phone-login"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-200"
        >
          <h1 className="text-3xl font-extrabold text-center text-gray-900 mb-6">
            Login to <span className="text-green-600">BallersAdda</span>
          </h1>

          <form className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={phoneNum}
                placeholder="Enter your phone number"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                onChange={(e) => setPhoneNum(e.target.value)}
              />
            </div>

            <motion.button
              type="button"
              onClick={() => setIsPhoneLogin(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-green-600 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-green-700 transition"
            >
              Get OTP
            </motion.button>

            <button
              type="button"
              onClick={() => setIsPhone(false)}
              className="w-full text-green-600 font-medium mt-3 hover:underline"
            >
              Back to Email Login
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Don’t have an account?{" "}
            <Link
              to="/Register"
              className="text-green-600 font-medium hover:underline"
            >
              Register
            </Link>
          </p>
        </motion.div>
      )}
      {isPhoneLogin && (
        <OTP
          onBack={() => setIsPhoneLogin(false)}
          onVerify={() => navigate("/home")}
        />
      )}
    </section>
  );
}
