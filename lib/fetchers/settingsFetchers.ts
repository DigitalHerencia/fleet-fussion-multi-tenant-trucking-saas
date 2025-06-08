import { CompanyProfile } from '@/types/settings';

export async function getCompanyProfile(
  orgId: string
): Promise<CompanyProfile> {
  // ...fetch from DB...
  return {
    id: orgId,
    name: '',
    logoUrl: '',
    primaryColor: '',
    address: '',
    contactEmail: '',
  };
}
