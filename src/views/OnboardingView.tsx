import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTaskStore } from '../stores/taskStore';
import { useUIStore } from '../stores/uiStore';
import onboardingBg from '../assets/onboarding_bg.png';
import { Check, ChevronRight, BookOpen, Dumbbell, Briefcase, Scale, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';

type GoalType = 'Student' | 'Fitness' | 'Work' | 'Balanced';
type Step = 1 | 2 | 3;

const PRESETS: Record<GoalType, string[]> = {
    Student: ['Study Math 1h', 'Revise Chapter 2', 'Pomodoro session'],
    Fitness: ['Morning workout 30min', 'Drink 2L water', 'Track calories'],
    Work: ['Deep work block 2h', 'Email inbox zero', 'Team meeting prep'],
    Balanced: ['Read 20 mins', 'Workout 30 mins', 'Deep work block 1h']
};

export const OnboardingView: React.FC = () => {
    const { addTask } = useTaskStore();
    const { completeOnboarding } = useUIStore();
    const [step, setStep] = useState<Step>(1);
    const [selectedGoal, setSelectedGoal] = useState<GoalType>('Student');
    const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set(PRESETS['Student']));
    const [loading, setLoading] = useState(false);

    const handleGoalSelect = (goal: GoalType) => {
        setSelectedGoal(goal);
        setSelectedTasks(new Set(PRESETS[goal]));
        // Optional: Auto-advance or wait for user to click continue
    };

    const toggleTaskSelection = (task: string) => {
        const next = new Set(selectedTasks);
        if (next.has(task)) next.delete(task);
        else next.add(task);
        setSelectedTasks(next);
    };

    const handleSetupComplete = async () => {
        setLoading(true);
        // Add all selected tasks
        const promises = Array.from(selectedTasks).map(title => addTask(title));
        await Promise.all(promises);

        // Simulate a small delay for better UX (shimmer effect / feeling of "setting up")
        setTimeout(() => {
            setLoading(false);
            setStep(3);
        }, 1200);
    };

    const handleFinalContinue = () => {
        completeOnboarding();
    };

    const variants = {
        enter: { opacity: 0, x: 20 },
        center: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden">
            {/* Background Image */}
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${onboardingBg})` }}
            />
            {/* Dark overlay for contrast */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

            {/* Main Card */}
            <div className="relative z-10 w-full max-w-2xl px-4">
                <div className="glass-panel overflow-hidden rounded-3xl bg-white/10 p-8 shadow-2xl backdrop-blur-xl border border-white/20">

                    {/* Progress Dots */}
                    <div className="mb-8 flex justify-center gap-3">
                        {[1, 2, 3].map((s) => (
                            <div
                                key={s}
                                className={clsx(
                                    "h-2.5 rounded-full transition-all duration-300",
                                    step >= s ? "w-8 bg-teal-400" : "w-2.5 bg-white/20"
                                )}
                            />
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                variants={variants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.3 }}
                                className="flex flex-col items-center text-center"
                            >
                                <h1 className="mb-2 text-3xl font-bold text-white drop-shadow-md">
                                    Welcome to SmartPlan!
                                </h1>
                                <p className="mb-8 text-lg text-white/80">
                                    What's your main goal for today?
                                </p>

                                <div className="grid w-full grid-cols-2 gap-4 md:grid-cols-4">
                                    <GoalCard
                                        icon={<BookOpen size={24} />}
                                        title="Student"
                                        selected={selectedGoal === 'Student'}
                                        onClick={() => handleGoalSelect('Student')}
                                    />
                                    <GoalCard
                                        icon={<Dumbbell size={24} />}
                                        title="Fitness"
                                        selected={selectedGoal === 'Fitness'}
                                        onClick={() => handleGoalSelect('Fitness')}
                                    />
                                    <GoalCard
                                        icon={<Briefcase size={24} />}
                                        title="Work"
                                        selected={selectedGoal === 'Work'}
                                        onClick={() => handleGoalSelect('Work')}
                                    />
                                    <GoalCard
                                        icon={<Scale size={24} />}
                                        title="Balanced"
                                        selected={selectedGoal === 'Balanced'}
                                        onClick={() => handleGoalSelect('Balanced')}
                                    />
                                </div>

                                <button
                                    onClick={() => setStep(2)}
                                    className="mt-8 flex items-center gap-2 rounded-xl bg-white px-8 py-3 font-bold text-slate-900 shadow-lg transition-transform hover:scale-105 active:scale-95"
                                >
                                    Continue <ChevronRight size={18} />
                                </button>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                variants={variants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.3 }}
                                className="flex flex-col items-center"
                            >
                                <h2 className="mb-2 text-2xl font-bold text-white">Your starter plan is ready</h2>
                                <p className="mb-6 text-white/80">Add these tasks to begin:</p>

                                <div className="w-full space-y-3">
                                    {PRESETS[selectedGoal].map((task) => (
                                        <div
                                            key={task}
                                            onClick={() => toggleTaskSelection(task)}
                                            className={clsx(
                                                "flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-all",
                                                selectedTasks.has(task)
                                                    ? "border-teal-400 bg-teal-400/20"
                                                    : "border-white/10 bg-white/5 hover:bg-white/10"
                                            )}
                                        >
                                            <div
                                                className={clsx(
                                                    "flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors",
                                                    selectedTasks.has(task)
                                                        ? "border-teal-400 bg-teal-400 text-white"
                                                        : "border-white/30"
                                                )}
                                            >
                                                {selectedTasks.has(task) && <Check size={14} strokeWidth={3} />}
                                            </div>
                                            <span className="font-medium text-white">{task}</span>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={handleSetupComplete}
                                    disabled={loading}
                                    className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-teal-500 py-3.5 font-bold text-white shadow-lg shadow-teal-500/30 transition-all hover:bg-teal-400 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Setting up...' : 'Add & Continue'}
                                </button>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step3"
                                variants={variants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.3 }}
                                className="flex flex-col items-center text-center py-10"
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 10 }}
                                    className="mb-6 rounded-full bg-teal-400/20 p-6"
                                >
                                    <CheckCircle2 size={64} className="text-teal-400" />
                                </motion.div>

                                <h2 className="mb-2 text-3xl font-bold text-white">All Set!</h2>
                                <p className="mb-8 text-white/80">Let's make today productive.</p>

                                <button
                                    onClick={handleFinalContinue}
                                    className="w-full rounded-xl bg-white py-3.5 font-bold text-slate-900 shadow-xl transition-transform hover:scale-[1.02] active:scale-95"
                                >
                                    Get Started
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

const GoalCard = ({ icon, title, selected, onClick }: { icon: React.ReactNode; title: string; selected: boolean; onClick: () => void }) => (
    <button
        onClick={onClick}
        className={clsx(
            "flex flex-col items-center justify-center gap-3 rounded-2xl border p-4 transition-all duration-300",
            selected
                ? "border-teal-400 bg-teal-400/20 scale-105 shadow-[0_0_20px_rgba(45,212,191,0.3)]"
                : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/30"
        )}
    >
        <div className={clsx("transition-colors", selected ? "text-teal-400" : "text-white/70")}>{icon}</div>
        <span className={clsx("font-semibold", selected ? "text-white" : "text-white/70")}>{title}</span>
    </button>
);
