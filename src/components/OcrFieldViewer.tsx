import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PersonRoleType } from '@/types/person';

interface OcrFieldViewerProps {
  fields: Record<string, { value: string; confidence: number }>;
  onFieldSelect: (fieldId: string, value: string) => void;
  role: PersonRoleType;
}

export function OcrFieldViewer({ fields, onFieldSelect, role }: OcrFieldViewerProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Campos Detectados</h3>
        <Badge variant="outline">{role}</Badge>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHeader>Campo</TableHeader>
            <TableHeader>Valor Detectado</TableHeader>
            <TableHeader>Confiança</TableHeader>
            <TableHeader>Ação</TableHeader>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Object.entries(fields).map(([fieldId, { value, confidence }]) => (
            <TableRow key={fieldId}>
              <TableCell className="font-medium">{fieldId}</TableCell>
              <TableCell>{value}</TableCell>
              <TableCell>
                <Badge 
                  variant={confidence > 0.8 ? "success" : confidence > 0.5 ? "warning" : "destructive"}
                >
                  {Math.round(confidence * 100)}%
                </Badge>
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onFieldSelect(fieldId, value)}
                >
                  Usar
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
