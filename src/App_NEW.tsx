import { addDoc, collection, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import './App.css';
import { MainLayout } from './components/MainLayout';
import NavBar from './components/NavBar';
import { db } from './firebase';

// Define the Name interface
interface Name {
  id: string;
  name: string;
  gender: 'boy' | 'girl';
  votes: Record<string, 'yes' | 'no' | 'favorite'>;
}

interface CenteredScreenProps {
  children: React.ReactNode;
}

function CenteredScreen({ children }: CenteredScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-gradient-to-br from-fuchsia-100 via-amber-100 to-sky-100">
      {children}
    </div>
  );
}

function App() {
  const [currentUser, setCurrentUser] = useState<'Andreas' | 'Emilie' | null>(null);
  const [view, setView] = useState<'main' | 'lists' | 'settings'>('main');
  const [names, setNames] = useState<Name[]>([]);
  const [showAddSuccess, setShowAddSuccess] = useState(false);
  const [lastAddedName, setLastAddedName] = useState('');

  useEffect(() => {
    const savedUser = window.localStorage.getItem('currentUser') as 'Andreas' | 'Emilie' | null;
    if (savedUser) {
      setCurrentUser(savedUser);
    }
  }, []);

  const handleUserSelect = (user: 'Andreas' | 'Emilie') => {
    setCurrentUser(user);
    window.localStorage.setItem('currentUser', user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    window.localStorage.removeItem('currentUser');
    setView('main');
  };

  useEffect(() => {
    const fetchNames = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'baby-names'));
        const fetchedNames: Name[] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Name[];
        setNames(fetchedNames);
      } catch (error) {
        console.error('Error fetching names:', error);
      }
    };

    if (currentUser) {
      fetchNames();
    }
  }, [currentUser]);

  const handleNameAdded = async (name: string, gender: 'boy' | 'girl') => {
    try {
      const docRef = await addDoc(collection(db, 'baby-names'), {
        name: name,
        gender: gender,
        votes: {}
      });
      
      const newName: Name = {
        id: docRef.id,
        name: name,
        gender: gender,
        votes: {}
      };
      
      setNames(prev => [...prev, newName]);
      setLastAddedName(name);
      setShowAddSuccess(true);
      
      setTimeout(() => {
        setShowAddSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error adding name:', error);
    }
  };

  // User selection screen
  if (!currentUser) {
    return (
      <CenteredScreen>
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 border border-white/40">
          <h1 className="text-3xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-fuchsia-400 to-amber-400 drop-shadow-lg text-center flex items-center justify-center gap-3">
            <span role="img" aria-label="baby" className="text-6xl">👶</span>
            <span>Baby Name Swiper</span>
          </h1>
          <p className="text-fuchsia-700 text-center mb-6 font-semibold text-lg">Choose your profile:</p>
          <div className="flex gap-4">
            <button onClick={() => handleUserSelect('Andreas')} className="bg-gradient-to-br from-fuchsia-400 to-sky-400 hover:from-fuchsia-500 hover:to-sky-500 text-white px-4 py-2 rounded-lg font-bold shadow transition-all duration-200 w-1/2">Andreas</button>
            <button onClick={() => handleUserSelect('Emilie')} className="bg-gradient-to-br from-amber-400 to-fuchsia-400 hover:from-amber-500 hover:to-fuchsia-500 text-white px-4 py-2 rounded-lg font-bold shadow transition-all duration-200 w-1/2">Emilie</button>
          </div>
        </div>
      </CenteredScreen>
    );
  }

  return (
    <div className="flex flex-col min-h-screen w-full bg-gradient-to-br from-fuchsia-100 via-amber-100 to-sky-100">
      {/* Fixed NavBar at top */}
      <div className="sticky top-0 z-50">
        <NavBar currentView={view} setView={setView} />
      </div>

      {/* Success notification */}
      <div className="fixed top-20 left-0 w-full flex justify-center z-40 pointer-events-none">
        <div
          className="px-6 py-3 rounded-2xl shadow-xl font-bold text-base flex items-center justify-center text-fuchsia-600 drop-shadow-lg text-center transition-all duration-500"
          style={{
            maxWidth: 420,
            minWidth: 220,
            background: 'linear-gradient(135deg, #bae6fd 0%, #f5d0fe 60%, #fef3c7 100%)',
            border: 'none',
            boxShadow: '0 8px 24px 0 rgba(236, 72, 153, 0.10)',
            transform: showAddSuccess ? 'translateY(0)' : 'translateY(-150%)',
            opacity: showAddSuccess ? 1 : 0
          }}
        >
          <span className="mr-2 text-xl">🎉</span>
          <span className="mx-1 text-fuchsia-700">{lastAddedName}</span> added successfully
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 px-4 py-6">
        <MainLayout
          currentView={view}
          names={names}
          currentUser={currentUser}
          onNameAdded={handleNameAdded}
          onLogout={handleLogout}
        />
      </div>
    </div>
  );
}

export default App;
