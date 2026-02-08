import React, { useState } from 'react';
import { Loader2, PlayCircle, Layers, CheckSquare } from 'lucide-react';
import { generateFlashcards, generateQuiz } from '../lib/ollama';
import useNoteStore from '../store/noteStore';

const Generators = () => {
    const { notes, currentNoteId } = useNoteStore();
    const currentNote = notes.find(n => n.id === currentNoteId);

    const [loading, setLoading] = useState(null);
    const [generatedContent, setGeneratedContent] = useState(null); // { type: 'flashcards' | 'quiz', data: any }
    const [showOverview, setShowOverview] = useState(false); // Placeholder for Audio Overview

    if (!currentNote) return null;

    const handleGenerate = async (type) => {
        setLoading(type);
        setGeneratedContent(null);
        try {
            if (type === 'flashcards') {
                const data = await generateFlashcards(currentNote.content);
                setGeneratedContent({ type: 'flashcards', data });
            } else if (type === 'quiz') {
                const data = await generateQuiz(currentNote.content);
                setGeneratedContent({ type: 'quiz', data });
            } else if (type === 'audio') {
                // Mock Audio Generation for now or use Web Speech API
                const utterance = new SpeechSynthesisUtterance("This is an audio overview of your note. " + currentNote.content.substring(0, 100) + "...");
                window.speechSynthesis.speak(utterance);
                setShowOverview(true);
            }
        } catch (e) {
            console.error(e);
            alert("Generation failed");
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="flex flex-col gap-4 p-4 border-t border-gray-100 bg-gray-50/50">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Generate</h3>
            <div className="flex gap-2">
                <button
                    onClick={() => handleGenerate('flashcards')}
                    disabled={!!loading}
                    className="flex-1 flex flex-col items-center justify-center p-3 bg-white border border-gray-200 rounded-lg hover:border-indigo-400 hover:shadow-sm transition-all"
                >
                    {loading === 'flashcards' ? <Loader2 size={18} className="animate-spin text-indigo-600" /> : <Layers size={18} className="text-indigo-600 mb-1" />}
                    <span className="text-xs font-medium text-gray-700">Flashcards</span>
                </button>
                <button
                    onClick={() => handleGenerate('quiz')}
                    disabled={!!loading}
                    className="flex-1 flex flex-col items-center justify-center p-3 bg-white border border-gray-200 rounded-lg hover:border-indigo-400 hover:shadow-sm transition-all"
                >
                    {loading === 'quiz' ? <Loader2 size={18} className="animate-spin text-indigo-600" /> : <CheckSquare size={18} className="text-indigo-600 mb-1" />}
                    <span className="text-xs font-medium text-gray-700">Quiz</span>
                </button>
                <button
                    onClick={() => handleGenerate('audio')}
                    disabled={!!loading}
                    className="flex-1 flex flex-col items-center justify-center p-3 bg-white border border-gray-200 rounded-lg hover:border-indigo-400 hover:shadow-sm transition-all"
                >
                    <PlayCircle size={18} className="text-indigo-600 mb-1" />
                    <span className="text-xs font-medium text-gray-700">Audio Preview</span>
                </button>
            </div>

            {/* Display Results */}
            {generatedContent && (
                <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm mt-2 max-h-60 overflow-y-auto">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-gray-800 capitalize">{generatedContent.type}</h4>
                        <button onClick={() => setGeneratedContent(null)} className="text-xs text-gray-400 hover:text-gray-600">Close</button>
                    </div>

                    {generatedContent.type === 'flashcards' && (
                        <div className="space-y-2">
                            {generatedContent.data.map((card, idx) => (
                                <div key={idx} className="p-2 border border-blue-100 bg-blue-50/50 rounded text-sm">
                                    <p className="font-semibold text-gray-800 mb-1">Q: {card.front}</p>
                                    <p className="text-gray-600">A: {card.back}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {generatedContent.type === 'quiz' && (
                        <div className="space-y-3">
                            {generatedContent.data.map((q, idx) => (
                                <div key={idx} className="text-sm">
                                    <p className="font-medium text-gray-900 mb-1">{idx + 1}. {q.question}</p>
                                    <ul className="pl-2 space-y-1">
                                        {q.options.map((opt) => (
                                            <li key={opt} className={`px-2 py-1 rounded ${opt === q.answer ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>{opt}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Generators;
