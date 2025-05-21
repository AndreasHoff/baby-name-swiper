import { addDoc, collection, doc, getDocs, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import React from 'react';
import { create } from 'zustand';
import { auth, db } from './firebase';

export type VoteStatus = 'yes' | 'no' | 'favorite' | null;
export type Gender = 'boy' | 'girl' | 'unisex';
export type NameCard = {
  id: string;
  name: string;
  gender: Gender;
  voteStatus: VoteStatus;
  votes?: { Andreas?: VoteStatus; Emilie?: VoteStatus };
  isAMatch?: boolean;
  favorite?: boolean;
};

// Add a new state for other user's votes
interface NameStore {
  names: NameCard[];
  vote: (id: string, status: VoteStatus) => void;
  addName: (name: string, gender: Gender) => void;
  updateVoteStatus: (id: string, status: VoteStatus) => Promise<void>;
  resetVotes: () => void;
  setNames: (names: NameCard[]) => void;
  otherUserVotes?: Record<string, string>; // nameId -> voteStatus
  setOtherUserVotes: (votes: Record<string, string>) => void;
}

// Zustand store without Firestore sync
export const useNameStore = create<NameStore>((set) => ({
  names: [],
  vote: async (id, status) => {
    set((state) => {
      const updated = state.names.map((n) => n.id === id ? { ...n, voteStatus: status } : n);
      return { names: updated };
    });
    // Update Firestore: set votes.<user> = status and update isAMatch
    const currentUser = window.localStorage.getItem('currentUser') as 'Andreas' | 'Emilie' | null;
    if (currentUser) {
      // Get the latest votes for this name
      const nameDocRef = doc(db, 'baby-names', id);
      const nameDocSnap = await import('firebase/firestore').then(({ getDoc }) => getDoc(nameDocRef));
      let votes = { Andreas: null, Emilie: null };
      if (nameDocSnap.exists() && nameDocSnap.data().votes) {
        votes = nameDocSnap.data().votes;
      }
      // Defensive: clone votes to avoid mutation issues
      votes = { ...votes, [currentUser]: status };
      // Determine if it's a match
      const isAMatch = votes.Andreas === 'yes' && votes.Emilie === 'yes';
      // If favorite, also set favorite: true
      if (status === 'favorite') {
        await updateDoc(nameDocRef, {
          [`votes.${currentUser}`]: status,
          // UI: To check for a favorite match, compare votes.Andreas === 'favorite' && votes.Emilie === 'favorite'
          isAMatch: isAMatch
        });
      } else {
        // Only update the votes map and isAMatch
        await updateDoc(nameDocRef, {
          [`votes.${currentUser}`]: status,
          isAMatch: isAMatch
        });
        // UI: To check for a favorite match, compare votes.Andreas === 'favorite' && votes.Emilie === 'favorite'
      }
    }
  },
  addName: async (name, gender) => {
    // Check for duplicate (case-insensitive)
    const q = query(collection(db, 'baby-names'), where('name', '==', name));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      // Throw a special error for duplicate
      throw new Error('DUPLICATE_NAME');
    }
    // Add to Firestore with votes object for both users
    await addDoc(collection(db, 'baby-names'), {
      name,
      gender,
      created: new Date().toISOString(),
      votes: { Andreas: null, Emilie: null }
    });
  },
  updateVoteStatus: async (id, status) => {
    // Remove global voteStatus update, only store per-user votes
    const user = auth.currentUser;
    if (user) {
      await import('firebase/firestore').then(({ doc, setDoc }) =>
        setDoc(
          doc(db, 'users', user.uid, 'votes', id),
          { voteStatus: status },
          { merge: true }
        )
      );
    }
  },
  resetVotes: () => set((state) => {
    const updated = state.names.map((n) => ({ ...n, voteStatus: null }));
    return { names: updated };
  }),
  setNames: (names) => set(() => ({ names })),
  setOtherUserVotes: (votes: Record<string, string>) => set(() => ({ otherUserVotes: votes })),
}));

export const useFetchNames = () => {
  const setNames = useNameStore((s) => s.setNames);
  React.useEffect(() => {
    // Listen for real-time updates from Firestore
    const unsub = onSnapshot(collection(db, 'baby-names'), (snapshot) => {
      const names = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          gender: data.gender || 'unisex',
          voteStatus: null, // Will be set per-user below
          votes: data.votes || {},
          isAMatch: data.isAMatch || false,
        };
      });
      setNames(names as any);
    });
    return () => unsub();
  }, [setNames]);
};

// Utility to fetch another user's votes by displayName
export async function fetchOtherUserVotes(displayName: string): Promise<Record<string, string>> {
  // Find user by displayName
  const usersSnap = await getDocs(collection(db, 'users'));
  let otherUserId: string | null = null;
  usersSnap.forEach(doc => {
    if (doc.data().displayName === displayName) {
      otherUserId = doc.id;
    }
  });
  if (!otherUserId) return {};
  // Fetch votes subcollection
  const votesSnap = await getDocs(collection(db, 'users', otherUserId, 'votes'));
  const votes: Record<string, string> = {};
  votesSnap.forEach(doc => {
    votes[doc.id] = doc.data().voteStatus;
  });
  return votes;
}