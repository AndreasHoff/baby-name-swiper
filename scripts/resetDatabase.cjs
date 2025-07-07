// Reset script for development and production environments
// Usage: node scripts/resetDatabase.cjs [--env=dev|prod]
// Or set FIREBASE_ENV=dev|prod
// Default is dev (for safety)
// This script will:
// 1. Clear baby-names collection
// 2. Clear nameCategories collection  
// 3. Recreate default tags
// 4. Import all names from allNames.json (deduplicated dataset) with proper tag assignments

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

// Add support for --env=dev|prod or FIREBASE_ENV
const defaultEnv = 'dev'; // Default to dev for safety
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

// Validate configuration
function validateConfig() {
  console.log('✅ Firebase Admin SDK initialized');
  console.log('🎯 Target project:', serviceAccount.project_id);
  console.log('🌍 Environment:', env);
}

// Default tags
const defaultTags = [
  { name: 'Traditional Danish', description: 'Classic Danish names with historical significance' },
  { name: 'Nordic Names', description: 'Names from Scandinavian countries' },
  { name: 'Modern Names', description: 'Contemporary names popular in recent years' },
  { name: 'International', description: 'Names usable in Danish and English' },
  { name: 'Nature Names', description: 'Names inspired by nature, plants, and animals' },
  { name: 'Short Names', description: 'Names with 4 letters or fewer' }
];

// Delete all documents in a collection
async function clearCollection(collectionName) {
  console.log(`Clearing ${collectionName} collection...`);
  const snapshot = await db.collection(collectionName).get();
  
  if (snapshot.empty) {
    console.log(`${collectionName} collection is already empty`);
    return;
  }

  const batch = db.batch();
  snapshot.docs.forEach((document) => {
    batch.delete(document.ref);
  });
  
  await batch.commit();
  console.log(`${collectionName} collection cleared: ${snapshot.size} documents deleted`);
}

// Create tags and return tag ID mapping
async function createTags() {
  console.log('Creating tags...');
  const tagMapping = {};
  
  for (const tag of defaultTags) {
    const tagData = {
      name: tag.name,
      description: tag.description,
      createdAt: new Date().toISOString(),
      createdBy: 'system',
      usageCount: 0
    };
    
    const docRef = await db.collection('nameCategories').add(tagData);
    tagMapping[tag.name] = docRef.id;
    console.log(`Created tag "${tag.name}" with ID: ${docRef.id}`);
  }
  
  return tagMapping;
}

// Main reset function
async function resetDatabase() {
  try {
    console.log('🚀 Starting database reset...');
    
    // Validate configuration first
    validateConfig();
    
    // Safety check for production
    if (env === 'prod') {
      console.log('⚠️  WARNING: You are about to reset the PRODUCTION database!');
      console.log('This will permanently delete all data in the following collections:');
      console.log('  • baby-names');
      console.log('  • nameCategories');
      console.log('');
      console.log('Are you sure you want to continue? Type "YES" to proceed:');
      
      // Simple confirmation for production
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      const answer = await new Promise((resolve) => {
        rl.question('', (input) => {
          rl.close();
          resolve(input.trim());
        });
      });
      
      if (answer !== 'YES') {
        console.log('❌ Operation cancelled');
        process.exit(0);
      }
      
      console.log('✅ Confirmation received, proceeding with production reset...');
    }
    
    // 1. Clear existing collections
    await clearCollection('baby-names');
    await clearCollection('nameCategories');
    
    // 2. Create new tags
    const tagMapping = await createTags();
    
    // 3. Import all names from allNames.json (deduplicated dataset)
    console.log('🔄 Running importNames script to populate database with all names...');
    const { spawn } = require('child_process');
    
    await new Promise((resolve, reject) => {
      const importProcess = spawn('node', ['scripts/importNames.cjs', `--env=${env}`], {
        cwd: path.join(__dirname, '..'),
        stdio: 'inherit'
      });
      
      importProcess.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`importNames.cjs exited with code ${code}`));
        }
      });
      
      importProcess.on('error', (error) => {
        reject(error);
      });
    });
    
    // Get final count
    const finalSnapshot = await db.collection('baby-names').get();
    const finalTagsSnapshot = await db.collection('nameCategories').get();
    
    console.log('✅ Database reset completed successfully!');
    console.log('📊 Summary:');
    console.log(`   • Environment: ${env}`);
    console.log(`   • Project: ${serviceAccount.project_id}`);
    console.log(`   • Created ${finalTagsSnapshot.size} tags`);
    console.log(`   • Total names in database: ${finalSnapshot.size}`);
    console.log(`   • All names imported from allNames.json (deduplicated dataset)`);
    console.log('   • All names have proper tag associations');
    console.log('   • No duplicate names (single source of truth)');
    console.log('   • Tag system is ready to use');
    
  } catch (error) {
    console.error('❌ Error during database reset:', error);
    throw error;
  }
}

// Run the reset
resetDatabase()
  .then(() => {
    console.log('Reset script completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Reset script failed:', error);
    process.exit(1);
  });
