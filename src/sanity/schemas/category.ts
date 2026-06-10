import { FolderTree } from "lucide-react";

export const category = {
  name: "category",
  title: "Category",
  type: "document",
  icon: FolderTree,
  groups: [
    { name: "general", title: "General" },
    { name: "media", title: "Media" },
    { name: "navigation", title: "Navigation" },
    { name: "display", title: "Display Settings" },
    { name: "content", title: "Content" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    // --- CORE INFORMATION ---
    {
      name: "name",
      title: "Category Name",
      type: "string",
      group: "general",
      validation: (Rule: any) => Rule.required().error("Category name is required"),
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
      validation: (Rule: any) =>
        Rule.required().custom(async (slug: any, context: any) => {
          if (!slug || !slug.current) return true;
          
          const documentId = context.document?._id?.replace("drafts.", "");
          const query = `*[
            _type == "category" && 
            slug.current == $slug && 
            !(_id in [$documentId, "drafts." + $documentId])
          ][0]`;
          
          const params = { slug: slug.current, documentId };
          const result = await context.getClient({ apiVersion: "2024-01-01" }).fetch(query, params);

          if (result) {
            return `Slug must be unique. Another category already uses "${slug.current}".`;
          }

          return true;
        }),
    },
    {
      name: "description",
      title: "Description",
      type: "text",
      group: "general",
      rows: 3,
    },

    // --- MEDIA ---
    {
      name: "image",
      title: "Category Image",
      type: "image",
      group: "media",
      options: { hotspot: true },
      fields: [
        {
          name: "alt",
          title: "Alternative Text",
          type: "string",
        },
      ],
    },
    {
      name: "banner",
      title: "Category Banner",
      type: "image",
      group: "media",
      options: { hotspot: true },
      fields: [
        {
          name: "alt",
          title: "Alternative Text",
          type: "string",
        },
      ],
    },

    // --- NAVIGATION ---
    {
      name: "parent",
      title: "Parent Category",
      type: "reference",
      group: "navigation",
      to: [{ type: "category" }],
      description: "Select a parent category to make this a subcategory.",
    },
    {
      name: "level",
      title: "Category Level",
      type: "number",
      group: "navigation",
      description: "1 for top-level, 2 for subcategory, etc.",
      initialValue: 1,
      validation: (Rule: any) => Rule.required().min(1).max(3),
    },

    // --- DISPLAY SETTINGS ---
    {
      name: "isFeatured",
      title: "Featured Category",
      type: "boolean",
      group: "display",
      initialValue: false,
    },
    {
      name: "isActive",
      title: "Active Status",
      type: "boolean",
      group: "display",
      initialValue: true,
    },
    {
      name: "displayOrder",
      title: "Display Order",
      type: "number",
      group: "display",
      initialValue: 0,
      description: "Lower numbers appear first.",
      validation: (Rule: any) => Rule.required().integer(),
    },

    // --- CONTENT ---
    {
      name: "contentArea",
      title: "Custom Category Content Area",
      type: "array",
      group: "content",
      of: [{ type: "block" }],
    },
    {
      name: "buyingGuide",
      title: "Buying Guide Content",
      type: "array",
      group: "content",
      of: [{ type: "block" }],
    },

    // --- SEO ---
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
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "slug.current",
      media: "image",
      isActive: "isActive",
      parentName: "parent.name",
    },
    prepare({ title, subtitle, media, isActive, parentName }: any) {
      const parentLabel = parentName ? ` (${parentName})` : "";
      return {
        title: title || "Unnamed Category",
        subtitle: `/${subtitle || ""}${parentLabel} ${isActive ? "" : "(Hidden)"}`,
        media,
      };
    },
  },
};
