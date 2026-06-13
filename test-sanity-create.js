require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
  apiVersion: '2024-01-01',
});

async function run() {
  try {
    const doc = await client.create({
      _type: "brand",
      name: "Test Brand",
      slug: { _type: "slug", current: "test-brand" }
    });
    console.log("Success:", doc._id);
    await client.delete(doc._id);
    console.log("Deleted.");
  } catch (err) {
    console.error("Sanity Error:", err.message);
  }
}
run();
