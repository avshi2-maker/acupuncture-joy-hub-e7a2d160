import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface GenerateMP3ButtonProps {
  text: string;
  title?: string;
  className?: string;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
}

export function GenerateMP3Button({ 
  text, 
  title = 'TCM Report',
  className = '', 
  size = 'sm',
  variant = 'outline',
}: GenerateMP3ButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const generateMP3 = async () => {
    if (!text) {
      toast.error('No text to convert');
      return;
    }

    setIsGenerating(true);

    try {
      console.log('Generating MP3 for report...');
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ 
            text: text.substring(0, 5000),
            voice: 'Sarah'
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'TTS request failed');
      }

      const data = await response.json();
      
      if (!data.audioContent) {
        throw new Error('No audio content received');
      }

      // Convert base64 to blob
      const binaryString = atob(data.audioContent);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'audio/mpeg' });
      setAudioBlob(blob);
      
      // Create object URL for download
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      
      toast.success('MP3 generated successfully!');
      
    } catch (error) {
      console.error('MP3 generation error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate MP3');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadMP3 = () => {
    if (!audioUrl) return;
    
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = `${title.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    toast.success('MP3 downloaded!');
  };

  const shareToWhatsApp = () => {
    // Since we can't directly attach files to WhatsApp web, we provide instructions
    const message = encodeURIComponent(
      `🎧 *CM Brain Audio Report*\n\n` +
      `📅 Date: ${new Date().toLocaleDateString()}\n\n` +
      `I've generated an audio version of my CM consultation report.\n\n` +
      `_Note: The MP3 file has been downloaded to your device. You can share it as an attachment._`
    );
    
    // Download the file first
    downloadMP3();
    
    // Then open WhatsApp
    setTimeout(() => {
      window.open(`https://wa.me/?text=${message}`, '_blank');
    }, 500);
  };

  // If audio already generated, show download/share options
  if (audioBlob && audioUrl) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={variant}
            size={size}
            className={cn('gap-1.5 text-xs bg-jade/10 border-jade/30 text-jade hover:bg-jade/20', className)}
          >
            <Download className="h-3 w-3" />
            MP3 Ready
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={downloadMP3} className="gap-2 cursor-pointer">
            <Download className="h-4 w-4" />
            Download MP3
          </DropdownMenuItem>
          <DropdownMenuItem onClick={shareToWhatsApp} className="gap-2 cursor-pointer">
            <Share2 className="h-4 w-4" />
            Share via WhatsApp
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => {
              setAudioBlob(null);
              setAudioUrl(null);
            }} 
            className="gap-2 cursor-pointer text-muted-foreground"
          >
            Generate New
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button
      onClick={generateMP3}
      disabled={isGenerating || !text}
      variant={variant}
      size={size}
      className={cn('gap-1.5 text-xs', className)}
    >
      {isGenerating ? (
        <>
          <Loader2 className="h-3 w-3 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Download className="h-3 w-3" />
          Generate MP3
        </>
      )}
    </Button>
  );
}
