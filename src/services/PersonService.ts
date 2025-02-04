import { Person } from '@prisma/client';
import db from '@/lib/db';
import { PersonRoleType } from '@/types/person';

export class PersonService {
  private static instance: PersonService;
  private constructor() {}

  public static getInstance(): PersonService {
    if (!PersonService.instance) {
      PersonService.instance = new PersonService();
    }
    return PersonService.instance;
  }

  async createOrUpdate(personData: Partial<Person> & { role: PersonRoleType; isSpouse: boolean }): Promise<Person> {
    const { role, isSpouse, ...data } = personData;
    
    // Se CPF ou RG foram fornecidos, procura por pessoa existente
    const existingPerson = await this.findExistingPerson(data);

    if (existingPerson) {
      return db.person.update({
        where: { id: existingPerson.id },
        data: {
          ...data,
          role,
          isSpouse
        }
      });
    }

    return db.person.create({
      data: {
        ...data,
        role,
        isSpouse
      }
    });
  }

  private async findExistingPerson(data: Partial<Person>): Promise<Person | null> {
    if (data.cpf) {
      const personByCpf = await db.person.findUnique({
        where: { cpf: data.cpf }
      });
      if (personByCpf) return personByCpf;
    }

    if (data.rg) {
      const personByRg = await db.person.findFirst({
        where: { rg: data.rg }
      });
      if (personByRg) return personByRg;
    }

    return null;
  }

  async getByRole(role: Person['role']): Promise<Person[]> {
    return db.person.findMany({
      where: { role },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getByDocument(documentNumber: string): Promise<Person | null> {
    return db.person.findFirst({
      where: {
        OR: [
          { cpf: documentNumber },
          { rg: documentNumber },
          { documentNumber },
        ],
      },
    });
  }
}
