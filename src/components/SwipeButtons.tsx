import React from 'react';

export const SwipeButtons: React.FC<{
  currentUser: 'Andreas' | 'Emilie' | null;
  top: any;
  onVote: (direction: 'yes' | 'no' | 'favorite') => void;
  disabled: boolean;
}> = ({ currentUser: _currentUser, top: _top, onVote, disabled }) => {
  return (
    <div className="cardstack-buttons flex flex-row items-center justify-center w-[430px] max-w-full px-6 md:px-8 gap-6 mt-4 mx-auto" style={{flex: '0 0 auto'}}>
      {/* No Button */}
      <button
        className="flex-none w-20 h-20 bg-gradient-to-br from-red-400 to-pink-500 hover:from-red-500 hover:to-pink-600 active:from-red-600 active:to-pink-700 text-white font-bold rounded-full text-3xl shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-lg border-2 border-white/20 flex items-center justify-center focus:outline-none focus:ring-0"
        onClick={() => { console.log('[SwipeButtons] No button clicked'); if (!disabled) { onVote('no'); } }}
        aria-label="No"
        disabled={disabled}
        style={{
          background: disabled ? undefined : 'linear-gradient(135deg, #f87171 0%, #ec4899 100%)',
          boxShadow: disabled ? undefined : '0 8px 24px 0 rgba(239, 68, 68, 0.25), 0 2px 8px 0 rgba(236, 72, 153, 0.15)'
        }}
      >
      </button>
      
      {/* Favorite Button - Larger and special */}
      <button
        className="flex-none w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 active:from-yellow-600 active:to-orange-700 text-white font-bold rounded-full text-4xl shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-lg border-2 border-white/20 flex items-center justify-center focus:outline-none focus:ring-0"
        onClick={() => { console.log('[SwipeButtons] Favorite button clicked'); if (!disabled) { onVote('favorite'); } }}
        aria-label="Favorite"
        disabled={disabled}
        style={{
          background: disabled ? undefined : 'linear-gradient(135deg, #fbbf24 0%, #f97316 100%)',
          boxShadow: disabled ? undefined : '0 10px 28px 0 rgba(251, 191, 36, 0.3), 0 4px 12px 0 rgba(249, 115, 22, 0.2)'
        }}
      >
        <span className="flex items-center justify-center w-full h-full">⭐</span>
      </button>
      
      {/* Yes Button */}
      <button
        className="flex-none w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 active:from-green-600 active:to-emerald-700 text-white font-bold rounded-full text-3xl shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-lg border-2 border-white/20 flex items-center justify-center focus:outline-none focus:ring-0"
        onClick={() => { console.log('[SwipeButtons] Yes button clicked'); if (!disabled) { onVote('yes'); } }}
        aria-label="Yes"
        disabled={disabled}
        style={{
          background: disabled ? undefined : 'linear-gradient(135deg, #4ade80 0%, #10b981 100%)',
          boxShadow: disabled ? undefined : '0 8px 24px 0 rgba(74, 222, 128, 0.25), 0 2px 8px 0 rgba(16, 185, 129, 0.15)'
        }}
      >
      </button>
    </div>
  );
};
