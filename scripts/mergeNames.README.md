# Name File Merge Script

This utility script merges and deduplicates multiple name files into a single clean file.

## Purpose

The project previously had multiple name files with significant duplicates:
- `largeNames.json` (288 names)
- `largeNames.deduped.json` (247 names) 
- `morenames.json` (303 names)

Combined, these contained 838 total entries but only 291 unique names (547 duplicates!).

## Usage

```bash
node scripts/mergeNames.cjs
```

## What It Does

1. **Reads Source Files**: Loads all three existing name files
2. **Deduplicates**: Uses case-insensitive name matching to remove duplicates
3. **Cleans Data**: Ensures proper gender values ('boy' or 'girl')
4. **Sorts**: Alphabetically sorts the final list
5. **Creates Output**: Writes to `src/assets/allNames.json`

## Output

- **Input**: 838 total names from 3 files
- **Output**: 291 unique names (131 boys, 160 girls)
- **Removed**: 547 duplicates
- **Format**: Clean JSON with `name` and `gender` fields

## Integration

After running this script:
1. The old files (`largeNames.json`, `largeNames.deduped.json`, `morenames.json`) should be deleted
2. `importNames.cjs` now uses `allNames.json` as its source
3. No more duplicate imports or conflicting name files

## One-Time Use

This script was created to clean up the name file situation and should only need to be run once. The resulting `allNames.json` file becomes the single source of truth for name imports.
