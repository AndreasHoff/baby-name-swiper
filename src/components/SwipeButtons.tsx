import React from 'react';
import { useNameStore } from '../store';

export const SwipeButtons: React.FC<{
  onSwipe?: (direction: 'no' | 'favorite' | 'yes') => void;
}> = ({ onSwipe }) => {
  const names = useNameStore((s) => s.names);
  const vote = useNameStore((s) => s.vote);
  // Only show cards the CURRENT user has not said yes to
  const currentUser = window.localStorage.getItem('currentUser') as 'Andreas' | 'Emilie' | null;
  // Only show names where votes[currentUser] !== 'yes'
  const unvoted = names.filter((n) => {
    if ((n as any).votes && currentUser) {
      return (n as any).votes[currentUser] !== 'yes';
    }
    return n.voteStatus !== 'yes';
  });
  const disabled = unvoted.length === 0;
  const top = unvoted[0];
  return (
    <div className="cardstack-buttons flex flex-row items-center justify-center w-[430px] max-w-full px-4 md:px-8 gap-4 mt-4 mx-auto" style={{flex: '0 0 auto'}}>
      <button
        className="flex-1 bg-gradient-to-br from-fuchsia-400 to-sky-400 hover:from-fuchsia-500 hover:to-sky-500 text-white font-bold py-3 px-0 rounded-full text-2xl shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => { if (!disabled) { vote(top.id, 'no'); onSwipe && onSwipe('no'); } }}
        aria-label="No"
        disabled={disabled}
      >
        ❌
      </button>
      <button
        className="flex-1 bg-gradient-to-br from-yellow-300 to-yellow-500 hover:from-yellow-400 hover:to-yellow-600 text-white font-bold py-3 px-0 rounded-full text-2xl shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => { if (!disabled) { vote(top.id, 'favorite'); onSwipe && onSwipe('favorite'); } }}
        aria-label="Favorite"
        disabled={disabled}
      >
        ⭐
      </button>
      <button
        className="flex-1 bg-gradient-to-br from-sky-400 to-amber-400 hover:from-sky-500 hover:to-amber-500 text-white font-bold py-3 px-0 rounded-full text-2xl shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => { if (!disabled) { vote(top.id, 'yes'); onSwipe && onSwipe('yes'); } }}
        aria-label="Yes"
        disabled={disabled}
      >
        ✅
      </button>
    </div>
  );
};
