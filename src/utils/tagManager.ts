// Tag management with Firestore backend
import { addDoc, collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';

export interface Tag {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  createdBy?: string;
  usageCount?: number;
}

const TAGS_COLLECTION = 'nameCategories';

// Cache for tags to avoid repeated Firestore calls
let tagsCache: Tag[] | null = null;

/**
 * Get a tag by its ID (with caching)
 */
export function getTagById(tagId: string, availableTags?: Tag[]): Tag | null {
  // If tags are provided (from component state), use those
  if (availableTags) {
    return availableTags.find(tag => tag.id === tagId) || null;
  }
  
  // Otherwise try cache
  if (tagsCache) {
    return tagsCache.find(tag => tag.id === tagId) || null;
  }
  
  // If no cache available, return null (will need async fetch)
  return null;
}

/**
 * Fetch all tags from Firestore
 */
export async function fetchAllTags(): Promise<Tag[]> {
  try {
    console.log('[TagManager] Fetching all tags from Firestore...');
    const q = query(collection(db, TAGS_COLLECTION), orderBy('name', 'asc'));
    const querySnapshot = await getDocs(q);
    
    const tags: Tag[] = [];
    querySnapshot.forEach((doc) => {
      tags.push({
        id: doc.id,
        ...doc.data()
      } as Tag);
    });
    
    console.log('[TagManager] Fetched tags count:', tags.length);
    console.log('[TagManager] Fetched tags:', tags);
    
    // Update cache
    tagsCache = tags;
    
    // If no tags exist, create some default ones
    if (tags.length === 0) {
      console.log('[TagManager] No tags found, creating default tags...');
      await createDefaultTags();
      // Fetch again after creating defaults
      return await fetchAllTags();
    }
    
    return tags;
  } catch (error) {
    console.error('[TagManager] Error fetching tags:', error);
    // If collection doesn't exist yet, return empty array
    if (error && typeof error === 'object' && 'code' in error) {
      console.log('[TagManager] Firestore error code:', (error as any).code);
    }
    return [];
  }
}

/**
 * Create default tags when collection is empty
 */
async function createDefaultTags(): Promise<void> {
  const defaultTags = [
    { name: 'Traditional Danish', description: 'Classic Danish names with historical significance' },
    { name: 'Nordic Names', description: 'Names from Scandinavian countries' },
    { name: 'Modern Names', description: 'Contemporary names popular in recent years' },
    { name: 'International', description: 'Names usable in Danish and English' },
    { name: 'Nature Names', description: 'Names inspired by nature, plants, and animals' },
    { name: 'Short Names', description: 'Names with 4 letters or fewer' }
  ];
  
  console.log('[TagManager] Creating default tags:', defaultTags.map(t => t.name));
  
  try {
    for (const tagData of defaultTags) {
      await createTag(tagData.name, tagData.description);
    }
    console.log('[TagManager] Default tags created successfully');
  } catch (error) {
    console.error('[TagManager] Error creating default tags:', error);
  }
}

/**
 * Create a new tag in Firestore
 */
export async function createTag(name: string, description?: string): Promise<Tag | null> {
  try {
    console.log('[TagManager] Creating new tag:', name, description);
    
    // Check if tag already exists (case-insensitive)
    const existingTag = await findTagByName(name);
    if (existingTag) {
      console.log('[TagManager] Tag already exists:', existingTag);
      return existingTag;
    }
    
    const newTag = {
      name: name.trim(),
      description: description?.trim() || '',
      createdAt: new Date().toISOString(),
      createdBy: 'user', // Could be enhanced with actual user ID
      usageCount: 0
    };
    
    const docRef = await addDoc(collection(db, TAGS_COLLECTION), newTag);
    console.log('[TagManager] Tag created with ID:', docRef.id);
    
    // Clear cache since a new tag was added
    clearTagsCache();
    
    return {
      id: docRef.id,
      ...newTag
    };
  } catch (error) {
    console.error('[TagManager] Error creating tag:', error);
    return null;
  }
}

/**
 * Find a tag by name (case-insensitive)
 */
export async function findTagByName(name: string): Promise<Tag | null> {
  try {
    const nameLower = name.toLowerCase().trim();
    const q = query(collection(db, TAGS_COLLECTION));
    const querySnapshot = await getDocs(q);
    
    let foundTag: Tag | null = null;
    querySnapshot.forEach((doc) => {
      const tagData = doc.data();
      if (tagData.name.toLowerCase() === nameLower) {
        foundTag = {
          id: doc.id,
          ...tagData
        } as Tag;
      }
    });
    
    return foundTag;
  } catch (error) {
    console.error('[TagManager] Error finding tag by name:', error);
    return null;
  }
}

/**
 * Increment usage count for a tag (optional analytics)
 */
export async function incrementTagUsage(tagId: string): Promise<void> {
  try {
    // This would require updating the document, implementing later if needed
    console.log('[TagManager] TODO: Increment usage for tag:', tagId);
  } catch (error) {
    console.error('[TagManager] Error incrementing tag usage:', error);
  }
}

/**
 * Get popular tags (ordered by usage count)
 */
export async function getPopularTags(): Promise<Tag[]> {
  try {
    // For now, just return all tags ordered by name
    // Later can be enhanced to order by usageCount
    return await fetchAllTags();
  } catch (error) {
    console.error('[TagManager] Error getting popular tags:', error);
    return [];
  }
}

/**
 * Clear the tags cache (useful when new tags are created)
 */
export function clearTagsCache(): void {
  console.log('[TagManager] Clearing tags cache');
  tagsCache = null;
}
