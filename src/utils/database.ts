import Dexie, { Table } from 'dexie';

export interface Template {
  id?: number;
  name: string;
  type: string;
  fields: string[];
  content: string;
  createdAt: Date;
}

export interface RealEstateContract {
  id?: number;
  buildingName: string;
  apartmentNumber: string;
  seller: {
    name: string;
    nationality: string;
    maritalStatus: string;
    address: string;
    document: string;
    documentType?: string;
    documentFields?: Record<string, string>;
    hasSpouse?: boolean;
    spouse?: {
      name: string;
      nationality: string;
      document: string;
      documentType?: string;
      documentFields?: Record<string, string>;
    };
  };
  buyer: {
    name: string;
    nationality: string;
    maritalStatus: string;
    address: string;
    document: string;
    documentType?: string;
    documentFields?: Record<string, string>;
    hasSpouse?: boolean;
    spouse?: {
      name: string;
      nationality: string;
      document: string;
      documentType?: string;
      documentFields?: Record<string, string>;
    };
  };
  bank: {
    name: string;
    address: string;
    cnpj: string;
  };
  property: {
    address: string;
    registryNumber: string;
    area: number;
    parkingSpaces: number;
    privateArea: number;
    commonArea: number;
    totalArea: number;
    idealFraction: string;
  };
  payment: {
    totalPrice: number;
    downPayment: number;
    fgtsValue: number;
    installments: number;
  };
  date: string;
  witnesses: {
    witness1: {
      name: string;
      cpf: string;
    };
    witness2: {
      name: string;
      cpf: string;
    };
  };
}

class DocumentDatabase extends Dexie {
  templates!: Table<Template>;
  contracts!: Table<RealEstateContract>;

  constructor() {
    super('DocumentDB');
    this.version(1).stores({
      templates: '++id, name, type, createdAt',
      contracts: '++id, buildingName, date'
    });
  }
}

export class DatabaseService {
  private db: DocumentDatabase;

  constructor() {
    this.db = new DocumentDatabase();
    console.log("Database service initialized");
  }

  async initDatabase() {
    try {
      await this.db.open();
      console.log("Database opened successfully");
    } catch (error) {
      console.error("Error initializing database:", error);
      throw error;
    }
  }

  async saveTemplate(template: Omit<Template, 'id'>) {
    try {
      const id = await this.db.templates.add(template);
      console.log("Template saved successfully with id:", id);
      return id;
    } catch (error) {
      console.error("Error saving template:", error);
      throw error;
    }
  }

  async saveContract(contract: Omit<RealEstateContract, 'id'>) {
    try {
      const id = await this.db.contracts.add(contract);
      console.log("Contract saved successfully with id:", id);
      return id;
    } catch (error) {
      console.error("Error saving contract:", error);
      throw error;
    }
  }

  async getTemplate(id: number) {
    return await this.db.templates.get(id);
  }

  async getAllTemplates() {
    return await this.db.templates.toArray();
  }

  async deleteTemplate(id: string) {
    return await this.db.templates.delete(Number(id));
  }
}

export const databaseService = new DatabaseService();
