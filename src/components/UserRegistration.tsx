import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, Trash2, Phone, MessageCircle, User, Users, Home } from 'lucide-react';

interface UserRegistrationProps {
  users: Array<{
    id: string;
    role: string;
    data: any;
  }>;
  onEdit: (userId: string) => void;
  onDelete: (userId: string) => void;
  onContact: (phoneNumber: string, action: 'whatsapp' | 'telegram' | 'call') => void;
}

const getRoleIcon = (role: string) => {
  if (role.toLowerCase().includes('conjuge')) return <Users className="h-5 w-5" />;
  if (role.toLowerCase().includes('imovel')) return <Home className="h-5 w-5" />;
  return <User className="h-5 w-5" />;
};

export function UserRegistration({ users, onEdit, onDelete, onContact }: UserRegistrationProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Cadastros</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {users.map((user) => (
          <Card key={user.id} className="relative group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-2">
                {getRoleIcon(user.role)}
                <CardTitle className="text-sm font-medium">
                  {user.role}
                </CardTitle>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(user.id)}
                  className="h-8 w-8"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(user.id)}
                  className="h-8 w-8 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(user.data).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center text-sm">
                    <span className="font-medium capitalize">
                      {key.replace(/([A-Z])/g, ' $1').toLowerCase()}:
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">{value as string}</span>
                      {(key === 'telefone' || key === 'celular' || key === 'whatsapp') && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <Phone className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onContact(value as string, 'whatsapp')}>
                              <MessageCircle className="mr-2 h-4 w-4" />
                              WhatsApp
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onContact(value as string, 'telegram')}>
                              <MessageCircle className="mr-2 h-4 w-4" />
                              Telegram
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onContact(value as string, 'call')}>
                              <Phone className="mr-2 h-4 w-4" />
                              Ligar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 