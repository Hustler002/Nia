# MODULE 7 — Full Integration + Real User Simulation
### The "connect everything" phase. Run this after all previous modules are built.

---

## What this module does

Every previous module was built in isolation. That means:
- Types are probably defined in 4–5 different files with slight mismatches
- Zustand stores might be duplicated or conflicting
- "Add to cart" in CartSummaryCard probably doesn't update the TopBar badge
- Nia's API response format might not exactly match what the card renderers expect
- Navigation links might go to routes that exist but render nothing
- The Nia widget might lose state when the user navigates between pages
- Mobile layout might break at specific component boundaries

This module fixes all of that. It is a three-stage process:
Stage 1 → Audit & consolidate (types, stores, contracts)
Stage 2 → Wire every connection (navigation, data flow, events)
Stage 3 → Simulate real users (6 complete journeys, verified step by step)

---

```
[CONTEXT: You are integrating the Nia for Amazon Now project.
All individual modules (1A through 5B) have been built separately.
Your job now is to make them work together as a single, cohesive product.

Do NOT rewrite modules from scratch. Audit what exists, identify mismatches,
and make the minimal changes needed to connect everything correctly.
When you find a conflict (e.g., two different NiaMessage type definitions),
pick the most complete one, move it to the canonical location, and update imports.

Work through this prompt in strict stage order. Complete each stage fully
before moving to the next. At the end of each stage, state what was fixed
and what (if anything) was intentionally left as a known limitation.]

---

## ════════════════════════════════════════
## STAGE 1: AUDIT & CONSOLIDATE
## ════════════════════════════════════════

Before writing a single line of new code, do a full audit.
Read every file in the project. Build a mental map of:
- What types exist, where they're defined, where they conflict
- What Zustand stores exist and whether they overlap
- What the /api/nia response shape actually is vs what the widget expects
- What navigation links exist and where they point

### Step 1.1 — Create the canonical type file

Create: types/index.ts
This is the single source of truth for ALL shared types in the project.
Every other file must import from here. After creating it, find and remove
all duplicate type definitions from other files and replace with imports.

Types to define (consolidate from all modules, use the most complete version found):

// ─── User & Auth ───────────────────────────────
export interface SellerProfile { ... }
export interface UserProfile {
  id: string
  name: string
  preferences: string[]
  dietary_restrictions: string[]
  reorder_cycles: ReorderCycle[]
  past_orders: PastOrder[]
  pincode: string
  avatarInitials: string
}

// ─── Product Catalog ───────────────────────────
export type ProductCategory =
  | 'Snacks' | 'Beverages' | 'Dairy' | 'Electronics'
  | 'Health' | 'Baby Care' | 'Personal Care' | 'Kitchen'

export interface Product {
  id: string
  name: string
  brand: string
  category: ProductCategory
  subcategory: string
  price: number
  mrp: number
  unit: string
  rating: number
  reviewCount: number
  imageUrl: string
  tags: string[]
  attributes: Record<string, string>
  inStock: boolean
  eta_minutes: number
  isVegetarian?: boolean
  isOrganic?: boolean
}

// ─── Cart ──────────────────────────────────────
export interface CartItem {
  product: Product
  quantity: number
  reason?: string
}

export interface Cart {
  items: CartItem[]
  totalPrice: number
  totalETA: number
  lastUpdated: Date
}

// ─── Nia Messages ──────────────────────────────
export type NiaMessageType =
  | 'text'
  | 'product_list'
  | 'comparison'
  | 'cart_summary'
  | 'emergency_kit'
  | 'reorder_nudge'

export interface NiaMessage {
  id: string
  role: 'user' | 'nia'
  type: NiaMessageType
  content: string           // Nia's conversational text (shown above the card)
  data: NiaMessageData | null
  confidence?: number
  reason?: string
  timestamp: Date
}

// Discriminated union for type-safe data payloads
export type NiaMessageData =
  | { kind: 'product_list';    products: Product[] }
  | { kind: 'comparison';      comparison: ComparisonResult }
  | { kind: 'cart_summary';    cart: CartBuildResult }
  | { kind: 'emergency_kit';   kit: EmergencyKit }
  | { kind: 'reorder_nudge';   items: CartItem[]; cycles: ReorderCycle[] }

// ─── Comparison ────────────────────────────────
export interface ComparisonAttribute {
  key: string
  values: Record<string, string>
  winner?: string
  isHigherBetter: boolean
}

export interface ComparisonResult {
  products: Product[]
  attributes: ComparisonAttribute[]
  bestPickId: string
  bestPickReason: string
  confidenceScore: number
  userQueryContext?: string
}

// ─── Cart Build ────────────────────────────────
export interface CartBuildResult {
  items: CartItem[]
  categories: string[]
  totalPrice: number
  totalETA: number
  budgetUsed?: number
  reasoning: string
  alternativeVersions?: { label: string; delta: CartItem[] }[]
}

// ─── Emergency ─────────────────────────────────
export type EmergencyCategory =
  | 'baby_care' | 'fever_illness' | 'surprise_guests'
  | 'tech_rescue' | 'kitchen_mishap' | 'period_care' | 'pet_emergency'

export interface EmergencyKit {
  category: EmergencyCategory
  kit_name: string
  emoji: string
  color: string
  items: CartItem[]
  totalPrice: number
  maxETA_minutes: number
  fastestStore: string
}

// ─── Personalization ───────────────────────────
export interface ReorderCycle {
  productId: string
  productName: string
  avgDays: number
  lastOrderDate: string
  daysUntilRunOut: number
  confidence: 'high' | 'medium' | 'low'
}

export interface Ritual {
  id: string
  name: string
  icon: string
  items: CartItem[]
  estimatedTotal: number
  lastOrdered: Date
  frequency: 'daily' | 'weekly' | 'monthly'
  orderCount: number
}

// ─── Seller ────────────────────────────────────
export interface IntentGap {
  id: string
  query: string
  category: string
  frequency: number
  trend: 'rising' | 'stable' | 'falling'
  trendDelta: number
  avgMaxPrice: number
  gapType: 'no_listing' | 'poor_keywords' | 'price_mismatch' | 'out_of_stock'
  topPincodes: string[]
}

// ─── API Contract ──────────────────────────────
// Shape of POST /api/nia request
export interface NiaAPIRequest {
  messages: NiaMessage[]
  userId: string
  pincode: string
  stream?: boolean
}

// Shape of POST /api/nia response (what the route returns)
// This MUST match what the widget expects
export interface NiaAPIResponse {
  type: NiaMessageType
  message: string           // Nia's text (maps to NiaMessage.content)
  data: NiaMessageData | null
  confidence: number
  reason: string
}

After creating types/index.ts, scan EVERY file in the project.
Replace all inline type definitions that duplicate these with imports:
import type { Product, NiaMessage, CartItem, ... } from '@/types'

### Step 1.2 — Consolidate Zustand stores

Audit all Zustand store files in the project. There are likely to be:
- useNiaStore (in components/ or lib/stores/)
- useCartStore (might be local state in CartSummaryCard instead of a real store)
- useUserStore (might not exist at all — user might be hardcoded in each file)
- useSellerAuthStore (in lib/seller/)

Consolidate into these 3 canonical stores in lib/stores/:

FILE: lib/stores/useNiaStore.ts
{
  isOpen: boolean
  messages: NiaMessage[]
  isThinking: boolean
  hasProactiveMessage: boolean
  open: () => void
  close: () => void
  toggle: () => void
  addMessage: (msg: NiaMessage) => void
  setThinking: (val: boolean) => void
  setProactive: (val: boolean) => void
  clearMessages: () => void
  sendMessage: (text: string, userId: string, pincode: string) => Promise<void>
  // sendMessage handles the full API call cycle:
  // 1. addMessage (user) 2. setThinking(true) 3. POST /api/nia
  // 4. addMessage (nia response) 5. setThinking(false)
}

FILE: lib/stores/useCartStore.ts
{
  items: CartItem[]
  isOpen: boolean               // mini cart drawer open/closed
  addItem: (item: CartItem) => void
  addItems: (items: CartItem[]) => void   // for "Add all to cart"
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, qty: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  totalItems: number            // computed: sum of all quantities
  totalPrice: number            // computed: sum of all line prices
}

FILE: lib/stores/useUserStore.ts
{
  user: UserProfile | null
  pincode: string
  setUser: (user: UserProfile) => void
  setPincode: (pincode: string) => void
}
Initialize with Priya Sharma's mock profile on app load (in root layout).
Pincode default: '110001'

After creating these, delete any duplicate store files and update all imports.

### Step 1.3 — Audit the API contract

The most critical integration point is the handshake between:
  the Nia widget (what it sends to /api/nia and what it expects back)
  the API route (what it receives and what it returns)
  the card renderer (what data shape it needs to render)

Verify this chain is consistent:

A) Widget sends POST /api/nia with body: NiaAPIRequest ✓
B) API route reads the body and returns: NiaAPIResponse ✓
C) Widget receives NiaAPIResponse and converts it to NiaMessage:
   {
     id: crypto.randomUUID(),
     role: 'nia',
     type: response.type,          // maps directly
     content: response.message,    // 'message' → 'content'  ← COMMON MISMATCH
     data: response.data,
     confidence: response.confidence,
     reason: response.reason,
     timestamp: new Date()
   }
D) Message renderer checks msg.type and renders the right card:
   'product_list'  → <ProductListCard data={msg.data} />
   'comparison'    → <ComparisonCard data={msg.data} />
   'cart_summary'  → <CartSummaryCard data={msg.data} />
   'emergency_kit' → <EmergencyKitCard data={msg.data} />
   'reorder_nudge' → <ReorderNudgeCard data={msg.data} />
   'text'          → <p>{msg.content}</p>

Fix any mismatches found. The most common bug: API returns `message` but
widget looks for `content`. Standardize on the NiaAPIResponse shape defined above.

### Step 1.4 — Build the canonical message renderer

Create: components/NiaWidget/NiaMessageRenderer.tsx

This is a single component that takes one NiaMessage and renders it correctly.
All rendering logic lives here — not scattered across the widget.

export function NiaMessageRenderer({ msg }: { msg: NiaMessage }) {
  if (msg.role === 'user') return <UserBubble text={msg.content} />

  return (
    <div className="nia-message">
      {msg.content && <NiaTextBubble text={msg.content} />}
      {msg.type === 'product_list'  && msg.data && <ProductListCard  data={msg.data} />}
      {msg.type === 'comparison'    && msg.data && <ComparisonCard   data={msg.data} />}
      {msg.type === 'cart_summary'  && msg.data && <CartSummaryCard  data={msg.data} />}
      {msg.type === 'emergency_kit' && msg.data && <EmergencyKitCard data={msg.data} />}
      {msg.type === 'reorder_nudge' && msg.data && <ReorderNudgeCard data={msg.data} />}
      {msg.confidence && <ConfidenceBadge score={msg.confidence} reason={msg.reason} />}
    </div>
  )
}

---

## ════════════════════════════════════════
## STAGE 2: WIRE EVERY CONNECTION
## ════════════════════════════════════════

Now wire every interaction point in the app. Go file by file.

### Step 2.1 — Root Layout (app/layout.tsx)

The root layout is the backbone. It must:

1. Wrap everything in a Providers component that initializes all stores:
   <UserStoreInitializer />   ← sets Priya Sharma profile on mount
   <NiaProactiveScheduler />  ← fires the proactive nudge after 4s
   The NiaWidget component (floating, always visible on consumer pages)

2. NOT show the Nia widget on /seller/* routes (sellers don't need it)
   Use usePathname() to conditionally render:
   const isSellerRoute = pathname.startsWith('/seller')
   {!isSellerRoute && <NiaWidget />}

3. Import and apply global styles. Ensure Tailwind base is loaded.

4. Set up the cart toast notification system (a global toast provider).
   When items are added to cart anywhere in the app, a toast appears:
   "✅ [N] items added · ₹[total] · View cart →"
   Use a simple Zustand-driven toast (not a third-party library).

FILE: components/providers/UserStoreInitializer.tsx
A 'use client' component that calls useUserStore.setUser(MOCK_PRIYA_PROFILE)
inside a useEffect on mount. Import MOCK_PRIYA_PROFILE from lib/mockData.ts.

FILE: components/providers/NiaProactiveScheduler.tsx
A 'use client' component that:
- Reads useNiaStore.hasProactiveMessage
- After 4 seconds (setTimeout in useEffect), if Nia panel is not open:
  1. Calls useNiaStore.setProactive(true) → shows orange badge on NiaTrigger
  2. Adds the proactive message to the store (does NOT open the panel)

### Step 2.2 — TopBar wiring (components/layout/TopBar.tsx)

The TopBar must read live data from stores:

Cart badge:
  const { totalItems } = useCartStore()
  Show badge only when totalItems > 0
  Animate badge: when totalItems changes, briefly scale up (CSS transition)

User avatar:
  const { user } = useUserStore()
  Show user.avatarInitials in the avatar circle
  On click: show a dropdown with name, "My Orders", "Settings", "Sign out"

Location/ETA:
  const { pincode } = useUserStore()
  Show "Delivering to: {pincode} · 10 min"
  Make pincode clickable → opens a pincode change modal (simple input + "Update" button
  that calls useUserStore.setPincode())

Nia trigger button (in TopBar on mobile, floating widget on desktop):
  On click: useNiaStore.open()

### Step 2.3 — Landing Page wiring (app/page.tsx)

Hero bar:
  Clicking or typing in the hero input → useNiaStore.open()
  If user types text and presses Enter / clicks Send:
    → useNiaStore.open()
    → useNiaStore.sendMessage(inputText, user.id, user.pincode)
  Quick-start chips ("🎬 Movie night", "🎂 Party kit", "🚨 Emergency"):
    "Movie night" → open Nia + sendMessage("Movie night for 4 under ₹500")
    "Party kit"   → open Nia + sendMessage("Birthday party for 10 kids")
    "Emergency"   → navigate to /emergency (do NOT open Nia)

Reorder Row (Module 4A):
  Each "+ Add" button → useCartStore.addItem({ product, quantity: selected })
  → triggers cart toast

Rituals Row (Module 4B):
  "Reorder · ₹XXX" button → useCartStore.addItems(ritual.items)
  → triggers cart toast
  If any ritual item is out of stock:
    → open Nia + sendMessage("One item in my [ritual name] is out of stock, 
       what can you substitute?")

Category tiles:
  Each tile → navigate to /category/[slug]
  Create a minimal app/category/[slug]/page.tsx if it doesn't exist:
    Show a heading "[Category] Products"
    Run searchCatalog(slug) and show ProductListCard results
    "Ask Nia about [category]" button → open Nia widget

Emergency banner:
  → navigate('/emergency')

### Step 2.4 — Nia Widget wiring (components/NiaWidget/)

The widget's sendMessage function must be wired end-to-end:

async function sendMessage(text: string) {
  // Uses the store action which handles everything:
  await niaStore.sendMessage(text, user.id, user.pincode)
}

The sendMessage store action:
  1. Create and add user message to store
  2. setThinking(true)
  3. const response = await fetch('/api/nia', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({
         messages: niaStore.messages,
         userId: user.id,
         pincode: user.pincode
       })
     })
  4. const niaMsgData: NiaAPIResponse = await response.json()
  5. Convert to NiaMessage and addMessage
  6. setThinking(false)
  7. On fetch error: addMessage with type 'text', content: 
     "Oops, having trouble connecting. Try again? 🙏"

Card action wiring inside the widget:
  CartSummaryCard "Add all to cart" button:
    → useCartStore.addItems(data.cart.items)
    → close Nia panel (optional, improves UX)
    → show cart toast

  ComparisonCard "Add [best pick] to cart":
    → useCartStore.addItem({ product: bestPick, quantity: 1 })

  EmergencyKitCard "Order Now":
    → useCartStore.addItems(data.kit.items)
    → navigate('/checkout') or show toast "Items added — proceed to checkout →"

  ProductListCard individual "+ Add":
    → useCartStore.addItem({ product, quantity: 1 })

  ComparisonCard "View full comparison":
    → open new tab: /compare?ids=[product_ids.join(',')]

  CartSummaryCard "Modify cart" input:
    → sendMessage(inputText)  ← feeds back into Nia with cart context

### Step 2.5 — Emergency Mode wiring (app/emergency/page.tsx)

Text input at top ("What's the emergency?"):
  On submit: detect category from triggerPhrases (lib/emergency/categories.ts)
  Auto-scroll to matched category tile
  Expand matched tile inline
  If category can't be detected: open Nia panel with the text pre-loaded

Category tile "Order this kit" button:
  → useCartStore.addItems(kit.items)
  → navigate to /checkout or show cart toast

"Customize kit" link:
  → useNiaStore.open()
  → sendMessage("Help me customize the [category] emergency kit")

### Step 2.6 — Comparison Page wiring (app/compare/page.tsx)

Read product IDs from URL: useSearchParams().get('ids')?.split(',')
Run compareProducts(productIds) on mount
"Add [Best Pick] to cart" → useCartStore.addItem(...)
"Share comparison" → navigator.clipboard.writeText(window.location.href)
  → show toast: "Link copied! Share it with anyone 📋"
"Which one is right for me?" quiz:
  On completion → open Nia in sidebar mode with result:
  "Based on your answers, [product] is the best match for you because [reason]."

### Step 2.7 — Seller Console wiring (app/seller/ routes)

Auth guard must be active on all /seller/* routes except /seller/login and /seller/signup.
Verify useSellerAuthStore persists auth in sessionStorage (not just memory).

Sidebar active state:
  Use usePathname() to set the active nav item.
  active item = teal background + left border indicator.

Intent Gaps → Optimization Chat handoff:
  "Fix listing" / "Optimize with Nia" buttons must pass the query as a URL param:
  navigate('/seller/optimization?query=sugar-free+protein+bar+under+₹300')
  On the Optimization Chat page, read this param:
  const query = useSearchParams().get('query')
  Pre-load Nia's first message referencing this query.

Dashboard → Intent Gaps deep link:
  "View Intent Gaps" quick action → /seller/intent-gaps (not /seller/intent-gaps)
  Verify this route is spelled consistently across all files.
  (Common bug: some files use /seller/intent-gaps, others use /seller/intentgaps)

Analytics time range selector:
  When user changes "Last 7 days / 30 days / 90 days":
  The chart data must visibly change (different numbers per range).
  Use a switch/case on the selected range to return different mock data sets.
  Do NOT show the same chart for all three ranges — judges will click this.

### Step 2.8 — Mini Cart (MiniCart component)

If not already built, create: components/layout/MiniCart.tsx

This is a cart drawer (slides in from the right, triggered by cart icon in TopBar).

Shows:
- List of cart items (image, name, quantity controls, line total, remove button)
- "X items · ₹[total]" summary
- Estimated delivery: "All items arrive in ~[maxETA] min"
- "Proceed to Checkout" button (orange)
  → shows a toast: "Checkout flow not available in demo. 
    In production: saved address + payment pre-fill + 1-tap confirm."
- "Continue Shopping" link → closes the drawer

Wire the cart icon in TopBar:
  onClick → useCartStore.openCart()
The MiniCart must be in app/layout.tsx (not in TopBar, to avoid nesting issues).

---

## ════════════════════════════════════════
## STAGE 3: REAL USER SIMULATION
## ════════════════════════════════════════

Now simulate 6 complete user journeys from scratch.
For EACH journey:
  1. State the starting URL and any preconditions
  2. List every step the user takes
  3. List what the app should do at each step
  4. State the PASS criteria
  5. List the most likely failure point and how to debug it

Run each journey in the browser (npm run dev) and verify it passes before moving on.
Fix any failures before starting the next journey.

═══════════════════════════════════════════
JOURNEY 1: "The Impulse Movie Night"
Target user: Priya, 9pm Friday, wants snacks fast
═══════════════════════════════════════════

Preconditions: Clear localStorage. Open http://localhost:3000. Not logged in (consumer side).

Step 1: Page loads
  → TopBar shows "Delivering to: 110001 · 10 min"
  → Hero section shows animated placeholder text rotating
  → "For You" row shows Amul Milk, Colgate, Bread as running-low items
  → After 4 seconds: orange badge appears on Nia trigger button (bottom-right)
  VERIFY: Proactive badge appears at ~4s, not immediately, not never.

Step 2: User ignores Nia, clicks "🎬 Movie night" quick-start chip
  → Nia panel opens (slides in from right, ~200ms animation)
  → Message "Movie night for 4 under ₹500" appears as a user bubble
  → Nia thinking animation appears (3 dots)
  → After ~1.2s: CartSummaryCard appears showing snacks cart
  VERIFY: Card shows ≥5 items, total < ₹500, ETA visible.

Step 3: User reads the cart, types "make it cheaper" in the Modify input
  → New user message appears: "make it cheaper"
  → Nia thinks again
  → Updated CartSummaryCard appears with lower total
  → A refinement summary line shows what changed
  VERIFY: New total is lower than previous. Some items changed.

Step 4: User clicks "Add all to cart"
  → Toast notification: "✅ 6 items added · ₹XXX · View cart →"
  → Cart badge in TopBar updates to show item count (e.g., "6")
  → Nia panel closes (or stays open — either is acceptable)
  VERIFY: TopBar badge is non-zero. Toast appeared and auto-dismissed after 3s.

Step 5: User clicks cart icon in TopBar
  → MiniCart drawer slides open
  → All 6 items are listed correctly
  → Total price matches what the CartSummaryCard showed
  → "Proceed to Checkout" button is visible
  VERIFY: Item count matches. Prices match. No blank items.

Step 6: User clicks "Proceed to Checkout"
  → Toast: "Checkout flow not available in demo..."
  VERIFY: No crash. Toast appears. Drawer stays open.

JOURNEY 1 PASS CRITERIA:
  ✓ Proactive badge appears at 4s
  ✓ Movie night cart renders with correct items and total < ₹500
  ✓ Refinement produces a visibly different, cheaper cart
  ✓ Cart badge updates in TopBar
  ✓ MiniCart shows correct items and total
  MOST LIKELY FAILURE: Cart badge not updating → useCartStore not connected to TopBar

═══════════════════════════════════════════
JOURNEY 2: "The Earbuds Researcher"
Target user: Rahul, comparing before buying, types a specific query
═══════════════════════════════════════════

Preconditions: http://localhost:3000. Fresh load (previous cart from Journey 1 is fine).

Step 1: User clicks the floating Nia trigger button
  → Panel opens cleanly
  → Proactive message (from Journey 1's scheduler) is visible
  → Input is focused

Step 2: User types: "best wireless earbuds under ₹2000 good bass"
  → User bubble appears
  → Nia thinks
  → ComparisonCard appears with 3 earbuds
  → boAt Airdopes has "⭐ Nia's Pick" badge
  → Confidence badge shows "91% match" 
  VERIFY: Exactly 3 products shown. Best pick highlighted. Confidence badge visible.

Step 3: User taps "Why I recommend this" expandable section
  → Section expands smoothly showing bestPickReason text
  VERIFY: Text is readable, expansion is animated, not a jarring jump.

Step 4: User clicks "View full comparison →"
  → New tab opens at /compare?ids=boat_airdopes_141,noise_buds_vs104,jbl_tune_115tws
  → Comparison page loads with the 3 products
  → Full attribute table visible
  → "Share" button visible
  VERIFY: URL contains correct product IDs. Page renders without errors.

Step 5: User clicks "Share comparison"
  → Toast: "Link copied! Share it with anyone 📋"
  → URL is in clipboard (verify by pasting somewhere)
  VERIFY: Toast appears. Clipboard contains the full URL.

Step 6: User closes the tab, returns to main app
  → Nia panel is still open (state preserved across the tab switch)
  → Previous messages still visible in the panel
  VERIFY: Panel state is NOT reset. Messages from Step 2 are still there.

Step 7: User types "add the JBL one to cart"
  → Nia responds with confirmation (either via mock or Groq)
  → JBL Tune 115TWS added to cart
  → Cart badge in TopBar increments
  VERIFY: Cart badge increases. Some confirmation shown.

JOURNEY 2 PASS CRITERIA:
  ✓ ComparisonCard renders 3 products with correct best-pick highlight
  ✓ /compare page loads with URL params correctly parsed
  ✓ Nia panel state persists across tab activity
  ✓ Cart updates from within Nia panel
  MOST LIKELY FAILURE: /compare page shows blank → URL param parsing broken

═══════════════════════════════════════════
JOURNEY 3: "The Midnight Emergency"
Target user: Neha, 11pm, baby has fever
═══════════════════════════════════════════

Preconditions: http://localhost:3000. Clear cart to simulate a new user.

Step 1: User sees the orange Emergency Mode banner
  → Clicks it
  → Navigates to /emergency
  → Page loads with 8 category tiles
  VERIFY: All 8 tiles visible. Page title is "What's the emergency?".

Step 2: User types "baby has fever" in the emergency search input
  → App detects: matches both 'baby_care' AND 'fever_illness' triggers
  → Show both tiles highlighted or prompt: "Sounds like this could be Baby Care or
    Fever & Illness — which fits best?" with two large tap buttons
  → User taps "Fever & Illness 🤒"
  VERIFY: Ambiguous detection handled gracefully. Not a crash. Not silent.

Step 3: Fever & Illness tile expands inline
  → Kit items visible: Crocin ×2, ORS ×5, Vicks, Dettol, water ×3
  → Total: ₹312 shown
  → ETA: "Arrives in ~12 min" in bold red
  → Large "Order this kit — ₹312" button below
  VERIFY: All kit items listed. ETA is prominently displayed. Button is full-width.

Step 4: User clicks "Order this kit — ₹312"
  → Items added to cart
  → Toast: "✅ 5 items added · ₹312 · ~12 min delivery"
  → Cart badge updates
  VERIFY: Cart has 5 new items. Toast shows correct total and ETA.

Step 5: User clicks "Customize kit" link (below the order button)
  → Nia panel opens
  → Pre-loaded message: "Help me customize the Fever & Illness emergency kit"
  → Nia responds with the kit details and asks what to change
  VERIFY: Nia panel opens WITH the pre-loaded message already showing.
          User doesn't have to type anything.

JOURNEY 3 PASS CRITERIA:
  ✓ /emergency page renders all 8 tiles
  ✓ Ambiguous emergency detection handled without crashing
  ✓ Kit expands inline with items, total, ETA
  ✓ Cart updates from Emergency page
  ✓ "Customize kit" pre-loads Nia with context
  MOST LIKELY FAILURE: "Customize kit" opens Nia but with empty panel →
  pre-load message not wired to the navigation

═══════════════════════════════════════════
JOURNEY 4: "The Lazy Sunday Ritualist"
Target user: Priya, Sunday morning, wants her usual order
═══════════════════════════════════════════

Preconditions: http://localhost:3000. Cart from previous journeys can persist.

Step 1: User scrolls past the hero section to "Your rituals ⚡" row
  → 3 ritual cards visible: Monday Morning, Weekend Snack Box, Weekly Grocery Run
  → Each card shows name, item count, estimated total, last ordered date
  VERIFY: 3 cards rendered. All have non-zero item counts and prices.

Step 2: User clicks "Reorder · ₹220" on "Weekend Snack Box 🍿"
  → Toast: "✅ 5 items added · ₹220 · View cart →"
  → Cart badge updates
  VERIFY: Cart badge shows correct cumulative count. Toast appears.

Step 3: User notices toast says "1 item unavailable — Nia found a substitute"
  (Pepsi 2L is marked out-of-stock in mock data)
  → Nia panel auto-opens with substitution message:
    "Your usual Pepsi 2L is out of stock 😕 Shall I swap it with 
     Sprite 2L (same price, arrives in 8 min)?"
  → Two buttons: "Yes, swap it" and "Skip this item"
  VERIFY: Nia panel opens automatically. Substitution message is pre-loaded.
          Two clear action buttons visible.

Step 4: User taps "Yes, swap it"
  → Cart updates: Pepsi removed, Sprite added
  → Confirmation: "Done! Sprite 2L swapped in. ✅"
  → Cart total unchanged (same price)
  VERIFY: Cart now has Sprite, not Pepsi. Total is the same.

Step 5: User clicks "+" on the ritual card to create a new ritual (last card in the row)
  → Nia opens with: "Let's create a new ritual! What do you usually order together?"
  VERIFY: Nia opens with the creation prompt. User doesn't see a blank panel.

JOURNEY 4 PASS CRITERIA:
  ✓ Ritual cards render with correct data
  ✓ One-click reorder adds items to cart
  ✓ Out-of-stock item triggers auto substitution prompt in Nia
  ✓ Substitution swap updates cart correctly
  MOST LIKELY FAILURE: Auto-open Nia on substitution not triggered →
  the reorder button handler doesn't check stock status before adding

═══════════════════════════════════════════
JOURNEY 5: "The Seller Spotting an Opportunity"
Target user: Ankit (seller), checking his weekly performance
═══════════════════════════════════════════

Preconditions: Navigate to http://localhost:3000/seller/login
               Nia widget should NOT be visible on seller routes.

Step 1: Login page loads
  → Split screen visible (branding left, form right on desktop)
  → "Demo credentials" hint visible below the form
  → Nia floating widget is NOT visible on this page
  VERIFY: No Nia widget on /seller/login. Hint text visible.

Step 2: User enters seller@techzone.in / demo123, clicks "Sign In"
  → Loading spinner on button for ~1s
  → Redirected to /seller (dashboard)
  → Welcome message: "Good morning, Ankit! 👋"
  VERIFY: Redirect happens. Name shows correctly from auth store.

Step 3: User scans the Dashboard
  → 4 KPI cards visible with numbers
  → Revenue chart rendered (Recharts, two lines)
  → Top Listings table shows 5 products with Nia Match Scores
  → Activity feed shows 6 recent events
  VERIFY: Charts render (not blank). Nia Match Score badges have correct colors.

Step 4: User clicks "📊 View Intent Gaps" quick action
  → Navigates to /seller/intent-gaps (or /seller — verify the exact route)
  → Intent gaps table loaded with 20 rows
  → "sugar-free protein bar under ₹300" visible at or near the top (1,247 searches)
  VERIFY: Route is correct. Table renders. Top gap is visible.

Step 5: User clicks the row for "sugar-free protein bar under ₹300"
  → Row expands inline
  → Shows: customer quotes, time distribution, top locations, closest product
  VERIFY: Expanded view renders without layout breaking.

Step 6: User clicks "Fix listing" action button
  → Navigates to /seller/optimization?query=sugar-free+protein+bar+under+₹300
  → Optimization Chat loads
  → Nia's FIRST message is pre-loaded referencing the query (not a blank chat)
  VERIFY: URL param is read. First Nia message mentions "sugar-free protein bar".

Step 7: User types "What title should I use?"
  → Nia responds with 3 suggested titles (via Groq or mock)
  VERIFY: Response is relevant to the electronics category vs the query.
  (If using mock, ensure the optimization chat has its own mock responses
   separate from the shopper Nia mock flows)

Step 8: User clicks "📈 Full Analytics" in the sidebar
  → Navigates to /seller/analytics
  → Charts render, Nia funnel visible
  → Time range selector changes chart data when clicked
  VERIFY: Switching "Last 7 days" → "Last 30 days" changes the numbers in charts.

Step 9: User clicks "Sign Out" at bottom of sidebar
  → Auth store cleared
  → Redirected to /seller/login
  → Navigating to /seller directly redirects back to /seller/login
  VERIFY: Auth guard working. Protected routes redirect after logout.

JOURNEY 5 PASS CRITERIA:
  ✓ Nia widget hidden on all /seller/* routes
  ✓ Login/logout cycle works
  ✓ Dashboard renders charts and tables
  ✓ Intent gap → Optimization Chat handoff passes the query correctly
  ✓ Analytics time range selector produces different data
  ✓ Auth guard redirects after logout
  MOST LIKELY FAILURE: Optimization chat opens blank → URL search param not read

═══════════════════════════════════════════
JOURNEY 6: "The Mobile User in a Rush"
Target user: Anyone, on a 375px mobile viewport
═══════════════════════════════════════════

Preconditions: Open Chrome DevTools → set device to iPhone SE (375×667).
               Navigate to http://localhost:3000.
               This journey checks mobile layout, not new features.

Step 1: Homepage loads on 375px
  → No horizontal scroll (body overflow-x: hidden)
  → TopBar fits in one row (logo + icons)
  → Hero search bar is full width
  → Quick-start chips wrap or scroll horizontally (not overflow)
  → "For You" row scrolls horizontally (no overflow)
  VERIFY: No elements bleed outside 375px. Everything tappable.

Step 2: User taps "🎬 Movie night" chip
  → Nia panel slides UP from bottom (drawer, not sidebar)
  → Drawer height is ~85vh
  → CartSummaryCard fits within the drawer without horizontal scroll
  → "Add all to cart" button is visible without scrolling (or with minimal scroll)
  VERIFY: Drawer (not sidebar) on mobile. Card fits within drawer width.

Step 3: User taps "🚨 Emergency" chip
  → Navigates to /emergency
  → Category tiles are 2-column grid (not 4-column)
  → Each tile tappable (min 64px height)
  → ETA badges visible
  VERIFY: 2-column grid. Tap targets large enough.

Step 4: Navigate to /seller/login on mobile
  → Single column layout (no split screen — branding panel is hidden on mobile)
  → Form is full width
  → "Sign In" button is full width
  VERIFY: No side-by-side columns on 375px.

Step 5: Log in, check seller dashboard on mobile
  → Sidebar is hidden (hamburger menu instead)
  → KPI cards: 2×2 grid (not 4-in-a-row)
  → Charts scroll horizontally if needed (not cut off)
  → Activity feed is readable
  VERIFY: Sidebar collapses to hamburger on mobile. KPI grid is 2×2.

JOURNEY 6 PASS CRITERIA:
  ✓ No horizontal scroll on any consumer page at 375px
  ✓ Nia panel opens as bottom drawer (not sidebar) on mobile
  ✓ All tap targets ≥ 44px height
  ✓ Seller sidebar collapses to hamburger on mobile
  ✓ Charts don't clip or overflow on mobile
  MOST LIKELY FAILURE: Seller sidebar not collapsing → no mobile sidebar logic built

---

## ════════════════════════════════════════
## INTEGRATION CHECKLIST
## ════════════════════════════════════════

After all 6 journeys pass, run through this 30-point checklist.
Mark each as ✓ PASS, ✗ FAIL (with a one-line fix), or ⚠ SKIP (with reason).

### Types & Architecture
[ ] 1.  All types imported from types/index.ts (no duplicate definitions elsewhere)
[ ] 2.  No TypeScript errors in the project (run: npx tsc --noEmit)
[ ] 3.  No ESLint errors (run: npm run lint)
[ ] 4.  .env.local exists with GROQ_API_KEY (or a note that mock works without it)

### State Management
[ ] 5.  useCartStore: addItem, addItems, removeItem, updateQuantity all work
[ ] 6.  Cart total recalculates correctly when items change
[ ] 7.  useNiaStore: open/close/toggle work from NiaTrigger button
[ ] 8.  useNiaStore: messages persist when navigating between pages
[ ] 9.  useUserStore: Priya's profile available across all consumer pages
[ ] 10. useSellerAuthStore: auth state persists on page refresh (sessionStorage)

### API Integration
[ ] 11. POST /api/nia returns valid JSON for all 5 mock flows
[ ] 12. POST /api/nia returns valid JSON for at least 1 non-mock Groq query
[ ] 13. API error (network down) shows "Oops" message in Nia panel (not a crash)
[ ] 14. Nia panel sends full conversation history (not just latest message)

### UI Connections
[ ] 15. Cart badge in TopBar updates when items added from ANY source
         (Nia panel, Reorder row, Ritual card, Emergency kit, ProductListCard)
[ ] 16. MiniCart opens from TopBar cart icon and shows correct items
[ ] 17. Nia proactive badge appears at ~4s on page load
[ ] 18. Nia widget is NOT visible on /seller/* routes
[ ] 19. Seller sidebar shows correct active state on every route

### Navigation
[ ] 20. All 5 seller sidebar links navigate to correct routes (not 404)
[ ] 21. /emergency page loads and all 8 category tiles render
[ ] 22. /compare?ids=X,Y,Z loads comparison for the correct products
[ ] 23. /category/[slug] renders without crashing (even if content is minimal)
[ ] 24. /seller/optimization?query=X pre-loads Nia with the query
[ ] 25. Seller logout redirects to /seller/login and blocks /seller access

### Cross-module Data
[ ] 26. Emergency kit "Order this kit" → cart updates, TopBar badge updates
[ ] 27. Ritual "Reorder" → out-of-stock triggers Nia substitution prompt
[ ] 28. ComparisonCard "View full" → correct product IDs in /compare URL
[ ] 29. "Customize kit" (emergency) → Nia opens with pre-loaded context
[ ] 30. Analytics time range selector → chart data visibly changes per selection

---

## ════════════════════════════════════════
## KNOWN ACCEPTABLE LIMITATIONS
## (Do NOT fix these — document them instead)
## ════════════════════════════════════════

These are items that are intentionally not built for the demo.
Add them to README_DEMO.md under "Known Limitations":

1. Checkout flow — clicking "Proceed to Checkout" shows a toast.
   Production: Amazon Pay integration + address book + order placement API.

2. Real-time inventory — ETA and stock status are mock.
   Production: Amazon Now dark-store inventory API (sub-100ms polling).

3. User accounts — consumer side has no login/signup.
   Production: Amazon account OAuth (same as main amazon.in login).

4. Push notifications — proactive nudges only work while the tab is open.
   Production: Web Push API + SES/SNS for background notifications.

5. Visual search — upload image to find product is not implemented.
   Production: Bedrock multimodal (Claude vision) + Rekognition catalog match.

6. Voice mode — mic buttons are visible but not functional.
   Production: Web Speech API for input, Amazon Polly for Nia's voice output.

7. Seller KYC — signup flow ends at success screen.
   Production: Aadhaar/GSTIN verification + bank account verification before activation.

8. Streaming responses — Nia responses appear all at once after 1.2s delay.
   Production: SSE streaming from Groq/Bedrock so text appears token by token.

---

## FINAL OUTPUT: Run the full demo

After all journeys pass and the checklist is ≥ 90% complete:

1. Start the server: npm run dev
2. Open http://localhost:3000
3. Walk through all 5 hackathon demo flows in order (from Module 6A)
4. Walk through the seller console demo (Journey 5 above)
5. Screenshot or screen-record the entire flow
6. Verify the experience feels like ONE cohesive product, not 10 separate modules

If it feels disjointed anywhere, identify the exact friction point and fix it.
The demo should feel like this flow is natural and inevitable,
not like a carefully scripted path around broken parts.
```

---

## What this prompt fixes vs what it leaves alone

| Issue type | This prompt's approach |
|---|---|
| Duplicate type definitions | Consolidate into types/index.ts, update all imports |
| Disconnected cart (biggest bug) | Wire useCartStore to every "Add" button across all modules |
| Nia panel losing state on navigation | Move NiaWidget to root layout.tsx, use Zustand (not local state) |
| API response ↔ card renderer mismatch | Audit and standardize on NiaAPIResponse shape + NiaMessageRenderer |
| Dead nav links | Minimal stub pages for every linked route |
| Mobile layout failures | Journey 6 forces verification at 375px |
| Seller auth not persisting | sessionStorage in useSellerAuthStore |
| Optimization chat opening blank | URL param read + pre-loaded first message |
| Analytics showing same data for all ranges | Separate mock data per time range |
| Nia widget showing on seller routes | usePathname() guard in root layout |
