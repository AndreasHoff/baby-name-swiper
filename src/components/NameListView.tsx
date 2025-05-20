import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';
import type { VoteStatus } from '../store';
import { useNameStore } from '../store';

const statusLabels: Record<Exclude<VoteStatus, null>, string> = {
  yes: 'Yes',
  no: 'No',
  'absolutely-not': 'Absolutely Not',
};

const statusColors: Record<Exclude<VoteStatus, null>, string> = {
  yes: 'bg-gradient-to-r from-sky-200 to-fuchsia-100 text-sky-900',
  no: 'bg-gradient-to-r from-fuchsia-200 to-amber-100 text-fuchsia-900',
  'absolutely-not': 'bg-gradient-to-r from-amber-200 to-sky-100 text-amber-900',
};

const genderColors: Record<string, string> = {
  boy: 'bg-sky-100 text-sky-700',
  girl: 'bg-fuchsia-100 text-fuchsia-700',
  unisex: 'bg-amber-100 text-amber-700',
};

export const NameListView: React.FC = () => {
  const names = useNameStore((s) => s.names);
  // Show all names, most recent on top
  const sorted = [...names].reverse();
  return (
    <div className="cardstack-list flex flex-col items-center justify-center w-full max-w-[430px] px-2 mt-2 mx-auto relative min-h-[200px]" style={{ height: 260 }}>
      <AnimatePresence>
        {sorted.map((n, i) => {
          const label = n.voteStatus ? statusLabels[n.voteStatus] : 'Unvoted';
          const color = n.voteStatus ? statusColors[n.voteStatus] : 'bg-gradient-to-r from-amber-100 to-fuchsia-50 text-amber-900';
          // Stack effect: each card is offset and scaled
          const offset = i * 8;
          const scale = 1 - i * 0.03;
          return (
            <motion.div
              key={n.id}
              initial={{ y: 40, opacity: 0, scale: 0.95 }}
              animate={{ y: -offset, opacity: 1, scale }}
              exit={{ y: 40, opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className={`absolute left-0 right-0 mx-auto rounded-xl px-4 py-3 flex flex-col sm:flex-row justify-between items-center gap-2 shadow ${color} transition-all border-2 border-white ${i === 0 ? 'z-20' : 'z-10'}`}
              style={{ top: offset, width: '100%', maxWidth: 420, pointerEvents: i === 0 ? 'auto' : 'none' }}
            >
              <span className="font-semibold text-lg drop-shadow-sm">{n.name}</span>
              <span className={`text-xs font-bold px-2 py-1 rounded-full border ${genderColors[n.gender]}`}>{n.gender}</span>
              <span className="text-xs font-bold uppercase tracking-wide">{label}</span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
