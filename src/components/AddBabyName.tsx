import React, { useState } from 'react';
import { NAME_CATEGORIES, getCategoriesForName } from '../utils/nameCategories';

interface AddBabyNameProps {
  onNameAdded: (name: string, gender: 'boy' | 'girl' | 'unisex') => void;
}

export const AddBabyName: React.FC<AddBabyNameProps> = ({ onNameAdded }) => {
  const [name, setName] = useState('');
  // Get persistent gender from localStorage or default to 'boy'
  const [gender, setGender] = useState<'boy' | 'girl' | 'unisex'>(() => {
    const savedGender = localStorage.getItem('lastSelectedGender');
    return (savedGender === 'boy' || savedGender === 'girl' || savedGender === 'unisex') ? savedGender : 'boy';
  });
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  // Save gender preference when it changes
  const handleGenderChange = (newGender: 'boy' | 'girl' | 'unisex') => {
    setGender(newGender);
    localStorage.setItem('lastSelectedGender', newGender);
  };

  // Auto-suggest categories when name changes
  const handleNameChange = (newName: string) => {
    setName(newName);
    console.log('[AddBabyName] Name input changed:', newName);
    
    // Auto-suggest categories based on the name
    if (newName.trim().length > 2) {
      const suggestedCategories = getCategoriesForName(newName.trim());
      setSelectedCategories(suggestedCategories);
    } else {
      setSelectedCategories([]);
    }
  };

  // Toggle category selection
  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[AddBabyName] Form submitted:', name, gender, 'categories:', selectedCategories);
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
      categories: selectedCategories, // selected categories
    };
    // Pass the name and gender as before, but also log the full object for now
    if (onNameAdded) onNameAdded(newName.name, newName.gender);
    // Optionally: send newName to Firestore here if needed
    console.log('[AddBabyName] Full new name object:', newName);
    setName('');
    setSelectedCategories([]);
    setShowCategoryPicker(false);
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

        {/* Category suggestions - show when name has categories */}
        {selectedCategories.length > 0 && (
          <div>
            <label className="block text-sm font-semibold text-fuchsia-700 mb-2">
              Suggested Categories (tap to toggle):
            </label>
            <div className="flex flex-wrap gap-2">
              {NAME_CATEGORIES.filter(cat => selectedCategories.includes(cat.id)).map(category => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => toggleCategory(category.id)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedCategories.includes(category.id)
                      ? 'bg-fuchsia-500 text-white shadow-md'
                      : 'bg-fuchsia-100 text-fuchsia-700 hover:bg-fuchsia-200'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
            
            {/* Option to add more categories */}
            <button
              type="button"
              onClick={() => setShowCategoryPicker(!showCategoryPicker)}
              className="mt-2 text-sm text-fuchsia-600 hover:text-fuchsia-800 font-medium"
            >
              {showCategoryPicker ? 'Hide' : 'Add more categories'}
            </button>
            
            {showCategoryPicker && (
              <div className="mt-2 p-3 bg-fuchsia-50 rounded-lg border border-fuchsia-200">
                <div className="flex flex-wrap gap-2">
                  {NAME_CATEGORIES.filter(cat => !selectedCategories.includes(cat.id)).map(category => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => toggleCategory(category.id)}
                      className="px-3 py-1 rounded-full text-sm font-medium bg-white text-fuchsia-700 hover:bg-fuchsia-100 border border-fuchsia-200 transition-all duration-200"
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

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
