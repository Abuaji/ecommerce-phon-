require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  useCdn: false,
  apiVersion: '2024-01-01',
});

const query = `*[_type == "product" && isActive == true] | order(_createdAt desc) {
    _id,
    name,
    "slug": slug.current,
    "mainImage": mainImage.asset->url,
    displayPrice,
    salePrice,
    "categories": categories[]->name,
    "brand": brand->name
  }`;

async function run() {
  const products = await client.fetch(query);
  console.log(`Query returned ${products.length} products`);
}

run().catch(console.error);
