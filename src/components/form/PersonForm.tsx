import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { PersonInfo } from '@/types/documents';

interface PersonFormProps {
  title: string;
  data: PersonInfo;
  onChange: (data: PersonInfo) => void;
}

const estadosCivis = [
  'Solteiro(a)',
  'Casado(a)',
  'Divorciado(a)',
  'Viúvo(a)',
  'Separado(a)',
];

const tiposDocumento = ['RG', 'CNH', 'Passaporte'];

export function PersonForm({ title, data, onChange }: PersonFormProps) {
  const handleChange = (field: keyof PersonInfo, value: any) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Informações do {title}</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nome">Nome</Label>
          <Input
            id="nome"
            value={data.nome}
            onChange={(e) => handleChange('nome', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="nacionalidade">Nacionalidade</Label>
          <Input
            id="nacionalidade"
            value={data.nacionalidade}
            onChange={(e) => handleChange('nacionalidade', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="estadoCivil">Estado Civil</Label>
          <Select
            value={data.estadoCivil}
            onValueChange={(value) => handleChange('estadoCivil', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              {estadosCivis.map((estado) => (
                <SelectItem key={estado} value={estado}>
                  {estado}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="endereco">Endereço</Label>
          <Input
            id="endereco"
            value={data.endereco}
            onChange={(e) => handleChange('endereco', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tipoDocumento">Tipo de Documento</Label>
          <Select
            value={data.tipoDocumento}
            onValueChange={(value) => handleChange('tipoDocumento', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              {tiposDocumento.map((tipo) => (
                <SelectItem key={tipo} value={tipo}>
                  {tipo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="rg">RG</Label>
          <Input
            id="rg"
            value={data.rg}
            onChange={(e) => handleChange('rg', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="orgaoExpedidor">Órgão Expedidor</Label>
          <Input
            id="orgaoExpedidor"
            value={data.orgaoExpedidor}
            onChange={(e) => handleChange('orgaoExpedidor', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cidade">Cidade</Label>
          <Input
            id="cidade"
            value={data.cidade}
            onChange={(e) => handleChange('cidade', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="filiacao">Filiação</Label>
          <Input
            id="filiacao"
            value={data.filiacao}
            onChange={(e) => handleChange('filiacao', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dataEmissao">Data de Emissão</Label>
          <Input
            id="dataEmissao"
            type="date"
            value={data.dataEmissao}
            onChange={(e) => handleChange('dataEmissao', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="profissao">Profissão</Label>
          <Input
            id="profissao"
            value={data.profissao}
            onChange={(e) => handleChange('profissao', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cpf">CPF</Label>
          <Input
            id="cpf"
            value={data.cpf}
            onChange={(e) => handleChange('cpf', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="telefone">Telefone</Label>
          <Input
            id="telefone"
            value={data.telefone}
            onChange={(e) => handleChange('telefone', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="whatsapp">WhatsApp</Label>
          <Input
            id="whatsapp"
            value={data.whatsapp}
            onChange={(e) => handleChange('whatsapp', e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center space-x-2 mt-4">
        <Switch
          checked={data.incluirConjuge}
          onCheckedChange={(checked) => handleChange('incluirConjuge', checked)}
        />
        <Label>Incluir Cônjuge</Label>
      </div>
    </div>
  );
}
