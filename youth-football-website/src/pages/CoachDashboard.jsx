import React, { useState } from "react";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Plus, Shield, Search, ChevronRight, Activity, CalendarDays } from "lucide-react";
import { useGetAcademyRosterQuery, useGetCoachProfileQuery } from "../redux/slices/coachSlice";

export default function CoachDashboard() {
  const dm = useSelector((s) => s.theme.darkMode);
  
  const { data: profile, isLoading: profileLoading } = useGetCoachProfileQuery();
  const { data: roster, isLoading: rosterLoading } = useGetAcademyRosterQuery();

  const [activeTab, setActiveTab] = useState("roster");
  const [search, setSearch] = useState("");

  const filteredRoster = roster?.filter((player) => {
    const fullName = `${player.firstName} ${player.lastName}`.toLowerCase();
    const pos = (player.position || "").toLowerCase();
    const s = search.toLowerCase();
    return fullName.includes(s) || pos.includes(s);
  }) || [];

  if (profileLoading || rosterLoading) {
    return <div className="p-8 text-center animate-pulse text-gray-500">Loading Coach Engine...</div>;
  }

  if (!profile || !profile.academy) {
    return (
      <div className={`p-8 text-center ${dm ? "text-gray-400" : "text-gray-500"}`}>
        Your account is perfectly set up, but you are not linked to an Academy yet.
        Reach out to your Club Manager to send you an invite to their Roster!
      </div>
    );
  }

  return (
    <div className={`min-h-screen pb-20 ${dm ? "bg-[#121212] text-white" : "bg-gray-50 text-gray-900"}`}>
      
      {/* Dynamic Header */}
      <div className={`${dm ? "bg-[#1a1a1a] border-b border-[#87A98D]/15" : "bg-white border-b border-gray-200"}`}>
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border shadow-lg ${dm ? "bg-[#121212] border-[#00FF88]/30 shadow-black/40" : "bg-emerald-50 border-emerald-200"}`}>
              {profile.academy.academyLogoURL ? (
                <img src={profile.academy.academyLogoURL} alt="Academy" className="w-full h-full object-cover rounded-xl" />
              ) : (
                <Shield className={`w-8 h-8 ${dm ? "text-[#00FF88]" : "text-emerald-500"}`} />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Coach {profile.lastName}</h1>
              <p className={`text-sm font-medium mt-0.5 ${dm ? "text-[#00FF88]" : "text-emerald-600"}`}>
                {profile.academy.name}
              </p>
            </div>
          </div>
          
          <div className="hidden sm:flex items-center gap-3">
            <button className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-colors ${dm ? "bg-[#00FF88]/10 text-[#00FF88] hover:bg-[#00FF88]/20" : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"}`}>
              <CalendarDays className="w-4 h-4 inline mr-2" /> Schedule Match
            </button>
            <button className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-colors ${dm ? "bg-[#00FF88] text-[#121212] hover:bg-emerald-400" : "bg-emerald-600 text-white hover:bg-emerald-700"}`}>
              <Plus className="w-4 h-4 inline mr-2" /> Draft Team
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-6xl mx-auto px-4 md:px-8 flex gap-6">
          {["roster", "teams", "stats"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-sm font-bold uppercase tracking-wide relative transition-colors ${
                activeTab === tab 
                  ? (dm ? "text-[#00FF88]" : "text-emerald-600") 
                  : (dm ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600")
              }`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div layoutId="coachTab" className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full ${dm ? "bg-[#00FF88]" : "bg-emerald-600"}`} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        <AnimatePresence mode="wait">
          
          {activeTab === "roster" && (
            <motion.div key="roster" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h2 className="text-xl font-bold">Active Roster ({roster?.length || 0})</h2>
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search players or positions..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-all ${dm ? "bg-[#1a1a1a] border-gray-800 text-gray-200 focus:border-[#00FF88]/50" : "bg-white border-gray-200 focus:border-emerald-500"}`}
                  />
                </div>
              </div>

              {filteredRoster.length === 0 ? (
                <div className={`p-8 text-center rounded-2xl border border-dashed ${dm ? "border-gray-800 text-gray-500" : "border-gray-300 text-gray-400"}`}>
                  No players found in this academy.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredRoster.map((player) => (
                    <div key={player.id} className={`p-5 rounded-2xl border transition-all hover:scale-[1.02] cursor-pointer shadow-sm ${dm ? "bg-[#1a1a1a] border-[#87A98D]/10 hover:border-[#00FF88]/30 shadow-black/20" : "bg-white border-gray-100 hover:border-emerald-200"}`}>
                      <div className="flex items-center gap-4 mb-4">
                        <img 
                          src={player.profilePic || `https://ui-avatars.com/api/?name=${player.firstName}+${player.lastName}&background=random`} 
                          alt="avatar" 
                          className="w-12 h-12 rounded-full object-cover border-2 border-transparent"
                        />
                        <div>
                          <h3 className="font-bold text-sm">{player.firstName} {player.lastName}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-md font-bold mt-1 inline-block ${dm ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-600"}`}>
                            {player.position || "UTL"}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div className={`p-2 rounded-xl text-center ${dm ? "bg-[#121212]" : "bg-gray-50"}`}>
                          <div className={`text-[10px] uppercase font-bold tracking-wider mb-1 ${dm ? "text-gray-500" : "text-gray-400"}`}>Att</div>
                          <div className={`font-mono text-sm font-bold ${dm ? "text-[#00FF88]" : "text-emerald-600"}`}>{(Math.random() * 30 + 70).toFixed(0)}%</div>
                        </div>
                        <div className={`p-2 rounded-xl text-center ${dm ? "bg-[#121212]" : "bg-gray-50"}`}>
                          <div className={`text-[10px] uppercase font-bold tracking-wider mb-1 ${dm ? "text-gray-500" : "text-gray-400"}`}>Rating</div>
                          <div className={`font-mono text-sm font-bold ${dm ? "text-[#00DCFF]" : "text-blue-600"}`}>{(player.tournamentRatings || 0.0).toFixed(1)}</div>
                        </div>
                        <div className={`p-2 rounded-xl text-center ${dm ? "bg-[#121212]" : "bg-gray-50"}`}>
                          <div className={`text-[10px] uppercase font-bold tracking-wider mb-1 ${dm ? "text-gray-500" : "text-gray-400"}`}>Age</div>
                          <div className="font-mono text-sm font-bold opacity-80">{new Date().getFullYear() - new Date(player.dateOfBirth).getFullYear()}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "teams" && (
            <motion.div key="teams" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
               <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Tournament Teams</h2>
                <button className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors ${dm ? "bg-[#00FF88] text-[#121212]" : "bg-emerald-600 text-white"}`}>
                  <Plus className="w-4 h-4 inline mr-1" /> New Draft
                </button>
              </div>

              {profile.teams?.length === 0 ? (
                <div className={`p-12 text-center rounded-3xl border border-dashed ${dm ? "border-gray-800" : "border-gray-200"}`}>
                  <Activity className={`w-12 h-12 mx-auto mb-4 ${dm ? "text-gray-700" : "text-gray-300"}`} />
                  <h3 className="text-lg font-bold mb-2">No Active Teams</h3>
                  <p className={`text-sm max-w-md mx-auto ${dm ? "text-gray-500" : "text-gray-500"}`}>
                    To compete in a tournament, draft a new squad from your Academy's active roster.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                   {/* Map over profile.teams here eventually */}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "stats" && (
            <motion.div key="stats" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-8 text-center text-gray-500 font-mono text-sm uppercase tracking-widest">
              Performance Engine [Pending Activation]
            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
}
