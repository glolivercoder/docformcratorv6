import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import cep from 'cep-promise';

interface AddressFormProps {
  address: {
    cep: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
  };
  onChange: (address: any) => void;
}

export function AddressForm({ address, onChange }: AddressFormProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleCepChange = async (cepValue: string) => {
    if (cepValue.length === 8) {
      setLoading(true);
      try {
        const result = await cep(cepValue);
        onChange({
          ...address,
          cep: cepValue,
          street: result.street,
          neighborhood: result.neighborhood,
          city: result.city,
          state: result.state,
        });
      } catch (error) {
        toast({
          title: "Erro ao buscar CEP",
          description: "Não foi possível encontrar o endereço para este CEP",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleChange = (field: string, value: string) => {
    onChange({
      ...address,
      [field]: value,
    });
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="cep">CEP</Label>
        <Input
          id="cep"
          value={address.cep || ''}
          onChange={(e) => {
            const cepValue = e.target.value.replace(/\D/g, '');
            handleChange('cep', cepValue);
            handleCepChange(cepValue);
          }}
          placeholder="00000-000"
          maxLength={8}
          disabled={loading}
        />
      </div>
      <div>
        <Label htmlFor="street">Rua</Label>
        <Input
          id="street"
          value={address.street || ''}
          onChange={(e) => handleChange('street', e.target.value)}
          disabled={loading}
        />
      </div>
      <div>
        <Label htmlFor="number">Número</Label>
        <Input
          id="number"
          value={address.number || ''}
          onChange={(e) => handleChange('number', e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="complement">Complemento</Label>
        <Input
          id="complement"
          value={address.complement || ''}
          onChange={(e) => handleChange('complement', e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="neighborhood">Bairro</Label>
        <Input
          id="neighborhood"
          value={address.neighborhood || ''}
          onChange={(e) => handleChange('neighborhood', e.target.value)}
          disabled={loading}
        />
      </div>
      <div>
        <Label htmlFor="city">Cidade</Label>
        <Input
          id="city"
          value={address.city || ''}
          onChange={(e) => handleChange('city', e.target.value)}
          disabled={loading}
        />
      </div>
      <div>
        <Label htmlFor="state">Estado</Label>
        <Input
          id="state"
          value={address.state || ''}
          onChange={(e) => handleChange('state', e.target.value)}
          disabled={loading}
        />
      </div>
    </div>
  );
}
