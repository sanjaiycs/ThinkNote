import { useEffect, useRef } from 'react';
import { auth, db } from '../lib/firebase';
import useNoteStore from '../store/noteStore';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot, doc, setDoc, getDocs } from 'firebase/firestore';

const useSync = () => {
    const { setNotes, notes } = useNoteStore();
    const lastSyncedRef = useRef({}); // Tracks the updatedAt timestamp of the last successful sync/fetch per note
    const timeoutRefs = useRef({}); // Stores timeout IDs for debouncing

    useEffect(() => {
        if (!auth || !db) return;

        const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const notesCollection = collection(db, 'users', user.uid, 'notes');

                const unsubscribeSnapshot = onSnapshot(notesCollection, (snapshot) => {
                    const fetchedNotes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                    if (fetchedNotes.length > 0) {
                        // When we fetch from remote, update our lastSyncedRef so we don't echo-back
                        fetchedNotes.forEach(note => {
                            lastSyncedRef.current[note.id] = note.updatedAt;
                        });

                        // Merge strategy: Remote usually wins in this simple sync, 
                        // but ideally we'd compare timestamps. 
                        // For this MVP, we'll accept remote changes.
                        setNotes(fetchedNotes);
                    }
                });

                return () => unsubscribeSnapshot();
            }
        });

        return () => unsubscribeAuth();
    }, []);

    // Optimized Sync Logic: Debounce and only write changed notes
    useEffect(() => {
        if (!auth || !db) return;
        const user = auth.currentUser;
        if (!user) return;

        notes.forEach(note => {
            const lastSync = lastSyncedRef.current[note.id];

            // If the note has changed locally since the last sync
            if (!lastSync || new Date(note.updatedAt) > new Date(lastSync)) {

                // Clear existing timeout for this note if it exists (debounce)
                if (timeoutRefs.current[note.id]) {
                    clearTimeout(timeoutRefs.current[note.id]);
                }

                // Set a new timeout to write this note in 2 seconds
                timeoutRefs.current[note.id] = setTimeout(async () => {
                    try {
                        // console.log("Syncing note to Firestore:", note.title);
                        await setDoc(doc(db, 'users', user.uid, 'notes', note.id), note);

                        // Update tracking ref after successful write
                        lastSyncedRef.current[note.id] = note.updatedAt;
                        delete timeoutRefs.current[note.id];
                    } catch (e) {
                        console.error("Error syncing note", note.id, e);
                    }
                }, 2000); // 2 second debounce
            }
        });

        // Cleanup function not strictly necessary for timeouts here as they persist across renders usually,
        // but limiting scope is good. 
        // Actually, we want timeouts to survive re-renders of the effect if the effect dependency changes often.
        // But `notes` changes often. So effectively we are rescheduling on every keystroke. 
        // This is exactly what we want for debounce.

    }, [notes]);
};

export default useSync;
