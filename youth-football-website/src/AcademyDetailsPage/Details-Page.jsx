import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LeftSidebar from "./Left-Card.jsx";
import {
  MapPin,
  Star,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Trophy,
  Users,
  Clock,
  Phone,
  Mail,
  Share2,
  Heart,
} from "lucide-react";
import NavBar from "../components/Navbar.jsx";
import TopNav from "../components/TopNav.jsx";
import BottomNav from "../components/BottomNav.jsx";
import { useIsMobile } from "../hooks/useIsMobile.js";
import { useSelector } from "react-redux";
import LeftCard from "./Left-Card.jsx";
import MiddleSection from "./Middle-Section.jsx";
import RightCard from "./Right-Card.jsx";


// --- MAIN PAGE LAYOUT ---
export default function AcademyDetailsPage({ACADEMY_DATA }) {
  const isMobile = useIsMobile();
  const dm = useSelector((state) => state.theme.darkMode);
  
  return (
    <div className={`min-h-screen font-sans pb-20 transition-colors duration-300 ${dm ? "bg-[#121212] text-gray-200" : "bg-[#F8F9FA] text-gray-800"}`}>
      {isMobile ? <TopNav /> : <NavBar />}

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 mt-18">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <LeftCard ACADEMY_DATA={ACADEMY_DATA}/>
          <MiddleSection ACADEMY_DATA={ACADEMY_DATA} />
          <RightCard ACADEMY_DATA={ACADEMY_DATA} />
        </div>
      </div>
    </div>
  );
}
