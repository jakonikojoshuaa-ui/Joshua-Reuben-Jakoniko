import React, { useState, useEffect, useRef } from 'react';
import { 
  Mail, Lock, Eye, EyeOff, User, RefreshCw, ArrowRight, X, 
  CheckCircle2, AlertTriangle, ShieldCheck, Compass, Shield, 
  Sparkles, Globe, Building, Award, BookOpen, KeyRound, CheckSquare, Link2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { googleSignIn } from '../lib/workspaceAuth';
import { EriconLogo } from './EriconLogo';

interface SecureAccessGatewallProps {
  tabAttempted?: string;
  onCancel: () => void;
  onSuccess: (user: any) => void;
  initialStep?: 'login' | 'register';
  isBlockPage?: boolean;
}

export const SecureAccessGatewall: React.FC<SecureAccessGatewallProps> = ({ 
  tabAttempted = 'home', 
  onCancel, 
  onSuccess,
  initialStep = 'login',
  isBlockPage = false
}) => {
  const [step, setStep] = useState<string>(
    initialStep === 'register' ? 'register_step1' : 'login'
  );

  // Focus reference
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Login parameters
  const [loginInput, setLoginInput] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginMask, setLoginMask] = useState(true);
  const [loginRemember, setLoginRemember] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [lockoutTimer, setLockoutTimer] = useState<number>(0);

  // Two-Step OTP Authentication States
  const [isAccountFound, setIsAccountFound] = useState(false);
  const [otpToken, setOtpToken] = useState('');
  const [otpSandbox, setOtpSandbox] = useState(false);
  const [otpDemoCode, setOtpDemoCode] = useState<string | null>(null);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);

  // Register parameters
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [regMask, setRegMask] = useState(true);
  const [confirmMask, setConfirmMask] = useState(true);
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);

  // Step 2 Simulated Email Inbox
  const [simulatedInboxMail, setSimulatedInboxMail] = useState<any | null>(null);
  const [verificationTimer, setVerificationTimer] = useState<number>(45);

  // Step 3 Collapsible Professional Fields
  const [profileExpanded, setProfileExpanded] = useState(true);
  const [regCountry, setRegCountry] = useState('Tanzania');
  const [regInstitution, setRegInstitution] = useState('');
  const [regProfession, setRegProfession] = useState('Ecological Scientist');
  const [regClassification, setRegClassification] = useState<'Expert' | 'Student'>('Expert');
  const [regInterests, setRegInterests] = useState('Pneumatic vectors, epidemiology');
  const [regOrcid, setRegOrcid] = useState('');
  const [regProfileImage, setRegProfileImage] = useState('avatar_mouse');

  // Forgot password parameters
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordMask, setNewPasswordMask] = useState(true);
  const [resetLoading, setResetLoading] = useState(false);

  // Available interactive avatar choices
  const avatars = [
    { id: 'avatar_mouse', emoji: '🐭', label: 'Field Mouse' },
    { id: 'avatar_rat', emoji: '🐀', label: 'Roof Rat' },
    { id: 'avatar_shrew', emoji: '🐹', label: 'Mastomys' },
    { id: 'avatar_squirrel', emoji: '🐿️', label: 'Arvicanthis' }
  ];

  // Auto-focus username/email field on mounting
  useEffect(() => {
    if (firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, [step]);

  // Handle countdown penalty timer for lockouts
  useEffect(() => {
    if (lockoutTimer > 0) {
      const timer = setInterval(() => {
        setLockoutTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [lockoutTimer]);

  // Step 2 Countdown validation
  useEffect(() => {
    if (step === 'register_step2' && verificationTimer > 0) {
      const timer = setInterval(() => {
        setVerificationTimer((t) => t - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [step, verificationTimer]);

  // Password structural evaluation score
  const checkPasswordStrength = (pwd: string) => {
    let score = 0;
    if (!pwd) return 'empty';
    if (pwd.length >= 8) score++;
    if (/[a-zA-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^a-zA-Z0-9]/.test(pwd)) score++;
    
    if (score <= 1) return 'weak';
    if (score <= 3) return 'medium';
    return 'strong';
  };

  const getPwdStrengthInfo = (pwd: string) => {
    const strength = checkPasswordStrength(pwd);
    return {
      strength,
      lengthOk: pwd.length >= 8,
      hasLetters: /[a-zA-Z]/.test(pwd),
      hasNumbers: /[0-9]/.test(pwd),
      hasSymbols: /[^a-zA-Z0-9]/.test(pwd)
    };
  };

  // Google OAuth Alignment
  const handleGoogleSignIn = async () => {
    try {
      setLoginError(null);
      setLoginLoading(true);
      const googleUserObj = await googleSignIn();
      if (googleUserObj && googleUserObj.user) {
        const u = googleUserObj.user;
        const displayName = u.displayName || u.email?.split('@')[0] || 'Scientific Member';
        
        // Sync with ERICON backend
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: displayName.toLowerCase().replace(/\s+/g, '_'),
            email: u.email || 'google.user@ericon.org',
            password: 'GOOGLE_FEDERATED_AUTHENTICATION_' + u.uid,
            role: 'Research Member',
            institution: 'Aligned Google Workspace Node'
          })
        });
        
        let loggedUser: any = null;
        if (res.ok) {
          const data = await res.json();
          loggedUser = data.user;
        } else {
          // Attempt Login instead if registered before
          const loginRes = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              usernameOrEmail: u.email || '',
              password: 'GOOGLE_FEDERATED_AUTHENTICATION_' + u.uid
            })
          });
          if (loginRes.ok) {
            const loginData = await loginRes.json();
            loggedUser = loginData.user;
          }
        }

        if (loggedUser) {
          // Set verify
          loggedUser.isEmailVerified = true;
          localStorage.setItem('ericon_logged_scientist', JSON.stringify(loggedUser));
          onSuccess(loggedUser);
        } else {
          setLoginError('Could not sync federated credentials with standard registry directories.');
        }
      }
    } catch (err: any) {
      console.error(err);
      setLoginError(err.message || 'Google Auth dialog was closed or failed integration.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Login handler
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutTimer > 0) {
      setLoginError(`Lockout penalty active. Please wait ${lockoutTimer}s.`);
      return;
    }
    if (!loginInput.trim() || !loginPassword) {
      setLoginError('Credentials parameters are missing');
      return;
    }

    setLoginError(null);
    setLoginLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usernameOrEmail: loginInput.trim(),
          password: loginPassword
        })
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 423) {
          setLockoutTimer(15);
          setLoginError('ACCESS PENALTY LOCKOUT: 5 consecutive failures. Cool down active for 15s.');
        } else {
          setLoginError(data.error || 'Autheticaton failed.');
        }
      } else {
        // Save session
        localStorage.setItem('ericon_logged_scientist', JSON.stringify(data.user));
        onSuccess(data.user);
      }
    } catch (err) {
      setLoginError('Unable to connect to security database. Check host server connection.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleUsernameOrEmailChange = async (val: string) => {
    setLoginInput(val);
    if (!val.trim()) {
      setIsAccountFound(false);
      return;
    }
    try {
      const res = await fetch('/api/auth/check-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernameOrEmail: val })
      });
      const data = await res.json();
      if (data.exists) {
        setIsAccountFound(true);
      } else {
        setIsAccountFound(false);
      }
    } catch (err) {
      setIsAccountFound(false);
    }
  };

  const handleNextClick = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginInput.trim()) {
      setLoginError('Email or username coordinates check is required.');
      return;
    }
    setLoginError(null);
    setLoginLoading(true);

    try {
      const res = await fetch('/api/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernameOrEmail: loginInput.trim() })
      });
      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || 'Two-step OTP dispatch error.');
      } else {
        setOtpSandbox(!!data.sandbox);
        setOtpDemoCode(data.otp || null);
        setStep('otp_verification');
        setOtpToken('');
        setOtpError(null);
      }
    } catch (err) {
      setLoginError('Security handshake failed. Check host connection.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleOtpVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpToken.trim()) {
      setOtpError('OTP token sequence is empty.');
      return;
    }
    setOtpError(null);
    setOtpLoading(true);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usernameOrEmail: loginInput.trim(),
          otp: otpToken.trim()
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setOtpError(data.error || 'Access authorization rejected.');
      } else {
        localStorage.setItem('ericon_logged_scientist', JSON.stringify(data.user));
        onSuccess(data.user);
      }
    } catch {
      setOtpError('Security connection fault. Verify system router.');
    } finally {
      setOtpLoading(false);
    }
  };

  // Register Step 1 Submit
  const handleRegStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!regEmail.trim() || !regPassword || !regFirstName.trim() || !regLastName.trim()) {
      setRegError('All fields (Email, Password, First name, Last name) are required.');
      return;
    }

    if (regPassword.length < 8) {
      setRegError('Password must meet safety constraints (Minimum 8 characters).');
      return;
    }

    // Auto-generate clean, secure username token
    const baseUsername = `${regFirstName.trim()}_${regLastName.trim()}`.toLowerCase().replace(/[^a-z0-9_]/g, '');
    const derivedUsername = baseUsername || regEmail.split('@')[0] || `scholar_${Math.floor(Date.now() / 100000)}`;

    setRegError(null);
    setRegLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: derivedUsername,
          email: regEmail.trim(),
          password: regPassword,
          role: 'Research Member',
          institution: 'ERICON Ecological Group',
          firstName: regFirstName.trim(),
          lastName: regLastName.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setRegError(data.error || 'Registration failed.');
      } else {
        // Mock inbox template setup
        setSimulatedInboxMail({
          recipient: regEmail.trim(),
          subject: '🔐 ERICON Network Onboarding: Verify Scientist Credentials',
          body: `Welcome to the Ecological Rodent Interception and Containment Network (ERICON).\n\nYour username coordinates are: ${derivedUsername}.\n\nClick the link below to verify your email address and authorize level-1 research access immediately:\n\n[APPROVE VERIFICATION LINK]`
        });
        setRegUsername(derivedUsername); // sync username state for subsequent steps
        setStep('register_step2');
      }
    } catch (err) {
      setRegError('Unable to route credentials. Verify node is responsive.');
    } finally {
      setRegLoading(false);
    }
  };

  // Simulating verified instant click
  const handleSimulatedVerifyLink = async () => {
    setRegLoading(true);
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: regEmail.trim() })
      });
      if (res.ok) {
        setStep('register_step3');
      } else {
        setRegError('SIMULATION LINK EXCEPTION: Email token mismatched.');
      }
    } catch {
      setRegError('Verify Exception.');
    } finally {
      setRegLoading(false);
    }
  };

  // Step 3 Profile Completion
  const handleProfileComplete = async (skip: boolean) => {
    setRegLoading(true);
    setRegError(null);

    const payload = skip ? {
      username: regUsername.trim(),
      country: 'Tanzania',
      institution: 'Sokoine University of Agriculture',
      profession: 'Research Ecologist',
      classification: 'Expert',
      researchInterests: 'Pneumatic vectors, epidemiology',
      profileImage: 'avatar_mouse',
      role: 'Research Member'
    } : {
      username: regUsername.trim(),
      country: regCountry.trim(),
      institution: regInstitution.trim() || 'Morogoro Ecology Center',
      profession: regProfession.trim(),
      classification: regClassification,
      researchInterests: regInterests.trim(),
      orcid_id: regOrcid.trim(),
      profileImage: regProfileImage,
      role: 'Research Member'
    };

    try {
      const res = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        setRegError(data.error || 'Profile update failed.');
      } else {
        // Complete onboard and log in successfully
        localStorage.setItem('ericon_logged_scientist', JSON.stringify(data.user));
        onSuccess(data.user);
      }
    } catch {
      setRegError('Communication anomaly with profile indexer.');
    } finally {
      setRegLoading(false);
    }
  };

  // Forgot password Link
  const handleForgotPasswordRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setRegError('Email field is required.');
      return;
    }
    setRegError(null);
    setForgotLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim() })
      });
      const data = await res.json();
      if (!res.ok) {
        setRegError(data.error || 'Forgot transaction error.');
      } else {
        setSimulatedInboxMail({
          recipient: forgotEmail.trim(),
          subject: data.simulatedEmailInboxPayload.subject,
          body: data.simulatedEmailInboxPayload.text,
          token: data.token
        });
        setResetToken(data.token);
        setForgotSuccess(true);
      }
    } catch {
      setRegError('Error reaching forgot handler.');
    } finally {
      setForgotLoading(false);
    }
  };

  // Password reset submit
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setRegError('Passwords must be at least 8 characters long.');
      return;
    }
    setRegError(null);
    setResetLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: resetToken,
          newPassword
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setRegError(data.error || 'Token expired or consumed.');
      } else {
        // Shift back to login
        setLoginInput(forgotEmail);
        setStep('login');
        setLoginError('🔐 Password upgraded successfully! Proceed to sign in.');
        setForgotSuccess(false);
        setSimulatedInboxMail(null);
      }
    } catch {
      setRegError('Connection fault.');
    } finally {
      setResetLoading(false);
    }
  };

  const mapTabName = (tab: string) => {
    if (tab === 'discuss') return 'Scientific Forums';
    if (tab === 'workspace') return 'Google Workspace Hub';
    if (tab === 'simulator') return 'Microthermal Fluid Simulator';
    if (tab === 'developer') return 'Governance Console';
    if (tab === 'research') return 'Specimens Database';
    return tab.toUpperCase();
  };

  const showTabs = step === 'login' || step === 'register_step1';

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-55 flex items-center justify-center p-4 overflow-y-auto" id="ericon-verification-backdrop">
      <div 
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-lg shadow-2xl flex flex-col max-h-[95vh] overflow-hidden"
        id="ericon-auth-modal"
      >
        {/* Modular sticky header selector. Login & Register screens display the modern interactive dual tabs. */}
        {showTabs ? (
          <div className="flex bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 font-sans select-none relative" id="ericon-auth-gatewall-tabs">
            {/* Absolute Close/Cancel button for clean dismissal */}
            {!isBlockPage && (
              <button 
                type="button"
                onClick={onCancel}
                aria-label="Close Authentication Gateway"
                className="absolute right-3 top-3.5 z-50 p-1.5 rounded-full text-slate-400 hover:text-slate-650 dark:hover:text-slate-250 hover:bg-slate-200/50 dark:hover:bg-slate-800/80 cursor-pointer border-0 bg-transparent flex items-center justify-center transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Left Tab: Log In */}
            <button
              type="button"
              onClick={() => {
                if (step !== 'login') {
                  setStep('login');
                  setRegError(null);
                }
              }}
              className={`w-1/2 py-5 px-4 flex flex-col items-center justify-center border-r border-slate-200 dark:border-slate-800 transition-all cursor-pointer ${
                step === 'login' 
                  ? 'bg-white dark:bg-slate-900 border-b-2 border-b-[#15462D] text-slate-800 dark:text-white font-bold' 
                  : 'bg-slate-100/80 dark:bg-slate-800/20 text-slate-400 hover:text-slate-550 dark:hover:text-slate-455 font-normal hover:bg-slate-100 dark:hover:bg-slate-850/10'
              }`}
            >
              <span className="text-[10px] tracking-wide text-slate-400 dark:text-slate-500 font-medium leading-none mb-1 text-center">Already have an account?</span>
              <span className="text-sm font-semibold">Log In</span>
            </button>

            {/* Right Tab: Sign Up */}
            <button
              type="button"
              onClick={() => {
                if (step !== 'register_step1') {
                  setStep('register_step1');
                  setLoginError(null);
                }
              }}
              className={`w-1/2 py-5 px-4 flex flex-col items-center justify-center transition-all cursor-pointer ${
                step === 'register_step1' 
                  ? 'bg-white dark:bg-slate-900 border-b-2 border-b-[#15462D] text-slate-800 dark:text-white font-bold' 
                  : 'bg-slate-100/80 dark:bg-slate-800/20 text-slate-400 hover:text-slate-550 dark:hover:text-slate-455 font-normal hover:bg-slate-100 dark:hover:bg-slate-850/10'
              }`}
            >
              <span className="text-[10px] tracking-wide text-slate-400 dark:text-slate-500 font-medium leading-none mb-1 text-center">Need an ERICON license?</span>
              <span className="text-sm font-semibold">Sign Up</span>
            </button>
          </div>
        ) : (
          /* Standard academic fallback header for core verification sub-steps (Steps 2 & 3, Recovery) */
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-[#15462D] text-white flex justify-between items-center select-none font-mono">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-450" />
              <div>
                <h3 className="font-extrabold tracking-wider text-xs uppercase leading-none">Security Access Gatewall</h3>
                <p className="text-[8.5px] text-[#A6E8B6] font-bold leading-none mt-1">ERICON COHORT ONBOARDING SYSTEM (ER2026.V.1.0.2 CORE)</p>
              </div>
            </div>
            {!isBlockPage && (
              <button 
                type="button"
                onClick={onCancel}
                aria-label="Close Authentication Gateway"
                className="p-1 rounded text-white/70 hover:text-white hover:bg-emerald-900/60 cursor-pointer border-0 bg-transparent flex items-center justify-center transition-all opacity-80 hover:opacity-100"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Modal Scroll Body */}
        <div className="overflow-y-auto p-6 space-y-5 text-start font-sans" id="auth-modal-main-scroller">
          
          {tabAttempted !== 'home' && step === 'login' && (
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-250 dark:border-amber-900 shadow-inner px-4 py-3 rounded-sm font-mono text-[10px] leading-relaxed text-amber-900 dark:text-amber-300">
              <div className="flex items-center gap-1.5 font-extrabold text-amber-955 dark:text-amber-200 uppercase border-b border-amber-100 dark:border-amber-900/50 pb-1 mb-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>TERMINAL ENTRY RESTRICTION: {mapTabName(tabAttempted)}</span>
              </div>
              The requested resource requires accredited ERICON researcher validation. Guests have read-only access to basic models. Register or sign in below.
            </div>
          )}

          <AnimatePresence mode="wait">
            
            {/* 1. LOGIN STATE */}
            {step === 'login' && (
              <motion.div
                key="login-view"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                {/* Custom Brand Header Area */}
                <div className="flex items-center gap-3 pb-2 border-b border-slate-105 dark:border-slate-800">
                  <EriconLogo size="header" showText={false} className="shrink-0" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">Welcome Back Scholar</h3>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-none mt-0.5 font-mono">
                      Security Gate: ER2026.V.1.0.2 CORE
                    </p>
                  </div>
                </div>

                {/* Email Verification Placeholder Alert */}
                <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-850 rounded p-3 text-emerald-800 dark:text-emerald-300 font-sans text-xs flex gap-2">
                  <Shield className="w-4.5 h-4.5 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-430" />
                  <div>
                    <strong className="font-semibold block mb-0.5">Verification Required</strong>
                    <p className="text-[10.5px] leading-relaxed">
                      All new ERICON personnel must verify their ecological directory email before granting live telemetry write clearance. Check your simulated inbox for credentials.
                    </p>
                  </div>
                </div>

                {loginError && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-905 text-rose-955 dark:text-rose-400 rounded text-xs select-none">
                    ⚠️ {loginError}
                  </div>
                )}

                <form onSubmit={isAccountFound ? handleNextClick : handleLoginSubmit} className="space-y-4">
                  <div className="space-y-1.5 text-left">
                    <label className="block text-[11px] font-bold text-slate-550 dark:text-slate-405">Email or Username</label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-slate-400">
                        <Mail className="w-4 h-4" />
                      </span>
                      <input
                        type="text"
                        required
                        ref={firstInputRef}
                        placeholder="sjenkins or s.jenkins@ericon.org"
                        value={loginInput}
                        id="login-input-username"
                        onChange={(e) => handleUsernameOrEmailChange(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800/80 border border-slate-205 dark:border-slate-705 focus:ring-1 focus:ring-[#15462D] focus:border-[#15462D] focus:outline-none rounded px-3.5 py-2.5 pl-10 text-slate-900 dark:text-white text-xs transition-all placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  {!isAccountFound && (
                    <div className="space-y-1.5 text-left">
                      <div className="flex justify-between items-center">
                        <label className="block text-[11px] font-bold text-slate-550 dark:text-slate-405">Password</label>
                        <button 
                          type="button" 
                          onClick={() => setStep('forgot')}
                          className="text-[#15462D] dark:text-[#5BB27D] hover:underline bg-transparent border-0 cursor-pointer font-bold py-0 text-[10.5px]"
                        >
                          forgot check?
                        </button>
                      </div>
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-[#50bb7f] font-bold">
                          <Lock className="w-4 h-4" />
                        </span>
                        <input
                          type={loginMask ? 'password' : 'text'}
                          required
                          placeholder="••••••••••••••"
                          value={loginPassword}
                          id="login-input-password"
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="w-full bg-white dark:bg-slate-800/80 border border-slate-205 dark:border-slate-705 focus:ring-1 focus:ring-[#15462D] focus:border-[#15462D] focus:outline-none rounded px-3.5 py-2.5 pl-10 pr-10 text-slate-900 dark:text-white text-xs transition-all placeholder:text-slate-400"
                        />
                        <button
                          type="button"
                          onClick={() => setLoginMask(!loginMask)}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-transparent border-0 cursor-pointer flex items-center justify-center select-none h-6"
                        >
                          {loginMask ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 select-none py-1 text-slate-500 dark:text-slate-450 text-left">
                    <input 
                      type="checkbox" 
                      id="login-remember" 
                      checked={loginRemember} 
                      onChange={(e) => setLoginRemember(e.target.checked)} 
                      className="accent-[#15462D] w-3.5 h-3.5 cursor-pointer rounded"
                    />
                    <label htmlFor="login-remember" className="font-semibold text-[11px] cursor-pointer">Remember my scientist coordinates on this device</label>
                  </div>

                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="w-full bg-[#15462D] hover:bg-[#0E301E] active:bg-[#0A2215] disabled:opacity-50 text-white font-semibold py-3 px-4 rounded shadow-sm border-0 cursor-pointer flex items-center justify-center gap-2 text-sm transition-all text-center uppercase tracking-wider"
                  >
                    {loginLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : isAccountFound ? 'Next' : 'Log in'}
                  </button>
                </form>

                {/* Divider matching the image layout */}
                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
                  <span className="flex-shrink mx-4 text-slate-400 text-xs font-medium uppercase select-none font-sans">OR</span>
                  <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
                </div>

                {/* Social Onboarding integrations */}
                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    className="w-full flex items-center justify-center gap-3 bg-[#F1F3F5] hover:bg-[#E9ECEF] dark:bg-slate-800 dark:hover:bg-slate-755 p-2.5 rounded font-medium text-xs text-slate-700 dark:text-slate-250 cursor-pointer transition-all border-0"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l3.227-3.13C18.281 1.155 15.49.2 12.24.2 5.76.2.5 5.46.5 12s5.26 11.8 11.74 11.8c6.777 0 11.272-4.757 11.272-11.472 0-.776-.08-1.36-.182-1.95L12.24 10.285z" />
                    </svg>
                    <span>Log in with Google</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => alert('Handshake success. Federated security identity established.')}
                    className="w-full flex items-center justify-center gap-3 bg-[#F1F3F5] hover:bg-[#E9ECEF] dark:bg-slate-800 dark:hover:bg-slate-755 p-2.5 rounded font-medium text-xs text-slate-700 dark:text-slate-250 cursor-pointer transition-all border-0"
                  >
                    <svg className="w-4 h-4 shrink-0 fill-current" viewBox="0 0 24 24">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                    </svg>
                    <span>Log in with GitHub</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => alert('Handshake success. Clever SSO token acknowledged.')}
                    className="w-full flex items-center justify-center gap-3 bg-[#F1F3F5] hover:bg-[#E9ECEF] dark:bg-slate-800 dark:hover:bg-slate-755 p-2.5 rounded font-medium text-xs text-slate-700 dark:text-slate-250 cursor-pointer transition-all border-0"
                  >
                    <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center font-black font-sans text-[11px] leading-none shrink-0 border border-blue-500">C</div>
                    <span>Log in with Clever</span>
                  </button>
                </div>

                <div className="pt-3 text-[11px] text-slate-550 dark:text-slate-455 leading-normal border-t border-slate-100 dark:border-slate-800 text-center">
                  By logging in, you access the{' '}
                  <a href="#/terms" onClick={(e) => { e.preventDefault(); alert('ERICON Portal Terms of Use.'); }} className="text-[#15462D] dark:text-[#5BB27D] hover:underline font-semibold font-sans">ERICON Portal Service Terms of Use</a>{' '}
                  and{' '}
                  <a href="#/privacy" onClick={(e) => { e.preventDefault(); alert('ERICON Data Privacy Standard details.'); }} className="text-[#15462D] dark:text-[#5BB27D] hover:underline font-semibold font-sans">Privacy Policy</a>.
                </div>
              </motion.div>
            )}

            {/* OTP VERIFICATION STATE */}
            {step === 'otp_verification' && (
              <motion.div
                key="otp-verification-view"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="space-y-5"
              >
                {/* Brand Header */}
                <div className="flex items-center gap-3 pb-2 border-b border-slate-105 dark:border-slate-800">
                  <ShieldCheck className="w-6 h-6 text-emerald-500 shrink-0" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">Two-Step Authentication</h3>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-none mt-0.5 font-mono">
                      Multi-Factor Security Clearance Check
                    </p>
                  </div>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  A high-security, 6-digit biometric dispatch code has been generated. Use the authorization token below to confirm your session identity.
                </div>

                {/* Sandbox Fallback Banner (Requirement 3) */}
                {otpSandbox && (
                  <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-250 dark:border-amber-900 rounded p-3 text-amber-800 dark:text-amber-300 font-sans text-xs flex gap-2 text-left">
                    <AlertTriangle className="w-4.5 h-4.5 shrink-0 mt-0.5 text-amber-600" />
                    <div>
                      <strong className="font-semibold block mb-0.5">Sandbox Environment Enabled</strong>
                      <p className="text-[10.5px] leading-relaxed">
                        The email API key is missing. The random biosecurity OTP has been printed to the server logs. Use the temporary bypass code displayed below to test:
                      </p>
                      <div className="inline-block mt-2 font-mono font-bold bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 px-3 py-1 rounded border border-amber-300 dark:border-amber-800 tracking-widest text-sm">
                        {otpDemoCode || 'Retrieving...'}
                      </div>
                    </div>
                  </div>
                )}

                {otpError && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-905 text-rose-955 dark:text-rose-400 rounded text-xs select-none">
                    ⚠️ {otpError}
                  </div>
                )}

                <form onSubmit={handleOtpVerifySubmit} className="space-y-4">
                  <div className="space-y-1.5 text-left">
                    <label className="block text-[11px] font-bold text-slate-550 dark:text-slate-405 uppercase tracking-wide">6-Digit Cryptographic Code</label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-slate-200 font-bold">
                        <KeyRound className="w-4 h-4" />
                      </span>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        placeholder="ENTER SECURE OTP"
                        value={otpToken}
                        onChange={(e) => setOtpToken(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-white dark:bg-slate-800/80 border border-slate-205 dark:border-slate-705 focus:ring-1 focus:ring-[#15462D] focus:border-[#15462D] focus:outline-none rounded px-3.5 py-2.5 pl-10 text-slate-900 dark:text-white text-xs font-mono tracking-[4px] placeholder:tracking-normal font-bold transition-all placeholder:text-slate-400 text-center"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={otpLoading}
                    className="w-full bg-[#15462D] hover:bg-[#0E301E] active:bg-[#0A2215] disabled:opacity-50 text-white font-semibold py-3 px-4 rounded shadow-sm border-0 cursor-pointer flex items-center justify-center gap-2 text-sm transition-all uppercase tracking-wider font-sans"
                  >
                    {otpLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Verify Security Token'}
                  </button>
                </form>

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('login');
                      setIsAccountFound(false);
                      setOtpError(null);
                    }}
                    className="text-xs font-semibold text-[#15462D] dark:text-[#5BB27D] hover:underline bg-transparent border-0 cursor-pointer"
                  >
                    ← Back to Login Step
                  </button>
                </div>
              </motion.div>
            )}

            {/* 2. REGISTRATION STEP 1: INITIAL REQ PROFILE */}
            {step === 'register_step1' && (
              <motion.div
                key="register-step1-view"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                {/* Custom Brand Header Area */}
                <div className="flex items-center gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <EriconLogo size="header" showText={false} className="shrink-0" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">Create Corporate Account</h3>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-none mt-0.5">Authorizing credential parameters for level-1 secure sessions</p>
                  </div>
                </div>

                {regError && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-250 dark:border-rose-900/40 text-rose-955 dark:text-rose-400 rounded text-xs select-none">
                    ⚠️ {regError}
                  </div>
                )}

                {/* Grid Inputs matching the requested visual layout */}
                <form onSubmit={handleRegStep1Submit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Email Field (Top Left) */}
                    <div className="space-y-1.5 text-left">
                      <label className="block text-[11px] font-bold text-slate-550 dark:text-slate-405">Email</label>
                      <input
                        type="email"
                        required
                        placeholder="Email"
                        value={regEmail}
                        id="reg-input-email"
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800/80 border border-slate-205 dark:border-slate-705 focus:ring-1 focus:ring-[#15462D] focus:border-[#15462D] focus:outline-none rounded px-3.5 py-2.5 text-slate-900 dark:text-white text-xs transition-all placeholder:text-slate-400"
                      />
                    </div>

                    {/* Password Field (Top Right) */}
                    <div className="space-y-1.5 text-left relative">
                      <label className="block text-[11px] font-bold text-slate-550 dark:text-slate-405 flex items-center justify-between">
                        <span>Password</span>
                        <div className="relative group inline-block">
                          <span className="p-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-[#15462D] cursor-help flex items-center justify-center text-[10px] w-4 h-4 font-mono font-bold select-none">i</span>
                          {/* Tooltip Popup */}
                          <div className="absolute right-0 bottom-6 hidden group-hover:block w-48 p-2.5 bg-slate-900 text-white text-[10px] rounded shadow-lg font-mono leading-relaxed z-50">
                            Minimum 8 characters with letters and numbers.
                          </div>
                        </div>
                      </label>
                      <div className="relative">
                        <input
                          type={regMask ? "password" : "text"}
                          required
                          placeholder="Password"
                          value={regPassword}
                          id="reg-input-password"
                          onChange={(e) => setRegPassword(e.target.value)}
                          className="w-full bg-white dark:bg-slate-800/80 border border-slate-205 dark:border-slate-705 focus:ring-1 focus:ring-[#15462D] focus:border-[#15462D] focus:outline-none rounded px-3.5 py-2.5 pr-10 text-slate-900 dark:text-white text-xs transition-all placeholder:text-slate-400"
                        />
                        <button
                          type="button"
                          onClick={() => setRegMask(!regMask)}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-transparent border-0 cursor-pointer select-none flex items-center h-5"
                        >
                          {regMask ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* First Name Field (Bottom Left) */}
                    <div className="space-y-1.5 text-left">
                      <label className="block text-[11px] font-bold text-slate-550 dark:text-slate-405">First name</label>
                      <input
                        type="text"
                        required
                        placeholder="First name"
                        value={regFirstName}
                        id="reg-input-firstname"
                        onChange={(e) => setRegFirstName(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800/80 border border-slate-205 dark:border-slate-705 focus:ring-1 focus:ring-[#15462D] focus:border-[#15462D] focus:outline-none rounded px-3.5 py-2.5 text-slate-900 dark:text-white text-xs transition-all placeholder:text-slate-400"
                      />
                    </div>

                    {/* Last Name Field (Bottom Right) */}
                    <div className="space-y-1.5 text-left">
                      <label className="block text-[11px] font-bold text-slate-550 dark:text-slate-405">Last name</label>
                      <input
                        type="text"
                        required
                        placeholder="Last name"
                        value={regLastName}
                        id="reg-input-lastname"
                        onChange={(e) => setRegLastName(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800/80 border border-slate-205 dark:border-slate-705 focus:ring-1 focus:ring-[#15462D] focus:border-[#15462D] focus:outline-none rounded px-3.5 py-2.5 text-slate-900 dark:text-white text-xs transition-all placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  {/* Sign Up Action Button */}
                  <button
                    type="submit"
                    disabled={regLoading}
                    className="w-full mt-2 bg-[#15462D] hover:bg-[#0E301E] active:bg-[#0A2215] disabled:opacity-50 text-white font-semibold py-3 px-4 rounded shadow-sm border-0 cursor-pointer flex items-center justify-center gap-2 text-sm transition-all"
                  >
                    {regLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Sign up'}
                  </button>
                </form>

                {/* Divider matching the image layout */}
                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
                  <span className="flex-shrink mx-4 text-slate-400 text-xs font-medium uppercase select-none font-sans">OR</span>
                  <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
                </div>

                {/* Social Onboarding integrations */}
                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    className="w-full flex items-center justify-center gap-3 bg-[#F1F3F5] hover:bg-[#E9ECEF] dark:bg-slate-800 dark:hover:bg-slate-755 p-2.5 rounded font-medium text-xs text-slate-700 dark:text-slate-250 cursor-pointer transition-all border-0"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l3.227-3.13C18.281 1.155 15.49.2(12.24.2 5.76.2.5 5.46.5 12s5.26 11.8 11.74 11.8c6.777 0 11.272-4.757 11.272-11.472 0-.776-.08-1.36-.182-1.95L12.24 10.285z" />
                    </svg>
                    <span>Sign up with Google</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => alert('GitHub Federated Onboarding linked! Standard auth records verified and mapped.')}
                    className="w-full flex items-center justify-center gap-3 bg-[#F1F3F5] hover:bg-[#E9ECEF] dark:bg-slate-800 dark:hover:bg-slate-755 p-2.5 rounded font-medium text-xs text-slate-700 dark:text-slate-250 cursor-pointer transition-all border-0"
                  >
                    <svg className="w-4 h-4 shrink-0 fill-current" viewBox="0 0 24 24">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                    </svg>
                    <span>Sign up with GitHub</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => alert('Clever Corporate SSO handshake complete. Authentic coordinates generated.')}
                    className="w-full flex items-center justify-center gap-3 bg-[#F1F3F5] hover:bg-[#E9ECEF] dark:bg-slate-800 dark:hover:bg-slate-755 p-2.5 rounded font-medium text-xs text-slate-700 dark:text-slate-250 cursor-pointer transition-all border-0"
                  >
                    <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center font-black font-sans text-[11px] leading-none shrink-0 border border-blue-500">C</div>
                    <span>Sign up with Clever</span>
                  </button>
                </div>

                {/* Terms and Privacy Footer Legal bounds */}
                <div className="pt-3 text-[11px] text-slate-550 dark:text-slate-455 leading-normal border-t border-slate-100 dark:border-slate-800 text-center">
                  By signing up, you agree to the{' '}
                  <a href="#/terms" onClick={(e) => { e.preventDefault(); alert('ERICON Portal Service Terms of Use.'); }} className="text-[#15462D] dark:text-[#5BB27D] hover:underline font-semibold font-sans">ERICON Portal Service Terms of Use</a>{' '}
                  and{' '}
                  <a href="#/privacy" onClick={(e) => { e.preventDefault(); alert('ERICON Data Privacy Standard details.'); }} className="text-[#15462D] dark:text-[#5BB27D] hover:underline font-semibold font-sans">Privacy Policy</a>.
                </div>
              </motion.div>
            )}

            {/* 3. REGISTRATION STEP 2: SIMULATED INBOX VERIFICATION */}
            {step === 'register_step2' && (
              <motion.div
                key="register-step2-view"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="space-y-4 font-mono text-xs"
              >
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 text-[#15462D] dark:text-emerald-450 border border-emerald-100 dark:border-emerald-800/60 rounded-full flex items-center justify-center mx-auto">
                    <Mail className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">Accreditation Link Dispatched</h4>
                    <p className="text-xs text-slate-405 dark:text-slate-505">Step 2 of 3: Check mailbox to approve secure session alignment (Onboard &le; 30s)</p>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-center space-y-2 select-none">
                  <p className="font-semibold text-slate-650 dark:text-slate-350 tracking-tight leading-normal">
                    We've sent an instant security accreditation coordinate link directly to:
                  </p>
                  <p className="font-black text-[#15462D] dark:text-emerald-410 text-[13px]">{regEmail}</p>
                  <div className="text-[10px] text-slate-400">
                    Resend available in: <strong className="text-slate-600 dark:text-slate-300 font-extrabold">{verificationTimer}s</strong> seconds.
                  </div>
                </div>

                <div className="border border-slate-200 dark:border-slate-750 p-2 bg-amber-50/40 dark:bg-amber-950/10 rounded flex items-start gap-1.5 font-sans">
                  <span className="shrink-0">💡</span>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    <strong>Sandbox Accelerator</strong>: Instead of wait limits, click the direct button below or approve via the simulated inbox console to satisfy the 30-second registration limit!
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSimulatedVerifyLink}
                  className="w-full py-2.5 bg-slate-850 hover:bg-slate-900 text-white rounded font-bold uppercase text-[10.5px] border-0 cursor-pointer text-center tracking-wider flex items-center justify-center gap-1"
                >
                  {regLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : '✔ Verify Credentials Instantly & Proceed'}
                </button>
              </motion.div>
            )}

            {/* 4. REGISTRATION STEP 3: COLLAPSIBLE SCIENTIST PROFILE */}
            {step === 'register_step3' && (
              <motion.div
                key="register-step3-view"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="space-y-4 font-mono text-xs"
              >
                <div>
                  <h4 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">Accreditation Profile (Optional)</h4>
                  <p className="text-xs text-slate-405 dark:text-slate-550">Step 3 of 3: Collapsible Scientific Context Progressive Disclosure</p>
                </div>

                {regError && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/25 border border-red-300 text-red-900 dark:text-red-400 rounded">
                    {regError}
                  </div>
                )}

                {/* Collapsible header trigger */}
                <div 
                  onClick={() => setProfileExpanded(!profileExpanded)}
                  className="p-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-150 dark:border-slate-700/60 rounded flex items-center justify-between cursor-pointer select-none"
                >
                  <span className="font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5 text-[10px]">
                    <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Scientific professional information details</span>
                  </span>
                  <span className="text-slate-400 font-extrabold text-xs">{profileExpanded ? '▼ Collapsible' : '▲ Expand form'}</span>
                </div>

                {profileExpanded && (
                  <div className="p-4 bg-white dark:bg-slate-850 border border-t-0 border-slate-200 dark:border-slate-700 rounded-b space-y-4 transition-all">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      
                      <div className="space-y-1">
                        <label className="block text-[9.5px] font-bold text-slate-405 uppercase">Country Base</label>
                        <div className="relative">
                          <span className="absolute left-2.5 top-2 text-slate-450"><Globe className="w-3.5 h-3.5" /></span>
                          <input 
                            type="text" 
                            required
                            value={regCountry} 
                            id="reg-profile-country"
                            onChange={(e) => setRegCountry(e.target.value)} 
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-205 dark:border-slate-700 rounded px-2 py-1.5 pl-8 text-slate-950 dark:text-white"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[9.5px] font-bold text-slate-405 uppercase">Affiliation Institution</label>
                        <div className="relative">
                          <span className="absolute left-2.5 top-2 text-slate-455"><Building className="w-3.5 h-3.5" /></span>
                          <input 
                            type="text" 
                            required
                            placeholder="e.g. SUA, Morogoro"
                            value={regInstitution} 
                            id="reg-profile-institution"
                            onChange={(e) => setRegInstitution(e.target.value)} 
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-205 dark:border-slate-700 rounded px-2 py-1.5 pl-8 text-slate-950 dark:text-white"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[9.5px] font-bold text-slate-405 uppercase">Primary Profession</label>
                        <input 
                          type="text" 
                          required
                          placeholder="e.g. Rodent Ecologist"
                          value={regProfession} 
                          id="reg-profile-profession"
                          onChange={(e) => setRegProfession(e.target.value)} 
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-205 dark:border-slate-700 rounded px-2 py-1.5 text-slate-950 dark:text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[9.5px] font-bold text-slate-405 uppercase">Researcher Class</label>
                        <select 
                          value={regClassification} 
                          id="reg-profile-classification"
                          onChange={(e) => setRegClassification(e.target.value as any)}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-255 dark:border-slate-700 rounded px-2 py-1.5 text-slate-905 dark:text-white font-extrabold"
                        >
                          <option value="Expert">Accredited Expert / Scientist</option>
                          <option value="Student">Academic Student Coordinator</option>
                        </select>
                      </div>

                      <div className="sm:col-span-2 space-y-1">
                        <label className="block text-[9.5px] font-bold text-slate-405 uppercase">orcid iD profile identifier (optional)</label>
                        <div className="relative">
                          <span className="absolute left-2.5 top-2 text-slate-450"><Award className="w-3.5 h-3.5" /></span>
                          <input 
                            type="text" 
                            placeholder="e.g. 0000-0003-1201-140X"
                            value={regOrcid} 
                            id="reg-profile-orcid"
                            onChange={(e) => setRegOrcid(e.target.value)} 
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-205 dark:border-slate-700 rounded px-2 py-1.5 pl-8 text-slate-950 dark:text-white font-mono"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-2 space-y-1">
                        <label className="block text-[9.5px] font-bold text-slate-405 uppercase">Research Field Focus</label>
                        <textarea 
                          rows={2} 
                          value={regInterests} 
                          id="reg-profile-interests"
                          onChange={(e) => setRegInterests(e.target.value)} 
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-205 dark:border-slate-700 rounded px-2 py-1.5 text-slate-955 dark:text-white font-sans text-xs"
                        />
                      </div>

                      <div className="sm:col-span-2 space-y-1.5">
                        <label className="block text-[9.5px] font-bold text-slate-405 uppercase">Select Interactive Launcher Profile Badge</label>
                        <div className="grid grid-cols-4 gap-2">
                          {avatars.map(item => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => setRegProfileImage(item.id)}
                              className={`py-1.5 px-1 rounded border-2 text-center text-[10px] bg-slate-50 dark:bg-slate-800 cursor-pointer select-none transition-all ${
                                regProfileImage === item.id 
                                  ? 'border-emerald-600 bg-emerald-50/20' 
                                  : 'border-slate-200 dark:border-slate-705'
                              }`}
                            >
                              <span className="text-lg block mb-0.5">{item.emoji}</span>
                              <span className="text-[8px] font-semibold text-slate-550 block truncate uppercase leading-none">{item.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => handleProfileComplete(true)}
                    className="py-2.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-350 rounded font-black uppercase text-[10.5px] border-0 cursor-pointer text-center"
                  >
                    ⏩ Skip Profile Info
                  </button>
                  <button
                    type="button"
                    onClick={() => handleProfileComplete(false)}
                    className="py-2.5 px-3 bg-[#15462D] hover:bg-emerald-800 text-white rounded font-black uppercase text-[10.5px] border-0 cursor-pointer text-center"
                  >
                    ✔ Complete & Onboard
                  </button>
                </div>
              </motion.div>
            )}

            {/* 5. FORGOT PASSWORD SYSTEM */}
            {step === 'forgot' && (
              <motion.div
                key="forgot-view"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="space-y-4 font-mono text-xs"
              >
                <div>
                  <h4 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">Recover Credentials Key</h4>
                  <p className="text-xs text-slate-405 dark:text-slate-550">Biosecurity single-use token password recovery generator.</p>
                </div>

                {regError && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-300 text-red-951 dark:text-red-400 rounded">
                    ⚠️ {regError}
                  </div>
                )}

                {forgotSuccess ? (
                  <div className="space-y-4">
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-900 text-emerald-950 dark:text-emerald-300 rounded leading-normal">
                      🛡️ **Simulation Mail Dispatched**: We've generated a valid 5-minute single-use credentials resetting coordinate. Open the simulated sandbox mailbox console at the bottom to transition instantly!
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[10.5px] font-black text-slate-500 uppercase">Input Sent Coordinate Reset Code</label>
                      <input 
                        type="text" 
                        placeholder="e.g. RESET-XXXX-XXXX"
                        value={resetToken} 
                        id="reset-input-token-code"
                        onChange={(e) => setResetToken(e.target.value.toUpperCase())}
                        className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-805 border border-slate-205 dark:border-slate-700 font-mono text-xs uppercase"
                      />
                      <button
                        type="button"
                        onClick={() => setStep('reset_submit')}
                        className="w-full bg-[#15462D] hover:bg-emerald-800 text-white font-black py-2 rounded text-center uppercase border-0 cursor-pointer"
                      >
                        Proceed to password replacement Form
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleForgotPasswordRequest} className="space-y-3.5 flex flex-col text-xs">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-black text-slate-550 uppercase">Registered Scientist Email</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-slate-400"><Mail className="w-4 h-4" /></span>
                        <input
                          type="email"
                          required
                          placeholder="e.g. s.jenkins@ericon.org"
                          value={forgotEmail}
                          id="forgot-input-email"
                          onChange={(e) => setForgotEmail(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-700 rounded px-3 py-2 pl-9 text-slate-900 dark:text-white focus:outline-[#15462D]"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="w-full py-2.5 bg-[#15462D] hover:bg-emerald-800 disabled:opacity-50 text-white font-black uppercase text-[10.5px] tracking-wider border-0 cursor-pointer flex items-center justify-center gap-1"
                    >
                      {forgotLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : '✉ Dispatch Secure Reset Coordinate Code'}
                    </button>
                  </form>
                )}

                <div className="pt-2 border-t border-slate-100 dark:border-slate-805 flex justify-between">
                  <button 
                    type="button" 
                    onClick={() => { setStep('login'); setRegError(null); }}
                    className="text-slate-450 hover:text-slate-805 uppercase font-bold text-[10.5px] bg-transparent border-0 cursor-pointer p-0"
                  >
                    ← Back to Login
                  </button>
                </div>
              </motion.div>
            )}

            {/* 6. RESET PASSWORD FORM SUBMIT */}
            {step === 'reset_submit' && (
              <motion.div
                key="reset-submit-view"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="space-y-4 font-mono text-xs"
              >
                <div>
                  <h4 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">Configure New Password Coordinate</h4>
                  <p className="text-xs text-[#15462D] font-extrabold">Active single use code: {resetToken}</p>
                </div>

                {regError && (
                  <div className="p-3 bg-red-50 text-red-900 rounded">
                    ⚠️ {regError}
                  </div>
                )}

                <form onSubmit={handleResetPasswordSubmit} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black text-slate-500 uppercase">Input Complex Hardened Password</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-405"><Lock className="w-4 h-4" /></span>
                      <input
                        type={newPasswordMask ? 'password' : 'text'}
                        required
                        placeholder="Min 8 characters code"
                        value={newPassword}
                        id="reset-input-new-password"
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-205 dark:border-slate-700 rounded px-3 py-2 pl-9 text-slate-950 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => setNewPasswordMask(!newPasswordMask)}
                        className="absolute right-3 top-2 text-slate-400 hover:text-slate-708 bg-transparent border-0 cursor-pointer flex items-center justify-center h-8"
                      >
                        {newPasswordMask ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {newPassword && (
                    <div className="bg-slate-50 dark:bg-slate-800 border border-slate-150 p-2 rounded">
                      <div className="flex justify-between items-center text-[9px] font-black mb-1">
                        <span className="text-slate-400 uppercase">Pass Strength Indicator:</span>
                        <span className={`uppercase font-extrabold ${
                          getPwdStrengthInfo(newPassword).strength === 'strong' ? 'text-emerald-700' :
                          getPwdStrengthInfo(newPassword).strength === 'medium' ? 'text-amber-700' : 'text-rose-600'
                        }`}>
                          {getPwdStrengthInfo(newPassword).strength}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-[8px] text-slate-400">
                        <div>{getPwdStrengthInfo(newPassword).lengthOk ? '✔' : '○'} Min 8 chars</div>
                        <div>{getPwdStrengthInfo(newPassword).hasLetters ? '✔' : '○'} Letters</div>
                        <div>{getPwdStrengthInfo(newPassword).hasNumbers ? '✔' : '○'} Numbers</div>
                        <div>{getPwdStrengthInfo(newPassword).hasSymbols ? '✔' : '○'} Symbols</div>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full py-2.5 bg-[#15462D] hover:bg-emerald-800 text-white rounded font-black uppercase text-[10.5px]"
                  >
                    {resetLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin mx-auto" /> : '🔐 Upgrade My Biosecurity Password'}
                  </button>
                </form>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-805 flex justify-between mt-4">
                  <button 
                    type="button" 
                    onClick={() => { setStep('login'); setRegError(null); }}
                    className="text-slate-450 hover:text-slate-805 uppercase font-bold text-[10.5px] bg-transparent border-0 cursor-pointer p-0"
                  >
                    ← Back to Login
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* 7. SIMULATED EMAIL INBOX NOTIFICATIONS SANDBOX CENTER */}
        {simulatedInboxMail && (
          <div className="p-4 bg-slate-900 border-t border-slate-800 font-mono text-[9.5px]/relaxed text-start relative select-none shrink-0" id="auth-email-sandbox">
            <div className="absolute top-2 right-3 text-[7.5px] font-black text-emerald-400 bg-emerald-950 border border-emerald-805/40 px-1.5 py-0.5 rounded uppercase">
              SANDBOX MAIL SEC_OK
            </div>
            <p className="font-extrabold text-slate-400 flex items-center gap-1.5 border-b border-slate-800 pb-1 mb-1.5">
              <span>📩 STATIONS MAIL DEPUTIZED SIMULATOR INBOX:</span>
            </p>
            <div className="space-y-1 text-slate-300">
              <div><strong className="text-slate-500 uppercase">Recipient:</strong> {simulatedInboxMail.recipient}</div>
              <div><strong className="text-slate-500 uppercase">Subject:</strong> {simulatedInboxMail.subject}</div>
              <div className="bg-slate-950 p-2 border border-slate-800 rounded font-bold text-slate-400 mt-1 max-h-[80px] overflow-y-auto whitespace-pre-line text-[9px]/tight select-all">
                {simulatedInboxMail.body}
              </div>
              
              {/* Context Trigger Action Button inside Sandbox */}
              {step === 'register_step2' && (
                <button
                  type="button"
                  onClick={handleSimulatedVerifyLink}
                  className="w-full mt-2 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded font-extrabold uppercase text-[9px] tracking-wide cursor-pointer transition border-0 text-center"
                >
                  ✉ Click simulated validation inside box [Onboard Express]
                </button>
              )}

              {step === 'forgot' && simulatedInboxMail.token && (
                <button
                  type="button"
                  onClick={() => setStep('reset_submit')}
                  className="w-full mt-2 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded font-extrabold uppercase text-[9px] tracking-wide cursor-pointer transition border-0 text-center"
                >
                  🔑 Click reset approval to unlock new password menu
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
