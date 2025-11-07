import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { FaTrophy, FaFutbol } from "react-icons/fa";
import { GiSoccerKick } from "react-icons/gi";
import api from "../api/axios";

// Animation Variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

export default function HeroHome() {
  const [academy, setAcademy] = useState(false);
  const [userName, setUserName] = useState("Player");
  //For fetching players username
  const fetchUserName = async () => {
    try {
      const res = await api.get("/auth/profile");
      setUserName(res.data.username);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };
  useEffect(() => {
    fetchUserName();
  }, []);

  return (
    <>
      {/* ================= Hero Section ================= */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="relative flex flex-col md:flex-row justify-between items-center px-8 md:px-16 py-12 bg-gradient-to-br from-white to-green-50 overflow-hidden rounded-2xl shadow-sm border border-green-100 mt-17"
      >
        {/* Left */}
        <motion.div variants={fadeInUp} className="z-10 space-y-5 max-w-xl">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
            Welcome back, <span className="text-green-600">{userName}</span>
          </h1>

          <motion.p variants={fadeInUp} className="text-lg text-gray-600">
            Keep pushing — your next{" "}
            <span className="text-green-600 font-medium">big win</span> is
            around the corner.
          </motion.p>

          <motion.div variants={staggerContainer} className="flex gap-4 mt-6">
            <motion.button
              variants={fadeInUp}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="bg-green-600 text-white px-6 py-3 rounded-full font-semibold shadow-md hover:bg-green-700 transition"
            >
              Join Tournament
            </motion.button>

            <motion.button
              variants={fadeInUp}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="border border-green-600 text-green-600 px-6 py-3 rounded-full font-semibold hover:bg-green-50 transition"
            >
              View My Stats
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Right */}
        <motion.div
          variants={fadeInUp}
          className="relative flex flex-wrap justify-center items-center gap-4 w-full md:w-[350px] p-4 mr-40"
        >
          {[
            { icon: <GiSoccerKick />, label: "Matches", value: "0" },
            { icon: <FaFutbol />, label: "Goals", value: "0" },
            { icon: <FaTrophy />, label: "Rank", value: "Unranked" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05, rotate: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="bg-white rounded-xl shadow-lg px-5 py-3 flex items-center gap-3 border border-green-100 hover:shadow-green-100/50 transition-shadow duration-300"
            >
              <div className="text-green-600 text-2xl">{stat.icon}</div>
              <div>
                <p className="text-xs text-gray-500">{stat.label}</p>
                <p className="font-semibold text-gray-800 text-sm">
                  {stat.value}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.3 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="absolute bottom-0 right-0 w-72 h-72 bg-green-100 rounded-full blur-3xl"
        />
      </motion.section>

      {/* ================= Progress Section ================= */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
        className="mt-12 px-6 md:px-16"
      >
        <motion.h2
          variants={fadeInUp}
          className="text-2xl font-bold text-gray-900 mb-6"
        >
          My Progress
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "XP Points", value: "1,250", color: "bg-green-50" },
            {
              label: "Skill Level",
              value: "Intermediate",
              color: "bg-yellow-50",
            },
            { label: "Win Rate", value: "68%", color: "bg-blue-50" },
            { label: "Badges Earned", value: "6", color: "bg-purple-50" },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              variants={fadeInUp}
              whileHover={{ scale: 1.04, y: -3 }}
              transition={{ type: "spring", stiffness: 250 }}
              className={`${stat.color} p-6 rounded-2xl shadow-sm border border-gray-200 text-center hover:shadow-md`}
            >
              <p className="text-gray-500 text-sm">{stat.label}</p>
              <p className="text-2xl font-semibold text-gray-800 mt-1">
                {stat.value}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ================= Academy Section ================= */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
        className="mt-16 px-6 md:px-16"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6">My Academy</h2>

        {academy ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-r from-green-600 to-emerald-500 rounded-2xl p-6 text-white flex flex-col sm:flex-row items-center justify-between"
          >
            <div className="flex items-center gap-4">
              {academy.logo && (
                <img
                  src={academy.logo}
                  alt={`${academy.name} logo`}
                  className="w-14 h-14 rounded-xl object-cover border-2 border-white"
                />
              )}
              <div>
                <h3 className="text-xl font-bold">{academy.name}</h3>
                <p className="text-sm text-green-50 mt-1">
                  Joined: {academy.joinedDate} • Level: {academy.level}
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="mt-4 sm:mt-0 bg-white text-green-700 px-5 py-2 rounded-full font-medium hover:shadow-lg transition"
            >
              View Training Plan
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-gray-50 border border-dashed border-green-300 rounded-2xl p-10 text-center"
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              You’re not enrolled in any academy yet
            </h3>
            <p className="text-gray-600 mb-4">
              Join a local football academy to start tracking your training and
              progress!
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full font-medium transition"
            >
              Enroll Now
            </motion.button>
          </motion.div>
        )}
      </motion.section>

      {/* ================= Other Sections ================= */}
      {/* ================= Upcoming Tournaments ================= */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
        className="mt-16 px-6 md:px-16"
      >
        <motion.div
          variants={fadeInUp}
          className="flex justify-between items-center mb-6"
        >
          <h2 className="text-2xl font-bold text-gray-900">
            Upcoming Tournaments
          </h2>
          <motion.button
            whileHover={{ x: 4 }}
            className="text-green-600 hover:underline text-sm font-medium"
          >
            View All →
          </motion.button>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((tournament, i) => (
            <motion.div
              key={i}
              variants={fadeInUp}
              whileHover={{ scale: 1.04, y: -3 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-green-100/60 transition-all duration-300"
            >
              <motion.div
                initial={{ scale: 1.1 }}
                whileHover={{ scale: 1 }}
                className="h-40 bg-gradient-to-r from-green-200 to-green-100 bg-cover bg-center flex items-center justify-center text-gray-700 font-semibold text-xl"
              >
                Tournament {i + 1}
              </motion.div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  U-18 Hyderabad Cup
                </h3>
                <p className="text-sm text-gray-500">Starts: Nov 12, 2025</p>
                <p className="text-sm text-gray-500">Location: Hyderabad</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="mt-3 w-full bg-green-600 text-white py-2 rounded-full font-medium hover:bg-green-700 transition"
                >
                  Join Now
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ================= Recent Activity ================= */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeInUp}
        className="mt-16 px-6 md:px-16"
      >
        <motion.h2
          variants={fadeInUp}
          className="text-2xl font-bold text-gray-900 mb-6"
        >
          Recent Activity
        </motion.h2>

        <motion.div
          variants={fadeInUp}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100 overflow-hidden"
        >
          {[
            "You joined the U-18 Hyderabad Cup.",
            "Scored 2 goals in your last match!",
            "Your ranking improved to #5 in Hyderabad.",
          ].map((activity, i) => (
            <motion.div
              key={i}
              whileHover={{ backgroundColor: "#f9fdf9" }}
              transition={{ duration: 0.2 }}
              className="p-4 flex items-center gap-3"
            >
              <motion.div
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [1, 0.7, 1],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2.5,
                  delay: i * 0.5,
                }}
                className="w-2 h-2 rounded-full bg-green-600"
              ></motion.div>
              <p className="text-gray-700">{activity}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* ================= Top Players Near You ================= */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
        className="mt-16 px-6 md:px-16 mb-20"
      >
        <motion.div
          variants={fadeInUp}
          className="flex justify-between items-center mb-6"
        >
          <h2 className="text-2xl font-bold text-gray-900">
            Top Players Near You
          </h2>
          <motion.button
            whileHover={{ x: 4 }}
            className="text-green-600 hover:underline text-sm font-medium"
          >
            View Full Leaderboard →
          </motion.button>
        </motion.div>

        <motion.div
          variants={fadeInUp}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4"
        >
          {[
            { name: "Aarav Singh", rank: 1, goals: 28 },
            { name: "Rohan Das", rank: 2, goals: 25 },
            { name: "You", rank: 5, goals: 12 },
          ].map((p) => (
            <motion.div
              key={p.rank}
              whileHover={{
                scale: 1.01,
                backgroundColor: "#f9fdf9",
              }}
              className="flex items-center justify-between py-3 border-b last:border-b-0 px-2 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <motion.span
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: p.rank * 0.1 }}
                  className="text-green-600 font-bold"
                >
                  #{p.rank}
                </motion.span>
                <p className="font-medium text-gray-800">{p.name}</p>
              </div>
              <p className="text-sm text-gray-600">{p.goals} goals</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* You can apply the same fadeInUp + whileInView pattern to Tournaments, Activity, Leaderboard, etc. */}
    </>
  );
}
