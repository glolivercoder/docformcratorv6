import Dexie, { Table } from 'dexie';
import { toast } from "@/components/ui/use-toast";

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
  };
  buyer: {
    name: string;
    nationality: string;
    maritalStatus: string;
    address: string;
    document: string;
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

class RealEstateDatabase extends Dexie {
  contracts!: Table<RealEstateContract>;

  constructor() {
    super('RealEstateDB');
    this.version(1).stores({
      contracts: '++id, buildingName, apartmentNumber, date'
    });
  }
}

class DatabaseService {
  private db: RealEstateDatabase;

  constructor() {
    this.db = new RealEstateDatabase();
    console.log("Database service initialized");
  }

  async initDatabase() {
    try {
      await this.db.open();
      console.log("Database opened successfully");
      
      toast({
        title: "Database Connection",
        description: "Successfully connected to database",
      });
    } catch (error) {
      console.error("Error initializing database:", error);
      toast({
        variant: "destructive",
        title: "Database Error",
        description: "Failed to connect to database",
      });
      throw error;
    }
  }

  async saveContract(contract: RealEstateContract) {
    try {
      const id = await this.db.contracts.add(contract);
      console.log("Contract saved successfully with id:", id);
      return id;
    } catch (error) {
      console.error("Error saving contract:", error);
      throw error;
    }
  }

  async getContract(id: number) {
    return await this.db.contracts.get(id);
  }

  async getAllContracts() {
    return await this.db.contracts.toArray();
  }
}

export const databaseService = new DatabaseService();