import { collection, getDocs } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { getCategoriesForName, getCategoryById } from '../utils/nameCategories';

// Accept allNames, userVotes, and currentUser as props
export const NameListView: React.FC<{ allNames: any[]; userVotes: Record<string, string>; otherUserVotes: Record<string, string>; currentUser: string }> = ({ allNames, userVotes, otherUserVotes, currentUser }) => {
  const [freshNames, setFreshNames] = useState<any[]>(allNames);
  const [totalNames, setTotalNames] = useState<number>(allNames.length);

  useEffect(() => {
    setFreshNames(allNames);
  }, [allNames]);

  // Fetch total count of baby-names from Firestore for the header
  useEffect(() => {
    async function fetchTotalNames() {
      try {
        const snap = await getDocs(collection(db, 'baby-names'));
        setTotalNames(snap.size);
      } catch (e) {
        console.error('[NameListView] Failed to fetch total baby-names:', e);
      }
    }
    fetchTotalNames();
  }, []);

  if (!Array.isArray(allNames) || !currentUser) return null;

  console.log('[NameListView] Rendering. allNames:', allNames.length, 'userVotes:', Object.keys(userVotes).length, 'currentUser:', currentUser);

  // Partition names by userVotes
  const favoriteNames = freshNames.filter(n => userVotes[String(n.id)] === 'favorite');
  const yesNames = freshNames.filter(n => userVotes[String(n.id)] === 'yes');
  // For total names, show ALL names from Firestore, not just unvoted
  const totalNamesList = freshNames;

  // Pagination state for 'Total Names'
  const [page, setPage] = useState(0);
  const pageSize = 10; // 10 rows per page for Total Names
  const totalPages = Math.ceil(totalNamesList.length / pageSize);
  const pagedRestNames = totalNamesList.slice(page * pageSize, (page + 1) * pageSize);

  // Pagination for Yes
  const [pageYes, setPageYes] = useState(0);
  const pageSizeYes = 3; // 3 rows per page for Yes
  const totalPagesYes = Math.ceil(yesNames.length / pageSizeYes);
  const pagedYesNames = yesNames.slice(pageYes * pageSizeYes, (pageYes + 1) * pageSizeYes);
  useEffect(() => {
    if (pageYes > 0 && pageYes >= totalPagesYes) setPageYes(0);
  }, [yesNames.length, totalPagesYes]);

  // Pagination for Favorites
  const [pageFavorites, setPageFavorites] = useState(0);
  const pageSizeFavorites = 3; // 3 rows per page for Favorites
  const totalPagesFavorites = Math.ceil(favoriteNames.length / pageSizeFavorites);
  const pagedFavoriteNames = favoriteNames.slice(pageFavorites * pageSizeFavorites, (pageFavorites + 1) * pageSizeFavorites);
  useEffect(() => {
    if (pageFavorites > 0 && pageFavorites >= totalPagesFavorites) setPageFavorites(0);
  }, [favoriteNames.length, totalPagesFavorites]);

  return (
    <div>
      <div className="w-full max-w-[430px] pl-0 pr-2 mt-2 mx-auto">
        {/* App logo and name at the very top */}
        <div className="flex flex-row items-center justify-center gap-3 mt-2 mb-1">
          <span role="img" aria-label="baby" className="text-4xl align-middle">👶</span>
          <span className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-fuchsia-400 to-amber-400 drop-shadow">Baby Name Swiper</span>
        </div>
        {/* Favorites */}
        <h2 className="text-base font-semibold text-yellow-700 mb-2 text-center">Favorites ({favoriteNames.length})</h2>
        <ul className="divide-y divide-gray-200 bg-white rounded-lg shadow overflow-x-auto mb-4">
          {pagedFavoriteNames.length === 0 && <li className="py-3 px-2 text-center text-gray-400">No favorites yet.</li>}
          {pagedFavoriteNames.map(n => {
            const isMatch = ['yes', 'favorite'].includes(userVotes[String(n.id)]) && ['yes', 'favorite'].includes(otherUserVotes[String(n.id)]);
            const categories = n.categories || getCategoriesForName(n.name);
            return (
              <li key={n.id} className="relative flex flex-col py-3 px-2 bg-yellow-50 min-h-[48px]">
                <div className="flex items-center">
                  <span className="absolute left-2 text-yellow-500 font-bold flex items-center gap-1">FAVORITE <span role='img' aria-label='star'>⭐</span></span>
                  <span className="mx-auto font-semibold text-lg text-gray-900 text-center w-full">
                    {n.name}
                  </span>
                  <span className={
                    n.gender === 'boy' ? 'absolute right-2 text-sky-600 flex items-center gap-2' : 
                    n.gender === 'girl' ? 'absolute right-2 text-fuchsia-600 flex items-center gap-2' :
                    'absolute right-2 text-purple-600 flex items-center gap-2'
                  }>
                    {n.gender}
                    {isMatch && <span className="ml-2 text-xs font-bold text-amber-500 bg-amber-100 rounded px-2 py-0.5">match</span>}
                  </span>
                </div>
                {categories.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-1 mt-2">
                    {categories.slice(0, 4).map((categoryId: string) => {
                      const category = getCategoryById(categoryId);
                      return category ? (
                        <span 
                          key={categoryId}
                          className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 border border-yellow-200"
                        >
                          {category.name}
                        </span>
                      ) : null;
                    })}
                    {categories.length > 4 && (
                      <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 border border-yellow-200">
                        +{categories.length - 4} more
                      </span>
                    )}
                  </div>
                )}
              </li>
            );
          })}
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
        <h2 className="text-base font-semibold text-green-700 mb-2 text-center">Yes ({yesNames.length})</h2>
        <ul className="divide-y divide-gray-200 bg-white rounded-lg shadow overflow-x-auto mb-4">
          {pagedYesNames.length === 0 && <li className="py-3 px-2 text-center text-gray-400">No yes yet.</li>}
          {pagedYesNames.map(n => {
            const isMatch = ['yes', 'favorite'].includes(userVotes[String(n.id)]) && ['yes', 'favorite'].includes(otherUserVotes[String(n.id)]);
            const categories = n.categories || getCategoriesForName(n.name);
            return (
              <li key={n.id} className="relative flex flex-col py-3 px-2 bg-green-50 min-h-[48px]">
                <div className="flex items-center">
                  <span className="absolute left-2 text-green-600 font-bold">YES</span>
                  <span className="mx-auto font-semibold text-lg text-gray-900 text-center w-full">
                    {n.name}
                  </span>
                  <span className={
                    n.gender === 'boy' ? 'absolute right-2 text-sky-600 flex items-center gap-2' : 
                    n.gender === 'girl' ? 'absolute right-2 text-fuchsia-600 flex items-center gap-2' :
                    'absolute right-2 text-purple-600 flex items-center gap-2'
                  }>
                    {n.gender}
                    {isMatch && <span className="ml-2 text-xs font-bold text-amber-500 bg-amber-100 rounded px-2 py-0.5">match</span>}
                  </span>
                </div>
                {categories.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-1 mt-2">
                    {categories.slice(0, 4).map((categoryId: string) => {
                      const category = getCategoryById(categoryId);
                      return category ? (
                        <span 
                          key={categoryId}
                          className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 border border-green-200"
                        >
                          {category.name}
                        </span>
                      ) : null;
                    })}
                    {categories.length > 4 && (
                      <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 border border-green-200">
                        +{categories.length - 4} more
                      </span>
                    )}
                  </div>
                )}
              </li>
            );
          })}
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
        <h2 className="text-base font-semibold text-gray-700 mb-2 text-center">Total Names ({totalNames})</h2>
        <ul className="divide-y divide-gray-200 bg-white rounded-lg shadow overflow-x-auto mb-4">
          {pagedRestNames.length === 0 && <li className="py-3 px-2 text-center text-gray-400">No total Names.</li>}
          {pagedRestNames.map(n => (
            <li key={n.id} className="relative flex items-center py-3 px-2 min-h-[48px]">
              <span className="absolute left-2 text-gray-500 font-bold">{userVotes[String(n.id)] === 'no' ? 'NO' : userVotes[String(n.id)] === 'yes' ? 'YES' : userVotes[String(n.id)] === 'favorite' ? 'FAV' : 'UNVOTED'}</span>
              <span className="mx-auto font-semibold text-lg text-gray-900 text-center w-full">
                {n.name}
              </span>
              <span className={
                n.gender === 'boy' ? 'absolute right-2 text-sky-600' : 
                n.gender === 'girl' ? 'absolute right-2 text-fuchsia-600' :
                'absolute right-2 text-purple-600'
              }>{n.gender}</span>
            </li>
          ))}
        </ul>
        {/* Paginator for Total Names */}
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
    </div>
  );
};
