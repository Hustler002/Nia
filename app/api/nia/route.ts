import { Groq } from 'groq-sdk';
import { NiaMessage } from '@/lib/useNiaStore';
import { TOOL_DEFINITIONS } from '@/lib/niaBrain/tools';
import { executeMockTool } from '@/lib/niaBrain/mockTools';
import { detectEmergencyCategory } from '@/lib/emergency/categories';
import { NIA_SYSTEM_PROMPT } from '@/lib/niaBrain/systemPrompt';
import { fetchMemoryContext, extractAndSaveMemories, resolveAddress } from '@/lib/memoryEngine';
import { CATALOG } from '@/lib/catalog/products';

function matchMockFlow(userMessage: string): NiaMessage | null {
  const lowerMsg = userMessage.toLowerCase();

  // FLOW 1 — Movie night
  if (['movie night', 'movie', 'popcorn night', 'film night'].some(t => lowerMsg.includes(t))) {
    return {
      id: 'mock-' + Date.now(),
      role: 'nia',
      type: 'cart_summary',
      content: "Movie night sorted! 🎬 Lay's + Kurkure for the crunch during tense scenes, Pepsi to sip through the slow parts, Oreos for dessert at the climax, and Cornitos when you want something different. Everything for 4 people, under ₹300, arriving in 10 mins. 🍿",
      data: [
        { id: 'mn-001', name: "Haldiram's Aloo Bhujia", price: 55, mrp: 65, image: '🥜', qty: 1, category: 'Snacks' },
        { id: 'mn-002', name: "Lay's Classic", price: 50, mrp: 50, image: '🥔', qty: 2, category: 'Snacks' },
        { id: 'mn-003', name: "Kurkure", price: 20, mrp: 20, image: '🌶️', qty: 1, category: 'Snacks' },
        { id: 'mn-004', name: "Pepsi 2L", price: 85, mrp: 90, image: '🥤', qty: 1, category: 'Beverages' },
        { id: 'mn-005', name: "Cornitos Nacho", price: 40, mrp: 45, image: '🌮', qty: 1, category: 'Snacks' },
        { id: 'mn-006', name: "Oreo", price: 40, mrp: 45, image: '🍪', qty: 1, category: 'Snacks' }
      ],
      confidence: 94,
      reason: 'Top-rated snacks + beverages combo, most ordered for movie nights in your area.',
      timestamp: new Date()
    } as any;
  }

  // FLOW 2 — Earbuds comparison
  if (['earbuds', 'headphones', 'earphones', 'compare'].some(t => lowerMsg.includes(t)) && 
      ['under ₹2000', '2000', 'best', 'bass', 'wireless'].some(t => lowerMsg.includes(t))) {
    return {
      id: 'mock-' + Date.now(),
      role: 'nia',
      type: 'comparison',
      content: "Compared the top 3 wireless earbuds under ₹2000 for you. 🎧",
      data: {
        query: "wireless earbuds under 2000",
        products: [
          { id: 'boat_airdopes_141', name: 'boAt Airdopes 141', price: 1299, rating: 4.3, image: '🎧', specs: {}, matchScore: 94, recommended: true, whyRecommended: "Best bass (8mm driver) + longest battery (42h) + lowest price at ₹1,299" },
          { id: 'noise_vs104', name: 'Noise Buds VS104', price: 1099, rating: 4.1, image: '🎵', specs: {}, matchScore: 85, recommended: false },
          { id: 'jbl_115tws', name: 'JBL Tune 115TWS', price: 1999, rating: 4.2, image: '🔊', specs: {}, matchScore: 88, recommended: false }
        ],
        attributes: []
      },
      confidence: 91,
      reason: 'boAt wins on bass + value; JBL wins on brand trust; Noise is budget pick.',
      timestamp: new Date()
    } as any;
  }

  // FLOW 3 — Emergency Auto-detection
  const emergencyCategory = detectEmergencyCategory(userMessage);
  if (emergencyCategory) {
    return {
      id: 'mock-' + Date.now(),
      role: 'nia',
      type: 'emergency_kit',
      content: `I've put together a ${emergencyCategory.name} Kit. Everything you need, arriving in ~10 mins!`,
      data: {
        category: emergencyCategory.name,
        name: `${emergencyCategory.name} Kit`,
        items: emergencyCategory.kit.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          mrp: item.price + 20, // mock MRP
          image: item.image,
          qty: item.qty,
          category: emergencyCategory.name
        })),
        totalPrice: emergencyCategory.kit.reduce((sum, item) => sum + item.price * item.qty, 0),
        eta: '~10 min'
      },
      confidence: 97,
      reason: 'Fastest-available essentials from nearest dark store.',
      timestamp: new Date()
    } as any;
  }

  // FLOW 4 — Birthday party
  if (lowerMsg.includes('birthday') && ['party', 'kids', 'children', 'bachche'].some(t => lowerMsg.includes(t))) {
    return {
      id: 'mock-' + Date.now(),
      role: 'nia',
      type: 'cart_summary',
      content: "Birthday party kit for 10 kids, ready to order! 🎂🎉",
      data: [
        { id: 'bp-001', name: "Haldiram's Aloo Bhujia", price: 55, mrp: 65, image: '🥜', qty: 2, category: 'Snacks' },
        { id: 'bp-002', name: "Lay's Classic", price: 50, mrp: 50, image: '🥔', qty: 3, category: 'Snacks' },
        { id: 'bp-003', name: "Kurkure", price: 20, mrp: 20, image: '🌶️', qty: 2, category: 'Snacks' },
        { id: 'bp-004', name: "Pepsi 2L", price: 85, mrp: 90, image: '🥤', qty: 2, category: 'Beverages' },
        { id: 'bp-005', name: "Sprite 2L", price: 85, mrp: 90, image: '🍋', qty: 1, category: 'Beverages' },
        { id: 'bp-006', name: "Oreo", price: 40, mrp: 45, image: '🍪', qty: 3, category: 'Snacks' },
        { id: 'bp-007', name: "Cornitos", price: 40, mrp: 45, image: '🌮', qty: 2, category: 'Snacks' }
      ],
      confidence: 92,
      reason: 'Kid-friendly snacks + beverages bundle — most popular party picks in your area.',
      timestamp: new Date()
    } as any;
  }

  // FLOW 5 — Reorder milk / running low
  if (['milk', 'doodh', 'toothpaste', 'bread', 'running low', 'khatam', 'almost over', 'reorder', 'usual order'].some(t => lowerMsg.includes(t))) {
    return {
      id: 'mock-' + Date.now(),
      role: 'nia',
      type: 'reorder_nudge',
      content: "Your Amul Milk and Colgate Toothpaste are likely running low. 🛒",
      data: {
        product: { id: 'rn-001', name: 'Amul Milk & Colgate Toothpaste', price: 200, image: '🥛', lastOrdered: '3 days ago', cycleDays: 3, percentUsed: 95 }
      },
      confidence: 88,
      reason: 'Based on your order history: milk every 3 days, toothpaste every 38 days.',
      timestamp: new Date()
    } as any;
  }

  return null;
}

export async function POST(req: Request) {
  // 1. Parse and validate request body
  let messages, userId, userName, pincode;
  try {
    const body = await req.json();
    messages = body.messages;
    userId = body.userId;
    userName = body.userName;
    pincode = body.pincode;
    if (!Array.isArray(messages)) {
      return Response.json({ id: 'err-' + Date.now(), role: 'nia', type: 'text', content: 'Invalid request format.', data: null, timestamp: new Date() }, { status: 400 });
    }
  } catch {
    return Response.json({ id: 'err-' + Date.now(), role: 'nia', type: 'text', content: 'Invalid request body.', data: null, timestamp: new Date() }, { status: 400 });
  }
  const latestUserMessage = messages.filter((m: any) => m.role === 'user').at(-1)?.content ?? "";
  
  // 2. Mock-first: check demo flows
  const mockResponse = matchMockFlow(latestUserMessage);
  if (mockResponse) {
    await new Promise(resolve => setTimeout(resolve, 1200));
    return Response.json(mockResponse);
  }
  
  // 3. Fetch persistent AI memory for this user
  const memoryContext = userId ? await fetchMemoryContext(userId) : '';
  const systemPromptWithMemory = memoryContext
    ? `${NIA_SYSTEM_PROMPT}\n\nThe user's name is ${userName || 'Guest'}.\n\n${memoryContext}`
    : `${NIA_SYSTEM_PROMPT}\n\nThe user's name is ${userName || 'Guest'}.`;

  // 4. Live Groq agent loop
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    
    // Build conversation history in OpenAI format
    const groqMessages: any[] = [
      { role: "system", content: systemPromptWithMemory },
      ...messages.map((m: any) => ({ role: m.role === 'nia' ? 'assistant' : 'user', content: m.content }))
    ];
    
    // First call — tool selection
    const firstResponse = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: groqMessages,
      tools: TOOL_DEFINITIONS,
      tool_choice: "auto",
      max_tokens: 1000,
      temperature: 0.3
    });
    
    const firstMessage = firstResponse.choices[0].message;
    
    // If tool was called
    if (firstMessage.tool_calls && firstMessage.tool_calls.length > 0) {
      const toolCall = firstMessage.tool_calls[0];
      const toolName = toolCall.function.name;
      const toolArgs = JSON.parse(toolCall.function.arguments);
      // ─── Handle checkout_direct autonomously ──────────────────────
      if (toolName === 'checkout_direct') {
        const { item_query, address_label, quantity = 1 } = toolArgs;
        
        // Find product in catalog
        const product = CATALOG.find(
          (p) => p.name.toLowerCase().includes(item_query.toLowerCase()) ||
                 item_query.toLowerCase().includes(p.name.toLowerCase().split(' ')[0])
        );

        // Resolve saved address
        const address = userId ? await resolveAddress(userId, address_label) : null;
        
        return Response.json({
          id: 'checkout-' + Date.now(),
          role: 'nia',
          type: 'direct_checkout',
          content: `Got it! Sending ${quantity}x ${product?.name || item_query} to ${address?.label || address_label}. Taking you to payment now... ⚡`,
          data: {
            item: product ? { ...product, qty: quantity } : { id: 'custom', name: item_query, price: 89, mrp: 99, image: '📦', qty: quantity, category: 'Other' },
            address: address || { label: address_label, full_address: `${address_label} (saved address)`, pincode: pincode || '110001' },
          },
          timestamp: new Date(),
        });
      }
      // ─────────────────────────────────────────────────────────────

      // Inject user context into tool args where relevant
      if (toolName === 'get_user_profile' && !toolArgs.user_id) {
        toolArgs.user_id = userId || 'demo-user-001';
      }
      if (toolName === 'check_inventory_eta' && !toolArgs.pincode) {
        toolArgs.pincode = pincode || '110001';
      }
      if (toolName === 'generate_emergency_kit' && !toolArgs.pincode) {
        toolArgs.pincode = pincode || '110001';
      }

      // Execute other mock tools normally
      const toolResult = await executeMockTool(toolName, toolArgs, userId, userName);
      
      // Second call — final response with tool result
      const secondResponse = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          ...groqMessages,
          { role: "assistant", content: null, tool_calls: firstMessage.tool_calls },
          { role: "tool", tool_call_id: toolCall.id, content: JSON.stringify(toolResult) }
        ],
        max_tokens: 1000,
        temperature: 0.3
      });
      
      const rawText = secondResponse.choices[0].message.content ?? "";
      const parsed = parseNiaResponse(rawText);

      // Extract + save memories in background (non-blocking)
      if (userId) {
        extractAndSaveMemories(userId, latestUserMessage, rawText).catch(() => {});
      }
      return Response.json(parsed);
    }
    
    // No tool call — parse direct response
    const rawText = firstMessage.content ?? "";
    const parsed = parseNiaResponse(rawText);
    
    // Extract + save memories in background (non-blocking)
    if (userId) {
      extractAndSaveMemories(userId, latestUserMessage, rawText).catch(() => {});
    }
    return Response.json(parsed);
    
  } catch (error: any) {
    console.error("Nia API error:", error?.message || error);
    return Response.json({
      id: 'err-' + Date.now(),
      role: 'nia',
      type: "text",
      content: "Oops, I'm having a bit of trouble right now. Try again in a second? 🙏",
      data: null,
      confidence: 0,
      reason: "",
      timestamp: new Date()
    } as any);
  }
}

// Helper: strip markdown, parse JSON, fallback to text
function parseNiaResponse(raw: string): Partial<NiaMessage> {
  try {
    const clean = raw.replace(/```json[\s\S]*?```|```/g, "").trim();
    const parsed = JSON.parse(clean);
    
    // Normalize data: if product_list type, make sure data is array of CartItems
    let data = parsed.data || null;
    if ((parsed.type === 'product_list' || parsed.type === 'cart_summary') && Array.isArray(data)) {
      // Could be an array of Product from search_catalog — normalize to CartItem shape
      data = data.map((item: any) => ({
        id: item.id || item.productId || String(Math.random()),
        name: item.name || item.productName || 'Unknown',
        price: item.price || 0,
        mrp: item.mrp || item.price || 0,
        image: item.imageUrl || item.image || '🛒',
        qty: item.qty || item.quantity || 1,
        category: item.category || 'General',
        rating: item.rating || undefined,
        eta: item.eta_minutes || item.eta || undefined,
        matchReason: item.matchReason || undefined,
        brand: item.brand || undefined,
      }));
    }
    // If data has a products key (from search_catalog result object)
    if (data && !Array.isArray(data) && Array.isArray(data.products)) {
      data = data.products.map((item: any) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        mrp: item.mrp || item.price,
        image: item.imageUrl || item.image || '🛒',
        qty: 1,
        category: item.category || 'General',
        rating: item.rating || undefined,
        eta: item.eta_minutes || item.eta || undefined,
        matchReason: item.matchReason || undefined,
        brand: item.brand || undefined,
      }));
    }
    // If data has an items key (from build_cart result object)
    if (data && !Array.isArray(data) && Array.isArray(data.items)) {
      data = data.items.map((item: any) => {
        const p = item.product || item;
        return {
          id: p.id || String(Math.random()),
          name: p.name || 'Unknown',
          price: p.price || 0,
          mrp: p.mrp || p.price || 0,
          image: p.imageUrl || p.image || '🛒',
          qty: item.quantity || item.qty || 1,
          category: p.category || 'General',
        };
      });
    }
    
    return {
      id: 'groq-' + Date.now(),
      role: 'nia',
      type: parsed.type || 'text',
      content: parsed.message || raw,
      data,
      timestamp: new Date()
    };
  } catch {
    return { 
        id: 'groq-' + Date.now(),
        role: 'nia',
        type: "text", 
        content: raw, 
        data: null,
        timestamp: new Date()
    };
  }
}

