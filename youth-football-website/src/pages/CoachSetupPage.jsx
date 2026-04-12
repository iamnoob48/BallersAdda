import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { Save, User, FileText, Briefcase, Hash } from "lucide-react";
import { useGetCoachProfileQuery, useUpdateCoachProfileMutation } from "../redux/slices/coachSlice";

export default function CoachSetupPage() {
  const navigate = useNavigate();
  const dm = useSelector((s) => s.theme.darkMode);

  const { data: profile, isLoading } = useGetCoachProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateCoachProfileMutation();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    bio: "",
    experienceYears: "",
    certifications: "",
    coachLicenceNo: "",
  });

  const [error, setError] = useState("");

  useEffect(() => {
    if (profile) {
      if (profile.firstName !== "Pending") {
        setForm({
          firstName: profile.firstName,
          lastName: profile.lastName || "",
          bio: profile.bio || "",
          experienceYears: profile.experienceYears || "",
          certifications: profile.certifications || "",
          coachLicenceNo: profile.coachLicenceNo || "",
        });
      }
    }
  }, [profile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError("First and last name are required.");
      return;
    }

    try {
      await updateProfile(form).unwrap();
      navigate("/coach-dashboard");
    } catch (err) {
      setError(err?.data?.message || "Something went wrong saving the profile.");
    }
  };

  if (isLoading) return <div className="p-8 text-center">Loading profile...</div>;

  return (
    <div className={`min-h-screen py-10 px-4 md:px-8 ${dm ? "bg-[#121212] text-white" : "bg-gray-50 text-gray-900"}`}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Complete Your Coach Profile</h1>
        <p className={`mb-8 ${dm ? "text-gray-400" : "text-gray-500"}`}>
          Please fill out your official coaching details before accessing the roster.
        </p>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
            {error}
          </div>
        )}

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className={`rounded-3xl p-6 md:p-8 border shadow-sm ${dm ? "bg-[#1a1a1a] border-[#87A98D]/15" : "bg-white border-gray-200"}`}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-xs font-bold uppercase block mb-1">First Name *</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input required value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none transition-all ${dm ? "bg-[#121212] border-gray-800 focus:border-[#00FF88]/50" : "bg-gray-50 border-gray-200 focus:border-blue-500"}`} />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold uppercase block mb-1">Last Name *</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input required value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none transition-all ${dm ? "bg-[#121212] border-gray-800 focus:border-[#00FF88]/50" : "bg-gray-50 border-gray-200 focus:border-blue-500"}`} />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase block mb-1">Coaching Bio</label>
              <textarea rows={3} value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} placeholder="Describe your coaching philosophy..."
                className={`w-full p-4 rounded-xl border text-sm outline-none transition-all ${dm ? "bg-[#121212] border-gray-800 focus:border-[#00FF88]/50" : "bg-gray-50 border-gray-200 focus:border-blue-500"}`} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="text-xs font-bold uppercase block mb-1">Years Exp.</label>
                <div className="relative">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="number" min="0" value={form.experienceYears} onChange={e => setForm({...form, experienceYears: e.target.value})}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none transition-all ${dm ? "bg-[#121212] border-gray-800 focus:border-[#00FF88]/50" : "bg-gray-50 border-gray-200 focus:border-blue-500"}`} />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-bold uppercase block mb-1">License / ID No.</label>
                <div className="relative">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input value={form.coachLicenceNo} onChange={e => setForm({...form, coachLicenceNo: e.target.value})} placeholder="e.g. AIFF-D-1234"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none transition-all ${dm ? "bg-[#121212] border-gray-800 focus:border-[#00FF88]/50" : "bg-gray-50 border-gray-200 focus:border-blue-500"}`} />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase block mb-1">Certifications</label>
              <div className="relative">
                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input value={form.certifications} onChange={e => setForm({...form, certifications: e.target.value})} placeholder="e.g. AFC C-License, UEFA B"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none transition-all ${dm ? "bg-[#121212] border-gray-800 focus:border-[#00FF88]/50" : "bg-gray-50 border-gray-200 focus:border-blue-500"}`} />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button type="submit" disabled={isUpdating} className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 ${dm ? "bg-[#00FF88] text-[#121212] hover:bg-emerald-400" : "bg-blue-600 text-white hover:bg-blue-700"}`}>
                {isUpdating ? "Saving..." : <><Save className="w-4 h-4" /> Save Profile</>}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
