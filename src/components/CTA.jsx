import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

function CTA() {
  return (
    <section className="relative py-20 bg-gradient-to-br from-green-600 to-green-800 overflow-hidden">
      {/* Background Glow Effect */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-green-400 opacity-20 blur-3xl rounded-full -translate-x-1/2 -translate-y-1/2" />
      </div>

      {/* Content */}
      <motion.div
        className="max-w-3xl mx-auto text-center px-6"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.h2
          className="text-4xl md:text-5xl font-bold text-white mb-6 drop-shadow-lg"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Join the Ballers Revolution
        </motion.h2>

        <motion.p
          className="text-lg md:text-xl text-gray-100 mb-10 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          Be part of India's fastest-growing youth football community. Compete, connect, and showcase your talent like never before.
        </motion.p>

        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.6, type: "spring", stiffness: 120 }}
        >
          <Button
            size="lg"
            className="bg-white text-green-700 font-semibold shadow-lg hover:shadow-2xl hover:bg-green-50 transition-all hover:cursor-pointer"
          >
            Get Started
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}

export default CTA
