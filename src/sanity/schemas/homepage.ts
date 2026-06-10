import { Home } from "lucide-react";

export const homepage = {
  name: "homepage",
  title: "Homepage Configuration",
  type: "document",
  icon: Home,
  // We use groups or just standard fields, but a singleton doesn't necessarily need groups.
  fields: [
    {
      name: "title",
      title: "Configuration Title",
      type: "string",
      description: "For internal admin reference (e.g., 'Main Production Homepage')",
      validation: (Rule: any) => Rule.required(),
      initialValue: "Main Homepage Configuration",
    },
    {
      name: "activeSections",
      title: "Active Sections",
      type: "array",
      description: "Add, remove, and drag-and-drop to reorder homepage sections.",
      of: [
        {
          type: "reference",
          to: [{ type: "homepageSection" }],
        },
      ],
      validation: (Rule: any) => Rule.unique(),
    },
  ],
  preview: {
    select: {
      title: "title",
    },
    prepare({ title }: any) {
      return {
        title: title || "Homepage Configuration",
        subtitle: "Global layout control",
      };
    },
  },
};
