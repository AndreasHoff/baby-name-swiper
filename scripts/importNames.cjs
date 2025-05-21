// scripts/importNames.cjs
// Usage: node scripts/importNames.cjs
// Populates Firestore with names from src/assets/largeNames.json

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

// Load service account key
const serviceAccount = require('../serviceAccountKey.json');

// Initialize Firebase Admin SDK
initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

async function main() {
  const namesPath = path.join(__dirname, '../src/assets/largeNames.json');
  const names = JSON.parse(fs.readFileSync(namesPath, 'utf8'));
  let added = 0, skipped = 0;
  for (const entry of names) {
    const name = entry.name.trim();
    const gender = entry.gender || 'unisex';
    // Check for duplicate (case-insensitive)
    const snap = await db.collection('baby-names').where('name', '==', name).get();
    if (!snap.empty) {
      skipped++;
      continue;
    }
    await db.collection('baby-names').add({
      name,
      gender,
      created: new Date().toISOString(),
      votes: { Andreas: null, Emilie: null },
    });
    added++;
  }
  console.log(`Done. Added: ${added}, Skipped (already exists): ${skipped}`);
}

main().catch(e => { console.error(e); process.exit(1); });
