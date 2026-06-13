'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import TopBar from "@/components/TopBar";
import ProductBrowsePanel from "@/components/ProductBrowsePanel";
import { useNiaChatStore } from "@/lib/useNiaStore";

function SearchPageContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';
  const { relatedProducts, activeQuery } = useNiaChatStore();

  return (
    <>
      <TopBar />
      <main className="flex-1 bg-gray-50 min-h-screen pt-4">
        <div className="max-w-7xl mx-auto px-4 pb-4">
          <h1 className="text-2xl font-bold text-[#0F1111]">
            Search results for <span className="text-[#00838F]">"{q || activeQuery}"</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {relatedProducts.length > 0 
              ? `Found ${relatedProducts.length} AI-curated items for your request.`
              : `Chat with Nia on the right to find the perfect items!`}
          </p>
        </div>
        
        {/* We reuse the awesome ProductBrowsePanel here! */}
        <div className="bg-white shadow-sm rounded-t-3xl overflow-hidden min-h-[70vh]">
          <ProductBrowsePanel />
        </div>
      </main>

      <footer className="border-t border-gray-100 py-6 px-4 bg-white">
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

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading search...</div>}>
      <SearchPageContent />
    </Suspense>
  );
}
