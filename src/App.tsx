import { CardStack } from './components/CardStack';
import { NameForm } from './components/NameForm';
import { NameListView } from './components/NameListView';
import { SwipeButtons } from './components/SwipeButtons';

function App() {
  return (
    <div className="flex flex-col items-center justify-start min-h-screen w-full bg-gradient-to-br from-fuchsia-100 via-amber-100 to-sky-100" style={{boxSizing: 'border-box', minHeight: '100dvh'}}>
      <div className="flex flex-col items-center justify-start w-[430px] max-w-full mx-auto overflow-hidden pt-8">
        <h1 className="text-4xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-fuchsia-400 to-amber-400 drop-shadow-lg text-center flex items-center justify-center gap-2" style={{letterSpacing: '0.01em'}}>
          <span role="img" aria-label="baby" className="text-5xl align-middle">👶</span>
          <span>Baby Name Swiper</span>
        </h1>
        <div className="flex flex-col items-center w-full" style={{zIndex: 1}}>
          <CardStack />
          <div className="flex flex-row items-center justify-center w-full mt-2 mb-2">
            <SwipeButtons />
          </div>
          <NameForm />
          <NameListView />
        </div>
      </div>
    </div>
  );
}

export default App;

// No code changes needed here for port config. See vite.config.ts for port settings.
