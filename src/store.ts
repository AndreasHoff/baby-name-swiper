import { doc, getDoc, setDoc } from 'firebase/firestore';
import React from 'react';
import { create } from 'zustand';
import { auth, db, onAuth, signInAnon } from './firebase';
import { mockNames } from './mockNames';

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
async function syncVotesToFirestore(uid: string, names: NameCard[]) {
  const liked = names.filter(n => n.voteStatus === 'yes').map(n => n.name);
  const disliked = names.filter(n => n.voteStatus === 'no').map(n => n.name);
  const absolutelyNot = names.filter(n => n.voteStatus === 'absolutely-not').map(n => n.name);
  await setDoc(doc(db, 'users', uid), {
    liked,
    disliked,
    absolutelyNot,
    updated: new Date().toISOString(),
  }, { merge: true });
}

// Zustand store with Firestore sync
export const useNameStore = create<NameStore>((set, get) => ({
  names: mockNames,
  vote: (id, status) => {
    set((state) => {
      const updated = state.names.map((n) => n.id === id ? { ...n, voteStatus: status } : n);
      // Sync to Firestore if user is logged in
      if (auth.currentUser) {
        syncVotesToFirestore(auth.currentUser.uid, updated);
      }
      return { names: updated };
    });
  },
  addName: (name, gender) => set((state) => {
    const updated = [
      ...state.names,
      { id: Date.now(), name, gender, voteStatus: null },
    ];
    if (auth.currentUser) {
      syncVotesToFirestore(auth.currentUser.uid, updated);
    }
    return { names: updated };
  }),
  resetVotes: () => set((state) => {
    const updated = state.names.map((n) => ({ ...n, voteStatus: null }));
    if (auth.currentUser) {
      syncVotesToFirestore(auth.currentUser.uid, updated);
    }
    return { names: updated };
  }),
  setNames: (names) => set(() => ({ names })),
}));

export const useFetchNames = () => {
  const setNames = useNameStore((s) => s.setNames);
  React.useEffect(() => {
    fetch("https://api.statbank.dk/v1/data/BEF1A07", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        format: "JSON", // <-- Required for StatBank API
        variables: [
          { code: "KØN", values: ["1", "2"] }, // 1 = boy, 2 = girl
          { code: "TID", values: ["2023"] }     // Latest available year
        ]
      })
    })
      .then(res => res.json())
      .then(data => {
        // The API returns an array of objects in data.data, each with a value (the name)
        const names = (data.data || []).map((d: any, i: number) => ({
          id: i + 1,
          name: d.value,
          gender: 'unisex' as Gender, // The API does not distinguish gender in this response
          voteStatus: null,
        })).filter((n: { name: string }) => n.name && typeof n.name === 'string');
        // Shuffle names
        for (let i = names.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [names[i], names[j]] = [names[j], names[i]];
        }
        setNames(names);
      })
      .catch((err) => {
        setNames([]);
        console.error('Failed to fetch names from StatBank Denmark API:', err);
      });
  }, [setNames]);
};

// On app load, sign in anonymously and load user data
if (typeof window !== 'undefined') {
  onAuth(async (user) => {
    if (user) {
      const snap = await getDoc(doc(db, 'users', user.uid));
      if (snap.exists()) {
        const data = snap.data();
        // Optionally, merge Firestore votes into Zustand state
        // (Assumes names are already loaded)
        useNameStore.setState((state) => {
          const names = state.names.map(n => {
            if (data.liked?.includes(n.name)) return { ...n, voteStatus: 'yes' as VoteStatus };
            if (data.disliked?.includes(n.name)) return { ...n, voteStatus: 'no' as VoteStatus };
            if (data.absolutelyNot?.includes(n.name)) return { ...n, voteStatus: 'absolutely-not' as VoteStatus };
            return { ...n, voteStatus: null };
          });
          return { names };
        });
      }
    } else {
      signInAnon();
    }
  });
}
