# Custom Instructions: Next.js 15 Params Usage Rule

## Rule: Always Use Async Params Pattern in Next.js 15

### ✅ CORRECT Pattern (Next.js 15+)

```typescript
// Method 1: Inline Type Definition
export default async function Page({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params;
  // ... rest of component
}

// Method 2: Interface Definition
interface PageProps {
  params: Promise<{
    orgId: string;
    userId?: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { orgId, userId } = await params;
  // ... rest of component
}
```

### ❌ INCORRECT Pattern (Next.js 14 and below)

```typescript
// DON'T USE - Will cause build errors in Next.js 15+
export default function Page({ params }: { params: { orgId: string } }) {
  const { orgId } = params; // No await - will fail
}

interface PageProps {
  params: {
    orgId: string; // Not wrapped in Promise
  };
}
```

## Key Requirements

1. **Always wrap params type in `Promise<>`**
2. **Always add `async` to the function declaration**
3. **Always use `await` when destructuring params**
4. **Apply to all page.tsx files with dynamic routes**

## Breaking Change Context

Next.js 15 introduced a breaking change where `params` in page components is now asynchronous and returns a Promise. This was done to improve performance and enable better streaming capabilities.

### Files Fixed in This Audit:
- ✅ `app/(tenant)/[orgId]/compliance/[userId]/page.tsx` - Updated to async params
- ✅ `app/(tenant)/[orgId]/compliance/page.tsx` - Updated to async params

### Files Already Compliant:
- ✅ `app/(tenant)/[orgId]/drivers/page.tsx`
- ✅ `app/(tenant)/[orgId]/vehicles/page.tsx`
- ✅ `app/(tenant)/[orgId]/analytics/page.tsx`
- ✅ `app/(tenant)/[orgId]/ifta/page.tsx`
- ✅ `app/(tenant)/[orgId]/dashboard/[userId]/page.tsx`
- ✅ `app/(tenant)/[orgId]/drivers/[userId]/page.tsx`
- ✅ `app/(tenant)/[orgId]/dispatch/[userId]/page.tsx`

## Verification

All params usage has been audited and updated. Build passes successfully with Next.js 15.3.3.

**Last Audit Date:** December 2024
**Next.js Version:** 15.3.3
**Status:** ✅ All Clear - No remaining synchronous params usage detected
