import React from 'react';
import { Sparkles, Layers, CheckSquare, PlayCircle, FileText, X, MessageSquare } from 'lucide-react';
import useNoteStore from '../store/noteStore';

const StudioPanel = ({ isOpen, onClose, onAction }) => {
    const { currentNoteId, notes } = useNoteStore();
    const currentNote = notes.find(n => n.id === currentNoteId);

    if (!isOpen) return null;

    const tools = [
        { id: 'summary', label: 'Summary', icon: FileText, color: 'text-blue-400', bg: 'bg-blue-400/10' },
        { id: 'audio', label: 'Audio Overview', icon: PlayCircle, color: 'text-green-400', bg: 'bg-green-400/10' },
        { id: 'flashcards', label: 'Flashcards', icon: Layers, color: 'text-purple-400', bg: 'bg-purple-400/10' },
        { id: 'quiz', label: 'Quiz', icon: CheckSquare, color: 'text-orange-400', bg: 'bg-orange-400/10' },
        { id: 'chat', label: 'Chat', icon: MessageSquare, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
    ];

    return (
        <div className="w-80 h-screen bg-[#1E1E20] border-l border-[#2D2D2F] flex flex-col shadow-xl absolute right-0 top-0 z-20 lg:relative lg:shadow-none lg:z-0 flex-shrink-0 text-gray-100">
            <div className="p-4 border-b border-[#2D2D2F] flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold text-gray-200">
                    <Sparkles size={18} className="text-gray-400" />
                    <span>Studio</span>
                </div>
                <button onClick={onClose} className="p-1 hover:bg-[#2D2D2F] rounded-full lg:hidden text-gray-400">
                    <X size={18} />
                </button>
            </div>

            <div className="p-4 overflow-y-auto">
                {!currentNote ? (
                    <div className="text-center text-gray-500 mt-10 text-sm">
                        <p>Select a source to use Studio tools.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                        {tools.map((tool) => (
                            <button
                                key={tool.id}
                                onClick={() => onAction(tool.id)}
                                className={`flex flex-col items-center justify-center p-4 rounded-2xl border border-[#2D2D2F] hover:bg-[#2D2D2F] transition-all aspect-square gap-3 group`}
                            >
                                <div className={`p-3 rounded-full ${tool.bg}`}>
                                    <tool.icon size={24} className={tool.color} />
                                </div>
                                <span className="text-sm font-medium text-gray-300 group-hover:text-white">{tool.label}</span>
                            </button>
                        ))}
                    </div>
                )}

                <div className="mt-8">
                    <div className="p-4 rounded-2xl bg-[#252528] border border-[#2D2D2F]">
                        <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                            <Sparkles size={14} className="text-indigo-400" />
                            Suggested
                        </h4>
                        <p className="text-xs text-gray-500">
                            Create a Deep Dive of this note to explore connected topics.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudioPanel;
