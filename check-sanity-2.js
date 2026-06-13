require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
  apiVersion: '2024-01-01',
});

async function run() {
  const products = await client.fetch('*[_type == "product"]{name, sku, _id}');
  console.log(`Found ${products.length} products`);
  const categories = await client.fetch('*[_type == "category"]{name, _id}');
  console.log(`Found ${categories.length} categories:`, categories.map(c => c.name).join(', '));
}

run().catch(console.error);
