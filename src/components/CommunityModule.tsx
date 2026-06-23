import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Heart, ShieldCheck, AlertOctagon, Send, ImagePlus, X } from 'lucide-react';
import { BAD_WORD_TRIGGER_LIST } from '../data';
import { translations } from '../translations';

// Zustand Stores
import { useUIStore } from '../store/useUIStore';
import { useAuthStore } from '../store/useAuthStore';
import { usePostStore } from '../store/usePostStore';
import { useAuditStore } from '../store/useAuditStore';
import { useToastStore } from '../store/useToastStore';
import { useNotificationStore } from '../store/useNotificationStore';

interface CommunityProps {
  currentUserRole?: string;
}

export const CommunityModule: React.FC<CommunityProps> = ({
  currentUserRole
}) => {
  const { lang, accent: accentColor } = useUIStore();
  const t = translations[lang];

  const user = useAuthStore((s) => s.user);
  const posts = usePostStore((s) => s.posts);
  const fetchPosts = usePostStore((s) => s.fetchPosts);
  const addPost = usePostStore((s) => s.addPost);
  const deletePost = usePostStore((s) => s.deletePost);

  useEffect(() => { fetchPosts(); }, []);
  const likePost = usePostStore((s) => s.likePost);
  const addComment = usePostStore((s) => s.addComment);
  const moderatePost = usePostStore((s) => s.moderatePost);

  const addLog = useAuditStore((s) => s.addLog);
  const addToast = useToastStore((s) => s.addToast);
  const addNotification = useNotificationStore((s) => s.addNotification);
  const addReputation = useAuthStore((s) => s.addReputation);

  const activeUserRole = currentUserRole || user?.role || 'Student';

  const [newPostContent, setNewPostContent] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('General Discussion');
  const [activeFilter, setActiveFilter] = useState('All');
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [securityBlock, setSecurityBlock] = useState('');
  const [selectedPresetImage, setSelectedPresetImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        addToast(lang === 'en' ? 'Image size must be less than 5MB' : 'Kích thước ảnh phải nhỏ hơn 5MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedPresetImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const topics = [
    'General Discussion', 
    'Security Systems & Web Engineering', 
    'Official Announcements', 
    'Design & UX Feedback'
  ];

  const imagePresets = [
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=650&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=650&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=650&auto=format&fit=crop&q=80'
  ];

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityBlock('');

    if (activeUserRole === 'Guest') {
      addToast(lang === 'en' ? 'Guest mode restrictions in effect.' : 'Chế độ khách bị giới hạn chức năng này.', 'error');
      return;
    }

    if (!newPostContent.trim()) return;

    if (newPostContent.length < 10) {
      addToast(
        lang === 'en' ? 'Discussion content must be at least 10 characters.' : 'Nội dung chia sẻ phải có ít nhất 10 ký tự.',
        'error'
      );
      return;
    }

    // Check for banned words (Part C1 / Security check)
    const normalizedText = newPostContent.toLowerCase();
    const containsToxic = BAD_WORD_TRIGGER_LIST.some(word => normalizedText.includes(word.toLowerCase()));
    
    if (containsToxic) {
      setSecurityBlock('Security block: Action blocked. Content contains toxic language elements.');
      addLog(`BLOCKED post injection due to keyword policy rules`, 'Security Shield', user?.fullName || 'Academic Peer');
      addToast(lang === 'en' ? 'Content policy violation detected!' : 'Phát hiện vi phạm chính sách nội dung!', 'error');
      return;
    }

    const imgs = selectedPresetImage ? [selectedPresetImage] : [];
    
    addPost(
      newPostContent,
      imgs,
      selectedTopic
    );

    addLog(`Published new social forum post about ${selectedTopic}`, 'Community Portal', user?.fullName || 'Academic Peer');
    addToast(lang === 'en' ? 'Post published successfully +60 XP!' : 'Đã đăng bài viết thành công +60 XP!', 'success');

    setNewPostContent('');
    setSelectedPresetImage(null);
  };

  const handleLikeClick = async (postId: string) => {
    if (activeUserRole === 'Guest') {
      addToast(lang === 'en' ? 'Guest mode restricts interactions.' : 'Chế độ khách không thể thực hiện tương tác.', 'error');
      return;
    }
    const matchedPost = posts.find(p => p.id === postId);
    const isLiked = await likePost(postId);
    
    if (matchedPost) {
      if (isLiked) {
        addLog(`Liked post by ${matchedPost.authorName || matchedPost.author}`, 'Community Portal', user?.fullName || 'Academic Peer');
        addToast(lang === 'en' ? 'Post engagement register!' : 'Đã thích bài viết!', 'success');
      }
    }
  };

  const handleCommentSubmit = (postId: string) => {
    setSecurityBlock('');
    if (activeUserRole === 'Guest') {
      addToast(lang === 'en' ? 'Guest mode restricts comments.' : 'Chế độ khách không thể gửi bình luận.', 'error');
      return;
    }

    const commentTxt = commentInputs[postId];
    if (!commentTxt || !commentTxt.trim()) return;

    if (commentTxt.length < 5) {
      addToast(
        lang === 'en' ? 'Comment must be at least 5 characters.' : 'Bình luận phải có ít nhất 5 ký tự.',
        'error'
      );
      return;
    }

    const normalizedText = commentTxt.toLowerCase();
    const containsToxic = BAD_WORD_TRIGGER_LIST.some(word => normalizedText.includes(word.toLowerCase()));
    
    if (containsToxic) {
      setSecurityBlock('Security block: Submission aborted. Injected string does not compile safely.');
      addLog(`BLOCKED comment injection under SQL validation rules`, 'Security Shield', user?.fullName || 'Guest Peer');
      addToast(lang === 'en' ? 'Validation policy block alert!' : 'Phát hiện vi phạm chính sách ngôn từ!', 'error');
      return;
    }

    addComment(postId, commentTxt);

    addLog(`Injected social feedback comment on post reference ID: ${postId}`, 'Community Portal', user?.fullName || 'Academic Peer');
    addToast(lang === 'en' ? 'Comment added +30 XP!' : 'Đã thêm bình luận +30 XP!', 'success');

    // Notify post author (Part B4 programmatic trigger)
    const targetPost = posts.find(p => p.id === postId);
    if (targetPost && (targetPost.authorName || targetPost.author) !== user?.fullName) {
      addNotification(
        lang === 'en' ? 'New Post Feedback' : 'Tương tác mới trong bài đăng',
        `${user?.fullName || 'Academic Student'} replied to your topic thread: "${commentTxt.slice(0, 30)}..."`,
        'comment'
      );
    }

    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
  };

  const handlePostModeration = (postId: string, action: 'Approve' | 'Reject') => {
    moderatePost(postId, action);
    addLog(`Moderator action triggered [${action}] on post ID: ${postId}`, 'Community Portal', user?.fullName || 'Moderator');
    addToast(
      lang === 'en' ? `Discussion card moderated [${action}]` : `Đã kiểm duyệt bài viết [${action}]`,
      'info'
    );
  };

  const filteredPosts = posts.filter(post => {
    // Hide quarantined posts from non-admins
    if (post.moderationStatus === 'Rejected' && activeUserRole !== 'Admin' && activeUserRole !== 'Project Leader') return false;
    
    if (activeFilter === 'All') return true;
    return post.topic === activeFilter;
  });

  return (
    <div className="p-1 md:p-4 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-sans">
      <div className="lg:col-span-8 space-y-6">
        
        {/* Input Composer Panel */}
        <div className="bg-[#111111] border border-white/5 rounded-[32px] p-6 space-y-4">
          <div className="flex gap-4">
            <img 
              src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120'} 
              className="w-10 h-10 rounded-full border border-white/10 shrink-0 object-cover" 
              alt="author" 
            />
            <div className="flex-1 space-y-3">
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="bg-[#161616] border border-white/5 text-xs text-slate-300 rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
              >
                {topics.map(t => <option key={t} value={t}>{t}</option>)}
              </select>

              <textarea
                value={newPostContent}
                onChange={(e) => {
                  setNewPostContent(e.target.value);
                  setSecurityBlock('');
                }}
                rows={3}
                placeholder={lang === 'en' ? "What's on your mind? Share academic insights or ask questions..." : "Bạn đang nghĩ gì? Chia sẻ kết quả nghiên cứu hoặc thảo luận..."}
                className="w-full bg-transparent text-xs text-white focus:outline-none placeholder-slate-500 font-sans"
              />
            </div>
          </div>

          {/* Preset and Custom Image selectors */}
          <div className="space-y-2 pt-2 border-t border-white/5">
            <span className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-wider block">
              {lang === 'en' ? 'ATTACH IMAGE OR PRESET' : 'ĐÍNH KÈM ẢNH HOẶC MẪU CÓ SẴN'}
            </span>
            <div className="flex flex-wrap gap-3 items-center">
              {/* Custom Upload Button */}
              <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                className="hidden" 
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-16 h-10 rounded-lg border-2 border-dashed border-white/20 hover:border-white/50 text-slate-400 hover:text-white flex flex-col items-center justify-center transition-colors cursor-pointer bg-white/5"
                title={lang === 'en' ? 'Upload from device' : 'Tải ảnh từ máy tính'}
              >
                <ImagePlus className="w-4 h-4" />
              </button>

              {/* Uploaded Custom Image Preview */}
              {selectedPresetImage && !imagePresets.includes(selectedPresetImage) && (
                <div className="relative w-16 h-10 rounded-lg overflow-hidden border-2 border-white shadow-md">
                  <img src={selectedPresetImage} className="w-full h-full object-cover" alt="uploaded custom" />
                  <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setSelectedPresetImage(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                    className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full p-0.5 cursor-pointer hover:bg-red-600 transition"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              )}

              {/* Presets */}
              {imagePresets.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedPresetImage(selectedPresetImage === img ? null : img)}
                  className={`relative w-16 h-10 rounded-lg overflow-hidden border-2 cursor-pointer transition ${
                    selectedPresetImage === img ? 'border-white scale-95 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} className="w-full h-full object-cover" alt="preset" />
                </button>
              ))}
            </div>
          </div>

          {securityBlock && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2.5 text-xs text-red-400 font-mono">
              <AlertOctagon className="w-4 h-4 shrink-0" />
              <span>{securityBlock}</span>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              onClick={handlePostSubmit}
              className="px-5 py-2.5 text-black text-xs font-black uppercase rounded-2xl flex items-center justify-center gap-2 transition hover:opacity-90 cursor-pointer"
              style={{ backgroundColor: accentColor, boxShadow: `0 10px 30px ${accentColor}33` }}
            >
              <Send className="w-3.5 h-3.5" />
              {t.publishBtn}
            </button>
          </div>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap gap-2">
          {['All', ...topics].map(topic => (
            <button
              key={topic}
              onClick={() => setActiveFilter(topic)}
              className={`px-3.5 py-2 rounded-2xl text-[10px] font-mono font-bold border transition-all duration-200 cursor-pointer ${
                activeFilter === topic
                  ? 'bg-white/10 text-[#CCFF00] border-white/10 shadow-lg'
                  : 'bg-[#111111]/30 text-slate-400 border-white/5 hover:bg-[#161616] hover:text-white'
              }`}
            >
              {topic === 'All' ? (lang === 'en' ? 'ALL TOPICS' : 'TẤT CẢ CHỦ ĐỀ') : topic.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Discussions thread feeds */}
        <div className="space-y-6">
          {filteredPosts.map(post => (
            <div 
              key={post.id} 
              className={`bg-[#111111] border border-white/5 rounded-[32px] p-6 space-y-4 transition-all duration-300 hover:border-white/10 ${post.moderationStatus === 'Rejected' ? 'opacity-50 grayscale' : ''}`}
            >
              {/* Header profile cards layout */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <img src={post.authorAvatar || post.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120'} className="w-9 h-9 rounded-full object-cover border border-white/5" alt="user" />
                  <div>
                    <h4 className="text-xs font-black font-display text-white">{post.authorName || post.author}</h4>
                    <span className="text-[9px] text-[#CCFF00] font-bold tracking-tight uppercase px-1 rounded font-mono" style={{ color: accentColor }}>
                      {post.authorRole || post.role || 'Contributor'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-500 bg-white/5 px-2 py-0.5 rounded-lg">
                    #{post.topic}
                  </span>

                  {/* Moderator indicators controls */}
                  {(activeUserRole === 'Admin' || activeUserRole === 'Project Leader') && (
                    <div className="flex items-center gap-1.5 border-l border-white/5 pl-3 ml-1">
                      {post.moderationStatus === 'Rejected' && (
                        <span className="text-[9px] font-bold text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded mr-1 uppercase">Quarantined</span>
                      )}
                      
                      <button 
                        onClick={() => handlePostModeration(post.id, post.moderationStatus === 'Rejected' ? 'Approve' : 'Reject')}
                        className={`p-1.5 rounded-lg transition-colors ${post.moderationStatus === 'Rejected' ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' : 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20'}`}
                        title={post.moderationStatus === 'Rejected' ? 'Restore Post' : 'Quarantine Post'}
                      >
                        {post.moderationStatus === 'Rejected' ? <ShieldCheck className="w-3.5 h-3.5" /> : <AlertOctagon className="w-3.5 h-3.5" />}
                      </button>

                      <button 
                        onClick={() => {
                          if(window.confirm(lang === 'en' ? 'Delete this post permanently?' : 'Xóa vĩnh viễn bài viết này?')) {
                            deletePost(post.id);
                            addToast(lang === 'en' ? 'Post deleted permanently' : 'Đã xóa bài viết vĩnh viễn', 'success');
                          }
                        }}
                        className="p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                        title="Delete Post Permanently"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Feed Text content body */}
              <p className="text-slate-300 text-xs leading-relaxed whitespace-pre-wrap font-sans line-clamp-4">
                {post.content}
              </p>

              {/* Feed Visual parameters if exist */}
              {post.images && post.images.length > 0 && (
                <div className="rounded-2xl overflow-hidden border border-white/5 max-h-[300px]">
                  <img src={post.images[0]} className="w-full h-full object-cover" alt="presentation" />
                </div>
              )}

              {/* Engagement analytics strip cards */}
              <div className="flex items-center gap-6 pt-3 border-t border-white/5 text-[11px] font-mono text-slate-400">
                <button 
                  onClick={() => handleLikeClick(post.id)}
                  className="flex items-center gap-1.5 hover:text-pink-500 cursor-pointer"
                >
                  <Heart className={`w-4 h-4 ${post.loved ? 'fill-pink-500 text-pink-500' : ''}`} />
                  <span>{post.likes} {lang === 'en' ? 'Likes' : 'Thích'}</span>
                </button>
                <div className="flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-slate-500" />
                  <span>{post.comments && post.comments.length} {lang === 'en' ? 'Comments' : 'Bình luận'}</span>
                </div>
              </div>

              {/* Nested Comments layout wrapper thread */}
              <div className="bg-[#0A0A0A] rounded-2xl p-4 space-y-3">
                {post.comments && (() => {
                  const commentsToShow = post.comments;
                  return (
                    <>
                      {commentsToShow.map((c, i) => (
                        <div key={i} className="flex gap-2 text-xs py-1.5 border-b border-white/5 last:border-none">
                          <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 shrink-0 text-[10px] font-bold text-slate-400 flex items-center justify-center">
                            {(c.authorName || c.author || 'U').substring(0, 1).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-white font-mono">{c.authorName || c.author}</div>
                            <p className="text-slate-400 text-xs leading-relaxed mt-1 font-sans">{c.content}</p>
                          </div>
                        </div>
                      ))}
                    </>
                  );
                })()}

                {/* Direct feedback typing input box */}
                <div className="flex gap-2 pt-2">
                  <input
                    type="text"
                    value={commentInputs[post.id] || ''}
                    onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleCommentSubmit(post.id); }}
                    placeholder={lang === 'en' ? 'Add feedback comment thread...' : 'Chia sẻ ý kiến phản hồi...'}
                    className="flex-1 bg-[#141414] border border-white/5 text-xs text-white rounded-xl px-3 focus:outline-none focus:border-white/10 font-sans"
                  />
                  <button
                    onClick={() => handleCommentSubmit(post.id)}
                    className="p-2.5 bg-[#0f0f0f] hover:bg-[#1d1d1d] text-white rounded-2xl transition-all duration-200 cursor-pointer border border-white/10 shadow-sm"
                    title={lang === 'en' ? 'Send comment' : 'Gửi bình luận'}
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredPosts.length === 0 && (
            <div className="py-16 text-center border border-dashed border-white/5 rounded-[32px] text-xs text-slate-500 font-mono">
              {lang === 'en' ? 'No discussion threads posted on current topic.' : 'Không có bài thảo luận nào thuộc chủ đề này.'}
            </div>
          )}
        </div>
      </div>

      {/* Right widgets channel links */}
      <div className="lg:col-span-4 bg-[#111111] border border-white/5 rounded-[24px] p-6 space-y-4">
        <h3 className="font-bold text-white text-sm font-mono uppercase tracking-wider pb-2 border-b border-white/5">
          {lang === 'en' ? 'Community Guidelines' : 'Quy tắc cộng đồng'}
        </h3>
        <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
          Verify compliance with university policy parameters. Avoid publishing credentials or profane strings. The automated Security Shield acts on toxic keywords in real-time.
        </p>
        <div className="p-3.5 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-center gap-2 text-[10px] text-yellow-400 font-mono">
          <ShieldCheck className="w-4.5 h-4.5 shrink-0" />
          <span>Automated Security Shield Active</span>
        </div>
      </div>
    </div>
  );
};
