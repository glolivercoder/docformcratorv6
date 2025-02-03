import Dexie, { Table } from 'dexie';

export interface Template {
  id?: number;
  name: string;
  type: string;
  fields: string[];
  content: string;
  createdAt: Date;
}

export interface UserDocument {
  id?: number;
  userId: number;
  documentType: string;
  documentNumber: string;
  documentFields: Record<string, string>;
  issuingBody: string;
  issueDate: string;
  birthDate: string;
  birthPlace: string;
  filiation: string;
  fullName: string;
  cpf: string;
  profession: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id?: number;
  name: string;
  cpf: string;
  email?: string;
  phone?: string;
  userType: string;
  documents: UserDocument[];
  createdAt: Date;
  updatedAt: Date;
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
    agency: string;
    account: string;
  };
  price: number;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

class DocumentDatabase extends Dexie {
  templates!: Table<Template>;
  contracts!: Table<RealEstateContract>;
  users!: Table<User>;
  userDocuments!: Table<UserDocument>;

  constructor() {
    super('DocumentDB');
    this.version(2).stores({
      templates: '++id, name, type, createdAt',
      contracts: '++id, buildingName, date',
      users: '++id, cpf, name, userType, createdAt',
      userDocuments: '++id, userId, documentType, documentNumber, createdAt'
    });
  }
}

class DatabaseService {
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
      console.error("Error opening database:", error);
    }
  }

  // Template methods
  async saveTemplate(template: Omit<Template, 'id'>) {
    return await this.db.templates.add(template);
  }

  async getTemplate(id: number) {
    return await this.db.templates.get(id);
  }

  async getAllTemplates() {
    return await this.db.templates.toArray();
  }

  async deleteTemplate(id: string) {
    return await this.db.templates.delete(id);
  }

  // Contract methods
  async saveContract(contract: Omit<RealEstateContract, 'id'>) {
    return await this.db.contracts.add(contract);
  }

  // User methods
  async saveUser(user: Omit<User, 'id'>) {
    return await this.db.users.add(user);
  }

  async getUserByCPF(cpf: string) {
    return await this.db.users.where('cpf').equals(cpf).first();
  }

  async saveUserDocument(document: Omit<UserDocument, 'id'>) {
    const docId = await this.db.userDocuments.add(document);
    return docId;
  }

  async getUserDocuments(userId: number) {
    return await this.db.userDocuments.where('userId').equals(userId).toArray();
  }

  async searchUsers(query: string) {
    return await this.db.users
      .where('name')
      .startsWithIgnoreCase(query)
      .or('cpf')
      .equals(query)
      .toArray();
  }
}

export const databaseService = new DatabaseService();
