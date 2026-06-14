import { searchCatalog } from '../catalog/searchEngine';
import { compareProducts } from '../comparisons/compareEngine';
import { buildCart } from '../cart/cartBuilder';
import { EMERGENCY_CATEGORIES } from '../emergency/categories';
import { supabase } from '../supabaseClient';

export async function executeMockTool(toolName: string, toolArgs: any, userId?: string, userName?: string) {
  switch (toolName) {
    case 'search_catalog':
      const results = searchCatalog(toolArgs.query, toolArgs.filters);
      return { products: results.map(r => r.product), totalFound: results.length };

    case 'compare_products':
      return compareProducts(toolArgs.product_ids, toolArgs.attributes ? toolArgs.attributes.join(', ') : undefined);

    case 'build_cart':
      return buildCart(toolArgs.intent, toolArgs.constraints);

    case 'check_inventory_eta':
      return { availability: toolArgs.product_ids.map((id: string) => ({ productId: id, inStock: true, eta_minutes: 10, store: 'Central Hub' })) };

    case 'get_user_profile': {
      let past_orders: any[] = [];
      if (userId && supabase) {
        const { data: orders } = await supabase
          .from('orders')
          .select('id, items, total, placed_at')
          .eq('user_id', userId)
          .order('placed_at', { ascending: false })
          .limit(10);
        if (orders) {
          past_orders = orders;
        }
      }
      return { 
        name: userName || 'Guest', 
        preferences: [], 
        dietary_restrictions: ['vegetarian'], 
        reorder_cycles: { 'Amul Milk': 3, 'Colgate Toothpaste': 38 }, 
        past_orders 
      };
    }

    case 'track_order':
      return { orders: [{ id: toolArgs.order_id || 'ord_123', status: 'Out for delivery', eta: '5 mins', items: [] }] };

    case 'apply_substitution':
      return { original: { id: toolArgs.product_id }, substitute: { id: 'mock_sub_id', name: 'Mock Substitute' }, matchScore: 90 };

    case 'generate_emergency_kit':
      const catId = toolArgs.category;
      const category = EMERGENCY_CATEGORIES.find(c => c.id === catId) || EMERGENCY_CATEGORIES.find(c => c.id === 'general_emergency');
      if (!category) throw new Error("No emergency category found");
      
      return {
        category: category.name,
        name: `${category.name} Kit`,
        items: category.kit.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          mrp: item.price + 20,
          image: item.image,
          qty: item.qty,
          category: category.name
        })),
        totalPrice: category.kit.reduce((sum, item) => sum + item.price * item.qty, 0),
        eta: '~10 min'
      };

    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}

// ─── Custom Emergency Kit Builder ──────────────────────────
// Handles freeform emergency descriptions that don't match the 8 predefined categories.
// Pattern-matches against known "other" emergencies and returns realistic kits.
// For unrecognized descriptions, returns a clarifying fallback.

import type { CustomEmergencyResult, CartItem } from '@/types';

const CUSTOM_EMERGENCY_SCENARIOS: {
  keywords: string[];
  build: () => CustomEmergencyResult;
}[] = [
  // ── Scenario 1: Tyre Puncture ──────────────────────────
  {
    keywords: ['tyre', 'tire', 'puncture', 'flat tyre', 'flat tire', 'puncutre'],
    build: () => ({
      kit: {
        category: 'Tyre Puncture',
        name: 'Tyre Emergency Kit',
        items: [
          { id: 'ce-tp1', name: 'Bergmann Cosmic Tyre Inflator (12V)', price: 799, mrp: 999, image: '🔧', qty: 1, category: 'Auto', eta: 25 },
          { id: 'ce-tp2', name: 'Slime Tyre Puncture Sealant Spray 500ml', price: 349, mrp: 449, image: '🧴', qty: 1, category: 'Auto', eta: 25 },
          { id: 'ce-tp3', name: 'Reflective Safety Triangle', price: 199, mrp: 249, image: '⚠️', qty: 1, category: 'Auto', eta: 25 },
          { id: 'ce-tp4', name: 'Disposable Nitrile Gloves ×10', price: 99, mrp: 129, image: '🧤', qty: 1, category: 'Safety', eta: 20 },
          { id: 'ce-tp5', name: 'Heavy Duty Torch / Flashlight', price: 249, mrp: 349, image: '🔦', qty: 1, category: 'Tools', eta: 20 },
          { id: 'ce-tp6', name: 'Bisleri Water 1L', price: 28, mrp: 30, image: '💧', qty: 2, category: 'Beverages', eta: 15 },
        ],
        totalPrice: 1751,
        eta: '~25 min',
      },
      canFullyHelp: false,
      canPartiallyHelp: true,
      niaMessage: "I can send a tyre inflator + sealant spray that fix most slow punctures without a mechanic — arrives in ~25 min. For a burst tyre or major damage, you'll need roadside assistance. Details below.",
      cannotHelpWith: ['Calling a mechanic', 'Towing your vehicle', 'Replacing a burst tyre'],
      alternativeSuggestion: 'For towing or a mechanic: call your car insurance helpline (usually 24/7 roadside assistance is included). If unsafe location, call 112.',
    }),
  },
  // ── Scenario 2: Power Cut ──────────────────────────────
  {
    keywords: ['power cut', 'electricity gone', 'lights out', 'power outage', 'no electricity', 'bijli', 'bijli gayi', 'load shedding', 'power failure'],
    build: () => ({
      kit: {
        category: 'Power Cut',
        name: 'Power Outage Kit',
        items: [
          { id: 'ce-pc1', name: 'Eveready LED Torch', price: 199, mrp: 249, image: '🔦', qty: 1, category: 'Electronics', eta: 12 },
          { id: 'ce-pc2', name: 'Eveready AA Batteries ×8', price: 149, mrp: 179, image: '🔋', qty: 1, category: 'Electronics', eta: 12 },
          { id: 'ce-pc3', name: 'Mangaldeep Candles ×12', price: 79, mrp: 99, image: '🕯️', qty: 1, category: 'Home', eta: 10 },
          { id: 'ce-pc4', name: 'BIC Lighter', price: 30, mrp: 35, image: '🔥', qty: 1, category: 'Home', eta: 10 },
          { id: 'ce-pc5', name: 'Ambrane Power Bank 10000mAh', price: 899, mrp: 1199, image: '🔋', qty: 1, category: 'Electronics', eta: 20 },
          { id: 'ce-pc6', name: 'Matchbox', price: 5, mrp: 5, image: '🔥', qty: 2, category: 'Home', eta: 10 },
        ],
        totalPrice: 1366,
        eta: '~20 min',
      },
      canFullyHelp: true,
      canPartiallyHelp: false,
      niaMessage: 'Power cut kit on its way — torch, candles, batteries, and a power bank to keep your phone alive. All here in ~20 min. ⚡',
    }),
  },
  // ── Scenario 3: Car Not Starting / Dead Battery ────────
  {
    keywords: ['car wont start', 'car not starting', 'dead battery', 'battery dead', 'car battery', 'jump start', 'jumper cable', 'gaadi start nahi'],
    build: () => ({
      kit: {
        category: 'Car Emergency',
        name: 'Car Dead Battery Kit',
        items: [
          { id: 'ce-cb1', name: 'Portable Car Battery Jump Starter', price: 2499, mrp: 3499, image: '🚗', qty: 1, category: 'Auto', eta: 35 },
          { id: 'ce-cb2', name: 'Heavy Duty Torch', price: 249, mrp: 349, image: '🔦', qty: 1, category: 'Tools', eta: 15 },
          { id: 'ce-cb3', name: 'Reflective Safety Triangle', price: 199, mrp: 249, image: '⚠️', qty: 1, category: 'Auto', eta: 20 },
          { id: 'ce-cb4', name: 'Bisleri Water 1L', price: 28, mrp: 30, image: '💧', qty: 2, category: 'Beverages', eta: 15 },
          { id: 'ce-cb5', name: 'RiteBite Energy Bar', price: 50, mrp: 60, image: '🍫', qty: 1, category: 'Snacks', eta: 15 },
        ],
        totalPrice: 3053,
        eta: '~35 min',
      },
      canFullyHelp: false,
      canPartiallyHelp: true,
      niaMessage: "I've assembled what I can send — a portable jump starter may work for smaller cars. For reliable jump-starting, roadside assistance is faster. Torch + safety triangle while you wait. 🚗",
      cannotHelpWith: ['Jump-starting your car (need another car or mechanic)', 'Mechanical repairs', 'Towing'],
      alternativeSuggestion: 'Call your car insurance helpline for roadside assistance. Maruti, Hyundai, and most insurers offer free towing. Alternatively: ask a passing driver to jump-start using the cables in your kit.',
    }),
  },
  // ── Scenario 4: House Flooding / Water Leak ────────────
  {
    keywords: ['flood', 'flooding', 'water leak', 'pipe burst', 'water everywhere', 'paani leak', 'bathroom leak', 'kitchen flooding'],
    build: () => ({
      kit: {
        category: 'Water Emergency',
        name: 'Flood Damage Control Kit',
        items: [
          { id: 'ce-fl1', name: 'Large Mop with Bucket', price: 349, mrp: 449, image: '🧹', qty: 1, category: 'Home', eta: 20 },
          { id: 'ce-fl2', name: 'Absorbent Towels (Large) ×6', price: 499, mrp: 599, image: '🧻', qty: 1, category: 'Home', eta: 20 },
          { id: 'ce-fl3', name: 'Heavy Duty Garbage Bags ×20', price: 99, mrp: 129, image: '🗑️', qty: 1, category: 'Home', eta: 15 },
          { id: 'ce-fl4', name: 'Plumber\'s Waterproof Adhesive Tape', price: 149, mrp: 199, image: '🔧', qty: 1, category: 'Tools', eta: 15 },
          { id: 'ce-fl5', name: 'Heavy Duty Rubber Gloves', price: 99, mrp: 129, image: '🧤', qty: 1, category: 'Safety', eta: 15 },
          { id: 'ce-fl6', name: 'Lizol Floor Cleaner', price: 99, mrp: 119, image: '🧴', qty: 1, category: 'Cleaning', eta: 15 },
        ],
        totalPrice: 1294,
        eta: '~20 min',
      },
      canFullyHelp: false,
      canPartiallyHelp: true,
      niaMessage: 'Sending damage-control supplies — mop, towels, bags, and plumber\'s tape for minor leaks. Turn off your main water valve first. For burst pipes, call a plumber while these are on the way. 🪣',
      cannotHelpWith: ['Plumber', 'Pipe repair', 'Structural damage assessment'],
      alternativeSuggestion: 'Call a plumber immediately — Urban Company, Sulekha, or your building\'s maintenance number. Turn off the main water valve first (usually near the meter outside your flat).',
    }),
  },
  // ── Scenario 5: Locked Out ─────────────────────────────
  {
    keywords: ['locked out', 'lost keys', 'lock', 'cant get in', 'keys lost', 'ghar band', 'chabi kho gayi'],
    build: () => ({
      kit: {
        category: 'Locked Out',
        name: 'Survive-the-Wait Kit',
        items: [
          { id: 'ce-lo1', name: 'Ambrane Power Bank 10000mAh', price: 899, mrp: 1199, image: '🔋', qty: 1, category: 'Electronics', eta: 20 },
          { id: 'ce-lo2', name: 'Torch / Flashlight', price: 249, mrp: 349, image: '🔦', qty: 1, category: 'Tools', eta: 20 },
          { id: 'ce-lo3', name: 'Bisleri Water 1L', price: 28, mrp: 30, image: '💧', qty: 2, category: 'Beverages', eta: 15 },
          { id: 'ce-lo4', name: 'Parle-G Biscuits', price: 15, mrp: 15, image: '🍪', qty: 2, category: 'Snacks', eta: 15 },
        ],
        totalPrice: 1234,
        eta: '~20 min',
      },
      canFullyHelp: false,
      canPartiallyHelp: true,
      niaMessage: "I can't send a locksmith — that's outside what Amazon Now delivers 😅 But I've put together a 'survive the wait' kit: power bank, water, snacks. See below for how to find a locksmith fast.",
      cannotHelpWith: ['Locksmith', 'Opening your lock', 'Duplicate keys'],
      alternativeSuggestion: "For a locksmith: search 'locksmith near me' on Google Maps — most arrive in 30–60 min. Urban Company also provides locksmith services. Call your building security or society office — they often have spare keys or know an emergency locksmith.",
    }),
  },
  // ── Scenario 6: Gas Cylinder Empty / Gas Leak ──────────
  {
    keywords: ['gas empty', 'cylinder empty', 'gas leak', 'gas smell', 'LPG', 'cylinder', 'cooking gas', 'gas khatam'],
    build: () => {
      return {
        kit: {
          category: 'Gas Emergency',
          name: 'Cooking Backup Kit',
          items: [
            { id: 'ce-gs1', name: 'Portable Electric Induction Cooktop', price: 1299, mrp: 1799, image: '🍳', qty: 1, category: 'Kitchen', eta: 30 },
            { id: 'ce-gs2', name: 'MTR Ready-to-Eat Meals ×3', price: 299, mrp: 350, image: '🍱', qty: 1, category: 'Food', eta: 20 },
            { id: 'ce-gs3', name: 'Electric Kettle', price: 699, mrp: 899, image: '☕', qty: 1, category: 'Kitchen', eta: 30 },
          ],
          totalPrice: 2297,
          eta: '~30 min',
        },
        canFullyHelp: false,
        canPartiallyHelp: true,
        niaMessage: "I can't deliver LPG, but an induction cooktop means you can cook normally while waiting for your cylinder refill. Ready-to-eat meals for tonight. 🍳",
        cannotHelpWith: ['LPG cylinder delivery (use HP Gas / Indane / Bharat Gas app)', 'Gas leak repair (call 1906 immediately)'],
        alternativeSuggestion: 'Book cylinder refill on your gas provider\'s app or Indane/HP Gas. Takes 1–2 days typically. An induction cooktop keeps you cooking in the meantime.',
      };
    },
  },
  // ── Scenario 7: Laptop / Work Emergency ────────────────
  {
    keywords: ['laptop charger', 'charger missing', 'hdmi', 'presentation', 'adapter', 'laptop cable', 'usb c', 'dongle', 'work emergency'],
    build: () => ({
      kit: {
        category: 'Work Emergency',
        name: 'Work Emergency Kit',
        items: [
          { id: 'ce-we1', name: 'Portronics USB-C 65W Laptop Charger', price: 899, mrp: 1299, image: '🔌', qty: 1, category: 'Electronics', eta: 25 },
          { id: 'ce-we2', name: 'HDMI Cable 2m', price: 299, mrp: 399, image: '🖥️', qty: 1, category: 'Electronics', eta: 25 },
          { id: 'ce-we3', name: 'USB-C to HDMI Adapter', price: 499, mrp: 699, image: '🔄', qty: 1, category: 'Electronics', eta: 25 },
          { id: 'ce-we4', name: 'USB Hub 4-port', price: 599, mrp: 799, image: '🔌', qty: 1, category: 'Electronics', eta: 25 },
          { id: 'ce-we5', name: 'Ambrane Power Bank 20000mAh', price: 1499, mrp: 1999, image: '🔋', qty: 1, category: 'Electronics', eta: 30 },
        ],
        totalPrice: 3795,
        eta: '~30 min',
      },
      canFullyHelp: true,
      canPartiallyHelp: false,
      niaMessage: 'Work emergency kit inbound — charger, HDMI, adapter, hub. Should cover most laptop emergencies. Arrives in ~30 min. 💼',
    }),
  },
];

// ── Safety overrides for dangerous situations ────────────
const SAFETY_OVERRIDES: { keywords: string[]; response: CustomEmergencyResult }[] = [
  {
    keywords: ['heart attack', 'stroke', 'unconscious', 'not breathing', 'accident', 'bleeding heavily', 'call ambulance'],
    response: {
      kit: null,
      canFullyHelp: false,
      canPartiallyHelp: false,
      niaMessage: '🚑 This sounds like a medical emergency. Call 112 (India Emergency) or 108 (Ambulance) immediately. For medicine and first-aid supplies, tap "Fever & Illness 🤒" on the Emergency page.',
      cannotHelpWith: ['Medical emergencies require professional responders'],
      alternativeSuggestion: 'Call 112 or 108 NOW. Do not delay.',
    },
  },
  {
    keywords: ['fire', 'aag', 'smoke', 'burning'],
    response: {
      kit: null,
      canFullyHelp: false,
      canPartiallyHelp: false,
      niaMessage: '🔥 If there\'s a fire: call 101 (Fire Service) and leave the building NOW. Once safe, I can send you fire safety items (extinguisher, smoke detector) to prevent future incidents.',
      cannotHelpWith: ['Active fire — call 101 Fire Service immediately'],
      alternativeSuggestion: 'Evacuate first. Call 101 (Fire), then 112 (Emergency). Do not attempt to fight the fire yourself.',
    },
  },
];

export function executeCustomEmergencyKit(description: string): CustomEmergencyResult {
  const lower = description.toLowerCase();

  // 1. Safety overrides FIRST — life-threatening situations
  for (const override of SAFETY_OVERRIDES) {
    if (override.keywords.some(kw => lower.includes(kw))) {
      return override.response;
    }
  }

  // 2. Gas leak safety check — special handling within gas scenario
  const isGasLeak = ['gas leak', 'gas smell'].some(kw => lower.includes(kw));
  if (isGasLeak) {
    // Return gas kit but with safety-first messaging
    const gasScenario = CUSTOM_EMERGENCY_SCENARIOS.find(s => s.keywords.includes('gas leak'));
    if (gasScenario) {
      const result = gasScenario.build();
      result.niaMessage = '⚠️ SAFETY FIRST: If you smell gas, leave your home immediately. Do not switch any electrical switches. Call 1906 (IGL/MGL Emergency) or your gas provider\'s helpline.\n\n' + result.niaMessage;
      result.cannotHelpWith = [
        '⚠️ SAFETY FIRST: Leave your home immediately if you smell gas. Do not switch any electrical switches. Call 1906 (gas emergency).',
        ...(result.cannotHelpWith || []),
      ];
      return result;
    }
  }

  // 3. Match known scenarios
  for (const scenario of CUSTOM_EMERGENCY_SCENARIOS) {
    if (scenario.keywords.some(kw => lower.includes(kw))) {
      return scenario.build();
    }
  }

  // 4. Fallback — unrecognized emergency
  return {
    kit: null,
    canFullyHelp: false,
    canPartiallyHelp: false,
    niaMessage: "I'm not sure what Amazon Now can send for this specific situation. Let me think about it differently — describe what you physically need (torch? cleaning supplies? medicines? cables?) and I'll find it.",
    cannotHelpWith: [],
    alternativeSuggestion: 'Try describing what items you think you need — I\'ll find the closest match from what\'s available for 10-minute delivery.',
  };
}
