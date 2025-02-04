import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PersonRole, PersonRoleType } from '@/types/person';

interface PersonSelectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractType: 'sale' | 'lease';
  onPersonSelect: (role: PersonRoleType, isSpouse: boolean) => void;
}

function PersonSelectDialog({
  open,
  onOpenChange,
  contractType,
  onPersonSelect,
}: PersonSelectDialogProps) {
  const getOptions = () => {
    if (contractType === 'sale') {
      return [
        { role: PersonRole.VENDEDOR, label: 'Vendedor' },
        { role: PersonRole.COMPRADOR, label: 'Comprador' },
      ];
    }
    return [
      { role: PersonRole.LOCADOR, label: 'Locador' },
      { role: PersonRole.LOCATARIO, label: 'Locatário' },
    ];
  };

  const options = getOptions();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Selecione o tipo de pessoa</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {options.map((option) => (
            <div key={option.role} className="grid gap-2">
              <Button
                variant="outline"
                onClick={() => onPersonSelect(option.role, false)}
                className="w-full justify-start"
              >
                {option.label}
              </Button>
              <Button
                variant="outline"
                onClick={() => onPersonSelect(option.role, true)}
                className="w-full justify-start"
              >
                Cônjuge do {option.label}
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { PersonSelectDialog };
