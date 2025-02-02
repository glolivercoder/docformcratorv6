import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from "@/lib/utils";

const navigationItems = [
  { name: 'Novo Contrato', path: '/' },
  { name: 'Documentos', path: '/documentos' },
  { name: 'Modelos', path: '/modelos' },
  { name: 'Cadastros', path: '/cadastros' },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <nav className="flex w-full border-b">
        <div className="flex h-14 items-center px-4 w-full">
          <div className="mr-4 font-semibold">Sistema de Documentos Imobiliários</div>
          <div className="flex space-x-4">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "transition-colors hover:text-foreground/80 px-3 py-2 rounded-md",
                  location.pathname === item.path
                    ? "bg-secondary text-foreground"
                    : "text-foreground/60"
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </nav>
      <main className="container mx-auto py-6">
        {children}
      </main>
    </div>
  );
}
