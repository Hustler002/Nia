import assert from 'assert';
import { searchCatalog } from './searchEngine';

// Basic node runner for tests
function runTests() {
  console.log("Running searchEngine tests...");
  let passed = 0;
  let failed = 0;

  const testCases = [
    {
      name: "movie night for 4",
      run: () => {
        const results = searchCatalog("movie night for 4");
        assert(results.length > 0, "Should return results");
        // Should find snacks and beverages
        const hasSnacks = results.some(r => r.product.category === 'Snacks');
        const hasBeverages = results.some(r => r.product.category === 'Beverages');
        assert(hasSnacks && hasBeverages, "Should map to snacks and beverages");
      }
    },
    {
      name: "best earbuds under ₹2000 with bass",
      run: () => {
        const results = searchCatalog("best earbuds under ₹2000 with bass");
        assert(results.length > 0, "Should return results");
        // Should filter by price
        assert(results.every(r => r.product.price <= 2000), "All results must be under 2000");
        // Best rated should be first (JBL has 4.2, boAt has 4.3, so boAt first)
        assert(results[0].product.rating >= results[results.length - 1].product.rating, "Should sort by rating");
      }
    },
    {
      name: "sugar free snacks",
      run: () => {
        const results = searchCatalog("sugar free snacks");
        assert(results.length > 0, "Should return results");
        assert(results.some(r => r.product.category === 'Snacks'), "Should contain snacks");
      }
    },
    {
      name: "jaldi chahiye doodh",
      run: () => {
        const results = searchCatalog("jaldi chahiye doodh");
        assert(results.length > 0, "Should return results");
        // Should sort by fastest ETA
        assert(results[0].product.eta_minutes <= results[results.length - 1].product.eta_minutes, "Should sort by ETA");
        assert(results.some(r => r.product.tags.includes('milk') || r.product.name.toLowerCase().includes('milk')), "Should find milk");
      }
    },
    {
      name: "healthy chips",
      run: () => {
        const results = searchCatalog("healthy chips");
        assert(results.length > 0, "Should return results");
        assert(results.some(r => r.product.tags.includes('chips')), "Should find chips");
      }
    },
    {
      name: "I have a fever",
      run: () => {
        const results = searchCatalog("I have a fever");
        assert(results.length > 0, "Should return results");
        assert(results.every(r => r.product.category === 'Health & Medicine'), "Should only find health items");
      }
    },
    {
      name: "vegetarian diet options",
      run: () => {
        const results = searchCatalog("vegetarian diet options");
        assert(results.every(r => r.product.isVegetarian), "Should only return vegetarian items");
      }
    },
    {
      name: "exact keyword match - pepsi",
      run: () => {
        const results = searchCatalog("pepsi");
        assert(results[0].product.name.toLowerCase().includes("pepsi"), "First result should be Pepsi");
      }
    },
    {
      name: "fuzzy/typo match - crocin for paracetamol",
      run: () => {
        const results = searchCatalog("crocin");
        assert(results.some(r => r.product.name.toLowerCase().includes("crocin")), "Should match Crocin");
      }
    },
    {
      name: "price constraint check - max rs 30",
      run: () => {
        const results = searchCatalog("biscuits max 30");
        assert(results.length > 0, "Should return biscuits under 30");
        assert(results.every(r => r.product.price <= 30), "Should enforce max price");
      }
    }
  ];

  testCases.forEach(tc => {
    try {
      tc.run();
      console.log(`✅ PASS: ${tc.name}`);
      passed++;
    } catch (e: any) {
      console.error(`❌ FAIL: ${tc.name}`);
      console.error(`   ${e.message}`);
      failed++;
    }
  });

  console.log(`\nTests completed. Passed: ${passed}, Failed: ${failed}`);
  if (failed > 0) process.exit(1);
}

runTests();
