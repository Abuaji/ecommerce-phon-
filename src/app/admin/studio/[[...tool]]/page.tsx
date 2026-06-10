"use client";

import { NextStudio } from "next-sanity/studio";
import config from "../../../../../sanity.config";

export default function StudioPage() {
  return (
    <div className="relative h-[calc(100vh-4rem)] w-full overflow-hidden rounded-lg border border-border shadow-md">
      <NextStudio config={config} />
    </div>
  );
}
