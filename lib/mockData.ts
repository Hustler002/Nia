// lib/mockData.ts
// Mock data for the Nia Amazon Now demo
// Production: Replace with real API calls to DynamoDB, Amazon Personalize, and catalog service

export interface Product {
  id: string;
  name: string;
  price: number;
  mrp: number;
  image: string;
  category: string;
  unit: string;
  lastOrdered?: string;
  daysAgo?: number;
  consumptionCycleDays?: number;
  percentUsed?: number;
}

export interface Ritual {
  id: string;
  name: string;
  emoji: string;
  itemCount: number;
  total: number;
  lastOrdered: string;
  items: string[];
}

export interface Category {
  name: string;
  emoji: string;
  slug: string;
  color: string;
}

// --- Reorder predictions ("Running low" items) ---
export const reorderProducts: Product[] = [
  {
    id: 'prod-001',
    name: 'Amul Toned Milk',
    price: 30,
    mrp: 30,
    image: '/products/milk.png',
    category: 'Dairy & Eggs',
    unit: '1L',
    lastOrdered: '12 days ago',
    daysAgo: 12,
    consumptionCycleDays: 3,
    percentUsed: 92,
  },
  {
    id: 'prod-002',
    name: 'Colgate MaxFresh',
    price: 142,
    mrp: 165,
    image: '/products/toothpaste.png',
    category: 'Personal Care',
    unit: '200g',
    lastOrdered: '38 days ago',
    daysAgo: 38,
    consumptionCycleDays: 45,
    percentUsed: 84,
  },
  {
    id: 'prod-003',
    name: 'Tata Salt',
    price: 28,
    mrp: 28,
    image: '/products/salt.png',
    category: 'Kitchen Essentials',
    unit: '1kg',
    lastOrdered: '25 days ago',
    daysAgo: 25,
    consumptionCycleDays: 30,
    percentUsed: 83,
  },
  {
    id: 'prod-004',
    name: 'Britannia Bread',
    price: 45,
    mrp: 50,
    image: '/products/bread.png',
    category: 'Groceries',
    unit: '400g',
    lastOrdered: '5 days ago',
    daysAgo: 5,
    consumptionCycleDays: 5,
    percentUsed: 100,
  },
];

// --- Ritual bundles ("Your usual orders") ---
export const rituals: Ritual[] = [
  {
    id: 'ritual-001',
    name: 'Monday Morning Routine',
    emoji: '☀️',
    itemCount: 4,
    total: 175,
    lastOrdered: '7 days ago',
    items: ['Amul Milk 500ml', 'Britannia Bread', 'Amul Butter 100g', 'Nescafé Classic 50g'],
  },
  {
    id: 'ritual-002',
    name: 'Sunday Brunch',
    emoji: '🥞',
    itemCount: 6,
    total: 420,
    lastOrdered: '14 days ago',
    items: ['Eggs (6 pcs)', 'Cheese Slices', 'Mushrooms 200g', 'Orange Juice 1L', 'Pancake Mix', 'Maple Syrup'],
  },
  {
    id: 'ritual-003',
    name: 'Weekly Grocery Run',
    emoji: '🛒',
    itemCount: 12,
    total: 890,
    lastOrdered: '6 days ago',
    items: ['Rice 5kg', 'Atta 5kg', 'Toor Dal 1kg', 'Cooking Oil 1L', 'Onions 1kg', 'Tomatoes 1kg', 'Potatoes 1kg', 'Sugar 1kg', 'Tea 250g', 'Salt 1kg', 'Haldi 100g', 'Jeera 100g'],
  },
];

// --- Category grid ---
export const categories: Category[] = [
  { name: 'Groceries', emoji: '🛒', slug: 'groceries', color: '#4CAF50' },
  { name: 'Dairy & Eggs', emoji: '🥛', slug: 'dairy-eggs', color: '#2196F3' },
  { name: 'Fruits & Veg', emoji: '🍎', slug: 'fruits-veg', color: '#FF5722' },
  { name: 'Personal Care', emoji: '🧴', slug: 'personal-care', color: '#9C27B0' },
  { name: 'Baby Care', emoji: '👶', slug: 'baby-care', color: '#E91E63' },
  { name: 'Health', emoji: '💊', slug: 'health', color: '#00BCD4' },
  { name: 'Electronics', emoji: '⚡', slug: 'electronics', color: '#FF9800' },
  { name: 'Kitchen', emoji: '🍳', slug: 'kitchen', color: '#795548' },
];

// --- Hero placeholder rotation texts ---
export const heroPlaceholders: string[] = [
  'Movie night for 4 under ₹500...',
  'Best wireless earbuds under ₹2000...',
  'Plan a birthday party for 10 kids...',
  'My toothpaste is almost over...',
  'I have a fever, what do I need?',
];

// --- Quick start chips ---
export const quickStartChips = [
  { label: '🎬 Movie night', query: 'Movie night for 4 under ₹500' },
  { label: '🎂 Party kit', query: 'Plan a birthday party for 10 kids' },
  { label: '🚨 Emergency', query: 'I have a fever, what do I need?' },
];

// Production extension:
// - reorderProducts: fetched from Amazon Personalize consumption-cycle predictions
// - rituals: built from DynamoDB order history + frequency analysis
// - categories: loaded from catalog service via OpenSearch aggregation
// - heroPlaceholders: A/B tested and dynamically chosen based on user segment
