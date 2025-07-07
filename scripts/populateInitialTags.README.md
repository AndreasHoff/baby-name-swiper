# Populate Initial Tags Script

This script populates the Firestore `nameCategories` collection with initial tags based on the previous hardcoded categories.

## Usage

1. Edit the `firebaseConfig` in the script file to include your actual Firebase configuration values, or set environment variables:
   - VITE_FIREBASE_API_KEY
   - VITE_FIREBASE_AUTH_DOMAIN
   - VITE_FIREBASE_PROJECT_ID
   - etc.

2. Run the script:
   ```bash
   node scripts/populateInitialTags.cjs
   ```

## What it does

- Creates 6 initial tags in the `nameCategories` collection:
  - Traditional Danish
  - Nordic Names
  - Modern Names
  - International
  - Nature Names
  - Short Names

- Each tag includes:
  - name: The display name
  - description: A helpful description
  - createdAt: Timestamp
  - createdBy: 'system' for initial tags
  - usageCount: 0 (for future analytics)

## Note

Only run this script once to set up the initial tags. After that, users can create new tags through the UI.
