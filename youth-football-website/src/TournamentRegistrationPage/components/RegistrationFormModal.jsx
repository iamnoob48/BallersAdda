import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, ShieldAlert, Plus, ShieldCheck, Mail, CheckCircle2, Loader2, XCircle, Link2, Copy, Check } from 'lucide-react';
import { useVerifyRosterEmailsMutation, useRegisterTeamForTournamentMutation } from '../../redux/slices/tournamentSlice.js';

const RosterEmailInput = ({ email, onChange, placeholder, dm, verifyEmails }) => {
  const [status, setStatus] = React.useState('idle'); // 'idle' | 'checking' | 'valid' | 'invalid'
  const [msg, setMsg] = React.useState('');

  React.useEffect(() => {
    if (!email || email.trim().length < 5 || !email.includes('@')) {
      setStatus('idle');
      setMsg('');
      return;
    }

    setStatus('checking');
    setMsg('Verifying user...');

    const timer = setTimeout(async () => {
      try {
        await verifyEmails([email]).unwrap();
        setStatus('valid');
        setMsg('User exists');
      } catch (err) {
        setStatus('invalid');
        setMsg('User not found / not a player');
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [email, verifyEmails]);

  return (
    <div className="relative">
      {status === 'checking' ? (
        <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
      ) : status === 'valid' ? (
        <CheckCircle2 className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${dm ? 'text-[#00FF88]' : 'text-emerald-500'}`} />
      ) : status === 'invalid' ? (
        <XCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
      ) : (
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      )}

      <input 
        type="email" 
        value={email}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none transition-all ${
          status === 'invalid' 
            ? 'border-red-500/50 focus:border-red-500 bg-red-500/5' 
            : status === 'valid' 
              ? dm ? 'border-[#00FF88]/50 focus:border-[#00FF88] bg-[#00FF88]/5' : 'border-emerald-500/50 focus:border-emerald-500 bg-emerald-500/5'
              : dm ? 'bg-[#121212] border-gray-800 focus:border-[#00FF88]' : 'bg-gray-50 border-gray-200 focus:border-emerald-500'
        }`} 
      />
      {msg && (
        <p className={`text-[10px] absolute right-3 top-1/2 -translate-y-1/2 font-bold ${status === 'valid' ? (dm ? 'text-[#00FF88]' : 'text-emerald-600') : status === 'invalid' ? 'text-red-500' : 'text-gray-400'}`}>
          {msg}
        </p>
      )}
    </div>
  );
};

export default function RegistrationFormModal({ isOpen, onClose, tournament }) {
  const dm = useSelector((s) => s.theme.darkMode);
  
  const [verifyEmails, { isLoading: isVerifying }] = useVerifyRosterEmailsMutation();
  const [registerTeam, { isLoading: isRegistering }] = useRegisterTeamForTournamentMutation();

  // Form State
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    teamName: '',
    teamLogo: null,
    kitColor: '#FF0000',
    captainPhone: '',
    captainDob: '',
    ageVerified: false,
    emails: ['', '', '', '', ''], // Minimum 5 based on UX
    commitmentChecked: false,
  });

  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [rosterMode, setRosterMode] = useState('emails'); // 'emails' | 'link'
  const [inviteLink, setInviteLink] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleNext = async () => {
    setError('');

    // Step 1 Validation
    if (step === 1) {
      if (!formData.teamName.trim() || !formData.captainPhone.trim()) {
        setError('Please provide a team name and captain phone number.');
        return;
      }
    }

    // Step 2 Validation (Age)
    if (step === 2) {
      if (!formData.captainDob) {
        setError('Please select a Date of Birth.');
        return;
      }
      if (!formData.ageVerified) {
        setError('You must confirm the age requirement.');
        return;
      }
      
      // Dummy check: Must be born after Jan 1, 2010 (Mock U-15 calculation)
      const dobDate = new Date(formData.captainDob);
      const cutoffDate = new Date('2010-01-01');
      if (dobDate < cutoffDate) {
        setError('Age Validation Failed: You must be born after Jan 1, 2010 to play in this tournament.');
        return;
      }
    }

    // Step 3 Validation (Emails) — skip entirely when using invite link mode
    if (step === 3) {
      if (rosterMode === 'link') {
        setStep(s => s + 1);
        return;
      }

      const validEmails = formData.emails.filter(e => e.trim().length > 0);
      if (validEmails.length < 5) {
        setError(`You must provide at least 5 players (found ${validEmails.length}).`);
        return;
      }

      // Explicit Batch Verification Call
      try {
        await verifyEmails(validEmails).unwrap();
        // If it succeeds, no errors were thrown, proceed to Step 4
        setStep(s => s + 1);
      } catch (err) {
        if (err.data && err.data.failedEmails) {
          setError(`Validation Failed: The following emails are not linked to active Player profiles: ${err.data.failedEmails.join(', ')}`);
        } else {
          setError('An error occurred verifying the roster.');
        }
      }
      return;
    }

    setStep(s => s + 1);
  };

  const handlePrev = () => {
    setError('');
    setStep(s => s - 1);
  };

  const handleSubmit = async () => {
    if (!formData.commitmentChecked) {
      setError('You must agree to the tournament commitment rules.');
      return;
    }
    setError('');
    
    try {
      const result = await registerTeam({
        tournamentId: tournament.id,
        formData,
        rosterMode,
      }).unwrap();

      if (result?.linkToken) {
        setInviteLink(`${window.location.origin}/join?linkToken=${result.linkToken}`);
      }

      setIsSuccess(true);
    } catch (err) {
      setError(err.data?.message || 'Failed to register the team. Please try again.');
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback: select the text
    }
  };

  const handleEmailChange = (index, value) => {
    const newEmails = [...formData.emails];
    newEmails[index] = value;
    setFormData({ ...formData, emails: newEmails });
  };

  const addEmailField = () => {
    setFormData({ ...formData, emails: [...formData.emails, ''] });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 overflow-y-auto pt-10 pb-10 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className={`w-full max-w-2xl mt-auto md:mt-0 rounded-3xl shadow-2xl overflow-hidden ${dm ? 'bg-[#1a1a1a] text-white border border-[#87A98D]/20 shadow-black/60' : 'bg-white text-gray-900 border border-gray-200 shadow-xl'}`}
      >
        
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-5 border-b ${dm ? 'border-gray-800' : 'border-gray-100'}`}>
          <div>
            <h2 className="text-lg font-black tracking-tight">{tournament.name} Draft</h2>
            <p className={`text-xs font-bold uppercase tracking-widest mt-1 ${dm ? 'text-[#00FF88]' : 'text-emerald-600'}`}>
              Step {step} of 4
            </p>
          </div>
          {!isSuccess && (
            <button onClick={onClose} className={`p-2 rounded-full transition-colors ${dm ? 'hover:bg-gray-800/50' : 'hover:bg-gray-100'}`}>
              <X className="w-5 h-5 text-gray-500" />
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 md:p-8 min-h-[400px] flex flex-col">
          
          <AnimatePresence mode="wait">
            
            {/* SUCCESS STATE */}
            {isSuccess && (
              <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center text-center gap-4">
                <CheckCircle2 className={`w-20 h-20 ${dm ? 'text-[#00FF88]' : 'text-emerald-500'}`} />
                <h3 className="text-2xl font-black">Squad Drafted!</h3>
                {inviteLink ? (
                  <>
                    <p className={`max-w-md text-sm ${dm ? 'text-gray-400' : 'text-gray-500'}`}>
                      Share the link below — anyone who opens it can join your squad directly.
                    </p>
                    <div className={`w-full rounded-xl border flex items-center gap-2 px-3 py-2 ${dm ? 'bg-[#121212] border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                      <Link2 className={`w-4 h-4 shrink-0 ${dm ? 'text-[#00FF88]' : 'text-emerald-600'}`} />
                      <span className="text-xs font-mono truncate flex-1 text-left">{inviteLink}</span>
                      <button
                        onClick={handleCopyLink}
                        className={`shrink-0 px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors ${
                          copied
                            ? dm ? 'bg-[#00FF88]/20 text-[#00FF88]' : 'bg-emerald-100 text-emerald-700'
                            : dm ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                        }`}
                      >
                        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <p className={`text-xs ${dm ? 'text-gray-500' : 'text-gray-400'}`}>
                      Please make your payment directly at the venue before kickoff.
                    </p>
                  </>
                ) : (
                  <p className={`max-w-md text-sm ${dm ? 'text-gray-400' : 'text-gray-500'}`}>
                    We've sent invitations to the roster you provided. Please make your payment directly at the venue before kickoff.
                  </p>
                )}
                <button
                  onClick={() => { setIsSuccess(false); setStep(1); onClose(); }}
                  className={`mt-2 px-6 py-2.5 rounded-xl font-bold text-sm transition ${dm ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}`}
                >
                  Close
                </button>
              </motion.div>
            )}

            {!isSuccess && step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 space-y-6">
                <div>
                  <h3 className="text-2xl font-black mb-1">Squad Basics</h3>
                  <p className={`text-sm ${dm ? 'text-gray-400' : 'text-gray-500'}`}>You're assembling your street team. Keep it fun and simple!</p>
                </div>
                
                <div className="space-y-5">
                  <div>
                    <label className="text-xs font-bold uppercase block mb-1">Team Name (e.g. Nandu's Ninjas)</label>
                    <input 
                      type="text" 
                      value={formData.teamName} 
                      onChange={e => setFormData({...formData, teamName: e.target.value})}
                      className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all ${dm ? 'bg-[#121212] border-gray-800 focus:border-[#00FF88]' : 'bg-gray-50 border-gray-200 focus:border-emerald-500'}`} 
                      placeholder="FC Khairatabad"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase block mb-1">Team Logo (Optional)</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={e => setFormData({...formData, teamLogo: e.target.files[0]})}
                      className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold ${dm ? 'bg-[#121212] border-gray-800 file:bg-[#00FF88]/10 file:text-[#00FF88] hover:file:bg-[#00FF88]/20 focus:border-[#00FF88]' : 'bg-gray-50 border-gray-200 file:bg-emerald-100 file:text-emerald-700 hover:file:bg-emerald-200 focus:border-emerald-500'}`} 
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase block mb-1">Team Kit Color (Primary)</label>
                    <div className="flex gap-4 items-center">
                      <input 
                        type="color" 
                        value={formData.kitColor} 
                        onChange={e => setFormData({...formData, kitColor: e.target.value})}
                        className={`w-12 h-12 rounded-lg cursor-pointer border-0 bg-transparent p-0 ${dm ? 'border-gray-800' : 'border-gray-200'}`} 
                      />
                      <span className="text-sm font-bold opacity-80 uppercase tracking-widest">{formData.kitColor}</span>
                    </div>
                    <p className="text-xs mt-1 text-gray-500">Crucial for organizers to avoid kit clashes.</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase block mb-1">Captain's Emergency Phone Number</label>
                    <input 
                      type="tel" 
                      value={formData.captainPhone} 
                      onChange={e => setFormData({...formData, captainPhone: e.target.value})}
                      className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all ${dm ? 'bg-[#121212] border-gray-800 focus:border-[#00FF88]' : 'bg-gray-50 border-gray-200 focus:border-emerald-500'}`} 
                      placeholder="+91 99999 99999"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {!isSuccess && step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 space-y-6">
                <div>
                  <h3 className="text-2xl font-black mb-1">Age Verification</h3>
                  <p className={`text-sm ${dm ? 'text-gray-400' : 'text-gray-500'}`}>Tournaments enforce strict youth sport categorizations.</p>
                </div>
                
                <div className={`p-4 rounded-xl border flex items-start gap-4 ${dm ? 'bg-[#121212] border-gray-800 text-gray-300' : 'bg-blue-50 border-blue-200 text-blue-800'}`}>
                  <ShieldCheck className="w-6 h-6 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold block">Tournament Category Restriction</span>
                    <span className="text-sm">You are registering a squad for the <strong className="font-black text-lg ml-1">{tournament.category}</strong>. All players must strictly meet this requirement.</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase block mb-1">Captain's Date of Birth (Verification)</label>
                  <input 
                    type="date" 
                    value={formData.captainDob} 
                    onChange={e => setFormData({...formData, captainDob: e.target.value})}
                    className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all ${dm ? 'bg-[#121212] border-gray-800 focus:border-[#00FF88]' : 'bg-gray-50 border-gray-200 focus:border-emerald-500'}`} 
                  />
                  <p className="text-xs mt-2 text-gray-500">For {tournament.category}, birthday must be valid according to Indian regional standards.</p>
                </div>

                <label className="flex items-start gap-3 p-4 rounded-xl border cursor-pointer group mt-4 border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition">
                  <input 
                    type="checkbox" 
                    checked={formData.ageVerified} 
                    onChange={(e) => setFormData({...formData, ageVerified: e.target.checked})}
                    className={`mt-1 h-5 w-5 rounded-md cursor-pointer accent-emerald-500`}
                  />
                  <span className={`text-sm leading-relaxed ${dm ? 'text-gray-300' : 'text-gray-700'}`}>
                    I confirm that all drafted players will legitimately meet the <strong>{tournament.category}</strong> age requirement. Government ID checks will be heavily scrutinized at the venue.
                  </span>
                </label>
              </motion.div>
            )}

            {!isSuccess && step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 space-y-5">
                <div>
                  <h3 className="text-2xl font-black mb-1">The Roster</h3>
                  <p className={`text-sm ${dm ? 'text-gray-400' : 'text-gray-500'}`}>
                    Invite your squad by email or share a link they can click to join instantly.
                  </p>
                </div>

                {/* Mode toggle */}
                <div className={`flex rounded-xl p-1 gap-1 ${dm ? 'bg-[#121212]' : 'bg-gray-100'}`}>
                  <button
                    onClick={() => setRosterMode('emails')}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                      rosterMode === 'emails'
                        ? dm ? 'bg-white text-[#121212] shadow' : 'bg-white text-gray-900 shadow'
                        : dm ? 'text-gray-500 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Mail className="w-4 h-4" /> Enter Emails
                  </button>
                  <button
                    onClick={() => setRosterMode('link')}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                      rosterMode === 'link'
                        ? dm ? 'bg-[#00FF88] text-[#121212] shadow' : 'bg-emerald-600 text-white shadow'
                        : dm ? 'text-gray-500 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Link2 className="w-4 h-4" /> Invite Link
                  </button>
                </div>

                {rosterMode === 'emails' ? (
                  <>
                    <div className="space-y-3 max-h-[260px] overflow-y-auto pr-2 pb-2">
                      {formData.emails.map((email, idx) => (
                        <RosterEmailInput
                          key={idx}
                          email={email}
                          onChange={(val) => handleEmailChange(idx, val)}
                          placeholder={`[Player ${idx + 1} Email Address]`}
                          dm={dm}
                          verifyEmails={verifyEmails}
                        />
                      ))}
                      <button onClick={addEmailField} className={`w-full py-3 rounded-xl border border-dashed font-bold flex items-center justify-center gap-2 text-sm transition-colors ${dm ? 'border-gray-700 text-[#00FF88] hover:bg-gray-800/50' : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'}`}>
                        <Plus className="w-4 h-4" /> Add Another Player
                      </button>
                    </div>
                    <p className="text-xs text-center text-gray-500 font-bold opacity-80">
                      If your teammates don't have an account, we will shoot them a magic link to join your squad natively!
                    </p>
                  </>
                ) : (
                  <div className={`flex-1 flex flex-col items-center justify-center gap-4 py-6 rounded-2xl border border-dashed text-center ${dm ? 'border-[#00FF88]/30 bg-[#00FF88]/5' : 'border-emerald-300 bg-emerald-50'}`}>
                    <Link2 className={`w-10 h-10 ${dm ? 'text-[#00FF88]' : 'text-emerald-500'}`} />
                    <div>
                      <p className={`font-black text-base mb-1 ${dm ? 'text-white' : 'text-gray-900'}`}>
                        Shareable Invite Link
                      </p>
                      <p className={`text-sm max-w-xs mx-auto ${dm ? 'text-gray-400' : 'text-gray-500'}`}>
                        After you submit, you'll get a unique link. Anyone who opens it — whether they have an account or not — can join your squad directly.
                      </p>
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold ${dm ? 'bg-[#121212] text-[#00FF88]' : 'bg-white text-emerald-700 border border-emerald-200'}`}>
                      <Check className="w-3.5 h-3.5" /> No email addresses needed
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {!isSuccess && step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 space-y-6">
                <div>
                  <h3 className="text-2xl font-black mb-1">The Commitment</h3>
                  <p className={`text-sm ${dm ? 'text-gray-400' : 'text-gray-500'}`}>Lock in your entry rules to finalize your draft.</p>
                </div>

                <div className={`p-6 rounded-2xl border text-center ${dm ? 'bg-[#121212] border-[#87A98D]/20' : 'bg-emerald-50 border-emerald-200 mt-6'}`}>
                   <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Total Entry Fee</p>
                   <p className="text-4xl font-black mb-2">₹{(tournament.registrationFee * Math.max(5, formData.emails.filter(e=>e.length>0).length)).toLocaleString()}</p>
                   <p className={`text-sm font-medium ${dm ? 'text-[#00FF88]' : 'text-emerald-700'}`}>
                     (₹{tournament.registrationFee || 500} per drafted player)
                   </p>
                </div>

                <div className={`p-4 rounded-xl border flex items-center gap-4 ${dm ? 'bg-gray-800/30 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                   <ShieldAlert className="w-5 h-5 text-yellow-500 shrink-0" />
                   <p className="text-xs font-bold">Please pay in physical cash or direct UPI to the Organizer at the Turf at least 1 hour before kickoff.</p>
                </div>

                <label className="flex items-start gap-4 p-4 rounded-xl border border-red-500/30 bg-red-500/5 cursor-pointer mt-4 hover:bg-red-500/10 transition">
                  <input 
                    type="checkbox" 
                    checked={formData.commitmentChecked} 
                    onChange={(e) => setFormData({...formData, commitmentChecked: e.target.checked})}
                    className="mt-1 h-5 w-5 rounded-md cursor-pointer accent-red-500"
                  />
                  <span className={`text-sm leading-relaxed font-bold ${dm ? 'text-gray-300' : 'text-gray-800'}`}>
                    I understand that independent squads are notorious for registering and ghosting. If my team fails to show up on Match Day, my account will be temporarily banned from registering for future tournaments.
                  </span>
                </label>

              </motion.div>
            )}

            {/* ERROR ALERT */}
            {error && !isSuccess && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 mt-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold text-center">
                {error}
              </motion.div>
            )}
            
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        {!isSuccess && (
          <div className={`p-4 sm:px-6 sm:py-5 border-t flex items-center justify-between gap-4 bg-black/5 dark:bg-black/20 ${dm ? 'border-gray-800' : 'border-gray-200'}`}>
            {step > 1 ? (
              <button onClick={handlePrev} className={`px-5 py-3 rounded-xl font-bold text-sm transition flex items-center gap-1 ${dm ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}>
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            ) : <div />}

            {step < 4 ? (
              <button 
                onClick={handleNext} 
                disabled={isVerifying}
                className={`px-8 py-3 rounded-xl font-black text-sm flex items-center gap-1 transition-transform hover:scale-[1.02] shadow-lg disabled:opacity-50 disabled:hover:scale-100 ${dm ? 'bg-white text-[#121212]' : 'bg-gray-900 text-white'}`}
              >
                {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Next Step'} 
                {(!isVerifying) && <ChevronRight className="w-4 h-4 ml-1 -mr-1" />}
              </button>
            ) : (
              <button 
                onClick={handleSubmit} 
                disabled={isRegistering}
                className={`w-full sm:w-auto px-8 py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] shadow-xl disabled:opacity-50 disabled:hover:scale-100 ${dm ? 'bg-[#00FF88] text-[#121212] shadow-[#00FF88]/20' : 'bg-emerald-600 text-white shadow-emerald-500/30 hover:bg-emerald-700'}`}
              >
                {isRegistering ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit & Invite Squad'}
              </button>
            )}
          </div>
        )}

      </motion.div>
    </div>
  );
}
