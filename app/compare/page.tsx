import { compareProducts } from '@/lib/comparisons/compareEngine';
import AddToCartButton from './AddToCartButton';

export default async function ComparePage({ searchParams }: { searchParams: Promise<{ ids?: string }> }) {
  const params = await searchParams;
  const idsParam = params.ids || '';
  const ids = idsParam.split(',').filter(Boolean);

  if (ids.length === 0) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center">
        <h1 className="text-2xl font-bold mb-4">No products selected for comparison</h1>
        <p className="text-gray-500">Please return to the chat and ask Nia to compare items.</p>
      </div>
    );
  }

  let result;
  try {
    result = compareProducts(ids);
  } catch (e: any) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center">
        <h1 className="text-2xl font-bold mb-4">Comparison Error</h1>
        <p className="text-red-500">{e.message}</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Detailed Comparison</h1>
      <p className="text-gray-600 mb-8">Comparing {result.products.length} items</p>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="p-4 border-b border-gray-200 bg-gray-50 w-1/4">Features</th>
              {result.products.map(p => (
                <th key={p.id} className={`p-4 border-b border-gray-200 bg-white min-w-[200px] ${p.id === result.bestPickId ? 'border-t-4 border-t-teal-500' : ''}`}>
                  {p.id === result.bestPickId && (
                    <div className="text-xs font-bold text-teal-600 uppercase tracking-wider mb-2">⭐ Nia's Pick</div>
                  )}
                  <div className="text-4xl mb-2">{p.imageUrl}</div>
                  <div className="font-semibold text-lg">{p.name}</div>
                  <div className="text-gray-500 text-sm">{p.brand}</div>
                  <div className="font-bold text-xl mt-2">₹{p.price}</div>
                  <AddToCartButton product={p} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.attributes.map(attr => (
              <tr key={attr.key} className="hover:bg-gray-50 transition-colors border-b border-gray-100">
                <td className="p-4 font-medium text-gray-700 bg-gray-50">{attr.key}</td>
                {result.products.map(p => {
                  const isWinner = attr.winner === p.id;
                  return (
                    <td key={p.id} className={`p-4 ${isWinner ? 'bg-green-50 text-green-800 font-medium' : 'text-gray-600'}`}>
                      {attr.values[p.id] || '-'}
                      {isWinner && <span className="ml-2 inline-block">✨</span>}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-12 bg-teal-50 border border-teal-100 p-6 rounded-xl flex gap-4 items-start">
        <div className="w-10 h-10 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold text-xl shrink-0">N</div>
        <div>
          <h3 className="text-lg font-bold text-teal-900 mb-2">Why Nia recommends {result.products.find(p => p.id === result.bestPickId)?.name}</h3>
          <p className="text-teal-800">{result.bestPickReason}</p>
        </div>
      </div>
    </div>
  );
}
