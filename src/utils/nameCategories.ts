// Name categorization utility
export interface NameCategory {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  patterns?: RegExp[];
}

export const NAME_CATEGORIES: NameCategory[] = [
  {
    id: 'traditional-danish',
    name: 'Traditional Danish',
    description: 'Classic Danish names with historical significance',
    keywords: ['lars', 'anders', 'christian', 'erik', 'karl', 'anna', 'marie', 'karen', 'lise', 'birte', 'jens', 'niels', 'per', 'ole', 'bent'],
    patterns: [/.*sen$/, /.*borg$/, /.*gaard$/]
  },
  {
    id: 'nordic',
    name: 'Nordic Names',
    description: 'Names from Scandinavian countries',
    keywords: ['thor', 'bjorn', 'erik', 'astrid', 'ingrid', 'sven', 'olaf', 'maja', 'lena', 'nils', 'gustav', 'arvid', 'sigrid', 'gunnar'],
    patterns: [/.*sson$/, /.*sen$/, /.*dottir$/]
  },
  {
    id: 'modern',
    name: 'Modern Names',
    description: 'Contemporary names popular in recent years',
    keywords: ['noah', 'emma', 'oliver', 'sophia', 'lucas', 'mia', 'william', 'ella', 'oscar', 'alma', 'lucas', 'nova', 'theo', 'luna'],
    patterns: []
  },
  {
    id: 'international',
    name: 'Names usable in Danish and English',
    description: 'Names that work well in both Danish and English contexts',
    keywords: ['alex', 'anna', 'emma', 'max', 'nina', 'sara', 'tim', 'mia', 'leo', 'ida', 'ben', 'eva', 'kim', 'lisa'],
    patterns: []
  },
  {
    id: 'nature',
    name: 'Nature Names',
    description: 'Names inspired by nature, plants, and animals',
    keywords: ['rose', 'lily', 'iris', 'sky', 'river', 'storm', 'sage', 'ivy', 'dawn', 'forest', 'ocean', 'luna', 'sol', 'flora'],
    patterns: []
  },
  {
    id: 'short',
    name: 'Short Names',
    description: 'Names with 4 letters or fewer',
    keywords: [],
    patterns: [/^.{1,4}$/]
  }
];

export function categorizeNames(names: Array<{ name: string; gender: string }>): Array<{ name: string; gender: string; categories: string[] }> {
  return names.map(nameObj => {
    const categories: string[] = [];
    const nameLower = nameObj.name.toLowerCase().trim();
    
    for (const category of NAME_CATEGORIES) {
      let matches = false;
      
      // Check keywords
      if (category.keywords.some(keyword => nameLower.includes(keyword.toLowerCase()))) {
        matches = true;
      }
      
      // Check patterns
      if (category.patterns && category.patterns.some(pattern => pattern.test(nameLower))) {
        matches = true;
      }
      
      if (matches) {
        categories.push(category.id);
      }
    }
    
    return {
      ...nameObj,
      categories
    };
  });
}

export function getCategoryById(id: string): NameCategory | undefined {
  return NAME_CATEGORIES.find(cat => cat.id === id);
}

export function getCategoriesForName(name: string): string[] {
  const result = categorizeNames([{ name, gender: 'unisex' }]);
  return result[0]?.categories || [];
}
