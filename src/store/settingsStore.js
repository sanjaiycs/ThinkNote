import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useSettingsStore = create(
    persist(
        (set) => ({
            provider: 'gemini', // 'gemini' | 'ollama'
            apiKey: '', // stored in local storage
            ollamaUrl: 'http://localhost:11434',
            model: 'gemini-1.5-flash', // default model

            setProvider: (provider) => set({ provider }),
            setApiKey: (apiKey) => set({ apiKey }),
            setOllamaUrl: (url) => set({ ollamaUrl: url }),
            setModel: (model) => set({ model }),

            // Helper to reset to defaults if needed
            resetSettings: () => set({
                provider: 'gemini',
                apiKey: '',
                ollamaUrl: 'http://localhost:11434',
                model: 'gemini-1.5-flash'
            })
        }),
        {
            name: 'notelm-settings',
        }
    )
);

export default useSettingsStore;
