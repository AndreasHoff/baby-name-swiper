import React, { useState } from 'react';
import type { Gender } from '../store';
import { useNameStore } from '../store';

// GenderRadioGroup component
const GenderRadioGroup: React.FC<{
  gender: Gender;
  setGender: (g: Gender) => void;
}> = ({ gender, setGender }) => (
  <div className="flex gap-4 justify-center w-full">
    <label className="flex items-center gap-1 text-fuchsia-600 font-semibold">
      <input type="radio" name="gender" value="boy" checked={gender === 'boy'} onChange={() => setGender('boy')} className="accent-sky-500" /> Boy
    </label>
    <label className="flex items-center gap-1 text-sky-600 font-semibold">
      <input type="radio" name="gender" value="girl" checked={gender === 'girl'} onChange={() => setGender('girl')} className="accent-fuchsia-500" /> Girl
    </label>
    <label className="flex items-center gap-1 text-amber-600 font-semibold">
      <input type="radio" name="gender" value="unisex" checked={gender === 'unisex'} onChange={() => setGender('unisex')} className="accent-amber-500" /> Unisex
    </label>
  </div>
);

// NameInput component
const NameInput: React.FC<{
  name: string;
  setName: (n: string) => void;
}> = ({ name, setName }) => (
  <input
    className="border-2 border-fuchsia-400 rounded-lg px-3 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-sky-400 bg-gradient-to-r from-sky-100 via-fuchsia-50 to-amber-100 shadow w-full placeholder-fuchsia-300"
    placeholder="Add custom name..."
    value={name}
    onChange={e => setName(e.target.value)}
    required
  />
);

export const NameForm: React.FC<{ onNameAdded?: (name?: string) => void }> = ({ onNameAdded }) => {
  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender>('boy');
  const addName = useNameStore((s) => s.addName);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await addName(name.trim(), gender);
    if (onNameAdded) onNameAdded(name.trim());
    setName('');
  };

  return (
    <form onSubmit={handleSubmit} className="cardstack-form flex flex-col items-center justify-center w-[430px] max-w-full px-4 md:px-8 gap-3 mt-3 mx-auto" style={{flex: '0 0 auto'}}>
      <NameInput name={name} setName={setName} />
      <GenderRadioGroup gender={gender} setGender={setGender} />
      <button type="submit" className="bg-gradient-to-br from-fuchsia-400 to-sky-400 hover:from-fuchsia-500 hover:to-sky-500 text-white px-4 py-2 rounded-lg mt-2 font-bold shadow transition-all duration-200 w-full">Add Name</button>
    </form>
  );
};
