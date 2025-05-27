// scripts/importUsers.cjs
// Usage: node scripts/importUsers.cjs [--env=dev|prod]
// Or set FIREBASE_ENV=dev|prod
// Default is prod
// Populates Firestore 'users' collection with Andreas and Emilie

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const path = require('path');

const defaultEnv = 'prod';
const argEnv = process.argv.find(arg => arg.startsWith('--env='));
const env = argEnv ? argEnv.split('=')[1] : (process.env.FIREBASE_ENV || defaultEnv);

let serviceAccountPath;
if (env === 'dev') {
  serviceAccountPath = path.join(__dirname, '../serviceAccountKey.dev.json');
} else if (env === 'prod') {
  serviceAccountPath = path.join(__dirname, '../serviceAccountKey.prod.json');
} else {
  console.error(`Unknown environment: ${env}. Use --env=dev or --env=prod.`);
  process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

const users = [
  { id: 'Andreas', displayName: 'Andreas' },
  { id: 'Emilie', displayName: 'Emilie' },
];

async function main() {
  let added = 0, skipped = 0;
  for (const user of users) {
    const ref = db.collection('users').doc(user.id);
    const snap = await ref.get();
    if (snap.exists) {
      skipped++;
      continue;
    }
    await ref.set({
      displayName: user.displayName,
      created: new Date().toISOString(),
    });
    added++;
  }
  console.log(`Done. Added: ${added}, Skipped (already exists): ${skipped}`);
}

main().catch(e => { console.error(e); process.exit(1); });
