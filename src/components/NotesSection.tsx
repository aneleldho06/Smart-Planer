import React from 'react';
import { useTaskStore } from '../stores/taskStore';

export const NotesSection: React.FC<{ className?: string }> = ({ className = '' }) => {
    const { notes, updateNotes } = useTaskStore();

    return (
        <div className={`flex flex-col ${className}`}>
            <h3 className="mb-2 text-lg font-bold tracking-tight text-slate-800 dark:text-slate-100">
                NOTES
            </h3>
            <textarea
                value={notes}
                onChange={(e) => updateNotes(e.target.value)}
                placeholder="Write something down..."
                className="h-full w-full resize-none rounded-xl bg-transparent p-2 text-sm text-slate-600 outline-none placeholder:text-slate-400 dark:text-slate-300"
            />
        </div>
    );
};
