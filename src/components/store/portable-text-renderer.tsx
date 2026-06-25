"use client";

import { PortableText } from "@portabletext/react";

const portableTextComponents = {
  block: {
    h1: ({ children }: any) => <h1 className="text-4xl font-bold mt-12 mb-6">{children}</h1>,
    h2: ({ children }: any) => <h2 className="text-3xl font-semibold mt-10 mb-5">{children}</h2>,
    h3: ({ children }: any) => <h3 className="text-2xl font-medium mt-8 mb-4">{children}</h3>,
    normal: ({ children }: any) => <p className="text-base text-muted-foreground leading-relaxed mb-6">{children}</p>,
    blockquote: ({ children }: any) => <blockquote className="border-l-4 border-primary pl-4 italic my-6">{children}</blockquote>,
  },
  list: {
    bullet: ({ children }: any) => <ul className="list-disc pl-6 mb-6 text-muted-foreground space-y-2">{children}</ul>,
    number: ({ children }: any) => <ol className="list-decimal pl-6 mb-6 text-muted-foreground space-y-2">{children}</ol>,
  },
  marks: {
    link: ({ children, value }: any) => (
      <a href={value.href} className="text-primary underline hover:opacity-80 transition-opacity" target={value.blank ? "_blank" : undefined} rel={value.blank ? "noopener noreferrer" : undefined}>
        {children}
      </a>
    ),
  },
};

export function PortableTextRenderer({ value }: { value: any }) {
  return <PortableText value={value} components={portableTextComponents} />;
}
