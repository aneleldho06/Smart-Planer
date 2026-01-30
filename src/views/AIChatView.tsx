import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import clsx from 'clsx';

export interface AIChatMessage {
    id: string;
    role: 'user' | 'ai';
    content: string;
    timestamp: number;
}

export const AIChatView: React.FC = () => {
    const [messages, setMessages] = useState<AIChatMessage[]>([
        {
            id: '1',
            role: 'ai',
            content: 'Hello! I am your AI assistant. I can help you plan your day, break down goals, or just give you a motivation boost. How can I help?',
            timestamp: Date.now()
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg: AIChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: input.trim(),
            timestamp: Date.now()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            const { data, error } = await supabase.functions.invoke('ai-chat-proxy', {
                body: {
                    messages: [
                        // System prompt could be added here if not in Edge Function
                        { role: 'system', content: 'You are a helpful and motivational productivity assistant.' },
                        ...messages.map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.content })).slice(-5), // Send context
                        { role: 'user', content: userMsg.content }
                    ]
                }
            });

            if (error) {
                console.error('AI Function Error:', error);
                throw error;
            }

            // Assuming data includes standard chat completion format or just content depending on our edge function
            // Our Edge function returns the full OpenAI/Grok response object
            const aiContent = data.choices?.[0]?.message?.content || "Sorry, I couldn't understand that.";

            const aiMsg: AIChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'ai',
                content: aiContent,
                timestamp: Date.now()
            };
            setMessages(prev => [...prev, aiMsg]);
        } catch (err) {
            console.error('Failed to get AI response:', err);
            const errorMsg: AIChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'ai',
                content: "I'm having trouble connecting to my brain right now. Please try again later.",
                timestamp: Date.now()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-140px)]">
            <header className="mb-4">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent">AI Assistant</h2>
                <p className="text-sm text-slate-500">Ask for advice or planning help.</p>
            </header>

            <div className="flex-1 overflow-y-auto space-y-4 pb-4 pr-2 custom-scrollbar">
                {messages.map((msg) => (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={msg.id}
                        className={clsx(
                            "flex items-start gap-2 max-w-[85%]",
                            msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                        )}
                    >
                        <div className={clsx(
                            "h-8 w-8 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                            msg.role === 'user' ? "bg-slate-200 dark:bg-slate-700" : "bg-gradient-to-br from-indigo-500 to-purple-600"
                        )}>
                            {msg.role === 'user' ? <User size={14} className="text-slate-600 dark:text-slate-300" /> : <Sparkles size={14} className="text-white" />}
                        </div>

                        <div className={clsx(
                            "p-3 text-sm rounded-2xl shadow-sm",
                            msg.role === 'user'
                                ? "bg-indigo-600 text-white rounded-tr-sm"
                                : "glass-card text-slate-800 dark:text-slate-100 rounded-tl-sm border-0"
                        )}>
                            {msg.content}
                        </div>
                    </motion.div>
                ))}

                {isTyping && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <Sparkles size={14} className="text-white" />
                        </div>
                        <div className="glass-card px-4 py-3 rounded-2xl rounded-tl-sm">
                            <div className="flex gap-1">
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="mt-auto pt-2">
                <div className="glass-panel p-1.5 rounded-full flex items-center gap-2 pr-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-transparent px-4 py-2 text-sm focus:outline-none text-slate-800 dark:text-white placeholder-slate-400"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isTyping}
                        className="h-9 w-9 bg-primary text-white rounded-full flex items-center justify-center hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
                    >
                        <Send size={16} />
                    </button>
                </div>
            </form>
        </div>
    );
};
