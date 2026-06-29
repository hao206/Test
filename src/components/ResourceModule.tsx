import React, { useState } from 'react';
import { useResourceStore } from '../store/useResourceStore';
import { useUIStore } from '../store/useUIStore';
import { useAuthStore } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';
import { useAuditStore } from '../store/useAuditStore';
import { translations } from '../translations';
import { Search, Download, FileText, Plus, Clock, Check, X, Upload, AlertCircle } from 'lucide-react';
import { Resource } from '../types';

export const ResourceModule: React.FC = () => {
  const { lang, accent } = useUIStore();
  const t = translations[lang];
  const { resources, addResource, incrementDownloads, updateResourceAdminState, deleteResource } = useResourceStore();
  const user = useAuthStore((s) => s.user);
  const addToast = useToastStore((s) => s.addToast);
  const addLog = useAuditStore((s) => s.addLog);

  const [query, setQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState<Resource['category']>('Report');
  const [uploadFileType, setUploadFileType] = useState<'.pdf' | '.docx' | '.doc'>('.pdf');
  const [uploadSize, setUploadSize] = useState('2.5 MB');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [uploadFileDataUrl, setUploadFileDataUrl] = useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const isAdmin = user?.role === 'Admin' || user?.role === 'Super Admin' || user?.role === 'Moderator';

  // Filter resources based on search query AND approval status
  const filteredResources = resources.filter(r => {
    const matchesQuery = r.title.toLowerCase().includes(query.toLowerCase()) || 
                         r.category.toLowerCase().includes(query.toLowerCase());
    if (!matchesQuery) return false;

    const status = r.reviewStatus || 'Approved'; // Legacy items default to Approved
    if (status === 'Approved') return true;

    // Show pending items to admins or the user who uploaded it
    if (status === 'Pending') {
      return isAdmin || r.sharedBy === user?.fullName;
    }

    return false;
  });

  const getExtension = (r: Resource) => {
    if (r.fileType) return r.fileType;
    switch (r.category) {
      case 'Report': return '.pdf';
      case 'Slides': return '.pptx';
      case 'Source Code': return '.zip';
      case 'Template': return '.docx';
      case 'Material': return '.txt';
      case 'Syllabus': return '.pdf';
      default: return '.pdf';
    }
  };

  const handleDownload = (res: Resource) => {
    incrementDownloads(res.id);
    const ext = getExtension(res);
    const element = document.createElement("a");

    // If real file uploaded or valid link exists
    if (res.link && res.link !== '#' && (res.link.startsWith('data:') || res.link.startsWith('blob:') || res.link.startsWith('http'))) {
      element.href = res.link;
      element.download = `${res.title}${ext}`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      return;
    }

    // Fallback for mock items without attached binary blob: Save as Word compatible HTML (.doc)
    if (ext === '.docx' || ext === '.doc') {
      const htmlContent = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head><meta charset='utf-8'><title>${res.title}</title></head>
<body style='font-family: Arial, sans-serif; padding: 40px; color: #333;'>
  <h1 style='color: #1a365d; border-bottom: 2px solid #1a365d; padding-bottom: 10px;'>${res.title}</h1>
  <p><strong>Phân khối:</strong> ${res.category} | <strong>Người chia sẻ:</strong> ${res.sharedBy}</p>
  <br/>
  <p>Đây là tài liệu mẫu học tập được định dạng tương thích hoàn hảo với Microsoft Word.</p>
  <ul>
    <li>Chủ đề tài liệu: ${res.title}</li>
    <li>Dung lượng ước tính: ${res.size}</li>
  </ul>
</body>
</html>`;
      const file = new Blob([htmlContent], { type: 'application/msword' });
      element.href = URL.createObjectURL(file);
      // Save as .doc so Word opens the HTML structure cleanly without strict PK zip container errors!
      element.download = `${res.title}.doc`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      return;
    }

    // Default fallback for pdf/txt/other mock items
    const file = new Blob([`Tài liệu học tập: ${res.title}\nPhân khối: ${res.category}\nNgười chia sẻ: ${res.sharedBy}`], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `${res.title}${ext === '.pdf' ? '.txt' : ext}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFileName(file.name);
    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
    if (!uploadTitle.trim()) setUploadTitle(nameWithoutExt);
    
    if (file.name.endsWith('.pdf')) setUploadFileType('.pdf');
    else if (file.name.endsWith('.docx')) setUploadFileType('.docx');
    else if (file.name.endsWith('.doc')) setUploadFileType('.doc');

    const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
    setUploadSize(`${sizeMb} MB`);

    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadFileDataUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim()) {
      addToast(lang === 'en' ? 'Please enter a document title' : 'Vui lòng nhập tên tài liệu', 'error');
      return;
    }

    const uploaderName = user?.fullName || (lang === 'en' ? 'Academic Member' : 'Thành viên');
    addResource(uploadTitle, uploadCategory, uploadSize, uploaderName, uploadFileType, uploadFileDataUrl);
    addLog(`Uploaded resource '${uploadTitle}' (${uploadFileType}) for review`, 'Resource Vault', uploaderName);
    addToast(
      lang === 'en' 
        ? 'Document uploaded successfully! Pending Admin approval before public view.' 
        : 'Tải lên thành công! Tài liệu đang chờ Admin kiểm duyệt trước khi hiển thị chung.',
      'info'
    );

    setUploadTitle('');
    setSelectedFileName('');
    setUploadFileDataUrl('');
    setShowUploadModal(false);
  };

  const handleApprove = (res: Resource) => {
    updateResourceAdminState(res.id, { reviewStatus: 'Approved' });
    addLog(`Approved resource '${res.title}'`, 'Resource Vault', user?.fullName || 'Admin');
    addToast(lang === 'en' ? 'Resource approved!' : 'Đã duyệt tài liệu!', 'success');
  };

  const handleReject = (res: Resource) => {
    updateResourceAdminState(res.id, { reviewStatus: 'Rejected' });
    addLog(`Rejected resource '${res.title}'`, 'Resource Vault', user?.fullName || 'Admin');
    addToast(lang === 'en' ? 'Resource rejected' : 'Đã từ chối tài liệu', 'info');
  };

  return (
    <div className="p-1 md:p-4 space-y-6 font-sans">
      <div className="bg-[#111111] border border-white/5 rounded-[32px] p-6 md:p-8 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span 
              className="px-3 py-1 text-[10px] font-bold rounded-full border uppercase tracking-widest"
              style={{ backgroundColor: `${accent}10`, borderColor: `${accent}30`, color: accent }}
            >
              MODULE 03
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight font-display">
              {lang === 'en' ? 'Resource Vault' : 'Thư Viện Tài Nguyên'}
            </h2>
            <p className="text-slate-400 text-sm max-w-xl">
              {lang === 'en' 
                ? 'Access academic documents. Individuals can upload (.doc & .pdf) subject to Admin moderation.' 
                : 'Truy cập tài liệu học tập. Thành viên có thể thêm tài liệu (.doc, .pdf) và được Admin kiểm duyệt hiển thị.'}
            </p>
          </div>

          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-xs text-black transition hover:brightness-110 shadow-lg shrink-0 cursor-pointer"
            style={{ backgroundColor: accent }}
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            {lang === 'en' ? 'Upload Document (.doc/.pdf)' : 'Thêm Tài Liệu (.doc/.pdf)'}
          </button>
        </div>
        <div className="absolute right-0 bottom-0 w-48 h-48 blur-[80px] opacity-20 rounded-full" style={{ backgroundColor: accent }}></div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between bg-[#0C0C0C] p-4 border border-white/5 rounded-2xl">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder={lang === 'en' ? 'Search documents or category...' : 'Tìm kiếm tên tài liệu hoặc danh mục...'}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-[#161616] border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-white/20 text-white placeholder-slate-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map(r => {
          const ext = getExtension(r);
          const status = r.reviewStatus || 'Approved';
          const isPending = status === 'Pending';

          return (
            <div 
              key={r.id} 
              className={`bg-[#111111] border rounded-[24px] p-5 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between space-y-4 ${
                isPending ? 'border-amber-500/40 bg-amber-500/5' : 'border-white/5 hover:border-white/10'
              }`}
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start gap-2">
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-slate-300 border border-white/10 shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] text-slate-400 font-bold font-mono tracking-wide uppercase bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
                      {r.category}
                    </span>
                    {isPending && (
                      <span className="text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                        <Clock className="w-2.5 h-2.5" />
                        {lang === 'en' ? 'Pending Admin Review' : 'Chờ Admin duyệt'}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <h3 className="font-bold text-white text-base leading-tight hover:text-[#CCFF00] transition-colors flex items-center gap-1.5 flex-wrap">
                    <span>{r.title}</span>
                    <span className="text-[10px] text-slate-500 font-mono tracking-tighter shrink-0 bg-white/10 px-1.5 py-0.5 rounded">{ext}</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono pt-1">
                    {lang === 'en' ? 'Uploaded by:' : 'Tải lên bởi:'} <span className="text-white font-medium">{r.sharedBy}</span>
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {lang === 'en' ? 'Size:' : 'Dung lượng:'} <span className="text-white">{r.size}</span>
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 space-y-2">
                {isPending && isAdmin ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(r)}
                      className="flex-1 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" /> {lang === 'en' ? 'Approve' : 'Duyệt'}
                    </button>
                    <button
                      onClick={() => handleReject(r)}
                      className="flex-1 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" /> {lang === 'en' ? 'Reject' : 'Từ chối'}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleDownload(r)}
                    disabled={isPending}
                    className={`w-full py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 ${
                      isPending 
                        ? 'bg-white/5 text-slate-500 cursor-not-allowed opacity-50' 
                        : 'bg-white/5 hover:bg-white/10 text-white cursor-pointer'
                    }`}
                  >
                    <Download className="w-4 h-4" />
                    {isPending ? (lang === 'en' ? 'Locked (Pending)' : 'Đang chờ duyệt') : (lang === 'en' ? 'Download' : 'Tải về')}
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {filteredResources.length === 0 && (
          <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-12 text-slate-500 text-xs border border-dashed border-white/10 rounded-[24px] flex flex-col items-center justify-center gap-2">
            <AlertCircle className="w-8 h-8 text-slate-600" />
            <p>{lang === 'en' ? 'No matching resources found.' : 'Không tìm thấy tài liệu nào phù hợp.'}</p>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in font-sans">
          <div className="w-full max-w-md bg-[#161616] border border-white/10 rounded-3xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-[#CCFF00]" />
                <h3 className="text-lg font-black text-white font-display">
                  {lang === 'en' ? 'Upload Document' : 'Thêm Tài Liệu Học Tập'}
                </h3>
              </div>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex items-start gap-2.5 text-amber-300 text-xs leading-relaxed">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                {lang === 'en'
                  ? 'Note: Only .doc, .docx, and .pdf formats are supported initially. Uploads require Admin moderation before appearing publicly.'
                  : 'Quy định: Chỉ hỗ trợ định dạng .doc, .docx và .pdf trong giai đoạn này. Tài liệu cần Admin kiểm duyệt mới hiển thị cho mọi người.'}
              </span>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  {lang === 'en' ? 'Document Title' : 'Tên Tài Liệu'}
                </label>
                <input
                  type="text"
                  required
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder={lang === 'en' ? 'e.g. AI Research Paper Final Draft' : 'Vd: Báo cáo tổng kết đồ án trí tuệ nhân tạo'}
                  className="w-full bg-[#0C0C0C] border border-white/10 text-xs text-white rounded-xl p-3 focus:outline-none focus:border-[#CCFF00] transition placeholder-slate-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    {lang === 'en' ? 'Category' : 'Phân Khối'}
                  </label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value as any)}
                    className="w-full bg-[#0C0C0C] border border-white/10 text-xs text-white rounded-xl p-3 focus:outline-none focus:border-[#CCFF00] transition cursor-pointer"
                  >
                    <option value="Report">Report (Báo cáo)</option>
                    <option value="Template">Template (Biểu mẫu)</option>
                    <option value="Slides">Slides (Bài giảng)</option>
                    <option value="Material">Material (Tài liệu)</option>
                    <option value="Syllabus">Syllabus (Đề cương)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    {lang === 'en' ? 'Format (Strict)' : 'Định dạng (Cho phép)'}
                  </label>
                  <select
                    value={uploadFileType}
                    onChange={(e) => setUploadFileType(e.target.value as any)}
                    className="w-full bg-[#0C0C0C] border border-white/10 text-xs text-white rounded-xl p-3 focus:outline-none focus:border-[#CCFF00] transition cursor-pointer font-mono"
                  >
                    <option value=".pdf">.PDF (Portable Doc)</option>
                    <option value=".docx">.DOCX (Word Document)</option>
                    <option value=".doc">.DOC (Word Legacy)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  {lang === 'en' ? 'Estimated Size' : 'Dung lượng ước tính'}
                </label>
                <input
                  type="text"
                  value={uploadSize}
                  onChange={(e) => setUploadSize(e.target.value)}
                  className="w-full bg-[#0C0C0C] border border-white/10 text-xs text-white rounded-xl p-3 focus:outline-none focus:border-[#CCFF00] transition font-mono"
                />
              </div>

              <input
                type="file"
                ref={fileInputRef}
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
              />
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border border-dashed border-white/15 rounded-2xl p-6 text-center bg-[#0C0C0C]/50 hover:bg-[#0C0C0C] hover:border-[#CCFF00]/50 transition cursor-pointer flex flex-col items-center justify-center gap-2 group"
              >
                <FileText className="w-8 h-8 text-slate-500 group-hover:text-[#CCFF00] transition" />
                <span className="text-xs text-slate-300 font-medium group-hover:text-white transition">
                  {selectedFileName ? `✔ ${selectedFileName}` : (lang === 'en' ? 'Click here to choose file from your device' : 'Nhấn vào đây để chọn file (.doc/.pdf) từ máy tính')}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {selectedFileName ? uploadSize : (lang === 'en' ? 'Supports .pdf, .doc, .docx up to 25MB' : 'Hỗ trợ .pdf, .doc, .docx tối đa 25MB')}
                </span>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
                >
                  {t.btnCancel}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-black transition hover:brightness-110 cursor-pointer shadow-lg flex items-center gap-1.5"
                  style={{ backgroundColor: accent }}
                >
                  <Upload className="w-3.5 h-3.5 stroke-[3]" />
                  {lang === 'en' ? 'Submit for Review' : 'Gửi Chờ Duyệt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

