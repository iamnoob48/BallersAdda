import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, Users, Mail, Plus, Link2, Copy, Check,
  CheckCircle2, Loader2, XCircle, ShieldAlert, ShieldCheck,
  UserPlus, Trophy, Star, ChevronDown, Phone, MapPin,
} from 'lucide-react';
import {
  useVerifyRosterEmailsMutation,
  useRegisterTeamForTournamentMutation,
  useGetPreviousTeammatesQuery,
} from '../../redux/slices/tournamentSlice.js';

const RosterEmailInput = ({ email, onChange, onRemove, placeholder, dm, verifyEmails, canRemove, onSendInvite, isMarkedForInvite }) => {
  const [status, setStatus] = useState('idle');
  const [msg, setMsg] = useState('');

  React.useEffect(() => {
    if (isMarkedForInvite) {
      setStatus('invited');
      setMsg('Will be invited');
      return;
    }
    if (!email || email.trim().length < 5 || !email.includes('@')) {
      setStatus('idle');
      setMsg('');
      return;
    }

    setStatus('checking');
    setMsg('Verifying...');

    const timer = setTimeout(async () => {
      try {
        await verifyEmails([email]).unwrap();
        setStatus('valid');
        setMsg('Found');
      } catch {
        setStatus('not_found');
        setMsg('Not on platform');
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [email, verifyEmails]);

  const handleSendInvite = () => {
    if (!onSendInvite) return;
    onSendInvite(email);
  };

  const icon = {
    checking: <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />,
    valid: <CheckCircle2 className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${dm ? 'text-[#00FF88]' : 'text-emerald-500'}`} />,
    not_found: <XCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" />,
    invited: <CheckCircle2 className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${dm ? 'text-blue-400' : 'text-blue-500'}`} />,
  }[status] || <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />;

  const borderClass = {
    not_found: 'border-amber-500/50 focus:border-amber-500 bg-amber-500/5',
    valid: dm ? 'border-[#00FF88]/50 focus:border-[#00FF88] bg-[#00FF88]/5' : 'border-emerald-500/50 focus:border-emerald-500 bg-emerald-500/5',
    invited: dm ? 'border-blue-400/50 bg-blue-400/5' : 'border-blue-500/50 bg-blue-500/5',
  }[status] || (dm ? 'bg-[#121212] border-gray-800 focus:border-[#00FF88]' : 'bg-gray-50 border-gray-200 focus:border-emerald-500');

  const msgColor = {
    valid: dm ? 'text-[#00FF88]' : 'text-emerald-600',
    not_found: 'text-amber-500',
    invited: dm ? 'text-blue-400' : 'text-blue-600',
    checking: 'text-gray-400',
  }[status] || 'text-gray-400';

  return (
    <div className="space-y-2">
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          {icon}
          <input
            type="email"
            value={email}
            onChange={(e) => { if (status !== 'invited') onChange(e.target.value); }}
            placeholder={placeholder}
            disabled={status === 'invited'}
            className={`w-full pl-10 pr-20 py-3 rounded-xl border text-sm outline-none transition-all ${borderClass} ${status === 'invited' ? 'opacity-70' : ''}`}
          />
          {msg && (
            <span className={`text-[10px] absolute right-3 top-1/2 -translate-y-1/2 font-bold ${msgColor}`}>
              {msg}
            </span>
          )}
        </div>
        {canRemove && status !== 'invited' && (
          <button
            onClick={onRemove}
            className={`p-2 rounded-lg text-gray-400 hover:text-red-500 transition-colors ${dm ? 'hover:bg-red-500/10' : 'hover:bg-red-50'}`}
          >
            <XCircle className="w-4 h-4" />
          </button>
        )}
      </div>
      {status === 'not_found' && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
          <button
            type="button"
            onClick={handleSendInvite}
            className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
              dm ? 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20' : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200'
            }`}
          >
            <UserPlus className="w-3 h-3" />
            Send Signup Invite
          </button>
        </motion.div>
      )}
    </div>
  );
};

const TeammateCard = ({ teammate, dm, onInvite, isInvited }) => {
  const name = teammate.displayName || [teammate.firstName, teammate.lastName].filter(Boolean).join(' ') || teammate.email;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
        isInvited
          ? dm ? 'border-[#00FF88]/30 bg-[#00FF88]/5' : 'border-emerald-300 bg-emerald-50'
          : dm ? 'border-gray-800 hover:border-gray-700 bg-[#1a1a1a]' : 'border-gray-200 hover:border-gray-300 bg-white'
      }`}
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black shrink-0 ${dm ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
        {teammate.profilePic ? (
          <img src={teammate.profilePic} alt="" className="w-full h-full rounded-full object-cover" />
        ) : (
          name.charAt(0).toUpperCase()
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold truncate">{name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          {teammate.position && (
            <span className={`text-[10px] font-bold uppercase tracking-wider ${dm ? 'text-gray-500' : 'text-gray-400'}`}>
              {teammate.position.replace(/_/g, ' ')}
            </span>
          )}
          <span className={`text-[10px] ${dm ? 'text-gray-600' : 'text-gray-300'}`}>·</span>
          <span className={`text-[10px] font-bold ${dm ? 'text-[#00FF88]/70' : 'text-emerald-600/70'}`}>
            {teammate.count}x together
          </span>
        </div>
      </div>
      <button
        onClick={() => onInvite(teammate)}
        disabled={isInvited}
        className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
          isInvited
            ? dm ? 'bg-[#00FF88]/20 text-[#00FF88]' : 'bg-emerald-100 text-emerald-700'
            : dm ? 'bg-gray-800 hover:bg-[#00FF88] hover:text-[#121212] text-white' : 'bg-gray-100 hover:bg-emerald-600 hover:text-white text-gray-700'
        }`}
      >
        {isInvited ? <Check className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
      </button>
    </motion.div>
  );
};

const COUNTRY_CODES = [
  { code: '+91', country: 'IN', label: 'India', maxDigits: 10 },
  { code: '+1', country: 'US', label: 'USA / Canada', maxDigits: 10 },
  { code: '+44', country: 'GB', label: 'UK', maxDigits: 10 },
  { code: '+971', country: 'AE', label: 'UAE', maxDigits: 9 },
  { code: '+966', country: 'SA', label: 'Saudi Arabia', maxDigits: 9 },
  { code: '+61', country: 'AU', label: 'Australia', maxDigits: 9 },
  { code: '+49', country: 'DE', label: 'Germany', maxDigits: 11 },
  { code: '+33', country: 'FR', label: 'France', maxDigits: 9 },
  { code: '+65', country: 'SG', label: 'Singapore', maxDigits: 8 },
  { code: '+60', country: 'MY', label: 'Malaysia', maxDigits: 10 },
  { code: '+977', country: 'NP', label: 'Nepal', maxDigits: 10 },
  { code: '+880', country: 'BD', label: 'Bangladesh', maxDigits: 10 },
  { code: '+94', country: 'LK', label: 'Sri Lanka', maxDigits: 9 },
  { code: '+92', country: 'PK', label: 'Pakistan', maxDigits: 10 },
];

const PhoneInput = ({ value, onChange, countryCode, onCountryChange, dm }) => {
  const [open, setOpen] = useState(false);
  const selected = COUNTRY_CODES.find(c => c.code === countryCode) || COUNTRY_CODES[0];
  const digitsOnly = value.replace(/\D/g, '');

  const handleInput = (e) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (raw.length <= selected.maxDigits) {
      onChange(raw);
    }
  };

  return (
    <div className="relative flex items-stretch gap-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-3 rounded-l-xl border border-r-0 text-sm font-bold shrink-0 transition-colors ${dm ? 'bg-[#1a1a1a] border-gray-800 text-gray-300 hover:bg-gray-800' : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'}`}
      >
        <span>{selected.code}</span>
        <ChevronDown className="w-3 h-3 opacity-50" />
      </button>
      <input
        type="tel"
        inputMode="numeric"
        value={digitsOnly}
        onChange={handleInput}
        maxLength={selected.maxDigits}
        placeholder={`${'0'.repeat(selected.maxDigits)} (${selected.maxDigits} digits)`}
        className={`flex-1 min-w-0 px-4 py-3 rounded-r-xl border text-sm outline-none transition-all ${dm ? 'bg-[#121212] border-gray-800 focus:border-[#00FF88]' : 'bg-gray-50 border-gray-200 focus:border-emerald-500'}`}
      />
      {digitsOnly.length > 0 && (
        <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold ${digitsOnly.length === selected.maxDigits ? (dm ? 'text-[#00FF88]' : 'text-emerald-600') : 'text-gray-400'}`}>
          {digitsOnly.length}/{selected.maxDigits}
        </span>
      )}
      {open && (
        <div className={`absolute left-0 top-full mt-1 z-50 w-64 max-h-52 overflow-y-auto rounded-xl border shadow-xl ${dm ? 'bg-[#1a1a1a] border-gray-700' : 'bg-white border-gray-200'}`}>
          {COUNTRY_CODES.map(c => (
            <button
              key={c.code}
              type="button"
              onClick={() => { onCountryChange(c.code); setOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                c.code === countryCode
                  ? dm ? 'bg-[#00FF88]/10 text-[#00FF88] font-bold' : 'bg-emerald-50 text-emerald-700 font-bold'
                  : dm ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-50 text-gray-700'
              }`}
            >
              <span className="font-mono font-bold w-12 text-left">{c.code}</span>
              <span>{c.label}</span>
              <span className={`ml-auto text-[10px] ${dm ? 'text-gray-600' : 'text-gray-400'}`}>{c.maxDigits} digits</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default function TeamRegistrationPage({ tournament, onBack }) {
  const dm = useSelector((s) => s.theme.darkMode);
  const { profile } = useSelector((s) => s.player);
  const { user } = useSelector((s) => s.auth);
  const navigate = useNavigate();

  const [verifyEmails] = useVerifyRosterEmailsMutation();
  const [registerTeam, { isLoading: isRegistering }] = useRegisterTeamForTournamentMutation();
  const { data: teammates = [], isLoading: teammatesLoading } = useGetPreviousTeammatesQuery();
  const [signupInvites, setSignupInvites] = useState([]);

  const [countryCode, setCountryCode] = useState('+91');
  const [formData, setFormData] = useState(() => {
    let phone = user?.phone || '';
    const match = COUNTRY_CODES.find(c => phone.startsWith(c.code));
    if (match) phone = phone.slice(match.code.length).replace(/\D/g, '');
    else phone = phone.replace(/\D/g, '');
    return {
      teamName: '',
      captainPhone: phone,
      emails: ['', '', '', '', ''],
      commitmentChecked: false,
    };
  });

  const [rosterMode, setRosterMode] = useState('emails');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [copied, setCopied] = useState(false);

  const [location, setLocation] = useState({ latitude: null, longitude: null, city: null, status: 'pending' });

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation(prev => ({ ...prev, status: 'unavailable' }));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation({ latitude, longitude, city: null, status: 'resolving' });
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=en`,
            { headers: { 'User-Agent': 'BallersAdda/1.0' } }
          );
          const data = await res.json();
          const addr = data.address || {};
          const city = addr.city || addr.town || addr.village || addr.county || null;
          const state = addr.state || null;
          setLocation({ latitude, longitude, city: [city, state].filter(Boolean).join(', ') || 'Located', status: 'resolved' });
        } catch {
          setLocation({ latitude, longitude, city: 'Located', status: 'resolved' });
        }
      },
      () => setLocation(prev => ({ ...prev, status: 'denied' })),
      { enableHighAccuracy: false, timeout: 10000 }
    );
  }, []);

  const ageValid = useMemo(() => {
    if (!profile?.dateOfBirth || !tournament?.category) return null;
    const dob = new Date(profile.dateOfBirth);
    const categoryMap = {
      U10: 10, U12: 12, U14: 14, U16: 16, U18: 18, U21: 21,
    };
    const maxAge = categoryMap[tournament.category];
    if (!maxAge) return true;
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate()) ? age - 1 : age;
    return actualAge < maxAge;
  }, [profile?.dateOfBirth, tournament?.category]);

  const handleEmailChange = (index, value) => {
    const newEmails = [...formData.emails];
    newEmails[index] = value;
    setFormData({ ...formData, emails: newEmails });
  };

  const addEmailField = () => {
    setFormData({ ...formData, emails: [...formData.emails, ''] });
  };

  const removeEmailField = (index) => {
    const newEmails = formData.emails.filter((_, i) => i !== index);
    setFormData({ ...formData, emails: newEmails });
  };

  const handleInviteTeammate = (teammate) => {
    const alreadyAdded = formData.emails.some(e => e.toLowerCase() === teammate.email.toLowerCase());
    if (alreadyAdded) return;

    const emptyIdx = formData.emails.findIndex(e => e.trim() === '');
    if (emptyIdx >= 0) {
      handleEmailChange(emptyIdx, teammate.email);
    } else {
      setFormData({ ...formData, emails: [...formData.emails, teammate.email] });
    }
    setRosterMode('emails');
  };

  const invitedEmails = useMemo(
    () => new Set(formData.emails.filter(e => e.trim()).map(e => e.toLowerCase())),
    [formData.emails]
  );

  const [markedForInvite, setMarkedForInvite] = useState(new Set());

  const handleMarkForInvite = useCallback((email) => {
    setMarkedForInvite(prev => new Set(prev).add(email.trim().toLowerCase()));
    return true;
  }, []);

  const handleSubmit = async () => {
    setError('');

    if (!formData.teamName.trim()) {
      setError('Team name is required.');
      return;
    }
    const selectedCountry = COUNTRY_CODES.find(c => c.code === countryCode) || COUNTRY_CODES[0];
    const phoneDigits = formData.captainPhone.replace(/\D/g, '');
    if (!phoneDigits) {
      setError('Phone number is required.');
      return;
    }
    if (phoneDigits.length !== selectedCountry.maxDigits) {
      setError(`Phone number must be exactly ${selectedCountry.maxDigits} digits for ${selectedCountry.label}.`);
      return;
    }
    if (ageValid === false) {
      setError(`Age validation failed. You do not meet the ${tournament.category} category requirement.`);
      return;
    }

    if (rosterMode === 'emails') {
      const validEmails = formData.emails.filter(e => e.trim().length > 0);
      if (validEmails.length < 5) {
        setError(`Minimum 5 players required (found ${validEmails.length}).`);
        return;
      }

      const emailsToVerify = validEmails.filter(e => !markedForInvite.has(e.trim().toLowerCase()));
      if (emailsToVerify.length > 0) {
        try {
          await verifyEmails(emailsToVerify).unwrap();
        } catch (err) {
          if (err.data?.failedEmails) {
            const unhandled = err.data.failedEmails.filter(e => !markedForInvite.has(e.toLowerCase()));
            if (unhandled.length > 0) {
              setError(`These emails are not on the platform: ${unhandled.join(', ')}. Click "Send Signup Invite" to invite them.`);
              return;
            }
          } else {
            setError('Error verifying roster emails.');
            return;
          }
        }
      }
    }

    if (!formData.commitmentChecked) {
      setError('You must agree to the commitment rules.');
      return;
    }

    try {
      const result = await registerTeam({
        tournamentId: tournament.id,
        formData,
        rosterMode,
        latitude: location.latitude,
        longitude: location.longitude,
      }).unwrap();

      if (result?.linkToken) {
        setInviteLink(`${window.location.origin}/join?linkToken=${result.linkToken}`);
      }
      if (result?.signupInvites?.length > 0) {
        setSignupInvites(result.signupInvites);
      }
      setIsSuccess(true);
    } catch (err) {
      setError(err.data?.message || 'Failed to register. Please try again.');
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {}
  };

  const [copiedInviteIdx, setCopiedInviteIdx] = useState(null);
  const handleCopyInviteLink = async (url, idx) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedInviteIdx(idx);
      setTimeout(() => setCopiedInviteIdx(null), 2500);
    } catch {}
  };

  if (isSuccess) {
    return (
      <div className={`min-h-screen pb-20 ${dm ? 'bg-[#121212] text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="max-w-2xl mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`rounded-3xl p-8 text-center space-y-5 ${dm ? 'bg-[#1a1a1a] border border-[#87A98D]/20' : 'bg-white border border-gray-200 shadow-xl'}`}
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring', bounce: 0.5, duration: 0.8 }}
              className="text-6xl mx-auto w-fit"
            >
              <motion.span
                animate={{ rotate: [0, -15, 15, -10, 10, 0], y: [0, -10, -20, -10, -5, 0] }}
                transition={{ duration: 1.2, delay: 0.3 }}
                className="inline-block"
              >
                &#9917;
              </motion.span>
            </motion.div>
            <h2 className="text-3xl font-black">Squad Drafted!</h2>
            {inviteLink ? (
              <>
                <p className={`text-sm max-w-md mx-auto ${dm ? 'text-gray-400' : 'text-gray-500'}`}>
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
              </>
            ) : (
              <p className={`max-w-md mx-auto text-sm ${dm ? 'text-gray-400' : 'text-gray-500'}`}>
                Invitations sent to your roster. Please make payment at the venue before kickoff.
              </p>
            )}

            {signupInvites.length > 0 && (
              <div className="space-y-3 text-left mt-4">
                <div className="flex items-center gap-2">
                  <UserPlus className={`w-4 h-4 ${dm ? 'text-blue-400' : 'text-blue-600'}`} />
                  <p className={`text-sm font-black ${dm ? 'text-blue-400' : 'text-blue-700'}`}>
                    Signup invites ({signupInvites.length})
                  </p>
                </div>
                <p className={`text-xs ${dm ? 'text-gray-500' : 'text-gray-400'}`}>
                  These players aren't on the platform yet. Share their personal invite links — they'll auto-join your squad after signing up.
                </p>
                {signupInvites.map((inv, idx) => (
                  <motion.div
                    key={inv.email}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`rounded-xl border p-3 space-y-2 ${dm ? 'bg-[#121212] border-gray-700' : 'bg-gray-50 border-gray-200'}`}
                  >
                    <p className="text-xs font-bold truncate">{inv.email}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono truncate flex-1">{inv.signupUrl}</span>
                      <button
                        onClick={() => handleCopyInviteLink(inv.signupUrl, idx)}
                        className={`shrink-0 px-2.5 py-1 rounded-lg font-bold text-[10px] flex items-center gap-1 transition-colors ${
                          copiedInviteIdx === idx
                            ? dm ? 'bg-blue-400/20 text-blue-400' : 'bg-blue-100 text-blue-700'
                            : dm ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                        }`}
                      >
                        {copiedInviteIdx === idx ? <Check className="w-2.5 h-2.5" /> : <Copy className="w-2.5 h-2.5" />}
                        {copiedInviteIdx === idx ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            <button
              onClick={() => navigate('/tournaments')}
              className={`mt-4 px-6 py-2.5 rounded-xl font-bold text-sm transition ${dm ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}`}
            >
              Back to Tournaments
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pb-28 lg:pb-12 ${dm ? 'bg-[#121212] text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">

        {/* Top Bar */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={onBack}
            className={`p-2 rounded-xl transition-colors ${dm ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black tracking-tight">{tournament.name}</h1>
            <p className={`text-xs font-bold uppercase tracking-widest mt-0.5 ${dm ? 'text-[#00FF88]' : 'text-emerald-600'}`}>
              Team Registration
            </p>
          </div>
        </div>

        {/* Age Warning */}
        {ageValid === false && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold flex items-center gap-3"
          >
            <ShieldAlert className="w-5 h-5 shrink-0" />
            Your date of birth does not meet the {tournament.category} age requirement. Registration will be rejected.
          </motion.div>
        )}

        {ageValid === true && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-3 rounded-2xl text-sm font-bold flex items-center gap-3 ${dm ? 'bg-[#00FF88]/10 border border-[#00FF88]/20 text-[#00FF88]' : 'bg-emerald-50 border border-emerald-200 text-emerald-700'}`}
          >
            <ShieldCheck className="w-5 h-5 shrink-0" />
            Age verified for {tournament.category} category
          </motion.div>
        )}

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">

          {/* ── LEFT: Registration Form ── */}
          <div className="space-y-6">

            {/* Squad Basics */}
            <div className={`rounded-2xl border p-6 space-y-5 ${dm ? 'bg-[#1a1a1a] border-gray-800' : 'bg-white border-gray-200 shadow-sm'}`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${dm ? 'bg-[#00FF88]/10' : 'bg-emerald-50'}`}>
                  <Users className={`w-5 h-5 ${dm ? 'text-[#00FF88]' : 'text-emerald-600'}`} />
                </div>
                <h3 className="text-lg font-black">Squad Basics</h3>
              </div>

              <div>
                <label className="text-xs font-bold uppercase block mb-1.5">Team Name</label>
                <input
                  type="text"
                  value={formData.teamName}
                  onChange={e => setFormData({ ...formData, teamName: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all ${dm ? 'bg-[#121212] border-gray-800 focus:border-[#00FF88]' : 'bg-gray-50 border-gray-200 focus:border-emerald-500'}`}
                  placeholder="FC Khairatabad"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase block mb-1.5">Captain's Phone Number</label>
                <PhoneInput
                  value={formData.captainPhone}
                  onChange={(val) => setFormData({ ...formData, captainPhone: val })}
                  countryCode={countryCode}
                  onCountryChange={setCountryCode}
                  dm={dm}
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase block mb-1.5">Team Location</label>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
                  location.status === 'resolved'
                    ? dm ? 'border-[#00FF88]/30 bg-[#00FF88]/5' : 'border-emerald-300 bg-emerald-50'
                    : location.status === 'denied'
                      ? 'border-red-500/30 bg-red-500/5'
                      : dm ? 'border-gray-800 bg-[#121212]' : 'border-gray-200 bg-gray-50'
                }`}>
                  {location.status === 'pending' || location.status === 'resolving' ? (
                    <>
                      <Loader2 className={`w-4 h-4 animate-spin ${dm ? 'text-gray-500' : 'text-gray-400'}`} />
                      <span className={`text-sm ${dm ? 'text-gray-400' : 'text-gray-500'}`}>Detecting location...</span>
                    </>
                  ) : location.status === 'resolved' ? (
                    <>
                      <MapPin className={`w-4 h-4 shrink-0 ${dm ? 'text-[#00FF88]' : 'text-emerald-600'}`} />
                      <span className={`text-sm font-bold ${dm ? 'text-[#00FF88]' : 'text-emerald-700'}`}>{location.city}</span>
                    </>
                  ) : location.status === 'denied' ? (
                    <>
                      <MapPin className="w-4 h-4 shrink-0 text-red-500" />
                      <span className="text-sm text-red-500 font-bold">Location access denied</span>
                    </>
                  ) : (
                    <>
                      <MapPin className={`w-4 h-4 shrink-0 ${dm ? 'text-gray-500' : 'text-gray-400'}`} />
                      <span className={`text-sm ${dm ? 'text-gray-400' : 'text-gray-500'}`}>Location unavailable</span>
                    </>
                  )}
                </div>
                <p className={`text-[10px] mt-1.5 font-bold ${dm ? 'text-gray-600' : 'text-gray-400'}`}>
                  Auto-detected from your browser. Used to tag where your team is based.
                </p>
              </div>
            </div>

            {/* Roster */}
            <div className={`rounded-2xl border p-6 space-y-5 ${dm ? 'bg-[#1a1a1a] border-gray-800' : 'bg-white border-gray-200 shadow-sm'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${dm ? 'bg-[#00FF88]/10' : 'bg-emerald-50'}`}>
                    <Mail className={`w-5 h-5 ${dm ? 'text-[#00FF88]' : 'text-emerald-600'}`} />
                  </div>
                  <h3 className="text-lg font-black">The Roster</h3>
                </div>
                <span className={`text-xs font-bold ${dm ? 'text-gray-500' : 'text-gray-400'}`}>
                  Min. 5 players
                </span>
              </div>

              {/* Mode Toggle */}
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

              <AnimatePresence mode="wait">
                {rosterMode === 'emails' ? (
                  <motion.div key="emails" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1 pb-2">
                      {formData.emails.map((email, idx) => (
                        <RosterEmailInput
                          key={idx}
                          email={email}
                          onChange={(val) => handleEmailChange(idx, val)}
                          onRemove={() => removeEmailField(idx)}
                          placeholder={`Player ${idx + 1} email`}
                          dm={dm}
                          verifyEmails={verifyEmails}
                          canRemove={formData.emails.length > 5}
                          onSendInvite={handleMarkForInvite}
                          isMarkedForInvite={markedForInvite.has(email.trim().toLowerCase())}
                        />
                      ))}
                    </div>
                    <button
                      onClick={addEmailField}
                      className={`w-full mt-3 py-3 rounded-xl border border-dashed font-bold flex items-center justify-center gap-2 text-sm transition-colors ${dm ? 'border-gray-700 text-[#00FF88] hover:bg-gray-800/50' : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'}`}
                    >
                      <Plus className="w-4 h-4" /> Add Another Player
                    </button>
                    <p className={`text-xs text-center mt-3 font-bold opacity-80 ${dm ? 'text-gray-500' : 'text-gray-400'}`}>
                      Teammates without accounts will get a magic link to join your squad.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div key="link" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className={`flex flex-col items-center justify-center gap-4 py-8 rounded-2xl border border-dashed text-center ${dm ? 'border-[#00FF88]/30 bg-[#00FF88]/5' : 'border-emerald-300 bg-emerald-50'}`}
                  >
                    <Link2 className={`w-10 h-10 ${dm ? 'text-[#00FF88]' : 'text-emerald-500'}`} />
                    <div>
                      <p className={`font-black text-base mb-1 ${dm ? 'text-white' : 'text-gray-900'}`}>
                        Shareable Invite Link
                      </p>
                      <p className={`text-sm max-w-xs mx-auto ${dm ? 'text-gray-400' : 'text-gray-500'}`}>
                        After you submit, you'll get a unique link. Anyone can join your squad directly.
                      </p>
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold ${dm ? 'bg-[#121212] text-[#00FF88]' : 'bg-white text-emerald-700 border border-emerald-200'}`}>
                      <Check className="w-3.5 h-3.5" /> No email addresses needed
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Commitment & Fee */}
            <div className={`rounded-2xl border p-6 space-y-5 ${dm ? 'bg-[#1a1a1a] border-gray-800' : 'bg-white border-gray-200 shadow-sm'}`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${dm ? 'bg-[#00FF88]/10' : 'bg-emerald-50'}`}>
                  <Trophy className={`w-5 h-5 ${dm ? 'text-[#00FF88]' : 'text-emerald-600'}`} />
                </div>
                <h3 className="text-lg font-black">The Commitment</h3>
              </div>

              <div className={`p-5 rounded-2xl border text-center ${dm ? 'bg-[#121212] border-[#87A98D]/20' : 'bg-emerald-50 border-emerald-200'}`}>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Total Entry Fee</p>
                <p className="text-4xl font-black">₹{tournament.registrationFee}</p>
                <p className={`text-sm font-medium mt-1 ${dm ? 'text-[#00FF88]' : 'text-emerald-700'}`}>
                  Pay at venue before kickoff
                </p>
              </div>

              <div className={`p-4 rounded-xl border flex items-center gap-3 ${dm ? 'bg-gray-800/30 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                <ShieldAlert className="w-5 h-5 text-yellow-500 shrink-0" />
                <p className="text-xs font-bold">Pay in cash or UPI directly to the Organizer at least 1 hour before kickoff.</p>
              </div>

              <label className="flex items-start gap-3 p-4 rounded-xl border border-red-500/30 bg-red-500/5 cursor-pointer hover:bg-red-500/10 transition">
                <input
                  type="checkbox"
                  checked={formData.commitmentChecked}
                  onChange={(e) => setFormData({ ...formData, commitmentChecked: e.target.checked })}
                  className="mt-1 h-5 w-5 rounded-md cursor-pointer accent-red-500"
                />
                <span className={`text-sm leading-relaxed font-bold ${dm ? 'text-gray-300' : 'text-gray-800'}`}>
                  I understand that if my team fails to show up on Match Day, my account will be temporarily banned from future tournament registrations.
                </span>
              </label>
            </div>

            {/* Error */}
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold text-center"
              >
                {error}
              </motion.div>
            )}

            {/* Submit */}
            {isRegistering ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`w-full py-6 rounded-2xl font-black text-base flex flex-col items-center justify-center gap-3 shadow-xl overflow-hidden ${dm ? 'bg-[#1a1a1a] border border-[#00FF88]/20' : 'bg-white border border-emerald-200 shadow-emerald-100'}`}
              >
                <div className="relative w-full h-8 flex items-center justify-center">
                  <motion.span
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute text-2xl"
                  >
                    &#9917;
                  </motion.span>
                  <motion.span
                    animate={{ opacity: [0.2, 0.6, 0.2] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute text-xs"
                    style={{ left: '15%' }}
                  >
                    &#128168;
                  </motion.span>
                </div>
                <p className={`text-sm font-bold ${dm ? 'text-gray-400' : 'text-gray-500'}`}>
                  Drafting your squad...
                </p>
              </motion.div>
            ) : (
              <button
                onClick={handleSubmit}
                className={`w-full py-4 rounded-2xl font-black text-base flex items-center justify-center gap-2 transition-transform hover:scale-[1.01] shadow-xl ${dm ? 'bg-[#00FF88] text-[#121212] shadow-[#00FF88]/20' : 'bg-emerald-600 text-white shadow-emerald-500/30 hover:bg-emerald-700'}`}
              >
                Submit & Draft Squad
              </button>
            )}
          </div>

          {/* ── RIGHT: Previous Teammates ── */}
          <div className="hidden lg:block">
            <div className={`sticky top-20 rounded-2xl border p-5 space-y-4 ${dm ? 'bg-[#1a1a1a] border-gray-800' : 'bg-white border-gray-200 shadow-sm'}`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${dm ? 'bg-[#00FF88]/10' : 'bg-emerald-50'}`}>
                  <Star className={`w-5 h-5 ${dm ? 'text-[#00FF88]' : 'text-emerald-600'}`} />
                </div>
                <div>
                  <h3 className="text-base font-black">Your Squad</h3>
                  <p className={`text-xs ${dm ? 'text-gray-500' : 'text-gray-400'}`}>Previous teammates</p>
                </div>
              </div>

              {teammatesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className={`w-6 h-6 animate-spin ${dm ? 'text-gray-600' : 'text-gray-300'}`} />
                </div>
              ) : teammates.length === 0 ? (
                <div className={`py-10 text-center rounded-xl border border-dashed ${dm ? 'border-gray-800 text-gray-600' : 'border-gray-200 text-gray-400'}`}>
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-bold">No previous teammates</p>
                  <p className="text-xs mt-1">Play your first tournament to build your squad history!</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[calc(100vh-240px)] overflow-y-auto pr-1">
                  {teammates.map((mate) => (
                    <TeammateCard
                      key={mate.userId}
                      teammate={mate}
                      dm={dm}
                      onInvite={handleInviteTeammate}
                      isInvited={invitedEmails.has(mate.email.toLowerCase())}
                    />
                  ))}
                </div>
              )}

              {teammates.length > 0 && (
                <p className={`text-[10px] text-center font-bold uppercase tracking-widest ${dm ? 'text-gray-600' : 'text-gray-300'}`}>
                  Click to add to your roster
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Teammates Section */}
        <div className="lg:hidden mt-6">
          {teammates.length > 0 && (
            <div className={`rounded-2xl border p-5 space-y-4 ${dm ? 'bg-[#1a1a1a] border-gray-800' : 'bg-white border-gray-200 shadow-sm'}`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${dm ? 'bg-[#00FF88]/10' : 'bg-emerald-50'}`}>
                  <Star className={`w-5 h-5 ${dm ? 'text-[#00FF88]' : 'text-emerald-600'}`} />
                </div>
                <div>
                  <h3 className="text-base font-black">Previous Teammates</h3>
                  <p className={`text-xs ${dm ? 'text-gray-500' : 'text-gray-400'}`}>Tap to invite</p>
                </div>
              </div>
              <div className="space-y-2">
                {teammates.slice(0, 5).map((mate) => (
                  <TeammateCard
                    key={mate.userId}
                    teammate={mate}
                    dm={dm}
                    onInvite={handleInviteTeammate}
                    isInvited={invitedEmails.has(mate.email.toLowerCase())}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
