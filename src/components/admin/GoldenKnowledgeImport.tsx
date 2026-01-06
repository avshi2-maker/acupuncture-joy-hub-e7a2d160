import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Upload, FileJson, Image, CheckCircle2, AlertCircle, Loader2, BookOpen } from 'lucide-react';
import JSZip from 'jszip';

interface ImportResult {
  success: boolean;
  documentId?: string;
  documentName?: string;
  chunksCreated?: number;
  chunksErrored?: number;
  imagesUploaded?: number;
  imageUrls?: { [ref: string]: string };
  error?: string;
}

export function GoldenKnowledgeImport() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string>('');
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processZipFile = async (file: File) => {
    setIsProcessing(true);
    setProgress(0);
    setStatus('Reading ZIP file...');
    setResult(null);

    try {
      const zip = new JSZip();
      const contents = await zip.loadAsync(file);
      
      setProgress(10);
      setStatus('Extracting JSON data...');

      // Find the JSON file
      let jsonData: any = null;
      let jsonFileName = '';
      
      for (const [filename, zipEntry] of Object.entries(contents.files)) {
        if (filename.endsWith('.json') && !zipEntry.dir) {
          jsonFileName = filename;
          const content = await zipEntry.async('string');
          jsonData = JSON.parse(content);
          break;
        }
      }

      if (!jsonData) {
        throw new Error('No JSON file found in ZIP');
      }

      setProgress(30);
      setStatus('Processing entries...');

      // Process JSON entries
      const entries: any[] = [];
      
      // Handle different JSON structures
      if (Array.isArray(jsonData)) {
        // Array of entries
        jsonData.forEach((item: any, index: number) => {
          entries.push({
            source_file: item.source_file || jsonFileName,
            section_title: item.section_title || item.title || null,
            hierarchy_path: item.hierarchy_path || item.path || null,
            content: item.content || item.text || JSON.stringify(item),
            page_number: item.page_number || item.page || null,
            image_ref: item.image_ref || item.imageRef || null,
            metadata: item.metadata || {},
          });
        });
      } else if (typeof jsonData === 'object') {
        // Object with sections
        const processObject = (obj: any, path: string = '') => {
          if (obj.content && typeof obj.content === 'string') {
            entries.push({
              source_file: obj.source_file || jsonFileName,
              section_title: obj.section_title || obj.title || null,
              hierarchy_path: path || obj.hierarchy_path || null,
              content: obj.content,
              page_number: obj.page_number || null,
              image_ref: obj.image_ref || null,
              metadata: obj.metadata || {},
            });
          }
          
          // Process nested objects
          for (const [key, value] of Object.entries(obj)) {
            if (key !== 'content' && typeof value === 'object' && value !== null) {
              if (Array.isArray(value)) {
                value.forEach((item: any, i: number) => {
                  if (typeof item === 'object') {
                    processObject(item, path ? `${path} > ${key}[${i}]` : `${key}[${i}]`);
                  }
                });
              } else {
                processObject(value, path ? `${path} > ${key}` : key);
              }
            }
          }
        };
        
        processObject(jsonData);
      }

      if (entries.length === 0) {
        throw new Error('No valid entries found in JSON');
      }

      setProgress(50);
      setStatus(`Found ${entries.length} entries. Extracting images...`);

      // Extract images
      const images: { [filename: string]: string } = {};
      const imageFiles = Object.entries(contents.files).filter(
        ([name, entry]) => !entry.dir && /\.(png|jpg|jpeg|webp|gif)$/i.test(name)
      );

      for (let i = 0; i < imageFiles.length; i++) {
        const [filename, entry] = imageFiles[i];
        const imageData = await entry.async('base64');
        const baseName = filename.split('/').pop() || filename;
        images[baseName] = imageData;
        setProgress(50 + (20 * (i + 1) / imageFiles.length));
      }

      setStatus(`Uploading ${entries.length} entries and ${Object.keys(images).length} images...`);
      setProgress(70);

      // Call the edge function
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) {
        throw new Error('You must be logged in to import knowledge');
      }

      const response = await supabase.functions.invoke('import-golden-knowledge', {
        body: {
          entries,
          images,
          documentName: file.name.replace('.zip', ''),
          category: 'golden-knowledge',
          language: 'en',
          clearExisting: false,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Import failed');
      }

      setProgress(100);
      setStatus('Import complete!');
      setResult(response.data as ImportResult);
      
      toast.success(`Imported ${response.data.chunksCreated} chunks with ${response.data.imagesUploaded} images`);

    } catch (error) {
      console.error('Import error:', error);
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      toast.error('Import failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith('.zip')) {
      processZipFile(file);
    } else {
      toast.error('Please select a ZIP file');
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          Golden Knowledge Base Import
        </CardTitle>
        <CardDescription>
          Import pre-processed TCM knowledge from a ZIP file containing JSON data and extracted images.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            accept=".zip"
            onChange={handleFileChange}
            className="hidden"
            disabled={isProcessing}
          />
          
          <div className="flex flex-col items-center gap-3">
            <div className="flex gap-2">
              <FileJson className="w-8 h-8 text-muted-foreground" />
              <Image className="w-8 h-8 text-muted-foreground" />
            </div>
            
            <div>
              <p className="font-medium">TCM Golden Bible ZIP</p>
              <p className="text-sm text-muted-foreground">
                Contains JSON with structured content and tongue diagnosis images
              </p>
            </div>
            
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              variant="outline"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Select ZIP File
                </>
              )}
            </Button>
          </div>
        </div>

        {isProcessing && (
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground text-center">{status}</p>
          </div>
        )}

        {result && (
          <div className={`p-4 rounded-lg ${result.success ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
            <div className="flex items-start gap-2">
              {result.success ? (
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              )}
              
              <div className="flex-1">
                {result.success ? (
                  <>
                    <p className="font-medium text-green-700 dark:text-green-400">Import Successful</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge variant="outline">
                        {result.chunksCreated} chunks created
                      </Badge>
                      <Badge variant="outline">
                        {result.imagesUploaded} images uploaded
                      </Badge>
                      {result.chunksErrored && result.chunksErrored > 0 && (
                        <Badge variant="destructive">
                          {result.chunksErrored} errors
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Document ID: {result.documentId}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-medium text-red-700 dark:text-red-400">Import Failed</p>
                    <p className="text-sm text-red-600 dark:text-red-300 mt-1">{result.error}</p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="bg-muted/50 rounded-lg p-4 text-sm space-y-2">
          <p className="font-medium">Expected ZIP Structure:</p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1">
            <li>TCM_GOLDEN_BIBLE_WITH_IMAGES.json - Main structured data</li>
            <li>extracted_tongue_images/ - Folder with PNG/JPG images</li>
          </ul>
          <p className="text-xs text-muted-foreground mt-2">
            Images will be uploaded to cloud storage and linked to knowledge chunks via image_ref field.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
