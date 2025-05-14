import { db } from "@/db/db";
import { cache } from "react";

export const getInsurancePolicies = cache(async function getInsurancePolicies(
  companyId: string,
) {
  return db.query.insurancePolicies.findMany({
    where: (p, { eq }) => eq(p.companyId, companyId),
  });
});
