import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { 
  Sparkles, 
  Trash2, 
  Search, 
  Tag, 
  Plus, 
  Edit3, 
  Check, 
  FileText,
  Image as ImageIcon
} from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { motion, AnimatePresence } from 'framer-motion';

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [availableTags, setAvailableTags] = useState([]);

  // Active Editor state
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsStr, setTagsStr] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, [search, selectedTag]);

  const fetchNotes = async () => {
    try {
      const res = await axios.get('/api/notes/', {
        params: {
          search: search || undefined,
          tag: selectedTag || undefined
        }
      });
      setNotes(res.data);
      
      // Compute list of unique tags for the sidebar selector
      if (!search && !selectedTag) {
        const tags = new Set();
        res.data.forEach(n => n.tags?.forEach(t => tags.add(t)));
        setAvailableTags(Array.from(tags));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateNew = () => {
    setActiveNoteId(null);
    setTitle('');
    setContent('# New Note\nWrite content here in **Markdown** format!');
    setTagsStr('');
    setImageUrl('');
    setIsEditing(true);
  };

  const handleSelectNote = (note) => {
    setActiveNoteId(note.id);
    setTitle(note.title);
    setContent(note.content);
    setTagsStr(note.tags?.join(', ') || '');
    setImageUrl(note.image_url || '');
    setIsEditing(false);
  };

  const handleSaveNote = async () => {
    if (!title) {
      alert("Please provide a note title.");
      return;
    }
    const tagsArr = tagsStr.split(',').map(t => t.trim()).filter(Boolean);
    try {
      if (activeNoteId) {
        // Edit existing
        const res = await axios.put(`/api/notes/${activeNoteId}`, {
          title,
          content,
          tags: tagsArr,
          image_url: imageUrl || null
        });
        handleSelectNote(res.data);
      } else {
        // Create new
        const res = await axios.post('/api/notes/', {
          title,
          content,
          tags: tagsArr,
          image_url: imageUrl || null
        });
        handleSelectNote(res.data);
      }
      setIsEditing(false);
      fetchNotes();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!confirm("Are you sure you want to delete this note?")) return;
    try {
      await axios.delete(`/api/notes/${noteId}`);
      setActiveNoteId(null);
      setTitle('');
      setContent('');
      setTagsStr('');
      setImageUrl('');
      setIsEditing(false);
      fetchNotes();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 py-2">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-outfit font-extrabold text-white">AI Notes Notebook</h1>
          <p className="text-sm text-gray-400 mt-1 font-medium">
            Take notes using full Markdown support, add tags, and search your personal workspace.
          </p>
        </div>
        <button
          onClick={handleCreateNew}
          className="cyber-btn-teal inline-flex items-center gap-1.5 text-xs font-semibold py-2.5 px-4"
        >
          <Plus className="w-4 h-4" />
          <span>New Note</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar: Notes List & Tag Filters */}
        <div className="lg:col-span-1 space-y-6">
          {/* Search and Filters */}
          <GlassCard className="p-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search notes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full glass-input pl-10 pr-4 py-2 text-xs"
              />
            </div>
            
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Filter by Tag</label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setSelectedTag('')}
                  className={`text-[10px] px-2 py-0.5 rounded-md font-medium border ${
                    selectedTag === '' ? 'bg-cyber-teal/10 text-cyber-teal border-cyber-teal/30' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  All
                </button>
                {availableTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`text-[10px] px-2 py-0.5 rounded-md font-medium border ${
                      selectedTag === tag ? 'bg-cyber-teal/10 text-cyber-teal border-cyber-teal/30' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          </GlassCard>

          {/* Notes list */}
          <GlassCard className="h-[400px] p-4 flex flex-col">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 pb-2 border-b border-cyber-border">Notes Index</h3>
            
            <div className="overflow-y-auto pr-1 space-y-2.5 flex-1 no-scrollbar">
              {notes.length > 0 ? (
                notes.map((note) => (
                  <div
                    key={note.id}
                    onClick={() => handleSelectNote(note)}
                    className={`p-3 rounded-xl cursor-pointer border transition-all ${
                      activeNoteId === note.id 
                        ? 'bg-cyber-violet/10 border-cyber-violet/40 text-white' 
                        : 'bg-white/5 border-white/5 hover:bg-white/10 text-slate-300'
                    }`}
                  >
                    <h4 className="font-outfit font-bold text-sm truncate leading-snug">{note.title || 'Untitled Note'}</h4>
                    <p className="text-[10px] text-gray-500 mt-1 truncate">{note.content?.replace(/[#*`]/g, '')}</p>
                    <div className="flex gap-1 mt-2">
                      {note.tags?.slice(0, 2).map(t => (
                        <span key={t} className="text-[8px] px-1.5 py-0.2 rounded bg-white/5 border border-white/10 text-slate-400">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-xs text-gray-500">
                  No notes found.
                </div>
              )}
            </div>
          </GlassCard>
        </div>

        {/* Main Editor / Detail Board */}
        <div className="lg:col-span-3">
          <GlassCard className="min-h-[520px] flex flex-col justify-between">
            {isEditing ? (
              // Editing Mode Form
              <div className="space-y-4 flex-1 flex flex-col">
                <div className="flex justify-between items-center pb-2 border-b border-cyber-border">
                  <h3 className="font-outfit font-bold text-white text-lg">Editor</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveNote}
                      className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-cyber-mint text-cyber-dark flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Note</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Note Title</label>
                    <input
                      type="text"
                      placeholder="Title of note..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full glass-input text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Tags (comma separated)</label>
                    <input
                      type="text"
                      placeholder="study, math, machine-learning"
                      value={tagsStr}
                      onChange={(e) => setTagsStr(e.target.value)}
                      className="w-full glass-input text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Image URL (Optional)</label>
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full glass-input text-sm"
                  />
                </div>

                <div className="flex-1 flex flex-col min-h-[250px] mt-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Markdown Content</label>
                  <textarea
                    placeholder="# Header&#10;Write list items here..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full glass-input text-sm flex-1 font-mono resize-none leading-relaxed p-4"
                  />
                </div>
              </div>
            ) : (
              // Reading/Preview Mode
              title ? (
                <div className="space-y-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start pb-2 border-b border-cyber-border mb-3">
                      <div>
                        <h2 className="font-outfit font-extrabold text-2xl text-white">{title}</h2>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {tagsStr.split(',').map(t => t.trim()).filter(Boolean).map(tag => (
                            <span key={tag} className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-cyber-violet/20 text-cyber-violet border border-cyber-violet/30 font-semibold font-outfit uppercase">
                              <Tag className="w-2.5 h-2.5" />
                              <span>{tag}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setIsEditing(true)}
                          className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-all"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteNote(activeNoteId)}
                          className="w-8 h-8 rounded-xl bg-red-950/20 hover:bg-red-900/40 border border-red-900/30 text-red-400 hover:text-red-300 flex items-center justify-center transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {imageUrl && (
                      <div className="my-4 max-h-[220px] rounded-xl overflow-hidden border border-cyber-border">
                        <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
                      </div>
                    )}

                    {/* Markdown Renderer */}
                    <div className="prose prose-invert max-w-none text-sm leading-relaxed text-slate-300 mt-4 overflow-y-auto max-h-[350px] pr-2 no-scrollbar">
                      <ReactMarkdown>{content}</ReactMarkdown>
                    </div>
                  </div>
                  
                  <p className="text-[10px] text-gray-500 italic pt-3 border-t border-cyber-border/40">Markdown formatting active. Click the pencil icon to modify contents.</p>
                </div>
              ) : (
                <div className="h-full flex-1 flex flex-col items-center justify-center text-center text-slate-500 py-12">
                  <FileText className="w-16 h-16 text-cyber-border mb-3" />
                  <p className="text-sm">No Note Selected</p>
                  <p className="text-xs text-gray-500 mt-1">Select an existing note from the index or initialize a new one.</p>
                </div>
              )
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default Notes;
