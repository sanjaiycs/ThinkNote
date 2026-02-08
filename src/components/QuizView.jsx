import React, { useState } from 'react';
import { X, CheckCircle, XCircle, ArrowRight, RefreshCw } from 'lucide-react';

const QuizView = ({ quizData, onClose }) => {
    // quizData expected to be array of { question, options: [], answer }
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [showScore, setShowScore] = useState(false);

    if (!quizData || quizData.length === 0) return null;

    const currentQuestion = quizData[currentQuestionIndex];

    const handleOptionSelect = (option) => {
        if (isAnswered) return;
        setSelectedOption(option);
        setIsAnswered(true);

        const correct = option === currentQuestion.answer;
        if (correct) {
            setScore(prev => prev + 1);
        }
    };

    const handleNext = () => {
        if (currentQuestionIndex < quizData.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedOption(null);
            setIsAnswered(false);
        } else {
            setShowScore(true);
        }
    };

    const restartQuiz = () => {
        setCurrentQuestionIndex(0);
        setSelectedOption(null);
        setIsAnswered(false);
        setScore(0);
        setShowScore(false);
    };

    if (showScore) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <div className="bg-[#1E1E20] w-full max-w-lg rounded-3xl border border-[#2D2D2F] flex flex-col items-center p-12 shadow-2xl text-center">
                    <div className="w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle size={40} className="text-indigo-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-100 mb-2">Quiz Completed!</h2>
                    <p className="text-gray-400 mb-8">You scored <span className="text-indigo-400 font-bold text-xl">{score}</span> out of <span className="text-gray-100 font-bold text-xl">{quizData.length}</span></p>

                    <div className="flex gap-4 w-full">
                        <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-[#2D2D2F] text-gray-300 hover:bg-[#2D2D2F] hover:text-white transition-colors">
                            Close
                        </button>
                        <button onClick={restartQuiz} className="flex-1 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition-colors font-medium">
                            Restart Quiz
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#1E1E20] w-full max-w-2xl rounded-3xl border border-[#2D2D2F] flex flex-col shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-[#2D2D2F] flex items-center justify-between bg-[#1E1E20]">
                    <h2 className="text-lg font-medium text-gray-100">Test Your Knowledge</h2>
                    <button onClick={onClose} className="p-2 hover:bg-[#2D2D2F] rounded-full text-gray-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Progress */}
                <div className="px-8 pt-8">
                    <div className="flex justify-between text-xs font-mono text-gray-500 mb-2">
                        <span>QUESTION {currentQuestionIndex + 1} OF {quizData.length}</span>
                        <span>SCORE: {score}</span>
                    </div>
                    <div className="h-1 bg-[#2D2D2F] w-full rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${((currentQuestionIndex + 1) / quizData.length) * 100}%` }}></div>
                    </div>
                </div>

                {/* Question Area */}
                <div className="p-8">
                    <h3 className="text-xl md:text-2xl font-semibold text-gray-100 mb-8 leading-snug">
                        {currentQuestion.question}
                    </h3>

                    <div className="space-y-3">
                        {currentQuestion.options.map((option, idx) => {
                            let stateClass = "border-[#3C3C3E] hover:border-gray-500 hover:bg-[#252528] text-gray-300";

                            if (isAnswered) {
                                if (option === currentQuestion.answer) {
                                    stateClass = "border-green-500/50 bg-green-500/10 text-green-300";
                                } else if (option === selectedOption) {
                                    stateClass = "border-red-500/50 bg-red-500/10 text-red-300";
                                } else {
                                    stateClass = "border-[#2D2D2F] opacity-50";
                                }
                            } else if (selectedOption === option) {
                                stateClass = "border-indigo-500 bg-indigo-500/10 text-white";
                            }

                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleOptionSelect(option)}
                                    disabled={isAnswered}
                                    className={`w-full p-4 rounded-xl border text-left transition-all duration-200 flex items-center justify-between group ${stateClass}`}
                                >
                                    <span className="font-medium text-sm md:text-base">{option}</span>
                                    {isAnswered && option === currentQuestion.answer && <CheckCircle size={20} className="text-green-500" />}
                                    {isAnswered && option === selectedOption && option !== currentQuestion.answer && <XCircle size={20} className="text-red-500" />}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-[#2D2D2F] bg-[#131314] flex justify-end min-h-[88px]">
                    {isAnswered && (
                        <button
                            onClick={handleNext}
                            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-colors shadow-lg shadow-indigo-600/20 animate-in fade-in slide-in-from-bottom-2"
                        >
                            {currentQuestionIndex < quizData.length - 1 ? 'Next Question' : 'View Results'}
                            <ArrowRight size={18} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuizView;
