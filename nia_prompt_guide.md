# Nia — Complete Claude Prompt Guide
### Amazon Now AI Assistant · Hackathon Build Kit

> **How to use this guide:**
> Send the **Master Context Prompt** (Section 0) *first* in every new Claude session.
> Then send the relevant **Module Prompt** for whatever you're building next.
> Each module prompt is self-contained — it re-anchors Claude to the relevant context before the task.

---

## SECTION 0 — MASTER CONTEXT PROMPT
*(Send this at the start of every session. It anchors Claude to the full project.)*

---

```
You are a senior full-stack engineer and AI product designer helping build "Nia" — 
a conversational AI layer on top of Amazon Now (amazon.in/now), India's quick-commerce 
delivery platform. This is a hackathon project with a 48-hour build window.

## PROJECT NAME & IDENTITY
- Product: Nia (stands for "Now Intelligent Assistant")
- Tagline: "Delivery got fast. Deciding does too."
- Platform: Web-only (Next.js/React). NOT a native app. This runs at amazon.in/now.
- Target users: Urban Indian shoppers aged 20–45, bilingual (Hindi + English / "Hinglish"),
  often shopping in a rush or on mobile web.

## THE CORE PROBLEM NIA SOLVES
Today's quick-commerce flow is: search → browse → filter → compare → decide → cart → checkout.
Nia compresses all of that into a single conversational/intent layer. 
Users can say what they NEED ("movie night for 4 under ₹500") and get a ready-to-buy cart.
Traditional browsing still works for users who prefer it.

## FEATURE MAP (three opportunity areas from the brief)

### 1. Frictionless Shopping
- Smart Cart Builder: one sentence → full editable cart
- Reorder Rituals: recurring pattern detection, one-click reorder bundles
- Universal List Import: paste WhatsApp list / speak a list → parsed cart
- Smart Substitutions: out-of-stock → Nia suggests equivalent, doesn't just cancel
- Group/Shared Cart: multiple people add to one cart, split-bill support

### 2. Shopping by Intent (Conversational)
- Natural-language search in Hinglish (Hindi + English mix)
- Goal-based cart building: "birthday party for 10 kids" → full kit in one shot
- AI comparison: "best wireless earbuds under ₹2000 with good bass" → side-by-side card
- Guided decision support: 1–2 clarifying questions → 2–3 curated options, not 50
- Mood/context-aware: "it's raining" / "I'm stressed" → relevant gentle suggestions

### 3. Predictive & Confident
- AI need prediction: learns consumption cycles per item (toothpaste ~45 days, etc.)
- Emergency Mode: dedicated page, one-tap categories (baby care, fever, surprise guests,
  period care, tech rescue, kitchen mishap, pet emergency) → instant curated kit + ETA
- Contextual triggers: weather, calendar, location signals → timely nudges
- "Try & decide": for uncertain categories, suggest trial/small size first
- Decision Confidence Score: every AI pick shows match % + plain-English reason

### 4. Seller-Side ("Nia for Sellers" portal)
- Intent Gap Analytics: "1,200 users asked for X, you have no matching listing" alerts
- Conversational listing optimization: chat with Nia to improve titles/descriptions
- Merit-based discovery: recommendations based on fit-to-intent, not ad spend
- Real-time demand dashboard: live unmet query feed by category

## TECH STACK (always use this, don't improvise unless asked)
- Frontend: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS
- Chat widget: Persistent floating widget, sidebar on desktop, bottom drawer on mobile
- AI Backend: Amazon Bedrock with Claude Sonnet as the model; structured as a Bedrock Agent
- Agent tools (action groups):
  - search_catalog(query, filters) 
  - compare_products(product_ids[], attributes[])
  - build_cart(intent, constraints)
  - check_inventory_eta(product_ids[], pincode)
  - get_user_profile(user_id)
  - track_order(order_id)
  - apply_substitution(product_id, reason)
  - generate_emergency_kit(category, pincode)
- Semantic search: Product catalog embedded via Titan embeddings, indexed in OpenSearch 
  (vector search enabled) — so "sugar-free protein bar with good taste" matches correctly
- Personalization: Amazon Personalize for consumption-cycle prediction & reorder detection
- Visual search: Bedrock multimodal (Claude vision) + Rekognition for catalog matching
- Voice: Browser Web Speech API, Amazon Transcribe/Polly as fallback
- Data layer: DynamoDB (user profiles, preferences, cart/session state), S3 (images),
  OpenSearch (catalog + vector index)
- Notifications: SES / web push / SNS for proactive nudges
- Analytics (seller): Kinesis Firehose → S3 → Athena → QuickSight for Intent Gap dashboard
- Orchestration: Step Functions for multi-step flows (cart building pipeline)
- Build tooling: Kiro for spec-driven scaffolding

## DEMO DATA (use these for all mock/seeded content)
- Pincode for demo: 110001 (Central Delhi), ETA: 10 minutes
- Sample catalog categories: Snacks & Beverages, Dairy & Eggs, Fruits & Vegetables, 
  Personal Care, Baby Care, Health & Medicine, Electronics Accessories, Kitchen Essentials
- Sample demo conversations to keep working:
  1. "Movie night for 4 under ₹500" → cart with popcorn, chips, cola, nachos, dip
  2. "Best wireless earbuds under ₹2000 with good bass" → comparison card, 3 products
  3. "My toothpaste is almost over" → predictive reorder nudge
  4. "Plan a birthday party for 10 kids" → full kit, multiple categories
  5. "I have a fever" → Emergency Mode: health kit with meds, fluids, etc.

## DESIGN LANGUAGE
- Colors: Amazon Now uses orange (#FF9900) as primary. Keep that. 
  Nia's accent color: Deep Teal (#00838F) — signals AI/intelligence, contrasts orange.
- Nia's avatar: a small animated teal circle with a soft pulse when "thinking"
- Fonts: Amazon's standard web stack (Amazon Ember / system sans-serif)
- Tone of voice for Nia's responses: warm, direct, slightly playful, never robotic.
  Uses "I" naturally. Responds in the same language mix the user used.
- Rich response cards (not plain text): product tiles, comparison tables, mini-cart 
  summaries — all rendered as inline UI within the chat panel

## NON-FUNCTIONAL REQUIREMENTS
- Sub-2-second response time for Nia (most critical NFR — the whole pitch is speed)
- Mobile-first layout (most Indian quick-commerce usage is mobile web)
- Accessibility: WCAG 2.1 AA minimum
- No native app dependencies — pure web, works in any modern browser

## WHAT TO PRODUCE BY DEFAULT
Unless told otherwise, for every module:
1. Working TypeScript/React code (Next.js App Router conventions)
2. Tailwind for all styling (no separate CSS files unless complex animations)
3. Mock data inline (no real API calls unless building the actual integration)
4. Sensible component decomposition (small, reusable components)
5. Inline comments explaining non-obvious decisions
6. A brief "How to extend this to production" note at the end of each file

## IMPORTANT CONSTRAINTS
- This is a hackathon demo, so mock where needed but make it look and feel REAL
- Never build a native app — always web (Next.js)
- Always keep the Nia floating widget persistent across all pages
- Every AI response in the chat MUST render as a rich card, never plain text
- Demo flows must work end-to-end without live API keys (use mock tool responses)
```

---

## SECTION 1 — PHASE 1: FOUNDATION
### Module 1A — Web Shell & Landing Page

```
[CONTEXT: You are building Nia for Amazon Now. Use the master context above as your foundation.
This module covers: the main landing page of the amazon.in/now website.]

Build the main landing page (app/page.tsx) for the Amazon Now + Nia website.

## What this page contains (top to bottom):

### 1. TopBar
- Amazon Now logo (left), delivery location badge showing "Delivering to: 110001 · 10 min" (center), 
  account icon + cart icon with item count badge (right)
- Sticky, height ~56px, white background, subtle bottom border

### 2. Hero Section
- Large Nia input bar in the center: placeholder text rotates every 3 seconds through:
  "Movie night for 4 under ₹500..."
  "Best wireless earbuds under ₹2000..."  
  "Plan a birthday party for 10 kids..."
  "My toothpaste is almost over..."
  "I have a fever, what do I need?"
- Left of the input: a small teal Nia avatar icon with a soft pulse animation
- Right of the input: microphone icon button
- Below the input: 3 "quick start" chip buttons: "🎬 Movie night", "🎂 Party kit", "🚨 Emergency"
- Headline above: "Tell Nia what you need." Subheading: "Full cart. 10 minutes. Done."
- Background: clean white, no clutter

### 3. Emergency Mode Banner
- Full-width, bold orange-to-red gradient strip
- Text: "🚨 Emergency? Tap here — assembled kit + fastest delivery in 60 seconds"
- Clicking it navigates to /emergency

### 4. "For You" Predictive Reorder Row
- Section title: "Running low?" with a small AI sparkle icon
- Horizontally scrollable row of ProductReorderCards
- Each card shows: product image, name, "Running low" badge (amber), "Last ordered 12 days ago",
  a quantity selector, and a teal "+ Add" button
- Use 4 mock items: Amul Toned Milk 1L, Colgate Toothpaste 200g, Tata Salt 1kg, Bread (Britannia)

### 5. "Your Rituals" Row
- Section title: "Your usual orders" with a ⚡ icon
- Horizontally scrollable row of RitualCards
- Each card is a named bundle: "Monday Morning Routine", "Sunday Brunch", "Weekly Grocery Run"
- Each card shows: bundle name, item count, estimated total, last ordered date, 
  and a "Reorder · ₹XXX" one-click button
- Use 3 mock rituals with plausible items

### 6. Category Grid
- Section title: "Shop by category"
- 4-column grid (2-column on mobile): emoji + category name tiles
- Categories: 🛒 Groceries, 🥛 Dairy & Eggs, 🍎 Fruits & Veg, 🧴 Personal Care,
  👶 Baby Care, 💊 Health, ⚡ Electronics, 🍳 Kitchen
- Tapping a category navigates to /category/[slug]

## Technical notes:
- Use Next.js App Router (app/page.tsx)
- All components in components/ subfolder
- The hero input bar: clicking or typing in it should open the Nia chat panel 
  (the panel is a global state — use a Zustand store or React context called useNiaStore)
- Animate the placeholder rotation with a fade transition
- Keep it mobile-first; the hero bar should be full-width on mobile
- No live API calls — all data is from mock constants in lib/mockData.ts

After the code, write a 5-line "Production extension" note covering: 
how the For You row would connect to Amazon Personalize, and how the hero bar 
would fire a Bedrock Agent call on submit.
```

---

### Module 1B — Nia Chat Widget (Persistent Floating Panel)

```
[CONTEXT: You are building Nia for Amazon Now. Use the master context as your foundation.
This module covers: the persistent Nia chat widget that lives on every page.]

Build the Nia chat widget — a floating assistant that persists across all pages 
and is the core interaction surface of the product.

## Architecture
- A global Zustand store: useNiaStore
  - isOpen: boolean
  - messages: NiaMessage[]
  - isThinking: boolean
  - cartPreview: CartItem[] | null
  - comparisonPreview: ComparisonData | null
  - open() / close() / toggle() actions
  - addMessage(msg) action
  - setThinking(bool) action

- NiaMessage type:
  {
    id: string,
    role: 'user' | 'nia',
    content: string,
    type: 'text' | 'product_list' | 'comparison' | 'cart_summary' | 'emergency_kit' | 'reorder_nudge',
    data?: any,  // typed payload for rich renders
    timestamp: Date
  }

## Widget Structure (components/NiaWidget/)

### NiaTrigger (the floating button when closed)
- Fixed position: bottom-right (desktop), bottom-center (mobile)
- Teal circle (#00838F), ~56px, with Nia's avatar (a small "N" or waveform icon)
- Soft pulse animation when there's a proactive message
- Shows a small orange dot badge when Nia has a proactive nudge
- On click: opens the panel

### NiaPanel (the chat panel when open)
DESKTOP: slides in from the right as a fixed sidebar, ~420px wide, full viewport height, 
         overlays page content without navigating away, has a close (×) button
MOBILE:  slides up as a bottom drawer, ~85vh height, draggable to dismiss

### Panel Header
- Nia logo + name on left, "×" close button on right
- Below: a small status line "10 min delivery · 110001" with a green dot

### Messages Area (scrollable)
- User messages: right-aligned, dark gray bubble
- Nia messages: left-aligned, white card with a subtle teal left-border
- Between messages: subtle timestamps
- "Nia is thinking..." state: animated 3-dot pulse on the left
- Rich message renderers (each is a separate component):
  - ProductListCard: horizontal scroll of 2–4 product tiles 
    (image, name, price, ETA, "+ Add" button each)
  - ComparisonCard: side-by-side 2–3 column grid with spec rows, 
    a "Best pick" badge on one, and a "Why Nia recommends this" expandable section
  - CartSummaryCard: list of items with quantities and prices, running total, 
    "Add all to cart" primary button, and "Edit" link
  - EmergencyKitCard: kit name, item list, total price, 
    ETA in bold (e.g., "Arrives in ~12 min"), large "Order Now" button in orange
  - ReorderNudgeCard: "Your [product] runs out soon" with a small chart of 
    consumption cycle, quantity selector, "Add to cart" button

### Input Area (bottom)
- Text input with placeholder "Ask Nia anything... (Hindi/English)"
- Mic icon button (right of input) — on click, shows a recording UI overlay
- Send button
- Below input: 3 quick-chip suggestions that update contextually:
  Initial state: "Movie night for 4", "Compare earbuds", "I have a fever"
  After a cart is built: "Make it cheaper", "Add something sweet", "Checkout now"

## Interaction logic (mock, no real API yet)
Wire up a handleSend(message: string) function that:
1. Adds the user message to the store
2. Sets isThinking = true
3. After a 1.2-second simulated delay, routes to the right mock response:
   - If message includes "movie night" → CartSummaryCard with mock snacks cart
   - If message includes "earbuds" or "compare" → ComparisonCard with 3 mock earbuds
   - If message includes "fever" or "sick" or "medicine" → EmergencyKitCard (health)
   - If message includes "cheaper" or "budget" → ProductListCard with budget alternatives
   - Default → a plain text response: "I can help with that! Try asking me to build a cart,
     compare products, or plan for an occasion."
4. Sets isThinking = false, appends Nia's response

## Proactive message on first load
After a 4-second delay on page load (if the user hasn't opened Nia yet):
Show the orange badge on NiaTrigger, and pre-load this message into the store:
"Hey! Your Amul Milk and Colgate Toothpaste usually run out around this time. 
Want me to add them to a quick cart? 🛒"

## Technical notes:
- Zustand for state (npm install zustand)
- Framer Motion for panel slide-in animation (npm install framer-motion)
- The widget must be rendered in the root layout (app/layout.tsx) so it persists across pages
- Mobile: use CSS touch-action and a swipe-down gesture to close the drawer
- All rich card components go in components/NiaWidget/cards/
- The input should auto-focus when the panel opens

After the code, write a "Production extension" note on: 
how handleSend would be replaced by a streaming Bedrock Agent call, and how 
the routing logic becomes the agent's tool-use response.
```

---

## SECTION 2 — PHASE 1: CORE AI TOOLS
### Module 2A — Bedrock Agent Setup + Tool Definitions

```
[CONTEXT: You are building the AI backend for Nia on Amazon Now. 
Use the master context as your foundation.
This module covers: the Bedrock Agent configuration and all tool/action-group definitions.]

Build the Bedrock Agent configuration for Nia. This covers the agent's system prompt,
all tool definitions (action groups), and the API route that the frontend calls.

## Part 1: Agent System Prompt (lib/niaBrain/systemPrompt.ts)

Write a complete Bedrock Agent system prompt for Nia. It must:
- Establish Nia's persona: warm, fast, direct, bilingual (Hindi+English Hinglish), 
  never robotic, uses "I" naturally
- Explain Nia's job: understand shopping intent, use tools to fulfill it, 
  return structured rich responses
- Define response format: ALWAYS return a JSON object (not plain text) with shape:
  {
    type: 'product_list' | 'comparison' | 'cart_summary' | 'emergency_kit' | 'text' | 'reorder_nudge',
    message: string,           // Nia's conversational text
    data: <type-specific>,     // the rich payload
    confidence: number,        // 0–100 match confidence score
    reason: string             // one-line plain-English reason for the recommendation
  }
- Tell Nia to always call at least one tool before responding
- Tell Nia to respond in the same language mix the user used
- Tell Nia to be concise (max 2 sentences of text), the cards carry the content
- Tell Nia to always include a "Why I picked this" one-liner in the reason field
- Tell Nia to ask ONE clarifying question if intent is very ambiguous (not multiple)

## Part 2: Tool Definitions (lib/niaBrain/tools.ts)

Define all 8 Bedrock Agent action groups as TypeScript interfaces + JSON schema for the API:

1. search_catalog
   Input: { query: string, filters?: { category?, maxPrice?, minRating?, inStockOnly? } }
   Output: { products: Product[], totalFound: number }
   Description: "Semantic search over the product catalog. Use for any product discovery query."

2. compare_products  
   Input: { product_ids: string[], attributes?: string[] }
   Output: { comparison: ComparisonMatrix, bestPickId: string, bestPickReason: string }
   Description: "Compare 2–4 products on price, specs, ratings, and delivery ETA."

3. build_cart
   Input: { intent: string, constraints?: { maxTotal?, servings?, occasion?, dietary? } }
   Output: { items: CartItem[], totalPrice: number, totalETA: number }
   Description: "Build a complete cart from a natural-language intent. 
   Decomposes the intent into product categories, selects best items per category."

4. check_inventory_eta
   Input: { product_ids: string[], pincode: string }
   Output: { availability: { productId, inStock, eta_minutes, store }[] }
   Description: "Check real-time stock and delivery ETA from dark stores near a pincode."

5. get_user_profile
   Input: { user_id: string }
   Output: { name, preferences, dietary_restrictions, reorder_cycles, past_orders[] }
   Description: "Fetch user preferences, dietary info, and purchase history for personalization."

6. track_order
   Input: { order_id?: string, user_id?: string }
   Output: { orders: { id, status, eta, items[] }[] }
   Description: "Get current order status and ETA. Use order_id if known, else last order."

7. apply_substitution
   Input: { product_id: string, reason: string }
   Output: { original: Product, substitute: Product, matchScore: number }
   Description: "Find the best substitute for an out-of-stock or unsuitable product."

8. generate_emergency_kit
   Input: { category: EmergencyCategory, pincode: string, adult_count?: number }
   Output: { kit_name, items: CartItem[], totalPrice, maxETA_minutes, fastestStore }
   Description: "Assemble a pre-curated emergency kit for a given category and location. 
   Prioritize fastest-available items."
   EmergencyCategory enum: 'baby_care' | 'fever_illness' | 'surprise_guests' | 
   'tech_rescue' | 'kitchen_mishap' | 'period_care' | 'pet_emergency'

## Part 3: Mock Tool Handlers (lib/niaBrain/mockTools.ts)

Implement mock versions of all 8 tools that return realistic fake data.
Seed at least:
- 15 products across 4 categories (use real Indian product names: Amul, Britannia, 
  Colgate, boAt, Noise, JBL, Dettol, etc.)
- 3 complete emergency kits (fever_illness, baby_care, surprise_guests)
- 1 mock user profile (name: Priya Sharma, dietary: vegetarian, 
  reorder cycles: milk every 3 days, toothpaste every 38 days)

## Part 4: API Route (app/api/nia/route.ts)

Build a Next.js Route Handler that:
- POST /api/nia
- Accepts: { messages: NiaMessage[], userId: string, pincode: string }
- Orchestrates: system prompt + conversation history → Claude Sonnet (via Bedrock) → 
  tool calls → mock tool responses → final structured JSON response
- Returns: NiaMessage (the rich response object)
- For now: intercept tool calls and resolve them with mockTools.ts 
  (no real Bedrock call needed for demo — simulate the agent loop locally)
- Handles errors gracefully (returns a text message if something fails)
- Includes a streaming option flag (stream: boolean) — non-streaming for now, 
  streaming for production

After the code, write a "Production extension" note on:
replacing the mock tool handlers with real Bedrock Agent action group Lambda functions,
and enabling streaming responses for the chat widget.
```

---

### Module 2B — search_catalog Tool (Deep Implementation)

```
[CONTEXT: Nia for Amazon Now. See master context.
This module: deep implementation of the search_catalog tool — the most-used tool in Nia.]

Build a fully functional (demo-ready) search_catalog system.

## Part 1: Product Catalog (lib/catalog/products.ts)

Define the full TypeScript types:
Product {
  id: string
  name: string
  brand: string
  category: ProductCategory
  subcategory: string
  price: number               // in INR
  mrp: number                 // original price, for discount display
  unit: string                // "500g", "1L", "pack of 3", etc.
  rating: number              // 0–5
  reviewCount: number
  imageUrl: string            // use placeholder: "/images/products/[id].jpg"
  tags: string[]              // for semantic matching: ["healthy", "low-sugar", etc.]
  attributes: Record<string, string>  // {"Flavour": "Salted", "Type": "Chips", etc.}
  inStock: boolean
  eta_minutes: number         // delivery ETA from nearest dark store
  isOrganic?: boolean
  isVegetarian?: boolean
}

Seed 30 products across these categories (use real Indian brand names):
- Snacks (8 products): Lays, Kurkure, Haldiram's, Cornitos, Oreo, Parle-G, etc.
- Beverages (6 products): Pepsi, Sprite, Real juice, Amul Kool, Minute Maid, Bisleri
- Dairy (6 products): Amul Toned Milk, Amul Butter, Mother Dairy Curd, Britannia cheese
- Electronics Accessories (5 products): boAt earbuds, Noise earbuds, JBL earbuds, 
  Mi cable, Portronics charger
- Health & Medicine (5 products): Paracetamol (generic), Dettol, ORS sachets, 
  Vicks VapoRub, B Complex tablets

## Part 2: Search Engine (lib/catalog/searchEngine.ts)

Build a client-side semantic-ish search function:
searchCatalog(query: string, filters?: SearchFilters): SearchResult[]

It should handle:
1. Exact keyword match (name, brand, tags)
2. Fuzzy keyword match (handle typos: "earbuds" matches "earphones", 
   "chips" matches "crisps", "paracetamol" matches "crocin")
3. Constraint parsing from natural language:
   - "under ₹200" / "below 200" / "₹200 se kam" → maxPrice: 200
   - "best rated" / "top rated" → sort by rating desc
   - "fastest delivery" / "jaldi chahiye" → sort by eta_minutes asc
   - "vegetarian" → filter isVegetarian: true
4. Intent-to-category mapping:
   - "movie night" → ["Snacks", "Beverages"] (beverages AND snacks)
   - "sick" / "fever" / "cold" → ["Health & Medicine"]
   - "earbuds" / "headphones" / "music" → ["Electronics Accessories"]
5. Return results sorted by: relevance score * rating * (1/eta_minutes)
6. Add a matchReason string to each result: "Matches: 'bass', price under ₹2000, top rated"

## Part 3: Search Results UI Component (components/SearchResults/)

Build a SearchResultsCard component (used inside the Nia chat panel) that renders:
- A horizontal scrollable row of ProductTile components (for short lists ≤ 4 items)
- A vertical list with more detail (for longer lists > 4 items) 
- Each ProductTile: image, name, brand, price (with strikethrough MRP if discounted), 
  rating stars, ETA badge ("~10 min"), match reason chip, "+ Add" button
- An "Add all" button at the bottom if there are ≥ 3 items
- A "Why these?" collapsible section with Nia's plain-English reasoning

## Part 4: Integration test
Write a test file (lib/catalog/searchEngine.test.ts) with 10 test cases:
Include queries like: "movie night for 4", "best earbuds under ₹2000 with bass",
"sugar free snacks", "jaldi chahiye doodh", "healthy chips", "I have a fever"
Each test asserts: result count > 0, results contain relevant items, 
price filters are respected, sort order is correct.

After the code, write a "Production extension" note on:
replacing the client-side search engine with Amazon OpenSearch vector search 
using Titan embeddings for true semantic matching.
```

---

### Module 2C — compare_products Tool + Comparison UI

```
[CONTEXT: Nia for Amazon Now. See master context.
This module: the compare_products tool and the ComparisonCard UI component.]

Build the product comparison feature — one of Nia's most visible capabilities.

## Part 1: Comparison Engine (lib/comparisons/compareEngine.ts)

Function: compareProducts(productIds: string[], userQuery?: string): ComparisonResult

ComparisonResult type:
{
  products: Product[]
  attributes: ComparisonAttribute[]   // the rows of the comparison table
  bestPickId: string
  bestPickReason: string              // "Best overall: great bass, within budget, fastest delivery"
  confidenceScore: number             // 0–100
  userQueryContext?: string           // e.g., "focus: bass + budget under ₹2000"
}

ComparisonAttribute type:
{
  key: string          // "Price", "Rating", "Battery", "Delivery ETA"
  values: Record<productId, string>   // product ID → formatted value
  winner?: string      // productId of the best value (used to highlight cells)
  isHigherBetter: boolean
}

The engine must:
1. Extract attributes to compare based on category:
   - Electronics: Price, Rating, Battery Life, Driver Size, Connectivity, Warranty
   - Snacks: Price per gram, Calories, Rating, Flavors available
   - Dairy: Price per 100ml, Fat %, Shelf life, Rating
   - (define at least 3 category attribute maps)
2. For each attribute, determine the winner (highlight in UI)
3. Compute an overall score for each product:
   Score = weighted sum of normalized attribute values
   Weights adjust based on userQuery keywords:
   - "bass" → increase driver size weight
   - "cheap" / "budget" → increase price weight
   - "fast" / "jaldi" → increase ETA weight
   - "best rated" → increase rating weight
4. Pick the bestPickId (highest overall score)
5. Generate a bestPickReason string (2 sentences max)

## Part 2: ComparisonCard Component (components/NiaWidget/cards/ComparisonCard.tsx)

Render a rich comparison inside the Nia chat panel:

Layout:
- Header: "Comparing [N] products for: [userQuery]" with a confidence badge (e.g., "94% match")
- Product headers: a row with image, name, price, ETA badge for each product
  The "best pick" column has a teal "⭐ Nia's Pick" banner at top
- Attribute rows: left label, then one cell per product
  Each cell: formatted value, and if it's the winner for that row, 
  a subtle green background highlight
- "Why I recommend [Product Name]:" section at bottom — shows bestPickReason in a 
  light teal callout box with a Nia avatar icon
- Two buttons: "Add [Best Pick] to cart" (primary teal), "Compare differently" (ghost)
- "View full comparison" link → opens /compare?ids=id1,id2,id3 in a new tab

Mobile: the product columns scroll horizontally; attribute labels stay sticky left.

## Part 3: Dedicated Comparison Page (app/compare/page.tsx)

A full-page comparison view (linked from "View full comparison"):
- URL: /compare?ids=id1,id2,id3
- Same data as ComparisonCard but expanded:
  - Full spec table with all attributes
  - Customer review summary for each product (mock: "Users love the bass, some say 
    it's slightly uncomfortable after 2 hours")
  - Price history chart (mock: sparkline showing last 30 days)
  - Shareable link button (copies current URL to clipboard)
  - "Which one is right for me?" button — opens a Nia mini-quiz 
    (3 questions: budget priority? use case? portability?)
  - After quiz: Nia highlights the best match with a personalized reason

## Part 4: Trigger phrases (lib/comparisons/triggerDetector.ts)

Write a function detectComparisonIntent(message: string): ComparisonTrigger | null
that detects when a user wants a comparison:
- "compare X vs Y"
- "X ya Y, kaun sa loon?" (Hindi: "which should I buy?")
- "best [product type] under [price]" with multiple possible items
- "difference between X and Y"
Returns: { type: 'explicit_ids' | 'intent_based', query: string, productIds?: string[] }

After the code, write a "Production extension" note on:
how comparison attributes would be auto-populated from a product attribute graph,
and how bestPickReason would be generated by a Bedrock call with product data injected.
```

---

### Module 2D — build_cart Tool + Cart Summary UI

```
[CONTEXT: Nia for Amazon Now. See master context.
This module: the build_cart tool — the flagship feature that turns intent into a ready cart.]

Build the Smart Cart Builder — Nia's most impressive and differentiated capability.

## Part 1: Cart Builder Engine (lib/cart/cartBuilder.ts)

Function: buildCart(intent: string, constraints: CartConstraints): CartBuildResult

CartConstraints: {
  maxTotal?: number          // "under ₹500"
  servings?: number          // "for 4 people"
  occasion?: string          // "movie night", "birthday party", "sick day"
  dietary?: string[]         // ["vegetarian", "no-nuts", "sugar-free"]
  durationDays?: number      // "for the week" → 7
  exclude?: string[]         // previously rejected items
}

CartBuildResult: {
  items: CartItem[]
  categories: string[]       // which categories were included
  totalPrice: number
  totalETA: number           // max ETA across all items
  budgetUsed: number         // % of maxTotal used
  reasoning: string          // "Built for a 4-person movie night under ₹500: 
                             //  snacks (3 items), beverages (2 items), dips (1 item)"
  alternativeVersions: {     // optional variants
    label: string            // "Healthier version", "Budget version"  
    delta: CartItem[]        // items to swap
  }[]
}

CartItem: {
  product: Product
  quantity: number
  reason: string             // "Popular for movie nights", "Vegetarian-friendly"
}

The engine must:
1. Parse the occasion/intent into required categories:
   - "movie night" → snacks (primary), beverages (primary), dips/sauces (optional)
   - "birthday party for 10 kids" → snacks (large qty), beverages, cake/dessert, plates/cups
   - "sick day" / "fever" → medicine, ORS/fluids, light foods, personal care
   - "breakfast" → dairy (milk, eggs, butter), bread, cereal or fruit
   - "surprise guests" → snacks, beverages, quick-cook meals
2. For each required category: run search_catalog, pick best match(es) within budget
3. Allocate budget proportionally across categories (snacks 40%, beverages 30%, etc.)
4. Respect dietary constraints: filter out non-veg if vegetarian, nuts if nut-allergy, etc.
5. Adjust quantities based on servings count (scale linearly)
6. If budget is tight: prefer value picks; if no constraint: prefer highly rated items
7. Generate alternativeVersions: at minimum a "Healthier version" and "Budget version"

## Part 2: CartSummaryCard Component (components/NiaWidget/cards/CartSummaryCard.tsx)

A rich cart summary rendered inside the Nia chat panel:

Header: "Cart for [occasion]" with a teal sparkle icon
Subtitle: "[N] items · ₹[total] total · All delivered in ~[maxETA] min"

Items section: a clean list, each row:
  - Small product thumbnail
  - Name + brand
  - Quantity badge (e.g., "×2")
  - Price for this line
  - A tiny "reason chip": "🎬 Movie pick" / "🥗 Veg option" / "💸 Best value"

Below items:
  - Budget bar: a thin progress bar showing "₹[used] of ₹[max] budget"
  - Running total (bold)
  - Estimated delivery: "All items arrive in ~12 min"

Variant toggle: "Healthier 🥗 | Current | Budget 💸" — 3 tabs that swap the item list
  (using alternativeVersions data)

Action buttons:
  - "Add all to cart" (primary orange, full width) — adds all items and shows mini-cart
  - "Edit items" (secondary, ghost) — expands each item to show quantity controls + remove
  - "Modify cart" input (text input): "Add something, remove something, make it cheaper..."

Refinement flow: if user types in "Modify cart" input, it sends another message to Nia with 
the current cart as context (include currentCart in the next Bedrock call)

## Part 3: Multi-turn Refinement (lib/cart/refinementEngine.ts)

Function: refineCart(currentCart: CartBuildResult, refinement: string): CartBuildResult

Handle these refinement intents:
- "make it healthier" → swap snacks to lower-calorie alternatives, add ORS/water
- "cheaper options" / "budget kam karo" → find equivalent items at lower price points
- "add something sweet" → add a dessert item from snacks category
- "I'm allergic to [X]" → remove items containing X, find substitutes
- "more [product/category]" → add quantity or more items from that category
- "remove [item]" → remove specific item, rebalance budget
- "make it for [N] people instead" → scale all quantities

The function must return the updated CartBuildResult with a delta explanation:
{ ...updatedCart, refinementSummary: "Swapped Lay's with Baked Kurkure (40% less fat) 
  and replaced Pepsi with Real juice. Saved ₹15." }

After the code, write a "Production extension" note on:
how this engine would call a real Bedrock Agent, pass the current cart as context, 
and handle streaming so each item pops in progressively for a fast-feeling UX.
```

---

## SECTION 3 — PHASE 2: EMERGENCY MODE
### Module 3A — Emergency Mode Landing Page

```
[CONTEXT: Nia for Amazon Now. See master context.
This module: the Emergency Mode landing page (/emergency) — one of the key hero features.]

Build the Emergency Mode page — a dedicated high-stress, fast-decision UI.

## Design philosophy for this page
Users landing here are stressed. Design principles:
- ZERO cognitive load: no navigation, no browsing, no filters
- Maximum contrast, large tap targets (min 64px height on mobile)
- Speed is the only message: every kit shows ETA immediately
- Color coding by urgency type
- No text-heavy UI — icons + labels + one action per kit

## Part 1: Emergency Categories (lib/emergency/categories.ts)

Define 8 emergency categories with full metadata:

1. Baby Care 👶 (color: #4FC3F7 soft blue)
   - Trigger phrases: "baby", "infant", "diaper", "formula", "rash"
   - Kit: Pampers/Huggies diapers, baby formula, baby wipes, rash cream, gripe water
   
2. Fever & Illness 🤒 (color: #EF5350 soft red)
   - Trigger phrases: "fever", "sick", "cold", "headache", "body ache"
   - Kit: Paracetamol, Dettol, ORS sachets, Vicks, electrolyte drink, thermometer

3. Surprise Guests 🎉 (color: #FF9800 orange)
   - Trigger phrases: "guests", "party", "visitors", "mehman"
   - Kit: chips + dip, cookies, beverages mix (3 types), disposable cups, napkins

4. Tech Rescue ⚡ (color: #5C6BC0 indigo)
   - Trigger phrases: "charger", "cable", "battery", "dead phone"
   - Kit: Mi USB-C cable, Portronics power bank, screen wipes

5. Kitchen Mishap 🍳 (color: #26A69A teal)
   - Trigger phrases: "out of", "khatam", "no milk", "no oil", "no sugar"
   - Kit: depends on query — Amul butter, tata salt, sugar, cooking oil, bread

6. Period Care 🌸 (color: #EC407A pink)
   - Trigger phrases: "period", "cramps", "pads"
   - Kit: Whisper/Stayfree pads, Meftal Spas (pain relief), dark chocolate, 
     hot water bag, chamomile tea

7. Pet Emergency 🐾 (color: #8BC34A green)
   - Trigger phrases: "dog", "cat", "pet"
   - Kit: Pedigree adult dog food, pet wipes, Dettol (diluted safe for pets), 
     bandage roll

8. General Emergency ⚠️ (color: #FF7043 deep orange)
   - Catch-all for unclassified emergencies
   - Kit: bottled water, first aid kit, torch/batteries, phone charger

## Part 2: Emergency Page Layout (app/emergency/page.tsx)

### Header (full width, deep orange/red gradient)
- Large text: "🚨 What's the emergency?"
- Sub: "Tell us or tap below — assembled kit + order in 60 seconds"
- A prominent text input: "Describe your emergency..." with mic button
  On submit: auto-detect category using triggerPhrases, scroll to and highlight that kit

### Category Grid (main content)
- 2-column grid on mobile, 4-column on desktop
- Each EmergencyCategoryTile:
  - Background color: category.color at 15% opacity
  - Large emoji icon (center, ~48px)
  - Category name (bold, large)
  - ETA badge: "~10 min" in bold below the name
  - Number of items: "8 items"
  - On tap: expands inline OR navigates to /emergency/[category]

### Expanded Kit View (shown below the category tile on tap)
- Kit name + description (1 line)
- Item list: each item = small image + name + quantity + price
- Total price
- ETA: "Fastest available: ~8 min from [Store Name, CP]" 
- CTA: Large full-width "Order this kit — ₹XXX" button (orange, cannot be missed)
- Secondary: "Customize kit" link → opens Nia chat pre-loaded with this kit

### "What do you need?" input (sticky at bottom on mobile)
- Always visible input for voice/text description
- E.g.: typing "my baby has rash" → highlights Baby Care tile, shows kit inline

## Part 3: EmergencyKitCard Component  
(components/NiaWidget/cards/EmergencyKitCard.tsx)
*(Also used in the Nia chat panel when user says "I have a fever" etc.)*

- Kit type header with color-coded icon
- Item list (compact: image + name + qty)
- Total price
- ETA in bold: "Arrives in ~10 min"
- "Order Now" button (orange, large)
- "Add to cart instead" (smaller secondary link)

## Part 4: Auto-detection from Nia chat
In the Nia chat handleSend function, add emergency detection:
If message matches any category's trigger phrases:
→ Set response type as 'emergency_kit'
→ Call generate_emergency_kit(detected_category, userPincode)
→ Render EmergencyKitCard in the chat panel
→ Also add a small "Open Emergency Page" link

After the code, write a "Production extension" note on:
how ETA accuracy would improve with dark-store real-time inventory polling,
and how the "Order Now" button would trigger a one-step checkout with pre-filled payment.
```

---

## SECTION 4 — PHASE 2: PERSONALIZATION
### Module 4A — Predictive Reorder Row ("Running Low?")

```
[CONTEXT: Nia for Amazon Now. See master context.
This module: the predictive reorder feature — Nia proactively tells users they're running low.]

Build the consumption cycle prediction system and the "Running low?" UI row.

## Part 1: Consumption Cycle Engine (lib/personalization/consumptionEngine.ts)

Types:
OrderHistoryItem: { productId, productName, quantity, unit, orderDate, price }
ConsumptionCycle: { 
  productId, productName, 
  avgDaysBetweenOrders: number,
  lastOrderDate: Date, 
  estimatedQuantityPerDay: number,
  predictedRunOutDate: Date,
  daysUntilRunOut: number,
  confidence: 'high' | 'medium' | 'low',  // based on data points available
  alertThreshold: number   // days before runout to alert (default: 2)
}

Function: predictConsumption(orderHistory: OrderHistoryItem[]): ConsumptionCycle[]
Logic:
1. Group order history by productId
2. For each product with ≥ 2 orders: calculate average days between orders
3. From last order date + avgDaysBetweenOrders: predict next runout date
4. daysUntilRunOut = (predictedRunOutDate - today) in days
5. Confidence:
   - high: ≥ 4 data points, stdDev < 7 days
   - medium: 2-3 data points
   - low: 1 data point (estimate only)
6. Sort by daysUntilRunOut ascending (most urgent first)
7. Filter: only return items where daysUntilRunOut <= 7 (running low window)

Seed mock order history for the demo user (Priya Sharma):
- Amul Toned Milk 1L: ordered 12 days ago, 6 days ago (cycle: ~3 days)
- Colgate Toothpaste 200g: ordered 40 days ago (cycle: ~38 days, running low)
- Britannia Bread: ordered 5 days ago (cycle: ~4 days)
- Basmati Rice 5kg: ordered 30 days ago (cycle: ~60 days, not urgent)

## Part 2: ProductReorderCard Component (components/ReorderRow/ProductReorderCard.tsx)

A compact card for the "Running Low?" horizontal row on the homepage:

Layout (card ~180px wide, ~240px tall):
- Product image (top, ~80px height)
- Product name (truncated to 2 lines)
- Running low indicator:
  - A small colored pill: 
    🔴 "Almost out" (≤ 1 day)
    🟠 "Running low" (2-3 days)
    🟡 "Order soon" (4-7 days)
- "Last ordered [X] days ago"
- A mini consumption bar: thin progress bar showing "X% used (est.)"
- Quantity selector: minus/plus buttons with current value
- "+ Add to cart" button (teal, full width of card)
- Confidence indicator: small lock icon if high confidence, question mark if low

## Part 3: ReorderRow Component (components/ReorderRow/ReorderRow.tsx)

- Section title: "Running low? 📉" with Nia sparkle icon
- Subtitle: "Nia predicts based on your order history"
- Horizontally scrollable row of ProductReorderCards
- On the right side: a "See all predictions" link → opens Nia panel with 
  pre-loaded message "Show me everything I'm likely running low on"
- If no items in the running-low window: show a placeholder: 
  "You're well stocked! Nia will nudge you when it's time to reorder. 🎉"

## Part 4: Proactive Push System (lib/personalization/proactiveNudge.ts)

Function: getProactiveNudgeMessage(consumptionCycles: ConsumptionCycle[]): NiaMessage | null

Logic:
1. Find the most urgent item (lowest daysUntilRunOut)
2. If daysUntilRunOut ≤ 2: return a message with type 'reorder_nudge':
   "Hey Priya! 👋 Your Amul Milk usually runs out every 3 days — 
   you last ordered 3 days ago. Want me to add it to a quick cart?"
3. If 2 < daysUntilRunOut ≤ 4: return a softer nudge:
   "Just a heads up — your Colgate Toothpaste might run out in ~2 days. 
   Want me to add it to your next order? 🪥"
4. If daysUntilRunOut > 4: return null (no nudge yet)

This function is called in the Nia widget on page load (with a 4-second delay),
and sets the proactive orange badge on the NiaTrigger button.

## Part 5: ReorderNudgeCard Component (components/NiaWidget/cards/ReorderNudgeCard.tsx)

Rendered in the Nia chat panel when Nia sends a proactive reorder nudge:

- Product image + name
- "Based on your history, you reorder this every ~[N] days"
- A small sparkline chart (SVG, no library): shows dots for past order dates 
  on a timeline, with a projected future dot for "predicted runout"
- Quantity selector
- "Add to cart" button (orange)
- "Remind me tomorrow" button (ghost)
- "Don't remind me for this item" link (small, dismisses this item from predictions)

After the code, write a "Production extension" note on:
how Amazon Personalize's real-time event tracker would replace the manual 
consumption engine, and how ML-based cycle prediction would improve accuracy 
over the simple average approach.
```

---

### Module 4B — Reorder Rituals

```
[CONTEXT: Nia for Amazon Now. See master context.
This module: Reorder Rituals — named recurring order bundles that the system detects
or users create, available as one-click reorders.]

Build the Rituals feature.

## Part 1: Ritual Detection Engine (lib/rituals/ritualDetector.ts)

Types:
Ritual: {
  id: string
  name: string              // auto-generated or user-named
  icon: string              // emoji
  items: RitualItem[]
  estimatedTotal: number
  lastOrdered: Date
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom'
  nextSuggestedDate: Date
  autoNamed: boolean        // true if system named it, false if user named it
  orderCount: number        // how many times this bundle has been ordered
}

RitualItem: { product: Product, quantity: number }

Function: detectRituals(orderHistory: OrderHistoryItem[]): Ritual[]
Logic:
1. Sliding window (7 days): find product sets that appear together ≥ 2 times
2. If a co-occurring set has ≥ 3 products: create a Ritual
3. Auto-name based on:
   - Time of day of orders: "Morning" / "Evening" / "Late Night"
   - Day of week: "Monday", "Weekend"
   - Occasion inference: dairy + bread + eggs + juice → "Breakfast Run"
                         chips + cola + nachos → "Snack Time"
4. Compute nextSuggestedDate = lastOrdered + frequency interval
5. Sort by orderCount desc (most-used first)

Seed 3 mock rituals for Priya Sharma:
1. "Monday Morning Routine" 🌅: Amul Milk ×2, Britannia Bread ×1, Eggs ×6, Butter — ₹180
2. "Weekend Snack Box" 🍿: Lays ×2, Kurkure ×1, Pepsi 2L ×1, Oreo ×1 — ₹220
3. "Weekly Grocery Run" 🛒: Tata Salt, Sugar, Cooking Oil, Dals (3 types), Rice — ₹650

## Part 2: RitualCard Component (components/Rituals/RitualCard.tsx)

Compact card for the homepage rituals row (~200px wide):
- Large emoji icon (top center)
- Ritual name (bold)
- "X items · ₹[total]" (muted)
- "Last ordered: [N] days ago"
- "Reorder · ₹[total]" one-click button (orange)
- On hover/press: expand to show full item list as a tooltip/popover
- Optional edit icon: lets user rename the ritual or modify items

## Part 3: RitualsRow Component (components/Rituals/RitualsRow.tsx)
- Section header: "Your rituals ⚡" + "Saved bundles you keep coming back to"
- Horizontal scrollable row of RitualCards
- Last card: always a "+ Create new ritual" card (dashed border, plus icon)
  → On click: opens Nia with "Help me create a new ritual. I usually order [...]"
- "Manage rituals" link → /rituals page

## Part 4: Rituals Management Page (app/rituals/page.tsx)
Full page for managing rituals:
- List view of all rituals (expanded: show all items, edit/delete controls)
- "Reorder all rituals from this week" bulk action
- Create ritual from scratch: a form with name, icon picker, item search
- Import from order: "Turn a past order into a ritual" — dropdown of past orders

## Part 5: One-click Reorder Flow
When user taps "Reorder" on a RitualCard:
1. Add all items to cart (update cart state)
2. Show a confirmation toast: "✅ 6 items added! ₹220 total · Checkout now →"
3. Handle out-of-stock: if any item in the ritual is out of stock,
   show a substitution prompt via Nia: "Your usual Pepsi 2L is out. 
   Shall I swap it with Sprite 2L (same price)?"

After the code, write a "Production extension" note on:
how ritual detection would run server-side on order history stream events (Kinesis),
and how ML clustering would find non-obvious co-purchase patterns across millions of users.
```

---

## SECTION 5 — PHASE 2: SELLER CONSOLE
### Module 5A — Intent Gap Analytics Dashboard

```
[CONTEXT: Nia for Amazon Now. See master context.
This module: the Seller Console — specifically the Intent Gap Analytics dashboard 
that shows sellers what customers are asking for but can't find.]

Build the Seller Console: Intent Gap Analytics.

## What is an "intent gap"?
An intent gap occurs when a customer types a specific request into Nia 
(e.g., "sugar-free protein bar under ₹300") and Nia cannot find a matching 
product in the catalog. These unmatched queries represent:
1. Products that exist but aren't listed (opportunity for sellers)
2. Products that are listed but with poor keywords/attributes (fixable)
3. Genuine market gaps (demand Nia can't serve → competitor wins)

## Part 1: Mock Intent Gap Data (lib/seller/mockIntentGaps.ts)

Generate 20 realistic intent gap records:

IntentGap: {
  id: string
  query: string              // what the customer typed
  category: string           // inferred category
  frequency: number          // how many unique users asked this in last 7 days
  trend: 'rising' | 'stable' | 'falling'
  trendDelta: number         // % change week-over-week
  avgMaxPrice: number        // average max price from queries ("under ₹X")
  timeDistribution: number[] // [0-6am, 6-12pm, 12-6pm, 6-12am] search counts
  topPincodes: string[]      // where these searches are coming from
  closestExistingProduct?: { id: string, name: string, matchScore: number }
                             // best partial match in catalog (if any)
  gapType: 'no_listing' | 'poor_keywords' | 'price_mismatch' | 'out_of_stock'
}

Sample entries to include:
- "sugar-free protein bar under ₹300" — 1,247 searches, rising +34%, category: Health
- "organic baby food pouch" — 892 searches, rising +67%, category: Baby Care
- "noise cancelling earbuds under ₹1500" — 2,100 searches, stable, category: Electronics
- "homemade-style dal makhani ready-to-eat" — 445 searches, rising +210%, category: Ready Food
- "bamboo toothbrush" — 334 searches, rising +89%, category: Personal Care
- "zero-sugar energy drink" — 1,680 searches, falling -12%, category: Beverages
- (add 14 more plausible entries)

## Part 2: Seller Console Layout (app/seller/page.tsx)

This is a login-gated page (mock auth: a hardcoded "seller@example.com" check).

### Sidebar Navigation
- Dashboard (home)
- Intent Gaps (active on this page)
- My Listings
- Optimization Chat
- Analytics

### Intent Gap Dashboard (main content)

#### Summary Cards Row (4 metrics):
1. "Unmet queries this week" — bold number (e.g., 4,231) + "↑ 12% from last week"
2. "Potential revenue opportunity" — e.g., "₹8.4L" (estimated based on avg order value)
3. "Gaps you can fill" — e.g., "14 gaps match your category: Electronics"
4. "Your listing match score" — "62% of Nia's recommendations show your products"

#### Filter Bar:
- Category dropdown (All / Electronics / Health / Baby Care / etc.)
- Gap type filter: All / No Listing / Poor Keywords / Price Mismatch / Out of Stock
- Trend filter: All / Rising / Stable / Falling
- Sort: Most Searches / Fastest Growing / Highest Revenue Potential

#### Intent Gap Table:
Columns: Query | Category | Weekly Searches | Trend | Avg Max Price | Gap Type | Action

Each row:
- Query: the customer's exact text (monospace or highlighted)
- Category: color-coded badge
- Weekly Searches: bold number + mini sparkline (last 4 weeks trend SVG)
- Trend: arrow icon + % change (green for rising, red for falling)
- Avg Max Price: e.g., "under ₹280 avg"
- Gap Type: colored badge 
  - "No listing" (red): nobody sells this
  - "Poor keywords" (amber): you might have it but Nia can't find it
  - "Price mismatch" (orange): product exists but over the stated budget
  - "Out of stock" (gray): product exists, but empty
- Action button:
  - "No listing" → "Create listing" → navigates to /seller/listing/new?query=[query]
  - "Poor keywords" → "Fix listing" → navigates to /seller/optimization?query=[query]
  - "Price mismatch" → "Adjust price" 
  - "Out of stock" → "Restock now"

#### Expanded Row (on click):
- Customer quotes: 3 verbatim (anonymized) queries from real customers
- Time distribution chart: when during the day people search this
- Top locations: "70% from South Delhi, 18% from Gurugram"
- "What Nia currently shows them" — the closest product Nia found + its match score
- "Recommended listing attributes" — what attributes/keywords to include to win this query

## Part 3: Optimization Chat (app/seller/optimization/page.tsx)

A Nia-powered chat interface for sellers to improve their listings:

System prompt for this Nia instance (different from the shopper Nia):
"You are a listing optimization assistant for Amazon Now sellers. 
Help sellers improve their product titles, descriptions, search tags, and attributes 
based on what customers actually search for. Be specific, actionable, and data-driven.
Always reference the intent gap data provided. Respond in clear bullet points."

The page:
- Left panel: the seller's current listing (mock data: title, description, attributes)
- Right panel: Nia chat for this seller
- Pre-loaded first message: "I see you're looking at your [Category] listings. 
  This week, 1,247 customers searched for 'sugar-free protein bar under ₹300' 
  and couldn't find a match. Let's fix your title and tags to capture them. 
  Want me to start with a suggested title rewrite?"
- The chat suggests specific improvements based on the query data

After the code, write a "Production extension" note on:
how the Intent Gap pipeline would work in production (Kinesis Firehose streaming 
unmatched queries → S3 → Athena aggregation → QuickSight + custom dashboard API),
and how "fix keywords" automation would push listing updates directly via the 
Seller Central API.
```

---

## SECTION 6 — PHASE 3: POLISH & DEMO
### Module 6A — Demo Flows & End-to-End Testing

```
[CONTEXT: Nia for Amazon Now. See master context.
This module: wire up 5 complete demo flows, ensure they work end-to-end in the browser,
and add any missing polish before the demo recording.]

## Task: Wire up these 5 demo flows and confirm they work E2E

### Demo Flow 1: "Movie night for 4 under ₹500"
Start: Homepage → user types "Movie night for 4 under ₹500" in the hero bar
Steps:
1. Hero bar click → Nia panel opens with the message pre-filled
2. Nia thinks (1.2s animated dots) → returns CartSummaryCard
3. Cart: popcorn (Haldiram's), Lays Salted ×2, Pepsi 2L, Kurkure Peri Peri, salsa dip
4. Total: ₹348 (within ₹500 budget — budget bar shows 69% used)
5. User types: "Make it a bit healthier" → Nia refines: swaps chips to baked variety, 
   adds Real juice — shows refinement summary
6. User clicks "Add all to cart" → toast notification, cart icon updates count
Confirm all 6 steps render correctly and transitions are smooth.

### Demo Flow 2: "Best wireless earbuds under ₹2000 with good bass"
Start: User types in Nia panel (already open from flow 1, or fresh open)
Steps:
1. Nia returns ComparisonCard with 3 earbuds (boAt, Noise, JBL or similar)
2. "Nia's Pick" badge on boAt Airdopes (best bass + best value at ₹1,799)
3. Confidence: 91% match badge visible
4. User taps "Why Nia recommends this" → expands reason section
5. User taps "View full comparison" → opens /compare?ids=... in new tab
6. Full comparison page shows with all attributes, review summary, share button
Confirm all 6 steps work.

### Demo Flow 3: Proactive nudge → reorder
Start: Fresh page load (simulate 4-second delay)
Steps:
1. After 4 seconds: orange badge appears on NiaTrigger button
2. User clicks Nia button → panel opens with the proactive message already shown:
   "Hey Priya! Your Amul Milk usually runs out every 3 days — you ordered 3 days ago."
3. ReorderNudgeCard shows: milk image, consumption sparkline, quantity selector (default ×2), 
   "Add to cart" button
4. User clicks "Add to cart" → cart updates, Nia responds:
   "Done! 2× Amul Toned Milk added. Anything else running low?"
Confirm all 4 steps work.

### Demo Flow 4: Emergency Mode — "I have a fever"
Start: User types "I have a fever, I need help" in Nia panel
Steps:
1. Nia detects emergency → returns EmergencyKitCard (Fever & Illness)
2. Card shows: Paracetamol, ORS sachets, Vicks, electrolyte drink, thermometer
3. Total: ₹285, ETA: ~10 min, bold red "Urgent" badge
4. "Order Now" button prominent
5. Below: "Open Emergency Page for more options" link → /emergency
6. User opens /emergency → page loads, Fever & Illness tile highlighted/auto-expanded
Confirm all 6 steps work.

### Demo Flow 5: Seller Console — spotting an intent gap
Start: /seller (mock login as seller@example.com)
Steps:
1. Dashboard loads with 4 summary cards
2. User sees "sugar-free protein bar under ₹300" — 1,247 searches, rising 34%
3. User clicks on the row → expanded view shows customer quotes, time distribution
4. User clicks "Fix listing" → navigates to /seller/optimization
5. Nia seller chat pre-loads: "Let's optimize your listing to capture 1,247 weekly searches..."
6. User sends: "What title should I use?" → Nia responds with 3 title options
Confirm all 6 steps work.

## Polish checklist (fix any of these that are broken or missing):
- [ ] Page transitions: smooth, no white flash between routes
- [ ] Nia panel: persists open when navigating between pages (state preserved)
- [ ] Mobile: test all 5 flows on 375px viewport — all buttons must be tappable (≥ 44px)
- [ ] Loading states: every Nia response has 1.2s delay + thinking animation
- [ ] Empty states: all lists have friendly empty states (no blank screens)
- [ ] Error state: if Nia API call "fails," show: "Oops, I'm having trouble connecting. 
     Try again?" with a retry button
- [ ] Cart persistence: cart count in TopBar updates when items are added
- [ ] Responsive: no horizontal scroll on mobile (375px)
- [ ] Animations: panel open/close should feel snappy (~200ms)
- [ ] Typography: product names truncate cleanly at 2 lines (no overflow)

## Final task: Demo script README
Write a README_DEMO.md file with:
1. How to run the project locally (npm install, npm run dev)
2. The 5 demo flows (with exact text to type in Nia for each)
3. The seller console demo path
4. Known limitations (no live API, mock data, etc.)
5. Architecture diagram (ASCII art of: Browser → Next.js → Mock Agent → Mock Tools)
```

---

## QUICK REFERENCE — Module Dependency Order

```
Send in this order for a clean build:

Phase 0:  Master Context (this document, Section 0) ← ALWAYS SEND FIRST
Phase 1A: Web Shell & Landing Page
Phase 1B: Nia Chat Widget
Phase 2A: Bedrock Agent Setup + Tool Definitions
Phase 2B: search_catalog Deep Implementation
Phase 2C: compare_products Tool + Comparison UI
Phase 2D: build_cart Tool + Cart Summary UI
Phase 3A: Emergency Mode Landing Page
Phase 4A: Predictive Reorder Row
Phase 4B: Reorder Rituals
Phase 5A: Seller Console — Intent Gap Dashboard
Phase 6A: Demo Flows & Polish

Each module is self-contained — but the full chain
builds a shippable, demo-ready product.
```

---

*Nia prompt guide · v1.0 · Built for the Amazon Now AI hackathon · 48-hour build track*
