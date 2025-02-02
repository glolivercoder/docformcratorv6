import React, { useState } from 'react';
import { PersonForm } from './form/PersonForm';
import { BankForm } from './form/BankForm';
import { Button } from './ui/button';
import { DocumentFormData, PersonInfo, BankInfo } from '@/types/documents';
import { Switch } from './ui/switch';
import { Label } from './ui/label';

const initialPersonInfo: PersonInfo = {
  nome: '',
  nacionalidade: '',
  estadoCivil: '',
  endereco: '',
  tipoDocumento: '',
  rg: '',
  orgaoExpedidor: '',
  cidade: '',
  filiacao: '',
  dataEmissao: '',
  incluirConjuge: false,
  profissao: '',
  cpf: '',
  telefone: '',
  whatsapp: '',
};

const initialBankInfo: BankInfo = {
  nomeBanco: '',
  endereco: '',
  cnpj: '',
};

function ContractForm() {
  const [formData, setFormData] = useState<DocumentFormData>({
    vendedor: initialPersonInfo,
    comprador: initialPersonInfo,
    banco: initialBankInfo,
    dataAtual: true,
  });

  const handleVendedorChange = (data: PersonInfo) => {
    setFormData(prev => ({ ...prev, vendedor: data }));
  };

  const handleCompradorChange = (data: PersonInfo) => {
    setFormData(prev => ({ ...prev, comprador: data }));
  };

  const handleBancoChange = (data: BankInfo) => {
    setFormData(prev => ({ ...prev, banco: data }));
  };

  const handleSubmit = () => {
    // Aqui você pode implementar a lógica para salvar ou processar os dados
    console.log('Dados do formulário:', formData);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Novo Contrato</h2>
        <div className="flex items-center space-x-2">
          <Switch
            checked={formData.dataAtual}
            onCheckedChange={(checked) => 
              setFormData(prev => ({ ...prev, dataAtual: checked }))
            }
          />
          <Label>Usar data atual do sistema</Label>
        </div>
      </div>

      <PersonForm
        title="Vendedor"
        data={formData.vendedor}
        onChange={handleVendedorChange}
      />

      <PersonForm
        title="Comprador"
        data={formData.comprador}
        onChange={handleCompradorChange}
      />

      <BankForm
        data={formData.banco}
        onChange={handleBancoChange}
      />

      <div className="flex justify-end space-x-4">
        <Button variant="outline">Cancelar</Button>
        <Button onClick={handleSubmit}>Salvar Contrato</Button>
      </div>
    </div>
  );
}

export default ContractForm;
