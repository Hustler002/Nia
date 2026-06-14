// app/category/[slug]/page.tsx
// Stub page for category browsing
// Production: fetch products from OpenSearch by category, with filters and sorting

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const categoryName = slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#EAEDED] px-4">
      <div className="text-center max-w-md">
        <h1 className="text-3xl font-bold text-[#0F1111] mb-3">{categoryName}</h1>
        <p className="text-gray-500 mb-6">
          Browse products in {categoryName}. This page will show a filterable product grid
          powered by OpenSearch.
        </p>
        <a
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#FFD814] text-[#0F1111] font-bold rounded-md hover:bg-[#F7CA00] transition-colors"
        >
          ← Back to home
        </a>
      </div>
    </div>
  );
}
