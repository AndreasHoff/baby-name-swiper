import { collection, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { CardStack } from './components/CardStack';
import { NameForm } from './components/NameForm';
import NavBar from './components/NavBar';
import { db } from './firebase';

// Define a TypeScript interface for a baby name document
export interface BabyName {
  id: string;
  name: string;
  gender: string;
  votes: {
    Andreas?: 'yes' | 'no' | 'favorite' | null;
    Emilie?: 'yes' | 'no' | 'favorite' | null;
    [key: string]: 'yes' | 'no' | 'favorite' | null | undefined;
  };
  [key: string]: any; // For any extra fields
}

function CenteredScreen({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center min-h-screen w-full bg-gradient-to-br from-fuchsia-100 via-amber-100 to-sky-100" style={{ width: '430px', maxWidth: '100vw' }}>
      {children}
    </div>
  );
}

function App() {
  // On mount, check for currentUser in localStorage and auto-login
  useEffect(() => {
    const storedUser = window.localStorage.getItem('currentUser');
    if (storedUser === 'Andreas' || storedUser === 'Emilie') {
      setCurrentUser(storedUser as 'Andreas' | 'Emilie');
      setView('main');
    }
  }, []);

  const [view, setView] = useState<'main' | 'lists' | 'settings'>('main');
  const [showAddSuccess, setShowAddSuccess] = useState(false);
  const [lastAddedName, setLastAddedName] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<'Andreas' | 'Emilie' | null>(null);
  const [names, setNames] = useState<BabyName[]>([]);
  const [loading, setLoading] = useState(true);

  // Firestore: listen for names
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'baby-names'), (snapshot) => {
      const arr = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || '',
          gender: data.gender || '',
          votes: data.votes || {},
          ...data
        };
      });
      setNames(arr);
      setLoading(false);
      console.log('[App] Loaded names from Firestore:', arr.length);
    });
    return () => unsub();
  }, []);

  // Handler for welcome screen user selection
  const handleUserSelect = async (user: 'Andreas' | 'Emilie') => {
    window.localStorage.setItem('currentUser', user);
    const userDocRef = doc(db, 'users', user);
    const userDocSnap = await import('firebase/firestore').then(({ getDoc }) => getDoc(userDocRef));
    if (!userDocSnap.exists()) {
      await import('firebase/firestore').then(({ setDoc }) => setDoc(userDocRef, { displayName: user, created: new Date().toISOString() }));
    }
    setCurrentUser(user);
    setView('main');
  };

  // Voting logic: update Firestore
  const vote = async (id: string, status: 'no' | 'yes' | 'favorite') => {
    if (!currentUser) return;
    const nameObj = names.find(n => n.id === id);
    const ref = doc(db, 'baby-names', id);
    await updateDoc(ref, { [`votes.${currentUser}`]: status });
    if (nameObj) {
      console.log(`[App] ${currentUser} voted '${status}' on name '${nameObj.name}' (id: ${id})`);
    } else {
      console.log(`[App] ${currentUser} voted '${status}' on name id ${id}`);
    }
  };

  // Handler to pass to NameForm
  const handleNameAdded = (name?: string) => {
    if (name) setLastAddedName(name);
    setShowAddSuccess(true);
    setTimeout(() => setShowAddSuccess(false), 2000);
  };

  // Show welcome screen if no user selected
  if (!currentUser) {
    return (
      <CenteredScreen>
        <div className="bg-white/90 rounded-2xl shadow-xl px-8 py-8 flex flex-col items-center max-w-xs" style={{ marginTop: '5rem' }}>
          <span className="text-5xl mb-2">👶</span>
          <h1 className="text-2xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-fuchsia-400 to-amber-400 drop-shadow text-center">Welcome to Baby Name Swiper!</h1>
          <p className="text-fuchsia-700 mb-4 text-center">Who are you?</p>
          <div className="flex flex-row gap-4 w-full justify-center">
            <button onClick={() => handleUserSelect('Andreas')} className="bg-gradient-to-br from-fuchsia-400 to-sky-400 hover:from-fuchsia-500 hover:to-sky-500 text-white px-4 py-2 rounded-lg font-bold shadow transition-all duration-200 w-1/2">Andreas</button>
            <button onClick={() => handleUserSelect('Emilie')} className="bg-gradient-to-br from-amber-400 to-fuchsia-400 hover:from-amber-500 hover:to-fuchsia-500 text-white px-4 py-2 rounded-lg font-bold shadow transition-all duration-200 w-1/2">Emilie</button>
          </div>
        </div>
      </CenteredScreen>
    );
  }

  return (
    <div className="flex flex-col items-start justify-start min-h-screen w-full bg-gradient-to-br from-fuchsia-100 via-amber-100 to-sky-100" style={{ boxSizing: 'border-box', minHeight: '100dvh', width: '100vw' }}>
      <NavBar currentView={view} setView={setView} names={names} currentUser={currentUser} />
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
          <>
            <h1 className="text-2xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-fuchsia-400 to-amber-400 drop-shadow-lg text-center flex items-center justify-center gap-2" style={{letterSpacing: '0.01em'}}>
              <span role="img" aria-label="baby" className="text-5xl align-middle text-black bg-none" style={{color: '#222', background: 'none'}}>
                👶
              </span>
              <span>Baby Name Swiper</span>
            </h1>
            {/* Show logout button below headline on settings page */}
            {view === 'settings' && (
              <div className="w-full flex justify-center mb-6">
                <button
                  onClick={() => {
                    setCurrentUser(null);
                    window.localStorage.removeItem('currentUser');
                  }}
                  className="bg-gradient-to-br from-fuchsia-400 to-sky-400 hover:from-fuchsia-500 hover:to-sky-500 text-white px-6 py-2 rounded-lg font-bold shadow transition-all duration-200"
                >
                  Log out
                </button>
              </div>
            )}
          </>
        )}
        <div className="flex flex-col items-center w-full" style={{zIndex: 1}}>
          {view === 'main' && (
            <>
              {/* Pass names and currentUser to CardStack */}
              <CardStack names={names} currentUser={currentUser} />
              <div className="flex flex-row items-center justify-center w-full mt-2 mb-2">
                {/* Pass required props to SwipeButtons */}
                {/* <SwipeButtons
                  currentUser={currentUser}
                  top={names[0]}
                  vote={vote}
                  disabled={loading || !names.length}
                /> */}
              </div>
              <NameForm onNameAdded={handleNameAdded} />
              {/* Add NameListView here */}
            </>
          )}
          {view === 'settings' && (
            <div className="w-full flex flex-col items-center justify-center py-8">
              {/* Logout button is now shown below the headline via NavBar, so nothing else needed here */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

// No code changes needed here for port config. See vite.config.ts for port settings.
