import type React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: Array<{
    label: string;
    href: string;
  }>;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  breadcrumbs = [],
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("mb-6 space-y-2", className)}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {breadcrumbs.length > 0 && (
            <nav className="mb-2 flex items-center space-x-1 text-sm text-muted-foreground">
              <Link
                href="/dashboard"
                className="flex items-center hover:text-foreground"
              >
                <Home className="mr-1 h-4 w-4" />
                Dashboard
              </Link>
              {breadcrumbs.map((breadcrumb, index) => (
                <div key={breadcrumb.href} className="flex items-center">
                  <ChevronRight className="h-4 w-4" />
                  <Link
                    href={breadcrumb.href}
                    className={cn(
                      "ml-1 hover:text-foreground",
                      index === breadcrumbs.length - 1 &&
                        "text-foreground font-medium",
                    )}
                  >
                    {breadcrumb.label}
                  </Link>
                </div>
              ))}
            </nav>
          )}
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        )}
      </div>
    </div>
  );
}
