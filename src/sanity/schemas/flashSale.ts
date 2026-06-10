import { Zap } from "lucide-react";

export const flashSale = {
  name: "flashSale",
  title: "Flash Sale",
  type: "document",
  icon: Zap,
  groups: [
    { name: "core", title: "Core Information" },
    { name: "display", title: "Display Content" },
    { name: "relationships", title: "Relationships" },
    { name: "schedule", title: "Schedule & Visibility" },
  ],
  fields: [
    // --- CORE INFO ---
    {
      name: "name",
      title: "Flash Sale Name (Public)",
      type: "string",
      group: "core",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "internalName",
      title: "Internal Name",
      type: "string",
      group: "core",
      validation: (Rule: any) => Rule.required(),
    },

    // --- DISPLAY CONTENT ---
    {
      name: "title",
      title: "Title",
      type: "string",
      group: "display",
      description: "Appears on the flash sale banner/header.",
    },
    {
      name: "description",
      title: "Description",
      type: "text",
      group: "display",
      rows: 2,
    },
    {
      name: "banner",
      title: "Flash Sale Banner",
      type: "image",
      group: "display",
      options: { hotspot: true },
    },

    // --- RELATIONSHIPS ---
    {
      name: "products",
      title: "Included Products",
      type: "array",
      group: "relationships",
      of: [{ type: "reference", to: [{ type: "product" }] }],
    },
    {
      name: "categories",
      title: "Included Categories",
      type: "array",
      group: "relationships",
      of: [{ type: "reference", to: [{ type: "category" }] }],
    },

    // --- SCHEDULE & VISIBILITY ---
    {
      name: "startDate",
      title: "Start Date",
      type: "datetime",
      group: "schedule",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "endDate",
      title: "End Date",
      type: "datetime",
      group: "schedule",
      validation: (Rule: any) => Rule.required().min(Rule.valueOfField("startDate")),
    },
    {
      name: "isActive",
      title: "Active Status",
      type: "boolean",
      group: "schedule",
      initialValue: true,
    },
    {
      name: "featuredOnHomepage",
      title: "Featured on Homepage",
      type: "boolean",
      group: "schedule",
      initialValue: false,
      description: "Toggle to flag this flash sale to appear on the homepage.",
    },
  ],
  preview: {
    select: {
      title: "internalName",
      startDate: "startDate",
      endDate: "endDate",
      isActive: "isActive",
    },
    prepare({ title, startDate, endDate, isActive }: any) {
      return {
        title: title || "Unnamed Flash Sale",
        subtitle: `${startDate ? new Date(startDate).toLocaleDateString() : "No start"} - ${
          endDate ? new Date(endDate).toLocaleDateString() : "No end"
        } ${isActive ? "" : "(Hidden)"}`,
      };
    },
  },
};
