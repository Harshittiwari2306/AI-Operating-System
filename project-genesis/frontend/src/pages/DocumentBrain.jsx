import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FolderGit, 
  UploadCloud, 
  Trash2, 
  MessageSquare, 
  BookOpen, 
  Sparkles, 
  HelpCircle,
  Play,
  FileText
} from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { motion, AnimatePresence } from 'framer-motion';

const DocumentBrain = () => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  
  const [selectedFileId, setSelectedFileId] = useState('');
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState('standard'); // standard, flashcards, quiz, beginner

  const [chatLog, setChatLog] = useState([]);
  const [queryLoading, setQueryLoading] = useState(false);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const res = await axios.get('/api/rag/files');
      setFiles(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      await axios.post('/api/rag/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchFiles();
    } catch (err) {
      alert(err.response?.data?.detail || "Upload failed. Supported formats: PDF, DOCX, TXT, PPT/PPTX.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (!confirm("Are you sure you want to purge this document and its vectors?")) return;
    try {
      await axios.delete(`/api/rag/files/${fileId}`);
      if (selectedFileId === String(fileId)) {
        setSelectedFileId('');
      }
      fetchFiles();
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuerySubmit = async (e) => {
    e.preventDefault();
    if (!query.strip && !query.trim()) return;

    const userMsg = query;
    setChatLog(prev => [...prev, { sender: 'user', text: userMsg }]);
    setQuery('');
    setQueryLoading(true);

    try {
      const res = await axios.post('/api/rag/query', {
        file_id: selectedFileId ? parseInt(selectedFileId) : null,
        query: userMsg,
        mode: mode
      });
      setChatLog(prev => [...prev, { sender: 'ai', text: res.data.response }]);
    } catch (err) {
      console.error(err);
      setChatLog(prev => [...prev, { sender: 'ai', text: "Failure querying Document Brain collection. Please verify upload indexing status." }]);
    } finally {
      setQueryLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 py-2">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-outfit font-extrabold text-white">Document Brain (RAG)</h1>
        <p className="text-sm text-gray-400 mt-1">
          Upload reference sheets, lecture slides, or textbooks. The AI chunks, indexes, and queries them to generate flashcards and explanations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Panel: Upload and File manager */}
        <div className="lg:col-span-1 space-y-6">
          {/* Drag Upload Card */}
          <GlassCard className="p-4 space-y-4">
            <h3 className="font-outfit font-bold text-white text-base border-b border-cyber-border pb-2 flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-cyber-teal" />
              <span>Import Document</span>
            </h3>

            <div className="relative border-2 border-dashed border-cyber-border rounded-xl p-6 text-center hover:border-cyber-teal/50 transition-all flex flex-col items-center justify-center cursor-pointer bg-white/[0.01]">
              <input
                type="file"
                accept=".pdf,.docx,.txt,.ppt,.pptx"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
                disabled={uploading}
              />
              <FileText className="w-10 h-10 text-slate-500 mb-2.5" />
              <p className="text-xs text-gray-300 font-semibold">{uploading ? 'Parsing and Embedding...' : 'Click to Upload Document'}</p>
              <span className="text-[10px] text-gray-500 block mt-1">PDF, DOCX, TXT, or PPT (Max 15MB)</span>
            </div>
          </GlassCard>

          {/* Files Index Card */}
          <GlassCard className="h-[300px] p-4 flex flex-col">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 pb-2 border-b border-cyber-border">Indexed Library</h3>
            <div className="overflow-y-auto pr-1 space-y-2 flex-1 no-scrollbar">
              {files.length > 0 ? (
                files.map((file) => (
                  <div key={file.id} className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center hover:bg-white/10 transition-all">
                    <div className="overflow-hidden pr-2">
                      <h4 className="text-xs font-semibold text-white truncate">{file.filename}</h4>
                      <span className="text-[9px] text-gray-500 block mt-0.5 uppercase">{file.file_type} • {(file.file_size/1024).toFixed(0)} KB</span>
                    </div>
                    <button
                      onClick={() => handleDeleteFile(file.id)}
                      className="w-7 h-7 rounded-lg bg-red-950/20 hover:bg-red-900/40 border border-red-900/30 text-red-400 flex items-center justify-center transition-all flex-shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-xs text-gray-500">
                  No reference material loaded.
                </div>
              )}
            </div>
          </GlassCard>
        </div>

        {/* Right Panel: QA Chat box */}
        <div className="lg:col-span-2">
          <GlassCard className="h-[520px] flex flex-col justify-between">
            {/* Header controls */}
            <div className="flex flex-wrap justify-between items-center pb-2 border-b border-cyber-border gap-3">
              <div className="flex items-center gap-2">
                <FolderGit className="w-5 h-5 text-cyber-violet" />
                <h3 className="font-outfit font-bold text-white text-base">Retrieval QA Console</h3>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Target file Selector */}
                <select
                  value={selectedFileId}
                  onChange={(e) => setSelectedFileId(e.target.value)}
                  className="glass-input text-[11px] py-1.5 px-3 bg-cyber-dark/80 text-gray-300"
                >
                  <option value="">Query All Brain Files</option>
                  {files.map(f => (
                    <option key={f.id} value={f.id}>{f.filename}</option>
                  ))}
                </select>

                {/* Output Mode Selector */}
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                  className="glass-input text-[11px] py-1.5 px-3 bg-cyber-dark/80 text-gray-300"
                >
                  <option value="standard">Standard Answer</option>
                  <option value="flashcards">Generate Flashcards</option>
                  <option value="quiz">Compile Quiz</option>
                  <option value="beginner">Explain to Beginner</option>
                </select>
              </div>
            </div>

            {/* QA Scrolling Dialog logs */}
            <div className="flex-1 overflow-y-auto my-4 pr-1 space-y-4 no-scrollbar">
              {chatLog.length > 0 ? (
                chatLog.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-cyber-violet/20 border border-cyber-violet/30 text-white'
                        : 'bg-white/5 border border-white/5 text-slate-300 font-mono whitespace-pre-wrap'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 py-12">
                  <MessageSquare className="w-12 h-12 text-cyber-border mb-3" />
                  <p className="text-sm">RAG Query Assistant</p>
                  <p className="text-xs text-gray-500 mt-1 max-w-xs">Select your output filter (e.g. quiz or flashcard generator) and query details from your files.</p>
                </div>
              )}

              {queryLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-2xl p-4 bg-white/5 border border-white/5 text-sm text-gray-400 flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border-2 border-cyber-teal border-t-transparent animate-spin"></div>
                    <span>Genesis Brain is parsing vectors...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Query Bar */}
            <form onSubmit={handleQuerySubmit} className="flex gap-3 pt-3 border-t border-cyber-border/40">
              <input
                type="text"
                required
                placeholder="e.g. Explain Chapter 3 summary..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full glass-input text-sm"
              />
              <button
                type="submit"
                disabled={queryLoading}
                className="cyber-btn-teal px-5 py-2 text-xs uppercase tracking-wider font-bold"
              >
                Submit
              </button>
            </form>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default DocumentBrain;
