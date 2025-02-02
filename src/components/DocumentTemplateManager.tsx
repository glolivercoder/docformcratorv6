import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { DocumentTemplate } from '@/types/documents';
import { Download, Edit2, FileUp, Plus, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

const documentCategories = [
  {
    id: 'contratos',
    name: 'Contratos',
    subcategories: [
      { id: 'locacao', name: 'Locação' },
      { id: 'venda', name: 'Venda' },
      { id: 'permuta', name: 'Permuta' },
    ],
  },
  {
    id: 'procuracoes',
    name: 'Procurações',
    subcategories: [
      { id: 'geral', name: 'Geral' },
      { id: 'especifica', name: 'Específica' },
    ],
  },
];

const initialTemplates: DocumentTemplate[] = [
  {
    id: 1,
    nome: 'Contrato de Locação',
    tipo: 'contratos',
    formato: 'pdf',
    campos: ['[nome_cliente]', '[cpf]', '[endereco]'],
    conteudo: '',
    categoria: 'locacao',
  },
  {
    id: 2,
    nome: 'Procuração',
    tipo: 'procuracoes',
    formato: 'docx',
    campos: ['[outorgante]', '[outorgado]', '[finalidade]'],
    conteudo: '',
    categoria: 'geral',
  },
];

function DocumentTemplateManager() {
  const [templates, setTemplates] = useState<DocumentTemplate[]>(initialTemplates);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Implementar lógica de upload
      toast({
        title: 'Sucesso',
        description: 'Arquivo carregado com sucesso',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao carregar arquivo',
        variant: 'destructive',
      });
    }
  };

  const handleNewTemplate = () => {
    // Implementar lógica de novo template
  };

  const handleEditTemplate = (id: number) => {
    // Implementar lógica de edição
  };

  const handleDeleteTemplate = (id: number) => {
    // Implementar lógica de exclusão
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Modelos de Documento</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Novo Modelo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Modelo de Documento</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Categoria</label>
                <Select onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {documentCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedCategory && (
                <div>
                  <label className="text-sm font-medium">Subcategoria</label>
                  <Select onValueChange={setSelectedSubcategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a subcategoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {documentCategories
                        .find((cat) => cat.id === selectedCategory)
                        ?.subcategories.map((sub) => (
                          <SelectItem key={sub.id} value={sub.id}>
                            {sub.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <label className="text-sm font-medium">Arquivo</label>
                <Input type="file" onChange={handleFileUpload} accept=".pdf,.doc,.docx" />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card key={template.id} className="p-4 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{template.nome}</h3>
                <p className="text-sm text-muted-foreground">
                  {template.formato.toUpperCase()} - {template.campos.length} campos
                </p>
              </div>
              <div className="flex space-x-2">
                <Button variant="ghost" size="icon" onClick={() => handleEditTemplate(template.id)}>
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteTemplate(template.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="text-sm">
              {template.campos.map((campo, index) => (
                <span
                  key={index}
                  className="inline-block bg-secondary text-secondary-foreground rounded px-2 py-1 text-xs mr-2 mb-2"
                >
                  {campo}
                </span>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default DocumentTemplateManager;
