import { searchCatalog } from '../catalog/searchEngine';
import { compareProducts } from '../comparisons/compareEngine';
import { buildCart } from '../cart/cartBuilder';
import { EMERGENCY_CATEGORIES } from '../emergency/categories';

export async function executeMockTool(toolName: string, toolArgs: any) {
  switch (toolName) {
    case 'search_catalog':
      const results = searchCatalog(toolArgs.query, toolArgs.filters);
      return { products: results.map(r => r.product), totalFound: results.length };

    case 'compare_products':
      return compareProducts(toolArgs.product_ids, toolArgs.attributes ? toolArgs.attributes.join(', ') : undefined);

    case 'build_cart':
      return buildCart(toolArgs.intent, toolArgs.constraints);

    case 'check_inventory_eta':
      return { availability: toolArgs.product_ids.map((id: string) => ({ productId: id, inStock: true, eta_minutes: 10, store: 'Central Hub' })) };

    case 'get_user_profile':
      return { name: 'Priya Sharma', preferences: [], dietary_restrictions: ['vegetarian'], reorder_cycles: { 'Amul Milk': 3, 'Colgate Toothpaste': 38 }, past_orders: [] };

    case 'track_order':
      return { orders: [{ id: toolArgs.order_id || 'ord_123', status: 'Out for delivery', eta: '5 mins', items: [] }] };

    case 'apply_substitution':
      return { original: { id: toolArgs.product_id }, substitute: { id: 'mock_sub_id', name: 'Mock Substitute' }, matchScore: 90 };

    case 'generate_emergency_kit':
      const catId = toolArgs.category;
      const category = EMERGENCY_CATEGORIES.find(c => c.id === catId) || EMERGENCY_CATEGORIES.find(c => c.id === 'general_emergency');
      if (!category) throw new Error("No emergency category found");
      
      return {
        category: category.name,
        name: `${category.name} Kit`,
        items: category.kit.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          mrp: item.price + 20,
          image: item.image,
          qty: item.qty,
          category: category.name
        })),
        totalPrice: category.kit.reduce((sum, item) => sum + item.price * item.qty, 0),
        eta: '~10 min'
      };

    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}
