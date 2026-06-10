import { Smartphone } from "lucide-react";

export const device = {
  name: "device",
  title: "Device Compatibility",
  type: "document",
  icon: Smartphone,
  groups: [
    { name: "deviceInfo", title: "Device Info" },
    { name: "manufacturer", title: "Manufacturer" },
    { name: "display", title: "Display Settings" },
    { name: "search", title: "Search & Discovery" },
  ],
  fields: [
    // --- DEVICE INFORMATION ---
    {
      name: "name",
      title: "Device Name",
      type: "string",
      group: "deviceInfo",
      description: "E.g., iPhone 15 Pro, Galaxy S24 Ultra",
      validation: (Rule: any) => Rule.required().error("Device name is required"),
    },
    {
      name: "slug",
      title: "Device Slug",
      type: "slug",
      group: "deviceInfo",
      options: {
        source: "name",
        maxLength: 96,
      },
      validation: (Rule: any) =>
        Rule.required().custom(async (slug: any, context: any) => {
          if (!slug || !slug.current) return true;
          
          const documentId = context.document?._id?.replace("drafts.", "");
          const query = `*[
            _type == "device" && 
            slug.current == $slug && 
            !(_id in [$documentId, "drafts." + $documentId])
          ][0]`;
          
          const params = { slug: slug.current, documentId };
          const result = await context.getClient({ apiVersion: "2024-01-01" }).fetch(query, params);

          if (result) {
            return `Slug must be unique. Another device already uses "${slug.current}".`;
          }

          return true;
        }),
    },
    {
      name: "series",
      title: "Device Series",
      type: "string",
      group: "deviceInfo",
      description: "E.g., iPhone 15 Series, Galaxy S Series",
    },

    // --- MANUFACTURER ---
    {
      name: "manufacturerName",
      title: "Manufacturer Name",
      type: "string",
      group: "manufacturer",
      description: "E.g., Apple, Samsung, Google",
      validation: (Rule: any) => Rule.required().error("Manufacturer name is required"),
    },
    {
      name: "manufacturerSlug",
      title: "Manufacturer Slug",
      type: "slug",
      group: "manufacturer",
      options: {
        source: "manufacturerName",
        maxLength: 96,
      },
      description: "Used for grouping in URLs like /devices/apple",
      validation: (Rule: any) => Rule.required(),
    },

    // --- DISPLAY SETTINGS ---
    {
      name: "isActive",
      title: "Active Status",
      type: "boolean",
      group: "display",
      initialValue: true,
      description: "If disabled, the device will not show up in filters.",
    },
    {
      name: "isFeatured",
      title: "Featured Device",
      type: "boolean",
      group: "display",
      initialValue: false,
      description: "Used to pin this device at the top of compatibility filters.",
    },

    // --- SEARCH & DISCOVERY ---
    {
      name: "searchKeywords",
      title: "Search Keywords",
      type: "array",
      group: "search",
      of: [{ type: "string" }],
      options: {
        layout: "tags",
      },
    },
    {
      name: "alternateNames",
      title: "Alternate Device Names",
      type: "array",
      group: "search",
      description: "E.g., iPhone 15 Pro Max, IP 15 Pro Max, etc. for better search recall.",
      of: [{ type: "string" }],
      options: {
        layout: "tags",
      },
    },
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "manufacturerName",
      series: "series",
      isActive: "isActive",
    },
    prepare({ title, subtitle, series, isActive }: any) {
      return {
        title: title || "Unnamed Device",
        subtitle: `${subtitle || "Unknown Brand"} ${series ? `(${series})` : ""} ${isActive ? "" : "[Hidden]"}`,
      };
    },
  },
};
