import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from "@/lib/utils";

const navigationItems = [
  { name: 'Documentos', path: '/documentos' },
  { name: 'Modelos', path: '/modelos' },
  { name: 'Cadastros', path: '/cadastros' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <div className="flex justify-between items-center p-4 border-b">
        <div className="font-semibold">Sistema de Documentos Imobiliários</div>
        <Link
          to="/configurar-api"
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
        >
          Configurar Chave API
        </Link>
      </div>
      
      <nav className="border-b">
        <div className="flex space-x-4 px-4">
          {navigationItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "px-3 py-2 text-sm font-medium",
                location.pathname === item.path
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-primary"
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </nav>

      <main className="container mx-auto py-6">
        {children}
      </main>
    </div>
  );
}
