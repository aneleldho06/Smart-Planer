import React, { useState } from 'react';
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    getDay,
    isSameDay,
    addMonths,
    subMonths,
    setMonth,
    addYears,
    subYears
} from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// --- Constants & Types ---

type ViewMode = 'month' | 'year';

interface MonthTheme {
    bgFrom: string; // Gradient start / solid bg
    bgTo: string;   // Gradient end
    text: string;   // Text color for contrast
    accent: string; // Accent for active day / elements
    name: string;
}

const MONTH_THEMES: MonthTheme[] = [
    { name: 'JAN', bgFrom: 'bg-blue-900', bgTo: 'bg-blue-800', text: 'text-white', accent: 'bg-blue-600' }, // Deep Blue
    { name: 'FEB', bgFrom: 'bg-purple-400', bgTo: 'bg-purple-500', text: 'text-white', accent: 'bg-purple-600' }, // Lavender
    { name: 'MAR', bgFrom: 'bg-green-500', bgTo: 'bg-green-600', text: 'text-white', accent: 'bg-green-700' }, // Fresh Green
    { name: 'APR', bgFrom: 'bg-rose-400', bgTo: 'bg-rose-500', text: 'text-white', accent: 'bg-rose-600' }, // Coral
    { name: 'MAY', bgFrom: 'bg-teal-400', bgTo: 'bg-teal-500', text: 'text-white', accent: 'bg-teal-600' }, // Mint
    { name: 'JUN', bgFrom: 'bg-cyan-400', bgTo: 'bg-cyan-500', text: 'text-white', accent: 'bg-cyan-600' }, // Turquoise
    { name: 'JUL', bgFrom: 'bg-red-500', bgTo: 'bg-red-600', text: 'text-white', accent: 'bg-red-700' }, // Crimson
    { name: 'AUG', bgFrom: 'bg-amber-400', bgTo: 'bg-amber-500', text: 'text-white', accent: 'bg-amber-600' }, // Golden
    { name: 'SEP', bgFrom: 'bg-fuchsia-500', bgTo: 'bg-fuchsia-600', text: 'text-white', accent: 'bg-fuchsia-700' }, // Violet
    { name: 'OCT', bgFrom: 'bg-orange-500', bgTo: 'bg-orange-600', text: 'text-white', accent: 'bg-orange-700' }, // Pumpkin
    { name: 'NOV', bgFrom: 'bg-emerald-600', bgTo: 'bg-emerald-700', text: 'text-white', accent: 'bg-emerald-800' }, // Deep Teal
    { name: 'DEC', bgFrom: 'bg-slate-500', bgTo: 'bg-slate-600', text: 'text-white', accent: 'bg-slate-700' }, // Slate Blue
];

// --- Main Component ---

export const MonthlyView: React.FC = () => {
    const [viewMode, setViewMode] = useState<ViewMode>('month');
    const [currentDate, setCurrentDate] = useState(new Date());

    // Switch to specific month from year view
    const handleMonthSelect = (monthIndex: number) => {
        const newDate = setMonth(currentDate, monthIndex);
        setCurrentDate(newDate);
        setViewMode('month');
    };

    return (
        <div className="h-full w-full pb-20">
            <AnimatePresence mode="wait">
                {viewMode === 'month' ? (
                    <MonthLayout
                        key="month-view"
                        currentDate={currentDate}
                        onPrevMonth={() => setCurrentDate(subMonths(currentDate, 1))}
                        onNextMonth={() => setCurrentDate(addMonths(currentDate, 1))}
                        onYearClick={() => setViewMode('year')}
                    />
                ) : (
                    <YearLayout
                        key="year-view"
                        currentDate={currentDate}
                        onPrevYear={() => setCurrentDate(subYears(currentDate, 1))}
                        onNextYear={() => setCurrentDate(addYears(currentDate, 1))}
                        onMonthSelect={handleMonthSelect}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

// --- Sub Components ---

const MonthLayout = ({
    currentDate,
    onPrevMonth,
    onNextMonth,
    onYearClick
}: {
    currentDate: Date,
    onPrevMonth: () => void,
    onNextMonth: () => void,
    onYearClick: () => void
}) => {
    const theme = MONTH_THEMES[currentDate.getMonth()];
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start, end });
    const startDayOfWeek = getDay(start); // 0=Sun

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="flex h-[75vh] flex-col overflow-hidden rounded-3xl shadow-2xl md:flex-row"
        >
            {/* Left Info Panel */}
            <div className={clsx(
                "relative flex flex-col justify-between p-8 text-white md:w-2/5",
                theme.bgFrom,
                "bg-gradient-to-br from-white/10 to-transparent backdrop-blur-md"
            )}>
                {/* Background Decor */}
                <div className={clsx("absolute inset-0 z-0 opacity-20", theme.bgTo)} />

                <div className="relative z-10">
                    <div className="mb-2 inline-block rounded-full bg-white/20 px-4 py-1 text-sm font-bold uppercase tracking-wider backdrop-blur-sm">
                        {format(currentDate, 'EEEE')}
                    </div>
                    <div className="text-[8rem] font-bold leading-none tracking-tighter opacity-90">
                        {format(currentDate, 'd')}
                    </div>
                </div>

                <div className="relative z-10 mt-auto">
                    <div className="text-xl font-medium opacity-80">New York, USA</div>
                    <div className="text-4xl font-light">24°C</div>
                </div>
            </div>

            {/* Right Calendar Grid */}
            <div className="flex flex-1 flex-col bg-white p-6 dark:bg-slate-900/90 md:p-8">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <button onClick={onYearClick} className="text-xl font-bold uppercase tracking-wide text-slate-800 hover:text-teal-500 dark:text-white transition-colors">
                        {format(currentDate, 'MMMM yyyy')}
                    </button>
                    <div className="flex gap-2">
                        <button onClick={onPrevMonth} className="rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            <ChevronLeft className="text-slate-600 dark:text-slate-300" />
                        </button>
                        <button onClick={onNextMonth} className="rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            <ChevronRight className="text-slate-600 dark:text-slate-300" />
                        </button>
                    </div>
                </div>

                {/* Grid Header */}
                <div className="mb-4 grid grid-cols-7 text-center">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                        <div key={d} className="text-xs font-bold text-slate-400">{d}</div>
                    ))}
                </div>

                {/* Days Grid */}
                <div className="grid flex-1 grid-cols-7 gap-y-4 text-center">
                    {Array.from({ length: startDayOfWeek }).map((_, i) => (
                        <div key={`empty-${i}`} />
                    ))}
                    {days.map((day) => {
                        const isToday = isSameDay(day, new Date());

                        return (
                            <div key={day.toISOString()} className="flex items-center justify-center">
                                <div className={clsx(
                                    "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-all",
                                    isToday
                                        ? clsx(theme.accent, "text-white shadow-lg scale-110")
                                        : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                                )}>
                                    {format(day, 'd')}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
};

const YearLayout = ({
    currentDate,
    onPrevYear,
    onNextYear,
    onMonthSelect
}: {
    currentDate: Date,
    onPrevYear: () => void,
    onNextYear: () => void,
    onMonthSelect: (index: number) => void
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="flex h-[80vh] flex-col rounded-3xl bg-white/50 p-6 backdrop-blur-xl dark:bg-slate-900/50"
        >
            <div className="mb-8 flex items-center justify-center gap-8">
                <button onClick={onPrevYear} className="rounded-full p-2 hover:bg-white/20">
                    <ChevronLeft size={32} className="text-slate-700 dark:text-white" />
                </button>
                <h2 className="text-4xl font-light text-slate-800 dark:text-white">{format(currentDate, 'yyyy')}</h2>
                <button onClick={onNextYear} className="rounded-full p-2 hover:bg-white/20">
                    <ChevronRight size={32} className="text-slate-700 dark:text-white" />
                </button>
            </div>

            <div className="grid flex-1 grid-cols-3 gap-4 md:grid-cols-4">
                {MONTH_THEMES.map((theme, index) => {
                    const isCurrentMonth = index === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear();

                    return (
                        <motion.button
                            key={theme.name}
                            onClick={() => onMonthSelect(index)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={clsx(
                                "relative flex flex-col items-center justify-center rounded-2xl p-4 shadow-sm transition-shadow hover:shadow-lg",
                                theme.bgFrom,
                                isCurrentMonth ? "ring-4 ring-white dark:ring-slate-700" : ""
                            )}
                        >
                            {/* Gradient Overlay */}
                            <div className={clsx("absolute inset-0 rounded-2xl opacity-50 bg-gradient-to-br from-white/20 to-transparent")} />

                            <span className="relative z-10 text-xl font-bold text-white tracking-widest">
                                {theme.name}
                            </span>
                        </motion.button>
                    );
                })}
            </div>
        </motion.div>
    );
};
