import { AnimatePresence, motion } from 'framer-motion';
import React, { useRef, useState } from 'react';
import { useFetchNames, useNameStore } from '../store';

const swipeConfidenceThreshold = 100; // px
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

export const CardStack: React.FC = () => {
  useFetchNames(); // Fetch real names on mount
  const names = useNameStore((s) => s.names);
  const vote = useNameStore((s) => s.vote);
  const unvoted = names.filter((n) => n.voteStatus === null);
  const dragging = useRef(false);
  const [dragX, setDragX] = useState(0);
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
  const top = stack[0];
  return (
    <div className="flex flex-col items-center justify-center w-[430px] max-w-full px-4 md:px-8 relative" style={{flex: '0 0 auto', minHeight: 330}}>
      <AnimatePresence>
        {stack.map((card, i) => {
          const isTop = i === 0;
          // Only show a sliver of each card below the top
          const visibleOffset = 0; // Top card is fully visible
          const sliverHeight = 14; // px of each card peeking out
          const offset = isTop ? 0 : (stack.length - i - 1) * sliverHeight;
          const scale = 1; // All cards same size for perfect alignment
          return (
            <motion.div
              key={card.id}
              initial={{ y: 40, opacity: 0, scale }}
              animate={{ y: -offset, opacity: 1, scale }}
              exit={{ y: -40, opacity: 0, scale }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
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
              className={`cardstack-card bg-gradient-to-br from-sky-200 via-fuchsia-200 to-amber-200 text-fuchsia-900 rounded-3xl shadow-2xl px-4 py-5 w-[225px] min-h-[93px] flex flex-col items-center justify-center border-4 border-white select-none absolute left-0 right-0 mx-auto ${isTop ? 'z-20' : 'z-10 pointer-events-none'}`}
              style={{ top: offset, boxShadow: `0 ${4 + i * 2}px ${16 - i * 2}px 0 rgba(0,0,0,0.10)` }}
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
