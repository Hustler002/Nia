'use client';

import { useState } from 'react';
import { useNiaChatStore } from '@/lib/useNiaStore';

export default function AddToCartButton({ product }: { product: { id: string; name: string; price: number; imageUrl: string; category: string } }) {
  const [added, setAdded] = useState(false);
  
  const handleAdd = () => {
    useNiaChatStore.getState().addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      mrp: product.price,
      image: product.imageUrl,
      qty: 1,
      category: product.category,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <button
      onClick={handleAdd}
      className={`mt-4 w-full font-medium py-2 rounded-md transition-colors ${
        added
          ? 'bg-green-500 text-white'
          : 'bg-orange-500 text-white hover:bg-orange-600'
      }`}
    >
      {added ? '✓ Added!' : 'Add to Cart'}
    </button>
  );
}
