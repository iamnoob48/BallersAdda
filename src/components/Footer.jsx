import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Footer = () => {
  const [showButton, setShowButton] = useState(false);

  // Detect scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowButton(true);
      } else {
        setShowButton(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Smooth scroll to top
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-gray-900 text-gray-300 py-6 relative">
      {/* Top border accent */}
      <div className="h-1 bg-gradient-to-r from-green-400 via-green-500 to-green-600"></div>

      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Logo / Brand */}
        <p className="text-sm md:text-base text-gray-400">
          © {new Date().getFullYear()} Youth Football India. All rights reserved.
        </p>

        {/* Links */}
        <div className="flex space-x-6">
          <a
            href="#about"
            className="hover:text-green-400 transition-colors duration-200"
          >
            About Us
          </a>
          <a
            href="#contact"
            className="hover:text-green-400 transition-colors duration-200"
          >
            Contact Us
          </a>
        </div>
      </div>

      {/* Back to Home Button with animation */}
      <AnimatePresence>
        {showButton && (
          <motion.button
            key="backToTop"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-400 text-white p-3 rounded-full shadow-lg hover:shadow-green-400/50 transition-all duration-300"
            aria-label="Back to Top"
          >Navigate to top
          
          </motion.button>
        )}
      </AnimatePresence>
    </footer>
  );
};

export default Footer;
