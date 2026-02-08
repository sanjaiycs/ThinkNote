import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Editor from './Editor';
import ChatPanel from './AIPanel'; // Renamed for clarity
import StudioPanel from './StudioPanel';
import FlashcardView from './FlashcardView';
import QuizView from './QuizView';
import { PanelRightOpen, PanelRightClose, Loader2 } from 'lucide-react';
import useNoteStore from '../store/noteStore';
import { generateFlashcards, generateQuiz } from '../lib/ai';

const Layout = () => {
    const { currentNoteId, notes } = useNoteStore();
    const currentNote = notes.find(n => n.id === currentNoteId);

    const [isStudioOpen, setIsStudioOpen] = useState(true);
    const [activeTool, setActiveTool] = useState(null); // 'chat', 'flashcards', 'quiz', 'summary', 'audio'
    const [isLoading, setIsLoading] = useState(false);
    const [flashcardsData, setFlashcardsData] = useState(null);
    const [quizData, setQuizData] = useState(null);

    const handleStudioAction = async (toolId) => {
        if (!currentNote) return;

        if (toolId === 'chat') {
            setActiveTool('chat');
            return;
        }

        if (toolId === 'flashcards') {
            setIsLoading(true);
            const data = await generateFlashcards(currentNote.content);
            setFlashcardsData(data);
            setIsLoading(false);
            if (data && data.length > 0) setActiveTool('flashcards');
            return;
        }

        if (toolId === 'quiz') {
            setIsLoading(true);
            const data = await generateQuiz(currentNote.content);
            setQuizData(data);
            setIsLoading(false);
            if (data && data.length > 0) setActiveTool('quiz');
            return;
        }

        // For Summary/Audio, we might just open Chat and trigger it, or handle separately.
        // For now, let's just log or implement later.
        console.log("Action implementation pending for:", toolId);
    };

    return (
        <div className="flex h-screen bg-[#131314] font-sans text-gray-100 overflow-hidden">
            <Sidebar />

            <div className="flex-1 flex flex-col relative h-full overflow-hidden">
                <main className="flex-1 overflow-y-auto relative flex">
                    {/* Center Column: Editor */}
                    <div className="flex-1 flex flex-col h-full relative z-0">
                        <div className="flex-1 flex flex-col h-full bg-[#131314]">
                            <Editor />
                        </div>

                        {isLoading && (
                            <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                                <div className="bg-[#1E1E20] px-6 py-4 rounded-xl border border-[#2D2D2F] flex items-center gap-3 shadow-2xl">
                                    <Loader2 size={24} className="animate-spin text-indigo-500" />
                                    <span className="text-gray-200 font-medium">Generating content...</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Studio Panel OR Chat Panel */}
                    {isStudioOpen && (
                        activeTool === 'chat' ? (
                            <ChatPanel isOpen={true} onClose={() => setActiveTool(null)} />
                        ) : (
                            <StudioPanel
                                isOpen={true}
                                onClose={() => setIsStudioOpen(false)}
                                onAction={handleStudioAction}
                            />
                        )
                    )}
                </main>

                {/* Studio Toggle if closed */}
                {!isStudioOpen && (
                    <button
                        onClick={() => setIsStudioOpen(true)}
                        className="absolute top-4 right-4 p-2.5 bg-[#1E1E20] border border-[#2D2D2F] rounded-full text-gray-400 hover:text-white hover:bg-[#252528] z-50 shadow-md transition-all"
                    >
                        <PanelRightOpen size={20} />
                    </button>
                )}
            </div>

            {/* Overlays */}
            {activeTool === 'flashcards' && flashcardsData && (
                <FlashcardView
                    cards={flashcardsData}
                    onClose={() => setActiveTool(null)}
                />
            )}

            {activeTool === 'quiz' && quizData && (
                <QuizView
                    quizData={quizData}
                    onClose={() => setActiveTool(null)}
                />
            )}
        </div>
    );
};

export default Layout;
