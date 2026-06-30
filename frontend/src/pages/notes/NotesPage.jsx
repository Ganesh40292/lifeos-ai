import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  StickyNote,
  Plus,
  Trash2,
  Pin,
  Folder,
  FolderPlus,
  Tag,
  Search,
  BookOpen,
  Edit3,
  Save,
  CheckCircle,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronRight,
  Download,
  FileText,
  Upload,
  X,
  Maximize2,
  Minimize2,
  Sparkles,
} from 'lucide-react';
import clsx from 'clsx';

// Services & Components
import notesService from '@/services/notesService';
import { useAuth } from '@/hooks/useAuth';
import StudyCompanion from '@/components/notes/StudyCompanion';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';

const pageVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

/**
 * Custom regex-based Markdown renderer.
 * Safely parses Headings, Bullet Lists, Task Checkboxes, Bold, Italic, and Code Blocks.
 */
const renderMarkdown = (text) => {
  if (!text) return '<p class="text-sm text-text-faint italic">No content in note. Start typing to write something...</p>';
  
  // Escape HTML tags to prevent XSS
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  
  // Code blocks
  html = html.replace(/```([\s\S]*?)```/g, '<pre class="bg-bg-elevated p-3 rounded-lg border border-border font-mono text-xs overflow-x-auto my-3 text-text-secondary">$1</pre>');
  
  // Headings
  html = html.replace(/^### (.*$)/gim, '<h4 class="text-sm font-bold text-text mt-4 mb-1">$1</h4>');
  html = html.replace(/^## (.*$)/gim, '<h3 class="text-base font-bold text-text mt-5 mb-1.5 border-b border-border/30 pb-0.5">$1</h3>');
  html = html.replace(/^# (.*$)/gim, '<h2 class="text-lg font-bold text-text mt-6 mb-2 border-b border-border/50 pb-1">$1</h2>');

  // Task lists
  html = html.replace(/^\s*-\s*\[x\]\s*(.*$)/gim, '<div class="flex items-center gap-2 my-1.5"><input type="checkbox" checked disabled class="rounded text-primary border-border bg-bg-card w-4 h-4 cursor-not-allowed" /> <span class="line-through text-text-secondary text-sm">$1</span></div>');
  html = html.replace(/^\s*-\s*\[ \]\s*(.*$)/gim, '<div class="flex items-center gap-2 my-1.5"><input type="checkbox" disabled class="rounded text-primary border-border bg-bg-card w-4 h-4 cursor-not-allowed" /> <span class="text-text text-sm">$1</span></div>');

  // Bullet points
  html = html.replace(/^\s*[\*\-]\s*(.*$)/gim, '<li class="list-disc ml-5 my-1 text-sm text-text-secondary">$1</li>');

  // Bold / Italic
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Paragraph splits
  html = html.split('\n').map(line => {
    const trimmed = line.trim();
    if (
      trimmed.startsWith('<h') ||
      trimmed.startsWith('<pre') ||
      trimmed.startsWith('<li') ||
      trimmed.startsWith('<div') ||
      trimmed.startsWith('</pre>')
    ) {
      return line;
    }
    return trimmed ? `<p class="text-sm text-text-secondary my-2 leading-relaxed">${line}</p>` : '<div class="h-2"></div>';
  }).join('\n');

  return html;
};

const NotesPage = () => {
  const { refreshUser } = useAuth();
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('All');
  const [editorMode, setEditorMode] = useState('edit'); // 'edit' | 'preview'

  // PDF Note viewer states
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [showPdfViewer, setShowPdfViewer] = useState(true);
  const [isFullscreenPdf, setIsFullscreenPdf] = useState(false);
  const [showStudyCompanion, setShowStudyCompanion] = useState(true);

  // Load notes
  const loadNotes = async (selectId = null) => {
    try {
      setLoading(true);
      const res = await notesService.getNotes();
      if (res.success) {
        const fetchedNotes = res.data || [];
        setNotes(fetchedNotes);
        
        // Select logic
        if (selectId) {
          const matched = fetchedNotes.find(n => n.id === selectId);
          if (matched) setSelectedNote(matched);
        } else if (fetchedNotes.length > 0 && !selectedNote) {
          setSelectedNote(fetchedNotes[0]);
        }
      }
    } catch (err) {
      console.error('Error loading notes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, []);

  // Fetch PDF Blob URL securely on selectedNote.filePath changes
  useEffect(() => {
    let isMounted = true;
    let localPdfUrl = null;
    setIsFullscreenPdf(false);

    if (selectedNote?.filePath) {
      setLoadingPdf(true);
      notesService.getPdfBlob(selectedNote.filePath)
        .then((blob) => {
          if (isMounted) {
            localPdfUrl = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
            setPdfUrl(localPdfUrl);
          }
        })
        .catch((err) => {
          console.error("Failed to load PDF blob:", err);
        })
        .finally(() => {
          if (isMounted) setLoadingPdf(false);
        });
    } else {
      setPdfUrl(null);
      setLoadingPdf(false);
    }

    return () => {
      isMounted = false;
      if (localPdfUrl) {
        URL.revokeObjectURL(localPdfUrl);
      }
    };
  }, [selectedNote?.filePath]);

  // --- PDF Upload / Delete Handlers ---
  const handlePdfUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedNote) return;
    
    if (file.type !== 'application/pdf') {
      alert('Only PDF files are allowed');
      return;
    }
    
    try {
      setSaving(true);
      const res = await notesService.uploadPdf(selectedNote.id, file);
      if (res.success) {
        setSelectedNote(res.data);
        setNotes((prev) =>
          prev.map((n) => (n.id === selectedNote.id ? res.data : n))
        );
      }
    } catch (err) {
      console.error('Failed to upload PDF:', err);
      alert('Failed to upload PDF. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handlePdfDelete = async () => {
    if (!selectedNote) return;
    if (!window.confirm('Are you sure you want to remove this PDF attachment?')) return;
    
    try {
      setSaving(true);
      const res = await notesService.deletePdf(selectedNote.id);
      if (res.success) {
        setSelectedNote(res.data);
        setNotes((prev) =>
          prev.map((n) => (n.id === selectedNote.id ? res.data : n))
        );
      }
    } catch (err) {
      console.error('Failed to delete PDF:', err);
      alert('Failed to remove PDF. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // --- Folder List Parsing ---
  const getFoldersList = () => {
    const folderSet = new Set(notes.map((n) => n.folder || 'General'));
    return ['All', ...Array.from(folderSet)];
  };

  // --- New Note Handler ---
  const handleCreateNote = async () => {
    try {
      const payload = {
        title: 'Untitled Note',
        content: '',
        folder: selectedFolder !== 'All' ? selectedFolder : 'General',
        tags: '',
        pinned: false,
      };
      const res = await notesService.addNote(payload);
       if (res.success) {
        await loadNotes(res.data.id);
        setEditorMode('edit');
        refreshUser();
      }
    } catch (err) {
      console.error('Failed to create note:', err);
    }
  };

  // --- Update Form Input Handlers ---
  const handleFormChange = (field, value) => {
    if (!selectedNote) return;
    setSelectedNote((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // --- Save Changes Handler ---
  const handleSaveChanges = async () => {
    if (!selectedNote) return;
    try {
      setSaving(true);
      const res = await notesService.updateNote(selectedNote.id, selectedNote);
      if (res.success) {
        setNotes((prev) =>
          prev.map((n) => (n.id === selectedNote.id ? res.data : n))
        );
        setSelectedNote(res.data);
      }
    } catch (err) {
      console.error('Failed to save note changes:', err);
    } finally {
      setSaving(false);
    }
  };

  // --- Toggle Pin Handler ---
  const handleTogglePin = async () => {
    if (!selectedNote) return;
    try {
      const res = await notesService.togglePinNote(selectedNote.id);
      if (res.success) {
        setSelectedNote(res.data);
        // Refresh full list order
        await loadNotes(res.data.id);
      }
    } catch (err) {
      console.error('Failed to pin note:', err);
    }
  };

  const handleExportNote = () => {
    if (!selectedNote) return;
    const element = document.createElement('a');
    const file = new Blob([selectedNote.content || ''], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `${selectedNote.title || 'untitled'}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // --- Delete Note Handler ---
  const handleDeleteNote = async () => {
    if (!selectedNote) return;
    if (!window.confirm(`Are you sure you want to delete note: "${selectedNote.title}"?`)) return;
    try {
      const res = await notesService.deleteNote(selectedNote.id);
      if (res.success) {
        const remaining = notes.filter((n) => n.id !== selectedNote.id);
        setNotes(remaining);
        setSelectedNote(remaining.length > 0 ? remaining[0] : null);
      }
    } catch (err) {
      console.error('Failed to delete note:', err);
    }
  };

  // --- Filter Logic ---
  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFolder =
      selectedFolder === 'All' || note.folder === selectedFolder;

    return matchesSearch && matchesFolder;
  });

  return (
    <motion.div
      className="page-container flex flex-col h-[calc(100vh-80px)] overflow-hidden"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex flex-col md:flex-row gap-6 h-full">
        
        {/* Left Side: Sidebar Directory & Notes Ledger */}
        <div className="w-full md:w-80 flex-shrink-0 flex flex-col gap-4 h-full border-r border-border/50 pr-4">
          
          {/* Header Action */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="page-title flex items-center gap-2 mb-0.5">
                <StickyNote className="w-6 h-6 text-primary" />
                Notes
              </h1>
              <p className="text-xs text-text-secondary">
                Organize and review thoughts with markdown
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              onClick={handleCreateNote}
            >
              New Note
            </Button>
          </div>

          {/* Search bar */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-faint">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search notes, tags..."
              className="w-full rounded-lg border border-border bg-bg-input pl-10 pr-3 py-2 text-sm text-text focus:outline-none focus:ring-1 focus:ring-ring focus:border-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Folders List selection */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-text-faint mb-1">
              Folders
            </span>
            <div className="flex flex-wrap gap-1 md:flex-col md:gap-0.5 max-h-24 md:max-h-none overflow-y-auto">
              {getFoldersList().map((folder) => (
                <button
                  key={folder}
                  onClick={() => setSelectedFolder(folder)}
                  className={clsx(
                    'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors',
                    selectedFolder === folder
                      ? 'bg-primary-muted/20 text-primary border border-primary-muted/30'
                      : 'text-text-secondary hover:bg-bg-hover hover:text-text border border-transparent'
                  )}
                >
                  <Folder className="w-3.5 h-3.5" />
                  {folder}
                  <span className="ml-auto text-[10px] bg-bg-card border border-border text-text-faint px-1.5 py-0.2 rounded-full">
                    {folder === 'All'
                      ? notes.length
                      : notes.filter((n) => n.folder === folder).length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Notes list ledger */}
          <div className="flex-1 overflow-y-auto flex flex-col gap-1.5 pr-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-text-faint">
              Notes List
            </span>
            {loading && notes.length === 0 ? (
              <div className="flex flex-col gap-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-xl" />
                ))}
              </div>
            ) : filteredNotes.length === 0 ? (
              <div className="text-center py-10 text-text-faint">
                <p className="text-xs">No notes matching filter criteria</p>
              </div>
            ) : (
              filteredNotes.map((note) => {
                const isSelected = selectedNote?.id === note.id;
                return (
                  <button
                    key={note.id}
                    onClick={() => {
                      setSelectedNote(note);
                      setEditorMode('edit');
                    }}
                    className={clsx(
                      'w-full text-left rounded-xl p-3 border text-xs transition-all relative flex flex-col gap-1.5 cursor-pointer',
                      isSelected
                        ? 'border-primary bg-bg-elevated shadow-sm'
                        : 'border-border/60 hover:border-border hover:bg-bg-hover/30'
                    )}
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold text-text truncate max-w-[80%]">
                        {note.title || 'Untitled Note'}
                      </h4>
                      {note.pinned && (
                        <Pin className="w-3.5 h-3.5 text-accent fill-accent" />
                      )}
                    </div>
                    
                    {/* Snippet preview */}
                    <p className="text-text-secondary truncate text-[11px] leading-relaxed">
                      {note.content ? note.content.substring(0, 45) + (note.content.length > 45 ? '...' : '') : 'No content...'}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-text-faint mt-1 font-mono">
                      <span>Folder: {note.folder || 'General'}</span>
                      {note.tags && (
                        <div className="flex gap-1">
                          {note.tags.split(',').slice(0, 2).map((t, idx) => (
                            <span key={idx} className="bg-border/40 text-text-secondary px-1.5 py-0.2 rounded-md">
                              {t.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

        </div>

        {/* Right Side: Notes workspace editor */}
        <div className="flex-1 flex flex-col h-full bg-bg-card rounded-2xl border border-border overflow-hidden">
          {selectedNote ? (
            <div className="flex flex-col h-full">
              
              {/* Workspace Header Actions toolbar */}
              <div className="flex justify-between items-center px-4 py-3 border-b border-border bg-bg-elevated/20">
                
                {/* Mode Selectors */}
                <div className="flex gap-1 bg-border/40 p-1 rounded-lg">
                  <button
                    onClick={() => setEditorMode('edit')}
                    className={clsx(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-colors',
                      editorMode === 'edit' ? 'bg-bg-card text-text shadow-sm' : 'text-text-secondary hover:text-text'
                    )}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Write
                  </button>
                  <button
                    onClick={() => setEditorMode('preview')}
                    className={clsx(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-colors',
                      editorMode === 'preview' ? 'bg-bg-card text-text shadow-sm' : 'text-text-secondary hover:text-text'
                    )}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    Preview
                  </button>
                </div>

                {/* Toolbar buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleTogglePin}
                    className={clsx(
                      'p-2 rounded-lg border border-border/80 transition-colors cursor-pointer',
                      selectedNote.pinned
                        ? 'bg-accent/15 text-accent border-accent/35'
                        : 'text-text-faint hover:text-text hover:bg-bg-hover'
                    )}
                    title={selectedNote.pinned ? 'Unpin note' : 'Pin note'}
                  >
                    <Pin className={clsx("w-4 h-4", selectedNote.pinned && "fill-accent")} />
                  </button>

                  <button
                    onClick={handleExportNote}
                    className="p-2 text-text-faint hover:text-text hover:bg-bg-hover border border-border/80 rounded-lg transition-colors cursor-pointer"
                    title="Export note as Markdown (.md)"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={handleDeleteNote}
                    className="p-2 text-text-faint hover:text-danger hover:bg-danger/10 border border-border/80 rounded-lg transition-colors cursor-pointer"
                    title="Delete note"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  
                  <Button
                    variant="primary"
                    size="sm"
                    loading={saving}
                    icon={<Save className="w-4 h-4" />}
                    onClick={handleSaveChanges}
                  >
                    Save Changes
                  </Button>
                </div>

              </div>

              {/* Workspace workspace content */}
              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
                
                {editorMode === 'edit' ? (
                  /* --- EDIT MODE --- */
                  <div className="flex flex-col gap-4 h-full flex-1">
                    
                    {/* Metadata grids */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      
                      {/* Note Title */}
                      <div className="sm:col-span-1">
                        <Input
                          label="Note Title"
                          type="text"
                          required
                          value={selectedNote.title}
                          onChange={(e) => handleFormChange('title', e.target.value)}
                        />
                      </div>

                      {/* Folder Name */}
                      <div>
                        <Input
                          label="Folder"
                          type="text"
                          required
                          icon={<Folder className="w-4 h-4 text-text-faint" />}
                          value={selectedNote.folder}
                          onChange={(e) => handleFormChange('folder', e.target.value)}
                        />
                      </div>

                      {/* Comma-separated tags */}
                      <div>
                        <Input
                          label="Tags (Comma Separated)"
                          type="text"
                          icon={<Tag className="w-4 h-4 text-text-faint" />}
                          placeholder="e.g. math, study, lecture"
                          value={selectedNote.tags}
                          onChange={(e) => handleFormChange('tags', e.target.value)}
                        />
                      </div>

                    </div>

                    {/* PDF Document Attachment Section */}
                    {!selectedNote.filePath ? (
                      <div className="border border-dashed border-border hover:border-primary/30 rounded-xl p-4 transition-colors flex items-center gap-4 bg-bg-elevated/10">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-xs font-semibold text-text">Attach PDF Notes Document</h4>
                          <p className="text-[10px] text-text-faint mt-0.5">Upload textbook chapters or lecture slides to read side-by-side.</p>
                        </div>
                        <div>
                          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-card hover:bg-bg-hover border border-border text-xs font-semibold text-text-secondary hover:text-text cursor-pointer transition-colors">
                            <Upload className="w-3.5 h-3.5" />
                            Choose PDF
                            <input
                              type="file"
                              accept=".pdf"
                              onChange={handlePdfUpload}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    ) : (
                      <div className="border border-border rounded-xl p-3 flex items-center justify-between bg-bg-elevated/20">
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 bg-red-500/10 text-red-400 rounded-lg">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-text truncate max-w-[200px] block">
                              {selectedNote.filePath.substring(selectedNote.filePath.lastIndexOf('_') + 1)}
                            </span>
                            <span className="text-[10px] text-text-faint block mt-0.5">PDF Attached</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setIsFullscreenPdf(true)}
                            className="p-1.5 text-text-faint hover:text-text hover:bg-bg-hover rounded-lg transition-colors cursor-pointer text-xs flex items-center gap-1"
                            title="Read in Fullscreen"
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                            Fullscreen
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowPdfViewer(prev => !prev)}
                            className="p-1.5 text-text-faint hover:text-text hover:bg-bg-hover rounded-lg transition-colors cursor-pointer text-xs flex items-center gap-1"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            {showPdfViewer ? 'Hide Reader' : 'Show Reader'}
                          </button>
                          <button
                            type="button"
                            onClick={handlePdfDelete}
                            className="p-1.5 text-text-faint hover:text-danger hover:bg-danger/10 rounded-lg transition-colors cursor-pointer"
                            title="Remove PDF"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Editor Textarea */}
                    <div className="flex-1 flex flex-col gap-1.5 mt-2 overflow-hidden">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-text-secondary">
                          Markdown Workspace
                        </label>
                        {selectedNote.filePath && (
                          <button
                            type="button"
                            onClick={() => setShowPdfViewer(prev => !prev)}
                            className="text-xs font-semibold text-primary hover:text-primary-light flex items-center gap-1 cursor-pointer"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            {showPdfViewer ? 'Hide PDF Reader' : 'Show PDF Reader'}
                          </button>
                        )}
                      </div>

                      <div className="flex-1 flex flex-col lg:flex-row gap-4 overflow-hidden min-h-[400px]">
                        {selectedNote.filePath && showPdfViewer && (
                          <div className="flex-1 rounded-xl border border-border bg-bg-elevated overflow-hidden flex flex-col min-h-[400px]">
                            <div className="px-3 py-1.5 bg-border/20 border-b border-border text-[10px] font-mono text-text-muted flex justify-between items-center">
                              <span>PDF Note Reader</span>
                              {loadingPdf && <span>Loading PDF...</span>}
                            </div>
                            <div className="flex-1 bg-gray-800">
                              {pdfUrl ? (
                                <iframe
                                  src={`${pdfUrl}#toolbar=0&navpanes=0`}
                                  className="w-full h-full border-none"
                                  title="PDF Note Document"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs text-text-faint p-4 text-center">
                                  {loadingPdf ? 'Loading PDF Document...' : 'Unable to load PDF document.'}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        <textarea
                          className={clsx(
                            'flex-1 p-4 rounded-xl border border-border bg-bg-input text-sm text-text font-mono resize-none focus:outline-none focus:ring-1 focus:ring-ring focus:border-primary',
                            'placeholder:text-text-faint h-full min-h-[400px]'
                          )}
                          placeholder="Write markdown here... e.g.
# Lecture notes
- [ ] Read Chapter 1
- [x] Attend sorting presentation
**Tip**: Use bold or list items!"
                          value={selectedNote.content}
                          onChange={(e) => handleFormChange('content', e.target.value)}
                        />
                      </div>
                    </div>

                  </div>
                ) : (
                  /* --- PREVIEW MODE --- */
                  <div className="flex flex-col gap-4 animate-fade-in">
                    
                    {/* Readonly info header */}
                    <div className="flex flex-wrap items-center gap-3 border-b border-border/40 pb-4 text-xs font-mono text-text-secondary">
                      <div className="flex items-center gap-1">
                        <Folder className="w-3.5 h-3.5 text-text-faint" />
                        <span>Folder: <strong className="text-text">{selectedNote.folder || 'General'}</strong></span>
                      </div>
                      
                      {selectedNote.tags && (
                        <div className="flex items-center gap-2 border-l border-border pl-3">
                          <Tag className="w-3.5 h-3.5 text-text-faint" />
                          <div className="flex gap-1.5">
                            {selectedNote.tags.split(',').map((t, idx) => (
                              <span key={idx} className="bg-border/40 text-text px-2 py-0.5 rounded-md text-[10px]">
                                {t.trim()}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-1 border-l border-border pl-3 text-text-faint">
                        <span>Updated: {selectedNote.updatedAt ? new Date(selectedNote.updatedAt).toLocaleTimeString() : 'Just now'}</span>
                      </div>
                    </div>

                    {/* PDF attachment indicator in Preview */}
                    {selectedNote.filePath && (
                      <div className="border border-border rounded-xl p-3 flex items-center justify-between bg-bg-elevated/20">
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 bg-red-500/10 text-red-400 rounded-lg">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-text truncate max-w-[200px] block">
                              {selectedNote.filePath.substring(selectedNote.filePath.lastIndexOf('_') + 1)}
                            </span>
                            <span className="text-[10px] text-text-faint block mt-0.5">PDF Attached</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setIsFullscreenPdf(true)}
                            className="px-3 py-1 rounded-lg border border-border hover:bg-bg-hover text-xs font-semibold text-text-secondary hover:text-text cursor-pointer transition-colors flex items-center gap-1.5"
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                            Fullscreen
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowPdfViewer(prev => !prev)}
                            className="px-3 py-1 rounded-lg border border-border hover:bg-bg-hover text-xs font-semibold text-text-secondary hover:text-text cursor-pointer transition-colors flex items-center gap-1.5"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            {showPdfViewer ? 'Hide Reader' : 'Open Reader'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Markdown rendering output container */}
                    <div className="flex flex-col lg:flex-row gap-6">
                      {selectedNote.filePath && showPdfViewer && (
                        <div className="flex-1 rounded-xl border border-border bg-bg-elevated overflow-hidden flex flex-col h-[500px] min-h-[500px]">
                          <div className="px-3 py-1.5 bg-border/20 border-b border-border text-[10px] font-mono text-text-muted flex justify-between items-center">
                            <span>PDF Note Reader</span>
                            {loadingPdf && <span>Loading PDF...</span>}
                          </div>
                          <div className="flex-1 bg-gray-800">
                            {pdfUrl ? (
                              <iframe
                                src={`${pdfUrl}#toolbar=0&navpanes=0`}
                                className="w-full h-full border-none"
                                title="PDF Note Document"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs text-text-faint p-4 text-center">
                                {loadingPdf ? 'Loading PDF Document...' : 'Unable to load PDF document.'}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex-1 py-2 overflow-y-auto">
                        <h1 className="text-2xl font-bold text-text mb-4 border-b border-border/45 pb-2">
                          {selectedNote.title || 'Untitled Note'}
                        </h1>
                        
                        <div
                          className="markdown-body select-text"
                          dangerouslySetInnerHTML={{ __html: renderMarkdown(selectedNote.content) }}
                        />
                      </div>
                    </div>

                  </div>
                )}

              </div>

            </div>
          ) : (
            <EmptyState
              icon={<StickyNote className="w-12 h-12" />}
              title="No note selected"
              description="Choose a note from the ledger sidebar, or click New Note to start writing documents."
            />
          )}
        </div>
      </div>

      {/* Fullscreen PDF Reader Overlay */}
      {isFullscreenPdf && pdfUrl && (
        <div className="fixed inset-0 bg-bg z-[99999] flex flex-col animate-[fade-in_0.2s_ease-out]">
          {/* Fullscreen Header */}
          <div className="bg-bg-card border-b border-border px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-red-500" />
              <div>
                <h3 className="text-sm font-bold text-text">
                  {selectedNote.title || 'Note PDF Document'}
                </h3>
                <p className="text-[10px] text-text-faint">
                  {selectedNote.filePath.substring(selectedNote.filePath.lastIndexOf('_') + 1)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowStudyCompanion((prev) => !prev)}
                className="flex items-center gap-1.5 px-4 py-2 bg-primary/10 hover:bg-primary/20 border border-primary/30 text-xs font-bold text-primary rounded-xl transition-colors cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                {showStudyCompanion ? 'Hide AI Partner' : 'AI Study Partner'}
              </button>
              <button
                type="button"
                onClick={() => setIsFullscreenPdf(false)}
                className="flex items-center gap-1.5 px-4 py-2 bg-bg-hover hover:bg-border border border-border text-xs font-semibold text-text rounded-xl transition-colors cursor-pointer"
              >
                <Minimize2 className="w-4 h-4" />
                Exit Fullscreen
              </button>
            </div>
          </div>
          {/* Fullscreen Viewer split container */}
          <div className="flex-1 flex overflow-hidden">
            {/* Left Frame: PDF */}
            <div className={clsx(
              "h-full bg-gray-900 transition-all duration-300",
              showStudyCompanion ? "w-[65%]" : "w-full"
            )}>
              <iframe
                src={pdfUrl}
                className="w-full h-full border-none"
                title="Fullscreen PDF Notes Reader"
              />
            </div>
            
            {/* Right Frame: Study Companion Panel */}
            {showStudyCompanion && (
              <div className="w-[35%] h-full">
                <StudyCompanion note={selectedNote} />
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default NotesPage;
