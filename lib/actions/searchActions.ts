'use server';

import type { GlobalSearchResultItem } from '@/types/search';
import { globalSearch } from '@/lib/fetchers/searchFetchers';

export async function globalSearchAction(data: {
  orgId: string;
  query: string;
}): Promise<GlobalSearchResultItem[]> {
  const { orgId, query } = data;
  return globalSearch(orgId, query);
}
