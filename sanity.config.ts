import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schema } from "./src/sanity/schemas";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!;

export default defineConfig({
  basePath: "/admin/studio",
  projectId,
  dataset,
  
  // The catalog structure schemas will be registered here
  schema,

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Content")
          .items([
            // Singleton for Homepage
            S.listItem()
              .title("Homepage Configuration")
              .id("homepage")
              .child(
                S.document()
                  .schemaType("homepage")
                  .documentId("homepage")
              ),
            // Singleton for Site Settings
            S.listItem()
              .title("Site Settings")
              .id("siteSettings")
              .child(
                S.document()
                  .schemaType("siteSettings")
                  .documentId("siteSettings")
              ),
            // Singleton for About Page
            S.listItem()
              .title("About Page")
              .id("aboutPage")
              .child(
                S.document()
                  .schemaType("aboutPage")
                  .documentId("aboutPage")
              ),
            // Singleton for Contact Page
            S.listItem()
              .title("Contact Page")
              .id("contactPage")
              .child(
                S.document()
                  .schemaType("contactPage")
                  .documentId("contactPage")
              ),
            // Divider
            S.divider(),
            // All other document types except singletons
            ...S.documentTypeListItems().filter(
              (listItem) => !["homepage", "siteSettings", "aboutPage", "contactPage"].includes(listItem.getId() as string)
            ),
          ]),
    }),
    // Vision is a tool that lets you query your content with GROQ in the studio
    visionTool({ defaultApiVersion: "2024-01-01" }),
  ],
});
