# Firestore User Import Script

This script populates the Firestore `users` collection with two users: Andreas and Emilie.

## Usage

You can import users into either the development or production Firebase project.

### Command Line

```
node scripts/importUsers.cjs --env=dev   # Import into development Firestore
node scripts/importUsers.cjs --env=prod  # Import into production Firestore (default)
```

### Environment Variable

```
FIREBASE_ENV=dev node scripts/importUsers.cjs
FIREBASE_ENV=prod node scripts/importUsers.cjs
```

If neither is specified, the script defaults to `prod`.

## Prerequisites

- Place your Firebase service account keys in the project root as:
  - `serviceAccountKey.dev.json` (for development)
  - `serviceAccountKey.prod.json` (for production)

## Notes
- The script skips users that already exist in the database (by document ID).
- Each user document contains only `displayName` and `created` fields.

---

For more details, see the comments in `scripts/importUsers.cjs`.
