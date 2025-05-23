import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import Modal from 'react-modal';
import { db } from '../firebase';
import { SwipeButtons } from './SwipeButtons';

const swipeConfidenceThreshold = 100; // px
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

// Accept allNames and userVotes as props
export function CardStack({ allNames, userVotes, currentUser, refreshUserVotes }: { allNames: any[], userVotes: Record<string, string>, otherUserVotes: Record<string, string>, currentUser: string, refreshUserVotes?: () => void }) {
  // Store the actual name objects, not just ids
  const [deck, setDeck] = useState<any[]>([]);
  const dragging = useRef(false);
  const [dragX, setDragX] = useState(0);
  const [animating, setAnimating] = useState<null | 'no' | 'favorite' | 'yes'>(null);
  const [leavingCard, setLeavingCard] = useState<any | null>(null);
  // Only show names left in the deck in the modal
  const [showAllModal, setShowAllModal] = useState(false);
  const [allPage, setAllPage] = useState(0);
  const allPageSize = 10;
  const totalAllPages = Math.ceil(deck.length / allPageSize);
  const pagedAllNames = deck.slice(allPage * allPageSize, (allPage + 1) * allPageSize);
  const [matchModal, setMatchModal] = useState<{ open: boolean, name: string | null }>({ open: false, name: null });
  // Track the last match type for modal styling
  const [lastMatchType, setLastMatchType] = useState<'yes' | 'favorite' | null>(null);

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
    setDeck([...notInNoOrder, ...inNoOrder]);
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

  // Voting logic: update only the user's votes map in Firestore
  const handleVote = async (direction: 'yes' | 'no' | 'favorite') => {
    const card = deck[0];
    if (!card) return;
    console.log('[CardStack] User voted', direction, 'for', card.name, card.id);
    if (direction === 'no') {
      addToNoOrder(currentUser, card.id);
      setDeck((prev) => prev.slice(1)); // Just remove from top, deck will rebuild in useEffect
      setAnimating(direction);
      setTimeout(() => setAnimating(null), 400);
    } else if (direction === 'favorite' || direction === 'yes') {
      removeFromNoOrder(currentUser, card.id);
      if (direction === 'favorite') {
        setLeavingCard(card); // Set the floating card
        setDeck((prev) => prev.slice(1)); // Remove from stack immediately
        setAnimating('favorite');
        setTimeout(() => {
          setLeavingCard(null); // Remove floating card after animation
          setAnimating(null);
        }, 1200); // Match favorite animation duration (1.2s)
      } else {
        setDeck((prev) => prev.slice(1));
        setAnimating(direction);
        setTimeout(() => setAnimating(null), 400);
      }
    }
    try {
      const userRef = doc(db, 'users', currentUser);
      await updateDoc(userRef, { [`votes.${card.id}`]: direction });
      // --- Update votes map on the baby name document ---
      const nameRef = doc(db, 'baby-names', card.id);
      // Get the latest votes for this name
      const nameSnap = await getDoc(nameRef);
      const nameData = nameSnap.exists() ? nameSnap.data() : {};
      const updatedVotes = { ...nameData.votes, [currentUser]: direction };
      const otherUser = currentUser === 'Andreas' ? 'Emilie' : 'Andreas';
      const userVote = updatedVotes[currentUser];
      const otherVote = updatedVotes[otherUser];
      const isAMatch = ['yes', 'favorite'].includes(userVote) && ['yes', 'favorite'].includes(otherVote);
      await updateDoc(nameRef, { votes: updatedVotes, isAMatch });
      // --- End update ---
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
    // After updating the deck, log the current deck order (names only)
    setTimeout(() => {
      console.log('[CardStack] Deck after vote:', deck.map(n => n.name));
    }, 10); // Delay to ensure deck state is updated
  };

  // Show a visible stack of up to 5 cards
  const stack = deck.slice(0, 5);
  const animationVariants = {
    yes: { x: [0, 30, 0], boxShadow: '0 8px 24px 0 rgba(34,197,94,0.18)' },
    no: { x: [0, -30, 0], boxShadow: '0 8px 24px 0 rgba(239,68,68,0.18)' },
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
  if (deck.length === 0) {
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

  return (
    <div className="w-full">
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
        {/* Floating leavingCard for favorite animation */}
        {leavingCard && animating === 'favorite' && (
          <motion.div
            key={leavingCard.id + '-leaving'}
            initial={{ y: 0, scale: 1, opacity: 1 }}
            animate={animationVariants.favorite}
            exit={{ opacity: 0 }}
            transition={animationVariants.favorite.transition}
            className={`cardstack-card bg-gradient-to-br from-sky-200 via-fuchsia-200 to-amber-200 text-fuchsia-900 rounded-3xl shadow-2xl px-4 py-5 w-full min-h-[90px] flex flex-col items-center justify-center border-4 border-white select-none absolute left-0 right-0 mx-auto pointer-events-none`}
            style={{
              top: 0,
              zIndex: 99,
              boxShadow: `0 4px 16px 0 rgba(0,0,0,0.10)`
            }}
          >
            <span className="text-4xl sm:text-5xl font-extrabold mb-3 sm:mb-4 drop-shadow-lg text-center">{leavingCard.name}</span>
            <span className="text-base sm:text-lg font-semibold uppercase tracking-widest px-4 py-2 rounded-full bg-white bg-opacity-40 mt-3 sm:mt-4 shadow text-fuchsia-700 border border-fuchsia-200">
              {leavingCard.gender}
            </span>
          </motion.div>
        )}
        {/* Card stack */}
        <AnimatePresence>
          {stack.map((card, i) => {
            let topPx = 0;
            if (i === 1) topPx = 4;
            else if (i === 2) topPx = 8;
            else if (i === 3) topPx = 12;
            else if (i === 4) topPx = 16;
            const zIndex = stack.length - i;
            // Only animate the top card if not animating favorite (handled by floating card)
            const isTop = i === 0;
            const shouldAnimate = isTop && animating && animating !== 'favorite';
            const transition = shouldAnimate
              ? { type: 'tween', duration: 0.35, ease: 'easeInOut' }
              : { type: 'spring', stiffness: 200, damping: 20 };
            return (
              <motion.div
                key={card.id}
                initial={{ y: 40, opacity: 0, scale: 1 }}
                animate={{
                  y: 0,
                  opacity: 1,
                  scale: 1,
                  ...(shouldAnimate ? animationVariants[animating!] : {})
                }}
                exit={{ y: -40, opacity: 0, scale: 1 }}
                transition={transition}
                drag={isTop ? "x" : false}
                dragConstraints={isTop ? { left: 0, right: 0 } : undefined}
                dragElastic={isTop ? 0.8 : undefined}
                onDragStart={isTop ? () => (dragging.current = true) : undefined}
                onDragEnd={isTop ? (async (_, info) => {
                  dragging.current = false;
                  setDragX(0);
                  const { offset, velocity } = info;
                  const swipe = swipePower(offset.x, velocity.x);
                  if (swipe < -swipeConfidenceThreshold) {
                    await handleVote('no');
                  } else if (swipe > swipeConfidenceThreshold) {
                    await handleVote('yes');
                  }
                }) : undefined}
                onDrag={isTop ? ((_, info) => setDragX(info.offset.x)) : undefined}
                className={`cardstack-card bg-gradient-to-br from-sky-200 via-fuchsia-200 to-amber-200 text-fuchsia-900 rounded-3xl shadow-2xl px-4 py-5 w-full min-h-[90px] flex flex-col items-center justify-center border-4 border-white select-none absolute left-0 right-0 mx-auto pointer-events-none` + (isTop ? ' pointer-events-auto' : '')}
                style={{
                  top: topPx,
                  zIndex,
                  boxShadow: `0 ${4 + i * 2}px ${16 - i * 2}px 0 rgba(0,0,0,0.10)`,
                  background:
                    isTop && dragX < -30
                      ? 'linear-gradient(135deg, #fee2e2 0%, #fca5a5 100%)' // Red tint for NO
                      : isTop && dragX > 30
                      ? 'linear-gradient(135deg, #bbf7d0 0%, #4ade80 100%)' // Green tint for YES
                      : undefined,
                  transition: 'background 0.2s cubic-bezier(0.4,0,0.2,1)'
                }}
                whileTap={isTop ? { scale: 0.97 } : undefined}
                whileDrag={isTop ? { rotate: dragX / 30 } : undefined}
              >
                <span className="text-4xl sm:text-5xl font-extrabold mb-3 sm:mb-4 drop-shadow-lg text-center">{card.name}</span>
                <span className="text-base sm:text-lg font-semibold uppercase tracking-widest px-4 py-2 rounded-full bg-white bg-opacity-40 mt-3 sm:mt-4 shadow text-fuchsia-700 border border-fuchsia-200">
                  {card.gender}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      {/* Deck count paragraph */}
      <p className="text-center text-fuchsia-700 font-semibold mb-2">{deck.length} name{deck.length !== 1 ? 's' : ''} left</p>
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
                <span className={n.gender === 'boy' ? 'text-sky-600' : 'text-fuchsia-600'}>{n.gender}</span>
              </li>
            ))}
          </ul>
          {/* Paginator for all names */}
          {totalAllPages > 1 && (
            <div className="flex justify-center items-center gap-2 mb-4">
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
      {/* 4th Row: Voting Buttons - 3 Columns */}
      <div className="flex justify-center gap-6 sm:gap-8 mb-4 px-4">
        <SwipeButtons
          currentUser={currentUser === 'Andreas' || currentUser === 'Emilie' ? currentUser : null}
          top={deck[0]}
          onVote={handleVote}
          disabled={!deck.length}
        />
      </div>
    </div>
  );
}
