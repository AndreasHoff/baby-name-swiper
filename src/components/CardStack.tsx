import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useRef, useState } from 'react';
import { useFetchNames, useNameStore } from '../store';

const swipeConfidenceThreshold = 100; // px
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

export const CardStack: React.FC<{
  swipeDirection?: 'no' | 'absolutely-not' | 'yes' | null;
  onAnimationComplete?: () => void;
}> = ({ swipeDirection, onAnimationComplete }) => {
  useFetchNames(); // Fetch real names on mount
  const names = useNameStore((s) => s.names);
  const vote = useNameStore((s) => s.vote);
  const unvoted = names.filter((n) => n.voteStatus === null);
  const dragging = useRef(false);
  const [dragX, setDragX] = useState(0);
  const [animating, setAnimating] = useState<null | 'no' | 'absolutely-not' | 'yes'>(null);

  // Animation effect when swipeDirection changes
  useEffect(() => {
    if (swipeDirection) {
      setAnimating(swipeDirection);
      // Animation duration: 400ms, then clear
      const timeout = setTimeout(() => {
        setAnimating(null);
        onAnimationComplete && onAnimationComplete();
      }, 400);
      return () => clearTimeout(timeout);
    }
  }, [swipeDirection, onAnimationComplete]);

  // Only show the message if names have loaded and all are voted
  if (names.length > 0 && unvoted.length === 0) {
    return <div className="text-center text-xl mt-8 text-fuchsia-700">No more names to swipe!</div>;
  }
  if (unvoted.length === 0) {
    // Still loading or empty, render nothing
    return null;
  }
  // Show a visible stack of up to 5 cards
  const stack = unvoted.slice(0, 5);
  // Animation variants for feedback
  const animationVariants = {
    yes: { x: [0, 30, 0], boxShadow: '0 8px 24px 0 rgba(34,197,94,0.18)' },
    no: { x: [0, -30, 0], boxShadow: '0 8px 24px 0 rgba(239,68,68,0.18)' },
    'absolutely-not': { rotate: [0, 8, -8, 0], boxShadow: '0 8px 24px 0 rgba(251,191,36,0.18)' },
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
              onDragEnd={isTop ? ((_, info) => {
                dragging.current = false;
                setDragX(0);
                const { offset, velocity } = info;
                const swipe = swipePower(offset.x, velocity.x);
                if (swipe < -swipeConfidenceThreshold) {
                  vote(card.id, 'no');
                } else if (swipe > swipeConfidenceThreshold) {
                  vote(card.id, 'yes');
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
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
