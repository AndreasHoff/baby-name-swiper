import React from 'react';
import { useNameStore } from '../store';

export const SwipeButtons: React.FC = () => {
  // Only select the array and vote function from Zustand, do not filter in the selector!
  const names = useNameStore((s) => s.names);
  const vote = useNameStore((s) => s.vote);
  const unvoted = names.filter((n) => n.voteStatus === null);
  if (unvoted.length === 0) return null;
  const top = unvoted[0];
  return (
    <div className="flex justify-center gap-4 mt-4">
      <button
        className="bg-red-200 hover:bg-red-400 text-red-900 font-bold py-2 px-4 rounded-full text-xl"
        onClick={() => vote(top.id, 'no')}
        aria-label="No"
      >
        ❌
      </button>
      <button
        className="bg-gray-200 hover:bg-gray-400 text-gray-900 font-bold py-2 px-4 rounded-full text-xl"
        onClick={() => vote(top.id, 'absolutely-not')}
        aria-label="Absolutely Not"
      >
        🚫
      </button>
      <button
        className="bg-green-200 hover:bg-green-400 text-green-900 font-bold py-2 px-4 rounded-full text-xl"
        onClick={() => vote(top.id, 'yes')}
        aria-label="Yes"
      >
        ✅
      </button>
    </div>
  );
};
