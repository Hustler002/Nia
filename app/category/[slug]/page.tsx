// app/category/[slug]/page.tsx
// Category browsing page with filterable product grid
// Shows products for a given category with add-to-cart functionality
// Production: products from OpenSearch catalog aggregation

'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useNiaChatStore } from '@/lib/useNiaStore';

// ── Category Product Catalog ─────────────────────────────────────────────────

interface CatalogProduct {
  id: string;
  name: string;
  price: number;
  mrp: number;
  image: string;
  unit: string;
  category: string;
}

const CATEGORY_PRODUCTS: Record<string, CatalogProduct[]> = {
  groceries: [
    { id: 'g-001', name: 'India Gate Basmati Rice', price: 450, mrp: 499, image: '🍚', unit: '5kg', category: 'Groceries' },
    { id: 'g-002', name: 'Aashirvaad Atta', price: 280, mrp: 310, image: '🌾', unit: '5kg', category: 'Groceries' },
    { id: 'g-003', name: 'Toor Dal (Arhar)', price: 140, mrp: 160, image: '🫘', unit: '1kg', category: 'Groceries' },
    { id: 'g-004', name: 'Moong Dal', price: 75, mrp: 85, image: '🫛', unit: '500g', category: 'Groceries' },
    { id: 'g-005', name: 'Britannia Bread', price: 45, mrp: 50, image: '🍞', unit: '400g', category: 'Groceries' },
    { id: 'g-006', name: 'Maggi 2-Minute Noodles', price: 56, mrp: 60, image: '🍜', unit: '4-pack', category: 'Groceries' },
    { id: 'g-007', name: 'Saffola Gold Oil', price: 155, mrp: 170, image: '🫙', unit: '1L', category: 'Groceries' },
    { id: 'g-008', name: 'Tata Sugar', price: 48, mrp: 52, image: '🍬', unit: '1kg', category: 'Groceries' },
    { id: 'g-009', name: 'Red Label Tea', price: 185, mrp: 210, image: '🍵', unit: '500g', category: 'Groceries' },
    { id: 'g-010', name: 'Nescafé Classic Coffee', price: 250, mrp: 290, image: '☕', unit: '200g', category: 'Groceries' },
    { id: 'g-011', name: 'MTR Sambar Powder', price: 65, mrp: 75, image: '🌶️', unit: '200g', category: 'Groceries' },
    { id: 'g-012', name: 'MDH Garam Masala', price: 85, mrp: 95, image: '🧂', unit: '100g', category: 'Groceries' },
  ],
  'dairy-eggs': [
    { id: 'd-001', name: 'Amul Toned Milk', price: 30, mrp: 30, image: '🥛', unit: '1L', category: 'Dairy & Eggs' },
    { id: 'd-002', name: 'Amul Butter', price: 56, mrp: 56, image: '🧈', unit: '100g', category: 'Dairy & Eggs' },
    { id: 'd-003', name: 'Farm Fresh Eggs', price: 85, mrp: 95, image: '🥚', unit: '12 pcs', category: 'Dairy & Eggs' },
    { id: 'd-004', name: 'Mother Dairy Curd', price: 35, mrp: 40, image: '🍶', unit: '400g', category: 'Dairy & Eggs' },
    { id: 'd-005', name: 'Amul Cheese Slices', price: 120, mrp: 135, image: '🧀', unit: '200g', category: 'Dairy & Eggs' },
    { id: 'd-006', name: 'Amul Paneer', price: 90, mrp: 100, image: '🧱', unit: '200g', category: 'Dairy & Eggs' },
    { id: 'd-007', name: 'Amul Fresh Cream', price: 48, mrp: 52, image: '🥛', unit: '200ml', category: 'Dairy & Eggs' },
    { id: 'd-008', name: 'Go Cheese Spread', price: 95, mrp: 110, image: '🧀', unit: '200g', category: 'Dairy & Eggs' },
  ],
  'fruits-veg': [
    { id: 'fv-001', name: 'Bananas', price: 40, mrp: 45, image: '🍌', unit: '6 pcs', category: 'Fruits & Veg' },
    { id: 'fv-002', name: 'Apples (Shimla)', price: 180, mrp: 200, image: '🍎', unit: '1kg', category: 'Fruits & Veg' },
    { id: 'fv-003', name: 'Tomatoes', price: 35, mrp: 40, image: '🍅', unit: '500g', category: 'Fruits & Veg' },
    { id: 'fv-004', name: 'Onions', price: 30, mrp: 35, image: '🧅', unit: '1kg', category: 'Fruits & Veg' },
    { id: 'fv-005', name: 'Potatoes', price: 25, mrp: 30, image: '🥔', unit: '1kg', category: 'Fruits & Veg' },
    { id: 'fv-006', name: 'Spinach (Palak)', price: 20, mrp: 25, image: '🥬', unit: '250g', category: 'Fruits & Veg' },
    { id: 'fv-007', name: 'Green Chillies', price: 10, mrp: 15, image: '🌶️', unit: '100g', category: 'Fruits & Veg' },
    { id: 'fv-008', name: 'Oranges (Nagpur)', price: 120, mrp: 140, image: '🍊', unit: '1kg', category: 'Fruits & Veg' },
    { id: 'fv-009', name: 'Mangoes (Alphonso)', price: 350, mrp: 400, image: '🥭', unit: '1kg', category: 'Fruits & Veg' },
    { id: 'fv-010', name: 'Capsicum (Mixed)', price: 60, mrp: 70, image: '🫑', unit: '500g', category: 'Fruits & Veg' },
  ],
  'personal-care': [
    { id: 'pc-001', name: 'Colgate MaxFresh', price: 142, mrp: 165, image: '🪥', unit: '200g', category: 'Personal Care' },
    { id: 'pc-002', name: 'Head & Shoulders Shampoo', price: 210, mrp: 240, image: '🧴', unit: '340ml', category: 'Personal Care' },
    { id: 'pc-003', name: 'Dove Body Wash', price: 265, mrp: 299, image: '🧼', unit: '250ml', category: 'Personal Care' },
    { id: 'pc-004', name: 'Gillette Mach3 Razor', price: 295, mrp: 350, image: '🪒', unit: '1 pc', category: 'Personal Care' },
    { id: 'pc-005', name: 'Nivea Body Lotion', price: 199, mrp: 225, image: '🧴', unit: '200ml', category: 'Personal Care' },
    { id: 'pc-006', name: 'Dettol Hand Wash', price: 72, mrp: 80, image: '🧴', unit: '200ml', category: 'Personal Care' },
    { id: 'pc-007', name: 'Whisper Ultra Pads', price: 145, mrp: 165, image: '📦', unit: '15 pcs', category: 'Personal Care' },
    { id: 'pc-008', name: 'Vaseline Body Lotion', price: 175, mrp: 199, image: '🧴', unit: '300ml', category: 'Personal Care' },
  ],
  'baby-care': [
    { id: 'bc-001', name: 'Pampers Baby Diapers', price: 699, mrp: 799, image: '👶', unit: '46 pcs', category: 'Baby Care' },
    { id: 'bc-002', name: 'Johnson\'s Baby Shampoo', price: 180, mrp: 199, image: '🧴', unit: '200ml', category: 'Baby Care' },
    { id: 'bc-003', name: 'Cerelac Baby Food', price: 295, mrp: 325, image: '🍼', unit: '300g', category: 'Baby Care' },
    { id: 'bc-004', name: 'Himalaya Baby Cream', price: 85, mrp: 95, image: '🧴', unit: '100ml', category: 'Baby Care' },
    { id: 'bc-005', name: 'MamyPoko Pants', price: 550, mrp: 620, image: '👶', unit: '38 pcs', category: 'Baby Care' },
    { id: 'bc-006', name: 'Baby Wet Wipes', price: 99, mrp: 120, image: '🧻', unit: '80 pcs', category: 'Baby Care' },
  ],
  health: [
    { id: 'h-001', name: 'Crocin Advance', price: 30, mrp: 32, image: '💊', unit: '15 tabs', category: 'Health' },
    { id: 'h-002', name: 'Dettol Antiseptic', price: 72, mrp: 80, image: '🩹', unit: '125ml', category: 'Health' },
    { id: 'h-003', name: 'ORS Sachets', price: 48, mrp: 55, image: '💧', unit: '4-pack', category: 'Health' },
    { id: 'h-004', name: 'Band-Aid Strips', price: 60, mrp: 70, image: '🩹', unit: '30 pcs', category: 'Health' },
    { id: 'h-005', name: 'Vicks VapoRub', price: 125, mrp: 145, image: '🫁', unit: '50ml', category: 'Health' },
    { id: 'h-006', name: 'Volini Spray', price: 160, mrp: 185, image: '🩹', unit: '60g', category: 'Health' },
    { id: 'h-007', name: 'Dabur Chyawanprash', price: 250, mrp: 299, image: '🍯', unit: '500g', category: 'Health' },
    { id: 'h-008', name: 'Digital Thermometer', price: 150, mrp: 199, image: '🌡️', unit: '1 pc', category: 'Health' },
  ],
  electronics: [
    { id: 'e-001', name: 'boAt Airdopes 141', price: 1299, mrp: 2990, image: '🎧', unit: '1 pc', category: 'Electronics' },
    { id: 'e-002', name: 'Syska LED Bulb 9W', price: 99, mrp: 149, image: '💡', unit: '1 pc', category: 'Electronics' },
    { id: 'e-003', name: 'Ambrane Power Bank 10K', price: 799, mrp: 1299, image: '🔋', unit: '1 pc', category: 'Electronics' },
    { id: 'e-004', name: 'USB-C Charging Cable', price: 199, mrp: 399, image: '🔌', unit: '1m', category: 'Electronics' },
    { id: 'e-005', name: 'Mi Smart Band 8', price: 2499, mrp: 3499, image: '⌚', unit: '1 pc', category: 'Electronics' },
    { id: 'e-006', name: 'Portronics Speaker', price: 899, mrp: 1499, image: '🔊', unit: '1 pc', category: 'Electronics' },
  ],
  kitchen: [
    { id: 'k-001', name: 'Prestige Pressure Cooker', price: 1599, mrp: 2199, image: '🍳', unit: '3L', category: 'Kitchen' },
    { id: 'k-002', name: 'Milton Water Bottle', price: 299, mrp: 399, image: '🫗', unit: '1L', category: 'Kitchen' },
    { id: 'k-003', name: 'Cello Storage Container Set', price: 449, mrp: 599, image: '📦', unit: '5 pcs', category: 'Kitchen' },
    { id: 'k-004', name: 'Scotch-Brite Scrub Pad', price: 25, mrp: 30, image: '🧽', unit: '3 pcs', category: 'Kitchen' },
    { id: 'k-005', name: 'Vim Dishwash Gel', price: 99, mrp: 115, image: '🧴', unit: '500ml', category: 'Kitchen' },
    { id: 'k-006', name: 'Aluminium Foil Roll', price: 85, mrp: 99, image: '📄', unit: '9m', category: 'Kitchen' },
    { id: 'k-007', name: 'Cling Wrap', price: 65, mrp: 75, image: '📦', unit: '30m', category: 'Kitchen' },
    { id: 'k-008', name: 'Pigeon Kadai', price: 499, mrp: 699, image: '🍳', unit: '1 pc', category: 'Kitchen' },
  ],
};

// ── Product Card ─────────────────────────────────────────────────────────────

function ProductCard({ product }: { product: CatalogProduct }) {
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    useNiaChatStore.getState().addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      mrp: product.mrp,
      image: product.image,
      qty: 1,
      category: product.category,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const discount = product.mrp > product.price
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0;

  return (
    <div className="bg-white rounded-sm border border-[#D5D9D9] p-4 flex flex-col hover:shadow-md transition-shadow">
      {/* Product image */}
      <div className="text-center mb-3">
        <span className="text-4xl">{product.image}</span>
      </div>

      {/* Name */}
      <p className="text-sm font-medium text-[#0F1111] line-clamp-2 mb-1 flex-1">
        {product.name}
      </p>

      {/* Unit */}
      <p className="text-[11px] text-gray-400 mb-2">{product.unit}</p>

      {/* Price row */}
      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-base font-bold text-[#0F1111]">₹{product.price}</span>
        {discount > 0 && (
          <>
            <span className="text-xs text-gray-400 line-through">₹{product.mrp}</span>
            <span className="text-[10px] font-bold text-green-600">{discount}% off</span>
          </>
        )}
      </div>

      {/* Add to cart button */}
      <button
        onClick={handleAdd}
        disabled={added}
        className={`w-full py-2 text-xs font-bold rounded-md transition-all active:scale-[0.97] ${
          added
            ? 'bg-green-50 text-green-600 border border-green-200'
            : 'bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] shadow-sm'
        }`}
      >
        {added ? '✓ Added' : 'Add to cart'}
      </button>
    </div>
  );
}

// ── Main Category Page ───────────────────────────────────────────────────────

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = use(params);
  const [sortBy, setSortBy] = useState<'default' | 'price-low' | 'price-high' | 'discount'>('default');

  const categoryName = slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  const rawProducts = CATEGORY_PRODUCTS[slug] || [];

  const products = [...rawProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low': return a.price - b.price;
      case 'price-high': return b.price - a.price;
      case 'discount': {
        const dA = a.mrp > a.price ? (a.mrp - a.price) / a.mrp : 0;
        const dB = b.mrp > b.price ? (b.mrp - b.price) / b.mrp : 0;
        return dB - dA;
      }
      default: return 0;
    }
  });

  return (
    <div className="min-h-screen bg-[#EAEDED]">
      {/* Header */}
      <div className="bg-white border-b border-[#D5D9D9] sticky top-14 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="w-8 h-8 rounded-sm hover:bg-gray-100 flex items-center justify-center transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </Link>
            <div>
              <h1 className="text-lg font-bold text-[#0F1111]">{categoryName}</h1>
              <p className="text-xs text-gray-400">{products.length} items available</p>
            </div>
          </div>

          {/* Sort dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="text-xs border border-[#D5D9D9] rounded-sm px-3 py-1.5 bg-[#F7F8F8] text-[#0F1111] font-medium focus:border-[#007185] outline-none"
          >
            <option value="default">Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="discount">Biggest Discount</option>
          </select>
        </div>
      </div>

      {/* Product Grid */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <span className="text-5xl block mb-4">📦</span>
            <p className="text-lg font-bold text-[#0F1111] mb-2">Coming soon!</p>
            <p className="text-sm text-gray-500 mb-6">
              Products for {categoryName} are being added. Check back soon!
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#FFD814] text-[#0F1111] font-bold rounded-md hover:bg-[#F7CA00] transition-colors"
            >
              ← Back to home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
