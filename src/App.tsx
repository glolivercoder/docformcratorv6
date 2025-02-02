import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainNavigation from './components/navigation/MainNavigation';
import ContractForm from './components/ContractForm';
import DocumentTemplateManager from './components/DocumentTemplateManager';
import DocumentAnalyzer from './components/DocumentAnalyzer';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from './components/ui/toaster';
import { TooltipProvider } from './components/ui/tooltip';
import Index from './pages/Index';
import React from 'react';
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="min-h-screen bg-background">
            <MainNavigation />
            <TooltipProvider>
              <main className="container mx-auto py-6">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/novo-contrato" element={<ContractForm />} />
                  <Route path="/documentos" element={<DocumentAnalyzer />} />
                  <Route path="/modelos" element={<DocumentTemplateManager />} />
                  <Route path="/cadastros" element={<div>Cadastros</div>} />
                </Routes>
              </main>
            </TooltipProvider>
            <Toaster />
          </div>
        </Router>
      </QueryClientProvider>
    </React.StrictMode>
  );
}

export default App;