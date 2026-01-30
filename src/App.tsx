import { useUIStore } from './stores/uiStore';
import { BottomNav } from './components/BottomNav';

import { TodayView } from './views/TodayView';
import { WeeklyView } from './views/WeeklyView';
import { MonthlyView } from './views/MonthlyView';
import { AIChatView } from './views/AIChatView';
import { motion, AnimatePresence } from 'framer-motion';
import bgImage from './assets/background_v2.png';
import lightBg from './assets/light_mode_bg.png';

function App() {
  const { currentView, theme } = useUIStore();

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
    <div
      className={`min-h-screen w-full transition-colors ${theme}`}
    >
      <div
        className="fixed inset-0 w-full h-full bg-cover bg-fixed bg-center z-0 transition-all duration-500"
        style={{ backgroundImage: `url(${theme === 'light' ? lightBg : bgImage})` }}
      />

      {/* Decorative ambient blobs */}
      <div className="fixed -top-40 -left-40 h-96 w-96 rounded-full bg-teal-400/20 blur-3xl filter dark:bg-teal-900/20 z-0" />
      <div className="fixed top-20 -right-20 h-72 w-72 rounded-full bg-purple-400/20 blur-3xl filter dark:bg-purple-900/20 z-0" />
      <div className="fixed bottom-0 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-blue-400/20 blur-3xl filter dark:bg-blue-900/20 z-0" />

      <main className="relative z-10 mx-auto min-h-screen w-full max-w-7xl px-4 pt-4 md:px-8 md:pt-8">
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


        <BottomNav />
      </main>
    </div>
  );
}

export default App;
