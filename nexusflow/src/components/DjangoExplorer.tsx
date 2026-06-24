import React, { useState } from 'react';
import { djangoTemplates, DjangoCodeTemplate } from '../data/djangoTemplates';
import { 
  FileCode, 
  Copy, 
  Check, 
  Download, 
  Terminal, 
  ArrowUpRight,
  Info,
  ExternalLink,
  BookOpen
} from 'lucide-react';

export default function DjangoExplorer() {
  const [activeFileIdx, setActiveFileIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  
  const activeTemplate = djangoTemplates[activeFileIdx];

  const handleCopy = () => {
    navigator.clipboard.writeText(activeTemplate.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([activeTemplate.code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeTemplate.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      
      {/* Informative Explanation Jumbotron */}
      <div className="bg-[#111827] text-gray-300 p-6 rounded-2xl border border-[#1f2937] shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2 text-blue-400 font-mono text-xs font-semibold uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            <span>Target Q3 2026 Release Architecture Specs</span>
          </div>
          <h2 className="text-xl font-sans font-bold tracking-tight text-white">
            Django & MySQL Enterprise Blueprint Explorer
          </h2>
          <p className="text-xs text-gray-400 leading-relaxed font-sans">
            Review the production-grade backend components designed for NexusFlow. These files are configured for Django, 
            session-based authentication with the custom <code className="text-blue-400 font-mono text-[11px] bg-[#0a0a0b] px-1.5 py-0.5 rounded border border-[#1f2937]">@NexusFlowLoginRequired</code> decorator, 
            and a highly optimized MySQL schema with custom compound indexing structure.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[#0a0a0b] px-4 py-3 rounded-xl border border-[#1f2937] font-mono text-[10px] text-gray-500 shrink-0 select-none">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          <span>STACK: DJANGO + MYSQL 8.0</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Side: Navigation files */}
        <div className="space-y-2.5">
          <span className="block px-2 text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest">
            SCHEMA & CONTROLLERS
          </span>
          <div className="space-y-1.5">
            {djangoTemplates.map((template, idx) => {
              const isActive = activeFileIdx === idx;
              return (
                <button
                  key={template.filename}
                  onClick={() => {
                    setActiveFileIdx(idx);
                    setCopied(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition-all flex flex-col gap-1 cursor-pointer ${
                    isActive 
                      ? 'bg-blue-950/40 border-blue-500/40 text-white shadow-sm' 
                      : 'bg-[#0a0a0b] hover:bg-white/5 border-[#1f2937] text-gray-400'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={`font-mono text-xs font-bold ${isActive ? 'text-blue-400' : 'text-white'}`}>
                      {template.filename}
                    </span>
                    <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border ${
                      template.language === 'python' 
                        ? 'bg-[#111827] text-gray-300 border-[#1f2937]' 
                        : 'bg-orange-950/40 text-orange-400 border-orange-900/50'
                    }`}>
                      {template.language}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-500 line-clamp-1 leading-normal">
                    {template.description}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="p-4 bg-blue-950/20 border border-blue-900/35 rounded-xl space-y-2 mt-4 text-blue-300">
            <h4 className="text-[11px] font-bold text-blue-400 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 shrink-0 text-blue-400" />
              Integration Tips
            </h4>
            <p className="text-[10px] text-gray-400 leading-relaxed font-sans">
              Deploy this package to your Django environment under <code className="font-mono text-[10px] bg-[#0a0a0b] text-blue-400 border border-[#1f2937] px-1 rounded">nexusflow_core/</code> directory. Ensure your <code className="font-mono text-[10px] bg-[#0a0a0b] text-blue-400 border border-[#1f2937] px-1 rounded">settings.py</code> is mapped to a secure MySQL database engine instance.
            </p>
          </div>
        </div>

        {/* Right Side: Code display console with action triggers */}
        <div className="lg:col-span-3 bg-[#0a0a0b] rounded-2xl border border-[#1f2937] shadow-2xl flex flex-col overflow-hidden h-[600px]">
          
          {/* Code Header Actions */}
          <div className="bg-[#111827] px-5 py-3 border-b border-[#1f2937] flex items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-gray-500" />
              <span className="text-xs font-mono text-white font-bold">
                {activeTemplate.filename}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0a0a0b] hover:bg-zinc-800 text-gray-300 hover:text-white rounded-lg text-xs font-mono font-medium transition-colors border border-[#1f2937] cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400 animate-scale" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>

              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-mono font-bold transition-colors shadow-lg shadow-blue-600/10 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
          </div>

          {/* Code Viewer body */}
          <div className="flex-1 overflow-y-auto p-5 font-mono text-xs leading-relaxed text-gray-300 select-text scrollbar-thin scrollbar-thumb-zinc-800">
            <pre className="font-mono">
              <code>{activeTemplate.code}</code>
            </pre>
          </div>

          {/* Footer details about file usage */}
          <div className="bg-[#111827] px-5 py-2.5 border-t border-[#1f2937] text-[10px] font-mono text-gray-500 flex items-center justify-between shrink-0">
            <span>COMPLIANT STATUS: PY-LINT COMPATIBLE</span>
            <span>CHARSET: UTF-8</span>
          </div>

        </div>

      </div>
    </div>
  );
}
