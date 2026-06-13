import TopBar from "@/components/TopBar";
import HeroSection from "@/components/HeroSection";
import EmergencyBanner from "@/components/EmergencyBanner";
import ReorderRow from "@/components/ReorderRow";
import RitualRow from "@/components/RitualRow";
import CategoryGrid from "@/components/CategoryGrid";
import ProductBrowsePanel from "@/components/ProductBrowsePanel";

export default function HomePage() {
  return (
    <>
      {/* Sticky navigation */}
      <TopBar />

      <main className="flex-1">
        {/* Hero: Nia conversational input — the centerpiece */}
        <HeroSection />

        {/* Emergency CTA strip */}
        <EmergencyBanner />

        {/* 🆕 Manual product browser + live cart */}
        <ProductBrowsePanel />

        {/* AI-predicted reorder suggestions */}
        <ReorderRow />

        {/* Recurring ritual bundles */}
        <RitualRow />

        {/* Browse by category */}
        <CategoryGrid />
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span className="font-semibold text-[#0F1111]">amazon</span>
            <span className="font-semibold text-[#FF9900]">now</span>
            <span className="text-gray-300">·</span>
            <span>Powered by</span>
            <span className="font-semibold text-[#00838F]">Nia</span>
          </div>
          <p className="text-xs text-gray-300">
            © 2026 Amazon. Hackathon demo — not a production service.
          </p>
        </div>
      </footer>
    </>
  );
}

/*
 * ============================================================================
 * PRODUCTION EXTENSION NOTES
 * ============================================================================
 *
 * 1. "For You" Reorder Row → Amazon Personalize Integration
 *    - Replace mock reorderProducts with a real-time call to Amazon Personalize
 *      using the consumption-cycle recipe (USER_PERSONALIZATION).
 *    - Input: user_id, last_purchase_timestamps per product.
 *    - Personalize returns a ranked list of items likely to be needed soon,
 *      with confidence scores that map to the "Running low" badge logic.
 *    - The consumption cycle (e.g., toothpaste ~45 days) is learned from
 *      historical order data across all users, not hardcoded.
 *
 * 2. Hero Input Bar → Bedrock Agent Invocation
 *    - On form submit, fire a POST to /api/nia/chat with the user's query.
 *    - The API route invokes a Bedrock Agent (Claude Sonnet) via InvokeAgent API.
 *    - The agent has action groups: search_catalog, build_cart, compare_products.
 *    - Responses stream back via WebSocket for sub-2-second perceived latency.
 *    - The agent's structured output (product list, comparison, cart) is rendered
 *      as rich UI cards inside the NiaChatPanel, never as plain text.
 *
 * 3. Semantic Search Layer
 *    - The hero input query is also embedded via Titan Embeddings and searched
 *      against the product catalog in OpenSearch (vector index).
 *    - This powers natural-language matching: "sugar-free protein bar with good
 *      taste" → actual matching SKUs even if those exact words aren't in the title.
 *
 * 4. Emergency Mode
 *    - The /emergency route triggers generate_emergency_kit(category, pincode).
 *    - This Bedrock Agent tool pre-builds curated kits per category from a
 *      vetted list maintained by category managers in DynamoDB.
 *
 * 5. Rituals
 *    - Pattern detection runs as a nightly batch job via Step Functions.
 *    - It clusters orders by time-of-week and item overlap to detect rituals.
 *    - Results stored in DynamoDB, surfaced via get_user_profile(user_id).
 * ============================================================================
 */
