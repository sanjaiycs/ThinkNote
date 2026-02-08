import React, { useMemo } from 'react';
import { Book, Plus, Search, Tag, Settings, FileText, Trash2, Coffee } from 'lucide-react';
import useNoteStore from '../store/noteStore';
import Auth from './Auth';

const Sidebar = () => {
    const { notes, currentNoteId, selectNote, createNote } = useNoteStore();

    // Aggregate unique tags from all notes
    const allTags = useMemo(() => {
        const tags = new Set();
        notes.forEach(note => {
            if (note.tags) note.tags.forEach(t => tags.add(t));
        });
        return Array.from(tags).sort();
    }, [notes]);

    return (
        <div className="w-64 h-screen bg-[#1E1E20] border-r border-[#2D2D2F] flex flex-col flex-shrink-0">
            <div className="p-4 border-b border-[#2D2D2F] flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold shadow-indigo-500/20 shadow-lg">
                    T
                </div>
                <span className="font-semibold text-lg text-gray-100 tracking-tight">ThinkNote</span>
            </div>

            <div className="p-4">
                <button
                    onClick={createNote}
                    className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-white text-black py-2.5 px-4 rounded-full transition-all shadow-sm font-medium text-sm"
                >
                    <Plus size={18} />
                    <span>New Note</span>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto px-2 space-y-6">
                <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">Notebooks</h3>
                    <nav className="space-y-1">
                        {notes.map(note => (
                            <div key={note.id} className="group relative">
                                <button
                                    onClick={() => selectNote(note.id)}
                                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-full transition-all text-left text-sm pr-8 ${currentNoteId === note.id ? 'bg-[#2D2D2F] text-indigo-400' : 'text-gray-400 hover:bg-[#252528] hover:text-gray-200'}`}
                                >
                                    <FileText size={16} className={currentNoteId === note.id ? 'text-indigo-400' : 'text-gray-500'} />
                                    <span className="truncate">{note.title || 'Untitled'}</span>
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (window.confirm('Are you sure you want to delete this note?')) {
                                            const { deleteNote } = useNoteStore.getState();
                                            deleteNote(note.id);
                                        }
                                    }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                                    title="Delete Note"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                    </nav>
                </div>

                <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">Tags</h3>
                    <nav className="space-y-1">
                        {allTags.length > 0 ? allTags.map(tag => (
                            <button
                                key={tag}
                                className="w-full flex items-center gap-2 px-3 py-2 text-gray-400 hover:bg-[#252528] hover:text-gray-200 rounded-full text-left text-sm"
                            >
                                <Tag size={16} className="text-gray-600" />
                                <span>{tag}</span>
                            </button>
                        )) : (
                            <div className="px-3 py-2 text-xs text-gray-600 italic">No tags yet</div>
                        )}
                    </nav>
                </div>
            </div>

            <div className="border-t border-[#2D2D2F] flex flex-col">
                <a
                    href="https://buymeacoffee.com/sanjaiycsf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-4 text-sm font-medium text-yellow-500 hover:text-yellow-400 hover:bg-[#252528] transition-colors"
                >
                    <Coffee size={18} />
                    <span>Buy Me a Coffee</span>
                </a>
                <Auth />
            </div>
        </div>
    );
};

export default Sidebar;
