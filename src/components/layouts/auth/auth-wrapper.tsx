import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface AuthWrapperProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

export function AuthWrapper({ children, title, description }: AuthWrapperProps) {
  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Decorative background blur elements */}
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-secondary/20 rounded-full blur-3xl" />
      
      <div className="glass-panel relative z-10 p-8">
        <div className="mb-8 flex flex-col items-center text-center">
          <Link href="/" className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors self-start -ml-2">
            <ChevronLeft className="h-4 w-4" />
            Back to store
          </Link>
          
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground mt-2">{description}</p>
          )}
        </div>
        
        {children}
      </div>
    </div>
  );
}
