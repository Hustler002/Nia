// lib/personalization/proactiveNudge.ts
// Proactive nudge system — generates contextual reorder messages based on
// consumption cycle predictions. Surfaces timely, non-intrusive reminders
// that feel like a friend reminding you, not an ad pushing you.
// Production: Amazon Personalize + Lambda scheduled jobs + SNS push notifications

import type { ConsumptionCycle } from './consumptionEngine';
import type { NiaMessage, ReorderNudge } from '@/lib/useNiaStore';

// ─── Category Emoji Map ─────────────────────────────────────────────────────
// Maps product categories to contextually relevant emoji for softer nudges.
// Keeps messages visually warm and category-aware without hardcoding per product.
const CATEGORY_EMOJI: Record<string, string> = {
  dairy: '🥛',
  beverages: '☕',
  snacks: '🍿',
  hygiene: '🧴',
  cleaning: '🧹',
  baby: '👶',
  pet: '🐾',
  breakfast: '🥣',
  produce: '🥬',
  frozen: '🧊',
  pantry: '🫙',
  default: '📦',
};

/**
 * Pick a relevant emoji for the product's category.
 * Falls back to a generic package emoji for unknown categories.
 */
function getEmojiForCategory(category: string): string {
  const normalized = category.toLowerCase().trim();
  return CATEGORY_EMOJI[normalized] ?? CATEGORY_EMOJI['default'];
}

// ─── Nudge Builder Helpers ──────────────────────────────────────────────────

/**
 * Constructs the ReorderNudge data payload from a ConsumptionCycle.
 * This structured data powers the rich reorder card in the chat UI.
 */
function buildNudgeData(cycle: ConsumptionCycle): ReorderNudge {
  return {
    product: {
      id: cycle.productId,
      name: cycle.productName,
      price: cycle.price,
      image: cycle.image,
      lastOrdered: `${cycle.daysSinceLastOrder} days ago`,
      cycleDays: cycle.avgDaysBetweenOrders,
      percentUsed: cycle.percentUsed,
    },
  };
}

/**
 * Creates a NiaMessage shell with consistent structure.
 * All nudge messages share the 'reorder_nudge' type so the chat renderer
 * knows to display the interactive reorder card alongside the text.
 */
function createNudgeMessage(
  content: string,
  cycle: ConsumptionCycle
): NiaMessage {
  return {
    id: `proactive-nudge-${Date.now()}`,
    role: 'nia',
    content,
    type: 'reorder_nudge',
    data: buildNudgeData(cycle),
    timestamp: new Date(),
  };
}

// ─── Urgency Tier Content Generators ────────────────────────────────────────
// Each tier produces a different tone — from urgent/actionable to gentle/informational.
// The thresholds (1, 3, 7 days) are tuned for grocery/consumable categories;
// production would personalize these per user + category.

/**
 * CRITICAL tier (≤ 1 day): Direct, action-oriented nudge.
 * The user is likely out or about to be — make it easy to reorder.
 */
function buildCriticalNudge(cycle: ConsumptionCycle): string {
  return (
    `Hey! 👋 Your ${cycle.productName} usually runs out every ` +
    `${cycle.avgDaysBetweenOrders} days — you last ordered ` +
    `${cycle.daysSinceLastOrder} days ago. Want me to add it to a quick cart?`
  );
}

/**
 * SOON tier (1–3 days): Softer prompt with category-aware emoji.
 * Acknowledges the situation without creating urgency anxiety.
 */
function buildSoonNudge(cycle: ConsumptionCycle): string {
  const emoji = getEmojiForCategory(cycle.category);
  return (
    `Just a heads up — your ${cycle.productName} might run out in ` +
    `~${cycle.daysUntilRunOut} days. Want me to add it to your next order? ${emoji}`
  );
}

/**
 * PLANNING tier (3–7 days): Gentle, data-driven heads-up.
 * Helps the user plan ahead without any pressure to act now.
 */
function buildPlanningNudge(cycle: ConsumptionCycle): string {
  return (
    `📊 Your ${cycle.productName} is about ${cycle.percentUsed}% through its cycle. ` +
    `You've got ~${cycle.daysUntilRunOut} days left — want to plan ahead?`
  );
}

// ─── Primary Export: Single Most-Urgent Nudge ───────────────────────────────

/**
 * Returns a single nudge message for the most urgent item in the user's
 * consumption cycles. This is the "proactive" entry point — called on
 * session start or page load to surface the top reorder opportunity.
 *
 * @param consumptionCycles - Sorted array (ascending by daysUntilRunOut).
 *   The first element is the most urgent.
 * @returns A NiaMessage if a nudge-worthy item exists, null otherwise.
 *
 * Urgency tiers:
 * - ≤ 1 day  → Critical nudge (direct, action-oriented)
 * - ≤ 3 days → Soon nudge (softer, friendly reminder)
 * - ≤ 7 days → Planning nudge (gentle, data-driven)
 * - > 7 days → No nudge (nothing urgent enough to surface)
 */
export function getProactiveNudgeMessage(
  consumptionCycles: ConsumptionCycle[]
): NiaMessage | null {
  // No cycles means no purchase history — nothing to nudge about
  if (!consumptionCycles.length) return null;

  // Most urgent item is first in the pre-sorted array
  const mostUrgent = consumptionCycles[0];
  const days = mostUrgent.daysUntilRunOut;

  // Tier 1: Critical — running out today or tomorrow
  if (days <= 1) {
    return createNudgeMessage(buildCriticalNudge(mostUrgent), mostUrgent);
  }

  // Tier 2: Soon — running out within 3 days
  if (days <= 3) {
    return createNudgeMessage(buildSoonNudge(mostUrgent), mostUrgent);
  }

  // Tier 3: Planning — running out within a week
  if (days <= 7) {
    return createNudgeMessage(buildPlanningNudge(mostUrgent), mostUrgent);
  }

  // Beyond 7 days — no nudge needed, user is well-stocked
  return null;
}

// ─── Secondary Export: All Running-Low Items ────────────────────────────────

/**
 * Returns nudge messages for ALL items within the running-low window (≤ 7 days).
 * Used when the user explicitly asks: "Show me everything I'm running low on."
 *
 * Each item gets its own message with the appropriate urgency tier text,
 * plus a small delay offset on the ID to ensure unique keys in React lists.
 *
 * @param consumptionCycles - Full array of cycles, sorted ascending by daysUntilRunOut.
 * @returns Array of NiaMessage objects, one per running-low item.
 */
export function getAllNudgeMessages(
  consumptionCycles: ConsumptionCycle[]
): NiaMessage[] {
  const nudges: NiaMessage[] = [];

  for (let i = 0; i < consumptionCycles.length; i++) {
    const cycle = consumptionCycles[i];
    const days = cycle.daysUntilRunOut;

    // Only include items within the 7-day running-low window
    if (days > 7) continue;

    let content: string;

    if (days <= 1) {
      content = buildCriticalNudge(cycle);
    } else if (days <= 3) {
      content = buildSoonNudge(cycle);
    } else {
      content = buildPlanningNudge(cycle);
    }

    // Offset timestamp by index to guarantee unique IDs across the batch
    const message: NiaMessage = {
      id: `proactive-nudge-${Date.now() + i}`,
      role: 'nia',
      content,
      type: 'reorder_nudge',
      data: buildNudgeData(cycle),
      timestamp: new Date(),
    };

    nudges.push(message);
  }

  return nudges;
}

// Production extension:
// ─────────────────────────────────────────────────────────────────────────────
// In a production Amazon system, this entire module would be replaced by:
//
// 1. **Amazon Personalize** — real-time recommendation engine trained on
//    user purchase events (PutEvents API). A custom recipe (HRNN-Metadata)
//    predicts next-purchase timing per user × product.
//
// 2. **AWS Lambda (scheduled)** — EventBridge cron rule triggers a Lambda
//    every 6 hours to evaluate all active users' consumption cycles and
//    enqueue nudge candidates into an SQS queue.
//
// 3. **Amazon SNS + Pinpoint** — push notifications for mobile/web via
//    SNS topics. Pinpoint handles channel selection (push vs email vs SMS)
//    based on user preference and engagement history.
//
// 4. **DynamoDB nudge state table** — tracks which nudges were sent, opened,
//    acted upon, and dismissed. Prevents duplicate nudges and feeds back
//    into the Personalize model to improve timing precision.
//
// 5. **A/B testing via CloudWatch Evidently** — test nudge copy, timing
//    thresholds, and emoji usage to optimize conversion rate per category.
//
// 6. **Nudge fatigue guard** — rate-limit nudges to max 2 per day per user
//    to avoid notification fatigue. Backed by a sliding-window counter in
//    ElastiCache (Redis).
// ─────────────────────────────────────────────────────────────────────────────
