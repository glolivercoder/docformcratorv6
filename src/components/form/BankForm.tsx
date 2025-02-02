import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BankInfo } from '@/types/documents';

interface BankFormProps {
  data: BankInfo;
  onChange: (data: BankInfo) => void;
}

export function BankForm({ data, onChange }: BankFormProps) {
  const handleChange = (field: keyof BankInfo, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Informações do Banco</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nomeBanco">Nome do Banco</Label>
          <Input
            id="nomeBanco"
            value={data.nomeBanco}
            onChange={(e) => handleChange('nomeBanco', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endereco">Endereço</Label>
          <Input
            id="endereco"
            value={data.endereco}
            onChange={(e) => handleChange('endereco', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cnpj">CNPJ</Label>
          <Input
            id="cnpj"
            value={data.cnpj}
            onChange={(e) => handleChange('cnpj', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
