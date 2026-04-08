import Sidebar from "./Sidebar";
import TopNav from "../HomeComponents/TopNav";
import BottomNav from "../HomeComponents/BottomNav";
import { useSelector } from "react-redux";

/**
 * AppLayout wraps all authenticated pages.
 * - Desktop: sidebar on the left + scrollable content area
 * - Mobile: TopNav on top, BottomNav on bottom (existing components)
 */
export default function AppLayout({ children }) {
  const dm = useSelector((state) => state.theme.darkMode);

  return (
    <div className={`flex h-screen ${dm ? "bg-[#121212]" : "bg-white"}`}>
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Mobile top nav */}
      <div className="md:hidden">
        <TopNav />
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
        {children}
      </main>

      {/* Mobile bottom nav */}
      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  );
}
