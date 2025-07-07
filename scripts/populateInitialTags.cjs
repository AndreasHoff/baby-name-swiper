// Script to populate the nameCategories collection with initial tags
// Run this once to migrate from the old category system to the new tag system

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');

// You'll need to replace these with your actual Firebase config values
// or set them as environment variables before running this script
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "your-api-key-here",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "your-project.firebaseapp.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "your-project.appspot.com",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef",
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID || "G-ABCDEFG123",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Initial tags based on the old NAME_CATEGORIES
const initialTags = [
  {
    name: 'Traditional Danish',
    description: 'Classic Danish names with historical significance',
    createdAt: new Date().toISOString(),
    createdBy: 'system',
    usageCount: 0
  },
  {
    name: 'Nordic Names',
    description: 'Names from Scandinavian countries',
    createdAt: new Date().toISOString(),
    createdBy: 'system',
    usageCount: 0
  },
  {
    name: 'Modern Names',
    description: 'Contemporary names popular in recent years',
    createdAt: new Date().toISOString(),
    createdBy: 'system',
    usageCount: 0
  },
  {
    name: 'International',
    description: 'Names usable in Danish and English',
    createdAt: new Date().toISOString(),
    createdBy: 'system',
    usageCount: 0
  },
  {
    name: 'Nature Names',
    description: 'Names inspired by nature, plants, and animals',
    createdAt: new Date().toISOString(),
    createdBy: 'system',
    usageCount: 0
  },
  {
    name: 'Short Names',
    description: 'Names with 4 letters or fewer',
    createdAt: new Date().toISOString(),
    createdBy: 'system',
    usageCount: 0
  }
];

async function populateInitialTags() {
  console.log('Populating nameCategories collection with initial tags...');
  
  try {
    for (const tag of initialTags) {
      const docRef = await addDoc(collection(db, 'nameCategories'), tag);
      console.log(`Created tag "${tag.name}" with ID:`, docRef.id);
    }
    console.log('All initial tags created successfully!');
  } catch (error) {
    console.error('Error creating initial tags:', error);
  }
}

// Run the script
populateInitialTags()
  .then(() => {
    console.log('Script completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
