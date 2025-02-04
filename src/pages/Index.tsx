import React from "react";
import DocumentGenerator from "@/components/DocumentGenerator";
import UserManagement from "@/components/UserManagement";
import DocumentTemplateManager from "@/components/DocumentTemplateManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ApiKeyDialog from "@/components/ApiKeyDialog";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
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
        <ApiKeyDialog />
      </main>
    </div>
  );
};

export default Index;