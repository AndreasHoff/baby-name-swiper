import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useRef, useState } from 'react';
import { db } from '../firebase';
import { fetchOtherUserVotes, useFetchNames, useNameStore } from '../store';

const swipeConfidenceThreshold = 100; // px
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

export const CardStack: React.FC<{
  swipeDirection?: 'no' | 'favorite' | 'yes' | null;
  onAnimationComplete?: () => void;
  otherUserName?: string;
}> = ({ swipeDirection, onAnimationComplete, otherUserName }) => {
  useFetchNames(); // Fetch real names on mount
  const names = useNameStore((s) => s.names);
  const vote = useNameStore((s) => s.vote);
  const otherUserVotes = useNameStore((s) => s.otherUserVotes) || {};
  const setOtherUserVotes = useNameStore((s) => s.setOtherUserVotes);
  const currentUser = window.localStorage.getItem('currentUser') as 'Andreas' | 'Emilie' | null;
  // Only show names where votes[currentUser] !== 'yes'
  const [deck, setDeck] = useState<string[]>([]);
  useEffect(() => {
    // When names or currentUser changes, reset deck to unvoted names (keep order stable)
    if (!currentUser) return;
    const unvotedIds = names.filter((n) => {
      if ((n as any).votes && currentUser) {
        return (n as any).votes[currentUser] !== 'yes';
      }
      return n.voteStatus !== 'yes';
    }).map(n => n.id);
    setDeck((prev) => {
      // Only reset if deck is empty or names changed (not after a 'no' shuffle)
      if (prev.length === 0 || prev.length !== unvotedIds.length || !prev.every((id, i) => id === unvotedIds[i])) {
        return unvotedIds;
      }
      return prev;
    });
  }, [names, currentUser]);

  const dragging = useRef(false);
  const [dragX, setDragX] = useState(0);
  const [animating, setAnimating] = useState<null | 'no' | 'favorite' | 'yes'>(null);

  useEffect(() => {
    if (otherUserName) {
      fetchOtherUserVotes(otherUserName).then(setOtherUserVotes);
    }
  }, [otherUserName, setOtherUserVotes]);

  // Animation effect when swipeDirection changes
  useEffect(() => {
    if (swipeDirection) {
      setAnimating(swipeDirection);
      const timeout = setTimeout(() => {
        setAnimating(null);
        onAnimationComplete && onAnimationComplete();
      }, 400);
      return () => clearTimeout(timeout);
    }
  }, [swipeDirection, onAnimationComplete]);

  // Helper to handle voting and match logic
  const handleVote = async (card: any, direction: 'yes' | 'no' | 'favorite') => {
    console.log('[handleVote] Voting', card.name, direction);
    // 1. Save this vote to the user's likedNames field in Firebase
    const currentUser = window.localStorage.getItem('currentUser') as 'Andreas' | 'Emilie';
    const otherUser = currentUser === 'Andreas' ? 'Emilie' : 'Andreas';
    await vote(card.id, direction);
    if (direction === 'yes' || direction === 'favorite') {
      // Save to likedNames subfield for the user
      const userDocRef = (await import('firebase/firestore')).doc(db, 'users', currentUser);
      await (await import('firebase/firestore')).updateDoc(userDocRef, {
        [`likedNames.${card.id}`]: true
      });
      // No longer set favorite: true on the name document
      // Use votes map for favorite logic only
      // To display a star/highlight: card.votes?.[currentUser] === 'favorite'
      // To display a favorite match: card.votes?.Andreas === 'favorite' && card.votes?.Emilie === 'favorite'
      // 2. Check if the other user has also swiped yes on this name (only for yes)
      if (direction === 'yes') {
        const otherUserDocRef = (await import('firebase/firestore')).doc(db, 'users', otherUser);
        const otherUserDocSnap = await (await import('firebase/firestore')).getDoc(otherUserDocRef);
        const otherLikedNames = otherUserDocSnap.exists() && otherUserDocSnap.data().likedNames ? otherUserDocSnap.data().likedNames : {};
        // Fix: handle both boolean true and string 'true' for legacy/consistency
        const otherSaidYes = otherLikedNames[card.id] === true || otherLikedNames[card.id] === 'true';
        if (otherSaidYes) {
          // Optionally, update isAMatch in Firestore for this name
          const nameDocRef = (await import('firebase/firestore')).doc(db, 'baby-names', card.id);
          await (await import('firebase/firestore')).updateDoc(nameDocRef, { isAMatch: true });
          return;
        }
      }
    } else if (direction === 'no') {
      // Only shuffle this card back into the deck at a random position (not the rest)
      setDeck((prev) => {
        // Remove the card from the top (if present)
        const idx = prev.indexOf(card.id);
        if (idx === -1) return prev;
        const newDeck = [...prev];
        newDeck.splice(idx, 1);
        // Insert at random position except the top (so user doesn't see it again immediately)
        const insertAt = newDeck.length > 0 ? Math.floor(Math.random() * newDeck.length) + 1 : 0;
        newDeck.splice(insertAt, 0, card.id);
        return newDeck;
      });
      // Remove the card from the top immediately so the next card is shown
      setDeck((prev) => {
        if (prev[0] === card.id) {
          return prev.slice(1);
        }
        return prev;
      });
    }
    // If not a match, animate away
    setAnimating(direction);
    setTimeout(() => {
      setAnimating(null);
      onAnimationComplete && onAnimationComplete();
    }, 400);
  };

  if (names.length > 0 && deck.length === 0) {
    return <div className="text-center text-xl mt-8 text-fuchsia-700">No more names to swipe!</div>;
  }
  if (deck.length === 0) {
    return null;
  }
  // Show a visible stack of up to 5 cards
  const stack = deck.slice(0, 5)
    .map(id => names.find(n => n.id === id))
    .filter((n): n is typeof names[0] => Boolean(n));
  // Animation variants for feedback
  const animationVariants = {
    yes: { x: [0, 30, 0], boxShadow: '0 8px 24px 0 rgba(34,197,94,0.18)' },
    no: { x: [0, -30, 0], boxShadow: '0 8px 24px 0 rgba(239,68,68,0.18)' },
    favorite: { scale: [1, 1.1, 1], boxShadow: '0 8px 24px 0 rgba(253,224,71,0.18)' },
    none: {},
  };
  return (
    <div className="flex flex-col items-center justify-center w-[430px] max-w-full px-4 md:px-8 relative mb-5" style={{flex: '0 0 auto', minHeight: 330}}>
      <AnimatePresence>
        {stack.map((card, i) => {
          // Custom top offsets for each card in the stack
          let topPx = 0;
          if (i === 1) topPx = 4;
          else if (i === 2) topPx = 8;
          else if (i === 3) topPx = 12;
          else if (i === 4) topPx = 16;
          // Set zIndex so the top card is always on top, next card below, etc.
          const zIndex = stack.length - i;
          const isTop = i === 0;
          // Choose transition: use tween for feedback animation, spring otherwise
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
                  await handleVote(card, 'no');
                } else if (swipe > swipeConfidenceThreshold) {
                  await handleVote(card, 'yes');
                }
              }) : undefined}
              onDrag={isTop ? ((_, info) => setDragX(info.offset.x)) : undefined}
              className={`cardstack-card bg-gradient-to-br from-sky-200 via-fuchsia-200 to-amber-200 text-fuchsia-900 rounded-3xl shadow-2xl px-4 py-5 w-[225px] min-h-[93px] flex flex-col items-center justify-center border-4 border-white select-none absolute left-0 right-0 mx-auto pointer-events-none` + (isTop ? ' pointer-events-auto' : '')}
              style={{ top: topPx, zIndex, boxShadow: `0 ${4 + i * 2}px ${16 - i * 2}px 0 rgba(0,0,0,0.10)` }}
              whileTap={isTop ? { scale: 0.97 } : undefined}
              whileDrag={isTop ? { rotate: dragX / 30 } : undefined}
            >
              <span className="text-5xl font-extrabold mb-4 drop-shadow-lg">{card.name}</span>
              <span className="text-lg font-semibold uppercase tracking-widest px-4 py-2 rounded-full bg-white bg-opacity-40 mt-4 shadow text-fuchsia-700 border border-fuchsia-200">
                {card.gender}
              </span>
              {isTop && (
                <>
                  {/* Overlay for swipe direction */}
                  <div
                    className={`absolute inset-0 rounded-3xl pointer-events-none transition-opacity duration-200 ${
                      dragX < -40
                        ? 'bg-red-400/50 opacity-100'
                        : dragX > 40
                        ? 'bg-green-400/50 opacity-100'
                        : 'opacity-0'
                    }`}
                  />
                  {/* Removed swipe icon from card */}
                </>
              )}
              {isTop && (
                <div className="mt-4 text-center w-full">
                  {/* Only show other user's vote if present */}
                  {otherUserVotes[card.id] && (
                    <div className="text-sky-700 font-semibold text-base">{otherUserName} {otherUserVotes[card.id] === 'yes' ? 'liked' : otherUserVotes[card.id] === 'no' ? 'disliked' : 'absolutely did NOT like'} this</div>
                  )}
                </div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
