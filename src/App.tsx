import { useState } from 'react';
import { CardStack } from './components/CardStack';
import { NameForm } from './components/NameForm';
import NavBar from './components/NavBar';
import { SwipeButtons } from './components/SwipeButtons';

function App() {
  const [view, setView] = useState<'main' | 'lists' | 'settings'>('main');
  // Add state for swipe animation feedback
  const [swipeDirection, setSwipeDirection] = useState<null | 'no' | 'absolutely-not' | 'yes'>(null);
  // State for showing the add name success message
  const [showAddSuccess, setShowAddSuccess] = useState(false);
  // State for the last added name
  const [lastAddedName, setLastAddedName] = useState<string | null>(null);

  // Handler to pass to SwipeButtons
  const handleSwipe = (direction: 'no' | 'absolutely-not' | 'yes') => {
    setSwipeDirection(direction);
  };

  // Handler to pass to NameForm
  const handleNameAdded = (name?: string) => {
    if (name) setLastAddedName(name);
    setShowAddSuccess(true);
    setTimeout(() => setShowAddSuccess(false), 2000);
  };

  return (
    <div className="flex flex-col items-start justify-start min-h-screen w-full bg-gradient-to-br from-fuchsia-100 via-amber-100 to-sky-100" style={{boxSizing: 'border-box', minHeight: '100dvh'}}>
      <NavBar currentView={view} setView={setView} />
      {/* Toaster message for add name success - fixed at very top, theme-consistent, slide in/out from top */}
      <div className="fixed top-0 left-0 w-full flex justify-center z-50 pointer-events-none" style={{overflow: 'visible'}}>
        <div
          className="mt-3 px-8 py-3 rounded-2xl shadow-xl font-bold text-base flex items-center justify-center text-fuchsia-600 drop-shadow-lg text-center"
          style={{
            maxWidth: 420,
            minWidth: 220,
            background: 'linear-gradient(135deg, #bae6fd 0%, #f5d0fe 60%, #fef3c7 100%)',
            border: 'none',
            boxShadow: '0 8px 24px 0 rgba(236, 72, 153, 0.10)',
            transition: 'transform 0.5s cubic-bezier(0.4,0,0.2,1)',
            transform: showAddSuccess ? 'translateY(0)' : 'translateY(-150%)',
            opacity: 1
          }}
        >
          <span className="mr-2 text-xl">🎉</span><span className="mx-1 text-fuchsia-700">{lastAddedName}</span> added successfully
        </div>
      </div>
      <div className="mt-4 flex flex-col items-center justify-start w-[430px] max-w-full mx-auto overflow-hidden">
        {/* Only render the app headline on the main and settings views */}
        {(view === 'main' || view === 'settings') && (
          <h1 className="text-4xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-fuchsia-400 to-amber-400 drop-shadow-lg text-center flex items-center justify-center gap-2" style={{letterSpacing: '0.01em'}}>
            <span role="img" aria-label="baby" className="text-5xl align-middle text-black bg-none" style={{color: '#222', background: 'none'}}>
              👶
            </span>
            <span>Baby Name Swiper</span>
          </h1>
        )}
        <div className="flex flex-col items-center w-full" style={{zIndex: 1}}>
          {view === 'main' && (
            <>
              <CardStack swipeDirection={swipeDirection} onAnimationComplete={() => setSwipeDirection(null)} />
              <div className="flex flex-row items-center justify-center w-full mt-2 mb-2">
                <SwipeButtons onSwipe={handleSwipe} />
              </div>
              <NameForm onNameAdded={handleNameAdded} />
            </>
          )}
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
