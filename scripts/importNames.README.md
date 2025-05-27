# Firestore Baby Name Import Script

This script populates the Firestore database with baby names from `src/assets/largeNames.json`.

## Usage

You can import names into either the development or production Firebase project.

### Command Line

```
node scripts/importNames.cjs --env=dev   # Import into development Firestore
node scripts/importNames.cjs --env=prod  # Import into production Firestore (default)
```

### Environment Variable

```
FIREBASE_ENV=dev node scripts/importNames.cjs
FIREBASE_ENV=prod node scripts/importNames.cjs
```

If neither is specified, the script defaults to `prod`.

## Prerequisites

- Place your Firebase service account keys in the project root as:
  - `serviceAccountKey.dev.json` (for development)
  - `serviceAccountKey.prod.json` (for production)

- Ensure `src/assets/largeNames.json` exists and contains the names to import.

## Notes
- The script skips names that already exist in the database (case-insensitive).
- Only 'boy' or 'girl' are allowed as gender; others default to 'boy'.

---

For more details, see the comments in `scripts/importNames.cjs`.
