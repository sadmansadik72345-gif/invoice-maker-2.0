import React, { useState } from 'react';
import { NEXTJS_PROJECT_FILES } from '../data/nextjsProjectFiles';
import { NextJsFile } from '../types';
import { 
  FileCode, Copy, Check, Download, Folder, File, 
  Terminal, Shield, Database, ExternalLink 
} from 'lucide-react';

export const CodeExplorerModal: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<NextJsFile>(NEXTJS_PROJECT_FILES[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = (file: NextJsFile) => {
    const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-slate-900 text-white">
              <FileCode className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Next.js 14 Production Codebase Explorer
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Copy or download ready-to-deploy Next.js App Router files with Supabase SSR and Tailwind CSS
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleCopy(selectedFile.content)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition-colors shadow-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied to Clipboard!' : `Copy ${selectedFile.filename}`}</span>
          </button>
        </div>
      </div>

      {/* Code Browser Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        {/* Left Sidebar: File Tree (4 cols) */}
        <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-slate-200 bg-slate-50/50 p-4 space-y-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-2">
            Project Architecture
          </div>

          <div className="space-y-1">
            {NEXTJS_PROJECT_FILES.map((file) => {
              const isActive = selectedFile.path === file.path;
              return (
                <button
                  key={file.path}
                  onClick={() => {
                    setSelectedFile(file);
                    setCopied(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs transition-colors flex items-center justify-between group ${
                    isActive
                      ? 'bg-slate-900 text-white font-medium shadow-xs'
                      : 'hover:bg-slate-200/60 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <File className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-slate-300' : 'text-slate-400'}`} />
                    <span className="truncate font-mono">{file.path}</span>
                  </div>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-sans uppercase shrink-0 ${
                      isActive ? 'bg-slate-800 text-slate-300' : 'text-slate-400'
                    }`}
                  >
                    {file.category}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Deployment Quick Guide */}
          <div className="mt-6 pt-4 border-t border-slate-200 p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-2">
            <span className="font-semibold text-slate-800 block text-[11px] uppercase tracking-wider">
              Vercel Deployment Checklist
            </span>
            <ol className="list-decimal list-inside text-slate-600 text-[11px] space-y-1">
              <li>Create Supabase Project & run <code className="font-mono">schema.sql</code></li>
              <li>Clone code files into your Next.js directory</li>
              <li>Set <code className="font-mono">.env.local</code> variables</li>
              <li>Push to GitHub and import into Vercel</li>
            </ol>
          </div>
        </div>

        {/* Right Code Content Pane (8 cols) */}
        <div className="lg:col-span-8 flex flex-col h-[650px]">
          {/* File Tab Header */}
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-emerald-400">{selectedFile.path}</span>
              <span className="text-slate-400 text-xs hidden sm:inline">· {selectedFile.description}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDownloadFile(selectedFile)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Download this file"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleCopy(selectedFile.content)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Copy file contents"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Monospace Code Body */}
          <div className="flex-1 p-4 bg-slate-950 overflow-auto font-mono text-xs leading-relaxed text-slate-200 selection:bg-slate-800">
            <pre className="overflow-x-auto whitespace-pre">
              <code>{selectedFile.content}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
