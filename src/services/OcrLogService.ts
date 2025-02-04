import { DocumentType } from './OcrService';

interface OcrLogEntry {
  timestamp: string;
  action: string;
  documentType: DocumentType;
  formPath: string;
  navigationPath: string[];
  fieldMappings: {
    fieldName: string;
    value: string;
    confidence: number;
  }[];
  success: boolean;
}

export class OcrLogService {
  private static instance: OcrLogService;
  private logs: OcrLogEntry[] = [];
  private currentFormPath: string = '';
  private currentNavigationPath: string[] = [];

  private constructor() {
    this.loadLogsFromStorage();
  }

  public static getInstance(): OcrLogService {
    if (!OcrLogService.instance) {
      OcrLogService.instance = new OcrLogService();
    }
    return OcrLogService.instance;
  }

  public setFormPath(path: string) {
    this.currentFormPath = path;
  }

  public setNavigationPath(path: string[]) {
    this.currentNavigationPath = path;
  }

  public logOcrAttempt(
    documentType: DocumentType,
    fieldMappings: { fieldName: string; value: string; confidence: number }[],
    success: boolean
  ) {
    const entry: OcrLogEntry = {
      timestamp: new Date().toISOString(),
      action: 'OCR_ATTEMPT',
      documentType,
      formPath: this.currentFormPath,
      navigationPath: [...this.currentNavigationPath],
      fieldMappings,
      success
    };

    this.logs.push(entry);
    this.saveLogsToStorage();
  }

  public logFieldMapping(fieldName: string, value: string, confidence: number) {
    const entry: OcrLogEntry = {
      timestamp: new Date().toISOString(),
      action: 'FIELD_MAPPING',
      documentType: 'RG',
      formPath: this.currentFormPath,
      navigationPath: [...this.currentNavigationPath],
      fieldMappings: [{ fieldName, value, confidence }],
      success: true
    };

    this.logs.push(entry);
    this.saveLogsToStorage();
  }

  private saveLogsToStorage() {
    try {
      // Manter apenas os últimos 100 logs para economizar espaço
      const recentLogs = this.logs.slice(-100);
      localStorage.setItem('ocr_logs', JSON.stringify(recentLogs));
    } catch (error) {
      console.warn('Erro ao salvar logs:', error);
    }
  }

  private loadLogsFromStorage() {
    try {
      const savedLogs = localStorage.getItem('ocr_logs');
      if (savedLogs) {
        this.logs = JSON.parse(savedLogs);
      }
    } catch (error) {
      console.warn('Erro ao carregar logs:', error);
    }
  }

  public exportLogsAsJson(): string {
    const recentLogs = this.logs.slice(-50);
    return JSON.stringify(recentLogs, null, 2);
  }

  public generateHtmlReport(): string {
    const recentLogs = this.logs.slice(-20);
    
    return `
      <html>
        <head>
          <style>
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { padding: 8px; border: 1px solid #ddd; }
            th { background-color: #f5f5f5; }
            .success { color: green; }
            .failure { color: red; }
            .path { color: #666; font-size: 0.9em; }
          </style>
        </head>
        <body>
          <h2>Relatório de OCR</h2>
          
          <div style="margin-bottom: 20px;">
            <h3>Resumo por Caminho de Navegação</h3>
            <table>
              <tr>
                <th>Caminho</th>
                <th>Total de Tentativas</th>
                <th>Taxa de Sucesso</th>
              </tr>
              ${this.generatePathSummary()}
            </table>
          </div>

          <div style="margin-bottom: 20px;">
            <h3>Histórico Detalhado</h3>
            <table>
              <tr>
                <th>Data/Hora</th>
                <th>Tipo Doc</th>
                <th>Caminho</th>
                <th>Campos</th>
                <th>Status</th>
              </tr>
              ${recentLogs.map(log => `
                <tr>
                  <td>${new Date(log.timestamp).toLocaleString()}</td>
                  <td>${log.documentType}</td>
                  <td class="path">${log.navigationPath.join(' > ')}</td>
                  <td>
                    ${log.fieldMappings.map(field => 
                      `${field.fieldName}: ${field.value} (${(field.confidence * 100).toFixed(1)}%)<br>`
                    ).join('')}
                  </td>
                  <td class="${log.success ? 'success' : 'failure'}">
                    ${log.success ? 'Sucesso' : 'Falha'}
                  </td>
                </tr>
              `).join('')}
            </table>
          </div>
        </body>
      </html>
    `;
  }

  private generatePathSummary(): string {
    const pathStats = new Map<string, { attempts: number; successes: number }>();
    
    this.logs.forEach(log => {
      const path = Array.isArray(log.navigationPath) ? log.navigationPath.join(' > ') : 'Caminho Desconhecido';
      const stats = pathStats.get(path) || { attempts: 0, successes: 0 };
      stats.attempts++;
      if (log.success) stats.successes++;
      pathStats.set(path, stats);
    });

    return Array.from(pathStats.entries())
      .map(([path, stats]) => `
        <tr>
          <td>${path}</td>
          <td>${stats.attempts}</td>
          <td>${((stats.successes / stats.attempts) * 100).toFixed(1)}%</td>
        </tr>
      `).join('');
  }

  public getSuccessRate(): number {
    if (this.logs.length === 0) return 0;
    const successfulAttempts = this.logs.filter(log => log.success).length;
    return (successfulAttempts / this.logs.length) * 100;
  }

  public getMostSuccessfulFields(): { fieldName: string; successRate: number }[] {
    const fieldStats: Map<string, { attempts: number; successes: number }> = new Map();

    this.logs.forEach(log => {
      log.fieldMappings.forEach(field => {
        const stats = fieldStats.get(field.fieldName) || { attempts: 0, successes: 0 };
        stats.attempts++;
        if (field.confidence > 0.7) stats.successes++;
        fieldStats.set(field.fieldName, stats);
      });
    });

    return Array.from(fieldStats.entries())
      .map(([fieldName, stats]) => ({
        fieldName,
        successRate: (stats.successes / stats.attempts) * 100
      }))
      .sort((a, b) => b.successRate - a.successRate);
  }

  public getRecentLogs(): OcrLogEntry[] {
    // Retorna os últimos 50 logs, ordenados do mais recente para o mais antigo
    return [...this.logs]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 50);
  }

  public getFieldHistory(fieldName: string): { value: string; confidence: number; timestamp: string }[] {
    return this.logs
      .filter(log => log.fieldMappings.some(field => field.fieldName === fieldName))
      .map(log => {
        const field = log.fieldMappings.find(f => f.fieldName === fieldName)!;
        return {
          value: field.value,
          confidence: field.confidence,
          timestamp: log.timestamp
        };
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public getLastSuccessfulValue(fieldName: string): { value: string; confidence: number } | null {
    const history = this.getFieldHistory(fieldName);
    const lastSuccess = history.find(entry => entry.confidence > 0.7);
    return lastSuccess ? { value: lastSuccess.value, confidence: lastSuccess.confidence } : null;
  }
} 