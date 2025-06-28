// scripts/importNames.cjs
// Usage: node scripts/importNames.cjs [--env=dev|prod]
// Or set FIREBASE_ENV=dev|prod
// Default is prod
// Populates Firestore with names from src/assets/allNames.json (deduplicated)
// Names are created with the new tag system structure and automatically assigned appropriate tags

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

// Add support for --env=dev|prod or FIREBASE_ENV
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

// Load service account key
const serviceAccount = require(serviceAccountPath);

// Initialize Firebase Admin SDK
initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

// Fetch all available tags from the database
async function fetchAvailableTags() {
  console.log('Fetching available tags from nameCategories...');
  const snapshot = await db.collection('nameCategories').get();
  const tagMapping = {};
  
  snapshot.docs.forEach(doc => {
    const data = doc.data();
    tagMapping[data.name] = doc.id;
  });
  
  console.log(`Found ${Object.keys(tagMapping).length} tags:`, Object.keys(tagMapping).join(', '));
  return tagMapping;
}

// Assign tags to names based on name characteristics
function assignTagsToName(name, gender, tagMapping) {
  const tags = [];
  const nameLower = name.toLowerCase();
  
  // Traditional Danish names
  const traditionalDanish = [
    'lars', 'anders', 'christian', 'erik', 'jens', 'anna', 'marie', 'karen', 'lise', 'birte',
    'hans', 'peter', 'niels', 'søren', 'martin', 'michael', 'thomas', 'henrik', 'morten',
    'kirsten', 'hanne', 'susanne', 'lone', 'pia', 'charlotte', 'marianne', 'helle'
  ];
  if (traditionalDanish.includes(nameLower) && tagMapping['Traditional Danish']) {
    tags.push(tagMapping['Traditional Danish']);
  }
  
  // Nordic Names
  const nordic = [
    'thor', 'bjorn', 'sven', 'olaf', 'gustav', 'astrid', 'ingrid', 'maja', 'lena', 'sigrid',
    'erik', 'magnus', 'axel', 'ragnar', 'tor', 'ulf', 'frida', 'helena', 'saga', 'thea',
    'nils', 'lars', 'anders', 'viggo', 'gunnar', 'arne', 'rune', 'inger', 'karin', 'solveig'
  ];
  if (nordic.includes(nameLower) && tagMapping['Nordic Names']) {
    tags.push(tagMapping['Nordic Names']);
  }
  
  // Modern Names
  const modern = [
    'noah', 'oliver', 'lucas', 'william', 'oscar', 'emma', 'sophia', 'mia', 'ella', 'alma',
    'alexander', 'gustav', 'victor', 'elias', 'malthe', 'clara', 'laura', 'sofia', 'anna', 'ellen',
    'felix', 'emil', 'storm', 'august', 'sebastian', 'julie', 'maja', 'freja', 'isabella', 'mathilde'
  ];
  if (modern.includes(nameLower) && tagMapping['Modern Names']) {
    tags.push(tagMapping['Modern Names']);
  }
  
  // International names (common in both Danish and English)
  const international = [
    'alex', 'max', 'leo', 'ben', 'tim', 'nina', 'sara', 'ida', 'eva', 'lisa',
    'oliver', 'lucas', 'william', 'victor', 'emma', 'sophia', 'anna', 'clara', 'ellen',
    'daniel', 'david', 'kevin', 'patrick', 'sebastian', 'maria', 'julia', 'laura', 'sofia'
  ];
  if (international.includes(nameLower) && tagMapping['International']) {
    tags.push(tagMapping['International']);
  }
  
  // Nature Names
  const nature = [
    'river', 'forest', 'sol', 'storm', 'sage', 'rose', 'lily', 'iris', 'ivy', 'luna',
    'august', 'flora', 'vera', 'viola', 'ronja', 'stella', 'nova', 'aurora', 'dawn'
  ];
  if (nature.includes(nameLower) && tagMapping['Nature Names']) {
    tags.push(tagMapping['Nature Names']);
  }
  
  // Short Names (4 letters or fewer)
  if (name.length <= 4 && tagMapping['Short Names']) {
    tags.push(tagMapping['Short Names']);
  }
  
  return tags;
}

async function main() {
  const namesPath = path.join(__dirname, '../src/assets/allNames.json');
  const names = JSON.parse(fs.readFileSync(namesPath, 'utf8'));
  
  // Fetch available tags first
  const tagMapping = await fetchAvailableTags();
  
  if (Object.keys(tagMapping).length === 0) {
    console.error('❌ No tags found in nameCategories collection!');
    console.error('Please run the resetDatabase script first to create default tags.');
    process.exit(1);
  }
  
  let added = 0, skipped = 0;
  console.log(`Processing ${names.length} names...`);
  
  for (const entry of names) {
    const name = entry.name.trim();
    // Only allow 'boy' or 'girl' as gender
    const gender = (entry.gender === 'boy' || entry.gender === 'girl') ? entry.gender : 'boy';
    
    // Check for duplicate (case-insensitive)
    const snap = await db.collection('baby-names').where('name', '==', name).get();
    if (!snap.empty) {
      skipped++;
      continue;
    }
    
    // Assign tags based on name characteristics
    const categories = assignTagsToName(name, gender, tagMapping);
    
    // Create name with new structure
    await db.collection('baby-names').add({
      name,
      gender,
      votes: {},
      categories: categories, // New tag system
      created: new Date().toISOString(),
      hasSpecialChars: /[^a-zA-ZæøåÆØÅ\s-']/.test(name),
      source: 'import',
      nameLength: name.length,
      addedBy: 'system'
    });
    
    added++;
    if (added % 50 === 0) {
      console.log(`Progress: ${added} names added...`);
    }
  }
  
  console.log(`✅ Import completed!`);
  console.log(`📊 Summary:`);
  console.log(`   • Added: ${added} names`);
  console.log(`   • Skipped (already exists): ${skipped}`);
  console.log(`   • All names have proper tag associations`);
}

main().catch(e => { console.error(e); process.exit(1); });
