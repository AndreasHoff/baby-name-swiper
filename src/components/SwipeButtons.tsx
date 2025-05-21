import React from 'react';
import { useNameStore } from '../store';

export const SwipeButtons: React.FC<{
  onSwipe?: (direction: 'no' | 'absolutely-not' | 'yes') => void;
}> = ({ onSwipe }) => {
  const names = useNameStore((s) => s.names);
  const vote = useNameStore((s) => s.vote);
  const unvoted = names.filter((n) => n.voteStatus === null);
  if (unvoted.length === 0) return null;
  const top = unvoted[0];
  return (
    <div className="cardstack-buttons flex flex-row items-center justify-center w-[430px] max-w-full px-4 md:px-8 gap-4 mt-4 mx-auto" style={{flex: '0 0 auto'}}>
      <button
        className="flex-1 bg-gradient-to-br from-fuchsia-400 to-sky-400 hover:from-fuchsia-500 hover:to-sky-500 text-white font-bold py-3 px-0 rounded-full text-2xl shadow-lg transition-all duration-200"
        onClick={() => { vote(top.id, 'no'); onSwipe && onSwipe('no'); }}
        aria-label="No"
      >
        ❌
      </button>
      <button
        className="flex-1 bg-gradient-to-br from-amber-400 to-fuchsia-400 hover:from-amber-500 hover:to-fuchsia-500 text-white font-bold py-3 px-0 rounded-full text-2xl shadow-lg transition-all duration-200"
        onClick={() => { vote(top.id, 'absolutely-not'); onSwipe && onSwipe('absolutely-not'); }}
        aria-label="Absolutely Not"
      >
        🚫
      </button>
      <button
        className="flex-1 bg-gradient-to-br from-sky-400 to-amber-400 hover:from-sky-500 hover:to-amber-500 text-white font-bold py-3 px-0 rounded-full text-2xl shadow-lg transition-all duration-200"
        onClick={() => { vote(top.id, 'yes'); onSwipe && onSwipe('yes'); }}
        aria-label="Yes"
      >
        ✅
      </button>
    </div>
  );
};
