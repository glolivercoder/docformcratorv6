import React from "react";
import DocumentGenerator from "@/components/DocumentGenerator";
import UserManagement from "@/components/UserManagement";
import DocumentTemplateManager from "@/components/DocumentTemplateManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ApiKeyDialog from "@/components/ApiKeyDialog";
import RealEstateContractForm from "@/components/RealEstateContractForm";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">
            Sistema de Documentos Imobiliários
          </h1>
          <ApiKeyDialog />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="contract" className="space-y-4">
          <TabsList>
            <TabsTrigger value="contract">Novo Contrato</TabsTrigger>
            <TabsTrigger value="documents">Documentos</TabsTrigger>
            <TabsTrigger value="templates">Modelos</TabsTrigger>
            <TabsTrigger value="users">Cadastros</TabsTrigger>
          </TabsList>
          <TabsContent value="contract" className="space-y-4">
            <RealEstateContractForm />
          </TabsContent>
          <TabsContent value="documents" className="space-y-4">
            <DocumentGenerator />
          </TabsContent>
          <TabsContent value="templates" className="space-y-4">
            <DocumentTemplateManager />
          </TabsContent>
          <TabsContent value="users" className="space-y-4">
            <UserManagement />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;