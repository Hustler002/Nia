export type ProductCategory = 
  | 'Snacks' | 'Beverages' | 'Dairy' 
  | 'Electronics Accessories' | 'Health & Medicine' 
  | 'Party Supplies' | 'Pain Relief' | 'Health Devices'
  | 'Fitness & Protein' | 'Breakfast & Eggs' 
  | 'Personal Care' | 'Grocery Staples' | 'Instant Food';

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  subcategory: string;
  price: number;
  mrp: number;
  unit: string;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  tags: string[];
  attributes: Record<string, string>;
  inStock: boolean;
  eta_minutes: number;
  isOrganic?: boolean;
  isVegetarian?: boolean;
}

export const CATALOG: Product[] = [
  // Snacks
  { id: 'p-s1', name: "Lay's Classic Salted", brand: "Lay's", category: 'Snacks', subcategory: 'Chips', price: 50, mrp: 50, unit: '150g', rating: 4.5, reviewCount: 1200, imageUrl: '🥔', tags: ['chips', 'salty', 'potato', 'classic'], attributes: { Flavor: 'Salted', Type: 'Chips' }, inStock: true, eta_minutes: 10, isVegetarian: true },
  { id: 'p-s2', name: "Kurkure Masala Munch", brand: "Kurkure", category: 'Snacks', subcategory: 'Chips', price: 20, mrp: 20, unit: '90g', rating: 4.4, reviewCount: 800, imageUrl: '🌶️', tags: ['spicy', 'namkeen', 'crunchy'], attributes: { Flavor: 'Masala', Type: 'Corn Puffs' }, inStock: true, eta_minutes: 10, isVegetarian: true },
  { id: 'p-s3', name: "Haldiram's Aloo Bhujia", brand: "Haldiram's", category: 'Snacks', subcategory: 'Namkeen', price: 55, mrp: 65, unit: '200g', rating: 4.8, reviewCount: 5000, imageUrl: '🥜', tags: ['bhujia', 'namkeen', 'spicy', 'crunchy'], attributes: { Flavor: 'Spicy', Type: 'Namkeen' }, inStock: true, eta_minutes: 11, isVegetarian: true },
  { id: 'p-s4', name: "Cornitos Nacho Cheese", brand: "Cornitos", category: 'Snacks', subcategory: 'Chips', price: 40, mrp: 45, unit: '150g', rating: 4.3, reviewCount: 600, imageUrl: '🌮', tags: ['nachos', 'cheese', 'chips', 'mexican'], attributes: { Flavor: 'Cheese', Type: 'Nachos' }, inStock: true, eta_minutes: 12, isVegetarian: true },
  { id: 'p-s5', name: "Oreo Original", brand: "Oreo", category: 'Snacks', subcategory: 'Biscuits', price: 40, mrp: 45, unit: '120g', rating: 4.6, reviewCount: 3000, imageUrl: '🍪', tags: ['biscuit', 'cookie', 'sweet', 'chocolate', 'cream'], attributes: { Flavor: 'Chocolate', Type: 'Cookie' }, inStock: true, eta_minutes: 9, isVegetarian: true },
  { id: 'p-s6', name: "Parle-G Original", brand: "Parle", category: 'Snacks', subcategory: 'Biscuits', price: 10, mrp: 10, unit: '130g', rating: 4.7, reviewCount: 8000, imageUrl: '🍪', tags: ['biscuit', 'tea', 'classic', 'glucose'], attributes: { Flavor: 'Glucose', Type: 'Biscuit' }, inStock: true, eta_minutes: 8, isVegetarian: true },
  { id: 'p-s7', name: "ACT II Butter Popcorn", brand: "ACT II", category: 'Snacks', subcategory: 'Popcorn', price: 45, mrp: 50, unit: '3x30g', rating: 4.2, reviewCount: 1500, imageUrl: '🍿', tags: ['popcorn', 'butter', 'movie', 'microwave', 'sugar free', 'sugar-free'], attributes: { Flavor: 'Butter', Type: 'Popcorn' }, inStock: true, eta_minutes: 10, isVegetarian: true },
  { id: 'p-s8', name: "Hershey's Chocolate Syrup", brand: "Hershey's", category: 'Snacks', subcategory: 'Sauces & Dips', price: 65, mrp: 75, unit: '200g', rating: 4.5, reviewCount: 900, imageUrl: '🍫', tags: ['chocolate', 'syrup', 'sweet', 'dessert'], attributes: { Flavor: 'Chocolate', Type: 'Syrup' }, inStock: true, eta_minutes: 14, isVegetarian: true },

  // Beverages
  { id: 'p-b1', name: "Pepsi Cola", brand: "Pepsi", category: 'Beverages', subcategory: 'Soft Drinks', price: 85, mrp: 90, unit: '2L', rating: 4.4, reviewCount: 2000, imageUrl: '🥤', tags: ['cola', 'cold drink', 'soda'], attributes: { Flavor: 'Cola', Sugar: 'Regular' }, inStock: true, eta_minutes: 10, isVegetarian: true },
  { id: 'p-b2', name: "Sprite Clear", brand: "Coca-Cola", category: 'Beverages', subcategory: 'Soft Drinks', price: 85, mrp: 90, unit: '2L', rating: 4.5, reviewCount: 1800, imageUrl: '🍋', tags: ['lemon', 'clear', 'cold drink', 'soda'], attributes: { Flavor: 'Lemon', Sugar: 'Regular' }, inStock: true, eta_minutes: 11, isVegetarian: true },
  { id: 'p-b3', name: "Real Fruit Power Mixed Fruit", brand: "Real", category: 'Beverages', subcategory: 'Juices', price: 110, mrp: 120, unit: '1L', rating: 4.3, reviewCount: 1100, imageUrl: '🧃', tags: ['juice', 'fruit', 'mixed', 'healthy'], attributes: { Flavor: 'Mixed Fruit', Type: 'Juice' }, inStock: true, eta_minutes: 10, isVegetarian: true },
  { id: 'p-b4', name: "Amul Kool Cafe", brand: "Amul", category: 'Beverages', subcategory: 'Dairy Drinks', price: 25, mrp: 25, unit: '200ml', rating: 4.6, reviewCount: 750, imageUrl: '☕', tags: ['coffee', 'milk', 'cold coffee'], attributes: { Flavor: 'Coffee', Type: 'Milk Drink' }, inStock: true, eta_minutes: 9, isVegetarian: true },
  { id: 'p-b5', name: "Minute Maid Pulpy Orange", brand: "Coca-Cola", category: 'Beverages', subcategory: 'Juices', price: 90, mrp: 99, unit: '1L', rating: 4.4, reviewCount: 850, imageUrl: '🍊', tags: ['juice', 'orange', 'pulpy', 'sweet'], attributes: { Flavor: 'Orange', Type: 'Juice' }, inStock: true, eta_minutes: 12, isVegetarian: true },
  { id: 'p-b6', name: "Bisleri Mineral Water", brand: "Bisleri", category: 'Beverages', subcategory: 'Water', price: 20, mrp: 20, unit: '1L', rating: 4.8, reviewCount: 4000, imageUrl: '💧', tags: ['water', 'mineral', 'pure', 'hydration'], attributes: { Type: 'Water' }, inStock: true, eta_minutes: 8, isVegetarian: true },
  { id: 'p-b7', name: "Monster Energy Original", brand: "Monster", category: 'Beverages', subcategory: 'Energy Drinks', price: 120, mrp: 130, unit: '500ml', rating: 4.5, reviewCount: 3500, imageUrl: '⚡', tags: ['energy drink', 'gym', 'workout', 'pre-workout', 'caffeine', 'fitness'], attributes: { Caffeine: '160mg', Type: 'Energy Drink' }, inStock: true, eta_minutes: 12, isVegetarian: true },
  { id: 'p-b8', name: "Sting Energy Drink", brand: "PepsiCo", category: 'Beverages', subcategory: 'Energy Drinks', price: 30, mrp: 30, unit: '250ml', rating: 4.3, reviewCount: 5000, imageUrl: '⚡', tags: ['energy drink', 'gym', 'workout', 'caffeine', 'cheap'], attributes: { Caffeine: '80mg', Type: 'Energy Drink' }, inStock: true, eta_minutes: 9, isVegetarian: true },

  // Dairy
  { id: 'p-d1', name: "Amul Taaza Toned Milk", brand: "Amul", category: 'Dairy', subcategory: 'Milk', price: 54, mrp: 54, unit: '1L', rating: 4.9, reviewCount: 10000, imageUrl: '🥛', tags: ['milk', 'doodh', 'toned', 'daily'], attributes: { Fat: '3%', Type: 'Toned Milk' }, inStock: true, eta_minutes: 8, isVegetarian: true },
  { id: 'p-d2', name: "Amul Butter Pasteurized", brand: "Amul", category: 'Dairy', subcategory: 'Butter', price: 58, mrp: 58, unit: '100g', rating: 4.9, reviewCount: 8000, imageUrl: '🧈', tags: ['butter', 'makhan', 'salty', 'bread'], attributes: { Type: 'Salted Butter' }, inStock: true, eta_minutes: 9, isVegetarian: true },
  { id: 'p-d3', name: "Mother Dairy Classic Curd", brand: "Mother Dairy", category: 'Dairy', subcategory: 'Curd', price: 32, mrp: 32, unit: '400g', rating: 4.7, reviewCount: 3000, imageUrl: '🥣', tags: ['curd', 'dahi', 'yogurt'], attributes: { Type: 'Curd' }, inStock: true, eta_minutes: 8, isVegetarian: true },
  { id: 'p-d4', name: "Britannia Cheese Slices", brand: "Britannia", category: 'Dairy', subcategory: 'Cheese', price: 125, mrp: 130, unit: '200g (10 slices)', rating: 4.5, reviewCount: 2000, imageUrl: '🧀', tags: ['cheese', 'slice', 'burger', 'sandwich'], attributes: { Type: 'Processed Cheese' }, inStock: true, eta_minutes: 10, isVegetarian: true },
  { id: 'p-d5', name: "Amul Masti Spiced Buttermilk", brand: "Amul", category: 'Dairy', subcategory: 'Buttermilk', price: 15, mrp: 15, unit: '200ml', rating: 4.6, reviewCount: 1500, imageUrl: '🥛', tags: ['buttermilk', 'chaas', 'spiced', 'cooling'], attributes: { Flavor: 'Spiced', Type: 'Chaas' }, inStock: true, eta_minutes: 9, isVegetarian: true },
  { id: 'p-d6', name: "Epigamia Greek Yogurt - Blueberry", brand: "Epigamia", category: 'Dairy', subcategory: 'Yogurt', price: 60, mrp: 60, unit: '90g', rating: 4.4, reviewCount: 500, imageUrl: '🫐', tags: ['yogurt', 'greek', 'blueberry', 'healthy', 'protein', 'gym', 'post-workout'], attributes: { Flavor: 'Blueberry', Type: 'Greek Yogurt' }, inStock: true, eta_minutes: 12, isVegetarian: true },

  // Fitness & Protein
  { id: 'p-f1', name: "RiteBite Max Protein Bar - Choco", brand: "RiteBite", category: 'Fitness & Protein', subcategory: 'Protein Bars', price: 65, mrp: 75, unit: '67g', rating: 4.3, reviewCount: 2000, imageUrl: '🍫', tags: ['protein bar', 'gym', 'workout', 'fitness', 'protein', 'post-workout', 'muscle'], attributes: { Protein: '20g', Calories: '220 kcal' }, inStock: true, eta_minutes: 12, isVegetarian: true },
  { id: 'p-f2', name: "Yoga Bar Peanut Butter Crunch", brand: "Yoga Bar", category: 'Fitness & Protein', subcategory: 'Protein Bars', price: 80, mrp: 90, unit: '38g', rating: 4.5, reviewCount: 3000, imageUrl: '🥜', tags: ['protein bar', 'gym', 'fitness', 'peanut butter', 'energy bar', 'workout', 'healthy snack'], attributes: { Protein: '10g', Calories: '170 kcal' }, inStock: true, eta_minutes: 11, isVegetarian: true },
  { id: 'p-f3', name: "Saffola Oats Whey Protein Blend", brand: "Saffola", category: 'Fitness & Protein', subcategory: 'Supplements', price: 250, mrp: 299, unit: '250g', rating: 4.2, reviewCount: 800, imageUrl: '💪', tags: ['protein', 'whey', 'gym', 'muscle', 'fitness', 'supplement', 'workout'], attributes: { Protein: '26g per serving', Type: 'Whey Blend' }, inStock: true, eta_minutes: 15 },
  { id: 'p-f4', name: "MuscleBlaze Protein Shaker", brand: "MuscleBlaze", category: 'Fitness & Protein', subcategory: 'Gym Accessories', price: 299, mrp: 499, unit: '700ml', rating: 4.6, reviewCount: 12000, imageUrl: '🥤', tags: ['shaker', 'gym', 'protein shaker', 'bottle', 'fitness', 'workout accessories'], attributes: { Volume: '700ml', Material: 'BPA Free' }, inStock: true, eta_minutes: 14 },
  { id: 'p-f5', name: "Peanut Butter - Crunchy", brand: "Alpino", category: 'Fitness & Protein', subcategory: 'Nut Butters', price: 299, mrp: 350, unit: '400g', rating: 4.7, reviewCount: 8000, imageUrl: '🥜', tags: ['peanut butter', 'protein', 'gym', 'fitness', 'healthy', 'fats', 'workout'], attributes: { Protein: '28g per 100g', Type: 'Crunchy' }, inStock: true, eta_minutes: 13, isVegetarian: true },
  { id: 'p-f6', name: "Tata NutriCrunch Muesli", brand: "Tata", category: 'Fitness & Protein', subcategory: 'Cereals', price: 199, mrp: 225, unit: '400g', rating: 4.3, reviewCount: 1500, imageUrl: '🌾', tags: ['muesli', 'gym', 'healthy breakfast', 'oats', 'fitness', 'fiber', 'granola'], attributes: { Fiber: '6g per serving' }, inStock: true, eta_minutes: 13, isVegetarian: true },

  // Breakfast & Eggs
  { id: 'p-br1', name: "Fresho Eggs - White (Pack of 6)", brand: "Fresho", category: 'Breakfast & Eggs', subcategory: 'Eggs', price: 65, mrp: 72, unit: '6 eggs', rating: 4.7, reviewCount: 6000, imageUrl: '🥚', tags: ['eggs', 'anda', 'breakfast', 'protein', 'gym', 'healthy'], attributes: { Type: 'White Eggs' }, inStock: true, eta_minutes: 9 },
  { id: 'p-br2', name: "Britannia Brown Bread", brand: "Britannia", category: 'Breakfast & Eggs', subcategory: 'Bread', price: 45, mrp: 48, unit: '400g', rating: 4.5, reviewCount: 4000, imageUrl: '🍞', tags: ['bread', 'brown bread', 'breakfast', 'healthy', 'toast', 'whole wheat'], attributes: { Type: 'Brown Bread' }, inStock: true, eta_minutes: 10, isVegetarian: true },
  { id: 'p-br3', name: "Quaker Oats Original", brand: "Quaker", category: 'Breakfast & Eggs', subcategory: 'Oats', price: 99, mrp: 110, unit: '500g', rating: 4.8, reviewCount: 7000, imageUrl: '🌾', tags: ['oats', 'breakfast', 'healthy', 'fiber', 'gym', 'weight loss', 'diet'], attributes: { Type: 'Rolled Oats' }, inStock: true, eta_minutes: 10, isVegetarian: true },
  { id: 'p-br4', name: "Kellogg's Corn Flakes", brand: "Kellogg's", category: 'Breakfast & Eggs', subcategory: 'Cereals', price: 115, mrp: 130, unit: '250g', rating: 4.4, reviewCount: 3500, imageUrl: '🥣', tags: ['cereal', 'cornflakes', 'breakfast', 'kids'], attributes: { Type: 'Corn Flakes' }, inStock: true, eta_minutes: 11, isVegetarian: true },

  // Personal Care
  { id: 'p-pc1', name: "Dove Body Wash - Deep Moisture", brand: "Dove", category: 'Personal Care', subcategory: 'Body Wash', price: 199, mrp: 225, unit: '250ml', rating: 4.6, reviewCount: 5000, imageUrl: '🛁', tags: ['body wash', 'shower gel', 'bath', 'skin care', 'moisturizing', 'dove'], attributes: { Scent: 'Deep Moisture' }, inStock: true, eta_minutes: 13, isVegetarian: true },
  { id: 'p-pc2', name: "Colgate Strong Teeth Toothpaste", brand: "Colgate", category: 'Personal Care', subcategory: 'Oral Care', price: 75, mrp: 82, unit: '200g', rating: 4.8, reviewCount: 12000, imageUrl: '🦷', tags: ['toothpaste', 'colgate', 'teeth', 'oral care', 'daily'], attributes: { Type: 'Regular' }, inStock: true, eta_minutes: 9, isVegetarian: true },
  { id: 'p-pc3', name: "Head & Shoulders Classic Clean Shampoo", brand: "Head & Shoulders", category: 'Personal Care', subcategory: 'Hair Care', price: 199, mrp: 220, unit: '340ml', rating: 4.5, reviewCount: 8000, imageUrl: '🧴', tags: ['shampoo', 'dandruff', 'hair', 'anti-dandruff', 'scalp'], attributes: { Type: 'Anti-Dandruff' }, inStock: true, eta_minutes: 12, isVegetarian: true },
  { id: 'p-pc4', name: "Gillette Mach3 Razor", brand: "Gillette", category: 'Personal Care', subcategory: 'Shaving', price: 199, mrp: 250, unit: '1 unit', rating: 4.7, reviewCount: 9000, imageUrl: '🪒', tags: ['razor', 'shaving', 'gillette', 'grooming', 'beard'], attributes: { Blades: '3' }, inStock: true, eta_minutes: 14 },
  { id: 'p-pc5', name: "Fogg Black Body Deodorant", brand: "Fogg", category: 'Personal Care', subcategory: 'Deodorant', price: 175, mrp: 200, unit: '120ml', rating: 4.5, reviewCount: 6500, imageUrl: '💨', tags: ['deodorant', 'deo', 'fogg', 'fragrance', 'freshness', 'gym', 'sweat'], attributes: { Type: 'Body Spray' }, inStock: true, eta_minutes: 12 },

  // Grocery Staples
  { id: 'p-g1', name: "Tata Salt Iodised", brand: "Tata", category: 'Grocery Staples', subcategory: 'Salt & Spices', price: 25, mrp: 28, unit: '1kg', rating: 4.9, reviewCount: 15000, imageUrl: '🧂', tags: ['salt', 'namak', 'kitchen', 'grocery', 'staple', 'daily'], attributes: { Type: 'Iodised' }, inStock: true, eta_minutes: 8, isVegetarian: true },
  { id: 'p-g2', name: "Fortune Sunflower Oil", brand: "Fortune", category: 'Grocery Staples', subcategory: 'Cooking Oil', price: 155, mrp: 170, unit: '1L', rating: 4.6, reviewCount: 8000, imageUrl: '🛢️', tags: ['oil', 'sunflower oil', 'cooking oil', 'tel', 'kitchen'], attributes: { Type: 'Refined Sunflower Oil' }, inStock: true, eta_minutes: 10, isVegetarian: true },
  { id: 'p-g3', name: "Surf Excel Matic Liquid", brand: "Surf Excel", category: 'Grocery Staples', subcategory: 'Laundry', price: 249, mrp: 280, unit: '500ml', rating: 4.7, reviewCount: 10000, imageUrl: '🧺', tags: ['detergent', 'laundry', 'washing', 'surf excel', 'clothes'], attributes: { Type: 'Liquid Detergent' }, inStock: true, eta_minutes: 11, isVegetarian: true },
  { id: 'p-g4', name: "Vim Dishwash Gel", brand: "Vim", category: 'Grocery Staples', subcategory: 'Dishwash', price: 85, mrp: 95, unit: '500ml', rating: 4.6, reviewCount: 7000, imageUrl: '🍽️', tags: ['dishwash', 'vim', 'utensils', 'kitchen clean', 'bartan'], attributes: { Type: 'Gel' }, inStock: true, eta_minutes: 9, isVegetarian: true },

  // Instant Food
  { id: 'p-i1', name: "Maggi 2-Minute Noodles (Pack of 4)", brand: "Maggi", category: 'Instant Food', subcategory: 'Noodles', price: 72, mrp: 80, unit: '4x70g', rating: 4.8, reviewCount: 20000, imageUrl: '🍜', tags: ['maggi', 'noodles', 'instant', 'quick', 'midnight snack', 'hungry'], attributes: { Flavor: 'Masala', Cook: '2 minutes' }, inStock: true, eta_minutes: 9, isVegetarian: true },
  { id: 'p-i2', name: "MTR Ready to Eat Dal Makhani", brand: "MTR", category: 'Instant Food', subcategory: 'Ready to Eat', price: 90, mrp: 99, unit: '300g', rating: 4.4, reviewCount: 4000, imageUrl: '🍛', tags: ['dal makhani', 'ready to eat', 'instant food', 'mtr', 'dinner', 'lazy'], attributes: { Type: 'Ready to Eat', Serves: '2' }, inStock: true, eta_minutes: 11, isVegetarian: true },
  { id: 'p-i3', name: "Knorr Instant Soup - Hot & Sour", brand: "Knorr", category: 'Instant Food', subcategory: 'Soups', price: 45, mrp: 50, unit: '44g (3 servings)', rating: 4.3, reviewCount: 2500, imageUrl: '🍲', tags: ['soup', 'instant soup', 'hot and sour', 'winter', 'cold', 'sick'], attributes: { Flavor: 'Hot & Sour', Serves: '3' }, inStock: true, eta_minutes: 10, isVegetarian: true },

  // Electronics Accessories
  { id: 'p-e1', name: "boAt Airdopes 141", brand: "boAt", category: 'Electronics Accessories', subcategory: 'Earbuds', price: 1299, mrp: 4490, unit: '1 unit', rating: 4.3, reviewCount: 15000, imageUrl: '🎧', tags: ['earbuds', 'wireless', 'bluetooth', 'bass', 'boat', 'headphones'], attributes: { Battery: '42 hours', 'Driver Size': '8mm', ANC: 'No', 'Water Resistance': 'IPX4', Weight: '4.5g' }, inStock: true, eta_minutes: 15 },
  { id: 'p-e2', name: "Noise Buds VS104", brand: "Noise", category: 'Electronics Accessories', subcategory: 'Earbuds', price: 1099, mrp: 3499, unit: '1 unit', rating: 4.1, reviewCount: 8000, imageUrl: '🎵', tags: ['earbuds', 'wireless', 'bluetooth', 'noise', 'headphones', 'budget'], attributes: { Battery: '18 hours', 'Driver Size': '10mm', ANC: 'No', 'Water Resistance': 'IPX5', Weight: '5g' }, inStock: true, eta_minutes: 14 },
  { id: 'p-e3', name: "JBL Tune 115TWS", brand: "JBL", category: 'Electronics Accessories', subcategory: 'Earbuds', price: 1999, mrp: 4999, unit: '1 unit', rating: 4.2, reviewCount: 5000, imageUrl: '🔊', tags: ['earbuds', 'wireless', 'bluetooth', 'jbl', 'headphones', 'premium'], attributes: { Battery: '21 hours', 'Driver Size': '5.8mm', ANC: 'No', 'Water Resistance': 'None', Weight: '5.1g' }, inStock: true, eta_minutes: 16 },
  { id: 'p-e4', name: "Mi Braided USB-C Cable", brand: "Mi", category: 'Electronics Accessories', subcategory: 'Cables', price: 299, mrp: 399, unit: '1 unit', rating: 4.5, reviewCount: 12000, imageUrl: '🔌', tags: ['cable', 'usb-c', 'charging', 'mi', 'braided'], attributes: { Length: '1m', Type: 'USB to Type-C', FastCharge: 'Yes' }, inStock: true, eta_minutes: 12 },
  { id: 'p-e5', name: "Portronics PowerPRO 10000mAh", brand: "Portronics", category: 'Electronics Accessories', subcategory: 'Power Banks', price: 899, mrp: 1999, unit: '1 unit', rating: 4.3, reviewCount: 6000, imageUrl: '🔋', tags: ['power bank', 'battery', 'portable', 'charger'], attributes: { Capacity: '10000mAh', Ports: '2 USB, 1 Type-C' }, inStock: true, eta_minutes: 15 },

  // Health & Medicine
  { id: 'p-h1', name: "Crocin Advance 500mg", brand: "Crocin", category: 'Health & Medicine', subcategory: 'Medicine', price: 30, mrp: 32, unit: '15 tabs', rating: 4.8, reviewCount: 3000, imageUrl: '💊', tags: ['paracetamol', 'fever', 'headache', 'pain', 'medicine'], attributes: { Type: 'Tablet', Dose: '500mg' }, inStock: true, eta_minutes: 8 },
  { id: 'p-h2', name: "Dettol Antiseptic Liquid", brand: "Dettol", category: 'Health & Medicine', subcategory: 'First Aid', price: 110, mrp: 115, unit: '250ml', rating: 4.9, reviewCount: 5000, imageUrl: '🩹', tags: ['dettol', 'antiseptic', 'wound', 'first aid', 'clean'], attributes: { Type: 'Liquid' }, inStock: true, eta_minutes: 9 },
  { id: 'p-h3', name: "Electral ORS Powder", brand: "Electral", category: 'Health & Medicine', subcategory: 'Supplement', price: 48, mrp: 56, unit: '4 sachets', rating: 4.7, reviewCount: 2000, imageUrl: '💧', tags: ['ors', 'hydration', 'fever', 'energy', 'fluids', 'gym', 'electrolytes'], attributes: { Type: 'Powder' }, inStock: true, eta_minutes: 8 },
  { id: 'p-h4', name: "Vicks VapoRub", brand: "Vicks", category: 'Health & Medicine', subcategory: 'Cold Relief', price: 85, mrp: 90, unit: '50g', rating: 4.8, reviewCount: 4500, imageUrl: '🤧', tags: ['vicks', 'cold', 'cough', 'relief', 'rub'], attributes: { Type: 'Ointment' }, inStock: true, eta_minutes: 9 },
  { id: 'p-h5', name: "Supradyn Daily Multivitamin", brand: "Supradyn", category: 'Health & Medicine', subcategory: 'Vitamins', price: 55, mrp: 60, unit: '15 tabs', rating: 4.6, reviewCount: 1500, imageUrl: '💊', tags: ['vitamin', 'b complex', 'health', 'daily', 'immunity', 'gym', 'supplement'], attributes: { Type: 'Tablet' }, inStock: true, eta_minutes: 10 },
];


