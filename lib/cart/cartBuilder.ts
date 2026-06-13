import { Product } from '../catalog/products';
import { searchCatalog } from '../catalog/searchEngine';

export interface CartConstraints {
  maxTotal?: number;
  servings?: number;
  occasion?: string;
  dietary?: string[];
  durationDays?: number;
  exclude?: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  reason: string;
}

export interface CartBuildResult {
  items: CartItem[];
  categories: string[];
  totalPrice: number;
  totalETA: number;
  budgetUsed: number;
  reasoning: string;
  alternativeVersions: {
    label: string;
    delta: CartItem[];
  }[];
}

export function buildCart(intent: string, constraints: CartConstraints = {}): CartBuildResult {
  const lowerIntent = intent.toLowerCase();
  const servings = constraints.servings || 1;
  const maxTotal = constraints.maxTotal || Infinity;
  
  let requiredCategories: string[] = [];
  let budgetAllocations: Record<string, number> = {};

  if (lowerIntent.includes('movie night')) {
    requiredCategories = ['Snacks', 'Beverages'];
    budgetAllocations = { 'Snacks': 0.6, 'Beverages': 0.4 };
  } else if (lowerIntent.includes('birthday party')) {
    requiredCategories = ['Snacks', 'Beverages', 'Party Supplies'];
    budgetAllocations = { 'Snacks': 0.4, 'Beverages': 0.4, 'Party Supplies': 0.2 };
  } else if (lowerIntent.includes('fever') || lowerIntent.includes('sick')) {
    requiredCategories = ['Health & Medicine', 'Beverages'];
    budgetAllocations = { 'Health & Medicine': 0.8, 'Beverages': 0.2 };
  } else {
    // Generic fallback
    requiredCategories = ['Snacks'];
    budgetAllocations = { 'Snacks': 1.0 };
  }

  const items: CartItem[] = [];
  let totalPrice = 0;
  let totalETA = 0;
  const categories = new Set<string>();

  for (const category of requiredCategories) {
    const categoryBudget = maxTotal === Infinity ? Infinity : maxTotal * budgetAllocations[category];
    const searchResults = searchCatalog(intent, { category, isVegetarian: constraints.dietary?.includes('vegetarian') });
    
    if (searchResults.length > 0) {
      // Basic assignment logic: pick the highest relevance item that fits the budget.
      // Scale qty by servings
      const product = searchResults[0].product;
      const qty = Math.ceil(servings * (category === 'Beverages' ? 0.5 : 1)); // Arbitrary scaling rule for demo
      const cost = product.price * qty;

      if (totalPrice + cost <= maxTotal || maxTotal === Infinity) {
        items.push({
          product,
          quantity: qty,
          reason: `Popular pick for ${category.toLowerCase()}`
        });
        totalPrice += cost;
        totalETA = Math.max(totalETA, product.eta_minutes);
        categories.add(category);
      }
    }
  }

  // Create a naive alternative version
  const healthierAlternative: CartItem[] = items.map(item => ({ ...item })); // Mock alternative
  
  return {
    items,
    categories: Array.from(categories),
    totalPrice,
    totalETA,
    budgetUsed: maxTotal === Infinity ? 0 : (totalPrice / maxTotal) * 100,
    reasoning: `Built for your ${intent} intent with ${items.length} items across ${categories.size} categories.`,
    alternativeVersions: [
      {
        label: 'Healthier version',
        delta: healthierAlternative
      }
    ]
  };
}
