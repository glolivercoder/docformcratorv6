import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DocumentTypeSelect, DocumentType } from "./DocumentTypeSelect";
import { Switch } from "@/components/ui/switch";

interface SellerFormProps {
  seller: {
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

export const SellerForm = ({ seller, onChange }: SellerFormProps) => {
  const [showSpouse, setShowSpouse] = useState(seller.hasSpouse || false);

  const handleSpouseChange = (field: string, value: any) => {
    onChange("spouse", { ...seller.spouse, [field]: value });
  };

  const handleDocumentFieldsChange = (field: string, value: string) => {
    onChange("documentFields", { ...seller.documentFields, [field]: value });
  };

  const handleSpouseDocumentFieldsChange = (field: string, value: string) => {
    const updatedSpouse = {
      ...seller.spouse,
      documentFields: { ...(seller.spouse?.documentFields || {}), [field]: value },
    };
    onChange("spouse", updatedSpouse);
  };

  return (
    <Card className="p-6 bg-[#F8FAFF] border border-[#E2E8F0] rounded-lg">
      <h2 className="text-xl font-semibold mb-6 text-[#1E293B]">Informações do Vendedor</h2>
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="sellerName" className="text-sm text-[#475569]">Nome</Label>
          <Input
            id="sellerName"
            value={seller.name}
            onChange={(e) => onChange("name", e.target.value)}
            className="bg-white border-[#E2E8F0] focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sellerNationality" className="text-sm text-[#475569]">Nacionalidade</Label>
          <Input
            id="sellerNationality"
            value={seller.nationality}
            onChange={(e) => onChange("nationality", e.target.value)}
            className="bg-white border-[#E2E8F0] focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sellerMaritalStatus" className="text-sm text-[#475569]">Estado Civil</Label>
          <Input
            id="sellerMaritalStatus"
            value={seller.maritalStatus}
            onChange={(e) => onChange("maritalStatus", e.target.value)}
            className="bg-white border-[#E2E8F0] focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sellerAddress" className="text-sm text-[#475569]">Endereço</Label>
          <Input
            id="sellerAddress"
            value={seller.address}
            onChange={(e) => onChange("address", e.target.value)}
            className="bg-white border-[#E2E8F0] focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
          />
        </div>
        
        <div className="col-span-2">
          <DocumentTypeSelect
            value={seller.documentType || DocumentType.RG}
            onChange={(value) => onChange("documentType", value)}
            onFieldChange={handleDocumentFieldsChange}
            fields={seller.documentFields || {}}
          />
        </div>

        <div className="col-span-2 flex items-center space-x-2 mt-4">
          <Switch
            checked={showSpouse}
            onCheckedChange={(checked) => {
              setShowSpouse(checked);
              onChange("hasSpouse", checked);
            }}
            className="data-[state=checked]:bg-[#3B82F6]"
          />
          <Label className="text-sm text-[#475569]">Incluir Cônjuge</Label>
        </div>

        {showSpouse && (
          <div className="col-span-2 space-y-6 mt-4 p-4 bg-white rounded-lg border border-[#E2E8F0]">
            <h3 className="text-lg font-semibold text-[#1E293B]">Informações do Cônjuge</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="spouseName" className="text-sm text-[#475569]">Nome do Cônjuge</Label>
                <Input
                  id="spouseName"
                  value={seller.spouse?.name || ""}
                  onChange={(e) => handleSpouseChange("name", e.target.value)}
                  className="bg-white border-[#E2E8F0] focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="spouseNationality" className="text-sm text-[#475569]">Nacionalidade do Cônjuge</Label>
                <Input
                  id="spouseNationality"
                  value={seller.spouse?.nationality || ""}
                  onChange={(e) => handleSpouseChange("nationality", e.target.value)}
                  className="bg-white border-[#E2E8F0] focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
                />
              </div>
              <div className="col-span-2">
                <DocumentTypeSelect
                  value={seller.spouse?.documentType || DocumentType.RG}
                  onChange={(value) => handleSpouseChange("documentType", value)}
                  onFieldChange={handleSpouseDocumentFieldsChange}
                  fields={seller.spouse?.documentFields || {}}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};