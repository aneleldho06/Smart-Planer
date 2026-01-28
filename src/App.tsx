import { useUIStore } from './stores/uiStore';
import { BottomNav } from './components/BottomNav';
import { MotivateButton } from './components/MotivateButton';
import { TodayView } from './views/TodayView';
import { WeeklyView } from './views/WeeklyView';
import { MonthlyView } from './views/MonthlyView';
import { AIChatView } from './views/AIChatView';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const { currentView } = useUIStore();

  const renderView = () => {
    switch (currentView) {
      case 'today':
        return <TodayView />;
      case 'weekly':
        return <WeeklyView />;
      case 'monthly':
        return <MonthlyView />;
      case 'ai':
        return <AIChatView />;
      default:
        return <TodayView />;
    }
  };

  return (
    <div className="min-h-screen w-full bg-cover bg-fixed bg-center transition-colors">
      {/* Decorative ambient blobs */}
      <div className="fixed -top-40 -left-40 h-96 w-96 rounded-full bg-teal-400/20 blur-3xl filter dark:bg-teal-900/20" />
      <div className="fixed top-20 -right-20 h-72 w-72 rounded-full bg-purple-400/20 blur-3xl filter dark:bg-purple-900/20" />
      <div className="fixed bottom-0 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-blue-400/20 blur-3xl filter dark:bg-blue-900/20" />

      <main className="relative mx-auto min-h-screen max-w-md bg-white/10 px-4 pt-8 shadow-2xl backdrop-blur-sm md:max-w-xl dark:bg-black/10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>

        <MotivateButton />
        <BottomNav />
      </main>
    </div>
  );
}

export default App;
