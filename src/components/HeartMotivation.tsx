import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';
import { getRandomMotivation } from '../utils/motivations';

export const HeartMotivation: React.FC = () => {
    const [message, setMessage] = useState<string | null>(null);

    const handleClick = () => {
        setMessage(getRandomMotivation());
        // Auto-hide the message after 3 seconds
        setTimeout(() => setMessage(null), 3000);
    };

    return (
        <div className="relative flex flex-col items-center justify-center py-6">
            <AnimatePresence mode="wait">
                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.9 }}
                        className="absolute bottom-16 z-20 max-w-[200px] rounded-2xl bg-white/90 p-4 text-center text-sm font-semibold text-slate-800 shadow-xl backdrop-blur-md dark:bg-slate-800/90 dark:text-white"
                    >
                        "{message}"
                        <div className="absolute -bottom-2 left-1/2 -ml-2 h-4 w-4 rotate-45 transform bg-white/90 dark:bg-slate-800/90" />
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleClick}
                className="group relative"
            >
                <div className="absolute inset-0 animate-pulse rounded-full bg-red-400/20 blur-xl transition-all group-hover:bg-red-500/30" />
                <Heart
                    size={48}
                    className="fill-red-500 text-red-600 drop-shadow-lg transition-colors group-hover:text-red-500"
                    strokeWidth={1.5}
                />
            </motion.button>
        </div>
    );
};
