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
      // Limpar estados
      setShowFieldSelect(false);
      setShowOCRSelection(false);
      setShowConfirmation(false);
      setCapturedImage('');
      setOcrData(null);
      
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
        // Primeiro mostrar seleção de usuário
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
      // Limpar estados
      setShowFieldSelect(false);
      setShowOCRSelection(false);
      setShowConfirmation(false);
      setCapturedImage('');
      setImageFile(file);
      setOcrData(null);
      
      // Primeiro mostrar seleção de usuário
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

  const handleSubjectSelect = async (subject: SubjectSelection) => {
    try {
      setSelectedSubject(subject);
      
      // Abrir seção correspondente no accordion
      const section = subject.type.startsWith('conjuge') 
        ? subject.type.replace('conjuge', '').toLowerCase()
        : subject.type;
      setActiveAccordion([section]);

      // Tentar OCR automático
      const ocrService = OcrService.getInstance();
      let ocrResult;
      
      if (capturedImage) {
        ocrResult = await ocrService.extractText(capturedImage);
      } else if (imageFile) {
        ocrResult = await ocrService.extractText(imageFile);
      }

      if (ocrResult && ocrResult.success) {
        // Se OCR teve sucesso, mostrar confirmação
        setOcrData(ocrResult);
        setShowConfirmation(true);
      } else {
        // Se OCR falhou, mostrar seleção manual
        setShowFieldSelect(true);
      }
      
      setShowSubjectSelect(false);
    } catch (error) {
      console.error('Erro ao processar OCR:', error);
      // Se der erro, mostrar seleção manual
      setShowFieldSelect(true);
      setShowSubjectSelect(false);
    }
  };

  const handleConfirmOCR = () => {
    if (!selectedSubject || !ocrData) return;
    
    // Preencher campos do formulário
    handleOCRResult(ocrData, selectedSubject);
    setShowConfirmation(false);
  };

  const handleManualSelect = () => {
    setShowConfirmation(false);
    setShowFieldSelect(true);
  };

  const handleFieldSelect = (field: string) => {
    setSelectedField(field);
    setShowFieldSelect(false);
    setShowOCRSelection(true);
  };

  const handleOCRResult = async (ocrResult: any, subject: SubjectSelection) => {
    try {
      if (!subject || !ocrResult) return;

      // Determinar caminho do campo
      const parentKey = subject.type.startsWith('conjuge')
        ? `${subject.type.replace('conjuge', '').toLowerCase()}.conjuge`
        : subject.type;

      // Forçar abertura da seção correta
      const section = subject.type.startsWith('conjuge') 
        ? subject.type.replace('conjuge', '').toLowerCase()
        : subject.type;
      setActiveAccordion([section]);

      // Atualizar APENAS os campos do sujeito selecionado
      const newData = { ...formData };
      if (!newData[parentKey]) newData[parentKey] = {};

      // Mapear TODOS os campos possíveis
      const fieldMapping: { [key: string]: string } = {
        nomeCompleto: 'nomeCompleto',
        cpf: 'cpf',
        rg: 'numeroDocumento',
        dataExpedicao: 'dataExpedicao',
        dataNascimento: 'dataNascimento',
        naturalidade: 'naturalidade',
        filiacao: 'filiacao',
        orgaoExpedidor: 'orgaoExpedidor',
        profissao: 'profissao',
        nacionalidade: 'nacionalidade',
        estadoCivil: 'estadoCivil',
        telefone: 'telefone',
        celular: 'celular',
        email: 'email',
        endereco: 'endereco',
        numero: 'numero',
        complemento: 'complemento',
        bairro: 'bairro',
        cidade: 'cidade',
        estado: 'estado',
        cep: 'cep'
      };

      // Preencher campos com dados do OCR
      Object.entries(fieldMapping).forEach(([ocrField, formField]) => {
        if (ocrResult.text?.[ocrField]) {
          const cleanValue = cleanFieldValue(ocrField, ocrResult.text[ocrField]);
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

      // Atualizar formulário
      setFormData(newData);
      onFormDataChange?.(newData);

      // Registrar no log
      const logger = OcrLogService.getInstance();
      Object.entries(fieldMapping).forEach(([ocrField, formField]) => {
        if (ocrResult.text?.[ocrField]) {
          logger.logFieldMapping(
            formField,
            ocrResult.text[ocrField],
            ocrResult.confidence || 0
          );
        }
      });

      toast({
        title: "Dados extraídos",
        description: `Os campos de ${subject.label} foram preenchidos.`,
      });

      // Limpar estados temporários
      setOcrData(null);
      setCapturedImage('');
      setImageFile(null);
      
    } catch (error) {
      console.error('Erro ao processar OCR:', error);
      toast({
        variant: "destructive",
        title: "Erro ao processar OCR",
        description: "Não foi possível preencher os campos. Use a seleção manual.",
      });
      setShowFieldSelect(true);
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

      // Agora sim, preencher o documento
      generateDocument();

      toast({
        title: "Dados salvos com sucesso",
        description: "Todos os usuários foram salvos no cadastro.",
      });

    } catch (error) {
      console.error('Erro ao salvar formulário:', error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: "Não foi possível salvar os dados. Tente novamente.",
      });
    }
  };

  // Função para gerar o documento final
  const generateDocument = () => {
    // Aqui você implementa a lógica para gerar o documento
    // Só será chamada após salvar os dados
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

      {showSubjectSelect && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-[400px] p-6">
            <h3 className="text-xl font-semibold mb-4">Selecione para quem são os dados</h3>
            <div className="grid gap-3">
              {getSubjectOptions().map((option) => (
                <Button
                  key={option.type}
                  variant="outline"
                  className="w-full justify-start text-left font-normal h-auto p-3"
                  onClick={() => handleSubjectSelect(option)}
                >
                  <div>
                    <div className="font-medium">{option.label}</div>
                    <div className="text-sm text-muted-foreground">
                      {option.type.includes('conjuge') 
                        ? 'Dados do cônjuge'
                        : option.type.includes('vendedor') || option.type.includes('locador')
                          ? 'Proprietário do imóvel'
                          : 'Interessado no imóvel'
                      }
                    </div>
                  </div>
                </Button>
              ))}
            </div>
            <Button
              variant="ghost"
              className="w-full mt-4"
              onClick={() => {
                setShowSubjectSelect(false);
                setCapturedImage('');
                setImageFile(null);
              }}
            >
              Cancelar
            </Button>
          </Card>
        </div>
      )}

      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-[400px] p-6">
            <h3 className="text-xl font-semibold mb-4">Confirmar Dados Extraídos</h3>
            <div className="space-y-4">
              {ocrData && Object.entries(ocrData.text).map(([field, value]) => (
                <div key={field} className="flex justify-between items-center">
                  <span className="font-medium">{field}:</span>
                  <span>{value as string}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <Button
                variant="default"
                className="flex-1"
                onClick={handleConfirmOCR}
              >
                Confirmar
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleManualSelect}
              >
                Seleção Manual
              </Button>
            </div>
          </Card>
        </div>
      )}

      {showFieldSelect && (
        <OCRFieldSelectDialog
          open={showFieldSelect}
          onOpenChange={setShowFieldSelect}
          documentType={documentType}
          onFieldSelect={handleFieldSelect}
        />
      )}

      {showOCRSelection && (
        <OCRSelectionArea
          imageUrl={capturedImage}
          open={showOCRSelection}
          onOpenChange={setShowOCRSelection}
          onSelect={handleOCRResult}
          availableFields={[
            { label: 'Nome Completo', value: 'nomeCompleto' },
            { label: 'CPF', value: 'cpf' },
            { label: 'RG', value: 'numeroDocumento' },
            { label: 'Data de Expedição', value: 'dataExpedicao' },
            { label: 'Data de Nascimento', value: 'dataNascimento' },
            { label: 'Naturalidade', value: 'naturalidade' },
            { label: 'Filiação', value: 'filiacao' },
          ]}
        />
      )}

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

      <div className="mt-8 flex justify-end">
        <Button 
          onClick={handleSaveForm}
          className="flex items-center gap-2"
          size="lg"
        >
          Salvar Todos os Dados
        </Button>
      </div>

      {/* Relatório OCR */}
      <OcrReportDialog
        open={showOcrReport}
        onOpenChange={setShowOcrReport}
      />
    </div>
  );
};

export default DocumentForm;
