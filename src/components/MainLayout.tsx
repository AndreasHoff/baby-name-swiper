import { doc, updateDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { db } from '../firebase';
import { AddBabyName } from './AddBabyName';
import { Analytics } from './Analytics';
import { CardStack } from './CardStack';
// import { LinkNameExtractor } from './LinkNameExtractor'; // TEMPORARILY DISABLED
import { NameListView } from './NameListView';
import { PatchNotesCard } from './PatchNotesCard';

interface MainLayoutProps {
  currentView: 'main' | 'lists' | 'settings';
  allNames: any[];
  userVotes: Record<string, string>;
  otherUserVotes: Record<string, string>;
  currentUser: string;
  onNameAdded: (nameObject: {
    name: string;
    gender: 'boy' | 'girl' | 'unisex';
    hasSpecialChars: boolean;
    source: string;
    nameLength: number;
    categories: string[];
  }) => void;
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
  const [isResettingVotes, setIsResettingVotes] = useState(false);

  // Reset user votes function
  const handleResetVotes = async () => {
    if (!currentUser || isResettingVotes) return;
    
    const confirmReset = window.confirm(
      'Are you sure you want to clear ALL your votes? This action cannot be undone.'
    );
    
    if (!confirmReset) return;
    
    setIsResettingVotes(true);
    
    try {
      console.log('[MainLayout] Resetting votes for user:', currentUser);
      const userRef = doc(db, 'users', currentUser);
      await updateDoc(userRef, { votes: {} });
      
      console.log('[MainLayout] Votes reset successfully');
      
      // Refresh user votes to update the UI
      if (refreshUserVotes) {
        refreshUserVotes();
      }
      
      alert('Your votes have been reset successfully!');
    } catch (error) {
      console.error('[MainLayout] Error resetting votes:', error);
      alert('Error resetting votes. Please try again.');
    } finally {
      setIsResettingVotes(false);
    }
  };
  if (currentView === 'settings') {
    console.log('[MainLayout] Showing settings view');
    return (
      <div className="flex flex-col items-center min-h-[60vh] w-full">
        <div className="w-full flex justify-center mt-4 gap-4">
          <button
            onClick={onLogout}
            className="bg-gradient-to-br from-fuchsia-400 to-sky-400 hover:from-fuchsia-500 hover:to-sky-500 text-white px-8 py-3 rounded-lg font-bold shadow-lg transition-all duration-200 text-lg"
          >
            Log out
          </button>
          
          {/* Reset Votes Button - Only in development */}
          {(import.meta.env.MODE === 'development' || import.meta.env.VITE_FIREBASE_PROJECT_ID?.includes('dev')) && (
            <button
              onClick={handleResetVotes}
              disabled={isResettingVotes}
              className="bg-gradient-to-br from-red-400 to-orange-400 hover:from-red-500 hover:to-orange-500 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-lg font-bold shadow-lg transition-all duration-200 text-lg disabled:cursor-not-allowed"
            >
              {isResettingVotes ? 'Resetting...' : 'Reset My Votes'}
            </button>
          )}
        </div>
        <div className="w-full max-w-[430px] mx-auto mt-8 px-0">
          <AddBabyName onNameAdded={onNameAdded} />
        </div>
        
        {/* Link Name Extractor - TEMPORARILY DISABLED */}
        {/* 
        <div className="w-full max-w-[430px] mx-auto px-0">
          <LinkNameExtractor 
            onNamesExtracted={(names) => {
              // Add each extracted name
              names.forEach(({ name, gender }) => {
                onNameAdded({
                  name: name,
                  gender: gender,
                  hasSpecialChars: /[^a-zA-ZæøåÆØÅ\s-']/.test(name.trim()),
                  source: 'link',
                  nameLength: name.trim().length,
                  categories: [] // No categories selected for link-extracted names
                });
              });
            }} 
          />
        </div>
        */}
        
        {/* Analytics for developers - only show in dev environment */}
        {(import.meta.env.MODE === 'development' || import.meta.env.VITE_FIREBASE_PROJECT_ID?.includes('dev')) && (
          <div className="w-full mt-8">
            <Analytics />
          </div>
        )}
        
        {/* Patch Notes - show in both dev and production environments */}
        <PatchNotesCard />
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
