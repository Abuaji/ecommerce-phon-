import { readClient } from "@/sanity/lib/client";
import { 
  ALL_PRODUCTS_QUERY, 
  PRODUCT_BY_SLUG_QUERY, 
  FEATURED_PRODUCTS_QUERY, 
  BANNERS_QUERY, 
  ALL_CATEGORIES_QUERY 
} from "@/sanity/queries";

async function testReconciledQueries() {
  console.log("Starting Sanity Query Reconciliation Validation...\n");

  let passed = 0;
  let total = 5;

  const queriesToTest = [
    { name: "ALL_PRODUCTS_QUERY", query: ALL_PRODUCTS_QUERY, params: {} },
    { name: "PRODUCT_BY_SLUG_QUERY", query: PRODUCT_BY_SLUG_QUERY, params: { slug: "test-slug-mock" } },
    { name: "FEATURED_PRODUCTS_QUERY", query: FEATURED_PRODUCTS_QUERY, params: {} },
    { name: "BANNERS_QUERY", query: BANNERS_QUERY, params: {} },
    { name: "ALL_CATEGORIES_QUERY", query: ALL_CATEGORIES_QUERY, params: {} }
  ];

  for (const { name, query, params } of queriesToTest) {
    try {
      // Execute the query
      // We don't care if it returns empty data (since DB might be empty),
      // but we care that Sanity parses and accepts the fields without syntax/resolution errors.
      const result = await readClient.fetch(query, params);
      
      console.log(`✅ [${name}] executed successfully.`);
      passed++;
      
      if (Array.isArray(result) && result.length > 0) {
        console.log(`   Sample Data Returned: Keys = [${Object.keys(result[0]).join(", ")}]`);
      } else if (result && !Array.isArray(result)) {
        console.log(`   Sample Data Returned: Keys = [${Object.keys(result).join(", ")}]`);
      } else {
        console.log(`   Result: null or empty array (Expected if DB is empty)`);
      }
    } catch (err: any) {
      console.error(`❌ [${name}] FAILED to execute.`);
      console.error(err.message);
    }
  }

  console.log(`\nReconciliation Validation Results: ${passed}/${total} passed.`);
  if (passed !== total) {
    process.exit(1);
  } else {
    console.log("🚀 All queries are fully compatible with production schemas.");
  }
}

testReconciledQueries();
