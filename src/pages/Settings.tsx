import React, { useState, useEffect } from 'react';
import { useUIStore } from '../store/useUIStore';
import { useAuthStore } from '../store/useAuthStore';
import { useAuditStore } from '../store/useAuditStore';
import { useToastStore } from '../store/useToastStore';

export const Settings: React.FC = () => {
  const { lang, accent, setAccent } = useUIStore();

  const user = useAuthStore((s) => s.user);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const addLog = useAuditStore((s) => s.addLog);
  const addToast = useToastStore((s) => s.addToast);

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [major, setMajor] = useState(user?.major || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [biography, setBiography] = useState(user?.biography || '');

  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      setMajor(user.major);
      setAvatar(user.avatar);
      setBiography(user.biography || '');
    }
  }, [user]);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      fullName,
      major,
      avatar,
      biography,
    });
    addLog('Altered custom user profile metadata', 'Personalization', user?.fullName || 'Academic Peer');
    addToast(lang === 'en' ? 'Profile metadata updated successfully!' : 'Đã cập nhật cấu hình thông tin học tập!', 'success');
  };

  const handleAccentChange = (hex: string, name: string) => {
    setAccent(hex);
    addLog(`Altered custom theme accent setting to ${name}`, 'Personalization', user?.fullName || 'Academic Peer');
    addToast(
      lang === 'en' ? `Theme color changed to ${name}` : `Đã chuyển màu giao diện sang Màu ${name}`, 
      'success'
    );
  };

  return (
    <div className="bg-[#111111] border border-white/5 rounded-[32px] p-6 lg:p-8 space-y-8 max-w-3xl font-sans">
      <div className="space-y-1">
        <h3 className="text-lg font-bold font-display text-white">Student Personalization</h3>
        <p className="text-slate-400 text-xs font-mono">Tailor visual aesthetics, workspace themes, profile imagery, and general academic metrics.</p>
      </div>

      {/* Accent selector block */}
      <div className="space-y-3">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block font-mono">Workspace Theme Accent Selection</span>
        <div className="flex flex-wrap gap-4">
          {[
            { hex: '#CCFF00', name: 'Sleek Neon Green' },
            { hex: '#00E5FF', name: 'Electric Cyan' },
            { hex: '#FF007F', name: 'Crimson Pink' },
            { hex: '#BD00FF', name: 'Imperial Violet' },
            { hex: '#FFD600', name: 'Vibrant Yellow' }
          ].map(col => (
            <button
              key={col.hex}
              onClick={() => handleAccentChange(col.hex, col.name)}
              className={`w-10 h-10 rounded-xl relative border-2 cursor-pointer transition ${
                accent === col.hex ? 'border-white scale-95 shadow-lg' : 'border-transparent'
              }`}
              style={{ backgroundColor: col.hex }}
              title={col.name}
            >
              {accent === col.hex && (
                <span className="absolute inset-0 bg-black/10 flex items-center justify-center text-xs font-bold text-black font-mono">
                  ✓
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Profile form fields simulation */}
      <form onSubmit={handleUpdate} className="space-y-4 pt-4 border-t border-white/5">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Academics Metadata Profile Editor</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1 font-mono">Full Name</label>
            <input 
              type="text" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-[#161616] border border-white/5 rounded-xl p-3 text-white focus:outline-none" 
            />
          </div>
          <div>
            <label className="block text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1 font-mono">Major Degree Focus</label>
            <input 
              type="text" 
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              className="w-full bg-[#161616] border border-white/5 rounded-xl p-3 text-white focus:outline-none" 
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1 font-mono">Profile Avatar Link (Unsplash URL)</label>
            <div className="flex gap-4 items-center">
              {avatar && (
                <img src={avatar} alt="Avatar Preview" className="w-12 h-12 rounded-full object-cover border-2 border-white/10 shrink-0" />
              )}
              <input 
                type="text" 
                value={avatar} 
                onChange={(e) => setAvatar(e.target.value)}
                className="w-full bg-[#161616] border border-white/5 rounded-xl p-3 text-white focus:outline-none font-mono text-xs" 
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1 font-mono">Mini Student Biography</label>
          <textarea 
            value={biography} 
            onChange={(e) => setBiography(e.target.value)}
            rows={3}
            className="w-full bg-[#161616] border border-white/5 rounded-xl p-3 text-white focus:outline-none text-xs" 
          />
        </div>

        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl text-black font-black text-xs uppercase tracking-wider hover:opacity-90 transition cursor-pointer"
          style={{ backgroundColor: accent }}
        >
          {lang === 'en' ? 'Save Profile' : 'Lưu Hồ Sơ'}
        </button>
      </form>

      {/* Custom system properties info table */}
      <div className="bg-black p-4 border border-white/5 rounded-2xl relative overflow-hidden font-mono text-[10px] text-slate-400 space-y-1">
        <span className="text-[#CCFF00] font-bold block mb-1">LOCAL WORKSPACE PROPERTIES PROFILE</span>
        <div>• Session Authenticated: YES</div>
        <div>• Database schema: Integrated SQLite Client (Web LocalStore)</div>
        <div>• Role Permission Level: {user ? user.role.toUpperCase() : 'STUDENT'}</div>
      </div>
    </div>
  );
};

export default Settings;
