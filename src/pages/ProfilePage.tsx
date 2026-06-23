import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  User, Users, Award, MessageSquare, Edit2, Check,
  MapPin, BookOpen, Activity, LayoutGrid
} from 'lucide-react';

import { useAuthStore } from '../store/useAuthStore';
import { useProjectStore } from '../store/useProjectStore';
import { useAuditStore } from '../store/useAuditStore';
import { useUIStore } from '../store/useUIStore';
import { useToastStore } from '../store/useToastStore';
import { UserProfile } from '../types';
import { translations } from '../translations';

export const ProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();

  const { lang, accent, setGuestBlockAction } = useUIStore();
  const t = translations[lang];

  const currentUser = useAuthStore((s) => s.user);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const projects = useProjectStore((s) => s.projects);
  const auditLogs = useAuditStore((s) => s.auditLogs);
  const addToast = useToastStore((s) => s.addToast);

  // Determine if viewing own profile
  const isSelf = !userId || userId === 'me' || userId === currentUser?.id || userId === currentUser?.studentId;

  // Active Tab: profile, projects, activity
  const [activeTab, setActiveTab] = useState<'profile' | 'projects' | 'activity'>('profile');
  
  // Follow toggle and follow counter
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(142);

  // Editing state for own profile
  const [isEditing, setIsEditing] = useState(false);
  const [editBio, setEditBio] = useState(currentUser?.biography || '');
  const [editMajor, setEditMajor] = useState(currentUser?.major || '');
  const [editGoals, setEditGoals] = useState(currentUser?.careerGoals || '');
  const [editCover, setEditCover] = useState(currentUser?.coverPhoto || '');
  const [editAvatar, setEditAvatar] = useState(currentUser?.avatar || '');
  const [editName, setEditName] = useState(currentUser?.fullName || '');

  // Mock static profiles for other users
  const getMockUserProfile = (): UserProfile => {
    if (isSelf && currentUser) return currentUser;

    // Search audit log or list of standard leaders
    // We create static detailed profiles
    if (userId?.toLowerCase() === 'linh' || userId === 'u4') {
      return {
        id: 'u4',
        fullName: 'Linh Dang',
        studentId: '73DCTT4551',
        email: 'linh.dang@st.utt.edu.vn',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
        coverPhoto: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&auto=format&fit=crop&q=80',
        faculty: 'Information Security Division',
        major: 'Cyber Security & Cryptography',
        academicYear: 'Senior member',
        biography: 'Certified white-hat penetration consultant. Love auditing middleware routers, SQL indices, and Docker ingress networks.',
        skills: [
          { name: 'Security Core', level: 5 },
          { name: 'NodeJS', level: 4 },
          { name: 'SQL DB', level: 4 },
          { name: 'Docker', level: 3 }
        ],
        interests: ['Secure JWT middlewares', 'Blockchain Consensus', 'Terminal interfaces'],
        careerGoals: 'Becoming an enterprise lead penetration tester.',
        reputationScore: 4210,
        role: 'Student'
      };
    }

    if (userId?.toLowerCase() === 'minh' || userId === 'u3') {
      return {
        id: 'u3',
        fullName: 'Minh Hoang',
        studentId: '73DCTI2250',
        email: 'minh.hoang@st.utt.edu.vn',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
        coverPhoto: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
        faculty: 'IoT & Microcontrollers Unit',
        major: 'Embedded Automation',
        academicYear: 'Designer lead',
        biography: 'Building physical models with Arduino circuits, ultrasonic radar hubs, and web visualization panels.',
        skills: [
          { name: 'C++', level: 5 },
          { name: 'Python', level: 4 },
          { name: 'UI Figma', level: 4 },
          { name: 'MQTT Broker', level: 3 }
        ],
        interests: ['Eco campuses', 'Figma prototypes', 'Microcontrollers'],
        careerGoals: 'Senior Hardware systems developer.',
        reputationScore: 3950,
        role: 'Project Leader'
      };
    }

    // Default matching mockAlex Nguyen
    return {
      id: 'u1',
      fullName: 'Alex Nguyen',
      studentId: '73DCTT1102',
      email: 'alex.n@st.utt.edu.vn',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
      coverPhoto: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=80',
      faculty: 'Computer Science Department',
      major: 'Software Engineering',
      academicYear: 'Senior Representative',
      biography: 'Enthusiastic front-end developer and code tutor. Leading Core Module implementations.',
      skills: [
        { name: 'React SPA', level: 5 },
        { name: 'Tailwind SDK', level: 5 },
        { name: 'Typescript', level: 4 }
      ],
      interests: ['SPA structures', 'Agile flows', 'Mentorship'],
      careerGoals: 'Lead SaaS Frontend Solutions Architect.',
      reputationScore: 4890,
      role: 'Project Leader'
    };
  };

  const profile = getMockUserProfile();

  const handleSaveProfile = () => {
    updateProfile({
      fullName: editName,
      biography: editBio,
      major: editMajor,
      careerGoals: editGoals,
      coverPhoto: editCover,
      avatar: editAvatar
    });
    setIsEditing(false);
    addToast(lang === 'en' ? 'Profile details saved successfully!' : 'Đã lưu thông tin hồ sơ!', 'success');
  };

  const handleFollowToggle = () => {
    if (isFollowing) {
      setFollowersCount(c => c - 1);
      setIsFollowing(false);
      addToast(lang === 'en' ? `Unfriended ${profile.fullName}` : `Đã hủy kết bạn ${profile.fullName}`, 'info');
    } else {
      setFollowersCount(c => c + 1);
      setIsFollowing(true);
      addToast(lang === 'en' ? `Now friends with ${profile.fullName}!` : `Đã trở thành bạn bè với ${profile.fullName}!`, 'success');
    }
  };

  // Get active badge string
  const getBadgeRank = (reputation: number) => {
    if (reputation >= 4000) return '🏅 Platinum Knight • Hiệp Sĩ Bạch Kim';
    if (reputation >= 3000) return '🛡️ Golden Guard • Cận Vệ Hoàng Gia';
    if (reputation >= 2000) return '⭐️ Skilled Elite • Chiến Binh Tinh Nhuệ';
    return '🌱 Emerging Recruit • Chuyên Viên Học Việc';
  };

  // Filter projects associated with this profile
  const userProjects = projects.filter(proj => 
    proj.leaderId === profile.id || proj.leaderName === profile.fullName
  );

  // Filter audit logs associated with this profile
  const userActivity = auditLogs.filter(log => 
    log.user === profile.fullName
  );

  return (
    <div className="p-1 md:p-6 space-y-6 font-sans">
      {/* Cover Banner */}
      <div className="relative h-48 md:h-72 rounded-3xl overflow-hidden border border-white/5 bg-[#161616] group">
        <img 
          src={isSelf ? (isEditing ? editCover || currentUser?.coverPhoto : currentUser?.coverPhoto) : profile.coverPhoto} 
          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700" 
          alt="profile cover" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#050505]/90" />
        
        {isEditing && isSelf && (
          <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md p-4 rounded-2xl border border-white/10 space-y-2 max-w-xs shadow-2xl z-10">
            <label className="text-[10px] uppercase tracking-widest font-bold text-[#CCFF00] block">Cover Photo URL</label>
            <input 
              type="text" 
              value={editCover} 
              onChange={(e) => setEditCover(e.target.value)}
              className="w-full bg-white/5 text-white text-xs p-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#CCFF00]/50 transition-colors"
              placeholder="Paste image URL here..."
            />
          </div>
        )}
      </div>

      {/* Main details overlap container */}
      <div className="relative -mt-16 px-4 md:px-8 flex flex-col md:flex-row gap-6 md:items-end">
        {/* Avatar with indicator */}
        <div className="relative group shrink-0">
          <div className="p-1.5 bg-[#050505] rounded-full inline-block">
            <img 
              src={isSelf ? (isEditing ? editAvatar || currentUser?.avatar : currentUser?.avatar) : profile.avatar} 
              className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border border-white/10 shadow-2xl" 
              alt="profile avatar" 
            />
          </div>
          <div className="absolute right-4 bottom-4 w-6 h-6 bg-emerald-500 border-4 border-[#050505] rounded-full" title="Online" />
        </div>

        {/* Text descriptions & Actions */}
        <div className="flex-1 flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
          <div className="space-y-3">
            <div className="space-y-1">
              {isSelf && isEditing ? (
                <input 
                  type="text" 
                  value={editName} 
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-white/5 text-white text-3xl md:text-4xl font-black p-2 -ml-2 rounded-xl border border-white/10 focus:outline-none focus:border-[#CCFF00]/50"
                  placeholder="Full Name"
                />
              ) : (
                <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight flex items-center gap-3">
                  {profile.fullName}
                </h1>
              )}
              <p className="text-slate-400 text-sm font-mono flex items-center gap-2">
                {profile.email} <span className="text-slate-600">•</span> ID: {profile.studentId}
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] uppercase tracking-widest font-bold rounded-lg flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Online
              </span>
              <span className="px-2.5 py-1 bg-white/5 border border-white/10 text-white text-[10px] tracking-widest rounded-lg font-bold uppercase">
                {profile.role || 'Member'}
              </span>
              <span className="px-2.5 py-1 bg-[#CCFF00]/10 border border-[#CCFF00]/20 text-[#CCFF00] font-bold text-[10px] uppercase tracking-widest rounded-lg flex items-center gap-1">
                <Award className="w-3 h-3" /> {profile.reputationScore} XP
              </span>
            </div>

            <div className="flex flex-wrap gap-4 text-xs text-slate-400 pt-1">
              <span className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"><BookOpen className="w-4 h-4 text-slate-500" /> {profile.faculty}</span>
              <span className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"><MapPin className="w-4 h-4 text-slate-500" /> UTT Campus</span>
              <span className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"><Users className="w-4 h-4 text-slate-500" /> <strong className="text-white">{followersCount}</strong> Followers</span>
            </div>
          </div>

          {/* Interactions tools */}
          <div className="flex gap-3 shrink-0">
            {!isSelf ? (
              <>
                <button 
                  onClick={handleFollowToggle}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer shadow-lg active:scale-95 flex items-center gap-2"
                  style={{ 
                    backgroundColor: isFollowing ? 'rgba(255,255,255,0.05)' : accent,
                    color: isFollowing ? '#ffffff' : '#000000',
                    border: isFollowing ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent'
                  }}
                >
                  {isFollowing ? (lang === 'en' ? 'Friends' : 'Đã kết bạn') : (lang === 'en' ? 'Add Friend' : 'Kết bạn')}
                  {isFollowing && <Check className="w-4 h-4" />}
                </button>
                <button 
                  onClick={() => addToast(lang === 'en' ? 'Mock Inbox Channel initialized' : 'Kênh liên lạc mô phỏng được khởi tạo', 'info')}
                  className="p-2.5 bg-[#161616] border border-white/5 text-white hover:bg-white/10 hover:border-white/10 rounded-xl transition-all cursor-pointer shadow-lg active:scale-95"
                  title="Message"
                >
                  <MessageSquare className="w-5 h-5" />
                </button>
              </>
            ) : isEditing ? (
              <button 
                onClick={handleSaveProfile}
                className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-black uppercase tracking-wider rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-95"
              >
                <Check className="w-4 h-4" /> {lang === 'en' ? 'Save Profile' : 'Lưu Hồ Sơ'}
              </button>
            ) : (
              // If current user is a Guest, prevent editing and show a prompt to login
              currentUser?.role === 'Guest' ? (
                <button
                  onClick={() => setGuestBlockAction(t.guestDescRestricted)}
                  className="px-6 py-2.5 bg-[#161616] border border-white/5 hover:bg-white/10 text-white text-sm font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer active:scale-95"
                >
                  <Edit2 className="w-4 h-4 text-slate-400" /> {t.loginToEditBtn}
                </button>
              ) : (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-2.5 bg-[#161616] border border-white/5 hover:bg-white/10 text-white text-sm font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer active:scale-95"
                >
                  <Edit2 className="w-4 h-4 text-slate-400" /> {lang === 'en' ? 'Edit Profile' : 'Chỉnh sửa'}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Grid Content splits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6">
        
        {/* Left Stats Section */}
        <div className="space-y-6">
          {isEditing && isSelf && (
            <div className="bg-[#111111] border border-white/5 rounded-[32px] p-6 space-y-4">
              <div className="pt-3 border-t border-white/5 space-y-2">
                <label className="text-[9px] uppercase tracking-wider font-bold text-[#CCFF00] block">Change avatar link</label>
                <input 
                  type="text" 
                  value={editAvatar} 
                  onChange={(e) => setEditAvatar(e.target.value)}
                  className="w-full bg-black/40 text-xs text-slate-300 p-2.5 rounded-lg border border-white/5 focus:outline-none"
                  placeholder="Unsplash photo avatar URL..."
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Tab Content module (occupies 2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tab Selector Headers */}
          <div className="flex bg-[#111111] border border-white/5 rounded-[22px] p-1.5">
            <button 
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-3 text-xs font-bold uppercase transition flex items-center justify-center gap-1.5 rounded-xl cursor-pointer ${
                activeTab === 'profile' ? 'bg-[#050505] border border-white/5 text-[#CCFF00]' : 'text-slate-400 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" /> {lang === 'en' ? 'Bio & Profile' : 'Tiểu sử'}
            </button>
            <button 
              onClick={() => setActiveTab('projects')}
              className={`flex-1 py-3 text-xs font-bold uppercase transition flex items-center justify-center gap-1.5 rounded-xl cursor-pointer ${
                activeTab === 'projects' ? 'bg-[#050505] border border-white/5 text-[#CCFF00]' : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> {lang === 'en' ? 'Active Projects' : 'Đề Tài Tự Phát'} ({userProjects.length})
            </button>
            <button 
              onClick={() => setActiveTab('activity')}
              className={`flex-1 py-3 text-xs font-bold uppercase transition flex items-center justify-center gap-1.5 rounded-xl cursor-pointer ${
                activeTab === 'activity' ? 'bg-[#050505] border border-white/5 text-[#CCFF00]' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" /> {lang === 'en' ? 'Activity Timeline' : 'Nhật ký Hoạt Động'} ({userActivity.length})
            </button>
          </div>

          <div className="bg-[#111111] border border-white/5 rounded-[32px] p-6 min-h-[300px]">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                {/* Biography */}
                <div className="space-y-2">
                  <h4 className="text-xs uppercase text-slate-500 font-bold tracking-widest font-mono">Consolidated Academic Bio</h4>
                  {isSelf && isEditing ? (
                    <textarea 
                      value={editBio} 
                      onChange={(e) => setEditBio(e.target.value)}
                      rows={3}
                      className="w-full bg-black/40 border border-white/5 text-slate-300 text-xs p-3 rounded-xl focus:outline-none focus:border-white/20"
                    />
                  ) : (
                    <p className="text-xs text-slate-300 leading-relaxed font-mono">
                      {isSelf ? currentUser?.biography : profile.biography}
                    </p>
                  )}
                </div>

                {/* Major metadata Focus */}
                <div className="space-y-2">
                  <h4 className="text-xs uppercase text-slate-500 font-bold tracking-widest font-mono">Focus Area / Major Degree focus</h4>
                  {isSelf && isEditing ? (
                    <input 
                      type="text" 
                      value={editMajor} 
                      onChange={(e) => setEditMajor(e.target.value)}
                      className="w-full bg-black/40 border border-white/5 text-slate-300 text-xs p-3 rounded-xl focus:outline-none"
                    />
                  ) : (
                    <p className="text-xs text-white font-bold font-mono">
                      {profile.major}
                    </p>
                  )}
                </div>

                {/* Goals */}
                <div className="space-y-2">
                  <h4 className="text-xs uppercase text-slate-500 font-bold tracking-widest font-mono">Core Career Targets</h4>
                  {isSelf && isEditing ? (
                    <textarea 
                      value={editGoals} 
                      onChange={(e) => setEditGoals(e.target.value)}
                      rows={2}
                      className="w-full bg-black/40 border border-white/5 text-slate-300 text-xs p-3 rounded-xl focus:outline-none"
                    />
                  ) : (
                    <p className="text-xs text-slate-300 leading-relaxed font-mono">
                      {profile.careerGoals || 'No goals specified yet. Click edit profile to add career aspirations.'}
                    </p>
                  )}
                </div>

                {/* Interests */}
                <div className="space-y-2">
                  <h4 className="text-xs uppercase text-slate-500 font-bold tracking-widest font-mono">Personal Interests & Focus</h4>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {profile.interests.map((intel, idx) => (
                      <span key={idx} className="px-3 py-1 bg-white/5 text-slate-300 rounded-lg text-[10px] font-mono border border-white/5">
                        💡 {intel}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'projects' && (
              <div className="space-y-4">
                <h4 className="text-xs uppercase text-slate-500 font-bold tracking-widest font-mono mb-2">Registered Project Workspace Grid</h4>
                {userProjects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userProjects.map((p) => (
                      <div key={p.id} className="p-4 bg-black/30 border border-white/5 rounded-2xl space-y-3">
                        <div>
                          <span className="text-[9px] uppercase tracking-wider text-[#CCFF00] font-mono font-bold">{p.category}</span>
                          <h5 className="text-xs font-black text-white leading-tight mt-0.5">{p.name}</h5>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                            <span>Completeness Progress</span>
                            <span>{p.progress}%</span>
                          </div>
                          <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${p.progress}%` }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 border border-dashed border-white/5 rounded-2xl text-center text-xs text-slate-500 font-mono">
                    No registered project proposals for this developer logged.
                  </div>
                )}
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="space-y-4">
                <h4 className="text-xs uppercase text-slate-500 font-bold tracking-widest font-mono mb-2">Academic Audit Trails Timeline</h4>
                {userActivity.length > 0 ? (
                  <div className="relative border-l-2 border-white/5 ml-3 pl-6 space-y-6 pt-2">
                    {userActivity.map((log) => (
                      <div key={log.id} className="relative space-y-1.5">
                        {/* Dot indicator */}
                        <div className="absolute -left-[30px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-[#111111]" />
                        
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                          <span>{log.timestamp}</span>
                          <span>•</span>
                          <span className="px-1.5 py-0.5 bg-white/5 text-slate-300 rounded">{log.module}</span>
                        </div>
                        <p className="text-xs font-bold text-white leading-snug">{log.action}</p>
                        <span className="text-[9px] font-mono text-slate-500">Secure Audit Node verification: {log.ip}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 border border-dashed border-white/5 rounded-2xl text-center text-xs text-slate-500 font-mono">
                    No recorded activities logged for this academic user.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;
