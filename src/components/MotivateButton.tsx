import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { getRandomMotivation } from '../utils/motivations';

export const MotivateButton: React.FC = () => {
    const [message, setMessage] = useState<string | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    const handleClick = () => {
        if (isVisible) return; // Prevent spamming
        setMessage(getRandomMotivation());
        setIsVisible(true);
    };

    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                setIsVisible(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [isVisible]);

    return (
        <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 flex flex-col items-center">
            <AnimatePresence>
                {isVisible && message && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.9 }}
                        className="glass-panel absolute bottom-full mb-4 w-64 p-4 rounded-xl text-center text-sm font-medium text-slate-800 dark:text-slate-100 shadow-xl"
                    >
                        "{message}"
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 border-l-[8px] border-r-[8px] border-t-[8px] border-l-transparent border-r-transparent border-t-white/40 dark:border-t-slate-800/40"></div>
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                onClick={handleClick}
                className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-rose-400 text-white shadow-lg shadow-rose-400/40 transition-transform active:scale-95 overflow-hidden"
            >
                <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity group-hover:opacity-100" />
                <Heart className="h-7 w-7 fill-white/20" />
            </button>
        </div>
    );
};
