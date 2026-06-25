import { FileText } from "lucide-react";

export const page = {
  name: "page",
  title: "Static Page",
  type: "document",
  icon: FileText,
  fields: [
    {
      name: "title",
      title: "Page Title",
      type: "string",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "body",
      title: "Body Content",
      type: "array",
      of: [{ type: "block" }],
    },
    {
      name: "seo",
      title: "SEO Metadata",
      type: "object",
      fields: [
        { name: "metaTitle", type: "string", title: "Meta Title" },
        { name: "metaDescription", type: "text", title: "Meta Description", rows: 3 },
      ],
    },
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "slug.current",
    },
    prepare({ title, subtitle }: any) {
      return {
        title: title || "Untitled Page",
        subtitle: `/${subtitle || ""}`,
      };
    },
  },
};
