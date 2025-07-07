# Firestore Baby Name Import Script

This script populates the Firestore database with baby names from `src/assets/largeNames.json` using the new tag system structure.

## Features

- **Tag System Integration**: Automatically assigns appropriate tags to imported names
- **Smart Tag Assignment**: Names get tagged based on their characteristics (Traditional Danish, Nordic, Modern, etc.)
- **Complete Name Structure**: Creates names with all required fields for the new database schema
- **Duplicate Prevention**: Skips names that already exist (case-insensitive)
- **Environment Support**: Works with both dev and production environments

## Usage

You can import names into either the development or production Firebase project.

### Command Line

```bash
node scripts/importNames.cjs --env=dev   # Import into development Firestore
node scripts/importNames.cjs --env=prod  # Import into production Firestore (default)
```

### Environment Variable

```bash
FIREBASE_ENV=dev node scripts/importNames.cjs
FIREBASE_ENV=prod node scripts/importNames.cjs
```

If neither is specified, the script defaults to `prod`.

## Prerequisites

- **Service Account Keys**: Place your Firebase service account keys in the project root as:
  - `serviceAccountKey.dev.json` (for development)
  - `serviceAccountKey.prod.json` (for production)

- **Tags Must Exist**: The script requires existing tags in the `nameCategories` collection. Run `resetDatabase.cjs` first to create default tags.

- **Source File**: Ensure `src/assets/allNames.json` exists and contains the names to import (this is the deduplicated version of all name files).

## What It Does

1. **Fetches Available Tags**: Loads all tags from the `nameCategories` collection
2. **Processes Names**: Reads 291 unique names from `allNames.json` (deduplicated from multiple sources)
3. **Assigns Tags**: Automatically assigns relevant tags based on name characteristics:
   - **Traditional Danish**: Lars, Anders, Christian, Anna, Marie, etc.
   - **Nordic Names**: Thor, Bjorn, Astrid, Ingrid, Magnus, etc.
   - **Modern Names**: Noah, Oliver, Emma, Sophia, Lucas, etc.
   - **International**: Alex, Max, Nina, Sara, Oliver, etc.
   - **Nature Names**: Storm, Rose, Lily, Aurora, etc.
   - **Short Names**: All names with 4 letters or fewer
4. **Creates Complete Records**: Each name includes:
   - `name`, `gender`, `votes`, `categories` (tag IDs)
   - `created`, `hasSpecialChars`, `source`, `nameLength`, `addedBy`
5. **Prevents Duplicates**: Skips names that already exist

## Data Output

- **Source**: 291 unique names from `allNames.json` (merged and deduplicated from all previous name files)
- **Typical Import**: 291 names (no duplicates since source is already deduplicated)
- **Tag Assignment**: Each name gets 0-3 relevant tags automatically
- **Structure**: Uses new tag system compatible with the updated app

## Integration

This script is automatically called by `resetDatabase.cjs` after creating tags, providing a complete database setup with both sample names and a larger collection of properly tagged names.

## Notes
- **Requires Tags**: Script will fail if no tags exist in `nameCategories` collection
- **Gender Validation**: Only 'boy' or 'girl' are allowed; others default to 'boy'
- **Progress Tracking**: Shows progress every 50 names during import
- **Smart Tagging**: Uses comprehensive lists to assign appropriate tags

---

For more details, see the comments in `scripts/importNames.cjs`.
