import { Settings } from "lucide-react";

export const siteSettings = {
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  icon: Settings,
  groups: [
    { name: "branding", title: "Branding" },
    { name: "navigation", title: "Navigation" },
    { name: "seo", title: "Global SEO" },
    { name: "social", title: "Social Links" },
  ],
  fields: [
    // BRANDING
    {
      name: "brandName",
      title: "Brand Name",
      type: "string",
      group: "branding",
      validation: (Rule: any) => Rule.required(),
      initialValue: "Antigravity",
    },
    {
      name: "logo",
      title: "Logo Image",
      type: "image",
      group: "branding",
    },
    {
      name: "favicon",
      title: "Favicon",
      type: "image",
      group: "branding",
    },
    {
      name: "announcementBarText",
      title: "Announcement Bar Text",
      type: "string",
      group: "branding",
      description: "Text displayed at the very top of the site.",
    },

    // NAVIGATION
    {
      name: "headerMenu",
      title: "Header Menu",
      type: "array",
      group: "navigation",
      of: [
        {
          type: "object",
          fields: [
            { name: "label", type: "string", validation: (Rule: any) => Rule.required() },
            { name: "href", type: "string", validation: (Rule: any) => Rule.required() },
          ],
        },
      ],
    },
    {
      name: "footerMenu",
      title: "Footer Menu Columns",
      type: "array",
      group: "navigation",
      of: [
        {
          type: "object",
          fields: [
            { name: "title", title: "Column Title", type: "string" },
            {
              name: "links",
              title: "Links",
              type: "array",
              of: [
                {
                  type: "object",
                  fields: [
                    { name: "label", type: "string" },
                    { name: "href", type: "string" },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },

    // SEO
    {
      name: "globalSeoTitle",
      title: "Global SEO Title",
      type: "string",
      group: "seo",
      description: "Default title format: [Page Title] | [Global SEO Title]",
      initialValue: "Premium Mobile Accessories",
    },
    {
      name: "globalSeoDescription",
      title: "Global SEO Description",
      type: "text",
      group: "seo",
      rows: 3,
    },
    {
      name: "defaultOpenGraphImage",
      title: "Default Open Graph Image",
      type: "image",
      group: "seo",
    },

    // SOCIAL
    {
      name: "socialLinks",
      title: "Social Media Links",
      type: "array",
      group: "social",
      of: [
        {
          type: "object",
          fields: [
            { name: "platform", type: "string", options: { list: ["Twitter", "Instagram", "Facebook", "LinkedIn", "YouTube"] } },
            { name: "url", type: "url" },
          ],
        },
      ],
    },
  ],
  preview: {
    prepare() {
      return {
        title: "Site Settings",
        subtitle: "Global configurations",
      };
    },
  },
};
