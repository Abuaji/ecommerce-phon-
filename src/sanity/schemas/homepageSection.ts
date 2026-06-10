import { LayoutTemplate } from "lucide-react";

export const homepageSection = {
  name: "homepageSection",
  title: "Homepage Section",
  type: "document",
  icon: LayoutTemplate,
  groups: [
    { name: "core", title: "Core & Type" },
    { name: "content", title: "Text Content" },
    { name: "references", title: "Linked Items" },
    { name: "visibility", title: "Visibility" },
  ],
  fields: [
    // --- CORE & TYPE ---
    {
      name: "sectionName",
      title: "Section Name (Public)",
      type: "string",
      group: "core",
      description: "Used as a heading fallback if Section Title is empty.",
    },
    {
      name: "internalName",
      title: "Internal Name",
      type: "string",
      group: "core",
      validation: (Rule: any) => Rule.required(),
      description: "E.g., Summer Promo Carousel, Featured Cases Row 1",
    },
    {
      name: "sectionType",
      title: "Section Type",
      type: "string",
      group: "core",
      options: {
        list: [
          { title: "Hero", value: "hero" },
          { title: "Featured Products", value: "featuredProducts" },
          { title: "Featured Categories", value: "featuredCategories" },
          { title: "Featured Brands", value: "featuredBrands" },
          { title: "Flash Sale Focus", value: "flashSaleFocus" },
          { title: "Offer Promotion", value: "offerPromotion" },
          { title: "Banner Grid", value: "bannerGrid" },
          { title: "Custom Content", value: "customContent" },
        ],
        layout: "dropdown",
      },
      validation: (Rule: any) => Rule.required(),
    },

    // --- TEXT CONTENT ---
    {
      name: "sectionTitle",
      title: "Section Title",
      type: "string",
      group: "content",
    },
    {
      name: "sectionDescription",
      title: "Section Description",
      type: "text",
      group: "content",
      rows: 2,
    },

    // --- VISIBILITY ---
    {
      name: "isActive",
      title: "Active Status",
      type: "boolean",
      group: "visibility",
      initialValue: true,
    },
    {
      name: "displayOrder",
      title: "Display Order",
      type: "number",
      group: "visibility",
      initialValue: 0,
      validation: (Rule: any) => Rule.required().integer(),
    },

    // --- REFERENCES ---
    {
      name: "products",
      title: "Selected Products",
      type: "array",
      group: "references",
      of: [{ type: "reference", to: [{ type: "product" }] }],
      hidden: ({ document }: any) =>
        !["featuredProducts"].includes(document?.sectionType),
    },
    {
      name: "categories",
      title: "Selected Categories",
      type: "array",
      group: "references",
      of: [{ type: "reference", to: [{ type: "category" }] }],
      hidden: ({ document }: any) => document?.sectionType !== "featuredCategories",
    },
    {
      name: "brands",
      title: "Selected Brands",
      type: "array",
      group: "references",
      of: [{ type: "reference", to: [{ type: "brand" }] }],
      hidden: ({ document }: any) => document?.sectionType !== "featuredBrands",
    },
    {
      name: "banners",
      title: "Selected Banners",
      type: "array",
      group: "references",
      of: [{ type: "reference", to: [{ type: "banner" }] }],
      hidden: ({ document }: any) =>
        !["hero", "bannerGrid"].includes(document?.sectionType),
    },
    {
      name: "flashSales",
      title: "Selected Flash Sales",
      type: "array",
      group: "references",
      of: [{ type: "reference", to: [{ type: "flashSale" }] }],
      hidden: ({ document }: any) => document?.sectionType !== "flashSaleFocus",
    },
    {
      name: "offers",
      title: "Selected Offers",
      type: "array",
      group: "references",
      of: [{ type: "reference", to: [{ type: "offer" }] }],
      hidden: ({ document }: any) => document?.sectionType !== "offerPromotion",
    },
    {
      name: "customContent",
      title: "Custom Block Content",
      type: "array",
      group: "references",
      of: [{ type: "block" }],
      hidden: ({ document }: any) => document?.sectionType !== "customContent",
    },
  ],
  preview: {
    select: {
      title: "internalName",
      subtitle: "sectionType",
      isActive: "isActive",
    },
    prepare({ title, subtitle, isActive }: any) {
      return {
        title: title || "Unnamed Section",
        subtitle: `Type: ${subtitle || "None"} ${isActive ? "" : "(Hidden)"}`,
      };
    },
  },
};
