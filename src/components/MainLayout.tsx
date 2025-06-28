import React from 'react';
import { AddBabyName } from './AddBabyName';
import { Analytics } from './Analytics';
import { CardStack } from './CardStack';
import { LinkNameExtractor } from './LinkNameExtractor';
import { NameListView } from './NameListView';

interface MainLayoutProps {
  currentView: 'main' | 'lists' | 'settings';
  allNames: any[];
  userVotes: Record<string, string>;
  otherUserVotes: Record<string, string>;
  currentUser: string;
  onNameAdded: (name: string, gender: 'boy' | 'girl' | 'unisex') => void;
  onLogout: () => void;
  refreshUserVotes?: () => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ 
  currentView, 
  allNames, 
  userVotes,
  otherUserVotes,
  currentUser, 
  onNameAdded,
  onLogout,
  refreshUserVotes
}) => {
  if (currentView === 'settings') {
    console.log('[MainLayout] Showing settings view');
    return (
      <div className="flex flex-col items-center min-h-[60vh] w-full">
        <div className="w-full flex justify-center mt-4">
          <button
            onClick={onLogout}
            className="bg-gradient-to-br from-fuchsia-400 to-sky-400 hover:from-fuchsia-500 hover:to-sky-500 text-white px-8 py-3 rounded-lg font-bold shadow-lg transition-all duration-200 text-lg"
          >
            Log out
          </button>
        </div>
        <div className="w-full max-w-[430px] mx-auto mt-8 px-0">
          <AddBabyName onNameAdded={onNameAdded} />
        </div>
        
        {/* Link Name Extractor */}
        <div className="w-full max-w-[430px] mx-auto px-0">
          <LinkNameExtractor 
            onNamesExtracted={(names) => {
              // Add each extracted name
              names.forEach(({ name, gender }) => {
                onNameAdded(name, gender);
              });
            }} 
          />
        </div>
        
        {/* Analytics for developers - only show in dev environment */}
        {(import.meta.env.MODE === 'development' || import.meta.env.VITE_FIREBASE_PROJECT_ID?.includes('dev')) && (
          <div className="w-full mt-8">
            <Analytics />
          </div>
        )}
      </div>
    );
  }

  if (currentView === 'lists') {
    console.log('[MainLayout] Showing lists view');
    return (
      <div className="w-full max-w-[430px] mx-auto px-0 pb-6">
        <NameListView allNames={allNames} userVotes={userVotes} otherUserVotes={otherUserVotes} currentUser={currentUser} />
      </div>
    );
  }

  // Main card stack view
  console.log('[MainLayout] Showing card stack view');
  return (
    <div className="w-full max-w-[430px] mx-auto px-0">
      <CardStack allNames={allNames} userVotes={userVotes} otherUserVotes={otherUserVotes} currentUser={currentUser} refreshUserVotes={refreshUserVotes} />
    </div>
  );
};
