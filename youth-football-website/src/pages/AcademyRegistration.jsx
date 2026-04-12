import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { Shield, Building2, MapPin, Mail, Hash, Phone, Users, CheckCircle2, ChevronRight, Loader2, XCircle } from "lucide-react";
import { useRegisterAcademyMutation } from "../redux/slices/academySlice";
import { updateCredentials } from "../redux/slices/authSlice";
import api from "../api/axios";
import debounce from "lodash.debounce";

// ── Components ─────────────────────────────────────────────────────────

const Input = ({ label, icon: Icon, dm, error, ...props }) => (
  <div className="w-full">
    <label className={`text-xs font-bold uppercase tracking-wide mb-1.5 block flex items-center gap-2 ${dm ? "text-gray-400" : "text-gray-500"}`}>
      {Icon && <Icon className="w-3.5 h-3.5" />} {label}
    </label>
    <div className="relative">
      <input
        {...props}
        className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all ${
          error
            ? "border-red-500 ring-2 ring-red-500/20"
            : dm
            ? "bg-[#121212] border-[#87A98D]/20 text-gray-200 placeholder:text-gray-600 focus:border-[#00FF88]/50 focus:ring-2 focus:ring-[#00FF88]/20"
            : "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
        }`}
      />
    </div>
    {error && <p className="text-red-500 text-xs mt-1.5 font-medium">{error}</p>}
  </div>
);

// ── Main Page ────────────────────────────────────────────────────────

export default function AcademyRegistration() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const dm = useSelector((s) => s.theme.darkMode);
  
  const [step, setStep] = useState(1);
  const [registerAcademy, { isLoading }] = useRegisterAcademyMutation();

  const [form, setForm] = useState({
    name: "", city: "", state: "", country: "", address: "",
    licenseNo: "", contactEmail: "", contactPhone: "",
    numberOfCoaches: 0,
    coachesEmails: []
  });

  const [coachStatus, setCoachStatus] = useState({}); // { 0: 'loading', 1: 'valid', 2: 'invalid' }
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");

  // Validate coaches specifically
  const checkEmailApi = async (email, index) => {
    if (!email.trim()) {
      setCoachStatus(prev => ({ ...prev, [index]: 'empty' }));
      return;
    }
    setCoachStatus(prev => ({ ...prev, [index]: 'loading' }));
    try {
      const { data } = await api.get(`/auth/check-email/${email}`);
      setCoachStatus(prev => ({ ...prev, [index]: data.exists ? 'valid' : 'ghost' }));
    } catch (err) {
      setCoachStatus(prev => ({ ...prev, [index]: 'invalid' }));
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedCheck = useCallback(debounce(checkEmailApi, 500), []);

  const handleCoachChange = (index, value) => {
    const newCoaches = [...form.coachesEmails];
    newCoaches[index] = value;
    setForm(prev => ({ ...prev, coachesEmails: newCoaches }));
    debouncedCheck(value, index);
  };

  const handleNumCoachesChange = (e) => {
    const num = parseInt(e.target.value) || 0;
    setForm(prev => {
      const arr = [...prev.coachesEmails];  
      if (num < arr.length) arr.length = num;
      while(arr.length < num) arr.push("");
      return { ...prev, numberOfCoaches: num, coachesEmails: arr };
    });
  };

  const validateStep = () => {
    const e = {};
    if (step === 1) {
      if (!form.name.trim()) e.name = "Academy Name is required";
      if (!form.country.trim()) e.country = "Country is required";
      if (!form.state.trim()) e.state = "State is required";
      if (!form.city.trim()) e.city = "City is required";
      if (!form.address.trim()) e.address = "Address is required";
    }
    if (step === 2) {
      if (!form.contactEmail.trim() || !/^\S+@\S+\.\S+$/.test(form.contactEmail)) e.contactEmail = "Valid email is required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const nextStep = () => validateStep() && setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    setApiError("");
    try {
      // Clean empty emails
      const cleanedForm = {
        ...form,
        coachesEmails: form.coachesEmails.filter(u => u.trim() !== "")
      };
      
      const payload = await registerAcademy(cleanedForm).unwrap();
      
      // Update local credentials to unlock dashboard immediately
      dispatch(updateCredentials(payload.user));
      
      setStep(4); // Success step
    } catch (err) {
      const errMsg = err?.data?.message || "Something went wrong.";
      if (err?.data?.invalidEmails?.length > 0) {
        setApiError(`${errMsg} Invalid emails: ${err.data.invalidEmails.join(", ")}`);
      } else {
        setApiError(errMsg);
      }
    }
  };

  const STEPS_CONFIG = [
    { num: 1, title: "Identity", desc: "Basic details" },
    { num: 2, title: "Contact", desc: "How to reach you" },
    { num: 3, title: "Coaches", desc: "Link your staff" },
  ];

  return (
    <div className={`min-h-screen py-10 px-4 md:px-8 ${dm ? "bg-[#121212]" : "bg-gray-50"}`}>
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-lg ${dm ? "bg-[#1a1a1a] shadow-black/40" : "bg-white border shadow-sm"}`}>
            <Shield className={`w-8 h-8 ${dm ? "text-[#00FF88]" : "text-emerald-600"}`} />
          </div>
          <h1 className={`text-3xl font-extrabold tracking-tight mb-2 ${dm ? "text-white" : "text-gray-900"}`}>
            Register Your Academy
          </h1>
          <p className={dm ? "text-gray-400" : "text-gray-500"}>
            Join the BallersAdda network and manage your players and staff seamlessly.
          </p>
        </div>

        {/* Stepper */}
        {step < 4 && (
          <div className="flex justify-between items-center mb-8 relative">
            <div className={`absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 z-0 rounded-full ${dm ? "bg-[#1a1a1a]" : "bg-gray-200"}`}>
              <motion.div 
                className={`h-full rounded-full ${dm ? "bg-[#00FF88]" : "bg-emerald-500"}`}
                animate={{ width: `${((step - 1) / 2) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            {STEPS_CONFIG.map((s, i) => (
              <div key={s.num} className="relative z-10 flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 ${
                  step >= s.num 
                    ? (dm ? "bg-[#00FF88] text-[#121212]" : "bg-emerald-600 text-white") 
                    : (dm ? "bg-[#1a1a1a] text-gray-500 border border-[#87A98D]/20" : "bg-white text-gray-400 border border-gray-200")
                }`}>
                  {step > s.num ? <CheckCircle2 className="w-5 h-5" /> : s.num}
                </div>
                <span className={`text-[10px] uppercase font-bold tracking-widest hidden sm:block ${
                  step >= s.num ? (dm ? "text-[#00FF88]" : "text-emerald-700") : (dm ? "text-gray-600" : "text-gray-400")
                }`}>{s.title}</span>
              </div>
            ))}
          </div>
        )}

        {/* Form Container */}
        <AnimatePresence mode="wait">
          {apiError && (
             <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 mb-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium flex items-center gap-3"
            >
              <XCircle className="w-5 h-5" />
              {apiError}
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className={`rounded-3xl p-6 md:p-8 border shadow-xl ${dm ? "bg-[#1a1a1a] border-[#87A98D]/15 shadow-black/40" : "bg-white border-gray-200"}`}>
              <h2 className={`text-xl font-bold mb-6 ${dm ? "text-white" : "text-gray-900"}`}>Step 1: Academy Identity</h2>
              <div className="space-y-5">
                <Input label="Academy Name" icon={Building2} dm={dm} placeholder="Hyderabad Elite FC"
                  value={form.name} onChange={e => setForm({...form, name: e.target.value})} error={errors.name} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Input label="Country" icon={MapPin} dm={dm} placeholder="India"
                    value={form.country} onChange={e => setForm({...form, country: e.target.value})} error={errors.country} />
                  <Input label="State" icon={MapPin} dm={dm} placeholder="Telangana"
                    value={form.state} onChange={e => setForm({...form, state: e.target.value})} error={errors.state} />
                  <Input label="City" icon={MapPin} dm={dm} placeholder="Hyderabad"
                    value={form.city} onChange={e => setForm({...form, city: e.target.value})} error={errors.city} />
                  <Input label="Address" icon={MapPin} dm={dm} placeholder="123 Pitch Street"
                    value={form.address} onChange={e => setForm({...form, address: e.target.value})} error={errors.address} />
                </div>
              </div>
              <div className="mt-8 flex justify-end">
                <button onClick={nextStep} className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 ${dm ? "bg-[#00FF88] text-[#121212]" : "bg-emerald-600 text-white"}`}>
                  Next Step <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className={`rounded-3xl p-6 md:p-8 border shadow-xl ${dm ? "bg-[#1a1a1a] border-[#87A98D]/15 shadow-black/40" : "bg-white border-gray-200"}`}>
              <h2 className={`text-xl font-bold mb-6 ${dm ? "text-white" : "text-gray-900"}`}>Step 2: Contact & Licensing</h2>
              <div className="space-y-5">
                <Input label="License Number (Optional)" icon={Hash} dm={dm} placeholder="LCN-2026-X"
                  value={form.licenseNo} onChange={e => setForm({...form, licenseNo: e.target.value})} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Input label="Contact Email" icon={Mail} dm={dm} placeholder="hello@elitefc.com" type="email"
                    value={form.contactEmail} onChange={e => setForm({...form, contactEmail: e.target.value})} error={errors.contactEmail} />
                  <Input label="Contact Phone" icon={Phone} dm={dm} placeholder="+91 9876543210"
                    value={form.contactPhone} onChange={e => setForm({...form, contactPhone: e.target.value})} />
                </div>
              </div>
              <div className="mt-8 flex justify-between">
                <button onClick={prevStep} className={`px-6 py-3 rounded-xl font-bold ${dm ? "text-gray-400 hover:bg-[#121212]" : "text-gray-600 hover:bg-gray-100"}`}>
                  Back
                </button>
                <button onClick={nextStep} className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 ${dm ? "bg-[#00FF88] text-[#121212]" : "bg-emerald-600 text-white"}`}>
                  Next Step <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className={`rounded-3xl p-6 md:p-8 border shadow-xl ${dm ? "bg-[#1a1a1a] border-[#87A98D]/15 shadow-black/40" : "bg-white border-gray-200"}`}>
              <h2 className={`text-xl font-bold mb-4 ${dm ? "text-white" : "text-gray-900"}`}>Step 3: Link Your Staff</h2>
              <p className={`text-sm mb-6 ${dm ? "text-gray-400" : "text-gray-500"}`}>
                Link existing BallersAdda users to your academy as Coaches by their exact email.
              </p>

              <div className="mb-6">
                <label className={`text-xs font-bold uppercase tracking-wide mb-1.5 block flex items-center gap-2 ${dm ? "text-gray-400" : "text-gray-500"}`}>
                  <Users className="w-3.5 h-3.5" /> Number of Coaches
                </label>
                <select
                  value={form.numberOfCoaches}
                  onChange={handleNumCoachesChange}
                  className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all ${
                    dm ? "bg-[#121212] border-[#87A98D]/20 text-gray-200 focus:border-[#00FF88]/50" : "bg-gray-50 border-gray-200 focus:border-emerald-500"
                  }`}
                >
                  {[0,1,2,3,4,5].map(n => <option key={n} value={n}>{n} {n === 1 ? 'Coach' : 'Coaches'}</option>)}
                </select>
              </div>

              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {form.coachesEmails.map((email, i) => (
                  <div key={i} className="relative">
                    <input
                      placeholder={`Coach ${i+1} Email`}
                      value={email}
                      onChange={(e) => handleCoachChange(i, e.target.value)}
                      className={`w-full px-4 py-3 pr-10 rounded-xl border text-sm outline-none transition-all ${
                        dm ? "bg-[#121212] border-[#87A98D]/20 text-gray-200 placeholder:text-gray-600 focus:border-[#00FF88]/50" : "bg-gray-50 border-gray-200 placeholder:text-gray-400 focus:border-emerald-500"
                      } ${coachStatus[i] === 'invalid' ? 'border-red-500' : coachStatus[i] === 'valid' ? (dm ? 'border-[#00FF88]/50' : 'border-emerald-400') : coachStatus[i] === 'ghost' ? 'border-yellow-500/50' : ''}`}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {coachStatus[i] === 'loading' && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
                      {coachStatus[i] === 'valid' && <CheckCircle2 className={`w-4 h-4 ${dm ? "text-[#00FF88]" : "text-emerald-500"}`} />}
                      {coachStatus[i] === 'ghost' && <Mail className="w-4 h-4 text-yellow-500" title="Unregistered user - Email invite will be sent!" />}
                      {coachStatus[i] === 'invalid' && <XCircle className="w-4 h-4 text-red-500" />}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex justify-between">
                <button onClick={prevStep} disabled={isLoading} className={`px-6 py-3 rounded-xl font-bold ${dm ? "text-gray-400 hover:bg-[#121212]" : "text-gray-600 hover:bg-gray-100"}`}>
                  Back
                </button>
                <button onClick={handleSubmit} disabled={isLoading} className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 ${dm ? "bg-[#00FF88] text-[#121212]" : "bg-emerald-600 text-white"}`}>
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit & Unlock Dashboard"}
                </button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className={`rounded-3xl p-10 text-center border shadow-xl ${dm ? "bg-[#1a1a1a] border-[#00FF88]/30 shadow-[#00FF88]/10" : "bg-white border-emerald-200"}`}>
              <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 ${dm ? "bg-[#00FF88]/10" : "bg-emerald-50"}`}>
                <CheckCircle2 className={`w-10 h-10 ${dm ? "text-[#00FF88]" : "text-emerald-500"}`} />
              </div>
              <h2 className={`text-2xl font-bold mb-2 ${dm ? "text-white" : "text-gray-900"}`}>Welcome, Boss.</h2>
              <p className={`mb-8 ${dm ? "text-gray-400" : "text-gray-500"}`}>
                Your academy has been registered and you now have full access to the Academy Dashboard.
              </p>
              <button onClick={() => navigate("/dashboard")} className={`w-full px-6 py-4 rounded-xl font-bold text-lg transition-transform hover:scale-[1.02] active:scale-[0.98] ${dm ? "bg-[#00FF88] text-[#121212]" : "bg-emerald-600 text-white"}`}>
                Enter Academy Dashboard
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
