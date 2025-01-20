import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

export const UserManagement = () => {
  const [userType, setUserType] = useState("");
  const [userData, setUserData] = useState({
    name: "",
    cpf: "",
    rg: "",
    address: "",
    phone: "",
    email: "",
    profession: "",
    creciNumber: "",
    oabNumber: "",
    oabState: "",
  });
  
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
    console.log("User data updated:", { name, value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting user data:", { userType, userData });
    
    // Here you would typically save to a database
    toast({
      title: "Usuário cadastrado com sucesso!",
      description: "Os dados foram salvos no sistema.",
    });
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Cadastro de Usuários</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Usuário
          </label>
          <Select onValueChange={setUserType}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo de usuário" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="client">Cliente</SelectItem>
              <SelectItem value="realtor">Corretor</SelectItem>
              <SelectItem value="lawyer">Advogado</SelectItem>
              <SelectItem value="owner">Proprietário</SelectItem>
              <SelectItem value="tenant">Locatário</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome Completo
            </label>
            <Input
              name="name"
              value={userData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CPF
            </label>
            <Input
              name="cpf"
              value={userData.cpf}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              RG
            </label>
            <Input
              name="rg"
              value={userData.rg}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Endereço
            </label>
            <Input
              name="address"
              value={userData.address}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telefone
            </label>
            <Input
              name="phone"
              value={userData.phone}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <Input
              name="email"
              type="email"
              value={userData.email}
              onChange={handleInputChange}
              required
            />
          </div>

          {userType === "realtor" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número CRECI
              </label>
              <Input
                name="creciNumber"
                value={userData.creciNumber}
                onChange={handleInputChange}
                required
              />
            </div>
          )}

          {userType === "lawyer" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número OAB
                </label>
                <Input
                  name="oabNumber"
                  value={userData.oabNumber}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado OAB
                </label>
                <Input
                  name="oabState"
                  value={userData.oabState}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </>
          )}
        </div>

        <Button type="submit" className="w-full">
          Cadastrar Usuário
        </Button>
      </form>
    </Card>
  );
};