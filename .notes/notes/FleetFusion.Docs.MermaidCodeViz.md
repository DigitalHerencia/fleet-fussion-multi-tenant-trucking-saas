---
id: t6ru2zxj74vb84qj29z95ox
title: MermaidCodeViz
desc: ''
updated: 1748313850283
created: 1748313652813
---

# Mermaid Code Visualization for FleetFusion Web Platform

This Mermaid diagram provides a comprehensive overview of the FleetFusion web platform architecture, focusing on the integration of Clerk for authentication, the multi-tenant architecture, and the database interactions with Neon (Postgres). It illustrates how various components interact, including user authentication, tenant management, and data access layers.

```mermaid
graph TD

    6742["User<br>External Actor"]
    subgraph 6726["External Systems"]
        6740["Clerk Authentication<br>Clerk API"]
        6741["Application Database<br>Neon (Postgres)"]
    end
    subgraph 6727["FleetFusion Web Platform<br>Next.js, React"]
        6728["App Router &amp; Root<br>Next.js Pages &amp; Layout"]
        6729["Public &amp; Marketing Pages<br>Next.js App Router"]
        6730["Authentication UI &amp; Core Logic<br>Next.js, React, Clerk"]
        6731["Tenant Application Pages<br>Next.js App Router"]
        6732["Request Middleware<br>Next.js Middleware"]
        6733["UI Component Library<br>React (Shadcn UI)"]
        6734["Shared Application Components<br>React Components"]
        6735["Domain &amp; Feature Components<br>React Components"]
        6736["Server API Actions<br>Next.js Server Actions"]
        6737["Clerk Webhook Receiver<br>Next.js API Route"]
        6738["Database Access Layer<br>Drizzle ORM"]
        6739["Common Utilities &amp; Types<br>TypeScript"]
        %% Edges at this level (grouped by source)
        6728["App Router &amp; Root<br>Next.js Pages &amp; Layout"] -->|routes to| 6729["Public &amp; Marketing Pages<br>Next.js App Router"]
        6728["App Router &amp; Root<br>Next.js Pages &amp; Layout"] -->|routes to| 6730["Authentication UI &amp; Core Logic<br>Next.js, React, Clerk"]
        6728["App Router &amp; Root<br>Next.js Pages &amp; Layout"] -->|routes to| 6731["Tenant Application Pages<br>Next.js App Router"]
        6728["App Router &amp; Root<br>Next.js Pages &amp; Layout"] -->|uses| 6734["Shared Application Components<br>React Components"]
        6732["Request Middleware<br>Next.js Middleware"] -->|uses for auth| 6730["Authentication UI &amp; Core Logic<br>Next.js, React, Clerk"]
        6732["Request Middleware<br>Next.js Middleware"] -->|processes requests for| 6731["Tenant Application Pages<br>Next.js App Router"]
        6734["Shared Application Components<br>React Components"] -->|uses auth context from| 6730["Authentication UI &amp; Core Logic<br>Next.js, React, Clerk"]
        6734["Shared Application Components<br>React Components"] -->|uses| 6733["UI Component Library<br>React (Shadcn UI)"]
        6735["Domain &amp; Feature Components<br>React Components"] -->|uses auth context from| 6730["Authentication UI &amp; Core Logic<br>Next.js, React, Clerk"]
        6735["Domain &amp; Feature Components<br>React Components"] -->|uses| 6733["UI Component Library<br>React (Shadcn UI)"]
        6735["Domain &amp; Feature Components<br>React Components"] -->|triggers| 6736["Server API Actions<br>Next.js Server Actions"]
        6735["Domain &amp; Feature Components<br>React Components"] -->|uses| 6739["Common Utilities &amp; Types<br>TypeScript"]
        6736["Server API Actions<br>Next.js Server Actions"] -->|checks permissions with| 6730["Authentication UI &amp; Core Logic<br>Next.js, React, Clerk"]
        6736["Server API Actions<br>Next.js Server Actions"] -->|accesses data via| 6738["Database Access Layer<br>Drizzle ORM"]
        6736["Server API Actions<br>Next.js Server Actions"] -->|uses| 6739["Common Utilities &amp; Types<br>TypeScript"]
        6729["Public &amp; Marketing Pages<br>Next.js App Router"] -->|uses| 6733["UI Component Library<br>React (Shadcn UI)"]
        6729["Public &amp; Marketing Pages<br>Next.js App Router"] -->|uses| 6734["Shared Application Components<br>React Components"]
        6729["Public &amp; Marketing Pages<br>Next.js App Router"] -->|displays| 6735["Domain &amp; Feature Components<br>React Components"]
        6730["Authentication UI &amp; Core Logic<br>Next.js, React, Clerk"] -->|uses| 6733["UI Component Library<br>React (Shadcn UI)"]
        6730["Authentication UI &amp; Core Logic<br>Next.js, React, Clerk"] -->|uses| 6734["Shared Application Components<br>React Components"]
        6730["Authentication UI &amp; Core Logic<br>Next.js, React, Clerk"] -->|triggers| 6736["Server API Actions<br>Next.js Server Actions"]
        6730["Authentication UI &amp; Core Logic<br>Next.js, React, Clerk"] -->|manages user data with| 6738["Database Access Layer<br>Drizzle ORM"]
        6731["Tenant Application Pages<br>Next.js App Router"] -->|uses| 6733["UI Component Library<br>React (Shadcn UI)"]
        6731["Tenant Application Pages<br>Next.js App Router"] -->|uses| 6734["Shared Application Components<br>React Components"]
        6731["Tenant Application Pages<br>Next.js App Router"] -->|displays| 6735["Domain &amp; Feature Components<br>React Components"]
        6731["Tenant Application Pages<br>Next.js App Router"] -->|triggers| 6736["Server API Actions<br>Next.js Server Actions"]
        6737["Clerk Webhook Receiver<br>Next.js API Route"] -->|updates data via| 6738["Database Access Layer<br>Drizzle ORM"]
        6737["Clerk Webhook Receiver<br>Next.js API Route"] -->|uses| 6739["Common Utilities &amp; Types<br>TypeScript"]
    end
    %% Edges at this level (grouped by source)
    6734["Shared Application Components<br>React Components"] -->|calls| 6740["Clerk Authentication<br>Clerk API"]
    6736["Server API Actions<br>Next.js Server Actions"] -->|updates metadata via| 6740["Clerk Authentication<br>Clerk API"]
    6730["Authentication UI &amp; Core Logic<br>Next.js, React, Clerk"] -->|integrates with| 6740["Clerk Authentication<br>Clerk API"]
    6742["User<br>External Actor"] -->|interacts with| 6728["App Router &amp; Root<br>Next.js Pages &amp; Layout"]
    6740["Clerk Authentication<br>Clerk API"] -->|sends webhooks to| 6737["Clerk Webhook Receiver<br>Next.js API Route"]
    6738["Database Access Layer<br>Drizzle ORM"] -->|queries/mutates| 6741["Application Database<br>Neon (Postgres)"]
```