// types.ts - Centralized type definitions

export interface CompanyData {
  logo: string;
  logoAlt: string;
  companyName: string;
  description: string;
}

export interface CompanyCardProps extends CompanyData {}