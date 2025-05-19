import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';
import { useNameStore } from '../store';

export const CardStack: React.FC = () => {
  // Only select the array from Zustand, do not filter in the selector!
  const names = useNameStore((s) => s.names);
  const unvoted = names.filter((n) => n.voteStatus === null);
  if (unvoted.length === 0) return <div className="text-center text-xl mt-8">No more names to swipe!</div>;
  const top = unvoted[0];
  return (
    <div className="flex justify-center items-center h-64 relative">
      <AnimatePresence>
        <motion.div
          key={top.id}
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          className="bg-white text-gray-900 rounded-xl shadow-lg px-8 py-6 min-w-[260px] min-h-[120px] flex flex-col items-center justify-center absolute"
        >
          <span className="text-3xl font-bold mb-2">{top.name}</span>
          <span className="text-sm text-gray-500 capitalize">{top.gender}</span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
