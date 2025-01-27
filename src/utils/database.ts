import { SQLite, SQLiteObject } from '@capacitor-community/sqlite';

export interface RealEstateContract {
  id: number;
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

class DatabaseService {
  private db: SQLiteObject | null = null;

  async initDatabase() {
    try {
      const sqlite = new SQLite();
      this.db = await sqlite.createConnection('realestate.db');
      await this.db.open();
      
      await this.createTables();
      console.log("Database initialized successfully");
    } catch (error) {
      console.error("Error initializing database:", error);
      throw error;
    }
  }

  private async createTables() {
    const query = `
      CREATE TABLE IF NOT EXISTS contracts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        buildingName TEXT NOT NULL,
        apartmentNumber TEXT NOT NULL,
        sellerName TEXT NOT NULL,
        sellerNationality TEXT,
        sellerMaritalStatus TEXT,
        sellerAddress TEXT,
        sellerDocument TEXT,
        buyerName TEXT NOT NULL,
        buyerNationality TEXT,
        buyerMaritalStatus TEXT,
        buyerAddress TEXT,
        buyerDocument TEXT,
        bankName TEXT,
        bankAddress TEXT,
        bankCnpj TEXT,
        propertyAddress TEXT NOT NULL,
        registryNumber TEXT,
        area REAL,
        parkingSpaces INTEGER,
        privateArea REAL,
        commonArea REAL,
        totalArea REAL,
        idealFraction TEXT,
        totalPrice REAL NOT NULL,
        downPayment REAL,
        fgtsValue REAL,
        installments INTEGER,
        contractDate TEXT NOT NULL,
        witness1Name TEXT,
        witness1Cpf TEXT,
        witness2Name TEXT,
        witness2Cpf TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    try {
      await this.db?.execute(query);
      console.log("Tables created successfully");
    } catch (error) {
      console.error("Error creating tables:", error);
      throw error;
    }
  }

  async saveContract(contract: RealEstateContract) {
    if (!this.db) {
      throw new Error("Database not initialized");
    }

    const query = `
      INSERT INTO contracts (
        buildingName, apartmentNumber, sellerName, sellerNationality,
        sellerMaritalStatus, sellerAddress, sellerDocument, buyerName,
        buyerNationality, buyerMaritalStatus, buyerAddress, buyerDocument,
        bankName, bankAddress, bankCnpj, propertyAddress, registryNumber,
        area, parkingSpaces, privateArea, commonArea, totalArea,
        idealFraction, totalPrice, downPayment, fgtsValue, installments,
        contractDate, witness1Name, witness1Cpf, witness2Name, witness2Cpf
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      contract.buildingName,
      contract.apartmentNumber,
      contract.seller.name,
      contract.seller.nationality,
      contract.seller.maritalStatus,
      contract.seller.address,
      contract.seller.document,
      contract.buyer.name,
      contract.buyer.nationality,
      contract.buyer.maritalStatus,
      contract.buyer.address,
      contract.buyer.document,
      contract.bank.name,
      contract.bank.address,
      contract.bank.cnpj,
      contract.property.address,
      contract.property.registryNumber,
      contract.property.area,
      contract.property.parkingSpaces,
      contract.property.privateArea,
      contract.property.commonArea,
      contract.property.totalArea,
      contract.property.idealFraction,
      contract.payment.totalPrice,
      contract.payment.downPayment,
      contract.payment.fgtsValue,
      contract.payment.installments,
      contract.date,
      contract.witnesses.witness1.name,
      contract.witnesses.witness1.cpf,
      contract.witnesses.witness2.name,
      contract.witnesses.witness2.cpf
    ];

    try {
      const result = await this.db.execute(query, values);
      console.log("Contract saved successfully:", result);
      return result;
    } catch (error) {
      console.error("Error saving contract:", error);
      throw error;
    }
  }
}

export const databaseService = new DatabaseService();