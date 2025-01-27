import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { RealEstateContract } from "@/utils/database";
import { SellerForm } from "./contract/SellerForm";
import { BuyerForm } from "./contract/BuyerForm";
import { BankForm } from "./contract/BankForm";
import { databaseService } from "@/utils/database";

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

  const handleInputChange = (section: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await databaseService.initDatabase();
      await databaseService.saveContract(formData as RealEstateContract);
      toast({
        title: "Sucesso",
        description: "Contrato salvo com sucesso!",
      });
    } catch (error) {
      console.error("Error saving contract:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao salvar o contrato.",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <SellerForm
        seller={formData.seller!}
        onChange={(field, value) => handleInputChange('seller', field, value)}
      />
      <BuyerForm
        buyer={formData.buyer!}
        onChange={(field, value) => handleInputChange('buyer', field, value)}
      />
      <BankForm
        bank={formData.bank!}
        onChange={(field, value) => handleInputChange('bank', field, value)}
      />
      <Button type="submit" className="w-full">
        Salvar Contrato
      </Button>
    </form>
  );
};