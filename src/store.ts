import { addDoc, collection, getDocs } from 'firebase/firestore';
import React from 'react';
import { create } from 'zustand';
import { db } from './firebase';

export type VoteStatus = 'yes' | 'no' | 'absolutely-not' | null;
export type Gender = 'boy' | 'girl' | 'unisex';
export type NameCard = {
  id: string;
  name: string;
  gender: Gender;
  voteStatus: VoteStatus;
};

interface NameStore {
  names: NameCard[];
  vote: (id: string, status: VoteStatus) => void;
  addName: (name: string, gender: Gender) => void;
  resetVotes: () => void;
  setNames: (names: NameCard[]) => void;
}

// Zustand store without Firestore sync
export const useNameStore = create<NameStore>((set /*, get */) => ({
  names: [],
  vote: (id, status) => {
    set((state) => {
      const updated = state.names.map((n) => n.id === id ? { ...n, voteStatus: status } : n);
      return { names: updated };
    });
  },
  addName: async (name, gender) => {
    // Add to Firestore
    await addDoc(collection(db, 'baby-names'), {
      name,
      gender,
      voteStatus: null,
      created: new Date().toISOString(),
    });
    // Optionally, you can optimistically update local state or re-fetch
  },
  resetVotes: () => set((state) => {
    const updated = state.names.map((n) => ({ ...n, voteStatus: null }));
    return { names: updated };
  }),
  setNames: (names) => set(() => ({ names })),
}));

export const useFetchNames = () => {
  const setNames = useNameStore((s) => s.setNames);
  React.useEffect(() => {
    // Fetch from Firestore instead of local JSON
    getDocs(collection(db, 'baby-names')).then(snapshot => {
      const names = snapshot.docs.map((doc) => ({
        id: doc.id, // Use Firestore string id
        name: doc.data().name,
        gender: doc.data().gender || 'unisex',
        voteStatus: doc.data().voteStatus ?? null,
      }));
      // Shuffle names
      for (let i = names.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [names[i], names[j]] = [names[j], names[i]];
      }
      setNames(names as any); // Type assertion to satisfy NameCard[]
    }).catch(() => {
      setNames([]);
    });
  }, [setNames]);
};

// On app load, sign in anonymously and load user data
// if (typeof window !== 'undefined') {
//   onAuth(async (user) => {
//     if (user) {
//       const snap = await getDoc(doc(db, 'users', user.uid));
//       if (snap.exists()) {
//         const data = snap.data();
//         useNameStore.setState((state) => {
//           const names = state.names.map(n => {
//             if (data.liked?.includes(n.name)) return { ...n, voteStatus: 'yes' as VoteStatus };
//             if (data.disliked?.includes(n.name)) return { ...n, voteStatus: 'no' as VoteStatus };
//             if (data.absolutelyNot?.includes(n.name)) return { ...n, voteStatus: 'absolutely-not' as VoteStatus };
//             return { ...n, voteStatus: null };
//           });
//           return { names };
//         });
//       }
//     } else {
//       signInAnon();
//     }
//   });
// }
