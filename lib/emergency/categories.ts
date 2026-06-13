export interface EmergencyItem {
  id: string;
  name: string;
  qty: number;
  price: number;
  image: string;
}

export interface EmergencyCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  triggerPhrases: string[];
  kit: EmergencyItem[];
}

export const EMERGENCY_CATEGORIES: EmergencyCategory[] = [
  {
    id: 'pet_emergency',
    name: 'Pet Emergency',
    icon: '🐾',
    color: '#8BC34A',
    // Pet triggers FIRST — more specific than 'sick' in fever_illness
    triggerPhrases: ['dog', 'cat', 'pet', 'puppy', 'kitten', 'paw', 'bark', 'meow', 'billi', 'kutta'],
    kit: [
      { id: 'e-pt1', name: 'Pedigree Adult 1kg', qty: 1, price: 240, image: '🐕' },
      { id: 'e-pt2', name: 'Pet Wipes', qty: 1, price: 150, image: '🧻' },
      { id: 'e-pt3', name: 'Dettol (Diluted)', qty: 1, price: 110, image: '🩹' },
      { id: 'e-pt4', name: 'Bandage Roll', qty: 2, price: 60, image: '🩹' },
    ]
  },
  {
    id: 'baby_care',
    name: 'Baby Care',
    icon: '👶',
    color: '#4FC3F7',
    triggerPhrases: ['baby', 'infant', 'diaper', 'formula', 'rash', 'newborn', 'bachcha', 'baccha'],
    kit: [
      { id: 'e-b1', name: 'Pampers Diapers', qty: 1, price: 399, image: '👶' },
      { id: 'e-b2', name: 'Baby Formula', qty: 1, price: 650, image: '🍼' },
      { id: 'e-b3', name: 'Baby Wipes', qty: 2, price: 180, image: '🧻' },
      { id: 'e-b4', name: 'Rash Cream', qty: 1, price: 150, image: '🧴' },
      { id: 'e-b5', name: 'Gripe Water', qty: 1, price: 80, image: '💧' },
    ]
  },
  {
    id: 'period_care',
    name: 'Period Care',
    icon: '🌸',
    color: '#EC407A',
    triggerPhrases: ['period', 'cramps', 'pads', 'sanitary', 'menstrual'],
    kit: [
      { id: 'e-p1', name: 'Whisper Pads (XL)', qty: 1, price: 120, image: '🌸' },
      { id: 'e-p2', name: 'Meftal Spas', qty: 1, price: 45, image: '💊' },
      { id: 'e-p3', name: 'Dark Chocolate', qty: 2, price: 200, image: '🍫' },
      { id: 'e-p4', name: 'Hot Water Bag', qty: 1, price: 250, image: '🎒' },
      { id: 'e-p5', name: 'Chamomile Tea', qty: 1, price: 180, image: '☕' },
    ]
  },
  {
    id: 'tech_rescue',
    name: 'Tech Rescue',
    icon: '⚡',
    color: '#5C6BC0',
    triggerPhrases: ['charger', 'cable', 'power bank', 'dead phone', 'battery dead', 'phone died'],
    kit: [
      { id: 'e-t1', name: 'Mi USB-C Cable', qty: 1, price: 299, image: '🔌' },
      { id: 'e-t2', name: 'Power Bank 10000mAh', qty: 1, price: 899, image: '🔋' },
      { id: 'e-t3', name: 'Screen Wipes', qty: 1, price: 99, image: '📱' },
    ]
  },
  {
    id: 'surprise_guests',
    name: 'Surprise Guests',
    icon: '🎉',
    color: '#FF9800',
    triggerPhrases: ['guests', 'visitors', 'mehman', 'surprise guest', 'people coming'],
    kit: [
      { id: 'e-g1', name: 'Chips & Dip Combo', qty: 2, price: 250, image: '🍟' },
      { id: 'e-g2', name: 'Assorted Cookies', qty: 2, price: 150, image: '🍪' },
      { id: 'e-g3', name: 'Cold Beverages Mix', qty: 3, price: 240, image: '🥤' },
      { id: 'e-g4', name: 'Disposable Cups', qty: 1, price: 50, image: '☕' },
      { id: 'e-g5', name: 'Paper Napkins', qty: 1, price: 40, image: '🧻' },
    ]
  },
  {
    id: 'kitchen_mishap',
    name: 'Kitchen Mishap',
    icon: '🍳',
    color: '#26A69A',
    triggerPhrases: ['khatam', 'no milk', 'no oil', 'no sugar', 'ran out', 'out of stock', 'khana'],
    kit: [
      { id: 'e-k1', name: 'Amul Butter', qty: 1, price: 58, image: '🧈' },
      { id: 'e-k2', name: 'Tata Salt', qty: 1, price: 25, image: '🧂' },
      { id: 'e-k3', name: 'Refined Sugar', qty: 1, price: 50, image: '🍬' },
      { id: 'e-k4', name: 'Cooking Oil 1L', qty: 1, price: 145, image: '🛢️' },
      { id: 'e-k5', name: 'Britannia Bread', qty: 1, price: 45, image: '🍞' },
    ]
  },
  {
    id: 'fever_illness',
    name: 'Fever & Illness',
    icon: '🤒',
    color: '#EF5350',
    // NOTE: 'sick' is here but checked AFTER pet_emergency above, so "dog sick" maps to Pet first
    triggerPhrases: ['fever', 'sick', 'unwell', 'cold', 'headache', 'body ache', 'bimaar', 'tabiyat', 'dard', 'medicine'],
    kit: [
      { id: 'e-f1', name: 'Paracetamol 500mg', qty: 1, price: 30, image: '💊' },
      { id: 'e-f2', name: 'Dettol Liquid', qty: 1, price: 110, image: '🩹' },
      { id: 'e-f3', name: 'ORS Sachets', qty: 4, price: 80, image: '💧' },
      { id: 'e-f4', name: 'Vicks VapoRub', qty: 1, price: 85, image: '🤧' },
      { id: 'e-f5', name: 'Thermometer', qty: 1, price: 250, image: '🌡️' },
    ]
  },
  {
    id: 'general_emergency',
    name: 'General Emergency',
    icon: '⚠️',
    color: '#FF7043',
    triggerPhrases: ['emergency', 'urgent', 'help me', 'asap'],
    kit: [
      { id: 'e-ge1', name: 'Bottled Water 5L', qty: 1, price: 65, image: '💧' },
      { id: 'e-ge2', name: 'First Aid Kit', qty: 1, price: 299, image: '🩹' },
      { id: 'e-ge3', name: 'Torch & Batteries', qty: 1, price: 150, image: '🔦' },
      { id: 'e-ge4', name: 'Phone Charger', qty: 1, price: 399, image: '🔌' },
    ]
  }
];

// Priority-aware detection: first match wins (order in array = priority)
export function detectEmergencyCategory(query: string): EmergencyCategory | null {
  const lowerQuery = query.toLowerCase();
  
  for (const cat of EMERGENCY_CATEGORIES) {
    if (cat.triggerPhrases.some(phrase => lowerQuery.includes(phrase))) {
      return cat;
    }
  }
  
  return null;
}

