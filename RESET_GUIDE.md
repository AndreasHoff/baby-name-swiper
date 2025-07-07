# Complete Database Reset Guide

## Overview

This guide provides a complete reset solution for the Baby Name Swiper app development environment to ensure consistency with the new tag system.

## 🎯 What Gets Reset

### 1. Database Collections
- **`baby-names`** - All baby names deleted and recreated with proper tag structure
- **`nameCategories`** - All tags deleted and recreated with consistent IDs

### 2. User Data
- **User votes** - Can be cleared via the UI (development only)

## 🚀 Step-by-Step Reset Process

### Step 1: Configure Firebase (Required)

1. **Open the reset script:**
   ```bash
   code scripts/resetDatabase.cjs
   ```

2. **Update Firebase config** with your dev environment values:
   ```javascript
   const firebaseConfig = {
     apiKey: "your-actual-dev-api-key",
     authDomain: "your-dev-project.firebaseapp.com",
     projectId: "your-dev-project-id",
     // ... etc
   };
   ```

3. **Find your config values** in Firebase Console:
   - Go to Project Settings > General > Your apps
   - Copy the config object values

### Step 2: Run Database Reset

```bash
node scripts/resetDatabase.cjs
```

**Expected output:**
```
🚀 Starting database reset...
✅ Firebase configuration validated
🎯 Target project: your-dev-project-id
Clearing baby-names collection...
Clearing nameCategories collection...
Creating tags...
Created tag "Traditional Danish" with ID: abc123
...
✅ Database reset completed successfully!
```

### Step 3: Reset User Votes (Optional)

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Navigate to Settings tab** in the app

3. **Click "Reset My Votes"** button (only visible in development)

4. **Confirm the reset** when prompted

## 📊 What Gets Created

### Tags (6 total)
- **Traditional Danish** - Lars, Anders, Christian, Anna, Marie, etc.
- **Nordic Names** - Thor, Bjorn, Astrid, Ingrid, etc.  
- **Modern Names** - Noah, Oliver, Emma, Sophia, etc.
- **International** - Alex, Max, Nina, Sara, etc.
- **Nature Names** - River, Forest, Rose, Lily, etc.
- **Short Names** - All names ≤4 letters get this tag

### Baby Names (60+ total)
- Each name has proper `categories` array with tag IDs
- All required fields: `votes`, `created`, `hasSpecialChars`, `source`, etc.
- Consistent data structure across all names

## 🔍 Verification

After reset, verify the system works:

1. **Check tags load** in AddBabyName form
2. **Create a new tag** - should work instantly  
3. **Add a new name** with tags - should appear in swipe view
4. **Tags display correctly** on cards without page refresh
5. **User votes reset** clears all previous votes

## ⚠️ Important Notes

- **Development only** - Do not run on production
- **Destructive operation** - All existing data will be lost
- **Firebase project** - Make sure you're connected to dev environment
- **Backup** - Consider backing up important data first

## 🐛 Troubleshooting

### "Firebase configuration incomplete"
- Update the firebaseConfig object with real values
- Check Firebase Console for correct config

### "Permission denied" 
- Verify you're connected to the correct Firebase project
- Check Firestore security rules allow writes

### "Tags not appearing"
- Refresh the page after database reset
- Check browser console for errors
- Verify tag creation succeeded in script output

### "Votes not clearing"
- Make sure you're in development mode
- Check that user is properly authenticated
- Look for errors in browser console

## 🎉 After Reset

Your development environment will have:
- ✅ Clean, consistent database structure
- ✅ Proper tag system implementation  
- ✅ All names properly categorized
- ✅ Fresh start for testing
- ✅ No migration or compatibility issues

The tag system should work perfectly from this point forward!
