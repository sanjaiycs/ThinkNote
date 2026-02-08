import React, { useState, useEffect } from 'react';
import { X, Save, RotateCcw, Check, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import useSettingsStore from '../store/settingsStore';

const SettingsModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const { provider, apiKey, ollamaUrl, model, setProvider, setApiKey, setOllamaUrl, setModel } = useSettingsStore();

    // Local state for form handling before saving (optional, but direct store update is finer for this simple app)
    // We'll use the store directly for simplicity, but maybe add a "Test" state.
    const [isTesting, setIsTesting] = useState(false);
    const [testStatus, setTestStatus] = useState(null); // 'success', 'error', null
    const [testMessage, setTestMessage] = useState('');
    const [ollamaModels, setOllamaModels] = useState([]);
    const [isLoadingModels, setIsLoadingModels] = useState(false);

    // Reset test status when settings change
    useEffect(() => {
        setTestStatus(null);
        setTestMessage('');
    }, [provider, apiKey, ollamaUrl, model]);

    // Fetch Ollama models when provider is ollama and url is valid
    useEffect(() => {
        if (provider === 'ollama' && ollamaUrl) {
            fetchOllamaModels();
        }
    }, [provider, ollamaUrl]);

    const fetchOllamaModels = async () => {
        setIsLoadingModels(true);
        try {
            const res = await fetch(`${ollamaUrl}/api/tags`);
            if (res.ok) {
                const data = await res.json();
                setOllamaModels(data.models || []);
            }
        } catch (e) {
            console.error("Failed to fetch Ollama models", e);
            setOllamaModels([]);
        } finally {
            setIsLoadingModels(false);
        }
    };

    const handleTestConnection = async () => {
        setIsTesting(true);
        setTestStatus(null);
        setTestMessage('');

        try {
            if (provider === 'ollama') {
                try {
                    const res = await fetch(`${ollamaUrl}/api/tags`);
                    if (res.ok) {
                        setTestStatus('success');
                        setTestMessage('Successfully connected to Ollama!');
                        // Update models list while we are at it
                        const data = await res.json();
                        setOllamaModels(data.models || []);
                    } else {
                        throw new Error('Failed to connect');
                    }
                } catch (e) {
                    throw new Error('Could not reach Ollama. Check if it is running.');
                }
            } else if (provider === 'gemini') {
                if (!apiKey) {
                    throw new Error('API Key is required for Google Gemini');
                }
                // Simple basic validation check (we can't easily "ping" without making a generation request, 
                // but we can check if it looks like a key)
                if (apiKey.startsWith('AIza')) {
                    setTestStatus('success');
                    setTestMessage('API Key format looks correct.');
                } else {
                    setTestStatus('warning');
                    setTestMessage('API Key format looks unusual, but might work.');
                }
                // Real verification would happen on first generate call
            }
        } catch (error) {
            setTestStatus('error');
            setTestMessage(error.message);
        } finally {
            setIsTesting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#1E1E20] border border-[#2D2D2F] w-full max-w-md rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between p-6 border-b border-[#2D2D2F]">
                    <h2 className="text-xl font-bold text-gray-100">AI Settings</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
                    {/* Provider Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">AI Provider</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => { setProvider('gemini'); setModel('gemini-1.5-flash'); }}
                                className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all ${provider === 'gemini'
                                    ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400'
                                    : 'bg-[#252528] border-[#2D2D2F] text-gray-400 hover:border-gray-600'
                                    }`}
                            >
                                Google Gemini
                            </button>
                            <button
                                onClick={() => { setProvider('ollama'); setModel(''); }}
                                className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all ${provider === 'ollama'
                                    ? 'bg-orange-500/10 border-orange-500 text-orange-400'
                                    : 'bg-[#252528] border-[#2D2D2F] text-gray-400 hover:border-gray-600'
                                    }`}
                            >
                                Ollama (Local)
                            </button>
                        </div>
                    </div>

                    {/* Gemini Settings */}
                    {provider === 'gemini' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">API Key</label>
                                <input
                                    type="password"
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    placeholder="Enter your Gemini API Key"
                                    className="w-full px-4 py-2.5 bg-[#131314] border border-[#2D2D2F] rounded-lg focus:outline-none focus:border-indigo-500 text-gray-200 placeholder-gray-600 text-sm"
                                />
                                <p className="text-xs text-gray-500">
                                    Get your key from <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">Google AI Studio</a>.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Model</label>
                                <div className="relative">
                                    <select
                                        value={model}
                                        onChange={(e) => setModel(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-[#131314] border border-[#2D2D2F] rounded-lg focus:outline-none focus:border-indigo-500 text-gray-200 text-sm appearance-none"
                                    >
                                        <option value="gemini-1.5-flash">Gemini 1.5 Flash (Fast & Cheap)</option>
                                        <option value="gemini-1.5-pro">Gemini 1.5 Pro (Standard)</option>
                                        <option value="gemini-pro">Gemini Pro (Legacy)</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                                        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Ollama Settings */}
                    {provider === 'ollama' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Ollama URL</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={ollamaUrl}
                                        onChange={(e) => setOllamaUrl(e.target.value)}
                                        placeholder="http://localhost:11434"
                                        className="flex-1 px-4 py-2.5 bg-[#131314] border border-[#2D2D2F] rounded-lg focus:outline-none focus:border-orange-500 text-gray-200 placeholder-gray-600 text-sm"
                                    />
                                    <button
                                        onClick={fetchOllamaModels}
                                        title="Refresh Models"
                                        className="p-2.5 bg-[#252528] border border-[#2D2D2F] rounded-lg text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
                                    >
                                        <RefreshCw size={18} className={isLoadingModels ? "animate-spin" : ""} />
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Model Name</label>
                                {ollamaModels.length > 0 ? (
                                    <div className="relative">
                                        <select
                                            value={model}
                                            onChange={(e) => setModel(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-[#131314] border border-[#2D2D2F] rounded-lg focus:outline-none focus:border-orange-500 text-gray-200 text-sm appearance-none"
                                        >
                                            <option value="" disabled>Select a model...</option>
                                            {ollamaModels.map((m) => (
                                                <option key={m.name} value={m.name}>{m.name}</option>
                                            ))}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                                            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                                        </div>
                                    </div>
                                ) : (
                                    <input
                                        type="text"
                                        value={model}
                                        onChange={(e) => setModel(e.target.value)}
                                        placeholder="mistral"
                                        className="w-full px-4 py-2.5 bg-[#131314] border border-[#2D2D2F] rounded-lg focus:outline-none focus:border-orange-500 text-gray-200 placeholder-gray-600 text-sm"
                                    />
                                )}
                                <p className="text-xs text-gray-500">
                                    {ollamaModels.length > 0
                                        ? "Select a model installed on your Ollama instance."
                                        : "Enter the name of the model you pulled (e.g. 'mistral', 'llama2')."}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Test Connection Result */}
                    {testStatus && (
                        <div className={`p-3 rounded-lg flex items-start gap-2 text-sm ${testStatus === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                            testStatus === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                            }`}>
                            {testStatus === 'success' && <Check size={16} className="mt-0.5 shrink-0" />}
                            {testStatus === 'error' && <AlertCircle size={16} className="mt-0.5 shrink-0" />}
                            <span>{testMessage}</span>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-[#2D2D2F] flex items-center justify-between gap-4">
                    <button
                        onClick={handleTestConnection}
                        disabled={isTesting}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-[#2D2D2F] transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {isTesting ? <Loader2 size={16} className="animate-spin" /> : <RotateCcw size={16} />}
                        Test Connection
                    </button>

                    <button
                        onClick={onClose}
                        className="px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors flex items-center gap-2"
                    >
                        <Save size={16} />
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
