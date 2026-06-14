import Link from "next/link";
import TopBar from "@/components/TopBar";
import HeroSection from "@/components/HeroSection";
import EmergencyBanner from "@/components/EmergencyBanner";
import ReorderRow from "@/components/ReorderRow";

import { RitualsRow } from "@/components/Rituals";
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

        {/* 👥 Social / Group Cart CTA */}
        <section className="max-w-7xl mx-auto px-4 py-4">
          <Link
            href="/social-cart"
            className="group flex items-center gap-4 w-full rounded-2xl bg-gradient-to-r from-[#00838F] to-[#006d75] p-4 hover:from-[#006d75] hover:to-[#005a5f] transition-all shadow-md shadow-[#00838F]/10 hover:shadow-lg hover:shadow-[#00838F]/20"
          >
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <span className="text-2xl">👥</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white">Group Cart — Shop Together in Real-Time</p>
              <p className="text-xs text-white/70 mt-0.5">Share a link. Friends add items. Nia keeps everyone safe. One cart, one checkout.</p>
            </div>
            <div className="shrink-0 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        </section>

        {/* 🆕 Manual product browser + live cart */}
        <ProductBrowsePanel />

        {/* AI-predicted reorder suggestions */}
        <ReorderRow />

        {/* Recurring ritual bundles (Module 4B) */}
        <RitualsRow />
        {/* Browse by category */}
        <CategoryGrid />
      </main>

      {/* Footer — Amazon dark style */}
      <footer className="bg-[#232F3E] border-t border-[#3B4859] py-5 px-4 mt-0">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-bold text-white">amazon</span>
            <span className="font-bold text-[#FF9900]">now</span>
            <span className="text-white/30">·</span>
            <span className="text-white/50">Powered by</span>
            <span className="font-semibold text-[#00838F]">Nia</span>
          </div>
          <p className="text-xs text-white/30">
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
