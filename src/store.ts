import React from 'react';
import { create } from 'zustand';
// import { auth, onAuth, signInAnon } from './firebase';

export type VoteStatus = 'yes' | 'no' | 'absolutely-not' | null;
export type Gender = 'boy' | 'girl' | 'unisex';
export interface NameCard {
  id: number;
  name: string;
  gender: Gender;
  voteStatus: VoteStatus;
}

interface NameStore {
  names: NameCard[];
  vote: (id: number, status: VoteStatus) => void;
  addName: (name: string, gender: Gender) => void;
  resetVotes: () => void;
  setNames: (names: NameCard[]) => void;
}

// Helper to sync votes to Firestore
// async function syncVotesToFirestore(uid: string, names: NameCard[]) {
//   const liked = names.filter(n => n.voteStatus === 'yes').map(n => n.name);
//   const disliked = names.filter(n => n.voteStatus === 'no').map(n => n.name);
//   const absolutelyNot = names.filter(n => n.voteStatus === 'absolutely-not').map(n => n.name);
//   await setDoc(doc(db, 'users', uid), {
//     liked,
//     disliked,
//     absolutelyNot,
//     updated: new Date().toISOString(),
    // }, { merge: true });
// }

// Zustand store without Firestore sync
export const useNameStore = create<NameStore>((set /*, get */) => ({
  names: [],
  vote: (id, status) => {
    set((state) => {
      const updated = state.names.map((n) => n.id === id ? { ...n, voteStatus: status } : n);
      return { names: updated };
    });
  },
  addName: (name, gender) => set((state) => {
    const updated = [
      ...state.names,
      { id: Date.now(), name, gender, voteStatus: null },
    ];
    return { names: updated };
  }),
  resetVotes: () => set((state) => {
    const updated = state.names.map((n) => ({ ...n, voteStatus: null }));
    return { names: updated };
  }),
  setNames: (names) => set(() => ({ names })),
}));

export const useFetchNames = () => {
  const setNames = useNameStore((s) => s.setNames);
  React.useEffect(() => {
    fetch('/src/assets/largeNames.json')
      .then(res => res.json())
      .then(data => {
        const names = (Array.isArray(data) ? data : []).map((n, i) => ({
          id: i + 1,
          name: n.name,
          gender: n.gender || 'unisex',
          voteStatus: null,
        }));
        // Shuffle names
        for (let i = names.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [names[i], names[j]] = [names[j], names[i]];
        }
        setNames(names);
      })
      .catch(() => {
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
