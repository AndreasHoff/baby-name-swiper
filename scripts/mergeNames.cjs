// Merge and deduplicate all name files into a single file
const fs = require('fs');
const path = require('path');

function mergeAndDeduplicateNames() {
  console.log('🔄 Starting name file merge and deduplication...');
  
  // Read all three files
  const largeNames = JSON.parse(fs.readFileSync('src/assets/largeNames.json', 'utf8'));
  const largeNamesDeduped = JSON.parse(fs.readFileSync('src/assets/largeNames.deduped.json', 'utf8'));
  const moreNames = JSON.parse(fs.readFileSync('src/assets/morenames.json', 'utf8'));
  
  console.log('📊 Source files:');
  console.log(`   • largeNames.json: ${largeNames.length} names`);
  console.log(`   • largeNames.deduped.json: ${largeNamesDeduped.length} names`);
  console.log(`   • morenames.json: ${moreNames.length} names`);
  console.log(`   • Total before deduplication: ${largeNames.length + largeNamesDeduped.length + moreNames.length} names`);
  
  // Combine and deduplicate
  const nameMap = new Map();
  const allSources = [
    { names: largeNames, source: 'largeNames' },
    { names: moreNames, source: 'moreNames' },
    { names: largeNamesDeduped, source: 'deduped' }
  ];
  
  allSources.forEach(({ names, source }) => {
    names.forEach(entry => {
      const key = entry.name.toLowerCase().trim();
      if (!nameMap.has(key)) {
        nameMap.set(key, {
          name: entry.name.trim(),
          gender: entry.gender === 'boy' || entry.gender === 'girl' ? entry.gender : 'boy'
        });
      }
    });
  });
  
  // Convert to array and sort alphabetically
  const uniqueNames = Array.from(nameMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  
  console.log('✅ Deduplication complete:');
  console.log(`   • Total unique names: ${uniqueNames.length}`);
  const boys = uniqueNames.filter(n => n.gender === 'boy').length;
  const girls = uniqueNames.filter(n => n.gender === 'girl').length;
  console.log(`   • Boys: ${boys}`);
  console.log(`   • Girls: ${girls}`);
  console.log(`   • Removed duplicates: ${(largeNames.length + largeNamesDeduped.length + moreNames.length) - uniqueNames.length}`);
  
  // Write to new file
  const outputPath = 'src/assets/allNames.json';
  fs.writeFileSync(outputPath, JSON.stringify(uniqueNames, null, 2));
  console.log(`💾 Created: ${outputPath}`);
  
  console.log('\n📝 First 10 names:');
  uniqueNames.slice(0, 10).forEach(n => console.log(`   • ${n.name} (${n.gender})`));
  
  return uniqueNames.length;
}

// Run the merge
try {
  const totalNames = mergeAndDeduplicateNames();
  console.log(`\n🎉 Successfully created allNames.json with ${totalNames} unique names`);
} catch (error) {
  console.error('❌ Error during merge:', error);
  process.exit(1);
}
