import { Package } from "lucide-react";

export const product = {
  name: "product",
  title: "Product",
  type: "document",
  icon: Package,
  groups: [
    { name: "general", title: "General" },
    { name: "pricing", title: "Pricing" },
    { name: "media", title: "Media" },
    { name: "relationships", title: "Relationships" },
    { name: "attributes", title: "Attributes" },
    { name: "visibility", title: "Visibility" },
    { name: "seo", title: "SEO & Search" },
  ],
  fields: [
    // --- GENERAL ---
    {
      name: "name",
      title: "Product Name",
      type: "string",
      group: "general",
      validation: (Rule: any) => Rule.required().error("Product name is required"),
    },
    {
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "general",
      options: {
        source: "name",
        maxLength: 96,
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "sku",
      title: "SKU (Stock Keeping Unit)",
      type: "string",
      group: "general",
      description: "Must be a unique identifier across the entire catalog.",
      validation: (Rule: any) =>
        Rule.required().custom(async (sku: string, context: any) => {
          if (!sku) return true; // Handled by required()

          // Custom async validation for SKU uniqueness
          const documentId = context.document?._id?.replace("drafts.", "");
          const query = `*[
            _type == "product" && 
            sku == $sku && 
            !(_id in [$documentId, "drafts." + $documentId])
          ][0]`;
          
          const params = { sku, documentId };
          const result = await context.getClient({ apiVersion: "2024-01-01" }).fetch(query, params);

          if (result) {
            return `SKU must be unique. Another product already uses ${sku}.`;
          }

          return true;
        }),
    },
    {
      name: "shortDescription",
      title: "Short Description",
      type: "text",
      group: "general",
      rows: 3,
      validation: (Rule: any) => Rule.max(200).warning("Keep it short and punchy for product cards."),
    },
    {
      name: "description",
      title: "Full Description",
      type: "array",
      group: "general",
      of: [{ type: "block" }],
    },

    // --- RELATIONSHIPS ---
    {
      name: "category",
      title: "Category",
      type: "reference",
      to: [{ type: "category" }],
      group: "relationships",
    },
    {
      name: "brand",
      title: "Brand",
      type: "reference",
      to: [{ type: "brand" }],
      group: "relationships",
    },
    {
      name: "compatibleDevices",
      title: "Compatible Devices",
      type: "array",
      group: "relationships",
      of: [
        {
          type: "reference",
          to: [{ type: "device" }],
        },
      ],
    },

    // --- MEDIA ---
    {
      name: "mainImage",
      title: "Main Image",
      type: "image",
      group: "media",
      options: {
        hotspot: true,
      },
      validation: (Rule: any) => Rule.required().error("A main product image is required."),
      fields: [
        {
          name: "alt",
          title: "Alternative Text",
          type: "string",
          description: "Important for SEO and accessibility.",
        },
      ],
    },
    {
      name: "gallery",
      title: "Gallery Images",
      type: "array",
      group: "media",
      of: [
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            {
              name: "alt",
              title: "Alternative Text",
              type: "string",
            },
          ],
        },
      ],
    },

    // --- PRICING ---
    {
      name: "displayPrice",
      title: "Display Price",
      type: "number",
      group: "pricing",
      validation: (Rule: any) => Rule.required().min(0.01).error("Display price must be greater than 0."),
    },
    {
      name: "mrp",
      title: "Maximum Retail Price (MRP)",
      type: "number",
      group: "pricing",
      validation: (Rule: any) =>
        Rule.custom((mrp: number, context: any) => {
          const doc = context.document as any;
          if (mrp && doc.displayPrice && mrp < doc.displayPrice) {
            return "MRP cannot be lower than the display price.";
          }
          return true;
        }),
    },

    // --- ATTRIBUTES ---
    {
      name: "attributes",
      title: "Product Attributes",
      type: "array",
      group: "attributes",
      description: "Flexible key-value pairs (e.g., Color: Red, Wattage: 20W).",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "name",
              title: "Name",
              type: "string",
              validation: (Rule: any) => Rule.required(),
            },
            {
              name: "value",
              title: "Value",
              type: "string",
              validation: (Rule: any) => Rule.required(),
            },
          ],
          preview: {
            select: {
              title: "name",
              subtitle: "value",
            },
          },
        },
      ],
    },

    // --- VISIBILITY ---
    {
      name: "isActive",
      title: "Active",
      type: "boolean",
      group: "visibility",
      description: "If false, the product will be hidden from the storefront.",
      initialValue: true,
    },
    {
      name: "isFeatured",
      title: "Featured",
      type: "boolean",
      group: "visibility",
      initialValue: false,
    },
    {
      name: "isTrending",
      title: "Trending",
      type: "boolean",
      group: "visibility",
      initialValue: false,
    },
    {
      name: "isNewArrival",
      title: "New Arrival",
      type: "boolean",
      group: "visibility",
      initialValue: false,
    },

    // --- SEO & SEARCH ---
    {
      name: "seo",
      title: "SEO Metadata",
      type: "object",
      group: "seo",
      fields: [
        {
          name: "metaTitle",
          title: "Meta Title",
          type: "string",
        },
        {
          name: "metaDescription",
          title: "Meta Description",
          type: "text",
          rows: 3,
        },
        {
          name: "openGraphImage",
          title: "Open Graph Image",
          type: "image",
        },
      ],
    },
    {
      name: "searchKeywords",
      title: "Search Keywords",
      type: "array",
      group: "seo",
      of: [{ type: "string" }],
      options: {
        layout: "tags",
      },
    },
    {
      name: "searchSynonyms",
      title: "Search Synonyms",
      type: "array",
      group: "seo",
      of: [{ type: "string" }],
      options: {
        layout: "tags",
      },
    },
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "sku",
      media: "mainImage",
      isActive: "isActive",
    },
    prepare({ title, subtitle, media, isActive }: any) {
      return {
        title: title || "Unnamed Product",
        subtitle: `SKU: ${subtitle || "N/A"} ${isActive ? "" : "(Hidden)"}`,
        media,
      };
    },
  },
};
