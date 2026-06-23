import React, { useState } from 'react';
import { Shield, Key, Eye, EyeOff, User, Mail, GraduationCap } from 'lucide-react';
import { Translations } from '../translations';
import { Role } from '../types';

interface AuthModuleProps {
  t: Translations;
  accentColor: string;
  onLoginSuccess: (user: { fullName: string; role: Role; studentId: string; email: string }) => void;
  onAuthenticate: (email: string, password: string) => { fullName: string; role: Role; studentId: string; email: string } | undefined;
  onRegister: (account: { email: string; password: string; fullName: string; studentId: string; role: Role }) => boolean;
  logAction: (action: string, moduleName: string) => void;
  onContinueAsGuest?: () => void;
}

export const AuthModule: React.FC<AuthModuleProps> = ({ t, accentColor, onLoginSuccess, onAuthenticate, onRegister, logAction, onContinueAsGuest }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const validateEmail = (emailStr: string) => {
    const normalized = emailStr.trim().toLowerCase();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);
  };

  const passwordPolicy = (pwd: string) => {
    const trimmed = pwd.trim();
    return trimmed.length >= 8 && /[A-Z]/.test(trimmed) && /[a-z]/.test(trimmed) && /\d/.test(trimmed);
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email) {
      setErrorMsg(t.emailRequired);
      return;
    }

    if (!validateEmail(email)) {
      setErrorMsg(t.emailValidationMsg);
      return;
    }

    if (!passwordPolicy(password)) {
      setErrorMsg(t.passwordPolicy);
      return;
    }

    if (isLogin) {
      const authenticated = onAuthenticate(email, password);
      if (!authenticated) {
        setErrorMsg(t.invalidCredentials);
        return;
      }

      logAction(`User logged in successfully (Role: ${authenticated.role}, Email: ${authenticated.email})`, 'Auth & Security');
      onLoginSuccess(authenticated);
    } else {
      if (!fullName || !studentId) {
        setErrorMsg(t.fillAllFields);
        return;
      }

      const registered = onRegister({
        email: email.trim().toLowerCase(),
        password,
        fullName: fullName.trim(),
        studentId: studentId.trim(),
        role: 'Student',
      });

      if (!registered) {
        setErrorMsg(t.emailAlreadyRegistered);
        return;
      }

      setSuccessMsg(t.registrationSuccess);
      logAction(`Registered new student account: ${fullName} (${email})`, 'Auth & Security');
      onLoginSuccess({ fullName: fullName.trim(), role: 'Student', studentId: studentId.trim(), email: email.trim().toLowerCase() });
    }
  };

  const triggerForgotPassword = () => {
    if (!email) {
      setErrorMsg(t.enterEmailRecovery);
      return;
    }
    setSuccessMsg(t.recoveryDispatched);
    logAction(`Recovery request initialized for ${email}`, 'Auth & Security');
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Dynamic ambient highlight matching the active theme accent */}
      <div 
        className="absolute w-96 h-96 blur-[150px] opacity-15 rounded-full transition-all duration-1000"
        style={{ backgroundColor: accentColor, top: '20%', left: '30%' }}
      />
      
      <div className="w-full max-w-md bg-[#111111] border border-white/5 rounded-[32px] p-8 relative z-10 shadow-2xl transition-all duration-300">
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-2xl items-center justify-center mb-4 border transition-all duration-300"
               style={{ backgroundColor: `${accentColor}15`, borderColor: `${accentColor}40` }}>
            <Shield className="w-6 h-6" style={{ color: accentColor }} />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight font-display">{t.appName}</h1>
          <p className="text-slate-400 text-xs mt-1 uppercase tracking-wider font-semibold">{t.tagline}</p>
        </div>

        {errorMsg && (
          <div className="p-3 mb-4 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl font-medium">
            ⚠️ {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-3 mb-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl font-medium">
            ✅ {successMsg}
          </div>
        )}

        <form onSubmit={handleAuthSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{t.fullnamePlaceholder}</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Nguyen Van A"
                    className="w-full bg-[#161616] border border-white/5 text-sm text-white rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-white/20 transition-all font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{t.studentIdPlaceholder}</label>
                <div className="relative">
                  <GraduationCap className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="73DCTT20099"
                    className="w-full bg-[#161616] border border-white/5 text-sm text-white rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-white/20 transition-all font-mono"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
              {t.appName === "CampusForge" ? (isLogin ? "University Email Address" : "Email Academic Registration") : t.emailPlaceholder}
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@example.com"
                className="w-full bg-[#161616] border border-white/5 text-sm text-white rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-white/20 transition-all font-mono"
              />
            </div>
            <div className="mt-1 text-[10px] text-slate-500">
              {t.appName === "CampusForge" && (isLogin ? "Enter any valid email address." : "Nhập email hợp lệ.")}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t.passwordPlaceholder}</label>
              {isLogin && (
                <button
                  type="button"
                  onClick={triggerForgotPassword}
                  className="text-[10px] hover:underline cursor-pointer"
                  style={{ color: accentColor }}
                >
                  {t.forgotPassword}
                </button>
              )}
            </div>
            <div className="relative">
              <Key className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full bg-[#161616] border border-white/5 text-sm text-white rounded-xl py-2.5 pl-10 pr-10 focus:outline-none focus:border-white/20 transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {isLogin && (
            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                className="w-4 h-4 rounded border-gray-300 bg-gray-950 text-[#CCFF00] focus:ring-0"
              />
              <label htmlFor="remember" className="ml-2 text-xs text-slate-400 select-none cursor-pointer">
                {t.rememberMe}
              </label>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 mt-2 rounded-xl text-black font-black text-xs uppercase tracking-widest hover:-translate-y-[1px] active:translate-y-[1px] transition-all cursor-pointer shadow-lg"
            style={{ 
              backgroundColor: accentColor,
              boxShadow: `0 4px 20px ${accentColor}1A`
            }}
          >
            {isLogin ? t.login : t.register}
          </button>

          {isLogin && onContinueAsGuest && (
            <button
              type="button"
              onClick={onContinueAsGuest}
              className="w-full py-3 mt-2.5 bg-white/5 hover:bg-white/10 active:scale-98 transition text-slate-300 text-xs font-bold rounded-xl border border-white/5 cursor-pointer uppercase tracking-wider animate-pulse hover:animate-none"
            >
              {t.guestModeBtn}
            </button>
          )}
        </form>

        <div className="mt-6 pt-6 border-t border-white/5 text-center">
          <p className="text-xs text-slate-400">
            {isLogin ? t.needTeamEnv : t.alreadyPart}{' '}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className="font-bold underline tracking-tight cursor-pointer"
              style={{ color: accentColor }}
            >
              {isLogin ? t.joinPortal : t.accessSession}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
