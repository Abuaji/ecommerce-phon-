import { Image } from "lucide-react";

export const banner = {
  name: "banner",
  title: "Banner",
  type: "document",
  icon: Image,
  groups: [
    { name: "core", title: "Core Information" },
    { name: "media", title: "Media" },
    { name: "content", title: "Content" },
    { name: "actions", title: "Actions" },
    { name: "visibility", title: "Visibility Settings" },
  ],
  fields: [
    // --- CORE INFORMATION ---
    {
      name: "title",
      title: "Title",
      type: "string",
      group: "core",
      description: "Descriptive title for internal identification.",
    },
    {
      name: "internalName",
      title: "Internal Name",
      type: "string",
      group: "core",
      validation: (Rule: any) => Rule.required().error("Internal name is required."),
    },
    {
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "core",
      options: {
        source: "internalName",
        maxLength: 96,
      },
      validation: (Rule: any) => Rule.required(),
    },

    // --- MEDIA ---
    {
      name: "desktopImage",
      title: "Desktop Image",
      type: "image",
      group: "media",
      options: { hotspot: true },
      validation: (Rule: any) => Rule.required().error("Desktop image is required."),
      fields: [
        {
          name: "alt",
          title: "Alternative Text",
          type: "string",
        },
      ],
    },
    {
      name: "mobileImage",
      title: "Mobile Image",
      type: "image",
      group: "media",
      options: { hotspot: true },
      validation: (Rule: any) => Rule.required().error("Mobile image is required."),
      fields: [
        {
          name: "alt",
          title: "Alternative Text",
          type: "string",
        },
      ],
    },

    // --- CONTENT ---
    {
      name: "heading",
      title: "Heading",
      type: "string",
      group: "content",
    },
    {
      name: "subheading",
      title: "Subheading",
      type: "string",
      group: "content",
    },
    {
      name: "description",
      title: "Description",
      type: "text",
      group: "content",
      rows: 3,
    },

    // --- ACTIONS ---
    {
      name: "primaryButtonText",
      title: "Primary Button Text",
      type: "string",
      group: "actions",
    },
    {
      name: "primaryButtonUrl",
      title: "Primary Button URL",
      type: "url",
      group: "actions",
      validation: (Rule: any) => Rule.uri({ allowRelative: true }),
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
      description: "Optional: Automatically publish banner at this time.",
    },
    {
      name: "endDate",
      title: "End Date",
      type: "datetime",
      group: "visibility",
      description: "Optional: Automatically hide banner at this time.",
    },
    {
      name: "displayOrder",
      title: "Display Order",
      type: "number",
      group: "visibility",
      initialValue: 0,
      validation: (Rule: any) => Rule.required().integer(),
    },
  ],
  preview: {
    select: {
      title: "internalName",
      subtitle: "heading",
      media: "desktopImage",
      isActive: "isActive",
    },
    prepare({ title, subtitle, media, isActive }: any) {
      return {
        title: title || "Unnamed Banner",
        subtitle: `${subtitle || "No heading"} ${isActive ? "" : "(Hidden)"}`,
        media,
      };
    },
  },
};
