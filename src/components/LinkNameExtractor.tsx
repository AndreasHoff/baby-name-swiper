import React, { useState } from 'react';
import { getCategoriesForName } from '../utils/nameCategories';

interface LinkNameExtractorProps {
  onNamesExtracted: (names: Array<{ name: string; gender: 'boy' | 'girl' | 'unisex' }>) => void;
}

interface ExtractedName {
  name: string;
  confidence: number;
  suggestedGender: 'boy' | 'girl' | 'unisex';
  categories: string[];
}

export const LinkNameExtractor: React.FC<LinkNameExtractorProps> = ({ onNamesExtracted }) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [extractedNames, setExtractedNames] = useState<ExtractedName[]>([]);
  const [selectedNames, setSelectedNames] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  // Simple name detection patterns
  const namePatterns = [
    // Danish/Nordic names
    /\b[A-ZÆØÅ][a-zæøå]+(?:\s+[A-ZÆØÅ][a-zæøå]+)?\b/g,
    // Common name patterns
    /\b(?:Alexander|Alexandra|Andreas|Anna|Emma|Lucas|Sophia|Noah|Oliver|Ella|William|Mia|Oscar|Alma|Astrid|Carl|Clara|Erik|Eva|Frederik|Ida|Isabella|Johan|Karla|Liam|Luna|Magnus|Maja|Mathilde|Mikkel|Nora|Philip|Sara|Theo|Victoria|Viggo)\b/gi
  ];

  // Common Danish boy/girl name indicators
  const boyNameIndicators = ['dreng', 'fyr', 'karl', 'mand', 'drenge', 'boys', 'male'];
  const girlNameIndicators = ['pige', 'kvinde', 'dame', 'piger', 'girls', 'female'];

  const extractNamesFromText = (text: string): ExtractedName[] => {
    const foundNames = new Set<string>();
    const nameConfidence: Record<string, number> = {};
    
    // Extract potential names using patterns
    namePatterns.forEach(pattern => {
      const matches = text.match(pattern) || [];
      matches.forEach(match => {
        const name = match.trim();
        if (name.length >= 2 && name.length <= 20 && /^[A-ZÆØÅa-zæøå\s-']+$/.test(name)) {
          foundNames.add(name);
          nameConfidence[name] = (nameConfidence[name] || 0) + 1;
        }
      });
    });

    // Convert to array and analyze
    const names = Array.from(foundNames).map(name => {
      const confidence = nameConfidence[name] || 1;
      const categories = getCategoriesForName(name);
      
      // Simple gender detection based on context
      const nameLower = name.toLowerCase();
      const textLower = text.toLowerCase();
      let suggestedGender: 'boy' | 'girl' | 'unisex' = 'unisex';
      
      // Check context around the name
      const nameIndex = textLower.indexOf(nameLower);
      if (nameIndex !== -1) {
        const contextBefore = textLower.substring(Math.max(0, nameIndex - 50), nameIndex);
        const contextAfter = textLower.substring(nameIndex + name.length, nameIndex + name.length + 50);
        const fullContext = contextBefore + ' ' + contextAfter;
        
        const boyScore = boyNameIndicators.reduce((score, indicator) => 
          score + (fullContext.includes(indicator) ? 1 : 0), 0);
        const girlScore = girlNameIndicators.reduce((score, indicator) => 
          score + (fullContext.includes(indicator) ? 1 : 0), 0);
        
        if (boyScore > girlScore) suggestedGender = 'boy';
        else if (girlScore > boyScore) suggestedGender = 'girl';
      }

      return {
        name,
        confidence,
        suggestedGender,
        categories
      };
    });

    // Sort by confidence and filter
    return names
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 20); // Limit to top 20 names
  };

  const handleExtractNames = async () => {
    if (!url.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setExtractedNames([]);
    setSelectedNames(new Set());

    try {
      // For demo purposes, simulate name extraction
      // In a real implementation, you would:
      // 1. Fetch the webpage content
      // 2. Parse the HTML
      // 3. Extract text content
      // 4. Apply name detection algorithms

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Demo: Extract names from URL if it contains specific patterns
      const demoText = generateDemoText(url);
      const names = extractNamesFromText(demoText);
      
      if (names.length === 0) {
        setError('No names found in the provided URL. Try a different link with baby name content.');
      } else {
        setExtractedNames(names);
      }
    } catch (err) {
      setError('Failed to extract names from the URL. Please check the link and try again.');
      console.error('[LinkNameExtractor] Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate demo text based on URL for demonstration
  const generateDemoText = (url: string): string => {
    const urlLower = url.toLowerCase();
    
    if (urlLower.includes('baby') || urlLower.includes('name')) {
      return `
        Popular Danish baby names for boys include Lucas, William, Oliver, Noah, Oscar, Alexander, Viktor, Magnus, Mathias, and Emil.
        For girls, the most popular names are Emma, Alma, Sofia, Freja, Isabella, Clara, Ella, Anna, Laura, and Ida.
        Traditional Nordic names like Astrid, Bjørn, Erik, Ingrid, Lars, and Maja are also gaining popularity.
        Modern international names such as Mia, Noah, Luna, and Theo work well in both Danish and English.
        Nature-inspired names include Rose, Lily, Storm, River, and Sky.
        Short names like Max, Kim, Eva, Ben, and Liv are trendy choices.
      `;
    }
    
    return `
      Some example names mentioned: Alexander, Emma, Oliver, Sofia, Lucas, Alma, William, Isabella, Oscar, Clara.
      Traditional choices: Erik, Anna, Lars, Marie, Karl, Birte, Jens, Lise.
      Modern options: Noah, Luna, Theo, Mia, Felix, Nova, Leo, Zara.
    `;
  };

  const toggleNameSelection = (name: string) => {
    const newSelected = new Set(selectedNames);
    if (newSelected.has(name)) {
      newSelected.delete(name);
    } else {
      newSelected.add(name);
    }
    setSelectedNames(newSelected);
  };

  const handleAddSelectedNames = () => {
    const namesToAdd = extractedNames
      .filter(item => selectedNames.has(item.name))
      .map(item => ({
        name: item.name,
        gender: item.suggestedGender
      }));
    
    if (namesToAdd.length > 0) {
      onNamesExtracted(namesToAdd);
      setExtractedNames([]);
      setSelectedNames(new Set());
      setUrl('');
    }
  };

  return (
    <div className="w-full bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/40 p-6 mt-4">
      <h3 className="text-xl font-bold text-fuchsia-700 mb-4 text-center">Extract Names from Link</h3>
      
      <div className="space-y-4">
        {/* URL input */}
        <div>
          <input
            type="url"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="Enter URL (e.g., baby name article or database)..."
            className="w-full px-4 py-3 rounded-lg border-2 border-fuchsia-200 focus:border-fuchsia-400 focus:outline-none bg-white/90 text-fuchsia-900 placeholder-fuchsia-400 font-medium"
          />
        </div>

        {/* Extract button */}
        <div className="flex justify-center">
          <button
            onClick={handleExtractNames}
            disabled={!url.trim() || isLoading}
            className="bg-gradient-to-br from-sky-400 to-amber-400 hover:from-sky-500 hover:to-amber-500 disabled:from-gray-300 disabled:to-gray-400 text-white px-6 py-3 rounded-lg font-bold shadow-lg transition-all duration-200 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Extracting Names...' : 'Extract Names'}
          </button>
        </div>

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-center items-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fuchsia-500"></div>
            <span className="ml-2 text-fuchsia-600 font-medium">Analyzing webpage...</span>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        )}

        {/* Extracted names */}
        {extractedNames.length > 0 && (
          <div>
            <h4 className="text-lg font-semibold text-fuchsia-700 mb-3">
              Found {extractedNames.length} names (tap to select):
            </h4>
            <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
              {extractedNames.map(item => (
                <div
                  key={item.name}
                  onClick={() => toggleNameSelection(item.name)}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    selectedNames.has(item.name)
                      ? 'border-fuchsia-400 bg-fuchsia-50'
                      : 'border-gray-200 bg-white hover:border-fuchsia-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900">{item.name}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm px-2 py-1 rounded-full ${
                        item.suggestedGender === 'boy' ? 'bg-sky-100 text-sky-700' :
                        item.suggestedGender === 'girl' ? 'bg-fuchsia-100 text-fuchsia-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {item.suggestedGender}
                      </span>
                      {selectedNames.has(item.name) && (
                        <span className="text-fuchsia-500">✓</span>
                      )}
                    </div>
                  </div>
                  {item.categories.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.categories.slice(0, 3).map(categoryId => (
                        <span
                          key={categoryId}
                          className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600"
                        >
                          {categoryId.replace('-', ' ')}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Add selected names button */}
            {selectedNames.size > 0 && (
              <div className="flex justify-center mt-4">
                <button
                  onClick={handleAddSelectedNames}
                  className="bg-gradient-to-br from-green-400 to-emerald-400 hover:from-green-500 hover:to-emerald-500 text-white px-6 py-3 rounded-lg font-bold shadow-lg transition-all duration-200"
                >
                  Add {selectedNames.size} Selected Name{selectedNames.size !== 1 ? 's' : ''}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Demo note */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-amber-700 text-sm">
            <strong>Demo:</strong> This feature simulates name extraction from web content. 
            In production, it would fetch and analyze real webpage content using web scraping or APIs.
          </p>
        </div>
      </div>
    </div>
  );
};
