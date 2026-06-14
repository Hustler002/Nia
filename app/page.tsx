import HeroSection from "@/components/HeroSection";
import EmergencyBanner from "@/components/EmergencyBanner";
import ReorderRow from "@/components/ReorderRow";
import { RitualsRow } from "@/components/Rituals";
import CategoryGrid from "@/components/CategoryGrid";

export default function HomePage() {
  return (
    <main className="flex-1">
      {/* Hero: Nia conversational input — the centerpiece */}
      <HeroSection />

      {/* Emergency CTA strip */}
      <EmergencyBanner />

      {/* AI-predicted reorder suggestions */}
      <ReorderRow />

      {/* Recurring ritual bundles */}
      <RitualsRow />

      {/* Browse by category */}
      <CategoryGrid />

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
    </main>
  );
}
