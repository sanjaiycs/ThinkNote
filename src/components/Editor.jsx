import React, { useState } from 'react';
import { Bold, Italic, List, ListOrdered, Link, Image, Eye, EyeOff, Tag, X, Plus, ExternalLink, Download, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import useNoteStore from '../store/noteStore';
import PDFUploader from './PDFUploader';

const Editor = () => {
    const { notes, currentNoteId, updateNote } = useNoteStore();
    const currentNote = notes.find((n) => n.id === currentNoteId);
    const [isPreview, setIsPreview] = useState(false);
    const [newTag, setNewTag] = useState('');
    const [isTagInputOpen, setIsTagInputOpen] = useState(false);
    const [newSource, setNewSource] = useState('');
    const [isSourceInputOpen, setIsSourceInputOpen] = useState(false);

    if (!currentNote) {
        return (
            <div className="flex-1 h-screen flex items-center justify-center bg-[#131314] text-gray-500">
                <p className="text-gray-600 bg-[#1E1E20] px-6 py-4 rounded-xl border border-[#2D2D2F]">Select or create a note to start writing.</p>
            </div>
        );
    }

    const handleTitleChange = (e) => {
        updateNote(currentNoteId, { title: e.target.value });
    };

    const handleContentChange = (e) => {
        updateNote(currentNoteId, { content: e.target.value });
    };

    // Tags Management
    const addTag = (e) => {
        if (e.key === 'Enter' && newTag.trim()) {
            const uniqueTags = [...new Set([...(currentNote.tags || []), newTag.trim()])];
            updateNote(currentNoteId, { tags: uniqueTags });
            setNewTag('');
        }
    };

    const removeTag = (tagToRemove) => {
        const updatedTags = (currentNote.tags || []).filter(t => t !== tagToRemove);
        updateNote(currentNoteId, { tags: updatedTags });
    };

    // Sources Management
    const addSource = (e) => {
        if (e.key === 'Enter' && newSource.trim()) {
            const uniqueSources = [...new Set([...(currentNote.sources || []), newSource.trim()])];
            updateNote(currentNoteId, { sources: uniqueSources });
            setNewSource('');
        }
    };

    const removeSource = (sourceToRemove) => {
        const updatedSources = (currentNote.sources || []).filter(s => s !== sourceToRemove);
        updateNote(currentNoteId, { sources: updatedSources });
    };

    // PDF Handling
    const handlePDFText = (text, filename) => {
        const newContent = text; // Replace content entirely for PDF-first workflow
        const newAttachments = [...(currentNote.attachments || []), { name: filename, type: 'pdf', uploadedAt: new Date().toISOString() }];

        // Auto-generate title from filename if untitled
        const newTitle = currentNote.title === 'Untitled Note' || !currentNote.title ? filename.replace('.pdf', '') : currentNote.title;

        updateNote(currentNoteId, { content: newContent, attachments: newAttachments, title: newTitle });
    };

    const hasContent = currentNote.content && currentNote.content.trim().length > 0;

    // Export Functionality
    const exportNote = (format) => {
        if (!currentNote) return;
        if (format === 'pdf') {
            window.print();
            return;
        }
        const filename = `${currentNote.title || 'Untitled'}.${format}`;
        let content = currentNote.content;
        let mimeType = 'text/plain';

        if (format === 'md') {
            mimeType = 'text/markdown';
        }

        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="flex-1 h-screen flex flex-col bg-[#131314]">
            {/* Editor Header Section containing Title, Tags, Sources */}
            <div className="border-b border-[#2D2D2F] flex flex-col shrink-0 bg-[#131314] z-10 sticky top-0">
                {/* Title Bar */}
                <div className="h-16 flex items-center px-6 justify-between">
                    <div className="flex items-center gap-4 flex-1">
                        <input
                            value={currentNote.title}
                            onChange={handleTitleChange}
                            className="text-2xl font-bold text-gray-100 outline-none bg-transparent w-full placeholder-gray-600"
                            placeholder="Untitled Notebook"
                        />
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                        <span className="text-xs text-gray-500 mr-2 font-mono">
                            Last edited {new Date(currentNote.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                </div>

                {/* Metadata Bar (Tags & Sources) */}
                <div className="px-6 pb-4 flex flex-col gap-4">
                    <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between">
                        <div className="flex-1 flex flex-col gap-3">
                            {/* Tags */}
                            <div className="flex items-center gap-2 flex-wrap">
                                <Tag size={16} className="text-gray-500" />
                                {currentNote.tags && currentNote.tags.length > 0 ? (
                                    currentNote.tags.map((tag, idx) => (
                                        <span key={idx} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#2D2D2F] text-indigo-300 border border-[#3C3C3E]">
                                            {tag}
                                            <button onClick={() => removeTag(tag)} className="ml-1.5 hover:text-white transition-colors"><X size={12} /></button>
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-sm text-gray-600 italic">No tags</span>
                                )}

                                {isTagInputOpen ? (
                                    <input
                                        type="text"
                                        value={newTag}
                                        onChange={(e) => setNewTag(e.target.value)}
                                        onKeyDown={addTag}
                                        className="text-xs bg-[#1E1E20] text-gray-200 border border-[#3C3C3E] rounded px-2 py-1 w-32 focus:outline-none focus:border-indigo-500 placeholder-gray-600"
                                        placeholder="Add tag..."
                                        autoFocus
                                        onBlur={() => { if (!newTag) setIsTagInputOpen(false) }}
                                    />
                                ) : (
                                    <button
                                        onClick={() => setIsTagInputOpen(true)}
                                        className="p-1 rounded-full hover:bg-[#2D2D2F] text-gray-500 hover:text-indigo-400 transition-colors"
                                        title="Add Tag"
                                    >
                                        <Plus size={16} />
                                    </button>
                                )}
                            </div>

                            {/* Sources */}
                            <div className="flex items-center gap-2 flex-wrap">
                                <ExternalLink size={16} className="text-gray-500" />
                                {currentNote.sources && currentNote.sources.length > 0 ? (
                                    currentNote.sources.map((source, idx) => (
                                        <span key={idx} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#2D2D2F] text-gray-300 border border-[#3C3C3E]">
                                            <a href={source} target="_blank" rel="noreferrer" className="hover:text-white hover:underline max-w-[200px] truncate block">{source}</a>
                                            <button onClick={() => removeSource(source)} className="ml-1.5 hover:text-white transition-colors"><X size={12} /></button>
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-sm text-gray-600 italic">No sources linked</span>
                                )}

                                {isSourceInputOpen ? (
                                    <input
                                        type="text"
                                        value={newSource}
                                        onChange={(e) => setNewSource(e.target.value)}
                                        onKeyDown={addSource}
                                        className="text-xs bg-[#1E1E20] text-gray-200 border border-[#3C3C3E] rounded px-2 py-1 w-64 focus:outline-none focus:border-indigo-500 placeholder-gray-600"
                                        placeholder="Paste URL..."
                                        autoFocus
                                        onBlur={() => { if (!newSource) setIsSourceInputOpen(false) }}
                                    />
                                ) : (
                                    <button
                                        onClick={() => setIsSourceInputOpen(true)}
                                        className="p-1 rounded-full hover:bg-[#2D2D2F] text-gray-500 hover:text-green-400 transition-colors"
                                        title="Add Source URL"
                                    >
                                        <Plus size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Toolbar - Only show if content exists */}
            {hasContent && (
                <div className="h-12 border-b border-[#2D2D2F] flex items-center px-4 gap-1 bg-[#1E1E20] shrink-0 sticky top-[header-height] z-10 transition-all">
                    <button className="p-2 hover:bg-[#2D2D2F] rounded text-gray-400 hover:text-gray-100 transition-colors" title="Bold"><Bold size={18} /></button>
                    <button className="p-2 hover:bg-[#2D2D2F] rounded text-gray-400 hover:text-gray-100 transition-colors" title="Italic"><Italic size={18} /></button>
                    <div className="w-px h-5 bg-[#3C3C3E] mx-2"></div>
                    <button className="p-2 hover:bg-[#2D2D2F] rounded text-gray-400 hover:text-gray-100 transition-colors" title="List"><List size={18} /></button>
                    <button className="p-2 hover:bg-[#2D2D2F] rounded text-gray-400 hover:text-gray-100 transition-colors" title="Numbered List"><ListOrdered size={18} /></button>
                    <div className="w-px h-5 bg-[#3C3C3E] mx-2"></div>
                    <div className="flex-1"></div>

                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 mr-4 text-xs text-gray-500">
                            <FileText size={14} />
                            <span>{currentNote.attachments?.length || 0} Source(s)</span>
                        </div>
                        <button
                            onClick={() => exportNote('md')}
                            className="p-2 hover:bg-[#2D2D2F] rounded text-gray-400 hover:text-gray-100 flex items-center gap-2 text-xs font-medium transition-colors"
                            title="Export as Markdown"
                        >
                            <Download size={16} />
                        </button>
                        <button
                            onClick={() => exportNote('pdf')}
                            className="p-2 hover:bg-[#2D2D2F] rounded text-gray-400 hover:text-gray-100 flex items-center gap-2 text-xs font-medium transition-colors"
                            title="Export as PDF"
                        >
                            <Download size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* Editor Content Area */}
            <div className="flex-1 overflow-y-auto relative">
                {!hasContent ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in-95 duration-300">
                        <div className="bg-[#1E1E20] border border-[#2D2D2F] p-8 md:p-12 rounded-3xl max-w-xl w-full shadow-2xl flex flex-col items-center gap-6">
                            <div className="w-20 h-20 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-2 border border-indigo-500/20 shadow-lg shadow-indigo-500/10">
                                <FileText className="text-indigo-400" size={40} />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold text-gray-100">Upload a Source</h2>
                                <p className="text-gray-400">
                                    To get started, upload a PDF document. NotebookLM Clone will analyze it and help you create summaries, flashcards, and quizzes.
                                </p>
                            </div>

                            <div className="w-full">
                                <PDFUploader onTextExtracted={handlePDFText} />
                            </div>

                            <p className="text-xs text-gray-600 mt-4">
                                Supported formats: PDF • Max size: 10MB
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="max-w-4xl mx-auto w-full h-full p-8 md:p-12 pb-32">
                        <div className="prose prose-invert prose-lg max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {currentNote.content}
                            </ReactMarkdown>
                        </div>
                        {/* Fallback editing area if needed, but primary interaction is reading the extraction */}
                        <div className="mt-12 pt-8 border-t border-[#2D2D2F]">
                            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Original Text / Notes</h4>
                            <textarea
                                value={currentNote.content}
                                onChange={handleContentChange}
                                className="w-full h-[500px] resize-none outline-none text-base leading-relaxed text-gray-400 bg-[#1E1E20] p-6 rounded-xl font-mono border border-[#2D2D2F] focus:border-indigo-500/50 transition-colors"
                                placeholder="Add your own notes here..."
                                spellCheck="false"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Editor;
