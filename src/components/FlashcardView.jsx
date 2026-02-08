import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, RotateCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const FlashcardView = ({ cards, onClose, onBack }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    if (!cards || cards.length === 0) return null;

    const handleNext = (e) => {
        e?.stopPropagation();
        if (currentIndex < cards.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setIsFlipped(false);
        }
    };

    const handlePrev = (e) => {
        e?.stopPropagation();
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
            setIsFlipped(false);
        }
    };

    const handleFlip = (e) => {
        e?.stopPropagation();
        setIsFlipped(!isFlipped);
    };

    const progress = ((currentIndex + 1) / cards.length) * 100;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="bg-[#1E1E20] w-full max-w-3xl h-[600px] rounded-3xl border border-[#2D2D2F] flex flex-col shadow-2xl overflow-hidden relative" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="p-6 border-b border-[#2D2D2F] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={onClose} className="p-2 hover:bg-[#2D2D2F] rounded-full text-gray-400 hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                        <h2 className="text-lg font-medium text-gray-100">Flashcards</h2>
                    </div>
                    <div className="text-sm font-mono text-gray-400">
                        {currentIndex + 1} / {cards.length}
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="h-1 bg-[#2D2D2F] w-full">
                    <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
                </div>

                {/* Card Container */}
                <div className="flex-1 flex items-center justify-center p-8 bg-[#131314]">
                    <div
                        onClick={handleFlip}
                        className="w-full h-full max-w-2xl perspective-1000 cursor-pointer group"
                    >
                        <div className={`relative w-full h-full transition-all duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                            {/* Front */}
                            <div className="absolute inset-0 backface-hidden bg-[#1E1E20] border border-[#2D2D2F] rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-lg group-hover:border-[#3C3C3E] transition-colors">
                                <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-6">Question</span>
                                <div className="text-2xl md:text-3xl font-medium text-gray-100 leading-relaxed overflow-y-auto max-h-full custom-scrollbar">
                                    {cards[currentIndex].front}
                                </div>
                                <div className="mt-8 text-xs text-gray-500 flex items-center gap-2">
                                    <RotateCw size={12} /> Click to flip
                                </div>
                            </div>

                            {/* Back */}
                            <div className="absolute inset-0 backface-hidden rotate-y-180 bg-[#1E1E20] border border-[#2D2D2F] rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-lg">
                                <span className="text-xs font-bold text-green-400 uppercase tracking-widest mb-6">Answer</span>
                                <div className="text-xl md:text-2xl text-gray-200 leading-relaxed overflow-y-auto max-h-full custom-scrollbar prose prose-invert">
                                    <ReactMarkdown>{cards[currentIndex].back}</ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="p-6 border-t border-[#2D2D2F] flex items-center justify-center gap-6 bg-[#1E1E20]">
                    <button
                        onClick={handlePrev}
                        disabled={currentIndex === 0}
                        className="p-4 rounded-full bg-[#131314] border border-[#2D2D2F] text-gray-400 hover:text-white hover:border-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        <ChevronLeft size={24} />
                    </button>

                    <button
                        onClick={handleFlip}
                        className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-medium transition-colors shadow-lg shadow-indigo-600/20"
                    >
                        {isFlipped ? 'Show Question' : 'Reveal Answer'}
                    </button>

                    <button
                        onClick={handleNext}
                        disabled={currentIndex === cards.length - 1}
                        className="p-4 rounded-full bg-[#131314] border border-[#2D2D2F] text-gray-400 hover:text-white hover:border-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FlashcardView;
