import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { RealEstateContract } from "@/utils/database";

export const RealEstateContractForm = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<RealEstateContract>>({
    buildingName: "",
    apartmentNumber: "",
    seller: {
      name: "",
      nationality: "",
      maritalStatus: "",
      address: "",
      document: "",
    },
    buyer: {
      name: "",
      nationality: "",
      maritalStatus: "",
      address: "",
      document: "",
    },
    bank: {
      name: "",
      address: "",
      cnpj: "",
    },
    property: {
      address: "",
      registryNumber: "",
      area: 0,
      parkingSpaces: 0,
      privateArea: 0,
      commonArea: 0,
      totalArea: 0,
      idealFraction: "",
    },
    payment: {
      totalPrice: 0,
      downPayment: 0,
      fgtsValue: 0,
      installments: 0,
    },
    date: new Date().toISOString().split('T')[0],
    witnesses: {
      witness1: {
        name: "",
        cpf: "",
      },
      witness2: {
        name: "",
        cpf: "",
      },
    },
  });

  const handleInputChange = (field: string, value: any, section?: string, subsection?: string) => {
    setFormData(prev => {
      if (section) {
        if (subsection) {
          return {
            ...prev,
            [section]: {
              ...prev[section],
              [subsection]: {
                ...prev[section]?.[subsection],
                [field]: value
              }
            }
          };
        }
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [field]: value
          }
        };
      }
      return {
        ...prev,
        [field]: value
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Save to database logic here
      toast({
        title: "Sucesso",
        description: "Contrato salvo com sucesso!",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao salvar o contrato.",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Informações do Imóvel</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="buildingName">Nome do Edifício</Label>
            <Input
              id="buildingName"
              value={formData.buildingName}
              onChange={(e) => handleInputChange('buildingName', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="apartmentNumber">Número do Apartamento</Label>
            <Input
              id="apartmentNumber"
              value={formData.apartmentNumber}
              onChange={(e) => handleInputChange('apartmentNumber', e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Seller Information */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Informações do Vendedor</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="sellerName">Nome</Label>
            <Input
              id="sellerName"
              value={formData.seller?.name}
              onChange={(e) => handleInputChange('name', e.target.value, 'seller')}
            />
          </div>
          {/* Add other seller fields */}
        </div>
      </Card>

      {/* Buyer Information */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Informações do Comprador</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="buyerName">Nome</Label>
            <Input
              id="buyerName"
              value={formData.buyer?.name}
              onChange={(e) => handleInputChange('name', e.target.value, 'buyer')}
            />
          </div>
          {/* Add other buyer fields */}
        </div>
      </Card>

      {/* Bank Information */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Informações do Banco</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="bankName">Nome do Banco</Label>
            <Input
              id="bankName"
              value={formData.bank?.name}
              onChange={(e) => handleInputChange('name', e.target.value, 'bank')}
            />
          </div>
          {/* Add other bank fields */}
        </div>
      </Card>

      <Button type="submit" className="w-full">
        Salvar Contrato
      </Button>
    </form>
  );
};