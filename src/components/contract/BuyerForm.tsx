import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DocumentTypeSelect, DocumentType } from "./DocumentTypeSelect";
import { Switch } from "@/components/ui/switch";

interface BuyerFormProps {
  buyer: {
    name: string;
    nationality: string;
    maritalStatus: string;
    address: string;
    document: string;
    documentType?: DocumentType;
    documentFields?: Record<string, string>;
    hasSpouse?: boolean;
    spouse?: {
      name: string;
      nationality: string;
      document: string;
      documentType?: DocumentType;
      documentFields?: Record<string, string>;
    };
  };
  onChange: (field: string, value: any) => void;
}

export const BuyerForm = ({ buyer, onChange }: BuyerFormProps) => {
  const [showSpouse, setShowSpouse] = useState(buyer.hasSpouse || false);

  const handleSpouseChange = (field: string, value: any) => {
    onChange("spouse", { ...buyer.spouse, [field]: value });
  };

  const handleDocumentFieldsChange = (field: string, value: string) => {
    onChange("documentFields", { ...buyer.documentFields, [field]: value });
  };

  const handleSpouseDocumentFieldsChange = (field: string, value: string) => {
    const updatedSpouse = {
      ...buyer.spouse,
      documentFields: { ...(buyer.spouse?.documentFields || {}), [field]: value },
    };
    onChange("spouse", updatedSpouse);
  };

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
        
        <div className="col-span-2">
          <DocumentTypeSelect
            value={buyer.documentType || "RG"}
            onChange={(value) => onChange("documentType", value)}
            onFieldChange={handleDocumentFieldsChange}
            fields={buyer.documentFields || {}}
          />
        </div>

        <div className="col-span-2 flex items-center space-x-2">
          <Switch
            checked={showSpouse}
            onCheckedChange={(checked) => {
              setShowSpouse(checked);
              onChange("hasSpouse", checked);
            }}
          />
          <Label>Incluir Cônjuge</Label>
        </div>

        {showSpouse && (
          <div className="col-span-2 space-y-4">
            <h3 className="text-lg font-semibold">Informações do Cônjuge</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="spouseName">Nome do Cônjuge</Label>
                <Input
                  id="spouseName"
                  value={buyer.spouse?.name || ""}
                  onChange={(e) => handleSpouseChange("name", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="spouseNationality">Nacionalidade do Cônjuge</Label>
                <Input
                  id="spouseNationality"
                  value={buyer.spouse?.nationality || ""}
                  onChange={(e) => handleSpouseChange("nationality", e.target.value)}
                />
              </div>
              <div className="col-span-2">
                <DocumentTypeSelect
                  value={buyer.spouse?.documentType || "RG"}
                  onChange={(value) => handleSpouseChange("documentType", value)}
                  onFieldChange={handleSpouseDocumentFieldsChange}
                  fields={buyer.spouse?.documentFields || {}}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};