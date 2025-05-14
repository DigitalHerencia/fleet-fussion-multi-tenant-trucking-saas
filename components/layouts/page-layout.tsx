import * as React from "react";
import { cn } from "@/lib/utils";

interface PageLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  footer?: React.ReactNode;
  fullWidth?: boolean;
}

export function PageLayout({
  header,
  sidebar,
  footer,
  fullWidth = false,
  className,
  children,
  ...props
}: PageLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {header && <header className="sticky top-0 z-50">{header}</header>}
      <div className="flex flex-1">
        {sidebar && <aside>{sidebar}</aside>}
        <main
          className={cn("flex-1", !fullWidth && "container mx-auto", className)}
          {...props}
        >
          {children}
        </main>
      </div>
      {footer && <footer>{footer}</footer>}
    </div>
  );
}
