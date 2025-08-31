import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";



export default function SignUp({ onSelect }) {
  const roles = [
    { id: "player", label: "Player", color: "from-green-500 to-green-700",path:"/playerLogin" },
    { id: "academy", label: "Academy", color: "from-blue-500 to-blue-700",path:"/Academylogin" },
    { id: "coach", label: "Coach", color: "from-yellow-500 to-yellow-700", path:"/CoachLogin" },
    { id: "scout", label: "Scout", color: "from-red-500 to-red-700", path:"/ScoutLogin" },
  ];
  const navigate = useNavigate();

  return (
    <section
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{
        backgroundImage: "url('/images/Soccer.jpg')", 
      }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>


      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative bg-white/95 rounded-2xl shadow-2xl p-10 max-w-2xl w-full text-center border border-gray-200"
      >
        <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 mb-4 text-green-600 hover:underline"
      >
        <ArrowLeft size={20} /> Back to Home
      </button>
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
          Welcome to <span className="text-green-600">Ballers<span className="text-black">Adda</span></span>
        </h1>
        <p className="text-gray-600 mb-8 text-lg">
          Select your role to continue. Lets reshape Indian Football.
        </p>
        <div className="grid grid-cols-2 gap-6">
          {roles.map((role, index) => (
            <motion.button
              key={role.id}
              onClick={() => navigate(role.path)}
              className={`bg-gradient-to-r ${role.color} text-white py-6 rounded-xl font-semibold shadow-lg hover:shadow-2xl transition-all text-lg hover:cursor-pointer`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {role.label}
            </motion.button>
          ))}
        </div>
        <p className="mt-8 text-sm text-gray-500">
          Already have an account?{" "}
          <Link to="/Login/LoginPage" href="/LoginPage" className="text-green-600 hover:underline font-medium">
            Login here
          </Link>
        </p>
        
      </motion.div>
    </section>
  );
}
