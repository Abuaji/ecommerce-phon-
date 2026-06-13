import { readClient } from './src/sanity/lib/client';
async function run() {
  const categories = await readClient.fetch(`*[_type == "category"]{title, "id": _id}`);
  console.log("CATEGORIES:", categories);
  const brands = await readClient.fetch(`*[_type == "brand"]{title, "id": _id}`);
  console.log("BRANDS:", brands);
}
run();
