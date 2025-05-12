import * as React from "react";
import { cn } from "@/lib/utils";

interface ContentLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  centered?: boolean;
  padded?: boolean;
}

export function ContentLayout({
  maxWidth = "2xl",
  centered = true,
  padded = true,
  className,
  children,
  ...props
}: ContentLayoutProps) {
  return (
    <div
      className={cn(
        "w-full",
        {
          "max-w-sm": maxWidth === "sm",
          "max-w-md": maxWidth === "md",
          "max-w-lg": maxWidth === "lg",
          "max-w-xl": maxWidth === "xl",
          "max-w-2xl": maxWidth === "2xl",
          "max-w-full": maxWidth === "full",
          "mx-auto": centered,
          "px-4 py-6 md:px-6 md:py-8": padded,
        },
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

type DivProps = Omit<React.HTMLAttributes<HTMLDivElement>, "title">;

interface ContentSectionProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  divided?: boolean;
}

export function ContentSection({
  title,
  description,
  actions,
  divided = true,
  className,
  children,
  ...props
}: ContentSectionProps) {
  return (
    <section
      className={cn(
        "flex flex-col gap-4",
        {
          "border-b pb-6 mb-6": divided,
        },
        className,
      )}
      {...props}
    >
      {(title || description || actions) && (
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 space-y-1.5">
            {title && (
              <h2 className="text-xl md:text-2xl font-bold text-blue-700 dark:text-blue-400">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-sm text-muted-foreground max-w-2xl">
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex flex-wrap items-center gap-2">{actions}</div>
          )}
        </div>
      )}
      {children}
    </section>
  );
}

export function ActionLayout({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-4 gap-y-2 justify-end",
        className,
      )}
      {...props}
    />
  );
}
