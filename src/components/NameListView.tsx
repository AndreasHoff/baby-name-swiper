import React, { useEffect, useState } from 'react';
import { fetchOtherUserVotes, useNameStore } from '../store';

export const NameListView: React.FC<{ otherUserName?: string }> = ({ otherUserName }) => {
  const names = useNameStore((s) => s.names);
  const otherUserVotes = useNameStore((s) => s.otherUserVotes) || {};
  const setOtherUserVotes = useNameStore((s) => s.setOtherUserVotes);

  // Fetch other user's votes on mount if otherUserName is provided
  useEffect(() => {
    if (otherUserName) {
      fetchOtherUserVotes(otherUserName).then(setOtherUserVotes);
    }
  }, [otherUserName, setOtherUserVotes]);

  // Get current user from localStorage
  const currentUser = window.localStorage.getItem('currentUser') as 'Andreas' | 'Emilie' | null;
  // Use votes[currentUser] for filtering and display
  const yesNames = names.filter(n => n.votes && currentUser && n.votes[currentUser] === 'yes').reverse();
  // Per-user favorites
  const favoriteNames = names.filter(
    n => n.votes && currentUser && n.votes[currentUser] === 'favorite'
  ).reverse();
  // Use isAMatch from Firestore for highlighting
  const allSorted = [...names].reverse();
  // Accordion state
  const [showAll, setShowAll] = useState(false);
  // Pagination state for all names
  const PAGE_SIZE = 6;
  const [page, setPage] = useState(1);
  const pagedNames = allSorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(allSorted.length / PAGE_SIZE);

  return (
    <div className="w-full max-w-[430px] pl-0 pr-2 mt-2 mx-auto">
      {/* App logo and name at the very top */}
      <div className="flex flex-row items-center justify-center gap-3 mt-2 mb-1">
        <span role="img" aria-label="baby" className="text-4xl align-middle">👶</span>
        <span className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-fuchsia-400 to-amber-400 drop-shadow">Baby Name Swiper</span>
      </div>
      {/* Headline for the favorites section */}
      <h2 className="text-base font-semibold text-yellow-700 mb-2 text-center">Names You Favorited</h2>
      <ul className="divide-y divide-gray-200 bg-white rounded-lg shadow overflow-x-auto mb-4 scrollbar-thin scrollbar-thumb-fuchsia-200 scrollbar-track-transparent">
        {favoriteNames.length === 0 && (
          <li className="py-3 px-2 text-center text-gray-400">No favorites yet.</li>
        )}
        {favoriteNames.map((n) => {
          // Check for favorite match
          const isFavoriteMatch = n.votes?.Andreas === 'favorite' && n.votes?.Emilie === 'favorite';
          return (
            <li key={n.id}
              className={
                'flex flex-row items-center justify-between py-3 px-2 ' +
                (isFavoriteMatch ? 'bg-yellow-200 bg-opacity-80' : 'bg-yellow-50')
              }
              style={isFavoriteMatch
                ? { background: 'linear-gradient(90deg, #fef08a 0%, #fde047 60%, #fef3c7 100%)' }
                : { background: 'linear-gradient(90deg, #fef9c3 0%, #fde68a 60%, #fef3c7 100%)' }}
            >
              <span className="text-yellow-500 font-bold flex items-center gap-1">
                {isFavoriteMatch ? 'FAVORITE MATCH' : 'FAVORITE'} <span role="img" aria-label="star">⭐</span>
              </span>
              <span className="font-semibold text-lg mx-2">{n.name}</span>
              <span className={
                n.gender === 'boy' ? 'text-sky-600' :
                n.gender === 'girl' ? 'text-fuchsia-600' :
                'text-amber-600'
              }>{n.gender}</span>
            </li>
          );
        })}
      </ul>
      {/* Headline for the list */}
      <h2 className="text-base font-semibold text-amber-700 mb-2 text-center">Names You Said YES To</h2>
      <ul className="divide-y divide-gray-200 bg-white rounded-lg shadow overflow-x-auto mb-4 scrollbar-thin scrollbar-thumb-fuchsia-200 scrollbar-track-transparent">
        {yesNames.length === 0 && (
          <li className="py-3 px-2 text-center text-gray-400">No names voted YES yet.</li>
        )}
        {yesNames.map((n) => {
          const otherVote = otherUserVotes[n.id];
          const isAMatch = (n as any).isAMatch;
          // Label: 'MATCH' if match, otherwise 'YES'
          const label = isAMatch ? 'MATCH' : 'YES';
          return (
            <li key={n.id}
              className={
                'flex flex-row items-center justify-between py-3 px-2' +
                (isAMatch ? ' bg-pink-100 bg-opacity-80' : '')
              }
              style={isAMatch ? { background: 'linear-gradient(90deg, #fbcfe8 0%, #f5d0fe 60%, #fef3c7 100%)' } : { background: 'white' }}
            >
              <span className={
                isAMatch
                  ? 'text-1xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-fuchsia-400 to-amber-400 drop-shadow'
                  : 'text-green-600 font-bold'
              }>{label}</span>
              <span className="font-semibold text-lg mx-2">{n.name}</span>
              <span className={
                n.gender === 'boy' ? 'text-sky-600' :
                n.gender === 'girl' ? 'text-fuchsia-600' :
                'text-amber-600'
              }>{n.gender}</span>
              {otherVote && (
                <span className="ml-2 text-xs text-fuchsia-700 font-semibold">Other: {otherVote.toUpperCase()}</span>
              )}
            </li>
          );
        })}
      </ul>
      {/* Accordion for all names with pagination */}
      <div className="mb-2">
        <button
          className="w-full flex items-center justify-between px-4 py-2 bg-gradient-to-r from-fuchsia-100 via-amber-100 to-sky-100 rounded-lg font-semibold text-fuchsia-700 shadow hover:bg-fuchsia-50 transition-all"
          onClick={() => setShowAll(v => !v)}
          aria-expanded={showAll}
        >
          <span>Show {showAll ? 'Less' : 'All Names'}</span>
          <span className={`transition-transform ${showAll ? 'rotate-180' : ''}`}>▼</span>
        </button>
        {showAll && (
          <>
            <ul className="divide-y divide-gray-200 bg-white rounded-lg shadow overflow-x-auto mt-2 scrollbar-thin scrollbar-thumb-fuchsia-200 scrollbar-track-transparent" style={{paddingRight: '1rem'}}>
              {pagedNames.map((n) => {
                const userVote = n.votes && currentUser ? n.votes[currentUser] : null;
                return (
                  <li key={n.id} className="flex flex-row items-center justify-between py-3 px-2">
                    <span className={
                      userVote === 'yes' ? 'text-green-600 font-bold' :
                      userVote === 'no' ? 'text-red-500 font-bold' :
                      userVote === 'favorite' ? 'text-yellow-500 font-bold flex items-center gap-1' :
                      'text-gray-400'
                    }>
                      {userVote === 'favorite' ? <><span>FAVORITE</span> <span role="img" aria-label="star">⭐</span></> : userVote ? userVote.toUpperCase() : 'UNVOTED'}
                    </span>
                    <span className="font-semibold text-lg mx-2">{n.name}</span>
                    <span className={
                      n.gender === 'boy' ? 'text-sky-600' :
                      n.gender === 'girl' ? 'text-fuchsia-600' :
                      'text-amber-600'
                    }>{n.gender}</span>
                  </li>
                );
              })}
            </ul>
            {/* Pagination controls */}
            <div className="flex justify-center items-center gap-2 mt-2">
              <button
                className="px-3 py-1 rounded bg-fuchsia-100 text-fuchsia-700 font-semibold disabled:opacity-50"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </button>
              <span className="text-sm font-medium text-fuchsia-700">Page {page} of {totalPages}</span>
              <button
                className="px-3 py-1 rounded bg-fuchsia-100 text-fuchsia-700 font-semibold disabled:opacity-50"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
