import React, { useState, useRef, useEffect } from 'react'; // Added React import
import { Sparkles, MessageSquare, Mic, X, Send, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import useNoteStore from '../store/noteStore';
import { summarizeNote, extractKeyPoints, suggestImprovements, chatWithNote, isAIConfigured, generateTags } from '../lib/ollama';
// import Generators from './Generators';

const AIPanel = ({ isOpen, onClose }) => {
    const { notes, currentNoteId, updateNote } = useNoteStore();
    const currentNote = notes.find((n) => n.id === currentNoteId);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const [apiKeyMissing, setApiKeyMissing] = useState(false);

    useEffect(() => {
        try {
            setApiKeyMissing(!isAIConfigured());
        } catch (e) {
            console.error("Error checking AI configuration:", e);
        }
    }, []);

    useEffect(() => {
        if (currentNote) {
            // Reset chat when note changes
            setMessages([{ role: 'model', content: `Hello! I'm ready to help you with **${currentNote.title}**.` }]);
        } else {
            setMessages([]);
        }
    }, [currentNoteId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    if (!isOpen) return null;

    const handleAction = async (actionType) => {
        if (!currentNote) return;
        // Ollama usually requires no API key, or we assume it's configured.

        setIsLoading(true);
        let result = '';

        // Add a temporary user message or system status to show what we are doing
        const actionLabels = {
            summarize: "Summarize this note",
            keypoints: "Extract key points",
            suggestions: "Suggest improvements",
            tags: "Generate tags"
        };

        setMessages(prev => [...prev, { role: 'user', content: actionLabels[actionType] }]);

        try {
            if (actionType === 'summarize') {
                result = await summarizeNote(currentNote.content);
            } else if (actionType === 'keypoints') {
                result = await extractKeyPoints(currentNote.content);
            } else if (actionType === 'suggestions') {
                result = await suggestImprovements(currentNote.content);
            } else if (actionType === 'tags') {
                const tags = await generateTags(currentNote.content);
                // Display tags in chat and add to note
                // Ensure unique tags
                const uniqueTags = [...new Set([...(currentNote.tags || []), ...tags])];
                updateNote(currentNoteId, { tags: uniqueTags });
                result = `I've generated and added the following tags to your note:\n\n${tags.map(t => `\`${t}\``).join(' ')}`;
            }

            setMessages(prev => [...prev, { role: 'model', content: result }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'model', content: "Sorry, I encountered an error. Please check your API key and try again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputValue.trim() || !currentNote) return;

        const userMsg = inputValue;
        setInputValue('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsLoading(true);

        try {
            // Filter history to only include model and user roles for the API
            const historyForApi = messages.map(m => ({ role: m.role, content: m.content }));
            const response = await chatWithNote(currentNote.content, historyForApi, userMsg);
            setMessages(prev => [...prev, { role: 'model', content: response }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'model', content: "Sorry, I encountered an error processing your request." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-80 h-full bg-[#1E1E20] border-l border-[#2D2D2F] flex flex-col shadow-xl absolute right-0 top-0 z-20 lg:relative lg:shadow-none lg:z-0 flex-shrink-0">
            <div className="p-4 border-b border-[#2D2D2F] flex items-center justify-between bg-[#1E1E20]">
                <div className="flex items-center gap-2 text-indigo-400 font-semibold">
                    <Sparkles size={18} />
                    <span>AI Chat</span>
                </div>
                <button onClick={onClose} className="p-1 hover:bg-[#2D2D2F] rounded-full text-gray-400 hover:text-white transition-colors">
                    <X size={18} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto pt-4 px-4 space-y-4 custom-scrollbar">
                {!currentNote ? (
                    <div className="text-center text-gray-500 mt-10">
                        <p>Select a note to start chatting.</p>
                    </div>
                ) : (
                    <>
                        {/* Quick Actions - styled for dark mode */}
                        <div className="bg-[#252528] p-3 rounded-xl border border-[#2D2D2F] shrink-0">
                            <p className="text-xs text-gray-400 mb-3 font-medium uppercase tracking-wider">Quick Prompts</p>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => handleAction('summarize')}
                                    disabled={isLoading}
                                    className="text-xs bg-[#2D2D2F] text-indigo-300 px-3 py-1.5 rounded-lg hover:bg-[#3C3C3E] border border-[#3C3C3E] transition-colors disabled:opacity-50"
                                >
                                    Summarize
                                </button>
                                <button
                                    onClick={() => handleAction('keypoints')}
                                    disabled={isLoading}
                                    className="text-xs bg-[#2D2D2F] text-green-300 px-3 py-1.5 rounded-lg hover:bg-[#3C3C3E] border border-[#3C3C3E] transition-colors disabled:opacity-50"
                                >
                                    Key Points
                                </button>
                                <button
                                    onClick={() => handleAction('suggestions')}
                                    disabled={isLoading}
                                    className="text-xs bg-[#2D2D2F] text-orange-300 px-3 py-1.5 rounded-lg hover:bg-[#3C3C3E] border border-[#3C3C3E] transition-colors disabled:opacity-50"
                                >
                                    Critique
                                </button>
                                <button
                                    onClick={() => handleAction('tags')}
                                    disabled={isLoading}
                                    className="text-xs bg-[#2D2D2F] text-blue-300 px-3 py-1.5 rounded-lg hover:bg-[#3C3C3E] border border-[#3C3C3E] transition-colors disabled:opacity-50"
                                >
                                    Auto Tag
                                </button>
                            </div>
                        </div>

                        {/* Generators removed - moved to Studio Panel */}

                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-[#2D2D2F]' : 'bg-indigo-500/20'}`}>
                                    {msg.role === 'user' ? <span className="text-xs font-bold text-gray-400">U</span> : <Sparkles size={14} className="text-indigo-400" />}
                                </div>
                                <div className={`p-3 rounded-2xl text-sm overflow-hidden ${msg.role === 'user'
                                    ? 'bg-[#2D2D2F] text-gray-200 rounded-tr-none border border-[#3C3C3E]'
                                    : 'bg-transparent text-gray-300 rounded-tl-none border border-[#2D2D2F] prose prose-invert prose-sm max-w-none'
                                    }`}>
                                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex gap-3">
                                <div className="w-8 h-8 bg-indigo-500/10 rounded-full flex-shrink-0 flex items-center justify-center">
                                    <Sparkles size={14} className="text-indigo-400" />
                                </div>
                                <div className="bg-[#1E1E20] p-3 rounded-2xl rounded-tl-none border border-[#2D2D2F] shadow-sm">
                                    <Loader2 size={16} className="animate-spin text-indigo-400" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            <div className="p-4 bg-[#1E1E20] border-t border-[#2D2D2F]">
                <form onSubmit={handleSendMessage} className="relative">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Ask anything..."
                        className="w-full pl-4 pr-10 py-3 bg-[#131314] border border-[#2D2D2F] rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-gray-200 placeholder-gray-600 disabled:opacity-50"
                        disabled={!currentNote || isLoading}
                    />
                    <button
                        type="submit"
                        disabled={!inputValue.trim() || isLoading}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-indigo-400 transition-colors disabled:text-gray-700"
                    >
                        {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AIPanel;
