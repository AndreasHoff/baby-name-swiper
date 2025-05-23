import React, { useState } from 'react';

interface AddBabyNameProps {
  onNameAdded: (name: string, gender: 'boy' | 'girl') => void;
}

export const AddBabyName: React.FC<AddBabyNameProps> = ({ onNameAdded }) => {
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'boy' | 'girl'>('boy');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[AddBabyName] Form submitted:', name, gender);
    if (!name.trim()) return;
    if (onNameAdded) onNameAdded(name.trim(), gender);
    setName('');
    setGender('boy');
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
            onChange={e => { setName(e.target.value); console.log('[AddBabyName] Name input changed:', e.target.value); }}
            placeholder="Enter baby name..."
            className="w-full px-4 py-3 rounded-lg border-2 border-fuchsia-200 focus:border-fuchsia-400 focus:outline-none bg-white/90 text-fuchsia-900 placeholder-fuchsia-400 font-medium"
          />
        </div>

        {/* Gender selection - 2nd row */}
        <div className="flex gap-4 justify-center">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name="gender"
              value="boy"
              checked={gender === 'boy'}
              onChange={e => { setGender(e.target.value as 'boy' | 'girl'); console.log('[AddBabyName] Gender input changed:', e.target.value); }}
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
              onChange={e => { setGender(e.target.value as 'boy' | 'girl'); console.log('[AddBabyName] Gender input changed:', e.target.value); }}
              className="w-4 h-4 text-fuchsia-400 border-2 border-fuchsia-300 focus:ring-fuchsia-400"
            />
            <span className="text-fuchsia-700 font-semibold">Girl</span>
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
