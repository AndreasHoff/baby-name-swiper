import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { db } from '../firebase';
import { getCategoriesForName, getCategoryById } from '../utils/nameCategories';
import { SwipeButtons } from './SwipeButtons';

// Animation state interface
interface AnimationState {
  type: 'no' | 'yes' | 'favorite' | null;
  cardId: string | null;
}

// Debug interface
interface DebugInfo {
  topCardName: string | null;
  deckLength: number;
  animationState: string;
}

// Accept allNames and userVotes as props
export function CardStack({ allNames, userVotes, currentUser, refreshUserVotes }: { allNames: any[], userVotes: Record<string, string>, otherUserVotes: Record<string, string>, currentUser: string, refreshUserVotes?: () => void }) {
  // 1. Separate deck data and transitioning card state
  const [deckData, setDeckData] = useState<any[]>([]);
  const [transitioningCard, setTransitioningCard] = useState<any | null>(null);
  const [animationState, setAnimationState] = useState<AnimationState>({ type: null, cardId: null });
  
  // Modal and UI state
  const [showAllModal, setShowAllModal] = useState(false);
  const [allPage, setAllPage] = useState(0);
  const allPageSize = 10;
  const totalAllPages = Math.ceil(deckData.length / allPageSize);
  const pagedAllNames = deckData.slice(allPage * allPageSize, (allPage + 1) * allPageSize);
  const [matchModal, setMatchModal] = useState<{ open: boolean, name: string | null }>({ open: false, name: null });
  const [lastMatchType, setLastMatchType] = useState<'yes' | 'favorite' | null>(null);

  // Undo functionality
  const [lastAction, setLastAction] = useState<{
    cardId: string;
    cardName: string;
    previousVote: string | null;
    newVote: 'yes' | 'no' | 'favorite';
    timestamp: number;
  } | null>(null);

  // Debug info (development only)
  const debugInfo: DebugInfo = {
    topCardName: deckData[0]?.name || null,
    deckLength: deckData.length,
    animationState: animationState.type ? `${animationState.type} (${animationState.cardId})` : 'idle'
  };

  // Build deck: filter out names with 'yes' or 'favorite' vote
  useEffect(() => {
    if (!currentUser) return;
    const unvoted = allNames.filter((n) => {
      const vote = userVotes?.[n.id];
      return vote !== 'yes' && vote !== 'favorite';
    });
    // Reorder deck so names in sessionStorage 'no' order are at the end
    const noOrder = getNoOrder(currentUser);
    const inNoOrder = unvoted.filter(n => noOrder.includes(n.id));
    const notInNoOrder = unvoted.filter(n => !noOrder.includes(n.id));
    // Keep the order of noOrder for those names
    inNoOrder.sort((a, b) => noOrder.indexOf(a.id) - noOrder.indexOf(b.id));
    setDeckData([...notInNoOrder, ...inNoOrder]);
  }, [allNames, userVotes, currentUser]);

  // Helpers for sessionStorage 'no' order
  function getNoOrderKey(user: string) {
    return `noOrder_${user}`;
  }
  function getNoOrder(user: string): string[] {
    const raw = window.sessionStorage.getItem(getNoOrderKey(user));
    return raw ? JSON.parse(raw) : [];
  }
  function setNoOrder(user: string, arr: string[]) {
    window.sessionStorage.setItem(getNoOrderKey(user), JSON.stringify(arr));
  }
  function addToNoOrder(user: string, id: string) {
    const arr = getNoOrder(user);
    if (!arr.includes(id)) {
      arr.push(id);
      setNoOrder(user, arr);
    }
  }
  function removeFromNoOrder(user: string, id: string) {
    const arr = getNoOrder(user).filter(x => x !== id);
    setNoOrder(user, arr);
  }

  // Clean voting logic with proper animation handling
  const handleVote = async (direction: 'yes' | 'no' | 'favorite') => {
    const card = deckData[0];
    if (!card || animationState.type !== null) return; // Prevent double-voting during animation
    
    console.log('[CardStack] User voted', direction, 'for', card.name, card.id);
    
    // Store the previous vote for undo functionality
    const previousVote = userVotes?.[card.id] || null;
    setLastAction({
      cardId: card.id,
      cardName: card.name,
      previousVote,
      newVote: direction,
      timestamp: Date.now()
    });

    // Update session storage for "no" votes
    if (direction === 'no') {
      addToNoOrder(currentUser, card.id);
    } else {
      removeFromNoOrder(currentUser, card.id);
    }

    // Set transitioning card and animation state
    setTransitioningCard(card);
    setAnimationState({ type: direction, cardId: card.id });

    // Firebase update
    try {
      const userRef = doc(db, 'users', currentUser);
      await updateDoc(userRef, { [`votes.${card.id}`]: direction });
      
      // Update votes map on the baby name document
      const nameRef = doc(db, 'baby-names', card.id);
      const nameSnap = await getDoc(nameRef);
      const nameData = nameSnap.exists() ? nameSnap.data() : {};
      const updatedVotes = { ...nameData.votes, [currentUser]: direction };
      const otherUser = currentUser === 'Andreas' ? 'Emilie' : 'Andreas';
      const userVote = updatedVotes[currentUser];
      const otherVote = updatedVotes[otherUser];
      const isAMatch = !!(userVote && otherVote && ['yes', 'favorite'].includes(userVote) && ['yes', 'favorite'].includes(otherVote));
      await updateDoc(nameRef, { votes: updatedVotes, isAMatch });
      
      if (refreshUserVotes) {
        refreshUserVotes();
      }
      
      // Show match modal if a match is detected after this vote
      if (['yes', 'favorite'].includes(direction) && isAMatch) {
        setLastMatchType(direction === 'yes' ? 'yes' : 'favorite');
        setTimeout(() => {
          setMatchModal({ open: true, name: card.name });
        }, 500);
      }
      
      console.log('[CardStack] Firestore updated for', card.name, 'with', direction);
    } catch (e) {
      console.error('[CardStack] Firestore update failed:', e);
    }
  };

  // Handle animation completion - this removes the card from deck
  const handleAnimationComplete = () => {
    if (!transitioningCard) return;
    
    console.log('[CardStack] Animation completed for', transitioningCard.name);
    
    // Remove the card from deck data
    setDeckData(prev => prev.filter(card => card.id !== transitioningCard.id));
    
    // Clear animation state
    setTransitioningCard(null);
    setAnimationState({ type: null, cardId: null });
    
    // Log the current deck order (names only)
    setTimeout(() => {
      console.log('[CardStack] Deck after vote:', deckData.filter(card => card.id !== transitioningCard.id).map(n => n.name));
    }, 10);
  };

  // Undo function - updated for new state structure
  const handleUndo = async () => {
    if (!lastAction || !currentUser) return;
    
    // Check if the undo is recent (within 30 seconds)
    const timeSinceAction = Date.now() - lastAction.timestamp;
    if (timeSinceAction > 30000) {
      console.log('[CardStack] Undo too old, ignoring');
      setLastAction(null);
      return;
    }

    console.log('[CardStack] Undoing last action:', lastAction);
    
    try {
      // Find the card that was voted on
      const cardToUndo = allNames.find(n => n.id === lastAction.cardId);
      if (!cardToUndo) return;

      // Restore the previous vote in Firestore
      const userRef = doc(db, 'users', currentUser);
      if (lastAction.previousVote) {
        await updateDoc(userRef, { [`votes.${lastAction.cardId}`]: lastAction.previousVote });
      } else {
        // Remove the vote entirely if there was no previous vote
        await updateDoc(userRef, { [`votes.${lastAction.cardId}`]: null });
      }

      // Update the name document votes
      const nameRef = doc(db, 'baby-names', lastAction.cardId);
      const nameSnap = await getDoc(nameRef);
      const nameData = nameSnap.exists() ? nameSnap.data() : {};
      const updatedVotes = { ...nameData.votes };
      if (lastAction.previousVote) {
        updatedVotes[currentUser] = lastAction.previousVote;
      } else {
        delete updatedVotes[currentUser];
      }
      
      const otherUser = currentUser === 'Andreas' ? 'Emilie' : 'Andreas';
      const userVote = updatedVotes[currentUser];
      const otherVote = updatedVotes[otherUser];
      const isAMatch = !!(userVote && otherVote && ['yes', 'favorite'].includes(userVote) && ['yes', 'favorite'].includes(otherVote));
      await updateDoc(nameRef, { votes: updatedVotes, isAMatch });

      // Handle sessionStorage no order
      if (lastAction.newVote === 'no' && lastAction.previousVote !== 'no') {
        removeFromNoOrder(currentUser, lastAction.cardId);
      } else if (lastAction.previousVote === 'no' && lastAction.newVote !== 'no') {
        addToNoOrder(currentUser, lastAction.cardId);
      }

      // Always add the undone card back to the top of the deck
      // First remove it if it already exists in the deck
      setDeckData(prev => {
        const filteredDeck = prev.filter(n => n.id !== lastAction.cardId);
        return [cardToUndo, ...filteredDeck];
      });

      if (refreshUserVotes) {
        refreshUserVotes();
      }

      console.log('[CardStack] Undo completed');
      setLastAction(null);
    } catch (e) {
      console.error('[CardStack] Undo failed:', e);
    }
  };

  // Show a visible stack of up to 5 cards from deckData
  const stack = deckData.slice(0, 5);
  
  // Simple animation variants - only for button clicks
  const animationVariants = {
    yes: {
      x: 300,
      opacity: 0,
      transition: { duration: 0.8, ease: 'easeInOut' }  // Increased from 0.5 to 0.8
    },
    no: {
      x: -300,
      opacity: 0,
      transition: { duration: 0.8, ease: 'easeInOut' }  // Increased from 0.5 to 0.8
    },
    favorite: {
      y: [0, -30, -80],
      scale: [1, 1.12, 1],
      boxShadow: '0 0 0 8px rgba(253,224,71,0.25), 0 8px 60px 0 rgba(253,224,71,0.55)',
      filter: [
        'brightness(1) drop-shadow(0 0 16px #fde047)',
        'brightness(1.55) drop-shadow(0 0 32px #fde047)',
        'brightness(1) drop-shadow(0 0 16px #fde047)'
      ],
      transition: { duration: 1.2, ease: [0.4, 0, 0.2, 1] }
    },
    none: {},
  };

  // If there are no cards left, show a custom message
  if (deckData.length === 0 && !transitioningCard) {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-[300px] p-6">
        <div className="text-3xl sm:text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 via-amber-400 to-sky-400 drop-shadow-lg text-center mb-4 flex items-center justify-center gap-2" style={{letterSpacing: '0.01em'}}>
          <span role="img" aria-label="heart" className="text-4xl align-middle" style={{verticalAlign: 'middle'}}>💖</span>
          No more names.
        </div>
        <div className="text-lg sm:text-xl font-semibold text-center max-w-md bg-clip-text text-transparent bg-gradient-to-r from-sky-500 via-fuchsia-400 to-amber-400 drop-shadow" style={{lineHeight: 1.5}}>
          Please contact your boyfriend and let him know that you love and support him<br/>and want him to add more features to this lovely app.
        </div>
      </div>
    );
  }

  // Add subtle 'development' watermark if in dev environment
  const isDev = import.meta.env.MODE === 'development' || import.meta.env.VITE_FIREBASE_PROJECT_ID?.includes('dev');

  return (
    <div className="w-full">
      {/* Developer Debug Overlay */}
      {isDev && (
        <div className="fixed bottom-4 left-4 bg-black bg-opacity-75 text-white p-3 rounded-lg text-xs font-mono z-50">
          <div><strong>Debug Info:</strong></div>
          <div>Top Card: {debugInfo.topCardName || 'None'}</div>
          <div>Deck Length: {debugInfo.deckLength}</div>
          <div>Animation: {debugInfo.animationState}</div>
          <div>Transitioning: {transitioningCard?.name || 'None'}</div>
        </div>
      )}
      {/* Match Modal */}
      {matchModal.open && (
        <>
          {/* Celebration emojis outside modal */}
          <div className="fixed inset-0 flex items-center justify-center z-40 pointer-events-none select-none">
            <span style={{
              fontSize: '4rem',
              position: 'absolute',
              left: '10%',
              top: '15%',
              filter: 'drop-shadow(0 0 10px #fde04788)'
            }}>🎆</span>
            <span style={{
              fontSize: '3.5rem',
              position: 'absolute',
              right: '12%',
              top: '20%',
              filter: 'drop-shadow(0 0 8px #fde04766)'
            }}>🎉</span>
            <span style={{
              fontSize: '3.5rem',
              position: 'absolute',
              left: '18%',
              bottom: '18%',
              filter: 'drop-shadow(0 0 8px #fde04766)'
            }}>🎇</span>
            <span style={{
              fontSize: '4rem',
              position: 'absolute',
              right: '16%',
              bottom: '15%',
              filter: 'drop-shadow(0 0 10px #fde04788)'
            }}>🥳</span>
          </div>
          <Modal
            isOpen={matchModal.open}
            onRequestClose={() => setMatchModal({ open: false, name: null })}
            contentLabel="Match!"
            ariaHideApp={false}
            className="fixed inset-0 flex items-center justify-center z-50"
            overlayClassName="fixed inset-0 bg-black bg-opacity-40 z-40"
            style={{
              content: {
                animation: 'fadeInScale 1.2s cubic-bezier(0.4,0,0.2,1)',
                transition: 'all 1.2s cubic-bezier(0.4,0,0.2,1)'
              }
            }}
          >
            <div
              className={`modal-container bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full flex flex-col items-center border-4 ${lastMatchType === 'yes' ? 'match-green' : 'match-yellow'}`}
              style={{
                boxShadow: lastMatchType === 'yes'
                  ? '0 0 24px 2px #4ade8055, 0 8px 32px 0 #bbf7d033'
                  : '0 0 24px 2px #fde04755, 0 8px 32px 0 #fde04733',
                borderColor: lastMatchType === 'yes' ? '#4ade80' : '#fde047',
                background: lastMatchType === 'yes'
                  ? 'linear-gradient(135deg, #f0fdf4 0%, #bbf7d0 100%)'
                  : 'linear-gradient(135deg, #fffbe6 0%, #fef08a 100%)',
                filter: lastMatchType === 'yes'
                  ? 'drop-shadow(0 0 12px #4ade8055)'
                  : 'drop-shadow(0 0 12px #fde04755)'
              }}
            >
              <h2
                className={`text-3xl font-extrabold mb-4 drop-shadow-lg ${lastMatchType === 'yes' ? 'text-green-500' : 'text-yellow-500'}`}
                style={{
                  textShadow: lastMatchType === 'yes'
                    ? '0 0 8px #4ade8088, 0 2px 4px #bbf7d055'
                    : '0 0 8px #fde04788, 0 2px 4px #facc1555'
                }}
              >
                Congratulations!
              </h2>
              <div className={`text-xl font-bold mb-2 text-center ${lastMatchType === 'yes' ? 'text-green-700' : 'text-fuchsia-700'}`}>There is a match!</div>
              <div className={`text-2xl font-extrabold mb-4 text-center ${lastMatchType === 'yes' ? 'text-green-600' : 'text-yellow-600'}`}
                style={{
                  textShadow: lastMatchType === 'yes'
                    ? '0 0 4px #4ade8088'
                    : '0 0 4px #fde04788'
                }}
              >{matchModal.name}</div>
              <button
                className={`mt-6 px-6 py-2 rounded-lg font-bold shadow transition-all duration-200 ${lastMatchType === 'yes' ? 'bg-gradient-to-br from-green-400 to-emerald-400 text-white hover:from-green-500 hover:to-emerald-500' : 'bg-gradient-to-br from-yellow-400 to-amber-400 text-white hover:from-yellow-500 hover:to-amber-500'}`}
                onClick={() => setMatchModal({ open: false, name: null })}
              >
                Close
              </button>
            </div>
          </Modal>
          <style>{`
            @keyframes fadeInScale {
              0% { opacity: 0; transform: scale(0.85); }
              100% { opacity: 1; transform: scale(1); }
            }
          `}</style>
        </>
      )}
      {/* 1st Row: Headline */}
      <div className="flex justify-center mb-4 px-4">
        <h1 className="text-3xl sm:text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-fuchsia-400 to-amber-400 drop-shadow-lg text-center flex items-center justify-center gap-2" style={{letterSpacing: '0.01em'}}>
          <span role="img" aria-label="baby" className="text-4xl sm:text-xl align-middle text-black bg-none" style={{color: '#222', background: 'none'}}>👶</span>
          <span className="leading-tight">Baby Name Swiper</span>
        </h1>
      </div>
      {/* 2nd Row: Card Stack */}
      <div className="flex justify-center relative px-4" style={{ minHeight: '300px' }}>
        {/* Transitioning card for animations */}
        {transitioningCard && animationState.type && (
          <motion.div
            key={transitioningCard.id + '-transitioning'}
            initial={{ y: 0, scale: 1, opacity: 1, x: 0 }}
            animate={animationVariants[animationState.type]}
            onAnimationComplete={handleAnimationComplete}
            className={`cardstack-card bg-gradient-to-br from-sky-200 via-fuchsia-200 to-amber-200 text-fuchsia-900 rounded-3xl shadow-2xl px-4 py-5 w-full min-h-[90px] flex flex-col items-center justify-center border-4 border-white select-none absolute left-0 right-0 mx-auto pointer-events-none`}
            style={{
              top: 0,
              zIndex: 99,
              boxShadow: `0 4px 16px 0 rgba(0,0,0,0.10)`
            }}
          >
            <span className="text-4xl sm:text-5xl font-extrabold mb-3 sm:mb-4 drop-shadow-lg text-center">{transitioningCard.name}</span>
            <span className="text-base sm:text-lg font-semibold uppercase tracking-widest px-4 py-2 rounded-full bg-white bg-opacity-40 mt-3 sm:mt-4 shadow text-fuchsia-700 border border-fuchsia-200">
              {transitioningCard.gender}
            </span>
            {/* Display categories for transitioning card */}
            {(() => {
              const categories = transitioningCard.categories || getCategoriesForName(transitioningCard.name);
              if (categories.length > 0) {
                return (
                  <div className="flex flex-wrap justify-center gap-1 mt-2 max-w-[280px]">
                    {categories.slice(0, 3).map((categoryId: string) => {
                      const category = getCategoryById(categoryId);
                      return category ? (
                        <span 
                          key={categoryId}
                          className="text-xs px-2 py-1 rounded-full bg-white bg-opacity-30 text-fuchsia-600 border border-fuchsia-100"
                        >
                          {category.name}
                        </span>
                      ) : null;
                    })}
                    {categories.length > 3 && (
                      <span className="text-xs px-2 py-1 rounded-full bg-white bg-opacity-30 text-fuchsia-600 border border-fuchsia-100">
                        +{categories.length - 3} more
                      </span>
                    )}
                  </div>
                );
              }
              return null;
            })()}
          </motion.div>
        )}
        {/* Card stack - only show cards that are not transitioning */}
        <AnimatePresence>
          {stack.filter(card => !transitioningCard || card.id !== transitioningCard.id).map((card: any, i: number) => {
            let topPx = 0;
            if (i === 1) topPx = 4;
            else if (i === 2) topPx = 8;
            else if (i === 3) topPx = 12;
            else if (i === 4) topPx = 16;
            const zIndex = stack.length - i;
            
            return (
              <motion.div
                key={card.id}
                initial={{ y: 40, opacity: 0, scale: 1 }}
                animate={{
                  y: 0,
                  opacity: 1,
                  scale: 1,
                }}
                exit={
                  animationState.type === 'favorite' 
                    ? { y: -40, opacity: 0, scale: 1 }  // Upward float for favorite
                    : { opacity: 0, scale: 1 }          // Just fade out for yes/no
                }
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                className={`cardstack-card bg-gradient-to-br from-sky-200 via-fuchsia-200 to-amber-200 text-fuchsia-900 rounded-3xl shadow-2xl px-4 py-5 w-full min-h-[90px] flex flex-col items-center justify-center border-4 border-white select-none absolute left-0 right-0 mx-auto pointer-events-none${i === 0 ? ' pointer-events-auto' : ''}`}
                style={{
                  top: topPx,
                  zIndex,
                  boxShadow: `0 ${4 + i * 2}px ${16 - i * 2}px 0 rgba(0,0,0,0.10)`,
                }}
                whileTap={i === 0 ? { scale: 0.98 } : undefined}
              >
                <span className="text-4xl sm:text-5xl font-extrabold mb-3 sm:mb-4 drop-shadow-lg text-center">{card.name}</span>
                <span className="text-base sm:text-lg font-semibold uppercase tracking-widest px-4 py-2 rounded-full bg-white bg-opacity-40 mt-3 sm:mt-4 shadow text-fuchsia-700 border border-fuchsia-200">
                  {card.gender}
                </span>
                {/* Display categories */}
                {(() => {
                  const categories = card.categories || getCategoriesForName(card.name);
                  if (categories.length > 0) {
                    return (
                      <div className="flex flex-wrap justify-center gap-1 mt-2 max-w-[280px]">
                        {categories.slice(0, 3).map((categoryId: string) => {
                          const category = getCategoryById(categoryId);
                          return category ? (
                            <span 
                              key={categoryId}
                              className="text-xs px-2 py-1 rounded-full bg-white bg-opacity-30 text-fuchsia-600 border border-fuchsia-100"
                            >
                              {category.name}
                            </span>
                          ) : null;
                        })}
                        {categories.length > 3 && (
                          <span className="text-xs px-2 py-1 rounded-full bg-white bg-opacity-30 text-fuchsia-600 border border-fuchsia-100">
                            +{categories.length - 3} more
                          </span>
                        )}
                      </div>
                    );
                  }
                  return null;
                })()}
                {isDev && (
                  <span
                    className="pointer-events-none select-none absolute left-1/2 bottom-2 -translate-x-1/2 text-xl font-extrabold text-gray-400 opacity-50 z-10 whitespace-nowrap"
                    style={{letterSpacing: '0.15em'}}
                  >
                    DEVELOPMENT
                  </span>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      {/* Deck count paragraph */}
      <p className="text-center text-fuchsia-700 font-semibold mb-2">{deckData.length} name{deckData.length !== 1 ? 's' : ''} left</p>
      {/* 3rd Row: Show All Names Button */}
      <div className="flex justify-center mb-4">
        <button
          className="px-4 py-2 sm:px-6 sm:py-2 rounded-lg bg-gradient-to-br from-amber-300 to-fuchsia-300 text-fuchsia-900 font-bold shadow hover:from-amber-400 hover:to-fuchsia-400 transition-all duration-200 text-sm sm:text-base"
          onClick={() => setShowAllModal(true)}
        >
          Show all names
        </button>
      </div>
      {/* Modal for all names */}
      <Modal
        isOpen={showAllModal}
        onRequestClose={() => setShowAllModal(false)}
        contentLabel="All Names"
        ariaHideApp={false}
        className="fixed inset-0 flex items-center justify-center z-50"
        overlayClassName="fixed inset-0 bg-black bg-opacity-40 z-40"
      >
        <div className="modal-container bg-white rounded-2xl shadow-2xl p-6 max-w-lg w-full relative">
          <h2 className="text-xl font-bold text-center text-fuchsia-700">Names Left</h2>
          <ul className="divide-y divide-gray-200 max-h-96 overflow-y-auto mb-4">
            {pagedAllNames.map(n => (
              <li key={n.id} className="py-2 px-2 flex items-center justify-between">
                <span className="font-semibold text-lg">{n.name}</span>
                <span className={
                  n.gender === 'boy' ? 'text-sky-600' : 
                  n.gender === 'girl' ? 'text-fuchsia-600' : 
                  'text-purple-600'
                }>{n.gender}</span>
              </li>
            ))}
          </ul>
          {/* Paginator for all names */}
          {totalAllPages > 1 && (
            <div className="flex justify-center items-center gap-2 mb-8">
              <button
                className="px-3 py-1 rounded bg-fuchsia-100 text-fuchsia-700 font-bold disabled:opacity-40"
                onClick={() => setAllPage(p => Math.max(0, p - 1))}
                disabled={allPage === 0}
              >
                Prev
              </button>
              <span className="text-sm font-semibold text-gray-600">Page {allPage + 1} of {totalAllPages}</span>
              <button
                className="px-3 py-1 rounded bg-fuchsia-100 text-fuchsia-700 font-bold disabled:opacity-40"
                onClick={() => setAllPage(p => Math.min(totalAllPages - 1, p + 1))}
                disabled={allPage === totalAllPages - 1}
              >
                Next
              </button>
            </div>
          )}
          <div className="flex justify-center">
            <button
              className="px-6 py-2 rounded-lg bg-gradient-to-br from-fuchsia-400 to-amber-400 text-white font-bold shadow hover:from-fuchsia-500 hover:to-amber-500 transition-all duration-200"
              onClick={() => setShowAllModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
      {/* Undo Button - Show if there's a recent action */}
      {lastAction && (Date.now() - lastAction.timestamp < 30000) && (
        <div className="flex justify-center mb-4">
          <button
            onClick={handleUndo}
            className="px-4 py-2 rounded-lg bg-gradient-to-br from-orange-400 to-red-400 text-white font-bold shadow hover:from-orange-500 hover:to-red-500 transition-all duration-200 flex items-center gap-2"
          >
            <span>↶</span>
            Undo {lastAction.cardName}
          </button>
        </div>
      )}
      {/* 4th Row: Voting Buttons - 3 Columns */}
      <div className="flex justify-center gap-6 sm:gap-8 mb-4 px-4">
        <SwipeButtons
          currentUser={currentUser === 'Andreas' || currentUser === 'Emilie' ? currentUser : null}
          top={deckData[0]}
          onVote={handleVote}
          disabled={!deckData.length || animationState.type !== null}
        />
      </div>
    </div>
  );
}
