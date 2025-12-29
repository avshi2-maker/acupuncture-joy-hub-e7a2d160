import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { Upload, X, FileText, Info, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadedDocument {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
}

interface MedicalDocumentUploadProps {
  maxFiles?: number;
  onFilesChange: (files: File[]) => void;
  className?: string;
}

export function MedicalDocumentUpload({ 
  maxFiles = 5, 
  onFilesChange,
  className 
}: MedicalDocumentUploadProps) {
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newDocs: UploadedDocument[] = [];
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    const remainingSlots = maxFiles - documents.length;
    
    if (remainingSlots <= 0) {
      toast.error(`Maximum ${maxFiles} documents allowed`);
      return;
    }

    Array.from(files).slice(0, remainingSlots).forEach((file) => {
      if (!allowedTypes.includes(file.type)) {
        toast.error(`${file.name} is not a supported file type`);
        return;
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error(`${file.name} exceeds 10MB limit`);
        return;
      }

      newDocs.push({
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        size: file.size,
        type: file.type,
        file,
      });
    });

    if (newDocs.length > 0) {
      const updatedDocs = [...documents, ...newDocs];
      setDocuments(updatedDocs);
      onFilesChange(updatedDocs.map(d => d.file));
      toast.success(`${newDocs.length} document(s) added`);
    }
  };

  const removeDocument = (id: string) => {
    const updatedDocs = documents.filter(doc => doc.id !== id);
    setDocuments(updatedDocs);
    onFilesChange(updatedDocs.map(d => d.file));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Medical Documents</span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-sm">
                כל המסמכים נשמרים בצורה מאובטחת בתיק המטופל אצל המטפל בלבד. 
                <br />
                All documents are securely saved only in the therapist's patient files.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <span className="text-xs text-muted-foreground ml-auto">
          {documents.length}/{maxFiles} files
        </span>
      </div>

      {/* Privacy Notice */}
      <div className="p-3 rounded-lg border border-destructive/30 bg-destructive/5">
        <p className="text-xs text-destructive font-medium flex items-center gap-1">
          ⚠️ All documents are saved exclusively on the Therapist's secure files – never stored on this application.
        </p>
        <p className="text-xs text-destructive/80 mt-1" dir="rtl">
          כל המסמכים נשמרים בתיק המטפל בלבד – לעולם לא מאוחסנים באפליקציה זו.
        </p>
      </div>

      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer',
          isDragging ? 'border-jade bg-jade/5' : 'border-border hover:border-jade/50',
          documents.length >= maxFiles && 'opacity-50 cursor-not-allowed'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => documents.length < maxFiles && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files)}
          disabled={documents.length >= maxFiles}
        />
        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          {documents.length >= maxFiles 
            ? 'Maximum files reached'
            : 'Drag & drop or click to upload'}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          PDF, Images, Word (max 10MB each)
        </p>
      </div>

      {documents.length > 0 && (
        <div className="space-y-2">
          {documents.map((doc) => (
            <Card key={doc.id} className="bg-muted/50">
              <CardContent className="p-3 flex items-center gap-3">
                <FileText className="h-5 w-5 text-jade shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{doc.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(doc.size)}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeDocument(doc.id)}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
