// lib/seller/mockIntentGaps.ts
// Mock data for the Seller Console Intent Gap Analytics dashboard
// 20 realistic unmatched query records with trends, location data, and gap classification
// Production: this data comes from Kinesis Firehose → S3 → Athena aggregation pipeline

// ─── Types ──────────────────────────────────────────────────────────────────

export interface IntentGap {
  id: string;
  query: string;               // what the customer typed
  category: string;            // inferred category
  frequency: number;           // unique users who searched this in last 7 days
  trend: 'rising' | 'stable' | 'falling';
  trendDelta: number;          // % change week-over-week
  avgMaxPrice: number;         // average "under ₹X" from queries
  timeDistribution: number[];  // [0-6am, 6-12pm, 12-6pm, 6-12am] search counts
  topPincodes: string[];       // where searches originate
  closestExistingProduct?: {
    id: string;
    name: string;
    matchScore: number;        // 0-100, how close this product matches the query
  };
  gapType: 'no_listing' | 'poor_keywords' | 'price_mismatch' | 'out_of_stock';
  // For sparkline rendering — last 4 weeks of search volume
  weeklyHistory: number[];
  // Sample verbatim queries from customers (anonymized)
  sampleQueries: string[];
  // Location breakdown
  locationBreakdown: { area: string; percentage: number }[];
  // Recommended listing attributes to win this query
  recommendedAttributes: string[];
}

export interface SellerListing {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  attributes: Record<string, string>;
  matchScore: number;
  weeklyViews: number;
  conversionRate: number;
}

// ─── Category Colors ────────────────────────────────────────────────────────

export const categoryColors: Record<string, { bg: string; text: string }> = {
  'Health & Wellness': { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  'Baby Care': { bg: 'bg-pink-100', text: 'text-pink-700' },
  'Electronics': { bg: 'bg-blue-100', text: 'text-blue-700' },
  'Ready Food': { bg: 'bg-amber-100', text: 'text-amber-700' },
  'Personal Care': { bg: 'bg-purple-100', text: 'text-purple-700' },
  'Beverages': { bg: 'bg-cyan-100', text: 'text-cyan-700' },
  'Snacks': { bg: 'bg-orange-100', text: 'text-orange-700' },
  'Kitchen Essentials': { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  'Dairy & Eggs': { bg: 'bg-sky-100', text: 'text-sky-700' },
  'Fruits & Vegetables': { bg: 'bg-lime-100', text: 'text-lime-700' },
  'Pet Care': { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  'Household': { bg: 'bg-stone-100', text: 'text-stone-700' },
};

// ─── Gap Type Styles ────────────────────────────────────────────────────────

export const gapTypeConfig: Record<
  IntentGap['gapType'],
  { label: string; bg: string; text: string; action: string; actionColor: string }
> = {
  no_listing: {
    label: 'No listing',
    bg: 'bg-red-100',
    text: 'text-red-700',
    action: 'Create listing',
    actionColor: 'bg-red-600 hover:bg-red-700',
  },
  poor_keywords: {
    label: 'Poor keywords',
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    action: 'Fix listing',
    actionColor: 'bg-amber-600 hover:bg-amber-700',
  },
  price_mismatch: {
    label: 'Price mismatch',
    bg: 'bg-orange-100',
    text: 'text-orange-700',
    action: 'Adjust price',
    actionColor: 'bg-orange-600 hover:bg-orange-700',
  },
  out_of_stock: {
    label: 'Out of stock',
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    action: 'Restock now',
    actionColor: 'bg-gray-600 hover:bg-gray-700',
  },
};

// ─── 20 Intent Gap Records ──────────────────────────────────────────────────

export const intentGaps: IntentGap[] = [
  {
    id: 'ig-001',
    query: 'sugar-free protein bar under ₹300',
    category: 'Health & Wellness',
    frequency: 1247,
    trend: 'rising',
    trendDelta: 34,
    avgMaxPrice: 280,
    timeDistribution: [89, 412, 498, 248],
    topPincodes: ['110001', '110017', '122001'],
    closestExistingProduct: {
      id: 'p-101',
      name: 'RiteBite Max Protein Bar 70g',
      matchScore: 62,
    },
    gapType: 'poor_keywords',
    weeklyHistory: [780, 890, 1050, 1247],
    sampleQueries: [
      'sugar free protein bar for gym',
      'diabetic friendly protein bar',
      'low sugar high protein snack bar under 300',
    ],
    locationBreakdown: [
      { area: 'South Delhi', percentage: 42 },
      { area: 'Gurugram', percentage: 28 },
      { area: 'Central Delhi', percentage: 18 },
      { area: 'Noida', percentage: 12 },
    ],
    recommendedAttributes: [
      'Add "sugar-free" to product title',
      'Include "diabetic friendly" in search tags',
      'Add protein content (grams) to attributes',
      'Mention "gym snack" in description',
    ],
  },
  {
    id: 'ig-002',
    query: 'organic baby food pouch',
    category: 'Baby Care',
    frequency: 892,
    trend: 'rising',
    trendDelta: 67,
    avgMaxPrice: 450,
    timeDistribution: [156, 312, 278, 146],
    topPincodes: ['110017', '110049', '122018'],
    closestExistingProduct: {
      id: 'p-102',
      name: 'Nestle Cerelac Stage 1',
      matchScore: 38,
    },
    gapType: 'no_listing',
    weeklyHistory: [320, 480, 650, 892],
    sampleQueries: [
      'organic baby food 6 months',
      'natural baby food pouch no preservatives',
      'organic fruit puree for babies',
    ],
    locationBreakdown: [
      { area: 'South Delhi', percentage: 55 },
      { area: 'Gurugram', percentage: 25 },
      { area: 'Noida', percentage: 12 },
      { area: 'West Delhi', percentage: 8 },
    ],
    recommendedAttributes: [
      'Certify "organic" / "FSSAI organic" in listing',
      'Specify age range (6m+, 8m+)',
      'Highlight "no preservatives, no added sugar"',
      'Include pouch format in title',
    ],
  },
  {
    id: 'ig-003',
    query: 'noise cancelling earbuds under ₹1500',
    category: 'Electronics',
    frequency: 2100,
    trend: 'stable',
    trendDelta: 3,
    avgMaxPrice: 1400,
    timeDistribution: [210, 580, 720, 590],
    topPincodes: ['110001', '110019', '201301'],
    closestExistingProduct: {
      id: 'p-103',
      name: 'boAt Airdopes 141 ANC',
      matchScore: 74,
    },
    gapType: 'price_mismatch',
    weeklyHistory: [2050, 2080, 2090, 2100],
    sampleQueries: [
      'anc earbuds cheap under 1500',
      'noise cancelling wireless earbuds budget',
      'best ANC earbuds low price',
    ],
    locationBreakdown: [
      { area: 'Central Delhi', percentage: 35 },
      { area: 'South Delhi', percentage: 30 },
      { area: 'East Delhi', percentage: 20 },
      { area: 'Noida', percentage: 15 },
    ],
    recommendedAttributes: [
      'Create a sub-₹1500 variant or bundle',
      'Add "noise cancelling" / "ANC" prominently in title',
      'Include decibel reduction spec in attributes',
      'Tag "budget ANC" in search terms',
    ],
  },
  {
    id: 'ig-004',
    query: 'homemade-style dal makhani ready-to-eat',
    category: 'Ready Food',
    frequency: 445,
    trend: 'rising',
    trendDelta: 210,
    avgMaxPrice: 180,
    timeDistribution: [22, 89, 198, 136],
    topPincodes: ['110001', '110003', '110006'],
    gapType: 'no_listing',
    weeklyHistory: [85, 145, 280, 445],
    sampleQueries: [
      'ghar jaisa dal makhani order now',
      'ready to eat dal makhani authentic taste',
      'home style dal makhani instant delivery',
    ],
    locationBreakdown: [
      { area: 'Central Delhi', percentage: 48 },
      { area: 'Old Delhi', percentage: 25 },
      { area: 'North Delhi', percentage: 18 },
      { area: 'West Delhi', percentage: 9 },
    ],
    recommendedAttributes: [
      'Use "homemade-style" or "ghar jaisa" in title',
      'Mention cooking method (slow-cooked, butter, cream)',
      'Include "ready-to-eat" and "heat & eat" tags',
      'Add Hindi keywords for discoverability',
    ],
  },
  {
    id: 'ig-005',
    query: 'bamboo toothbrush',
    category: 'Personal Care',
    frequency: 334,
    trend: 'rising',
    trendDelta: 89,
    avgMaxPrice: 150,
    timeDistribution: [45, 112, 98, 79],
    topPincodes: ['110017', '110049', '122001'],
    closestExistingProduct: {
      id: 'p-105',
      name: 'Colgate Bamboo Charcoal',
      matchScore: 45,
    },
    gapType: 'poor_keywords',
    weeklyHistory: [120, 178, 245, 334],
    sampleQueries: [
      'eco friendly bamboo toothbrush',
      'sustainable toothbrush biodegradable',
      'bamboo bristle toothbrush natural',
    ],
    locationBreakdown: [
      { area: 'South Delhi', percentage: 60 },
      { area: 'Gurugram', percentage: 22 },
      { area: 'Noida', percentage: 12 },
      { area: 'Central Delhi', percentage: 6 },
    ],
    recommendedAttributes: [
      'Add "bamboo" and "eco-friendly" to title',
      'Include "biodegradable" and "sustainable" tags',
      'Mention BPA-free bristles in description',
      'Add "plastic-free packaging" attribute',
    ],
  },
  {
    id: 'ig-006',
    query: 'zero-sugar energy drink',
    category: 'Beverages',
    frequency: 1680,
    trend: 'falling',
    trendDelta: -12,
    avgMaxPrice: 120,
    timeDistribution: [320, 580, 450, 330],
    topPincodes: ['110001', '110019', '201301'],
    closestExistingProduct: {
      id: 'p-106',
      name: 'Monster Energy Zero Sugar 350ml',
      matchScore: 82,
    },
    gapType: 'out_of_stock',
    weeklyHistory: [1920, 1850, 1780, 1680],
    sampleQueries: [
      'sugar free energy drink can',
      'zero calorie energy drink',
      'diet energy drink cold',
    ],
    locationBreakdown: [
      { area: 'Central Delhi', percentage: 38 },
      { area: 'South Delhi', percentage: 32 },
      { area: 'East Delhi', percentage: 18 },
      { area: 'North Delhi', percentage: 12 },
    ],
    recommendedAttributes: [
      'Ensure stock levels for zero-sugar variant',
      'Set restock alerts for high-demand SKUs',
      'Add "zero sugar" / "sugar-free" to title if missing',
      'Consider multi-pack listing for repeat buyers',
    ],
  },
  {
    id: 'ig-007',
    query: 'Korean ramen spicy pack',
    category: 'Snacks',
    frequency: 1890,
    trend: 'rising',
    trendDelta: 45,
    avgMaxPrice: 350,
    timeDistribution: [110, 380, 620, 780],
    topPincodes: ['110017', '110001', '122001'],
    closestExistingProduct: {
      id: 'p-107',
      name: 'Samyang Hot Chicken Ramen',
      matchScore: 71,
    },
    gapType: 'out_of_stock',
    weeklyHistory: [1200, 1450, 1650, 1890],
    sampleQueries: [
      'korean spicy noodles samyang',
      'buldak ramen pack of 5',
      'korean instant noodles extra spicy',
    ],
    locationBreakdown: [
      { area: 'South Delhi', percentage: 45 },
      { area: 'Central Delhi', percentage: 25 },
      { area: 'Gurugram', percentage: 20 },
      { area: 'Noida', percentage: 10 },
    ],
    recommendedAttributes: [
      'Restock Samyang/Buldak variants immediately',
      'Add "Korean" and "spicy" prominently in title',
      'List Scoville heat level in attributes',
      'Offer multi-pack (5-pack) as primary listing',
    ],
  },
  {
    id: 'ig-008',
    query: 'plant-based milk oat',
    category: 'Dairy & Eggs',
    frequency: 756,
    trend: 'rising',
    trendDelta: 52,
    avgMaxPrice: 250,
    timeDistribution: [198, 289, 156, 113],
    topPincodes: ['110017', '110049', '122018'],
    closestExistingProduct: {
      id: 'p-108',
      name: 'Raw Pressery Oat Milk 1L',
      matchScore: 68,
    },
    gapType: 'price_mismatch',
    weeklyHistory: [380, 490, 600, 756],
    sampleQueries: [
      'oat milk for coffee cheap',
      'plant milk oat barista',
      'vegan oat milk under 250',
    ],
    locationBreakdown: [
      { area: 'South Delhi', percentage: 52 },
      { area: 'Gurugram', percentage: 28 },
      { area: 'Central Delhi', percentage: 12 },
      { area: 'Noida', percentage: 8 },
    ],
    recommendedAttributes: [
      'Create a smaller size (500ml) under ₹250',
      'Add "barista" variant tag for coffee use',
      'Include "plant-based" and "vegan" in title',
      'Mention calcium/protein fortification',
    ],
  },
  {
    id: 'ig-009',
    query: 'biodegradable garbage bags large',
    category: 'Household',
    frequency: 567,
    trend: 'stable',
    trendDelta: 5,
    avgMaxPrice: 200,
    timeDistribution: [78, 189, 178, 122],
    topPincodes: ['110001', '110017', '201301'],
    closestExistingProduct: {
      id: 'p-109',
      name: 'Ezee Bio Garbage Bags 15pcs',
      matchScore: 58,
    },
    gapType: 'poor_keywords',
    weeklyHistory: [540, 550, 560, 567],
    sampleQueries: [
      'eco friendly dustbin bags big',
      'compostable garbage bags 30 litres',
      'biodegradable trash bags for kitchen',
    ],
    locationBreakdown: [
      { area: 'South Delhi', percentage: 40 },
      { area: 'Gurugram', percentage: 30 },
      { area: 'Central Delhi', percentage: 18 },
      { area: 'Noida', percentage: 12 },
    ],
    recommendedAttributes: [
      'Add "biodegradable" and "compostable" to title',
      'Specify bag size in litres (19L, 30L)',
      'Include "eco-friendly" and "kitchen" tags',
      'Mention micron thickness for durability',
    ],
  },
  {
    id: 'ig-010',
    query: 'millet cookies for kids',
    category: 'Snacks',
    frequency: 623,
    trend: 'rising',
    trendDelta: 78,
    avgMaxPrice: 200,
    timeDistribution: [56, 178, 245, 144],
    topPincodes: ['110017', '110049', '122001'],
    gapType: 'no_listing',
    weeklyHistory: [210, 340, 480, 623],
    sampleQueries: [
      'ragi cookies for toddlers',
      'millet biscuit healthy kids snack',
      'jowar cookies no maida for children',
    ],
    locationBreakdown: [
      { area: 'South Delhi', percentage: 48 },
      { area: 'Gurugram', percentage: 30 },
      { area: 'Noida', percentage: 14 },
      { area: 'West Delhi', percentage: 8 },
    ],
    recommendedAttributes: [
      'Include millet type (ragi/jowar/bajra) in title',
      'Add "kid-friendly" and "no maida" tags',
      'Highlight age suitability (2+, 3+ years)',
      'Mention "no preservatives" in description',
    ],
  },
  {
    id: 'ig-011',
    query: 'instant cold coffee sachet',
    category: 'Beverages',
    frequency: 1340,
    trend: 'rising',
    trendDelta: 28,
    avgMaxPrice: 150,
    timeDistribution: [89, 520, 430, 301],
    topPincodes: ['110001', '110019', '201301'],
    closestExistingProduct: {
      id: 'p-111',
      name: 'Nescafé Cold Coffee Can 180ml',
      matchScore: 55,
    },
    gapType: 'poor_keywords',
    weeklyHistory: [890, 1020, 1180, 1340],
    sampleQueries: [
      'cold coffee mix powder sachet',
      'instant iced coffee packet',
      'ready mix cold coffee single serve',
    ],
    locationBreakdown: [
      { area: 'Central Delhi', percentage: 35 },
      { area: 'South Delhi', percentage: 30 },
      { area: 'Noida', percentage: 20 },
      { area: 'East Delhi', percentage: 15 },
    ],
    recommendedAttributes: [
      'Add "sachet" and "instant mix" to title',
      'Tag "cold coffee" and "iced coffee" as search terms',
      'Mention "just add milk/water" in description',
      'Include serving count per pack',
    ],
  },
  {
    id: 'ig-012',
    query: 'dog dental chew sticks',
    category: 'Pet Care',
    frequency: 412,
    trend: 'stable',
    trendDelta: 8,
    avgMaxPrice: 350,
    timeDistribution: [45, 134, 145, 88],
    topPincodes: ['110017', '122001', '110049'],
    closestExistingProduct: {
      id: 'p-112',
      name: 'Pedigree Dentastix 7pcs',
      matchScore: 72,
    },
    gapType: 'price_mismatch',
    weeklyHistory: [380, 390, 400, 412],
    sampleQueries: [
      'dental chew for dogs under 350',
      'dog teeth cleaning treats affordable',
      'puppy dental sticks small breed',
    ],
    locationBreakdown: [
      { area: 'South Delhi', percentage: 50 },
      { area: 'Gurugram', percentage: 30 },
      { area: 'Central Delhi', percentage: 12 },
      { area: 'Noida', percentage: 8 },
    ],
    recommendedAttributes: [
      'Create a smaller pack under ₹350',
      'Specify breed size (small/medium/large)',
      'Add "dental health" and "teeth cleaning" tags',
      'Include ingredient list prominently',
    ],
  },
  {
    id: 'ig-013',
    query: 'overnight oats jar ready-to-eat',
    category: 'Health & Wellness',
    frequency: 534,
    trend: 'rising',
    trendDelta: 120,
    avgMaxPrice: 200,
    timeDistribution: [289, 156, 56, 33],
    topPincodes: ['110017', '122018', '110049'],
    gapType: 'no_listing',
    weeklyHistory: [120, 210, 350, 534],
    sampleQueries: [
      'overnight oats ready made delivered',
      'prepared overnight oats with fruits',
      'grab and go oats jar for breakfast',
    ],
    locationBreakdown: [
      { area: 'Gurugram', percentage: 42 },
      { area: 'South Delhi', percentage: 35 },
      { area: 'Noida', percentage: 15 },
      { area: 'Central Delhi', percentage: 8 },
    ],
    recommendedAttributes: [
      'Use "overnight oats" and "ready-to-eat" in title',
      'Specify flavour variants in listing',
      'Mention "no cooking required" in description',
      'Add protein/fibre content to attributes',
    ],
  },
  {
    id: 'ig-014',
    query: 'USB-C to lightning cable fast charging',
    category: 'Electronics',
    frequency: 1560,
    trend: 'stable',
    trendDelta: -2,
    avgMaxPrice: 500,
    timeDistribution: [156, 420, 540, 444],
    topPincodes: ['110001', '110019', '201301'],
    closestExistingProduct: {
      id: 'p-114',
      name: 'Apple USB-C to Lightning Cable 1m',
      matchScore: 85,
    },
    gapType: 'price_mismatch',
    weeklyHistory: [1580, 1570, 1565, 1560],
    sampleQueries: [
      'iphone fast charging cable under 500',
      'usb c lightning cable MFi certified cheap',
      'type c to lightning cable 1 meter',
    ],
    locationBreakdown: [
      { area: 'Central Delhi', percentage: 30 },
      { area: 'South Delhi', percentage: 28 },
      { area: 'Noida', percentage: 22 },
      { area: 'East Delhi', percentage: 20 },
    ],
    recommendedAttributes: [
      'List an MFi-certified cable under ₹500',
      'Add "fast charging" and cable length to title',
      'Include wattage (20W/27W) in attributes',
      'Mention compatibility (iPhone 15/14/13)',
    ],
  },
  {
    id: 'ig-015',
    query: 'almond flour gluten-free',
    category: 'Kitchen Essentials',
    frequency: 389,
    trend: 'rising',
    trendDelta: 56,
    avgMaxPrice: 400,
    timeDistribution: [34, 112, 156, 87],
    topPincodes: ['110017', '110049', '122018'],
    closestExistingProduct: {
      id: 'p-115',
      name: 'Borges Almond Flour 200g',
      matchScore: 78,
    },
    gapType: 'out_of_stock',
    weeklyHistory: [180, 240, 310, 389],
    sampleQueries: [
      'almond flour for keto baking',
      'blanched almond powder gluten free',
      'badam flour for cookies',
    ],
    locationBreakdown: [
      { area: 'South Delhi', percentage: 55 },
      { area: 'Gurugram', percentage: 25 },
      { area: 'Noida', percentage: 12 },
      { area: 'Central Delhi', percentage: 8 },
    ],
    recommendedAttributes: [
      'Restock immediately — demand rising 56% WoW',
      'Add "gluten-free" and "keto" to title',
      'Include almond percentage in attributes',
      'Tag "baking flour" for search discoverability',
    ],
  },
  {
    id: 'ig-016',
    query: 'natural deodorant aluminum free',
    category: 'Personal Care',
    frequency: 478,
    trend: 'rising',
    trendDelta: 42,
    avgMaxPrice: 350,
    timeDistribution: [56, 145, 178, 99],
    topPincodes: ['110017', '110049', '122001'],
    gapType: 'no_listing',
    weeklyHistory: [220, 300, 380, 478],
    sampleQueries: [
      'aluminium free deodorant natural',
      'chemical free deo for sensitive skin',
      'organic deodorant no toxins',
    ],
    locationBreakdown: [
      { area: 'South Delhi', percentage: 50 },
      { area: 'Gurugram', percentage: 28 },
      { area: 'Noida', percentage: 14 },
      { area: 'Central Delhi', percentage: 8 },
    ],
    recommendedAttributes: [
      'Use "aluminum-free" prominently in title',
      'Add "natural" and "chemical-free" tags',
      'Specify scent variants and duration',
      'Include "dermatologist tested" if applicable',
    ],
  },
  {
    id: 'ig-017',
    query: 'A2 cow ghee 500ml organic',
    category: 'Dairy & Eggs',
    frequency: 890,
    trend: 'rising',
    trendDelta: 38,
    avgMaxPrice: 550,
    timeDistribution: [112, 278, 312, 188],
    topPincodes: ['110001', '110003', '110006'],
    closestExistingProduct: {
      id: 'p-117',
      name: 'Amul Pure Ghee 500ml',
      matchScore: 42,
    },
    gapType: 'poor_keywords',
    weeklyHistory: [520, 650, 780, 890],
    sampleQueries: [
      'A2 desi ghee organic certified',
      'bilona ghee a2 cow milk',
      'pure A2 gir cow ghee 500ml',
    ],
    locationBreakdown: [
      { area: 'Central Delhi', percentage: 38 },
      { area: 'Old Delhi', percentage: 22 },
      { area: 'South Delhi', percentage: 25 },
      { area: 'North Delhi', percentage: 15 },
    ],
    recommendedAttributes: [
      'Add "A2 cow" and "Gir cow" to title',
      'Include "bilona method" if applicable',
      'Tag "organic certified" with cert number',
      'Mention grass-fed source in description',
    ],
  },
  {
    id: 'ig-018',
    query: 'period comfort kit delivery',
    category: 'Personal Care',
    frequency: 678,
    trend: 'rising',
    trendDelta: 95,
    avgMaxPrice: 400,
    timeDistribution: [145, 189, 212, 132],
    topPincodes: ['110017', '110019', '110001'],
    gapType: 'no_listing',
    weeklyHistory: [180, 320, 490, 678],
    sampleQueries: [
      'period care kit home delivery quick',
      'menstrual comfort box essentials',
      'period emergency kit with heating pad',
    ],
    locationBreakdown: [
      { area: 'South Delhi', percentage: 42 },
      { area: 'Central Delhi', percentage: 28 },
      { area: 'East Delhi', percentage: 18 },
      { area: 'North Delhi', percentage: 12 },
    ],
    recommendedAttributes: [
      'Create a curated "period comfort" bundle',
      'Include pads, hot water bottle, chocolate, tea',
      'Tag with "period care", "menstrual kit" keywords',
      'Offer discreet packaging as a feature',
    ],
  },
  {
    id: 'ig-019',
    query: 'fresh coconut water 1 litre pack',
    category: 'Beverages',
    frequency: 1120,
    trend: 'rising',
    trendDelta: 22,
    avgMaxPrice: 100,
    timeDistribution: [178, 390, 345, 207],
    topPincodes: ['110001', '110017', '122001'],
    closestExistingProduct: {
      id: 'p-119',
      name: 'Raw Pressery Coconut Water 200ml',
      matchScore: 56,
    },
    gapType: 'price_mismatch',
    weeklyHistory: [820, 920, 1020, 1120],
    sampleQueries: [
      'fresh nariyal pani 1 litre home delivery',
      'coconut water bulk pack cheap',
      'tender coconut water 1L tetra pack',
    ],
    locationBreakdown: [
      { area: 'Central Delhi', percentage: 35 },
      { area: 'South Delhi', percentage: 30 },
      { area: 'East Delhi', percentage: 20 },
      { area: 'Gurugram', percentage: 15 },
    ],
    recommendedAttributes: [
      'Create a 1L pack/family size variant',
      'Price at ₹80-100 for the litre size',
      'Add "fresh", "tender", "nariyal pani" in title',
      'Include "no added sugar" attribute',
    ],
  },
  {
    id: 'ig-020',
    query: 'rechargeable hand fan mini portable',
    category: 'Electronics',
    frequency: 2340,
    trend: 'rising',
    trendDelta: 156,
    avgMaxPrice: 500,
    timeDistribution: [120, 680, 890, 650],
    topPincodes: ['110001', '110019', '201301'],
    closestExistingProduct: {
      id: 'p-120',
      name: 'JISULIFE Handheld Mini Fan',
      matchScore: 70,
    },
    gapType: 'out_of_stock',
    weeklyHistory: [450, 890, 1560, 2340],
    sampleQueries: [
      'portable rechargeable fan for office',
      'mini hand fan usb charging',
      'battery operated small fan for travel',
    ],
    locationBreakdown: [
      { area: 'Central Delhi', percentage: 32 },
      { area: 'East Delhi', percentage: 28 },
      { area: 'South Delhi', percentage: 22 },
      { area: 'North Delhi', percentage: 18 },
    ],
    recommendedAttributes: [
      'Restock urgently — 156% WoW growth (summer surge)',
      'Add "rechargeable" and "portable" to title',
      'Include battery life (hours) in attributes',
      'Offer speed settings count as a spec',
    ],
  },
];

// ─── Summary Statistics ─────────────────────────────────────────────────────

export function getIntentGapSummary() {
  const totalUnmet = intentGaps.reduce((sum, g) => sum + g.frequency, 0);
  const avgOrderValue = 320; // mock AOV for Amazon Now
  const potentialRevenue = Math.round((totalUnmet * avgOrderValue * 0.15) / 100000); // 15% conversion estimate
  const sellerCategory = 'Electronics'; // mock: this seller's primary category
  const matchingGaps = intentGaps.filter((g) => g.category === sellerCategory).length;
  const totalProducts = 42; // mock: seller's total listings
  const matchedProducts = 26; // mock: how many appear in Nia's recommendations
  const matchScore = Math.round((matchedProducts / totalProducts) * 100);

  return {
    totalUnmet,
    potentialRevenue: `₹${potentialRevenue}L`,
    matchingGaps,
    sellerCategory,
    matchScore,
    weekOverWeekChange: 12,
  };
}

// ─── Mock Seller Listings ───────────────────────────────────────────────────

export const sellerListings: SellerListing[] = [
  {
    id: 'sl-001',
    title: 'RiteBite Max Protein Bar - Choco Fudge 70g',
    description: 'High protein energy bar with 20g protein. Made with whey protein, dark chocolate coating, and oats. Perfect post-workout snack.',
    category: 'Health & Wellness',
    price: 125,
    attributes: {
      'Protein': '20g',
      'Flavour': 'Choco Fudge',
      'Weight': '70g',
      'Diet Type': 'Vegetarian',
      'Allergens': 'Contains milk, soy, wheat',
    },
    matchScore: 62,
    weeklyViews: 340,
    conversionRate: 4.2,
  },
  {
    id: 'sl-002',
    title: 'boAt Airdopes 141 TWS Earbuds',
    description: 'True wireless earbuds with 42-hour playback, 8mm drivers, IPX4 water resistance, and ENx technology for clear calls.',
    category: 'Electronics',
    price: 1799,
    attributes: {
      'Battery Life': '42 hours (total)',
      'Driver Size': '8mm',
      'Connectivity': 'Bluetooth 5.1',
      'Water Resistance': 'IPX4',
      'Noise Cancellation': 'ENx (calls only)',
    },
    matchScore: 74,
    weeklyViews: 890,
    conversionRate: 6.1,
  },
];

// ─── Unique Categories ──────────────────────────────────────────────────────

export const allCategories = Array.from(
  new Set(intentGaps.map((g) => g.category))
).sort();

// Production extension:
// - Intent gap records come from Kinesis Firehose streaming pipeline
//   Flow: Nia unmatched queries → Firehose → S3 (raw) → Athena (aggregation) → API
// - Weekly history comes from Athena time-series queries on S3 partitioned data
// - closestExistingProduct is found via OpenSearch vector similarity search
// - gapType classification runs as a Step Functions workflow:
//   1. search_catalog() → if no result → "no_listing"
//   2. if result but low matchScore → "poor_keywords"
//   3. if result but price > avgMaxPrice → "price_mismatch"
//   4. if result but inventory = 0 → "out_of_stock"
// - Location data from DynamoDB user profile pincodes, aggregated in Athena
// - Seller match score from Amazon Personalize recommendation correlation
