import { Tags } from "lucide-react";

export const brand = {
  name: "brand",
  title: "Brand",
  type: "document",
  icon: Tags,
  groups: [
    { name: "general", title: "General" },
    { name: "media", title: "Media" },
    { name: "display", title: "Display Settings" },
    { name: "content", title: "Content" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    // --- CORE INFORMATION ---
    {
      name: "name",
      title: "Brand Name",
      type: "string",
      group: "general",
      validation: (Rule: any) => Rule.required().error("Brand name is required"),
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
            _type == "brand" && 
            slug.current == $slug && 
            !(_id in [$documentId, "drafts." + $documentId])
          ][0]`;
          
          const params = { slug: slug.current, documentId };
          const result = await context.getClient({ apiVersion: "2024-01-01" }).fetch(query, params);

          if (result) {
            return `Slug must be unique. Another brand already uses "${slug.current}".`;
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
      validation: (Rule: any) => Rule.max(200).warning("Keep it concise for brand cards and quick overviews."),
    },
    {
      name: "fullDescription",
      title: "Full Description",
      type: "array",
      group: "general",
      of: [{ type: "block" }],
    },

    // --- MEDIA ---
    {
      name: "logo",
      title: "Brand Logo",
      type: "image",
      group: "media",
      options: { hotspot: true },
      validation: (Rule: any) => Rule.required().error("A brand logo is required."),
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
      title: "Brand Banner",
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
      name: "openGraphImage",
      title: "Open Graph Image",
      type: "image",
      group: "media",
      description: "Default fallback image for SEO when sharing the brand page.",
    },

    // --- DISPLAY SETTINGS ---
    {
      name: "isActive",
      title: "Active Status",
      type: "boolean",
      group: "display",
      initialValue: true,
      description: "If disabled, the brand and its dedicated pages will be hidden from the storefront.",
    },
    {
      name: "isFeatured",
      title: "Featured Brand",
      type: "boolean",
      group: "display",
      initialValue: false,
    },
    {
      name: "displayOrder",
      title: "Display Order",
      type: "number",
      group: "display",
      initialValue: 0,
      description: "Lower numbers appear first in lists and carousels.",
      validation: (Rule: any) => Rule.integer(),
    },

    // --- CONTENT ---
    {
      name: "brandStory",
      title: "Brand Story",
      type: "array",
      group: "content",
      description: "A narrative block explaining the history or ethos of the brand.",
      of: [{ type: "block" }],
    },
    {
      name: "brandHighlights",
      title: "Brand Highlights",
      type: "array",
      group: "content",
      description: "Key selling points or features unique to this brand.",
      of: [{ type: "string" }],
    },
    {
      name: "customContentArea",
      title: "Custom Content Area",
      type: "array",
      group: "content",
      description: "Extra space for custom landing page sections.",
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
      ],
    },
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "slug.current",
      media: "logo",
      isActive: "isActive",
    },
    prepare({ title, subtitle, media, isActive }: any) {
      return {
        title: title || "Unnamed Brand",
        subtitle: `/${subtitle || ""} ${isActive ? "" : "(Hidden)"}`,
        media,
      };
    },
  },
};
