import { Tag } from "lucide-react";

export const offer = {
  name: "offer",
  title: "Offer & Promotion",
  type: "document",
  icon: Tag,
  groups: [
    { name: "core", title: "Core Information" },
    { name: "display", title: "Display Content" },
    { name: "config", title: "Configuration" },
    { name: "relationships", title: "Relationships" },
    { name: "visibility", title: "Visibility" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    // --- CORE INFO ---
    {
      name: "name",
      title: "Offer Name (Public)",
      type: "string",
      group: "core",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "internalName",
      title: "Internal Name",
      type: "string",
      group: "core",
      description: "For internal admin tracking (e.g. 'Summer Launch 2024 - 10% Off')",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "core",
      options: { source: "internalName", maxLength: 96 },
      validation: (Rule: any) => Rule.required(),
    },

    // --- DISPLAY CONTENT ---
    {
      name: "heading",
      title: "Heading",
      type: "string",
      group: "display",
    },
    {
      name: "subheading",
      title: "Subheading",
      type: "string",
      group: "display",
    },
    {
      name: "description",
      title: "Description",
      type: "text",
      group: "display",
      rows: 3,
    },
    {
      name: "banner",
      title: "Promotional Banner",
      type: "image",
      group: "display",
      options: { hotspot: true },
    },

    // --- OFFER CONFIGURATION ---
    {
      name: "offerType",
      title: "Offer Type",
      type: "string",
      group: "config",
      options: {
        list: [
          { title: "Sale", value: "sale" },
          { title: "Clearance", value: "clearance" },
          { title: "Launch Offer", value: "launchOffer" },
          { title: "Festival Offer", value: "festivalOffer" },
        ],
        layout: "dropdown",
      },
    },
    {
      name: "offerLabel",
      title: "Offer Label",
      type: "string",
      group: "config",
      description: "Small tag to display on product cards (e.g. '10% OFF' or 'SALE')",
    },

    // --- RELATIONSHIPS ---
    {
      name: "products",
      title: "Applicable Products",
      type: "array",
      group: "relationships",
      of: [{ type: "reference", to: [{ type: "product" }] }],
    },
    {
      name: "categories",
      title: "Applicable Categories",
      type: "array",
      group: "relationships",
      of: [{ type: "reference", to: [{ type: "category" }] }],
    },
    {
      name: "brands",
      title: "Applicable Brands",
      type: "array",
      group: "relationships",
      of: [{ type: "reference", to: [{ type: "brand" }] }],
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
      name: "startDate",
      title: "Start Date",
      type: "datetime",
      group: "visibility",
    },
    {
      name: "endDate",
      title: "End Date",
      type: "datetime",
      group: "visibility",
    },
    {
      name: "displayOrder",
      title: "Display Order",
      type: "number",
      group: "visibility",
      initialValue: 0,
    },

    // --- SEO ---
    {
      name: "seo",
      title: "SEO Metadata",
      type: "object",
      group: "seo",
      fields: [
        { name: "metaTitle", title: "Meta Title", type: "string" },
        { name: "metaDescription", title: "Meta Description", type: "text", rows: 3 },
      ],
    },
  ],
  preview: {
    select: {
      title: "internalName",
      subtitle: "offerType",
      isActive: "isActive",
    },
    prepare({ title, subtitle, isActive }: any) {
      return {
        title: title || "Unnamed Offer",
        subtitle: `Type: ${subtitle || "None"} ${isActive ? "" : "(Hidden)"}`,
      };
    },
  },
};
