import React, { useState, useEffect, useRef } from 'react';
import { 
  Mail, Lock, Eye, EyeOff, RefreshCw, X, ShieldCheck, KeyRound
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { googleSignIn } from '../lib/workspaceAuth';

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
  // Navigation steps: 'login', 'register_step1', 'register_step2', 'register_step3', 'forgot_step1', 'forgot_step2', 'forgot_step3'
  const [step, setStep] = useState<string>(
    initialStep === 'register' ? 'register_step1' : 'login'
  );

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // OTP inputs
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(6).fill(''));
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Sandbox simulation mail info
  const [simulatedInboxMail, setSimulatedInboxMail] = useState<any | null>(null);

  // Auto-focus logic
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setError(null);
    if (step === 'login' || step === 'register_step1' || step === 'forgot_step1') {
      setTimeout(() => emailInputRef.current?.focus(), 100);
    } else if (step === 'register_step2' || step === 'forgot_step2') {
      setOtpDigits(Array(6).fill(''));
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } else if (step === 'register_step3' || step === 'forgot_step3') {
      setTimeout(() => passwordInputRef.current?.focus(), 100);
    }
  }, [step]);

  // Handle individual OTP Box Inputs
  const handleOtpChange = (index: number, val: string) => {
    const sanitized = val.replace(/\D/g, '');
    if (!sanitized) return;
    const nextDigits = [...otpDigits];
    
    if (sanitized.length > 1) {
      const chars = sanitized.split('').slice(0, 6 - index);
      chars.forEach((char, i) => {
        nextDigits[index + i] = char;
      });
      setOtpDigits(nextDigits);
      const lastIndex = Math.min(index + chars.length - 1, 5);
      otpRefs.current[lastIndex]?.focus();
    } else {
      nextDigits[index] = sanitized;
      setOtpDigits(nextDigits);
      if (index < 5) {
        otpRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      const nextDigits = [...otpDigits];
      if (nextDigits[index]) {
        nextDigits[index] = '';
        setOtpDigits(nextDigits);
      } else if (index > 0) {
        nextDigits[index - 1] = '';
        setOtpDigits(nextDigits);
        otpRefs.current[index - 1]?.focus();
      }
    }
  };

  // 1. LOGIN HANDLER
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please fill in all credentials.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usernameOrEmail: email.trim(),
          password
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Authentication failed.');
      } else {
        localStorage.setItem('ericon_logged_scientist', JSON.stringify(data.user));
        onSuccess(data.user);
      }
    } catch {
      setError('Unable to reach auth server.');
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth Sync
  const handleGoogleSignIn = async () => {
    try {
      setError(null);
      setLoading(true);
      const googleUserObj = await googleSignIn();
      if (googleUserObj && googleUserObj.user) {
        const u = googleUserObj.user;
        const displayName = u.displayName || u.email?.split('@')[0] || 'Scientific Member';
        
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
          loggedUser.isEmailVerified = true;
          localStorage.setItem('ericon_logged_scientist', JSON.stringify(loggedUser));
          onSuccess(loggedUser);
        } else {
          setError('Could not synchronize Google credentials with standard directories.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Google Auth integration failed.');
    } finally {
      setLoading(false);
    }
  };

  // 2. REGISTRATION HANDLERS
  // Step 1: Send Verification Code
  const handleRegisterStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Email address is required.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register-send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to dispatch verification code.');
      } else {
        if (data.sandbox) {
          setSimulatedInboxMail(data.simulatedEmailInboxPayload);
        }
        setStep('register_step2');
      }
    } catch {
      setError('Communication with the verification system failed.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: OTP Verification
  const handleRegisterStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    const otp = otpDigits.join('');
    if (otp.length !== 6) {
      setError('Please enter the full 6-digit verification code.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register-verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), otp })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Verification code is invalid or has expired.');
      } else {
        setStep('register_step3');
      }
    } catch {
      setError('Unable to verify code with security directory.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Password Setup & Finalize
  const handleRegisterStep3 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register-finalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to finalize registration.');
      } else {
        localStorage.setItem('ericon_logged_scientist', JSON.stringify(data.user));
        onSuccess(data.user);
      }
    } catch {
      setError('Communication fault with account generator.');
    } finally {
      setLoading(false);
    }
  };

  // 3. FORGOT PASSWORD HANDLERS
  // Step 1: Send Reset Link
  const handleForgotStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Email address is required.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Email verification failed.');
      } else {
        if (data.sandbox) {
          setSimulatedInboxMail(data.simulatedEmailInboxPayload);
        }
        setStep('forgot_step2');
      }
    } catch {
      setError('Could not reach password recovery agent.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: OTP Verification for Reset
  const handleForgotStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    const otp = otpDigits.join('');
    if (otp.length !== 6) {
      setError('Please enter the full 6-digit verification code.');
      return;
    }
    setError(null);
    setStep('forgot_step3');
  };

  // Step 3: Save New Password
  const handleForgotStep3 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const otp = otpDigits.join('');
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: otp, newPassword: password })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Password upgrade failed.');
      } else {
        setStep('login');
        setError(null);
        setPassword('');
        setConfirmPassword('');
        setSimulatedInboxMail(null);
        alert('Password reset successfully. Please log in.');
      }
    } catch {
      setError('Could not apply password changes.');
    } finally {
      setLoading(false);
    }
  };

  // Quick helper to autofill OTP digits for Sandbox mode testing
  const autofillSandboxCode = () => {
    if (simulatedInboxMail) {
      const match = simulatedInboxMail.body.match(/\b\d{6}\b/);
      if (match) {
        const code = match[0];
        setOtpDigits(code.split(''));
        setError(null);
      }
    }
  };

  const isLoginActive = step === 'login';
  const isRegisterStep = step.startsWith('register');

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto" id="ericon-verification-backdrop">
      <div 
        className="relative w-full max-w-md bg-slate-50 dark:bg-[#121824] border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden transition-all duration-300"
        id="ericon-auth-modal"
      >
        {/* Simple Top Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2 select-none">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[#10b981]" />
            <span className="font-semibold text-sm tracking-wide text-slate-800 dark:text-slate-100 uppercase font-sans">
              ERICON SECURITY
            </span>
          </div>
          {!isBlockPage && (
            <button 
              type="button"
              onClick={onCancel}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/80 transition-all cursor-pointer border-0 bg-transparent"
              aria-label="Dismiss Modal"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Tab Toggle (Only shown when not processing OTP/password setup screens) */}
        {(step === 'login' || step === 'register_step1') && (
          <div className="flex px-6 mt-4 gap-4 border-b border-slate-200 dark:border-slate-800/60 pb-0" id="ericon-auth-gatewall-tabs">
            <button
              type="button"
              onClick={() => {
                setStep('login');
                setError(null);
              }}
              className={`pb-3 text-sm font-medium transition-all border-b-2 cursor-pointer ${
                isLoginActive 
                  ? 'border-[#10b981] text-slate-900 dark:text-white font-semibold' 
                  : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setStep('register_step1');
                setError(null);
              }}
              className={`pb-3 text-sm font-medium transition-all border-b-2 cursor-pointer ${
                isRegisterStep 
                  ? 'border-[#10b981] text-slate-900 dark:text-white font-semibold' 
                  : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              Register
            </button>
          </div>
        )}

        {/* Error Notification */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 rounded-xl text-xs select-none">
            {error}
          </div>
        )}

        {/* Content Box */}
        <div className="p-6 overflow-y-auto" id="auth-modal-main-scroller">
          <AnimatePresence mode="wait">
            {/* A. SIGN IN */}
            {step === 'login' && (
              <motion.div
                key="login"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-4"
              >
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div className="space-y-2 text-left">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email Address</label>
                    <input
                      type="text"
                      required
                      ref={emailInputRef}
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-[#10b981]/50 focus:border-[#10b981] focus:outline-none rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm transition-all placeholder:text-slate-400"
                    />
                  </div>

                  <div className="space-y-2 text-left">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Password</label>
                      <button 
                        type="button" 
                        onClick={() => setStep('forgot_step1')}
                        className="text-[#10b981] hover:underline font-semibold text-xs bg-transparent border-0 cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-[#10b981]/50 focus:border-[#10b981] focus:outline-none rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm transition-all placeholder:text-slate-400 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-transparent border-0"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#10b981] hover:bg-[#0e9f6e] text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm transition-all cursor-pointer shadow-lg shadow-emerald-500/10 border-0 uppercase tracking-wide mt-2"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Sign In'}
                  </button>
                </form>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
                  <span className="flex-shrink mx-4 text-slate-400 text-xs font-medium uppercase select-none font-sans">OR</span>
                  <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
                </div>

                {/* Google Sign In integration */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 p-3 rounded-xl font-medium text-xs text-slate-700 dark:text-slate-200 cursor-pointer transition-all shadow-sm"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l3.227-3.13C18.281 1.155 15.49.2 12.24.2 5.76.2.5 5.46.5 12s5.26 11.8 11.74 11.8c6.777 0 11.272-4.757 11.272-11.472 0-.776-.08-1.36-.182-1.95L12.24 10.285z" />
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </motion.div>
            )}

            {/* B1. REGISTRATION STEP 1: EMAIL */}
            {step === 'register_step1' && (
              <motion.div
                key="register_step1"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-4"
              >
                <form onSubmit={handleRegisterStep1} className="space-y-4">
                  <div className="space-y-2 text-left">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email Address</label>
                    <input
                      type="email"
                      required
                      ref={emailInputRef}
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-[#10b981]/50 focus:border-[#10b981] focus:outline-none rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm transition-all placeholder:text-slate-400"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#10b981] hover:bg-[#0e9f6e] text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm transition-all cursor-pointer shadow-lg shadow-emerald-500/10 border-0 uppercase tracking-wide mt-2"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Send Verification Code'}
                  </button>
                </form>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
                  <span className="flex-shrink mx-4 text-slate-400 text-xs font-medium uppercase select-none font-sans">OR</span>
                  <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
                </div>

                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 p-3 rounded-xl font-medium text-xs text-slate-700 dark:text-slate-200 cursor-pointer transition-all shadow-sm"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l3.227-3.13C18.281 1.155 15.49.2 12.24.2 5.76.2.5 5.46.5 12s5.26 11.8 11.74 11.8c6.777 0 11.272-4.757 11.272-11.472 0-.776-.08-1.36-.182-1.95L12.24 10.285z" />
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </motion.div>
            )}

            {/* B2. REGISTRATION STEP 2: OTP */}
            {step === 'register_step2' && (
              <motion.div
                key="register_step2"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-5"
              >
                <div className="text-center">
                  <div className="w-10 h-10 bg-emerald-500/10 text-[#10b981] rounded-full flex items-center justify-center mx-auto mb-2">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Verify your Email</h4>
                  <p className="text-xs text-slate-404 mt-1">We sent a 6-digit verification code to your email.</p>
                </div>

                <form onSubmit={handleRegisterStep2} className="space-y-5">
                  <div className="flex justify-between gap-2 max-w-xs mx-auto">
                    {otpDigits.map((digit, index) => (
                      <input
                        key={index}
                        type="text"
                        maxLength={1}
                        ref={(el) => { otpRefs.current[index] = el; }}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="w-11 h-11 text-center text-lg font-bold bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-[#10b981]/50 focus:border-[#10b981] focus:outline-none rounded-xl text-slate-900 dark:text-white transition-all font-mono"
                      />
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#10b981] hover:bg-[#0e9f6e] text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm transition-all cursor-pointer shadow-lg shadow-emerald-500/10 border-0 uppercase tracking-wide"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Verify Code'}
                  </button>
                </form>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setStep('register_step1')}
                    className="text-xs font-semibold text-[#10b981] hover:underline bg-transparent border-0 cursor-pointer"
                  >
                    Back to Email Address
                  </button>
                </div>
              </motion.div>
            )}

            {/* B3. REGISTRATION STEP 3: PASSWORD */}
            {step === 'register_step3' && (
              <motion.div
                key="register_step3"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-4"
              >
                <div className="text-center">
                  <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Secure Your Account</h4>
                  <p className="text-xs text-slate-400">Set up a secure login password to finalize.</p>
                </div>

                <form onSubmit={handleRegisterStep3} className="space-y-4">
                  <div className="space-y-2 text-left">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Create Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        ref={passwordInputRef}
                        placeholder="Choose password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-[#10b981]/50 focus:border-[#10b981] focus:outline-none rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm transition-all placeholder:text-slate-400 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 bg-transparent border-0 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 text-left">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Confirm Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        placeholder="Re-enter password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-[#10b981]/50 focus:border-[#10b981] focus:outline-none rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm transition-all placeholder:text-slate-400 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 bg-transparent border-0 cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#10b981] hover:bg-[#0e9f6e] text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm transition-all cursor-pointer shadow-lg shadow-emerald-500/10 border-0 uppercase tracking-wide mt-4"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Finalize Account'}
                  </button>
                </form>
              </motion.div>
            )}

            {/* C1. FORGOT PASSWORD STEP 1: EMAIL */}
            {step === 'forgot_step1' && (
              <motion.div
                key="forgot_step1"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-4"
              >
                <div className="text-left mb-2">
                  <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Recover Password</h4>
                  <p className="text-xs text-slate-400 mt-1">Enter your registered email below to receive an OTP recovery code.</p>
                </div>

                <form onSubmit={handleForgotStep1} className="space-y-4">
                  <div className="space-y-2 text-left">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email Address</label>
                    <input
                      type="email"
                      required
                      ref={emailInputRef}
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-[#10b981]/50 focus:border-[#10b981] focus:outline-none rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm transition-all placeholder:text-slate-400"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#10b981] hover:bg-[#0e9f6e] text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm transition-all cursor-pointer shadow-lg shadow-emerald-500/10 border-0 uppercase tracking-wide mt-2"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Send Recovery OTP'}
                  </button>
                </form>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setStep('login')}
                    className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:underline bg-transparent border-0 cursor-pointer"
                  >
                    Back to Login
                  </button>
                </div>
              </motion.div>
            )}

            {/* C2. FORGOT PASSWORD STEP 2: OTP ENTRY */}
            {step === 'forgot_step2' && (
              <motion.div
                key="forgot_step2"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-5"
              >
                <div className="text-center">
                  <div className="w-10 h-10 bg-emerald-500/10 text-[#10b981] rounded-full flex items-center justify-center mx-auto mb-2">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Enter Recovery Code</h4>
                  <p className="text-xs text-slate-400 mt-1">We dispatched a 6-digit recovery code to your email.</p>
                </div>

                <form onSubmit={handleForgotStep2} className="space-y-5">
                  <div className="flex justify-between gap-2 max-w-xs mx-auto">
                    {otpDigits.map((digit, index) => (
                      <input
                        key={index}
                        type="text"
                        maxLength={1}
                        ref={(el) => { otpRefs.current[index] = el; }}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="w-11 h-11 text-center text-lg font-bold bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-[#10b981]/50 focus:border-[#10b981] focus:outline-none rounded-xl text-slate-900 dark:text-white transition-all font-mono"
                      />
                    ))}
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#10b981] hover:bg-[#0e9f6e] text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm transition-all cursor-pointer shadow-lg shadow-emerald-500/10 border-0 uppercase tracking-wide"
                  >
                    Confirm Code
                  </button>
                </form>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setStep('forgot_step1')}
                    className="text-xs font-semibold text-[#10b981] hover:underline bg-transparent border-0 cursor-pointer"
                  >
                    Back to Email
                  </button>
                </div>
              </motion.div>
            )}

            {/* C3. FORGOT PASSWORD STEP 3: RESET SETUP */}
            {step === 'forgot_step3' && (
              <motion.div
                key="forgot_step3"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-4"
              >
                <div className="text-center">
                  <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Choose New Password</h4>
                  <p className="text-xs text-slate-404 mt-1">Please enter your replacement login password below.</p>
                </div>

                <form onSubmit={handleForgotStep3} className="space-y-4">
                  <div className="space-y-2 text-left">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">New Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        ref={passwordInputRef}
                        placeholder="Enter new password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-[#10b981]/50 focus:border-[#10b981] focus:outline-none rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm transition-all placeholder:text-slate-400 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 bg-transparent border-0 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 text-left">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Confirm New Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        placeholder="Verify password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-[#10b981]/50 focus:border-[#10b981] focus:outline-none rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm transition-all placeholder:text-slate-400 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 bg-transparent border-0 cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#10b981] hover:bg-[#0e9f6e] text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm transition-all cursor-pointer shadow-lg shadow-emerald-500/10 border-0 uppercase tracking-wide mt-4"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Apply New Password'}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Dynamic Sandbox Mail Helper (At the bottom of the card) */}
        {simulatedInboxMail && (
          <div className="p-4 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800/80 font-mono text-[10px] text-start shrink-0 select-none" id="auth-email-sandbox">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[9px] font-bold text-emerald-500 tracking-wide uppercase bg-emerald-500/10 px-1.5 py-0.5 rounded">
                SIMULATED INBOX
              </span>
              <button
                type="button"
                onClick={autofillSandboxCode}
                className="text-[9px] font-bold text-[#10b981] hover:underline bg-transparent border-0 cursor-pointer p-0"
              >
                Autofill OTP Code
              </button>
            </div>
            <div className="text-slate-600 dark:text-slate-300 space-y-1">
              <div><strong className="text-slate-400">To:</strong> {simulatedInboxMail.recipient}</div>
              <div><strong className="text-slate-400">Subject:</strong> {simulatedInboxMail.subject}</div>
              <div className="bg-white dark:bg-slate-950 p-2 rounded border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 whitespace-pre-line text-[9px]">
                {simulatedInboxMail.body}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
