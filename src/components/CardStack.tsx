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
  if (unvoted.length === 0) return <div className="text-center text-xl mt-8 text-fuchsia-700">No more names to swipe!</div>;
  const top = unvoted[0];
  return (
    <div className="flex flex-col items-center justify-center w-[430px] max-w-full px-4 md:px-8" style={{flex: '0 0 auto'}}>
      <AnimatePresence>
        <motion.div
          key={top.id}
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.8}
          onDragStart={() => (dragging.current = true)}
          onDragEnd={(_, info) => {
            dragging.current = false;
            setDragX(0);
            const { offset, velocity } = info;
            const swipe = swipePower(offset.x, velocity.x);
            if (swipe < -swipeConfidenceThreshold) {
              vote(top.id, 'no');
            } else if (swipe > swipeConfidenceThreshold) {
              vote(top.id, 'yes');
            }
          }}
          onDrag={(_, info) => setDragX(info.offset.x)}
          className="cardstack-card bg-gradient-to-br from-sky-200 via-fuchsia-200 to-amber-200 text-fuchsia-900 rounded-3xl shadow-2xl px-8 py-12 w-[420px] min-h-[180px] flex flex-col items-center justify-center border-4 border-white select-none"
          whileTap={{ scale: 0.97 }}
          whileDrag={{ rotate: dragX / 30 }}
        >
          <span className="text-5xl font-extrabold mb-4 drop-shadow-lg">{top.name}</span>
          <span className="text-lg font-semibold uppercase tracking-widest px-4 py-2 rounded-full bg-white bg-opacity-40 mt-4 shadow text-fuchsia-700 border border-fuchsia-200">
            {top.gender}
          </span>
          <div className={`absolute left-1/4 top-1/2 -translate-y-1/2 text-4xl font-bold text-fuchsia-400 pointer-events-none select-none transition-opacity duration-200 ${dragX < -40 ? 'opacity-100' : 'opacity-0'}`}>
            ❌
          </div>
          <div className={`absolute right-1/4 top-1/2 -translate-y-1/2 text-4xl font-bold text-sky-400 pointer-events-none select-none transition-opacity duration-200 ${dragX > 40 ? 'opacity-100' : 'opacity-0'}`}>
            ✅
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
