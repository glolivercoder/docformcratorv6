export enum DocumentCategory {
  CONTRACT = "CONTRACT",
  AUTHORIZATION = "AUTHORIZATION",
  LETTER = "LETTER",
  DECLARATION = "DECLARATION",
}

export enum DocumentType {
  // Contracts
  LEASE_CONTRACT = "LEASE_CONTRACT",
  SALE_CONTRACT = "SALE_CONTRACT",
  MANAGEMENT_CONTRACT = "MANAGEMENT_CONTRACT",
  
  // Letters
  GUARANTEE_LETTER = "GUARANTEE_LETTER",
  RENT_ADJUSTMENT_LETTER = "RENT_ADJUSTMENT_LETTER",
  
  // Authorizations
  PROPERTY_SHOWING_AUTH = "PROPERTY_SHOWING_AUTH",
  SALE_AUTH = "SALE_AUTH",
  
  // Declarations
  RESIDENCE_DECLARATION = "RESIDENCE_DECLARATION",
  PAYMENT_DECLARATION = "PAYMENT_DECLARATION",
}

export interface Person {
  id: string;
  name: string;
  cpf: string;
  rg: string;
  address: string;
  phone: string;
  email: string;
  maritalStatus?: string;
  nationality?: string;
  profession?: string;
}

export interface Realtor extends Person {
  creciNumber: string;
  company: string;
}

export interface Lawyer extends Person {
  oabNumber: string;
  oabState: string;
}

export interface Client extends Person {
  clientType: "OWNER" | "TENANT" | "GUARANTOR";
}

export interface Property {
  id: string;
  address: string;
  registrationNumber: string;
  iptuNumber: string;
  area: number;
  rooms: number;
  type: "HOUSE" | "APARTMENT" | "COMMERCIAL";
  features: string[];
}