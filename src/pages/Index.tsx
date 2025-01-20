import React from "react";
import { DocumentGenerator } from "@/components/DocumentGenerator";
import { UserManagement } from "@/components/UserManagement";
import { DocumentTemplateManager } from "@/components/DocumentTemplateManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">
            Sistema de Documentos Imobiliários
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="documents" className="space-y-4">
          <TabsList>
            <TabsTrigger value="documents">Documentos</TabsTrigger>
            <TabsTrigger value="templates">Modelos</TabsTrigger>
            <TabsTrigger value="users">Cadastros</TabsTrigger>
          </TabsList>
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