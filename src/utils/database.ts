import Dexie, { Table } from 'dexie';
import { toast } from "@/components/ui/use-toast";

export interface Template {
  id?: number;
  name: string;
  type: string;
  fields: string[];
  content: string;
  createdAt: Date;
}

class DocumentDatabase extends Dexie {
  templates!: Table<Template>;

  constructor() {
    super('DocumentDB');
    this.version(1).stores({
      templates: '++id, name, type, createdAt'
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