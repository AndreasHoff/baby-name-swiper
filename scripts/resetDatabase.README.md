# Database Reset Script

This script completely resets the Firestore database by clearing and repopulating the baby-names and nameCategories collections with a consistent tag system.

## Purpose

- Clears all existing baby names and categories
- Creates a fresh set of default tags using the new tag system
- Populates sample baby names with proper tag associations
- Ensures all names use tag IDs instead of legacy category strings

## Usage

### Development Environment (Default)
```bash
node scripts/resetDatabase.cjs
# or explicitly
node scripts/resetDatabase.cjs --env=dev
```

### Production Environment
```bash
node scripts/resetDatabase.cjs --env=prod
```

### Using Environment Variable
```bash
FIREBASE_ENV=dev node scripts/resetDatabase.cjs
FIREBASE_ENV=prod node scripts/resetDatabase.cjs
```

## Environment Configuration

The script uses Firebase Admin SDK with service account keys:
- **Development**: `serviceAccountKey.dev.json` → `baby-name-swiper-dev` project
- **Production**: `serviceAccountKey.prod.json` → `baby-name-swiper` project

## Safety Features

- Defaults to development environment for safety
- Production environment requires explicit confirmation (type "YES")
- Validates service account configuration before proceeding
- Shows target project and environment before starting

## What It Does

1. **Validation**: Confirms Firebase Admin SDK setup and target project
2. **Clear Collections**: Removes all documents from:
   - `baby-names` collection
   - `nameCategories` collection  
3. **Create Tags**: Recreates default tag categories:
   - Traditional Danish
   - Nordic Names
   - Modern Names
   - International
   - Nature Names
   - Short Names
4. **Import All Names**: Automatically runs `importNames.cjs` to import all 291 names from `allNames.json`
5. **Tag Assignment**: All names get appropriate tags based on their characteristics

## Sample Data

The script creates:
- 6 default tag categories
- 291 baby names imported from `src/assets/allNames.json` (deduplicated from all previous sources)
- **Total: 291 names** with proper tag associations and no duplicates
- Each name includes proper metadata (gender, creation date, length, etc.)
- Single source of truth for all names

## Dependencies

- `firebase-admin` - Firebase Admin SDK for server-side operations
- Node.js built-in modules (`fs`, `path`, `readline`)

## When to Use

- Setting up a new development environment
- Cleaning up test data during development
- Migrating from legacy category system to new tag system
- Preparing a clean database state for testing

## Important Notes

- **Destructive Operation**: This permanently deletes all existing data
- **Production Safety**: Extra confirmation required for production environment
- **Tag Consistency**: Ensures all names use the new tag ID system
- **No Legacy Data**: Removes any old category strings or inconsistent data

See `RESET_GUIDE.md` for more detailed information about the database reset process.
