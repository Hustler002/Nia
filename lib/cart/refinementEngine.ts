import { CartBuildResult } from './cartBuilder';

export function refineCart(currentCart: CartBuildResult, refinement: string): CartBuildResult {
  const lowerRefinement = refinement.toLowerCase();
  const newCart = { ...currentCart, items: [...currentCart.items] };

  if (lowerRefinement.includes('cheaper') || lowerRefinement.includes('budget')) {
    // Naive mock logic: remove the most expensive item
    if (newCart.items.length > 0) {
      newCart.items.sort((a, b) => b.product.price * b.quantity - a.product.price * a.quantity);
      const removed = newCart.items.shift();
      newCart.totalPrice -= (removed!.product.price * removed!.quantity);
      newCart.reasoning = `Removed ${removed!.product.name} to fit a cheaper budget.`;
    }
  } else if (lowerRefinement.includes('add something sweet')) {
    // Add mock sweet item
    // In reality, this would call searchCatalog("sweet snacks")
    newCart.reasoning = `Added something sweet based on your request.`;
  }

  return newCart;
}
