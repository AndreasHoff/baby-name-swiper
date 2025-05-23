import React, { useState } from 'react';

// Define Gender type locally since store.ts is obsolete
export type Gender = 'boy' | 'girl';

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
    onChange={e => { setName(e.target.value); console.log('[NameForm] Name input changed:', e.target.value); }}
    required
  />
);

export const NameForm: React.FC<{ onNameAdded?: (name?: string) => void }> = ({ onNameAdded }) => {
  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender>('boy');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[NameForm] Form submitted:', name, gender);
    setError(null);
    if (!name.trim()) return;
    try {
      // Firestore action to add name
      // await firestoreAddNameAction(name.trim(), gender);
      
      if (onNameAdded) onNameAdded(name.trim());
      setName('');
    } catch (err: any) {
      if (err.message === 'DUPLICATE_NAME') {
        setError('Baby name already exists');
        setTimeout(() => setError(null), 2000);
      } else {
        setError('An error occurred');
        setTimeout(() => setError(null), 2000);
      }
    }
  };

  return (
    <>
      {/* Error toaster */}
      <div className="fixed top-0 left-0 w-full flex justify-center z-50 pointer-events-none" style={{overflow: 'visible'}}>
        <div
          className="mt-3 px-8 py-3 rounded-2xl shadow-xl font-bold text-base flex items-center justify-center text-red-600 drop-shadow-lg text-center"
          style={{
            maxWidth: 420,
            minWidth: 220,
            background: 'linear-gradient(135deg, #fee2e2 0%, #fca5a5 60%, #fef3c7 100%)',
            border: 'none',
            boxShadow: '0 8px 24px 0 rgba(239, 68, 68, 0.10)',
            transition: 'transform 0.5s cubic-bezier(0.4,0,0.2,1)',
            transform: error ? 'translateY(0)' : 'translateY(-150%)',
            opacity: 1
          }}
        >
          <span className="mr-2 text-xl">❗</span><span className="mx-1 text-red-700">{error}</span>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="cardstack-form flex flex-col items-center justify-center w-[430px] max-w-full px-4 md:px-8 gap-3 mt-3 mx-auto" style={{flex: '0 0 auto'}}>
        <NameInput name={name} setName={setName} />
        <GenderRadioGroup gender={gender} setGender={setGender} />
        <button type="submit" className="bg-gradient-to-br from-fuchsia-400 to-sky-400 hover:from-fuchsia-500 hover:to-sky-500 text-white px-4 py-2 rounded-lg mt-2 font-bold shadow transition-all duration-200 w-full">Add Name</button>
      </form>
    </>
  );
};
