import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';

interface PersonaSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (persona: string) => void;
}

export const PersonaSelectionDialog = ({ isOpen, onClose, onSelect }: PersonaSelectionDialogProps) => {
  const personas = ['Locador', 'Locatário', 'Comprador', 'Vendedor', 'Cônjuge'];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Selecione a Persona</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          {personas.map(persona => (
            <Button key={persona} onClick={() => onSelect(persona)}>
              {persona}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
