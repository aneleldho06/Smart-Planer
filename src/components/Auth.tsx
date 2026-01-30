import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import bgImage from '../assets/background_v2.png';
import { motion } from 'framer-motion';

export function Auth() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const { signInWithGoogle } = useAuthStore();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (isSignUp) {
            const { error } = await supabase.auth.signUp({
                email,
                password,
            });
            if (error) alert(error.message);
            else alert('Check your email for the login link!');
        } else {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) alert(error.message);
        }
        setLoading(false);
    };

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
            {/* Background with Overlay */}
            <div
                className="absolute inset-0 w-full h-full bg-cover bg-center z-0"
                style={{ backgroundImage: `url(${bgImage})` }}
            />
            <div className="absolute inset-0 bg-white/30 backdrop-blur-sm z-0" />

            {/* Ambient Blobs */}
            <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-teal-400/30 blur-3xl z-0" />
            <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-purple-400/30 blur-3xl z-0" />

            {/* Glass Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 w-full max-w-md p-8 rounded-3xl bg-white/20 backdrop-blur-xl border border-white/40 shadow-2xl mx-4"
            >
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">
                        {isSignUp ? 'Create Account' : 'Welcome Back'}
                    </h1>
                    <p className="text-slate-700 font-medium">
                        SmartPlan: Organize your day effortlessly.
                    </p>
                </div>

                <form onSubmit={handleAuth} className="space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-slate-800 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white/50 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white/80 transition-all font-medium"
                            placeholder="you@example.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-800 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white/50 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white/80 transition-all font-medium"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-lg transform transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Sign In'}
                    </button>
                </form>

                <div className="mt-8">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-300/50" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 text-slate-600 font-medium bg-transparent backdrop-blur-md rounded-full">Or continue with</span>
                        </div>
                    </div>

                    <div className="mt-6">
                        <button
                            onClick={signInWithGoogle}
                            className="w-full flex items-center justify-center py-3 px-4 rounded-xl bg-white/60 hover:bg-white/80 border border-white/50 shadow-sm text-slate-800 font-bold transition-all hover:scale-[1.02]"
                        >
                            <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            Google
                        </button>
                    </div>
                </div>

                <div className="mt-8 text-center bg-transparent">
                    <p className="text-slate-800 font-medium">
                        {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                        <button
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="font-bold text-indigo-700 hover:text-indigo-900 underline decoration-2 decoration-transparent hover:decoration-indigo-900 transition-all"
                        >
                            {isSignUp ? 'Sign In' : 'Sign Up'}
                        </button>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
