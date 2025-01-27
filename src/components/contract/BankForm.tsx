import React from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BankFormProps {
  bank: {
    name: string;
    address: string;
    cnpj: string;
  };
  onChange: (field: string, value: string) => void;
}

export const BankForm = ({ bank, onChange }: BankFormProps) => {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Informações do Banco</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="bankName">Nome do Banco</Label>
          <Input
            id="bankName"
            value={bank.name}
            onChange={(e) => onChange("name", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="bankAddress">Endereço</Label>
          <Input
            id="bankAddress"
            value={bank.address}
            onChange={(e) => onChange("address", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="bankCnpj">CNPJ</Label>
          <Input
            id="bankCnpj"
            value={bank.cnpj}
            onChange={(e) => onChange("cnpj", e.target.value)}
          />
        </div>
      </div>
    </Card>
  );
};