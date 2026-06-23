import React, { useState } from 'react';
import { Shield, Eye, EyeOff, User, Mail, GraduationCap, Loader2 } from 'lucide-react';
import { Translations } from '../translations';
import { useAuthStore } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';

interface AuthModuleProps {
  t: Translations;
  accentColor: string;
  onLoginSuccess: (user: any) => void;
  onAuthenticate?: (email: string, password: string) => any;
  onRegister?: (account: any) => boolean;
  logAction?: (action: string, moduleName: string) => void;
  onContinueAsGuest?: () => void;
}

export const AuthModule: React.FC<AuthModuleProps> = ({
  t, accentColor, onLoginSuccess, logAction, onContinueAsGuest
}) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [faculty, setFaculty] = useState('');
  const [major, setMajor] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);
  const addToast = useToastStore((s) => s.addToast);

  const handleSubmit = async (e?: React.FormEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    if (!email || !password) { setErrorMsg('Vui lòng nhập email và mật khẩu.'); return; }
    
    const emailLower = email.trim().toLowerCase();
    if (!emailLower.endsWith('@gmail.com') && !emailLower.endsWith('@campusforge.edu')) {
      setErrorMsg('Vui lòng sử dụng email thật (có đuôi @gmail.com) hoặc email sinh viên (@campusforge.edu) để tránh tài khoản rác.');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await login(emailLower, password);
        logAction?.(`Login: ${emailLower}`, 'Auth');
        onLoginSuccess({});
      } else {
        if (!fullName || !studentId) { setErrorMsg('Vui lòng điền đầy đủ họ tên và MSSV.'); setLoading(false); return; }
        await register({ email: emailLower, password, fullName: fullName.trim(), studentId: studentId.trim(), faculty, major });
        logAction?.(`Register: ${emailLower}`, 'Auth');
        onLoginSuccess({});
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <div
        className="absolute w-96 h-96 blur-[150px] opacity-15 rounded-full transition-all duration-1000"
        style={{ backgroundColor: accentColor, top: '20%', left: '30%' }}
      />
      <div className="w-full max-w-md bg-[#111111] border border-white/5 rounded-[32px] p-8 relative z-10 shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-2xl items-center justify-center mb-4 border"
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

        {/* Demo hint */}
        <div className="p-3 mb-4 bg-white/3 border border-white/5 text-slate-500 text-[10px] rounded-xl leading-relaxed">
          <strong className="text-slate-400">Demo:</strong> admin@campusforge.edu / Admin12345 &nbsp;|&nbsp; student@campusforge.edu / Student123
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Họ và tên</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full bg-[#161616] border border-white/5 text-sm text-white rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-white/20 font-sans" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">MSSV</label>
                <div className="relative">
                  <GraduationCap className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input type="text" value={studentId} onChange={(e) => setStudentId(e.target.value)}
                    placeholder="73DCTT20099"
                    className="w-full bg-[#161616] border border-white/5 text-sm text-white rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-white/20 font-mono" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Khoa</label>
                  <input type="text" value={faculty} onChange={(e) => setFaculty(e.target.value)}
                    placeholder="CNTT"
                    className="w-full bg-[#161616] border border-white/5 text-sm text-white rounded-xl py-2.5 px-4 focus:outline-none focus:border-white/20" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Ngành</label>
                  <input type="text" value={major} onChange={(e) => setMajor(e.target.value)}
                    placeholder="CNPM"
                    className="w-full bg-[#161616] border border-white/5 text-sm text-white rounded-xl py-2.5 px-4 focus:outline-none focus:border-white/20" />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="student@campusforge.edu"
                className="w-full bg-[#161616] border border-white/5 text-sm text-white rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-white/20 font-mono" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Mật khẩu</label>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(e); }}
                placeholder="••••••••"
                className="w-full bg-[#161616] border border-white/5 text-sm text-white rounded-xl py-2.5 pl-4 pr-10 focus:outline-none focus:border-white/20" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
            style={{ backgroundColor: accentColor, color: '#000' }}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {isLogin ? 'Đăng nhập' : 'Tạo tài khoản'}
          </button>
        </form>

        <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
          <button type="button" onClick={() => { setIsLogin(!isLogin); setErrorMsg(''); }}
            className="hover:text-slate-300 transition-colors">
            {isLogin ? 'Chưa có tài khoản? Đăng ký' : 'Đã có tài khoản? Đăng nhập'}
          </button>
          {onContinueAsGuest && (
            <button type="button" onClick={onContinueAsGuest}
              className="hover:text-slate-300 transition-colors">
              Tiếp tục không đăng nhập →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
