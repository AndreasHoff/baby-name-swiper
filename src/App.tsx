import { useState } from 'react';
import { CardStack } from './components/CardStack';
import { NameForm } from './components/NameForm';
import { NameListView } from './components/NameListView';
import NavBar from './components/NavBar';
import { SwipeButtons } from './components/SwipeButtons';

function App() {
  const [view, setView] = useState<'main' | 'lists' | 'settings'>('main');
  // Add state for swipe animation feedback
  const [swipeDirection, setSwipeDirection] = useState<null | 'no' | 'absolutely-not' | 'yes'>(null);

  // Handler to pass to SwipeButtons
  const handleSwipe = (direction: 'no' | 'absolutely-not' | 'yes') => {
    setSwipeDirection(direction);
  };

  return (
    <div className="flex flex-col items-start justify-start min-h-screen w-full bg-gradient-to-br from-fuchsia-100 via-amber-100 to-sky-100" style={{boxSizing: 'border-box', minHeight: '100dvh'}}>
      <NavBar currentView={view} setView={setView} />
      <div className="mt-4 flex flex-col items-center justify-start w-[430px] max-w-full mx-auto overflow-hidden">
        <h1 className="text-4xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-fuchsia-400 to-amber-400 drop-shadow-lg text-center flex items-center justify-center gap-2" style={{letterSpacing: '0.01em'}}>
          <span role="img" aria-label="baby" className="text-5xl align-middle text-black bg-none" style={{color: '#222', background: 'none'}}>
            👶
          </span>
          <span>Baby Name Swiper</span>
        </h1>
        <div className="flex flex-col items-center w-full" style={{zIndex: 1}}>
          {view === 'main' && (
            <>
              <CardStack swipeDirection={swipeDirection} onAnimationComplete={() => setSwipeDirection(null)} />
              <div className="flex flex-row items-center justify-center w-full mt-2 mb-2">
                <SwipeButtons onSwipe={handleSwipe} />
              </div>
              <NameForm />
            </>
          )}
          {view === 'lists' && <NameListView />}
          {view === 'settings' && (
            <div className="w-full flex flex-col items-center justify-center py-8">
              <p className="text-lg text-gray-600">Settings coming soon!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

// No code changes needed here for port config. See vite.config.ts for port settings.
