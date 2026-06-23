import React, { useState } from 'react';
import { useResourceStore } from '../store/useResourceStore';
import { useUIStore } from '../store/useUIStore';
import { translations } from '../translations';
import { Search, Download, FileText, FileBadge } from 'lucide-react';

export const ResourceModule: React.FC = () => {
  const { lang, accent } = useUIStore();
  const t = translations[lang];
  const resources = useResourceStore((s) => s.resources);
  const [query, setQuery] = useState('');

  const filteredResources = resources.filter(r => 
    r.title.toLowerCase().includes(query.toLowerCase()) || 
    r.category.toLowerCase().includes(query.toLowerCase())
  );

  const getExtension = (category: string) => {
    switch (category) {
      case 'Report': return '.pdf';
      case 'Slides': return '.pptx';
      case 'Source Code': return '.zip';
      case 'Template': return '.docx';
      case 'Material': return '.txt';
      case 'Syllabus': return '.pdf';
      default: return '.pdf';
    }
  };

  const handleDownload = (resId: string, title: string, ext: string) => {
    // Mock download via data URI
    const element = document.createElement("a");
    const file = new Blob([`Mock file content for ${title}`], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${title}${ext}`;
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="p-1 md:p-4 space-y-6">
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
                ? 'Access, download, and share academic materials and project templates.' 
                : 'Truy cập, tải xuống và chia sẻ tài liệu học tập cùng các biểu mẫu dự án.'}
            </p>
          </div>
        </div>
        <div className="absolute right-0 bottom-0 w-48 h-48 blur-[80px] opacity-20 rounded-full" style={{ backgroundColor: accent }}></div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between bg-[#0C0C0C] p-4 border border-white/5 rounded-2xl">
        <div className="relative flex-1 font-sans">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder={lang === 'en' ? 'Search files...' : 'Tìm tài liệu học tập...'}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-[#161616] border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm font-sans focus:outline-none focus:border-white/20 text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-sans">
        {filteredResources.map(r => {
          const ext = getExtension(r.category);
          return (
            <div key={r.id} className="bg-[#111111] border border-white/5 rounded-[24px] p-5 hover:shadow-2xl transition-all duration-300 hover:border-white/10 flex flex-col space-y-4">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-slate-300 border border-white/10 shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                <span className="text-[10px] text-slate-500 font-bold font-mono tracking-wide uppercase bg-white/5 px-2.5 py-1 rounded-full">
                  {r.category}
                </span>
              </div>
              
              <div className="space-y-1">
                <h3 className="font-bold text-white text-base leading-tight group-hover:text-[#CCFF00] transition-colors flex items-center gap-1">
                  {r.title}
                  <span className="text-[10px] text-slate-500 font-mono tracking-tighter shrink-0">{ext}</span>
                </h3>
                <p className="text-[10px] text-slate-400 font-mono">
                  {lang === 'en' ? 'Uploaded by:' : 'Tải lên bởi:'} <span className="text-white font-medium">{r.sharedBy}</span>
                </p>
                <p className="text-[10px] text-slate-400 font-mono">
                  {lang === 'en' ? 'Size:' : 'Dung lượng:'} <span className="text-white">{r.size}</span>
                </p>
              </div>

              <div className="pt-4 border-t border-white/5">
                <button
                  onClick={() => handleDownload(r.id, r.title, ext)}
                  className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  {lang === 'en' ? 'Download' : 'Tải về'}
                </button>
              </div>
            </div>
          );
        })}
        {filteredResources.length === 0 && (
          <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-10 text-slate-500 text-xs border border-dashed border-white/10 rounded-[24px]">
            {lang === 'en' ? 'No matching resources found.' : 'Không tìm thấy tài liệu phù hợp.'}
          </div>
        )}
      </div>
    </div>
  );
};
