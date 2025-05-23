import React, { useEffect, useState } from 'react';

// Accept allNames, userVotes, and currentUser as props
export const NameListView: React.FC<{ allNames: any[]; userVotes: Record<string, string>; currentUser: string }> = ({ allNames, userVotes, currentUser }) => {
  const [freshNames, setFreshNames] = useState<any[]>(allNames);

  useEffect(() => {
    setFreshNames(allNames);
  }, [allNames]);

  if (!Array.isArray(allNames) || !currentUser) return null;

  console.log('[NameListView] Rendering. allNames:', allNames.length, 'userVotes:', Object.keys(userVotes).length, 'currentUser:', currentUser);

  // Partition names by userVotes
  const favoriteNames = freshNames.filter(n => userVotes[n.id] === 'favorite');
  const yesNames = freshNames.filter(n => userVotes[n.id] === 'yes');
  const restNames = freshNames.filter(n => !['yes', 'favorite'].includes(userVotes[n.id]));
  console.log('[NameListView] Partitioned. Favorites:', favoriteNames.length, 'Yes:', yesNames.length, 'Rest:', restNames.length);

  // Pagination state for 'Other Names'
  const [page, setPage] = useState(0);
  const pageSize = 7;
  const pageSizeYes = 3;
  const pageSizeFavorites = 3;
  const totalPages = Math.ceil(restNames.length / pageSize);
  const pagedRestNames = restNames.slice(page * pageSize, (page + 1) * pageSize);

  // Pagination for Yes
  const [pageYes, setPageYes] = useState(0);
  const totalPagesYes = Math.ceil(yesNames.length / pageSizeYes);
  const pagedYesNames = yesNames.slice(pageYes * pageSizeYes, (pageYes + 1) * pageSizeYes);
  useEffect(() => {
    if (pageYes > 0 && pageYes >= totalPagesYes) setPageYes(0);
  }, [yesNames.length, totalPagesYes]);

  // Pagination for Favorites
  const [pageFavorites, setPageFavorites] = useState(0);
  const totalPagesFavorites = Math.ceil(favoriteNames.length / pageSizeFavorites);
  const pagedFavoriteNames = favoriteNames.slice(pageFavorites * pageSizeFavorites, (pageFavorites + 1) * pageSizeFavorites);
  useEffect(() => {
    if (pageFavorites > 0 && pageFavorites >= totalPagesFavorites) setPageFavorites(0);
  }, [favoriteNames.length, totalPagesFavorites]);

  return (
    <div className="w-full max-w-[430px] pl-0 pr-2 mt-2 mx-auto">
      {/* App logo and name at the very top */}
      <div className="flex flex-row items-center justify-center gap-3 mt-2 mb-1">
        <span role="img" aria-label="baby" className="text-4xl align-middle">👶</span>
        <span className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-fuchsia-400 to-amber-400 drop-shadow">Baby Name Swiper</span>
      </div>
      {/* Favorites */}
      <h2 className="text-base font-semibold text-yellow-700 mb-2 text-center">Favorites</h2>
      <ul className="divide-y divide-gray-200 bg-white rounded-lg shadow overflow-x-auto mb-4">
        {pagedFavoriteNames.length === 0 && <li className="py-3 px-2 text-center text-gray-400">No favorites yet.</li>}
        {pagedFavoriteNames.map(n => (
          <li key={n.id} className="relative flex items-center py-3 px-2 bg-yellow-50 min-h-[48px]">
            <span className="absolute left-2 text-yellow-500 font-bold flex items-center gap-1">FAVORITE <span role='img' aria-label='star'>⭐</span></span>
            <span className="mx-auto font-semibold text-lg text-center w-full pointer-events-none select-none" style={{position:'relative',zIndex:1}}>{n.name}</span>
            <span className={n.gender === 'boy' ? 'absolute right-2 text-sky-600' : 'absolute right-2 text-fuchsia-600'}>{n.gender}</span>
          </li>
        ))}
      </ul>
      {/* Paginator for Favorites */}
      {totalPagesFavorites > 1 && (
        <div className="flex justify-center items-center gap-2 mb-4">
          <button
            className="px-3 py-1 rounded bg-yellow-100 text-yellow-700 font-bold disabled:opacity-40"
            onClick={() => setPageFavorites(p => Math.max(0, p - 1))}
            disabled={pageFavorites === 0}
          >
            Prev
          </button>
          <span className="text-sm font-semibold text-gray-600">Page {pageFavorites + 1} of {totalPagesFavorites}</span>
          <button
            className="px-3 py-1 rounded bg-yellow-100 text-yellow-700 font-bold disabled:opacity-40"
            onClick={() => setPageFavorites(p => Math.min(totalPagesFavorites - 1, p + 1))}
            disabled={pageFavorites === totalPagesFavorites - 1}
          >
            Next
          </button>
        </div>
      )}
      {/* Yes */}
      <h2 className="text-base font-semibold text-green-700 mb-2 text-center">Yes</h2>
      <ul className="divide-y divide-gray-200 bg-white rounded-lg shadow overflow-x-auto mb-4">
        {pagedYesNames.length === 0 && <li className="py-3 px-2 text-center text-gray-400">No yes yet.</li>}
        {pagedYesNames.map(n => (
          <li key={n.id} className="relative flex items-center py-3 px-2 bg-green-50 min-h-[48px]">
            <span className="absolute left-2 text-green-600 font-bold">YES</span>
            <span className="mx-auto font-semibold text-lg text-center w-full pointer-events-none select-none" style={{position:'relative',zIndex:1}}>{n.name}</span>
            <span className={n.gender === 'boy' ? 'absolute right-2 text-sky-600' : 'absolute right-2 text-fuchsia-600'}>{n.gender}</span>
          </li>
        ))}
      </ul>
      {/* Paginator for Yes */}
      {totalPagesYes > 1 && (
        <div className="flex justify-center items-center gap-2 mb-4">
          <button
            className="px-3 py-1 rounded bg-green-100 text-green-700 font-bold disabled:opacity-40"
            onClick={() => setPageYes(p => Math.max(0, p - 1))}
            disabled={pageYes === 0}
          >
            Prev
          </button>
          <span className="text-sm font-semibold text-gray-600">Page {pageYes + 1} of {totalPagesYes}</span>
          <button
            className="px-3 py-1 rounded bg-green-100 text-green-700 font-bold disabled:opacity-40"
            onClick={() => setPageYes(p => Math.min(totalPagesYes - 1, p + 1))}
            disabled={pageYes === totalPagesYes - 1}
          >
            Next
          </button>
        </div>
      )}
      {/* Rest */}
      <h2 className="text-base font-semibold text-gray-700 mb-2 text-center">Other Names</h2>
      <ul className="divide-y divide-gray-200 bg-white rounded-lg shadow overflow-x-auto mb-4">
        {pagedRestNames.length === 0 && <li className="py-3 px-2 text-center text-gray-400">No other names.</li>}
        {pagedRestNames.map(n => (
          <li key={n.id} className="relative flex items-center py-3 px-2 min-h-[48px]">
            <span className="absolute left-2 text-gray-500 font-bold">{userVotes[n.id] === 'no' ? 'NO' : 'UNVOTED'}</span>
            <span className="mx-auto font-semibold text-lg text-center w-full pointer-events-none select-none" style={{position:'relative',zIndex:1}}>{n.name}</span>
            <span className={n.gender === 'boy' ? 'absolute right-2 text-sky-600' : 'absolute right-2 text-fuchsia-600'}>{n.gender}</span>
          </li>
        ))}
      </ul>
      {/* Paginator for Other Names */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mb-4">
          <button
            className="px-3 py-1 rounded bg-fuchsia-100 text-fuchsia-700 font-bold disabled:opacity-40"
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
          >
            Prev
          </button>
          <span className="text-sm font-semibold text-gray-600">Page {page + 1} of {totalPages}</span>
          <button
            className="px-3 py-1 rounded bg-fuchsia-100 text-fuchsia-700 font-bold disabled:opacity-40"
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
