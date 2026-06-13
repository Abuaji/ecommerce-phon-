// ==========================================
// RECONCILED SANITY GROQ QUERIES
// Fully maps to src/sanity/schemas/*.ts
// ==========================================

export const ALL_PRODUCTS_QUERY = `
  *[_type == "product" && isActive == true] | order(_createdAt desc) {
    _id,
    name,
    "slug": slug.current,
    "imageUrl": mainImage.asset->url,
    "price": displayPrice,
    "discountPrice": mrp,
    "category": category->name,
    "brand": brand->name
  }
`;

export const NEW_ARRIVALS_QUERY = `
  *[_type == "product" && isActive == true && isNewArrival == true] | order(_createdAt desc)[0...10] {
    _id,
    name,
    "slug": slug.current,
    "imageUrl": mainImage.asset->url,
    "price": displayPrice,
    "discountPrice": mrp,
    "category": category->name,
    "brand": brand->name
  }
`;

export const TOP_SELLING_QUERY = `
  *[_type == "product" && isActive == true && isTrending == true] | order(_createdAt desc)[0...10] {
    _id,
    name,
    "slug": slug.current,
    "imageUrl": mainImage.asset->url,
    "price": displayPrice,
    "discountPrice": mrp,
    "category": category->name,
    "brand": brand->name
  }
`;

export const RELATED_PRODUCTS_QUERY = `
  *[_type == "product" && isActive == true && category->name == $categoryName && _id != $currentProductId] | order(_createdAt desc)[0...10] {
    _id,
    name,
    "slug": slug.current,
    "imageUrl": mainImage.asset->url,
    "price": displayPrice,
    "discountPrice": mrp,
    "category": category->name,
    "brand": brand->name
  }
`;

export const PRODUCT_BY_SLUG_QUERY = `
  *[_type == "product" && slug.current == $slug && isActive == true][0] {
    _id,
    name,
    "slug": slug.current,
    shortDescription,
    description,
    "mainImage": mainImage.asset->url,
    "images": gallery[].asset->url,
    "price": displayPrice,
    "discountPrice": mrp,
    "specifications": attributes,
    "compatibility": compatibleDevices[]->name,
    "category": category->name,
    "brand": brand->name,
    "seoTitle": seo.metaTitle,
    "seoDescription": seo.metaDescription
  }
`;

export const FEATURED_PRODUCTS_QUERY = `
  *[_type == "homepageSection" && sectionType == "featuredProducts" && isActive == true][0].products[]-> {
    _id,
    name,
    "slug": slug.current,
    "imageUrl": mainImage.asset->url,
    "price": displayPrice,
    "discountPrice": mrp
  }
`;

export const BANNERS_QUERY = `
  *[_type == "banner" && isActive == true] | order(displayOrder asc) {
    _id,
    "title": heading,
    "subtitle": subheading,
    "imageUrl": desktopImage.asset->url,
    "mobileImageUrl": mobileImage.asset->url,
    "link": primaryButtonUrl,
    "position": displayOrder
  }
`;

export const ALL_CATEGORIES_QUERY = `
  *[_type == "category" && isActive == true] | order(displayOrder asc) {
    _id,
    name,
    "slug": slug.current,
    "imageUrl": image.asset->url
  }
`;

export const ALL_BRANDS_QUERY = `
  *[_type == "brand" && isActive == true] | order(displayOrder asc) {
    _id,
    name,
    "slug": slug.current,
    "imageUrl": logo.asset->url
  }
`;

export const PRODUCTS_BY_CATEGORY_QUERY = `
  *[_type == "product" && category->slug.current == $slug && isActive == true] | order(_createdAt desc) {
    _id,
    name,
    "slug": slug.current,
    "imageUrl": mainImage.asset->url,
    "price": displayPrice,
    "discountPrice": mrp,
    "category": category->name,
    "brand": brand->name
  }
`;

export const CATEGORY_BY_SLUG_QUERY = `
  *[_type == "category" && slug.current == $slug && isActive == true][0] {
    _id,
    name,
    "slug": slug.current,
    "imageUrl": image.asset->url,
    description,
    seoTitle,
    seoDescription
  }
`;
