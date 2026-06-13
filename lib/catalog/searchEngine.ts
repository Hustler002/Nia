import { Product, CATALOG } from './products';

export interface SearchFilters {
  category?: string;
  maxPrice?: number;
  minRating?: number;
  inStockOnly?: boolean;
  isVegetarian?: boolean;
  limit?: number;
}

export interface SearchResult {
  product: Product;
  matchScore: number;
  matchReason: string;
}

export function searchCatalog(query: string, filters?: SearchFilters): SearchResult[] {
  const lowerQuery = query.toLowerCase();
  
  // 1. Intent-to-category mapping & Constraint Parsing from natural language
  let activeFilters: SearchFilters = { ...filters };
  const impliedCategories = new Set<string>();
  
  if (lowerQuery.includes('movie night')) {
    impliedCategories.add('Snacks');
    impliedCategories.add('Beverages');
  }
  if (lowerQuery.match(/sick|fever|cold|headache|pain/)) {
    impliedCategories.add('Health & Medicine');
  }
  if (lowerQuery.match(/earbud|headphone|music/)) {
    impliedCategories.add('Electronics Accessories');
  }
  // Gym / Fitness
  if (lowerQuery.match(/gym|workout|fitness|protein|muscle|pre.?workout|post.?workout|exercise|training/)) {
    impliedCategories.add('Fitness & Protein');
    impliedCategories.add('Beverages'); // energy drinks
    impliedCategories.add('Breakfast & Eggs'); // eggs & oats
  }
  // Breakfast
  if (lowerQuery.match(/breakfast|morning|subah|oats|cereal|egg|anda/)) {
    impliedCategories.add('Breakfast & Eggs');
    impliedCategories.add('Dairy');
  }
  // Personal care / grooming
  if (lowerQuery.match(/shampoo|shaving|razor|toothpaste|body wash|deodoran|deo|grooming|bath|skin/)) {
    impliedCategories.add('Personal Care');
  }
  // Instant food / hungry / midnight
  if (lowerQuery.match(/hungry|bhookh|instant|quick food|midnight|maggi|noodles|ready to eat|lazy/)) {
    impliedCategories.add('Instant Food');
  }
  // Grocery / kitchen
  if (lowerQuery.match(/grocery|kitchen|salt|oil|detergent|sabun|cleaning|bartan/)) {
    impliedCategories.add('Grocery Staples');
  }
  
  // Parse simple constraints
  const priceMatch = lowerQuery.match(/(?:under|below|max|kam)\s*(?:₹|rs\.?|rupees)?\s*(\d+)/i);
  if (priceMatch && priceMatch[1]) {
    activeFilters.maxPrice = parseInt(priceMatch[1], 10);
  }
  if (lowerQuery.includes('vegetarian') || lowerQuery.includes('veg')) {
    activeFilters.isVegetarian = true;
  }
  
  const sortPriority: 'rating' | 'eta' | 'relevance' = 
    (lowerQuery.includes('best rated') || lowerQuery.includes('top rated')) ? 'rating' :
    (lowerQuery.includes('fastest') || lowerQuery.includes('jaldi')) ? 'eta' : 'relevance';

  const scoredResults: SearchResult[] = CATALOG.map(product => {
    let score = 0;
    const reasons: string[] = [];
    
    // Hard filter out
    if (activeFilters.inStockOnly && !product.inStock) return { product, matchScore: 0, matchReason: '' };
    if (activeFilters.maxPrice && product.price > activeFilters.maxPrice) return { product, matchScore: 0, matchReason: '' };
    if (activeFilters.minRating && product.rating < activeFilters.minRating) return { product, matchScore: 0, matchReason: '' };
    if (activeFilters.category && product.category !== activeFilters.category) return { product, matchScore: 0, matchReason: '' };
    if (activeFilters.isVegetarian && !product.isVegetarian) return { product, matchScore: 0, matchReason: '' };
    
    // Category match boost
    if (impliedCategories.has(product.category)) {
      score += 30;
      reasons.push('Fits your occasion');
    }
    
    // Keyword match
    const keywords = lowerQuery.split(/\s+/);
    let matchedKeywords = 0;
    
    for (const kw of keywords) {
      if (kw.length < 3) continue; // skip small words
      const kwLower = kw.toLowerCase();
      
      if (product.name.toLowerCase().includes(kwLower)) { score += 20; matchedKeywords++; }
      else if (product.brand.toLowerCase().includes(kwLower)) { score += 15; matchedKeywords++; }
      else if (product.tags.some(t => t.includes(kwLower) || kwLower.includes(t))) { score += 10; matchedKeywords++; }
      // Fuzzy typos mapping
      else if (kwLower === 'crisps' && product.tags.includes('chips')) { score += 10; matchedKeywords++; }
      else if (kwLower === 'earphones' && product.tags.includes('earbuds')) { score += 10; matchedKeywords++; }
      else if (kwLower === 'crocin' && product.tags.includes('paracetamol')) { score += 10; matchedKeywords++; }
    }

    if (matchedKeywords > 0) {
      reasons.push('Matches your search terms');
    }

    if (score > 0 || !query) {
      return {
        product,
        matchScore: score,
        matchReason: reasons.join(', ') || 'Available in catalog'
      };
    }
    return { product, matchScore: 0, matchReason: '' };
  });

  const validResults = scoredResults.filter(r => r.matchScore > 0 || !query);
  
  // Sort results
  validResults.sort((a, b) => {
    if (sortPriority === 'rating') return b.product.rating - a.product.rating;
    if (sortPriority === 'eta') return a.product.eta_minutes - b.product.eta_minutes;
    
    // Combined relevance formula: score * rating * (1/eta)
    const scoreA = a.matchScore * a.product.rating * (1 / a.product.eta_minutes);
    const scoreB = b.matchScore * b.product.rating * (1 / b.product.eta_minutes);
    return scoreB - scoreA;
  });

  return activeFilters.limit ? validResults.slice(0, activeFilters.limit) : validResults;
}

// Production extension:
// In production, `searchCatalog` should be replaced with an OpenSearch / Elasticsearch query.
// It should use Amazon Titan Text Embeddings to vectorize the user's natural language query
// and perform a k-NN vector search against the product catalog index for true semantic matching.
