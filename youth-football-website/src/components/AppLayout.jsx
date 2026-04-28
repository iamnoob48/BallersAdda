import Sidebar from "./Sidebar";
import NavBar from "./Navbar";
import TopNav from "./TopNav";
import BottomNav from "./BottomNav";
import { useSelector } from "react-redux";

/**
 * AppLayout wraps all authenticated pages.
 * - Desktop: top Navbar + sidebar on the left + scrollable content
 * - Mobile: TopNav on top, BottomNav on bottom
 */
export default function AppLayout({ children }) {
  const dm = useSelector((state) => state.theme.darkMode);

  return (
    <div className={`flex flex-col h-screen ${dm ? "bg-[#121212]" : "bg-white"}`}>
      {/* Desktop: top navbar spanning full width */}
      <div className="hidden md:block">
        <NavBar />
      </div>

      {/* Mobile: top nav */}
      <div className="md:hidden">
        <TopNav />
      </div>

      {/* Below navbar: sidebar + content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        <Sidebar />

        {/* Main content — pt accounts for fixed navbar height */}
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0 md:pt-16">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  );
}
