import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { DocumentType } from "@/types/documents";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { FileDown, Image, Printer, Camera } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { documentTypes, formatarDataPorExtenso } from "@/utils/documentTypes";
import { DocumentSection } from "./form/DocumentSection";
import { OCRFieldSelectDialog } from "./dialogs/OCRFieldSelectDialog";
import { OCRSelectionArea } from "./OCRSelectionArea";
import { databaseService } from "@/utils/database";
import cep from 'cep-promise';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { OcrLogService } from '@/services/OcrLogService';
import { OcrReportDialog } from './OcrReportDialog';
import { OcrService } from '@/services/OcrService';

interface DocumentFormProps {
  documentType: DocumentType;
  onFormDataChange?: (data: Record<string, any>) => void;
}

interface SubjectSelection {
  type: 'vendedor' | 'comprador' | 'locador' | 'locatario' | 'conjugeVendedor' | 'conjugeComprador' | 'conjugeLocador' | 'conjugeLocatario';
  label: string;
}

const DocumentForm = ({ documentType, onFormDataChange }: DocumentFormProps) => {
  const [formData, setFormData] = useState<any>({});
  const { toast } = useToast();
  const [useSystemDate, setUseSystemDate] = useState(false);
  const [showFieldSelect, setShowFieldSelect] = useState(false);
  const [showOCRSelection, setShowOCRSelection] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string>('');
  const [selectedField, setSelectedField] = useState('');
  const [incluirConjugeLocador, setIncluirConjugeLocador] = useState(true);
  const [incluirConjugeLocatario, setIncluirConjugeLocatario] = useState(false);
  const [showOcrReport, setShowOcrReport] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [extractedFields, setExtractedFields] = useState<any[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<SubjectSelection | null>(null);
  const [registeredUsers, setRegisteredUsers] = useState<Array<{
    id: string;
    role: string;
    data: any;
  }>>([]);
  const [showSubjectSelect, setShowSubjectSelect] = useState(false);
  const [ocrData, setOcrData] = useState<any>(null);

  useEffect(() => {
    const docType = documentType === DocumentType.LEASE_CONTRACT ? 'contratoLocacao' 
                  : documentType === DocumentType.SALE_CONTRACT ? 'contratoVenda'
                  : 'recibo';
    const initialData = documentTypes[docType].fields;
    setFormData(initialData);
    onFormDataChange?.(initialData);

    // Carregar dados do OCR se disponíveis
    if (documentType === DocumentType.SALE_CONTRACT) {
      loadOcrData(documentType, 'vendedor');
      loadOcrData(documentType, 'comprador');
    } else if (documentType === DocumentType.LEASE_CONTRACT) {
      loadOcrData(documentType, 'locador');
      loadOcrData(documentType, 'locatario');
    }
  }, [documentType]);

  useEffect(() => {
    if (useSystemDate) {
      const currentDate = formatarDataPorExtenso(new Date());
      handleInputChange('dataPorExtenso', currentDate);
    }
  }, [useSystemDate]);

  useEffect(() => {
    // Registrar o caminho do formulário atual
    const logger = OcrLogService.getInstance();
    logger.setFormPath(`${documentType}/${selectedField}`);
  }, [documentType, selectedField]);

  const handleInputChange = async (field: string, value: any, parent: string | null = null) => {
    // Se o campo for CEP, buscar endereço
    if (field === 'cep' && value.length === 8) {
      try {
        const address = await cep(value);
        const newValue = {
          cep: value,
          endereco: `${address.street}, ${address.neighborhood}`,
          cidade: address.city,
          estado: address.state,
        };
        
        setFormData(prev => {
          const newData = parent ? {
            ...prev,
            [parent]: {
              ...prev[parent],
              ...newValue
            }
          } : {
            ...prev,
            ...newValue
          };
          
          onFormDataChange?.(newData);
          return newData;
        });

        toast({
          title: "Endereço encontrado",
          description: "Os campos foram preenchidos automaticamente.",
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Erro ao buscar CEP",
          description: "Verifique se o CEP está correto.",
        });
      }
      return;
    }

    setFormData(prev => {
      const newData = parent ? {
        ...prev,
        [parent]: {
          ...prev[parent],
          [field]: value
        }
      } : {
        ...prev,
        [field]: value
      };
      
      onFormDataChange?.(newData);
      return newData;
    });

    // Log da alteração manual do campo
    const logger = OcrLogService.getInstance();
    logger.logFieldMapping(field, value, 1.0); // Confiança máxima para entrada manual
  };

  const handleCaptureImage = async () => {
    try {
      setShowFieldSelect(false);
      setShowOCRSelection(false);
      setCapturedImage('');
      
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      
      await new Promise((resolve) => {
        video.onloadedmetadata = resolve;
      });
      
      await video.play();

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageUrl = canvas.toDataURL('image/jpeg');
        
        stream.getTracks().forEach(track => track.stop());
        video.pause();
        video.srcObject = null;
        canvas.remove();
        
        setCapturedImage(imageUrl);
        setShowSubjectSelect(true);
      }
    } catch (error) {
      console.error('Error capturing image:', error);
      toast({
        variant: "destructive",
        title: "Erro ao capturar imagem",
        description: "Verifique se sua câmera está disponível.",
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setShowFieldSelect(false);
      setShowOCRSelection(false);
      setCapturedImage('');
      setImageFile(file);
      
      const ocrService = OcrService.getInstance();
      const result = await ocrService.extractText(file);

      setOcrData(result);
      setShowSubjectSelect(true);
      
      if (event.target) {
        event.target.value = '';
      }
    } catch (error) {
      console.error('Erro ao processar imagem:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível processar a imagem. Tente novamente.',
        variant: 'destructive'
      });
    }
  };

  const handleFieldSelect = async (field: string) => {
    const pathParts = field.split('.');
    const logger = OcrLogService.getInstance();
    
    // Registrar caminho de navegação
    const navigationPath = ['Documento'];
    if (documentType === DocumentType.LEASE_CONTRACT) {
      navigationPath.push('Contrato de Locação');
      if (pathParts[0] === 'locador') navigationPath.push('Locador');
      if (pathParts[0] === 'locatario') navigationPath.push('Locatário');
    } else if (documentType === DocumentType.SALE_CONTRACT) {
      navigationPath.push('Contrato de Venda');
      if (pathParts[0] === 'vendedor') navigationPath.push('Vendedor');
      if (pathParts[0] === 'comprador') navigationPath.push('Comprador');
    }
    navigationPath.push(pathParts[1] || pathParts[0]);
    
    logger.setNavigationPath(navigationPath);
    setSelectedField(field);
    setShowFieldSelect(false);
    setShowOCRSelection(true);
  };

  const handleSubjectSelect = (subject: SubjectSelection) => {
    setSelectedSubject(subject);
    const section = subject.type.startsWith('conjuge') 
      ? subject.type.replace('conjuge', '').toLowerCase()
      : subject.type;
    setActiveAccordion([section]);
    
    if (ocrData) {
      handleOCRResult(ocrData.text, subject);
    } else {
      setShowFieldSelect(true);
    }
  };

  const validateCPF = (cpf: string): boolean => {
    const cleanCPF = cpf.replace(/\D/g, '');
    if (cleanCPF.length !== 11) return false;
    
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
    }
    let digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(cleanCPF.charAt(9))) return false;
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
    }
    digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    return digit === parseInt(cleanCPF.charAt(10));
  };

  const cleanFieldValue = (field: string, value: string): string => {
    switch (field) {
      case 'cpf':
        const numbers = value.replace(/\D/g, '');
        return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
      case 'rg':
        return value.replace(/[^\d]/g, '');
      case 'naturalidade':
        return value.replace(/Data De Nascimento\s+/i, '').trim();
      default:
        return value;
    }
  };

  const handleOCRResult = async (text: string, subject: SubjectSelection) => {
    try {
      if (!subject) return;

      const parentKey = subject.type.startsWith('conjuge')
        ? `${subject.type.replace('conjuge', '').toLowerCase()}.conjuge`
        : subject.type;

      const navigationPath = ['Documento'];
      if (documentType === DocumentType.LEASE_CONTRACT) {
        navigationPath.push('Contrato de Locação');
        if (subject.type.includes('locador')) navigationPath.push('Locador');
        if (subject.type.includes('locatario')) navigationPath.push('Locatário');
      } else if (documentType === DocumentType.SALE_CONTRACT) {
        navigationPath.push('Contrato de Venda');
        if (subject.type.includes('vendedor')) navigationPath.push('Vendedor');
        if (subject.type.includes('comprador')) navigationPath.push('Comprador');
      }
      if (subject.type.includes('conjuge')) navigationPath.push('Cônjuge');

      const newData = { ...formData };
      if (!newData[parentKey]) newData[parentKey] = {};

      const fieldMapping: { [key: string]: string } = {
        nomeCompleto: 'nomeCompleto',
        cpf: 'cpf',
        rg: 'numeroDocumento',
        dataExpedicao: 'dataExpedicao',
        dataNascimento: 'dataNascimento',
        naturalidade: 'naturalidade',
        filiacao: 'filiacao'
      };

      Object.entries(fieldMapping).forEach(([ocrField, formField]) => {
        if (text[ocrField]) {
          const cleanValue = cleanFieldValue(ocrField, text[ocrField]);
          
          if (ocrField === 'cpf' && !validateCPF(cleanValue)) {
            toast({
              variant: "warning",
              title: "CPF Inválido",
              description: "O CPF extraído não é válido. Por favor, verifique.",
            });
            return;
          }

          newData[parentKey][formField] = cleanValue;
        }
      });

      setFormData(newData);
      onFormDataChange?.(newData);

      toast({
        title: "Dados extraídos",
        description: "Os campos foram preenchidos com os dados do OCR.",
      });

      setShowSubjectSelect(false);
      setOcrData(null);
    } catch (error) {
      console.error('Erro ao processar resultado do OCR:', error);
      toast({
        variant: "destructive",
        title: "Erro ao processar OCR",
        description: "Não foi possível atualizar os campos com o texto extraído.",
      });
    }
  };

  // Adicionar função para carregar dados do OCR
  const loadOcrData = (documentType: DocumentType, parent: string) => {
    const logger = OcrLogService.getInstance();
    const logs = logger.getRecentLogs();
    
    // Filtrar logs relevantes para o documento atual
    const relevantLogs = logs.filter(log => 
      log.documentType === 'RG' && 
      log.formPath.startsWith(`${documentType}/`) &&
      log.success
    );

    if (relevantLogs.length > 0) {
      // Mapa para armazenar os campos com maior confiança
      const bestFields = new Map<string, { value: string; confidence: number }>();
      
      relevantLogs.forEach(log => {
        log.fieldMappings.forEach(field => {
          const currentBest = bestFields.get(field.fieldName);
          if (!currentBest || field.confidence > currentBest.confidence) {
            bestFields.set(field.fieldName, {
              value: field.value,
              confidence: field.confidence
            });
          }
        });
      });

      // Mapeamento de campos do OCR para campos do formulário
      const fieldMapping: { [key: string]: string } = {
        nomeCompleto: 'nomeCompleto',
        cpf: 'cpf',
        rg: 'numeroDocumento',
        dataExpedicao: 'dataExpedicao',
        dataNascimento: 'dataNascimento',
        naturalidade: 'naturalidade',
        filiacao: 'filiacao'
      };

      // Atualizar o formulário com os dados do OCR
      setFormData(prev => {
        const newData = { ...prev };
        if (!newData[parent]) newData[parent] = {};

        bestFields.forEach((data, fieldName) => {
          const formField = fieldMapping[fieldName];
          if (formField) {
            newData[parent][formField] = data.value;
          }
        });

        // Se tiver RG, definir tipo de documento
        if (bestFields.has('rg')) {
          newData[parent]['tipoDocumento'] = 'RG';
        }

        onFormDataChange?.(newData);
        return newData;
      });

      toast({
        title: "Dados carregados",
        description: "Os campos foram preenchidos com os dados do OCR.",
      });
    }
  };

  const generatePDF = async () => {
    const element = document.getElementById("document-content");
    if (!element) return;

    try {
      const canvas = await html2canvas(element);
      const pdf = new jsPDF();
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 10, 10, 190, 277);
      pdf.save(`documento-${Date.now()}.pdf`);
      
      toast({
        title: "PDF gerado com sucesso!",
        description: "O documento foi salvo no seu computador.",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        variant: "destructive",
        title: "Erro ao gerar PDF",
        description: "Ocorreu um erro ao gerar o documento.",
      });
    }
  };

  const generateImage = async () => {
    const element = document.getElementById("document-content");
    if (!element) return;

    try {
      const canvas = await html2canvas(element);
      const link = document.createElement("a");
      link.download = `documento-${Date.now()}.jpeg`;
      link.href = canvas.toDataURL("image/jpeg");
      link.click();
      
      toast({
        title: "Imagem gerada com sucesso!",
        description: "A imagem foi salva no seu computador.",
      });
    } catch (error) {
      console.error("Error generating image:", error);
      toast({
        variant: "destructive",
        title: "Erro ao gerar imagem",
        description: "Ocorreu um erro ao gerar a imagem.",
      });
    }
  };

  const renderConjugeSection = (parentField: string, isOptional: boolean = false, includeConjuge: boolean = true, setIncludeConjuge?: (value: boolean) => void) => {
    const conjugeField = `conjuge${parentField.charAt(0).toUpperCase() + parentField.slice(1)}`;
    
    if (!formData[parentField]?.[conjugeField]) return null;

    return (
      <AccordionItem value={`conjuge-${parentField}`}>
        <AccordionTrigger className="text-left">
          Informações do Cônjuge
          {isOptional && (
            <div className="flex items-center space-x-2 ml-4" onClick={(e) => e.stopPropagation()}>
              <Checkbox
                id={`incluir-conjuge-${parentField}`}
                checked={includeConjuge}
                onCheckedChange={(checked) => setIncludeConjuge?.(checked as boolean)}
              />
              <label
                htmlFor={`incluir-conjuge-${parentField}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Incluir Cônjuge
              </label>
            </div>
          )}
        </AccordionTrigger>
        <AccordionContent>
          {(!isOptional || includeConjuge) && (
            <DocumentSection
              fields={formData[parentField][conjugeField]}
              parent={`${parentField}.${conjugeField}`}
              onInputChange={handleInputChange}
              useSystemDate={useSystemDate}
            />
          )}
        </AccordionContent>
      </AccordionItem>
    );
  };

  // Função para obter opções de sujeito baseado no tipo de documento
  const getSubjectOptions = (): SubjectSelection[] => {
    if (documentType === DocumentType.SALE_CONTRACT) {
      const options: SubjectSelection[] = [
        { type: 'vendedor', label: 'Vendedor' },
        { type: 'comprador', label: 'Comprador' }
      ];
      if (incluirConjugeLocador) options.push({ type: 'conjugeVendedor', label: 'Cônjuge do Vendedor' });
      if (incluirConjugeLocatario) options.push({ type: 'conjugeComprador', label: 'Cônjuge do Comprador' });
      return options;
    } else if (documentType === DocumentType.LEASE_CONTRACT) {
      const options: SubjectSelection[] = [
        { type: 'locador', label: 'Locador' },
        { type: 'locatario', label: 'Locatário' }
      ];
      if (incluirConjugeLocador) options.push({ type: 'conjugeLocador', label: 'Cônjuge do Locador' });
      if (incluirConjugeLocatario) options.push({ type: 'conjugeLocatario', label: 'Cônjuge do Locatário' });
      return options;
    }
    return [];
  };

  const handleContactAction = (phoneNumber: string, action: 'whatsapp' | 'telegram' | 'call') => {
    const formattedNumber = phoneNumber.replace(/\D/g, '');
    switch (action) {
      case 'whatsapp':
        window.open(`https://wa.me/${formattedNumber}`, '_blank');
        break;
      case 'telegram':
        window.open(`https://t.me/${formattedNumber}`, '_blank');
        break;
      case 'call':
        window.location.href = `tel:${formattedNumber}`;
        break;
    }
  };

  const handleSaveForm = async () => {
    try {
      const usersToSave = [];
      
      if (documentType === DocumentType.SALE_CONTRACT) {
        // Salvar vendedor
        if (formData.vendedor) {
          usersToSave.push({
            id: `vendedor_${Date.now()}`,
            role: 'Vendedor',
            data: formData.vendedor,
            documentType
          });
        }
        
        // Salvar cônjuge do vendedor
        if (formData.vendedor?.conjuge && incluirConjugeLocador) {
          usersToSave.push({
            id: `conjugeVendedor_${Date.now()}`,
            role: 'Cônjuge do Vendedor',
            data: formData.vendedor.conjuge,
            documentType
          });
        }
        
        // Salvar comprador
        if (formData.comprador) {
          usersToSave.push({
            id: `comprador_${Date.now()}`,
            role: 'Comprador',
            data: formData.comprador,
            documentType
          });
        }
        
        // Salvar cônjuge do comprador
        if (formData.comprador?.conjuge && incluirConjugeLocatario) {
          usersToSave.push({
            id: `conjugeComprador_${Date.now()}`,
            role: 'Cônjuge do Comprador',
            data: formData.comprador.conjuge,
            documentType
          });
        }
      } else if (documentType === DocumentType.LEASE_CONTRACT) {
        // Salvar locador
        if (formData.locador) {
          usersToSave.push({
            id: `locador_${Date.now()}`,
            role: 'Locador',
            data: formData.locador,
            documentType
          });
        }
        
        // Salvar cônjuge do locador
        if (formData.locador?.conjuge && incluirConjugeLocador) {
          usersToSave.push({
            id: `conjugeLocador_${Date.now()}`,
            role: 'Cônjuge do Locador',
            data: formData.locador.conjuge,
            documentType
          });
        }
        
        // Salvar locatário
        if (formData.locatario) {
          usersToSave.push({
            id: `locatario_${Date.now()}`,
            role: 'Locatário',
            data: formData.locatario,
            documentType
          });
        }
        
        // Salvar cônjuge do locatário
        if (formData.locatario?.conjuge && incluirConjugeLocatario) {
          usersToSave.push({
            id: `conjugeLocatario_${Date.now()}`,
            role: 'Cônjuge do Locatário',
            data: formData.locatario.conjuge,
            documentType
          });
        }
      }

      // Salvar todos os usuários no banco de dados
      for (const user of usersToSave) {
        await databaseService.saveUserDocument(user);
      }

      // Atualizar lista de usuários registrados
      setRegisteredUsers(prev => [...prev, ...usersToSave]);

      toast({
        title: "Dados salvos com sucesso",
        description: "Todos os usuários foram salvos no cadastro.",
      });

      // Limpar formulário após salvar
      const docType = documentType === DocumentType.LEASE_CONTRACT ? 'contratoLocacao' 
                    : documentType === DocumentType.SALE_CONTRACT ? 'contratoVenda'
                    : 'recibo';
      const initialData = documentTypes[docType].fields;
      setFormData(initialData);
      onFormDataChange?.(initialData);

    } catch (error) {
      console.error('Erro ao salvar formulário:', error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: "Não foi possível salvar os dados. Tente novamente.",
      });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Gerador de Documentos</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowOcrReport(true)}
          >
            Relatório OCR
          </Button>
          <Button onClick={generatePDF} className="flex items-center gap-2">
            <FileDown className="w-4 h-4" />
            Exportar PDF
          </Button>
          <Button onClick={generateImage} className="flex items-center gap-2">
            <Image className="w-4 h-4" />
            Exportar Imagem
          </Button>
          <Button
            onClick={() => window.print()}
            className="flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Imprimir
          </Button>
        </div>
      </div>

      {(showFieldSelect || showOCRSelection) && (
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">Selecione o Sujeito do Documento</h3>
          <div className="grid grid-cols-2 gap-2">
            {getSubjectOptions().map((option) => (
              <Button
                key={option.type}
                variant={selectedSubject?.type === option.type ? "default" : "outline"}
                onClick={() => handleSubjectSelect(option)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <Checkbox
              id="useSystemDate"
              checked={useSystemDate}
              onCheckedChange={(checked) => setUseSystemDate(checked as boolean)}
            />
            <Label htmlFor="useSystemDate">Usar data do sistema</Label>
          </div>

          <Accordion 
            type="multiple" 
            value={activeAccordion}
            onValueChange={setActiveAccordion}
            className="w-full space-y-4"
          >
            {documentType === DocumentType.LEASE_CONTRACT && (
              <>
                <AccordionItem value="locador">
                  <AccordionTrigger>Informações do Locador</AccordionTrigger>
                  <AccordionContent>
                    <DocumentSection
                      fields={formData.locador}
                      parent="locador"
                      onInputChange={handleInputChange}
                      useSystemDate={useSystemDate}
                    />
                    {renderConjugeSection('locador', true, incluirConjugeLocador, setIncluirConjugeLocador)}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="locatario">
                  <AccordionTrigger>Informações do Locatário</AccordionTrigger>
                  <AccordionContent>
                    <DocumentSection
                      fields={formData.locatario}
                      parent="locatario"
                      onInputChange={handleInputChange}
                      useSystemDate={useSystemDate}
                    />
                    {renderConjugeSection('locatario', true, incluirConjugeLocatario, setIncluirConjugeLocatario)}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="imovel">
                  <AccordionTrigger>Informações do Imóvel</AccordionTrigger>
                  <AccordionContent>
                    <DocumentSection
                      fields={formData.imovel}
                      parent="imovel"
                      onInputChange={handleInputChange}
                      useSystemDate={useSystemDate}
                    />
                  </AccordionContent>
                </AccordionItem>
              </>
            )}

            {documentType === DocumentType.SALE_CONTRACT && (
              <>
                <AccordionItem value="vendedor">
                  <AccordionTrigger>Informações do Vendedor</AccordionTrigger>
                  <AccordionContent>
                    <DocumentSection
                      fields={formData.vendedor}
                      parent="vendedor"
                      onInputChange={handleInputChange}
                      useSystemDate={useSystemDate}
                    />
                    {renderConjugeSection('vendedor')}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="comprador">
                  <AccordionTrigger>Informações do Comprador</AccordionTrigger>
                  <AccordionContent>
                    <DocumentSection
                      fields={formData.comprador}
                      parent="comprador"
                      onInputChange={handleInputChange}
                      useSystemDate={useSystemDate}
                    />
                    {renderConjugeSection('comprador')}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="imovel">
                  <AccordionTrigger>Informações do Imóvel</AccordionTrigger>
                  <AccordionContent>
                    <DocumentSection
                      fields={formData.imovel}
                      parent="imovel"
                      onInputChange={handleInputChange}
                      useSystemDate={useSystemDate}
                    />
                  </AccordionContent>
                </AccordionItem>
              </>
            )}
          </Accordion>
        </div>

        <Card className="p-6" id="document-content">
          <div className="prose max-w-none">
            <h1 className="text-2xl font-bold text-center mb-6">
              {documentType === DocumentType.LEASE_CONTRACT
                ? "Contrato de Locação"
                : documentType === DocumentType.SALE_CONTRACT
                ? "Contrato de Venda"
                : "Documento"}
            </h1>
            
            <div className="space-y-4">
              {Object.entries(formData).map(([section, data]: [string, any]) => (
                <div key={section}>
                  <h2 className="text-xl font-semibold">
                    {section.charAt(0).toUpperCase() + section.slice(1)}
                  </h2>
                  {Object.entries(data).map(([field, value]: [string, any]) => (
                    typeof value !== 'object' && (
                      <p key={field} className="mb-2">
                        <strong>{field.charAt(0).toUpperCase() + field.slice(1)}:</strong> {value}
                      </p>
                    )
                  ))}
                </div>
              ))}
            </div>
          </div>
        </Card>

        <OCRFieldSelectDialog
          open={showFieldSelect}
          onOpenChange={setShowFieldSelect}
          documentType={documentType}
          onFieldSelect={handleFieldSelect}
        />

        {showOCRSelection && (
          <OCRSelectionArea
            imageUrl={capturedImage}
            open={showOCRSelection}
            onOpenChange={setShowOCRSelection}
            onSelect={handleOCRResult}
            availableFields={[
              { label: 'Nome Completo', value: `${selectedField}.nomeCompleto` },
              { label: 'CPF', value: `${selectedField}.cpf` },
              { label: 'RG/Documento', value: `${selectedField}.numeroDocumento` },
              { label: 'Órgão Expedidor', value: `${selectedField}.orgaoExpedidor` },
              { label: 'Data de Expedição', value: `${selectedField}.dataExpedicao` },
              { label: 'Data de Nascimento', value: `${selectedField}.dataNascimento` },
              { label: 'Naturalidade', value: `${selectedField}.naturalidade` },
              { label: 'Filiação', value: `${selectedField}.filiacao` },
            ]}
          />
        )}

        <OcrReportDialog
          open={showOcrReport}
          onOpenChange={setShowOcrReport}
        />

        {showSubjectSelect && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
              <h3 className="text-lg font-medium mb-4">Selecione o Sujeito do Documento</h3>
              <div className="grid grid-cols-2 gap-2">
                {getSubjectOptions().map((option) => (
                  <Button
                    key={option.type}
                    variant="outline"
                    onClick={() => handleSubjectSelect(option)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-end">
          <Button 
            onClick={handleSaveForm}
            className="flex items-center gap-2"
            size="lg"
          >
            Salvar Todos os Dados
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DocumentForm;
