import { getPublicSettings } from "@/actions/admin/settings.actions";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSettings();
  const getSetting = (key: string) => settings.find(s => s.key === key)?.value || "";
  
  return {
    title: getSetting("about_hero_headline") || "About Us",
    description: getSetting("about_mission_statement"),
  };
}

export default async function AboutPage() {
  const settings = await getPublicSettings();
  const getSetting = (key: string) => settings.find(s => s.key === key)?.value || "";

  const heroHeadline = getSetting("about_hero_headline");
  const missionStatement = getSetting("about_mission_statement");
  const story = getSetting("about_story");

  return (
    <div className="container mx-auto px-4 py-16 md:py-24 max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Hero Section */}
      <div className="text-center mb-16 max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 text-foreground">
          {heroHeadline || "About Us"}
        </h1>
        {missionStatement && (
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            {missionStatement}
          </p>
        )}
      </div>

      {/* Story / Content */}
      <div className="prose prose-zinc prose-lg mx-auto max-w-3xl whitespace-pre-wrap">
        {story}
      </div>
    </div>
  );
}
