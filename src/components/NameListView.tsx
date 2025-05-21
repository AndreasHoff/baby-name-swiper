import React from 'react';
import { useNameStore } from '../store';

export const NameListView: React.FC = () => {
  const names = useNameStore((s) => s.names);
  // Show all names, most recent on top
  const sorted = [...names].reverse();
  return (
    <div className="w-full max-w-[430px] pl-0 pr-2 mt-2 mx-auto">
      {/* App logo and name at the very top */}
      <div className="flex flex-row items-center justify-center gap-3 mt-2 mb-1">
        <span role="img" aria-label="baby" className="text-4xl align-middle">👶</span>
        <span className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-fuchsia-400 to-amber-400 drop-shadow">Baby Name Swiper</span>
      </div>
      {/* Headline for the list */}
      <h2 className="text-base font-semibold text-amber-700 mb-4 text-center">Your Name Choices</h2>
      <ul className="divide-y divide-gray-200 bg-white rounded-lg shadow overflow-x-auto scrollbar-thin scrollbar-thumb-fuchsia-200 scrollbar-track-transparent" style={{paddingRight: '1rem'}}>
        {sorted.map((n) => (
          <li key={n.id} className="flex flex-row items-center justify-between py-3 px-2">
            <span className={
              n.voteStatus === 'yes' ? 'text-green-600 font-bold' :
              n.voteStatus === 'no' ? 'text-red-500 font-bold' :
              n.voteStatus === 'absolutely-not' ? 'text-amber-600 font-bold' :
              'text-gray-400'
            }>
              {n.voteStatus ? (n.voteStatus === 'absolutely-not' ? 'ABSOLUTELY NOT' : n.voteStatus.toUpperCase()) : 'UNVOTED'}
            </span>
            <span className="font-semibold text-lg mx-2">{n.name}</span>
            <span className={
              n.gender === 'boy' ? 'text-sky-600' :
              n.gender === 'girl' ? 'text-fuchsia-600' :
              'text-amber-600'
            }>
              {n.gender}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};
