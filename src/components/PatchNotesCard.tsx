import React from 'react';
import patchNotes from '../data/patchNotes.json';

interface PatchNote {
  version: string;
  date: string;
  title: string;
  changes: Array<{
    type: 'added' | 'removed' | 'modified' | 'fixed';
    description: string;
  }>;
}

export const PatchNotesCard: React.FC = () => {
  const latestPatch = patchNotes[0] as PatchNote;
  const changeTypeIcons: Record<string, string> = {
    added: '✨',
    removed: '🗑️',
    modified: '🔧',
    fixed: '🐛'
  };

  const changeTypeColors: Record<string, string> = {
    added: 'text-green-600',
    removed: 'text-red-600',
    modified: 'text-blue-600',
    fixed: 'text-orange-600'
  };

  return (
    <div className="w-full mt-8">
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800">
            📝 Patch Notes
          </h3>
          <div className="text-sm text-gray-600">
            v{latestPatch.version} • {new Date(latestPatch.date).toLocaleDateString()}
          </div>
        </div>
        
        <div className="mb-4">
          <h4 className="text-lg font-semibold text-gray-700 mb-2">
            {latestPatch.title}
          </h4>
        </div>

        <div className="space-y-3">
          {latestPatch.changes.map((change, index) => (
            <div key={index} className="flex items-start gap-3">
              <span className="text-lg" title={change.type}>
                {changeTypeIcons[change.type]}
              </span>
              <span className={`text-sm font-medium ${changeTypeColors[change.type]} capitalize`}>
                {change.type}:
              </span>
              <span className="text-sm text-gray-700 flex-1">
                {change.description}
              </span>
            </div>
          ))}
        </div>

        {patchNotes.length > 1 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <details className="cursor-pointer">
              <summary className="text-sm text-gray-600 hover:text-gray-800 transition-colors">
                View previous updates ({patchNotes.length - 1} more)
              </summary>
              <div className="mt-3 space-y-4 max-h-64 overflow-y-auto">
                {patchNotes.slice(1).map((patch, patchIndex) => (
                  <div key={patchIndex} className="border-l-2 border-gray-200 pl-4">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-semibold text-gray-700 text-sm">
                        {patch.title}
                      </h5>
                      <div className="text-xs text-gray-500">
                        v{patch.version} • {new Date(patch.date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="space-y-1">
                      {patch.changes.slice(0, 3).map((change, changeIndex) => (
                        <div key={changeIndex} className="flex items-start gap-2">
                          <span className="text-sm">
                            {changeTypeIcons[change.type]}
                          </span>
                          <span className="text-xs text-gray-600">
                            {change.description}
                          </span>
                        </div>
                      ))}
                      {patch.changes.length > 3 && (
                        <div className="text-xs text-gray-500 italic">
                          +{patch.changes.length - 3} more changes
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </details>
          </div>
        )}
      </div>
    </div>
  );
};
