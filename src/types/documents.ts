export enum DocumentCategory {
  CONTRACT = "CONTRACT",
  AUTHORIZATION = "AUTHORIZATION",
  LETTER = "LETTER",
  DECLARATION = "DECLARATION",
  REAL_ESTATE = "REAL_ESTATE"
}

export enum DocumentType {
  // Contratos Imobiliários
  LEASE_CONTRACT = "LEASE_CONTRACT",
  SALE_CONTRACT = "SALE_CONTRACT",
  MANAGEMENT_CONTRACT = "MANAGEMENT_CONTRACT",
  
  // Cartas
  GUARANTEE_LETTER = "GUARANTEE_LETTER",
  RENT_ADJUSTMENT_LETTER = "RENT_ADJUSTMENT_LETTER",
  
  // Autorizações
  PROPERTY_SHOWING_AUTH = "PROPERTY_SHOWING_AUTH",
  SALE_AUTH = "SALE_AUTH",
  
  // Declarações
  RESIDENCE_DECLARATION = "RESIDENCE_DECLARATION",
  PAYMENT_DECLARATION = "PAYMENT_DECLARATION",
}

export interface Person {
  id?: string;
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

export interface RealEstateParty extends Person {
  documentType: DocumentType;
  documentFields?: Record<string, string>;
  hasSpouse?: boolean;
  spouse?: {
    name: string;
    nationality: string;
    document: string;
    documentType: DocumentType;
    documentFields?: Record<string, string>;
  };
}

export interface Property {
  address: string;
  registrationNumber: string;
  area: number;
  parkingSpaces?: number;
  privateArea?: number;
  commonArea?: number;
  totalArea?: number;
  idealFraction?: string;
  iptuNumber?: string;
}

export interface RealEstateContract {
  seller: RealEstateParty;
  buyer: RealEstateParty;
  property: Property;
  date: string;
  witnesses?: {
    witness1: Person;
    witness2: Person;
  };
}