/**
 * consumptionEngine.ts — Consumption Cycle Prediction Engine (Module 4A)
 *
 * Predicts when a user will run out of frequently-ordered products by
 * analyzing order history patterns. This is the brain behind Nia's
 * proactive "Running Low" nudges.
 *
 * Algorithm overview:
 *   1. Group order history by productId
 *   2. Calculate inter-order intervals and their standard deviation
 *   3. Project the next run-out date from the last order
 *   4. Score confidence based on data-point count & variance
 *   5. Surface only items within a 7-day "running low" window
 *
 * All dates use relative offsets from `new Date()` so the demo always
 * shows fresh, realistic predictions regardless of when it's viewed.
 */

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export interface OrderHistoryItem {
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  orderDate: Date;
  price: number;
  image: string;     // emoji for demo
  category: string;
}

export interface ConsumptionCycle {
  productId: string;
  productName: string;
  image: string;
  category: string;
  price: number;
  unit: string;
  avgDaysBetweenOrders: number;
  lastOrderDate: Date;
  daysSinceLastOrder: number;    // convenience: Math.round((today - lastOrderDate) / MS_PER_DAY)
  estimatedQuantityPerDay: number;
  predictedRunOutDate: Date;
  daysUntilRunOut: number;
  confidence: 'high' | 'medium' | 'low';
  alertThreshold: number;  // days before runout to alert (default: 2)
  percentUsed: number;     // 0-100, how much of the cycle has elapsed
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

/** Milliseconds in one day — used to convert date diffs to day counts. */
const MS_PER_DAY = 1000 * 60 * 60 * 24;

/**
 * Default cycle length (in days) for products with only 1 data point.
 * We assume a conservative 30-day cycle so the item doesn't flood the
 * "running low" panel without enough evidence.
 */
const DEFAULT_CYCLE_DAYS = 30;

/**
 * The "running low" window: we only surface items predicted to run out
 * within this many days. Keeps the UI focused on actionable nudges.
 */
const RUNNING_LOW_WINDOW_DAYS = 7;

/** Default alert threshold — nudge the user 2 days before predicted runout. */
const DEFAULT_ALERT_THRESHOLD = 2;

/**
 * Calculate the number of days between two Date objects.
 * Returns a positive value regardless of order.
 */
function daysBetween(a: Date, b: Date): number {
  return Math.abs(a.getTime() - b.getTime()) / MS_PER_DAY;
}

/**
 * Standard deviation of an array of numbers.
 * Used to gauge consistency of purchase intervals — low stdDev means
 * the user buys at a regular cadence, boosting our confidence score.
 */
function standardDeviation(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const squaredDiffs = values.map((v) => (v - mean) ** 2);
  const variance = squaredDiffs.reduce((sum, v) => sum + v, 0) / values.length;
  return Math.sqrt(variance);
}

/**
 * Clamp a number between a minimum and maximum (inclusive).
 */
function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

// ─────────────────────────────────────────────────────────────
// Core Prediction Engine
// ─────────────────────────────────────────────────────────────

/**
 * Predict consumption cycles for all products in the order history.
 *
 * @param orderHistory - Array of past orders across all products
 * @returns ConsumptionCycle[] sorted by urgency (soonest runout first),
 *          filtered to only items within the 7-day running-low window
 */
export function predictConsumption(
  orderHistory: OrderHistoryItem[]
): ConsumptionCycle[] {
  const today = new Date();

  // ── Step 1: Group orders by productId ──────────────────────
  const grouped = new Map<string, OrderHistoryItem[]>();

  for (const order of orderHistory) {
    const existing = grouped.get(order.productId) || [];
    existing.push(order);
    grouped.set(order.productId, existing);
  }

  const cycles: ConsumptionCycle[] = [];

  for (const [productId, orders] of grouped) {
    // Sort orders chronologically (oldest first) so intervals are computed
    // in temporal order — crucial for accurate day-gap calculations.
    orders.sort((a, b) => a.orderDate.getTime() - b.orderDate.getTime());

    // Use the most recent order's metadata as the canonical product info
    const latest = orders[orders.length - 1];
    const dataPoints = orders.length;

    let avgDaysBetweenOrders: number;
    let stdDev: number;
    let confidence: 'high' | 'medium' | 'low';

    if (dataPoints >= 2) {
      // ── Step 2: Calculate inter-order intervals ──────────
      // We compute the gap between each consecutive pair of orders.
      const intervals: number[] = [];
      for (let i = 1; i < orders.length; i++) {
        intervals.push(daysBetween(orders[i].orderDate, orders[i - 1].orderDate));
      }

      avgDaysBetweenOrders =
        intervals.reduce((sum, v) => sum + v, 0) / intervals.length;
      stdDev = standardDeviation(intervals);

      // ── Step 6: Determine confidence level ───────────────
      // High: 4+ data points AND consistent intervals (stdDev < 7 days)
      // Medium: 2–3 data points (not enough history to be sure)
      if (dataPoints >= 4 && stdDev < 7) {
        confidence = 'high';
      } else {
        confidence = 'medium';
      }
    } else {
      // ── Single data point — low confidence ───────────────
      // We can't compute intervals, so fall back to a default cycle.
      avgDaysBetweenOrders = DEFAULT_CYCLE_DAYS;
      stdDev = 0;
      confidence = 'low';
    }

    // ── Step 3: Predict run-out date ─────────────────────────
    // lastOrderDate + avgCycle = when we expect the product to run out
    const predictedRunOutDate = new Date(latest.orderDate);
    predictedRunOutDate.setDate(
      predictedRunOutDate.getDate() + Math.round(avgDaysBetweenOrders)
    );

    // ── Step 4: Days until run-out ───────────────────────────
    const daysUntilRunOut = Math.round(
      (predictedRunOutDate.getTime() - today.getTime()) / MS_PER_DAY
    );

    // ── Step 5: Percent of cycle elapsed ─────────────────────
    // If avgDaysBetweenOrders is 10 and daysUntilRunOut is 3,
    // then 70% of the product has been "used up".
    const rawPercent = Math.round(
      ((avgDaysBetweenOrders - daysUntilRunOut) / avgDaysBetweenOrders) * 100
    );
    const percentUsed = clamp(rawPercent, 0, 100);

    // ── Step 9: Estimated quantity consumed per day ──────────
    // Total quantity across all orders / total span from first to last order.
    // For single-order products, we use quantity / defaultCycle as a rough guess.
    const totalQuantity = orders.reduce((sum, o) => sum + o.quantity, 0);
    const totalSpanDays = daysBetween(
      orders[0].orderDate,
      orders[orders.length - 1].orderDate
    );
    const estimatedQuantityPerDay =
      totalSpanDays > 0
        ? totalQuantity / totalSpanDays
        : totalQuantity / DEFAULT_CYCLE_DAYS; // fallback for single-order

    // Days since the most recent order — used by UI components and nudge messages
    const daysSinceLastOrder = Math.round(
      (today.getTime() - latest.orderDate.getTime()) / MS_PER_DAY
    );

    cycles.push({
      productId,
      productName: latest.productName,
      image: latest.image,
      category: latest.category,
      price: latest.price,
      unit: latest.unit,
      avgDaysBetweenOrders: Math.round(avgDaysBetweenOrders * 10) / 10,
      lastOrderDate: latest.orderDate,
      daysSinceLastOrder,
      estimatedQuantityPerDay:
        Math.round(estimatedQuantityPerDay * 1000) / 1000, // 3 decimal places
      predictedRunOutDate,
      daysUntilRunOut,
      confidence,
      alertThreshold: DEFAULT_ALERT_THRESHOLD,
      percentUsed,
    });
  }

  // ── Step 7: Sort by urgency (soonest runout first) ─────────
  cycles.sort((a, b) => a.daysUntilRunOut - b.daysUntilRunOut);

  // ── Step 8: Filter to running-low window only ──────────────
  // We only surface items that are predicted to run out within
  // RUNNING_LOW_WINDOW_DAYS. Items far in the future don't need
  // attention yet and would clutter the UI.
  return cycles.filter(
    (cycle) => cycle.daysUntilRunOut <= RUNNING_LOW_WINDOW_DAYS
  );
}

// ─────────────────────────────────────────────────────────────
// Mock Data — Demo User "Priya Sharma"
// ─────────────────────────────────────────────────────────────

/**
 * Generate realistic order history for the demo persona.
 *
 * Uses relative dates from `new Date()` so predictions are always
 * fresh. Product selection mirrors a typical Indian household's
 * Amazon Now basket — milk, bread, toiletries, pantry staples.
 */
export function getMockOrderHistory(): OrderHistoryItem[] {
  const today = new Date();

  /** Create a Date that is `n` days in the past from today. */
  const daysAgo = (n: number): Date => {
    const d = new Date(today);
    d.setDate(d.getDate() - n);
    return d;
  };

  return [
    // ── Amul Toned Milk 1L ──────────────────────────────────
    // Cycle ~3 days, 6 data points → HIGH confidence
    // Daily essential — most frequent repurchase in Indian households
    { productId: 'prod-001', productName: 'Amul Toned Milk 1L', quantity: 1, unit: '1L', orderDate: daysAgo(3),  price: 30,  image: '🥛', category: 'Dairy & Eggs' },
    { productId: 'prod-001', productName: 'Amul Toned Milk 1L', quantity: 1, unit: '1L', orderDate: daysAgo(6),  price: 30,  image: '🥛', category: 'Dairy & Eggs' },
    { productId: 'prod-001', productName: 'Amul Toned Milk 1L', quantity: 1, unit: '1L', orderDate: daysAgo(9),  price: 30,  image: '🥛', category: 'Dairy & Eggs' },
    { productId: 'prod-001', productName: 'Amul Toned Milk 1L', quantity: 1, unit: '1L', orderDate: daysAgo(12), price: 30,  image: '🥛', category: 'Dairy & Eggs' },
    { productId: 'prod-001', productName: 'Amul Toned Milk 1L', quantity: 1, unit: '1L', orderDate: daysAgo(15), price: 30,  image: '🥛', category: 'Dairy & Eggs' },
    { productId: 'prod-001', productName: 'Amul Toned Milk 1L', quantity: 1, unit: '1L', orderDate: daysAgo(18), price: 30,  image: '🥛', category: 'Dairy & Eggs' },

    // ── Colgate MaxFresh 200g ────────────────────────────────
    // Cycle ~40 days, 3 data points → MEDIUM confidence
    // Last ordered 38 days ago, so ~2 days until predicted runout
    { productId: 'prod-002', productName: 'Colgate MaxFresh 200g', quantity: 1, unit: '200g', orderDate: daysAgo(38),  price: 142, image: '🪥', category: 'Personal Care' },
    { productId: 'prod-002', productName: 'Colgate MaxFresh 200g', quantity: 1, unit: '200g', orderDate: daysAgo(78),  price: 142, image: '🪥', category: 'Personal Care' },
    { productId: 'prod-002', productName: 'Colgate MaxFresh 200g', quantity: 1, unit: '200g', orderDate: daysAgo(120), price: 142, image: '🪥', category: 'Personal Care' },

    // ── Britannia Bread 400g ─────────────────────────────────
    // Cycle ~4 days, 4 data points → HIGH confidence
    // Staple breakfast item, very regular purchasing pattern
    { productId: 'prod-003', productName: 'Britannia Bread 400g', quantity: 1, unit: '400g', orderDate: daysAgo(4),  price: 45,  image: '🍞', category: 'Groceries' },
    { productId: 'prod-003', productName: 'Britannia Bread 400g', quantity: 1, unit: '400g', orderDate: daysAgo(8),  price: 45,  image: '🍞', category: 'Groceries' },
    { productId: 'prod-003', productName: 'Britannia Bread 400g', quantity: 1, unit: '400g', orderDate: daysAgo(12), price: 45,  image: '🍞', category: 'Groceries' },
    { productId: 'prod-003', productName: 'Britannia Bread 400g', quantity: 1, unit: '400g', orderDate: daysAgo(16), price: 45,  image: '🍞', category: 'Groceries' },

    // ── Tata Salt 1kg ────────────────────────────────────────
    // Cycle ~30 days, 2 data points → MEDIUM confidence
    // Last ordered 25 days ago → ~5 days until predicted runout
    { productId: 'prod-004', productName: 'Tata Salt 1kg', quantity: 1, unit: '1kg', orderDate: daysAgo(25), price: 28,  image: '🧂', category: 'Kitchen Essentials' },
    { productId: 'prod-004', productName: 'Tata Salt 1kg', quantity: 1, unit: '1kg', orderDate: daysAgo(55), price: 28,  image: '🧂', category: 'Kitchen Essentials' },

    // ── India Gate Basmati Rice 5kg ──────────────────────────
    // Cycle ~60 days, 2 data points → should be FILTERED OUT
    // Last ordered 30 days ago → ~30 days until runout (outside 7-day window)
    { productId: 'prod-005', productName: 'India Gate Basmati Rice 5kg', quantity: 1, unit: '5kg', orderDate: daysAgo(30), price: 450, image: '🍚', category: 'Groceries' },
    { productId: 'prod-005', productName: 'India Gate Basmati Rice 5kg', quantity: 1, unit: '5kg', orderDate: daysAgo(90), price: 450, image: '🍚', category: 'Groceries' },
  ];
}

// ─────────────────────────────────────────────────────────────
// Convenience Export
// ─────────────────────────────────────────────────────────────

/**
 * One-call entry point for the UI layer.
 * Returns only products predicted to run out within 7 days,
 * sorted by urgency. Plug this directly into the RunningLow panel.
 */
export function getRunningLowItems(): ConsumptionCycle[] {
  return predictConsumption(getMockOrderHistory());
}

/**
 * Returns ALL consumption cycle predictions (no 7-day window filter).
 * Used by the "See all predictions" expanded view to show upcoming items
 * that aren't yet urgent but will need reordering eventually.
 */
export function getAllPredictions(): ConsumptionCycle[] {
  const today = new Date();
  const orderHistory = getMockOrderHistory();

  // ── Reuse the grouping + prediction logic from predictConsumption ──
  const grouped = new Map<string, typeof orderHistory>();
  for (const order of orderHistory) {
    const existing = grouped.get(order.productId) || [];
    existing.push(order);
    grouped.set(order.productId, existing);
  }

  const cycles: ConsumptionCycle[] = [];

  for (const [productId, orders] of grouped) {
    orders.sort((a, b) => a.orderDate.getTime() - b.orderDate.getTime());
    const latest = orders[orders.length - 1];
    const dataPoints = orders.length;

    let avgDaysBetweenOrders: number;
    let confidence: 'high' | 'medium' | 'low';

    if (dataPoints >= 2) {
      const intervals: number[] = [];
      for (let i = 1; i < orders.length; i++) {
        intervals.push(daysBetween(orders[i].orderDate, orders[i - 1].orderDate));
      }
      avgDaysBetweenOrders = intervals.reduce((sum, v) => sum + v, 0) / intervals.length;
      const stdDev = standardDeviation(intervals);
      confidence = dataPoints >= 4 && stdDev < 7 ? 'high' : 'medium';
    } else {
      avgDaysBetweenOrders = DEFAULT_CYCLE_DAYS;
      confidence = 'low';
    }

    const predictedRunOutDate = new Date(latest.orderDate);
    predictedRunOutDate.setDate(predictedRunOutDate.getDate() + Math.round(avgDaysBetweenOrders));
    const daysUntilRunOut = Math.round((predictedRunOutDate.getTime() - today.getTime()) / MS_PER_DAY);
    const rawPercent = Math.round(((avgDaysBetweenOrders - daysUntilRunOut) / avgDaysBetweenOrders) * 100);
    const percentUsed = clamp(rawPercent, 0, 100);
    const totalQuantity = orders.reduce((sum, o) => sum + o.quantity, 0);
    const totalSpanDays = daysBetween(orders[0].orderDate, orders[orders.length - 1].orderDate);
    const estimatedQuantityPerDay = totalSpanDays > 0 ? totalQuantity / totalSpanDays : totalQuantity / DEFAULT_CYCLE_DAYS;
    const daysSinceLastOrder = Math.round((today.getTime() - latest.orderDate.getTime()) / MS_PER_DAY);

    cycles.push({
      productId,
      productName: latest.productName,
      image: latest.image,
      category: latest.category,
      price: latest.price,
      unit: latest.unit,
      avgDaysBetweenOrders: Math.round(avgDaysBetweenOrders * 10) / 10,
      lastOrderDate: latest.orderDate,
      daysSinceLastOrder,
      estimatedQuantityPerDay: Math.round(estimatedQuantityPerDay * 1000) / 1000,
      predictedRunOutDate,
      daysUntilRunOut,
      confidence,
      alertThreshold: DEFAULT_ALERT_THRESHOLD,
      percentUsed,
    });
  }

  cycles.sort((a, b) => a.daysUntilRunOut - b.daysUntilRunOut);
  return cycles; // No filter — return everything
}

// ─────────────────────────────────────────────────────────────
// Production Extension Notes
// ─────────────────────────────────────────────────────────────
/*
 * ┌──────────────────────────────────────────────────────────┐
 * │              PRODUCTION EXTENSION NOTES                  │
 * ├──────────────────────────────────────────────────────────┤
 * │                                                          │
 * │  1. AMAZON PERSONALIZE INTEGRATION                       │
 * │     In production, this manual interval-based approach   │
 * │     would be replaced by Amazon Personalize's real-time  │
 * │     event tracker (PutEvents API). Personalize ingests   │
 * │     purchase events, browsing behavior, and contextual   │
 * │     signals (time of day, seasonality, household size)   │
 * │     to build per-user consumption models. The Personalize│
 * │     "Similar-Items" and "Recommended-For-You" recipes    │
 * │     can be combined with a custom solution recipe to     │
 * │     predict replenishment timing with far greater        │
 * │     accuracy than simple interval averages.              │
 * │                                                          │
 * │  2. ML-BASED CYCLE PREDICTION                            │
 * │     A production model would use:                        │
 * │     - Time-series forecasting (e.g., DeepAR on SageMaker│
 * │       or Prophet) to handle irregular purchasing cadence,│
 * │       seasonality (festival stocking), and trend shifts  │
 * │       (e.g., summer → more beverages).                   │
 * │     - Feature engineering: household size, quantity per  │
 * │       order changes, price sensitivity, product-specific │
 * │       shelf-life data from the catalog.                  │
 * │     - Bayesian updating: each new purchase refines the   │
 * │       posterior distribution over cycle length, allowing │
 * │       confidence intervals instead of point estimates.   │
 * │                                                          │
 * │  3. REAL DATA PIPELINE                                   │
 * │     getMockOrderHistory() would be replaced by a call to │
 * │     the Amazon Order History API (or an internal GraphQL │
 * │     gateway) that streams purchase events. DynamoDB with │
 * │     a GSI on (userId, orderDate) provides fast sorted    │
 * │     retrieval. EventBridge triggers Lambda on each new   │
 * │     order to recalculate predictions in near-real-time.  │
 * │                                                          │
 * │  4. NOTIFICATION ENGINE                                  │
 * │     alertThreshold would feed into Amazon SNS / Pinpoint │
 * │     for push notifications and into the Nia chat layer   │
 * │     for proactive conversational nudges. A/B testing via │
 * │     CloudWatch Evidently would optimize nudge timing.    │
 * │                                                          │
 * │  5. SUBSCRIBE & SAVE INTEGRATION                         │
 * │     Products with high-confidence, regular cycles are    │
 * │     prime candidates for auto-suggesting Amazon's        │
 * │     Subscribe & Save program, locking in recurring       │
 * │     revenue while reducing user friction.                │
 * │                                                          │
 * └──────────────────────────────────────────────────────────┘
 */
