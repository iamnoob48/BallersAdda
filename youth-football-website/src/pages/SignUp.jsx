import { motion } from "framer-motion";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { FiPhone } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";

export default function SignUp() {
  const [signUpData, setSignUpData] = useState({
    email: "",
    password: "",
    username: "",
  });
  const [isPhone, setIsPhone] = useState(false);
  const [errors, setErrors] = useState([]);

  const navigate = useNavigate();

  //For validating email
  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  //For submiting the form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!signUpData.username) {
      setErrors("Username is required.");
      return;
    }
    if (!validateEmail(signUpData.email)) {
      setErrors("Please enter a valid email address.");
      return;
    }
    if (!signUpData.password || signUpData.password.length < 6) {
      setErrors("Password must be at least 6 characters long.");
      return;
    }

    // Handle sign-up logic here
    const res = await fetch("/api/v1/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(signUpData),
    });
    const data = await res.json();
    if (res.ok) {
      // Registration successful, navigate to login or home page
      navigate("/login");
    } else {
      // Handle errors (you can enhance this to show specific error messages)
      setErrors(data.errors || ["Registration failed. Please try again."]);
    }
  };

  const handleChange = (e) => {
    setSignUpData({ ...signUpData, [e.target.name]: e.target.value });
  };
  return (
    <section className="min-h-screen flex items-center justify-center relative bg-gradient-to-br from-gray-400 to-white overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.6, 0] }}
        transition={{ delay: 2, duration: 3, ease: "easeInOut" }}
        className="absolute top-20 right-20 w-40 h-40 rounded-full bg-gray-400/30 blur-3xl"
      ></motion.div>

      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-200"
      >
        <h1 className="text-3xl font-extrabold text-center text-gray-900 mb-6">
          <span className="text-green-600">Register</span>
        </h1>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={signUpData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={signUpData.email}
              placeholder="Enter your email"
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={signUpData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
            />
          </div>

          {/* Register Button */}
          <motion.button
            type="submit"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="w-full bg-green-600 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-green-700 transition"
          >
            Register
          </motion.button>
          {errors && (
            <div>
              <p className="text-sm text-red-400 ">{errors}</p>
            </div>
          )}

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
          Already have an account?{" "}
          <Link
            to="/Login"
            className="text-green-600 font-medium hover:underline"
          >
            Login
          </Link>
        </p>
        <p className="mt-6 text-center text-sm text-gray-600">
          <Link to="/" className="text-green-600 font-medium hover:underline">
            Back To Home
          </Link>
        </p>
      </motion.div>
    </section>
  );
}
