import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from "@/lib/utils";

const navigationItems = [
  { name: 'Novo Contrato', path: '/novo-contrato' },
  { name: 'Documentos', path: '/documentos' },
  { name: 'Modelos', path: '/modelos' },
  { name: 'Cadastros', path: '/cadastros' },
];

function MainNavigation() {
  const location = useLocation();

  return (
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
        <div className="ml-auto">
          <Link
            to="/configurar-api"
            className="text-sm text-foreground/60 hover:text-foreground/80"
          >
            Configurar Chave API
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default MainNavigation;
