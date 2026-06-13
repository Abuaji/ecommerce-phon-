import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface AuthWrapperProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

export function AuthWrapper({ children, title, description }: AuthWrapperProps) {
  return (
    <div className="w-full max-w-[400px] mx-auto bg-white p-8 border border-border/40 relative z-10">
      <div className="mb-10 flex flex-col items-center text-center">
        <Link href="/" className="mb-8 flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-muted-foreground hover:text-foreground transition-colors self-start -ml-2">
          <ChevronLeft className="h-4 w-4" />
          Back to store
        </Link>

        <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground mt-3">{description}</p>
        )}
      </div>

      {children}
    </div>
  );
}
