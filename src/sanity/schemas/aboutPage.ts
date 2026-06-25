import { Info } from "lucide-react";

export const aboutPage = {
  name: "aboutPage",
  title: "About Page",
  type: "document",
  icon: Info,
  fields: [
    {
      name: "title",
      title: "Page Title",
      type: "string",
      initialValue: "About Us",
    },
    {
      name: "heroHeadline",
      title: "Hero Headline",
      type: "string",
      description: "The main headline displayed at the top of the about page.",
    },
    {
      name: "heroImage",
      title: "Hero Image",
      type: "image",
      options: {
        hotspot: true,
      },
    },
    {
      name: "missionStatement",
      title: "Mission Statement",
      type: "text",
      rows: 3,
      description: "A short paragraph about the company's mission.",
    },
    {
      name: "story",
      title: "Our Story",
      type: "array",
      of: [{ type: "block" }],
      description: "The main content describing the company history and values.",
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
    },
    prepare({ title }: any) {
      return {
        title: title || "About Page Configuration",
        subtitle: "Global control for the About Us page",
      };
    },
  },
};
