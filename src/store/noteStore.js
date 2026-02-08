import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useNoteStore = create(
    persist(
        (set) => ({
            notes: [
                {
                    id: '1',
                    title: 'Welcome to NoteLM',
                    content: '# Welcome to NoteLM\n\nThis is a smart notebook powered by AI.\n\n- Start typing to take notes\n- Use the **AI Assistant** to summarize or extract key points\n- Organize your notes with tags',
                    tags: ['Welcome', 'Guide'],
                    sources: [],
                    updatedAt: new Date().toISOString(),
                }
            ],
            currentNoteId: '1',

            createNote: () => set((state) => {
                const newNote = {
                    id: Date.now().toString(),
                    title: 'Untitled Note',
                    content: '',
                    tags: [],
                    sources: [],
                    updatedAt: new Date().toISOString(),
                };
                return {
                    notes: [newNote, ...state.notes],
                    currentNoteId: newNote.id
                };
            }),

            updateNote: (id, updates) => set((state) => ({
                notes: state.notes.map((note) =>
                    note.id === id ? { ...note, ...updates, updatedAt: new Date().toISOString() } : note
                ),
            })),

            selectNote: (id) => set({ currentNoteId: id }),

            deleteNote: (id) => set((state) => ({
                notes: state.notes.filter((n) => n.id !== id),
                currentNoteId: state.currentNoteId === id ? null : state.currentNoteId
            })),

            setNotes: (newNotes) => set({ notes: newNotes }),
        }),
        {
            name: 'notelm-storage',
        }
    )
);

export default useNoteStore;
