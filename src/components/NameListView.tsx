import React from 'react';
import type { VoteStatus } from '../store';
import { useNameStore } from '../store';

const statusLabels: Record<Exclude<VoteStatus, null>, string> = {
  yes: 'Yes',
  no: 'No',
  'absolutely-not': 'Absolutely Not',
};

const statusColors: Record<Exclude<VoteStatus, null>, string> = {
  yes: 'bg-green-100',
  no: 'bg-red-100',
  'absolutely-not': 'bg-gray-200',
};

export const NameListView: React.FC = () => {
  const names = useNameStore((s) => s.names);
  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-2">All Names</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {names.map((n) => {
          const color = n.voteStatus ? statusColors[n.voteStatus] : 'bg-yellow-100';
          return (
            <div key={n.id} className={`rounded px-4 py-2 flex justify-between items-center ${color}`}>
              <span className="font-semibold">{n.name}</span>
              <span className="text-xs text-gray-600">{n.gender}</span>
              <span className="text-xs font-bold">{n.voteStatus ? statusLabels[n.voteStatus] : 'Unvoted'}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
