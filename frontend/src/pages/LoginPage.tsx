import React, { useState } from 'react';
import { Sparkles, Eye, EyeOff, ArrowRight, AlertCircle, Layers } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (mode === 'signup') {
        if (!username.trim()) {
          throw new Error('Username is required');
        }
        await register(email, username, password);
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#121212] flex flex-col items-center justify-center px-4 font-sans antialiased selection:bg-[#E2D1C3] dark:selection:bg-[#4A3B32]">

      {/* Ambient background pattern */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#E2D1C3]/30 to-transparent dark:from-[#4A3B32]/20 blur-3xl" />
        <div className="absolute bottom-[-15%] left-[-5%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-[#E2D1C3]/20 to-transparent dark:from-[#4A3B32]/10 blur-3xl" />
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md">

        {/* Logo / Brand */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#121212] dark:bg-white flex items-center justify-center">
              <Layers className="w-5 h-5 text-white dark:text-[#121212]" />
            </div>
          </div>
          <h1 className="text-3xl font-serif italic tracking-tight text-[#121212] dark:text-[#FAF9F6]">
            AstraQ
          </h1>
          <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#121212]/40 dark:text-[#FAF9F6]/40 mt-2">
            Research Agent Platform
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white/70 dark:bg-white/[0.04] backdrop-blur-sm border border-[#121212]/10 dark:border-white/10 p-8 sm:p-10">

          {/* Mode Toggle */}
          <div className="flex bg-[#121212]/5 dark:bg-white/5 p-1 mb-8 gap-1">
            <button
              type="button"
              onClick={() => { setMode('signin'); setError(null); }}
              className={`flex-1 py-2.5 text-[10px] uppercase tracking-[0.15em] font-bold transition-all cursor-pointer ${
                mode === 'signin'
                  ? 'bg-[#121212] text-white dark:bg-white dark:text-[#121212]'
                  : 'text-[#121212]/50 dark:text-white/50 hover:text-[#121212] dark:hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(null); }}
              className={`flex-1 py-2.5 text-[10px] uppercase tracking-[0.15em] font-bold transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-[#121212] text-white dark:bg-white dark:text-[#121212]'
                  : 'text-[#121212]/50 dark:text-white/50 hover:text-[#121212] dark:hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 p-3.5 mb-6 text-xs text-red-700 dark:text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-[9px] uppercase tracking-[0.2em] font-bold text-[#121212]/50 dark:text-white/40 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full bg-transparent border border-[#121212]/15 dark:border-white/15 px-4 py-3 text-sm text-[#121212] dark:text-[#FAF9F6] placeholder:text-[#121212]/25 dark:placeholder:text-white/25 focus:outline-none focus:border-[#121212]/40 dark:focus:border-white/40 transition-colors font-mono"
              />
            </div>

            {/* Username (register only) */}
            {mode === 'signup' && (
              <div>
                <label className="block text-[9px] uppercase tracking-[0.2em] font-bold text-[#121212]/50 dark:text-white/40 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="your_username"
                  className="w-full bg-transparent border border-[#121212]/15 dark:border-white/15 px-4 py-3 text-sm text-[#121212] dark:text-[#FAF9F6] placeholder:text-[#121212]/25 dark:placeholder:text-white/25 focus:outline-none focus:border-[#121212]/40 dark:focus:border-white/40 transition-colors font-mono"
                />
              </div>
            )}

            {/* Password */}
            <div>
              <label className="block text-[9px] uppercase tracking-[0.2em] font-bold text-[#121212]/50 dark:text-white/40 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  className="w-full bg-transparent border border-[#121212]/15 dark:border-white/15 px-4 py-3 pr-12 text-sm text-[#121212] dark:text-[#FAF9F6] placeholder:text-[#121212]/25 dark:placeholder:text-white/25 focus:outline-none focus:border-[#121212]/40 dark:focus:border-white/40 transition-colors font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#121212]/30 dark:text-white/30 hover:text-[#121212]/60 dark:hover:text-white/60 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {mode === 'signup' && (
                <p className="text-[10px] text-[#121212]/35 dark:text-white/30 mt-1.5 tracking-wide">
                  Minimum 6 characters
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#121212] dark:bg-white text-white dark:text-[#121212] py-3.5 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-[#121212]/90 dark:hover:bg-white/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 dark:border-[#121212]/30 border-t-white dark:border-t-[#121212] rounded-full animate-spin" />
                  {mode === 'signin' ? 'Signing in...' : 'Creating account...'}
                </>
              ) : (
                <>
                  {mode === 'signin' ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Bottom link */}
        <p className="text-center text-[10px] text-[#121212]/40 dark:text-white/40 mt-6 tracking-wide">
          {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            onClick={toggleMode}
            className="font-bold text-[#121212]/70 dark:text-white/70 hover:text-[#121212] dark:hover:text-white transition-colors underline underline-offset-2 cursor-pointer"
          >
            {mode === 'signin' ? 'Sign up' : 'Sign in'}
          </button>
        </p>

        {/* Footer */}
        <p className="text-center text-[9px] text-[#121212]/25 dark:text-white/20 mt-8 font-mono tracking-wider uppercase">
          AstraQ Cognitive Suite • Secure Authentication
        </p>
      </div>
    </div>
  );
}
