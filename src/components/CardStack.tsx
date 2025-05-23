import { doc, updateDoc } from 'firebase/firestore';
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
export function CardStack({ allNames, userVotes, currentUser, refreshUserVotes }: { allNames: any[], userVotes: Record<string, string>, currentUser: string, refreshUserVotes?: () => void }) {
  // Store the actual name objects, not just ids
  const [deck, setDeck] = useState<any[]>([]);
  const [shuffleOrder, setShuffleOrder] = useState<string[] | null>(null);
  const lastNoVotedId = useRef<string | null>(null);
  const dragging = useRef(false);
  const [dragX, setDragX] = useState(0);
  const [animating, setAnimating] = useState<null | 'no' | 'favorite' | 'yes'>(null);
  // Only show names left in the deck in the modal
  const [showAllModal, setShowAllModal] = useState(false);
  const [allPage, setAllPage] = useState(0);
  const allPageSize = 10;
  const totalAllPages = Math.ceil(deck.length / allPageSize);
  const pagedAllNames = deck.slice(allPage * allPageSize, (allPage + 1) * allPageSize);

  // Build deck: filter out names with 'yes' or 'favorite' vote
  useEffect(() => {
    if (!currentUser) return;
    const unvoted = allNames.filter((n) => {
      const vote = userVotes?.[n.id];
      const include = vote !== 'yes' && vote !== 'favorite';
      if (!include) console.log('[CardStack] Filtering out name:', n.name, 'vote:', vote);
      return include;
    });
    console.log('[CardStack] Deck filtered, count:', unvoted.length);
    // If we just voted 'no', move that card to the back if still present
    if (lastNoVotedId.current && unvoted.some((n) => n.id === lastNoVotedId.current)) {
      const filtered = unvoted.filter((n) => n.id !== lastNoVotedId.current);
      const card = unvoted.find((n) => n.id === lastNoVotedId.current);
      lastNoVotedId.current = null;
      const newDeck = card ? [...filtered, card] : filtered;
      if (shuffleOrder && arraysEqual(shuffleOrder, newDeck.map(n => n.id))) {
        setDeck(applyOrder(newDeck, shuffleOrder));
      } else {
        setShuffleOrder(null);
        setDeck(newDeck);
      }
    } else {
      if (shuffleOrder && arraysEqual(shuffleOrder, unvoted.map(n => n.id))) {
        setDeck(applyOrder(unvoted, shuffleOrder));
      } else {
        setShuffleOrder(null);
        setDeck(unvoted);
      }
    }
  }, [allNames, userVotes, currentUser]);

  // Voting logic: update only the user's votes map in Firestore
  const handleVote = async (direction: 'yes' | 'no' | 'favorite') => {
    const card = deck[0];
    if (!card) return;
    console.log('[CardStack] User voted', direction, 'for', card.name, card.id);
    if (direction === 'no') {
      lastNoVotedId.current = card.id;
      setDeck((prev) => {
        const rest = prev.slice(1);
        console.log('[CardStack] Moving card to back of deck:', card.name);
        return [...rest, card];
      });
    } else {
      setDeck((prev) => prev.slice(1));
      console.log('[CardStack] Removing card from deck:', card.name);
    }
    setAnimating(direction);
    try {
      const userRef = doc(db, 'users', currentUser);
      await updateDoc(userRef, { [`votes.${card.id}`]: direction });
      if (refreshUserVotes) {
        refreshUserVotes();
      }
      console.log('[CardStack] Firestore updated for', card.name, 'with', direction);
    } catch (e) {
      console.error('[CardStack] Firestore update failed:', e);
    }
    setTimeout(() => {
      setAnimating(null);
    }, 400);
  };

  // Helper: check if two arrays of ids are equal (order matters)
  function arraysEqual(a: string[], b: string[]) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
    return true;
  }
  // Helper: apply an order of ids to an array of name objects
  function applyOrder(arr: any[], order: string[]) {
    const map = Object.fromEntries(arr.map(n => [n.id, n]));
    return order.map(id => map[id]).filter(Boolean);
  }

  // Show a visible stack of up to 5 cards
  const stack = deck.slice(0, 5);
  const animationVariants = {
    yes: { x: [0, 30, 0], boxShadow: '0 8px 24px 0 rgba(34,197,94,0.18)' },
    no: { x: [0, -30, 0], boxShadow: '0 8px 24px 0 rgba(239,68,68,0.18)' },
    favorite: { scale: [1, 1.1, 1], boxShadow: '0 8px 24px 0 rgba(253,224,71,0.18)' },
    none: {},
  };

  // If there are no cards left, don't render the card stack division at all
  if (deck.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      {/* 1st Row: Headline */}
      <div className="flex justify-center mb-4 px-4">
        <h1 className="text-3xl sm:text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-fuchsia-400 to-amber-400 drop-shadow-lg text-center flex items-center justify-center gap-2" style={{letterSpacing: '0.01em'}}>
          <span role="img" aria-label="baby" className="text-4xl sm:text-xl align-middle text-black bg-none" style={{color: '#222', background: 'none'}}>👶</span>
          <span className="leading-tight">Baby Name Swiper</span>
        </h1>
      </div>
      {/* 2nd Row: Card Stack */}
      <div className="flex justify-center relative px-4" style={{ minHeight: '300px' }}>
        <AnimatePresence>
          {stack.map((card, i) => {
            let topPx = 0;
            if (i === 1) topPx = 4;
            else if (i === 2) topPx = 8;
            else if (i === 3) topPx = 12;
            else if (i === 4) topPx = 16;
            const zIndex = stack.length - i;
            const isTop = i === 0;
            const transition = isTop && animating
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
                  ...(isTop && animating ? animationVariants[animating] : {})
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
                }) : undefined}                onDrag={isTop ? ((_, info) => setDragX(info.offset.x)) : undefined}
                className={`cardstack-card bg-gradient-to-br from-sky-200 via-fuchsia-200 to-amber-200 text-fuchsia-900 rounded-3xl shadow-2xl px-4 py-5 w-full min-h-[90px] flex flex-col items-center justify-center border-4 border-white select-none absolute left-0 right-0 mx-auto pointer-events-none` + (isTop ? ' pointer-events-auto' : '')}
                style={{ top: topPx, zIndex, boxShadow: `0 ${4 + i * 2}px ${16 - i * 2}px 0 rgba(0,0,0,0.10)` }}
                whileTap={isTop ? { scale: 0.97 } : undefined}
                whileDrag={isTop ? { rotate: dragX / 30 } : undefined}              >                <span className="text-4xl sm:text-5xl font-extrabold mb-3 sm:mb-4 drop-shadow-lg text-center">{card.name}</span>
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
          <h2 className="text-xl font-bold text-center mb-4 text-fuchsia-700">Names Left</h2>
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
