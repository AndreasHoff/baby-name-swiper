import { create } from 'zustand';
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
}

export const useNameStore = create<NameStore>((set) => ({
  names: mockNames,
  vote: (id, status) => set((state) => ({
    names: state.names.map((n) => n.id === id ? { ...n, voteStatus: status } : n),
  })),
  addName: (name, gender) => set((state) => ({
    names: [
      ...state.names,
      { id: Date.now(), name, gender, voteStatus: null },
    ],
  })),
  resetVotes: () => set((state) => ({
    names: state.names.map((n) => ({ ...n, voteStatus: null })),
  })),
}));
