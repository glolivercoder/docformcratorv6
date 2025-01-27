import React from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BuyerFormProps {
  buyer: {
    name: string;
    nationality: string;
    maritalStatus: string;
    address: string;
    document: string;
  };
  onChange: (field: string, value: string) => void;
}

export const BuyerForm = ({ buyer, onChange }: BuyerFormProps) => {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Informações do Comprador</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="buyerName">Nome</Label>
          <Input
            id="buyerName"
            value={buyer.name}
            onChange={(e) => onChange("name", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="buyerNationality">Nacionalidade</Label>
          <Input
            id="buyerNationality"
            value={buyer.nationality}
            onChange={(e) => onChange("nationality", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="buyerMaritalStatus">Estado Civil</Label>
          <Input
            id="buyerMaritalStatus"
            value={buyer.maritalStatus}
            onChange={(e) => onChange("maritalStatus", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="buyerAddress">Endereço</Label>
          <Input
            id="buyerAddress"
            value={buyer.address}
            onChange={(e) => onChange("address", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="buyerDocument">Documento</Label>
          <Input
            id="buyerDocument"
            value={buyer.document}
            onChange={(e) => onChange("document", e.target.value)}
          />
        </div>
      </div>
    </Card>
  );
};