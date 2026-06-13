export interface ComparisonTrigger {
  type: 'explicit_ids' | 'intent_based';
  query: string;
  productIds?: string[];
}

export function detectComparisonIntent(message: string): ComparisonTrigger | null {
  const lowerMsg = message.toLowerCase();

  if (lowerMsg.includes('compare') || 
      lowerMsg.includes('vs') || 
      lowerMsg.match(/(difference between|kaun sa loon|which should i buy)/)) {
    return {
      type: 'intent_based',
      query: message
    };
  }

  return null;
}
