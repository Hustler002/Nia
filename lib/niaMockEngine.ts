// lib/niaMockEngine.ts
// Mock response engine for the Nia chat widget
// Routes user queries to the appropriate rich response type with realistic demo data
// Production: Replace this entire file with a streaming Bedrock Agent invocation

import type {
  NiaMessage,
  NiaMessageType,
  CartItem,
  ComparisonData,
  EmergencyKit,
  ReorderNudge,
} from './useNiaStore';
import { detectEmergencyCategory, generateEmergencyKit } from './emergency/categories';

// ─── Mock Data: Movie Night Cart ────────────────────────────────────────────

const movieNightCart: CartItem[] = [
  {
    id: 'mn-001',
    name: 'ACT II Butter Lovers Popcorn (Pack of 3)',
    price: 120,
    mrp: 150,
    image: '🍿',
    qty: 1,
    category: 'Snacks',
  },
  {
    id: 'mn-002',
    name: "Lay's Classic Salted Chips 150g",
    price: 50,
    mrp: 50,
    image: '🥔',
    qty: 2,
    category: 'Snacks',
  },
  {
    id: 'mn-003',
    name: 'Coca-Cola Original 1.25L',
    price: 76,
    mrp: 85,
    image: '🥤',
    qty: 2,
    category: 'Beverages',
  },
  {
    id: 'mn-004',
    name: 'Doritos Nacho Cheese 150g',
    price: 80,
    mrp: 99,
    image: '🌮',
    qty: 1,
    category: 'Snacks',
  },
  {
    id: 'mn-005',
    name: "Hershey's Chocolate Syrup 200g",
    price: 65,
    mrp: 75,
    image: '🍫',
    qty: 1,
    category: 'Snacks',
  },
];

// ─── Mock Data: Birthday Party Kit ──────────────────────────────────────────

const birthdayPartyCart: CartItem[] = [
  {
    id: 'bp-001',
    name: 'Party Plates & Cups Set (20 pcs)',
    price: 180,
    mrp: 220,
    image: '🎉',
    qty: 1,
    category: 'Party Supplies',
  },
  {
    id: 'bp-002',
    name: 'Birthday Candles Assorted (12 pcs)',
    price: 40,
    mrp: 50,
    image: '🕯️',
    qty: 1,
    category: 'Party Supplies',
  },
  {
    id: 'bp-003',
    name: 'Frooti Mango Juice 200ml (12-pack)',
    price: 120,
    mrp: 144,
    image: '🧃',
    qty: 1,
    category: 'Beverages',
  },
  {
    id: 'bp-004',
    name: 'Hide & Seek Biscuits (6-pack)',
    price: 150,
    mrp: 180,
    image: '🍪',
    qty: 1,
    category: 'Snacks',
  },
  {
    id: 'bp-005',
    name: 'Cadbury Gems Pack (10 pcs)',
    price: 100,
    mrp: 100,
    image: '🍬',
    qty: 1,
    category: 'Snacks',
  },
  {
    id: 'bp-006',
    name: 'Paper Napkins 50 pcs',
    price: 60,
    mrp: 70,
    image: '🧻',
    qty: 1,
    category: 'Party Supplies',
  },
  {
    id: 'bp-007',
    name: 'Balloon Pack (25 Assorted)',
    price: 80,
    mrp: 100,
    image: '🎈',
    qty: 1,
    category: 'Party Supplies',
  },
];

// ─── Mock Data: Earbuds Comparison ──────────────────────────────────────────

const earbudsComparison: ComparisonData = {
  query: 'best wireless earbuds under ₹2000 with good bass',
  attributes: ['Battery', 'Driver Size', 'ANC', 'Water Resistance', 'Weight'],
  products: [
    {
      id: 'eb-001',
      name: 'boAt Airdopes 141',
      price: 1299,
      rating: 4.3,
      image: '🎧',
      specs: {
        Battery: '42 hours',
        'Driver Size': '8mm',
        ANC: 'No',
        'Water Resistance': 'IPX4',
        Weight: '4.5g per bud',
      },
      matchScore: 92,
      recommended: true,
      whyRecommended:
        'Best bass in this range thanks to 8mm drivers. 42-hour total battery is exceptional. Most popular choice among users with similar preferences.',
    },
    {
      id: 'eb-002',
      name: 'Noise Buds VS104',
      price: 1099,
      rating: 4.1,
      image: '🎵',
      specs: {
        Battery: '18 hours',
        'Driver Size': '10mm',
        ANC: 'No',
        'Water Resistance': 'IPX5',
        Weight: '5g per bud',
      },
      matchScore: 85,
      recommended: false,
    },
    {
      id: 'eb-003',
      name: 'Realme Buds T110',
      price: 1499,
      rating: 4.2,
      image: '🔊',
      specs: {
        Battery: '38 hours',
        'Driver Size': '10mm',
        ANC: 'AI ENC',
        'Water Resistance': 'IPX5',
        Weight: '4g per bud',
      },
      matchScore: 88,
      recommended: false,
    },
  ],
};

// ─── Mock Data: Emergency Fever Kit ─────────────────────────────────────────

const feverEmergencyKit: EmergencyKit = {
  category: 'health',
  name: '🚨 Fever Care Emergency Kit',
  items: [
    {
      id: 'ek-001',
      name: 'Crocin Advance 500mg (15 tabs)',
      price: 30,
      mrp: 32,
      image: '💊',
      qty: 1,
      category: 'Medicine',
    },
    {
      id: 'ek-002',
      name: 'Dr. Morepen Digital Thermometer',
      price: 150,
      mrp: 199,
      image: '🌡️',
      qty: 1,
      category: 'Health Devices',
    },
    {
      id: 'ek-003',
      name: 'Electral Powder ORS (Pack of 4)',
      price: 48,
      mrp: 56,
      image: '💧',
      qty: 1,
      category: 'Medicine',
    },
    {
      id: 'ek-004',
      name: 'Moov Pain Relief Spray 80g',
      price: 99,
      mrp: 115,
      image: '🩹',
      qty: 1,
      category: 'Pain Relief',
    },
    {
      id: 'ek-005',
      name: 'Paper Boat Orange Juice 1L',
      price: 90,
      mrp: 99,
      image: '🍊',
      qty: 1,
      category: 'Beverages',
    },
  ],
  totalPrice: 417,
  eta: '~10 min',
  categoryColor: '#EF5350',
  categoryEmoji: '🤒',
};
void feverEmergencyKit;

// ─── Mock Data: Budget Alternatives ─────────────────────────────────────────

const budgetAlternatives: CartItem[] = [
  {
    id: 'ba-001',
    name: 'Parle Wafers Cream & Onion 75g',
    price: 20,
    mrp: 20,
    image: '🧇',
    qty: 2,
    category: 'Snacks',
  },
  {
    id: 'ba-002',
    name: 'Maggi 2-Minute Noodles (4-pack)',
    price: 48,
    mrp: 56,
    image: '🍜',
    qty: 1,
    category: 'Snacks',
  },
  {
    id: 'ba-003',
    name: 'Limca Lemon 750ml',
    price: 38,
    mrp: 42,
    image: '🍋',
    qty: 2,
    category: 'Beverages',
  },
  {
    id: 'ba-004',
    name: 'Haldiram Aloo Bhujia 200g',
    price: 55,
    mrp: 65,
    image: '🥜',
    qty: 1,
    category: 'Snacks',
  },
];

// ─── Mock Data: Reorder Nudge ───────────────────────────────────────────────

const toothpasteReorder: ReorderNudge = {
  product: {
    id: 'rn-001',
    name: 'Colgate MaxFresh 200g',
    price: 142,
    image: '🪥',
    lastOrdered: '38 days ago',
    cycleDays: 45,
    percentUsed: 84,
  },
};

// ─── Response Router ────────────────────────────────────────────────────────

interface MockResponse {
  content: string;
  type: NiaMessageType;
  data?: NiaMessage['data'];
  quickChips: string[];
}

/**
 * Routes a user query to the appropriate mock response.
 * In production, this is replaced by a Bedrock Agent invocation that uses
 * tool-use (search_catalog, build_cart, compare_products, etc.) to produce
 * structured responses.
 */
export function routeQuery(query: string): MockResponse {
  const lower = query.toLowerCase();

  // Movie night → cart summary
  if (lower.includes('movie') || lower.includes('movie night')) {
    return {
      content:
        "🎬 Movie night for 4 under ₹500? I've got you! Here's a perfect spread — popcorn, chips, drinks, and dip. Total comes to ₹467. Ready to order?",
      type: 'cart_summary',
      data: movieNightCart,
      quickChips: [
        'Make it cheaper 💰',
        'Add something sweet 🍰',
        'Checkout now 🛒',
      ],
    };
  }

  // Birthday party → cart summary
  if (lower.includes('birthday') || lower.includes('party')) {
    return {
      content:
        "🎂 Birthday party for 10 kids? I've planned the whole thing! Plates, cups, candles, juice, snacks, and balloons — everything in one cart.",
      type: 'cart_summary',
      data: birthdayPartyCart,
      quickChips: [
        'Add a cake 🎂',
        'Make it cheaper 💰',
        'Checkout now 🛒',
      ],
    };
  }

  // Earbuds / comparison
  if (
    lower.includes('earbuds') ||
    lower.includes('earbud') ||
    lower.includes('compare') ||
    lower.includes('headphone')
  ) {
    return {
      content:
        "🎧 I compared the top 3 wireless earbuds under ₹2,000 for bass. Here's my pick and why — swipe through the comparison:",
      type: 'comparison',
      data: earbudsComparison,
      quickChips: [
        'Show more options 🔍',
        'Add boAt to cart 🛒',
        'Under ₹1000 instead 💰',
      ],
    };
  }

  // Emergency detection — matches all 8 categories using trigger phrases
  const detectedCategory = detectEmergencyCategory(lower);
  if (detectedCategory) {
    // Generate a kit for the detected category
    const generatedKit = generateEmergencyKit(detectedCategory.id);
    if (generatedKit) {
      // Convert EmergencyKitData to the EmergencyKit type used by the store
      const emergencyKit: EmergencyKit = {
        category: generatedKit.categoryId,
        name: `${generatedKit.categoryEmoji} ${generatedKit.name}`,
        items: generatedKit.items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          mrp: item.mrp,
          image: item.image,
          qty: item.qty,
          category: item.category,
        })),
        totalPrice: generatedKit.totalPrice,
        eta: generatedKit.eta,
        categoryColor: generatedKit.categoryColor,
        categoryEmoji: generatedKit.categoryEmoji,
      };

      return {
        content:
          `🚨 Switching to Emergency Mode — ${detectedCategory.name}. I've assembled a ${generatedKit.name.toLowerCase()} with everything you need, delivering in ${generatedKit.eta}. 📍 Open Emergency Page for more options.`,
        type: 'emergency_kit',
        data: emergencyKit,
        quickChips: [
          'Add more items 🛒',
          'Open Emergency Page 🚨',
          'I\'m all sorted now ☀️',
        ],
      };
    }
  }

  // Budget / cheaper alternatives
  if (
    lower.includes('cheaper') ||
    lower.includes('budget') ||
    lower.includes('less expensive') ||
    lower.includes('save')
  ) {
    return {
      content:
        "💰 Here are some budget-friendly alternatives. Same vibe, easier on the wallet! Mix and match however you like:",
      type: 'product_list',
      data: budgetAlternatives,
      quickChips: [
        'Add all to cart 🛒',
        'Show premium options ✨',
        'Something different 🔄',
      ],
    };
  }

  // Toothpaste / reorder
  if (
    lower.includes('toothpaste') ||
    lower.includes('running out') ||
    lower.includes('reorder') ||
    lower.includes('almost over')
  ) {
    return {
      content:
        "🪥 I tracked your usage — looks like your Colgate MaxFresh is about 84% through its cycle. Here's a quick reorder option:",
      type: 'reorder_nudge',
      data: toothpasteReorder,
      quickChips: [
        'Add to cart 🛒',
        'Show alternatives 🔄',
        'Set auto-reorder ⏰',
      ],
    };
  }

  // Default fallback — plain text with helpful suggestions
  return {
    content:
      "I can help with that! 😊 Try asking me to:\n\n• **Build a cart** — \"Movie night for 4 under ₹500\"\n• **Compare products** — \"Best earbuds under ₹2000\"\n• **Handle emergencies** — \"I have a fever\"\n• **Reorder items** — \"My toothpaste is almost over\"",
    type: 'text',
    data: null,
    quickChips: [
      'Movie night for 4 🎬',
      'Compare earbuds 🎧',
      'I have a fever 🚨',
    ],
  };
}

/**
 * Returns the proactive nudge message shown on first page load.
 * In production, this comes from Amazon Personalize's consumption-cycle predictions.
 */
export function getProactiveNudge(): NiaMessage {
  return {
    id: 'proactive-001',
    role: 'nia',
    content:
      "Hey! 👋 Your Amul Milk and Colgate Toothpaste usually run out around this time. Want me to add them to a quick cart? 🛒",
    type: 'reorder_nudge',
    data: toothpasteReorder,
    timestamp: new Date(),
  };
}

// Production extension:
// - routeQuery() is replaced by InvokeAgent API call to Bedrock Agent (Claude Sonnet)
// - The agent decides which tools to call (search_catalog, build_cart, compare_products,
//   generate_emergency_kit) based on the user's intent
// - Tool responses are structured JSON that map directly to NiaMessageType card renderers
// - Streaming is handled via WebSocket for sub-2-second perceived latency
// - Quick chips are generated by the model based on conversation context
// - Proactive nudges come from Amazon Personalize via a scheduled Lambda function
