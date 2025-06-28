import React, { useEffect, useState } from 'react';
import type { Tag } from '../utils/tagManager';
import { createTag, fetchAllTags } from '../utils/tagManager';

interface AddBabyNameProps {
  onNameAdded: (nameObject: {
    name: string;
    gender: 'boy' | 'girl' | 'unisex';
    hasSpecialChars: boolean;
    source: string;
    nameLength: number;
    categories: string[];
  }) => void;
}

export const AddBabyName: React.FC<AddBabyNameProps> = ({ onNameAdded }) => {
  const [name, setName] = useState('');
  // Get persistent gender from localStorage or default to 'boy'
  const [gender, setGender] = useState<'boy' | 'girl' | 'unisex'>(() => {
    const savedGender = localStorage.getItem('lastSelectedGender');
    return (savedGender === 'boy' || savedGender === 'girl' || savedGender === 'unisex') ? savedGender : 'boy';
  });
  
  // New tag system state
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState(true);
  const [newTagName, setNewTagName] = useState('');
  const [isCreatingTag, setIsCreatingTag] = useState(false);

  // Load tags from Firestore on component mount
  useEffect(() => {
    const loadTags = async () => {
      console.log('[AddBabyName] Loading tags from Firestore...');
      setIsLoadingTags(true);
      try {
        const tags = await fetchAllTags();
        setAvailableTags(tags);
        console.log('[AddBabyName] Loaded tags:', tags);
      } catch (error) {
        console.error('[AddBabyName] Error loading tags:', error);
      } finally {
        setIsLoadingTags(false);
      }
    };
    
    loadTags();
  }, []);

  // Save gender preference when it changes
  const handleGenderChange = (newGender: 'boy' | 'girl' | 'unisex') => {
    setGender(newGender);
    localStorage.setItem('lastSelectedGender', newGender);
  };

  // Handle name input (no auto-suggestion anymore)
  const handleNameChange = (newName: string) => {
    setName(newName);
    console.log('[AddBabyName] Name input changed:', newName);
  };

  // Toggle tag selection
  const toggleTag = (tagId: string) => {
    setSelectedTagIds(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  // Create a new tag
  const handleCreateTag = async () => {
    if (!newTagName.trim() || isCreatingTag) return;
    
    console.log('[AddBabyName] Creating new tag:', newTagName.trim());
    setIsCreatingTag(true);
    
    try {
      const createdTag = await createTag(newTagName.trim());
      if (createdTag) {
        // Add to available tags
        setAvailableTags(prev => [...prev, createdTag].sort((a, b) => a.name.localeCompare(b.name)));
        // Auto-select the new tag
        setSelectedTagIds(prev => [...prev, createdTag.id]);
        // Clear the input
        setNewTagName('');
        console.log('[AddBabyName] Tag created and selected:', createdTag);
      }
    } catch (error) {
      console.error('[AddBabyName] Error creating tag:', error);
    } finally {
      setIsCreatingTag(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[AddBabyName] Form submitted:', name, gender, 'tags:', selectedTagIds);
    if (!name.trim()) return;
    
    // Create the new name object with extra fields for analytics
    const newName = {
      name: name.trim(),
      gender,
      votes: {}, // votes map for Firestore
      isAMatch: false, // default value
      createdAt: new Date().toISOString(), // timestamp for analytics/admin
      addedBy: 'user', // or use user id if available
      source: 'manual', // source of the name (manual, link, etc.)
      nameLength: name.trim().length, // analytics: name length
      hasSpecialChars: /[^a-zA-ZæøåÆØÅ\s-']/.test(name.trim()), // analytics: special characters
      categories: selectedTagIds, // selected tag IDs
    };
    
    // Pass the full object with analytics data
    if (onNameAdded) onNameAdded({
      name: newName.name,
      gender: newName.gender,
      hasSpecialChars: newName.hasSpecialChars,
      source: newName.source,
      nameLength: newName.nameLength,
      categories: newName.categories
    });
    
    console.log('[AddBabyName] Full new name object:', newName);
    setName('');
    setSelectedTagIds([]);
    // Don't reset gender - keep it persistent
  };

  return (
    <div className="w-full bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/40 p-6">
      <h3 className="text-xl font-bold text-fuchsia-700 mb-4 text-center">Add New Name</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name input - 1st row */}
        <div>
          <input
            type="text"
            value={name}
            onChange={e => handleNameChange(e.target.value)}
            placeholder="Enter baby name..."
            className="w-full px-4 py-3 rounded-lg border-2 border-fuchsia-200 focus:border-fuchsia-400 focus:outline-none bg-white/90 text-fuchsia-900 placeholder-fuchsia-400 font-medium"
          />
        </div>

        {/* Tags Section - Always Visible */}
        <div>
          <label className="block text-sm font-semibold text-fuchsia-700 mb-2">
            Select Tags:
          </label>
          
          {isLoadingTags ? (
            <div className="text-sm text-fuchsia-600">Loading tags...</div>
          ) : (
            <>
              {/* Selected Tags */}
              {selectedTagIds.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-fuchsia-600 mb-1">Selected tags:</p>
                  <div className="flex flex-wrap gap-2">
                    {availableTags
                      .filter(tag => selectedTagIds.includes(tag.id))
                      .map(tag => (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => toggleTag(tag.id)}
                          className="px-3 py-1 rounded-full text-sm font-medium bg-fuchsia-500 text-white shadow-md hover:bg-fuchsia-600 transition-all duration-200"
                        >
                          {tag.name} ✕
                        </button>
                      ))
                    }
                  </div>
                </div>
              )}
              
              {/* Main Tags Container */}
              <div className="p-3 bg-fuchsia-50 rounded-lg border border-fuchsia-200">
                {/* Available Tags */}
                {availableTags.length > 0 ? (
                  <>
                    <p className="text-sm font-medium text-fuchsia-700 mb-2">Available tags:</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {availableTags
                        .filter(tag => !selectedTagIds.includes(tag.id))
                        .map(tag => (
                          <button
                            key={tag.id}
                            type="button"
                            onClick={() => toggleTag(tag.id)}
                            className="px-3 py-1 rounded-full text-sm font-medium bg-white text-fuchsia-700 hover:bg-fuchsia-100 border border-fuchsia-200 transition-all duration-200"
                          >
                            {tag.name}
                          </button>
                        ))
                      }
                    </div>
                    <div className="border-t border-fuchsia-200 pt-3">
                      <p className="text-xs font-medium text-fuchsia-600 mb-2">Create new tag:</p>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-fuchsia-600 mb-3">No tags yet. Create the first one:</p>
                )}
                
                {/* Create New Tag - Always Visible */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTagName}
                    onChange={e => setNewTagName(e.target.value)}
                    placeholder="New tag name..."
                    className="flex-1 px-3 py-1 text-sm rounded border border-fuchsia-300 focus:border-fuchsia-400 focus:outline-none"
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleCreateTag();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleCreateTag}
                    disabled={!newTagName.trim() || isCreatingTag}
                    className="px-3 py-1 text-sm bg-fuchsia-500 text-white rounded hover:bg-fuchsia-600 disabled:bg-gray-300 transition-all duration-200"
                  >
                    {isCreatingTag ? '...' : '+'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Gender selection - 2nd row */}
        <div className="flex gap-3 justify-center">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name="gender"
              value="boy"
              checked={gender === 'boy'}
              onChange={e => { handleGenderChange(e.target.value as 'boy' | 'girl' | 'unisex'); console.log('[AddBabyName] Gender input changed:', e.target.value); }}
              className="w-4 h-4 text-sky-400 border-2 border-sky-300 focus:ring-sky-400"
            />
            <span className="text-sky-700 font-semibold">Boy</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name="gender"
              value="girl"
              checked={gender === 'girl'}
              onChange={e => { handleGenderChange(e.target.value as 'boy' | 'girl' | 'unisex'); console.log('[AddBabyName] Gender input changed:', e.target.value); }}
              className="w-4 h-4 text-fuchsia-400 border-2 border-fuchsia-300 focus:ring-fuchsia-400"
            />
            <span className="text-fuchsia-700 font-semibold">Girl</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name="gender"
              value="unisex"
              checked={gender === 'unisex'}
              onChange={e => { handleGenderChange(e.target.value as 'boy' | 'girl' | 'unisex'); console.log('[AddBabyName] Gender input changed:', e.target.value); }}
              className="w-4 h-4 text-purple-400 border-2 border-purple-300 focus:ring-purple-400"
            />
            <span className="text-purple-700 font-semibold">Unisex</span>
          </label>
        </div>

        {/* Add button - 3rd row */}
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={!name.trim()}
            className="bg-gradient-to-br from-amber-400 to-fuchsia-400 hover:from-amber-500 hover:to-fuchsia-500 disabled:from-gray-300 disabled:to-gray-400 text-white px-8 py-3 rounded-lg font-bold shadow-lg transition-all duration-200 disabled:cursor-not-allowed"
          >
            Add Name
          </button>
        </div>
      </form>
    </div>
  );
};
