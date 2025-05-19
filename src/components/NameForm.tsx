import React, { useState } from 'react';
import type { Gender } from '../store';
import { useNameStore } from '../store';

export const NameForm: React.FC = () => {
  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender>('boy');
  const addName = useNameStore((s) => s.addName);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addName(name.trim(), gender);
    setName('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 items-center mt-6">
      <input
        className="border rounded px-3 py-2 text-lg"
        placeholder="Add custom name..."
        value={name}
        onChange={e => setName(e.target.value)}
        required
      />
      <div className="flex gap-4">
        <label>
          <input type="radio" name="gender" value="boy" checked={gender === 'boy'} onChange={() => setGender('boy')} /> Boy
        </label>
        <label>
          <input type="radio" name="gender" value="girl" checked={gender === 'girl'} onChange={() => setGender('girl')} /> Girl
        </label>
        <label>
          <input type="radio" name="gender" value="unisex" checked={gender === 'unisex'} onChange={() => setGender('unisex')} /> Unisex
        </label>
      </div>
      <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mt-2">Add Name</button>
    </form>
  );
};
