// lib/emergency/categories.ts
// Complete emergency category definitions with kits, trigger phrases, and detection logic
// This is the data backbone for both the /emergency page and Nia chat emergency responses
// Production: categories + kits maintained by category managers in DynamoDB,
// trigger phrases augmented by Bedrock Agent's NLU, kits assembled from real-time inventory

// ─── Type Definitions ───────────────────────────────────────────────────────

export interface EmergencyCategory {
  id: string;
  name: string;
  emoji: string;
  color: string; // hex color for the category
  description: string;
  triggerPhrases: string[]; // lowercased phrases for matching
  itemCount: number;
}

export interface EmergencyKitItem {
  id: string;
  name: string;
  price: number;
  mrp: number;
  image: string; // emoji for demo, product image URL in production
  qty: number;
  category: string;
}

export interface EmergencyKitData {
  categoryId: string;
  categoryName: string;
  categoryEmoji: string;
  categoryColor: string;
  name: string;
  description: string;
  items: EmergencyKitItem[];
  totalPrice: number;
  eta: string;
  storeName: string;
}

// ─── Category Definitions ───────────────────────────────────────────────────

export const emergencyCategories: EmergencyCategory[] = [
  {
    id: 'baby-care',
    name: 'Baby Care',
    emoji: '👶',
    color: '#4FC3F7',
    description: 'Diapers, formula, wipes & essentials for your little one',
    triggerPhrases: ['baby', 'infant', 'diaper', 'formula', 'rash', 'newborn', 'nappy', 'baccha', 'bache'],
    itemCount: 5,
  },
  {
    id: 'fever-illness',
    name: 'Fever & Illness',
    emoji: '🤒',
    color: '#EF5350',
    description: 'Medicines, ORS, thermometer & recovery essentials',
    triggerPhrases: ['fever', 'sick', 'cold', 'headache', 'body ache', 'flu', 'temperature', 'bukhar', 'bimaar', 'tabiyat'],
    itemCount: 6,
  },
  {
    id: 'surprise-guests',
    name: 'Surprise Guests',
    emoji: '🎉',
    color: '#FF9800',
    description: 'Snacks, drinks, cups & napkins for unexpected visitors',
    triggerPhrases: ['guests', 'party', 'visitors', 'mehman', 'mehmaan', 'guest aa', 'log aa rahe'],
    itemCount: 6,
  },
  {
    id: 'tech-rescue',
    name: 'Tech Rescue',
    emoji: '⚡',
    color: '#5C6BC0',
    description: 'Chargers, power banks & cables for tech emergencies',
    triggerPhrases: ['charger', 'cable', 'battery', 'dead phone', 'power bank', 'phone died', 'charge', 'usb'],
    itemCount: 3,
  },
  {
    id: 'kitchen-mishap',
    name: 'Kitchen Mishap',
    emoji: '🍳',
    color: '#26A69A',
    description: 'Ran out of basics? Oil, salt, sugar & more — stat',
    triggerPhrases: ['out of', 'khatam', 'no milk', 'no oil', 'no sugar', 'no salt', 'ran out', 'kitchen', 'cooking'],
    itemCount: 5,
  },
  {
    id: 'period-care',
    name: 'Period Care',
    emoji: '🌸',
    color: '#EC407A',
    description: 'Pads, pain relief, chocolate & comfort essentials',
    triggerPhrases: ['period', 'cramps', 'pads', 'menstrual', 'periods', 'sanitary', 'mc'],
    itemCount: 5,
  },
  {
    id: 'pet-emergency',
    name: 'Pet Emergency',
    emoji: '🐾',
    color: '#8BC34A',
    description: 'Food, wipes & first-aid for your furry friend',
    triggerPhrases: ['dog', 'cat', 'pet', 'puppy', 'kitten', 'kutte', 'billi'],
    itemCount: 4,
  },
  {
    id: 'general-emergency',
    name: 'General Emergency',
    emoji: '⚠️',
    color: '#FF7043',
    description: 'Water, first aid, torch & phone charger — be prepared',
    triggerPhrases: ['emergency', 'urgent', 'help', 'sos', 'madad'],
    itemCount: 4,
  },
];

// ─── Kit Data (Mock) ────────────────────────────────────────────────────────

const kitData: Record<string, Omit<EmergencyKitData, 'categoryId' | 'categoryName' | 'categoryEmoji' | 'categoryColor'>> = {
  'baby-care': {
    name: 'Baby Care Emergency Kit',
    description: 'Everything your baby needs right now',
    items: [
      { id: 'bc-001', name: 'Pampers All-Round Diapers (S, 22 pcs)', price: 399, mrp: 499, image: '🧷', qty: 1, category: 'Baby Care' },
      { id: 'bc-002', name: 'Nestlé NAN PRO 1 Infant Formula 400g', price: 599, mrp: 649, image: '🍼', qty: 1, category: 'Baby Care' },
      { id: 'bc-003', name: 'Himalaya Baby Wipes (72 pcs)', price: 149, mrp: 175, image: '🧻', qty: 1, category: 'Baby Care' },
      { id: 'bc-004', name: 'Himalaya Diaper Rash Cream 50g', price: 120, mrp: 140, image: '🧴', qty: 1, category: 'Baby Care' },
      { id: 'bc-005', name: 'Woodwards Gripe Water 130ml', price: 65, mrp: 72, image: '💧', qty: 1, category: 'Baby Care' },
    ],
    totalPrice: 1332,
    eta: '~10 min',
    storeName: 'Amazon Fresh, Connaught Place',
  },
  'fever-illness': {
    name: 'Fever Care Emergency Kit',
    description: 'Get well soon — meds, hydration & recovery essentials',
    items: [
      { id: 'fi-001', name: 'Crocin Advance 500mg (15 tabs)', price: 30, mrp: 32, image: '💊', qty: 1, category: 'Medicine' },
      { id: 'fi-002', name: 'Dettol Antiseptic Liquid 250ml', price: 105, mrp: 115, image: '🧪', qty: 1, category: 'Health' },
      { id: 'fi-003', name: 'Electral Powder ORS (Pack of 4)', price: 48, mrp: 56, image: '💧', qty: 1, category: 'Medicine' },
      { id: 'fi-004', name: 'Vicks VapoRub 50ml', price: 145, mrp: 160, image: '🫁', qty: 1, category: 'Medicine' },
      { id: 'fi-005', name: 'Glucon-D Orange 450g', price: 125, mrp: 145, image: '🍊', qty: 1, category: 'Beverages' },
      { id: 'fi-006', name: 'Dr. Morepen Digital Thermometer', price: 150, mrp: 199, image: '🌡️', qty: 1, category: 'Health Devices' },
    ],
    totalPrice: 603,
    eta: '~8 min',
    storeName: 'Amazon Fresh, Connaught Place',
  },
  'surprise-guests': {
    name: 'Surprise Guests Kit',
    description: 'Be the perfect host in 10 minutes',
    items: [
      { id: 'sg-001', name: "Lay's Classic Salted Chips 150g", price: 50, mrp: 50, image: '🥔', qty: 2, category: 'Snacks' },
      { id: 'sg-002', name: 'Hershey\'s Chocolate Syrup 200g', price: 65, mrp: 75, image: '🍫', qty: 1, category: 'Dips' },
      { id: 'sg-003', name: 'Britannia Good Day Cookies 600g', price: 120, mrp: 140, image: '🍪', qty: 1, category: 'Snacks' },
      { id: 'sg-004', name: 'Coca-Cola 1.25L + Sprite 1.25L + Fanta 1.25L', price: 180, mrp: 210, image: '🥤', qty: 1, category: 'Beverages' },
      { id: 'sg-005', name: 'Paper Cups 50 pcs', price: 60, mrp: 70, image: '☕', qty: 1, category: 'Disposables' },
      { id: 'sg-006', name: 'Paper Napkins 100 pcs', price: 45, mrp: 55, image: '🧻', qty: 1, category: 'Disposables' },
    ],
    totalPrice: 570,
    eta: '~10 min',
    storeName: 'Amazon Fresh, Connaught Place',
  },
  'tech-rescue': {
    name: 'Tech Rescue Kit',
    description: 'Get back online — cables, power & screen care',
    items: [
      { id: 'tr-001', name: 'Mi USB-C to USB-C Cable 1m', price: 299, mrp: 399, image: '🔌', qty: 1, category: 'Accessories' },
      { id: 'tr-002', name: 'Portronics Power Bank 10000mAh', price: 799, mrp: 999, image: '🔋', qty: 1, category: 'Accessories' },
      { id: 'tr-003', name: 'Screen Cleaning Wipes (30 pcs)', price: 149, mrp: 199, image: '🧹', qty: 1, category: 'Accessories' },
    ],
    totalPrice: 1247,
    eta: '~12 min',
    storeName: 'Amazon Fresh, Connaught Place',
  },
  'kitchen-mishap': {
    name: 'Kitchen Essentials Kit',
    description: 'The basics you ran out of — sorted',
    items: [
      { id: 'km-001', name: 'Amul Butter 500g', price: 270, mrp: 280, image: '🧈', qty: 1, category: 'Dairy' },
      { id: 'km-002', name: 'Tata Salt 1kg', price: 28, mrp: 28, image: '🧂', qty: 1, category: 'Kitchen' },
      { id: 'km-003', name: 'India Gate Sugar 1kg', price: 48, mrp: 50, image: '🍬', qty: 1, category: 'Kitchen' },
      { id: 'km-004', name: 'Fortune Sunflower Oil 1L', price: 155, mrp: 170, image: '🫗', qty: 1, category: 'Kitchen' },
      { id: 'km-005', name: 'Britannia Bread 400g', price: 45, mrp: 50, image: '🍞', qty: 1, category: 'Bakery' },
    ],
    totalPrice: 546,
    eta: '~10 min',
    storeName: 'Amazon Fresh, Connaught Place',
  },
  'period-care': {
    name: 'Period Care Comfort Kit',
    description: 'Pads, pain relief & comfort — we\'ve got you',
    items: [
      { id: 'pc-001', name: 'Whisper Ultra Clean XL+ (30 pads)', price: 299, mrp: 340, image: '🩹', qty: 1, category: 'Personal Care' },
      { id: 'pc-002', name: 'Meftal Spas Tablets (10 tabs)', price: 72, mrp: 80, image: '💊', qty: 1, category: 'Medicine' },
      { id: 'pc-003', name: 'Cadbury Dairy Milk Silk 150g', price: 160, mrp: 170, image: '🍫', qty: 1, category: 'Snacks' },
      { id: 'pc-004', name: 'Hot Water Bag (1L capacity)', price: 199, mrp: 250, image: '♨️', qty: 1, category: 'Health' },
      { id: 'pc-005', name: 'Tetley Green Tea Chamomile (25 bags)', price: 155, mrp: 175, image: '🍵', qty: 1, category: 'Beverages' },
    ],
    totalPrice: 885,
    eta: '~10 min',
    storeName: 'Amazon Fresh, Connaught Place',
  },
  'pet-emergency': {
    name: 'Pet Emergency Kit',
    description: 'Food, care & first-aid for your furry companion',
    items: [
      { id: 'pe-001', name: 'Pedigree Adult Dog Food Chicken 1.2kg', price: 250, mrp: 290, image: '🐕', qty: 1, category: 'Pet Food' },
      { id: 'pe-002', name: 'Pet Grooming Wipes (80 pcs)', price: 199, mrp: 250, image: '🧻', qty: 1, category: 'Pet Care' },
      { id: 'pe-003', name: 'Savlon Antiseptic Liquid 200ml', price: 85, mrp: 95, image: '🧴', qty: 1, category: 'Health' },
      { id: 'pe-004', name: 'Elastoplast Bandage Roll 5m', price: 45, mrp: 55, image: '🩹', qty: 1, category: 'First Aid' },
    ],
    totalPrice: 579,
    eta: '~12 min',
    storeName: 'Amazon Fresh, Connaught Place',
  },
  'general-emergency': {
    name: 'General Emergency Kit',
    description: 'Water, first aid, light & power — the essentials',
    items: [
      { id: 'ge-001', name: 'Bisleri Water 1L (Pack of 6)', price: 120, mrp: 132, image: '💧', qty: 1, category: 'Beverages' },
      { id: 'ge-002', name: 'Johnson & Johnson First Aid Kit', price: 350, mrp: 399, image: '🩹', qty: 1, category: 'Health' },
      { id: 'ge-003', name: 'Eveready LED Torch + Batteries', price: 199, mrp: 250, image: '🔦', qty: 1, category: 'Utilities' },
      { id: 'ge-004', name: 'Mi USB-C Fast Charger 33W', price: 499, mrp: 599, image: '🔌', qty: 1, category: 'Accessories' },
    ],
    totalPrice: 1168,
    eta: '~10 min',
    storeName: 'Amazon Fresh, Connaught Place',
  },
};

// ─── Detection & Kit Generation ─────────────────────────────────────────────

/**
 * Scans a user query against all emergency category trigger phrases.
 * Returns the matched category or null if no emergency intent is detected.
 * 
 * Priority: more specific categories are checked first (baby, period, pet)
 * before the catch-all "general-emergency".
 * 
 * Production: replaced by Bedrock Agent's NLU intent classification,
 * which understands context, synonyms, and Hinglish naturally.
 */
export function detectEmergencyCategory(query: string): EmergencyCategory | null {
  const lower = query.toLowerCase();

  // Check specific categories first (general-emergency is last in the array)
  for (const category of emergencyCategories) {
    // Skip general-emergency on first pass — it's the fallback
    if (category.id === 'general-emergency') continue;

    for (const phrase of category.triggerPhrases) {
      if (lower.includes(phrase)) {
        return category;
      }
    }
  }

  // Check general-emergency last (catch-all)
  const general = emergencyCategories.find((c) => c.id === 'general-emergency')!;
  for (const phrase of general.triggerPhrases) {
    if (lower.includes(phrase)) {
      return general;
    }
  }

  return null;
}

/**
 * Generates a mock emergency kit for a given category and pincode.
 * Returns the full kit data including items, pricing, and ETA.
 * 
 * Production: calls the generate_emergency_kit(category, pincode) Bedrock Agent tool,
 * which queries real-time inventory from the nearest dark store via DynamoDB/OpenSearch,
 * calculates actual ETA from the logistics service, and applies any user-specific
 * substitutions or preferences.
 */
export function generateEmergencyKit(categoryId: string, _pincode: string = '110001'): EmergencyKitData | null {
  const category = emergencyCategories.find((c) => c.id === categoryId);
  if (!category) return null;

  const kit = kitData[categoryId];
  if (!kit) return null;

  return {
    categoryId: category.id,
    categoryName: category.name,
    categoryEmoji: category.emoji,
    categoryColor: category.color,
    ...kit,
  };
}

/**
 * Returns all categories for rendering the emergency grid.
 */
export function getAllCategories(): EmergencyCategory[] {
  return emergencyCategories;
}

// Production extension:
// - Categories are stored in DynamoDB with admin CRUD via Nia for Sellers portal
// - Trigger phrases are augmented by a fine-tuned classifier (Bedrock custom model)
// - Kit items are dynamically assembled from nearest dark-store inventory
// - Pricing is real-time from the catalog service
// - ETA is calculated from logistics service based on dark-store distance + load
// - Kits are A/B tested: which combination has highest conversion per category
// - Seasonal categories can be added (e.g., "Monsoon Kit" during July-Aug)
