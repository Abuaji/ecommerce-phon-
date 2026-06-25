import { PhoneCall } from "lucide-react";

export const contactPage = {
  name: "contactPage",
  title: "Contact Page",
  type: "document",
  icon: PhoneCall,
  fields: [
    {
      name: "title",
      title: "Page Title",
      type: "string",
      initialValue: "Contact Us",
    },
    {
      name: "heroHeadline",
      title: "Hero Headline",
      type: "string",
      description: "The main headline displayed at the top of the contact page.",
    },
    {
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
      description: "A short text about getting in touch.",
    },
    {
      name: "email",
      title: "Support Email",
      type: "string",
    },
    {
      name: "phone",
      title: "Support Phone Number",
      type: "string",
    },
    {
      name: "address",
      title: "Business Address",
      type: "text",
      rows: 3,
    },
    {
      name: "businessHours",
      title: "Business Hours",
      type: "string",
      description: "e.g., 'Mon-Fri, 9am - 6pm EST'",
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
        title: title || "Contact Page Configuration",
        subtitle: "Global control for the Contact Us page",
      };
    },
  },
};
