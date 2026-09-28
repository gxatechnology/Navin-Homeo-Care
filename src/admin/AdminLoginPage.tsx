import React, { useState, useEffect } from 'react';
import { useRouter } from '../context/RouterContext';
import { adminAuthService, DEFAULT_ADMIN_EMAIL } from '../services/adminAuthService';
import {
  Lock,
  Mail,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const { navigate } = useRouter();

  const [email, setEmail] = useState<string>(DEFAULT_ADMIN_EMAIL);
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Forgot Password / Reset modal states
  const [resetModalOpen, setResetModalOpen] = useState<boolean>(false);
  const [resetEmail, setResetEmail] = useState<string>(DEFAULT_ADMIN_EMAIL);
  const [resetToken, setResetToken] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [resetStep, setResetStep] = useState<'request' | 'verify'>('request');
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);

  useEffect(() => {
    // If already authenticated, redirect to dashboard
    if (adminAuthService.isAuthenticated()) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const result = await adminAuthService.login(email, password, rememberMe);
      if (result.success) {
        navigate('/admin/dashboard');
      } else {
        setErrorMessage(result.error || 'Authentication failed. Please verify credentials.');
      }
    } catch {
      setErrorMessage('An unexpected error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    setResetMessage(null);
    setIsLoading(true);

    try {
      const res = await adminAuthService.requestPasswordReset(resetEmail);
      setResetMessage(res.message);
      setResetStep('verify');
    } catch {
      setResetError('Unable to process password reset request.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    setIsLoading(true);

    try {
      const res = await adminAuthService.resetPasswordWithToken(resetToken, newPassword);
      if (res.success) {
        setResetMessage('Password successfully updated! You may now sign in with your new password.');
        setTimeout(() => {
          setResetModalOpen(false);
          setResetStep('request');
          setPassword('');
        }, 2200);
      } else {
        setResetError(res.error || 'Failed to reset password.');
      }
    } catch {
      setResetError('Failed to verify token.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-900/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-teal-900/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-[#001428] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden relative z-10">
        {/* Top Brand Banner */}
        <div className="p-8 text-center border-b border-slate-800/80 bg-gradient-to-b from-[#001c38] to-[#001428]">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center">
              <img
                src="/admin-logo.png"
                alt="Navin Homeo Care Admin Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Navin Homeo Care</h1>
          <p className="text-xs text-emerald-400 font-medium tracking-wide uppercase mt-1">
            Clinic & Store Administration
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700/60 text-[11px] text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Authorized Clinical Personnel Only</span>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-8">
          {errorMessage && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-950/40 border border-red-900/60 flex items-start gap-2.5 text-red-200 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Sign In Failed</p>
                <p className="text-red-300/90 mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Administrator Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Authorized address: <span className="text-slate-300 font-mono">{DEFAULT_ADMIN_EMAIL}</span>
              </p>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Master Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setResetModalOpen(true);
                    setResetStep('request');
                    setResetMessage(null);
                    setResetError(null);
                  }}
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter administrator password"
                  className="w-full pl-10 pr-11 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Security Policy */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-slate-950"
                />
                <span className="text-xs text-slate-400">Remember session (7 days)</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white font-semibold text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Admin Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Setup / Security Guide */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-2">
            <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
              <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
              <span>Admin Access Information</span>
            </div>
            <p className="leading-relaxed">
              Authorized clinical administrator portal for{' '}
              <span className="text-emerald-400 font-mono font-medium">{DEFAULT_ADMIN_EMAIL}</span>.
              Access is protected by secure session authentication. You can change your password anytime under Settings.
            </p>
          </div>
        </div>

        {/* Back to Public Website Link */}
        <div className="py-3.5 px-8 bg-slate-950/70 border-t border-slate-800/60 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            &larr; Return to Public Clinic Website
          </button>
        </div>
      </div>

      {/* Forgot Password / Reset Modal */}
      {resetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#001428] border border-slate-800 rounded-2xl shadow-2xl p-6 text-white text-xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-sm">Admin Password Recovery</h3>
              </div>
              <button
                onClick={() => setResetModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                &times;
              </button>
            </div>

            {resetMessage && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-950/40 border border-emerald-900/60 text-emerald-200 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">{resetMessage}</p>
              </div>
            )}

            {resetError && (
              <div className="mb-4 p-3 rounded-lg bg-red-950/40 border border-red-900/60 text-red-200 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <p className="text-[11px]">{resetError}</p>
              </div>
            )}

            {resetStep === 'request' ? (
              <form onSubmit={handleRequestReset} className="space-y-4">
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Enter your registered administrator email to generate a secure recovery token.
                </p>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Admin Email</label>
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setResetModalOpen(false)}
                    className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold cursor-pointer"
                  >
                    Generate Reset Token
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyReset} className="space-y-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Reset Token (Check notification banner above)
                  </label>
                  <input
                    type="text"
                    required
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    placeholder="nhc_reset_XXXXXX"
                    className="w-full px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    New Master Password (Min 8 characters)
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setResetStep('request')}
                    className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold cursor-pointer"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
