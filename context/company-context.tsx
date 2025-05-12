import React, { createContext, useContext, type ReactNode } from "react";

interface CompanyContextType {
  companyId: string | null;
  setCompanyId: (id: string | null) => void;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export function CompanyProvider({ children }: { children: ReactNode }) {
  const [companyId, setCompanyId] = React.useState<string | null>(null);
  return (
    <CompanyContext.Provider value={{ companyId, setCompanyId }}>
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const context = useContext(CompanyContext);
  if (!context)
    throw new Error("useCompany must be used within a CompanyProvider");
  return context;
}
