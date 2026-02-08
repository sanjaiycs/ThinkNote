import React, { useState } from 'react';
import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { LogIn, LogOut, User } from 'lucide-react';

const Auth = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState('');
    const [user, setUser] = useState(auth?.currentUser);
    const [isOpen, setIsOpen] = useState(false);

    // Listen to verification state is handled globally usually, but local state works for this component UI
    React.useEffect(() => {
        if (!auth) return;
        const unsubscribe = auth.onAuthStateChanged((u) => {
            setUser(u);
        });
        return () => unsubscribe();
    }, []);

    const handleAuth = async (e) => {
        e.preventDefault();
        setError('');
        if (!auth) {
            setError("Firebase not configured.");
            return;
        }
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
            }
            setIsOpen(false);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleLogout = async () => {
        if (!auth) return;
        await signOut(auth);
    };

    if (!auth) {
        return (
            <div className="text-xs text-gray-400 p-4">
                Offline Mode (Firebase not config)
            </div>
        );
    }

    if (user) {
        return (
            <div className="p-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 overflow-hidden">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700">
                            <User size={16} />
                        </div>
                        <span className="text-sm font-medium text-gray-700 truncate max-w-[100px]">{user.email}</span>
                    </div>
                    <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition-colors" title="Logout">
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 border-t border-gray-100">
            {!isOpen ? (
                <button
                    onClick={() => setIsOpen(true)}
                    className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-md w-full"
                >
                    <LogIn size={18} />
                    <span>Login / Sign Up</span>
                </button>
            ) : (
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <h3 className="text-sm font-semibold mb-2">{isLogin ? 'Login' : 'Sign Up'}</h3>
                    <form onSubmit={handleAuth} className="space-y-2">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            className="w-full px-2 py-1 text-sm border rounded"
                            required
                        />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            className="w-full px-2 py-1 text-sm border rounded"
                            required
                        />
                        {error && <p className="text-xs text-red-500">{error}</p>}
                        <div className="flex gap-2 pt-1">
                            <button type="submit" className="flex-1 bg-indigo-600 text-white text-xs py-1.5 rounded hover:bg-indigo-700">
                                {isLogin ? 'Login' : 'Sign Up'}
                            </button>
                            <button type="button" onClick={() => setIsLogin(!isLogin)} className="flex-1 bg-gray-200 text-gray-700 text-xs py-1.5 rounded hover:bg-gray-300">
                                {isLogin ? 'Create Account' : 'Back to Login'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Auth;
