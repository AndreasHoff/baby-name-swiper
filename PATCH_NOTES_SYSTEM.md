# Patch Notes System

This document describes the patch notes system implemented in the Baby Name Swiper App.

## Overview

The patch notes system provides users with information about recent app updates and changes. It displays content based on the environment:

- **Development**: Shows Analytics dashboard for developers + Patch Notes card
- **Production**: Shows only Patch Notes card (Analytics hidden)

## Structure

### PatchNotesCard Component
Location: `src/components/PatchNotesCard.tsx`

Features:
- Displays the latest update with full details
- Shows change type icons and color coding:
  - ✨ Added (green)
  - 🗑️ Removed (red)  
  - 🔧 Modified (blue)
  - 🐛 Fixed (orange)
- Expandable history section showing previous updates
- Responsive design with smooth animations

### Data Source
Location: `src/data/patchNotes.json`

Structure:
```json
[
  {
    "version": "1.4.0",
    "date": "2025-01-22", 
    "title": "Patch Notes System",
    "changes": [
      {
        "type": "added|removed|modified|fixed",
        "description": "Description of the change"
      }
    ]
  }
]
```

## Usage

### Viewing Patch Notes
- In both development and production: Navigate to Settings tab to see the Patch Notes card
- In development: Analytics dashboard is also shown above the Patch Notes
- In production: Only Patch Notes are shown (Analytics hidden)

### Adding New Patch Notes
1. Edit `src/data/patchNotes.json`
2. Add a new entry at the top of the array
3. Include version, date, title, and array of changes
4. Use appropriate change types: `added`, `removed`, `modified`, `fixed`

### Environment Detection
The system uses Vite environment variables:
- `import.meta.env.MODE === 'production'` - for production detection
- `import.meta.env.VITE_FIREBASE_PROJECT_ID?.includes('dev')` - for dev environment detection

## Integration

The patch notes are integrated into the MainLayout component:
- Added conditional rendering in the settings tab
- Import statement for the PatchNotesCard component
- Environment-based display logic

## Benefits

1. **User Communication**: Keep users informed about app improvements
2. **Feature Discovery**: Help users discover new functionality  
3. **Transparency**: Show development progress and bug fixes
4. **Environment Separation**: Different content for developers vs users
5. **Historical Tracking**: Maintain record of all changes over time
