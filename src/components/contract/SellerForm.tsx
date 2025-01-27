import React from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SellerFormProps {
  seller: {
    name: string;
    nationality: string;
    maritalStatus: string;
    address: string;
    document: string;
  };
  onChange: (field: string, value: string) => void;
}

export const SellerForm = ({ seller, onChange }: SellerFormProps) => {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Informações do Vendedor</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="sellerName">Nome</Label>
          <Input
            id="sellerName"
            value={seller.name}
            onChange={(e) => onChange("name", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="sellerNationality">Nacionalidade</Label>
          <Input
            id="sellerNationality"
            value={seller.nationality}
            onChange={(e) => onChange("nationality", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="sellerMaritalStatus">Estado Civil</Label>
          <Input
            id="sellerMaritalStatus"
            value={seller.maritalStatus}
            onChange={(e) => onChange("maritalStatus", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="sellerAddress">Endereço</Label>
          <Input
            id="sellerAddress"
            value={seller.address}
            onChange={(e) => onChange("address", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="sellerDocument">Documento</Label>
          <Input
            id="sellerDocument"
            value={seller.document}
            onChange={(e) => onChange("document", e.target.value)}
          />
        </div>
      </div>
    </Card>
  );
};