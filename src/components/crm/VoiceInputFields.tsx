import { useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { VoiceInputButton } from '@/components/ui/VoiceInputButton';
import { cn } from '@/lib/utils';

interface VoiceTextareaProps {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onValueChange?: (value: string) => void;
  className?: string;
  disabled?: boolean;
  rows?: number;
}

export function VoiceTextarea({
  placeholder,
  value,
  onChange,
  onValueChange,
  className,
  disabled,
  rows,
}: VoiceTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleTranscription = (text: string) => {
    const currentValue = value || '';
    const newValue = currentValue ? `${currentValue} ${text}` : text;
    
    if (onValueChange) {
      onValueChange(newValue);
    } else if (onChange && textareaRef.current) {
      // Create a synthetic event
      const nativeEvent = new Event('input', { bubbles: true });
      Object.defineProperty(nativeEvent, 'target', {
        value: { value: newValue },
        writable: false,
      });
      textareaRef.current.value = newValue;
      textareaRef.current.dispatchEvent(nativeEvent);
      onChange(nativeEvent as unknown as React.ChangeEvent<HTMLTextAreaElement>);
    }
  };

  return (
    <div className="relative">
      <Textarea
        ref={textareaRef}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={cn("pr-12", className)}
        disabled={disabled}
        rows={rows}
      />
      <div className="absolute right-2 top-2">
        <VoiceInputButton
          onTranscription={handleTranscription}
          disabled={disabled}
          size="sm"
          variant="ghost"
        />
      </div>
    </div>
  );
}

interface VoiceInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onValueChange?: (value: string) => void;
  className?: string;
  disabled?: boolean;
  type?: string;
}

export function VoiceInput({
  placeholder,
  value,
  onChange,
  onValueChange,
  className,
  disabled,
  type = 'text',
}: VoiceInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleTranscription = (text: string) => {
    const currentValue = value || '';
    const newValue = currentValue ? `${currentValue} ${text}` : text;
    
    if (onValueChange) {
      onValueChange(newValue);
    } else if (onChange && inputRef.current) {
      const nativeEvent = new Event('input', { bubbles: true });
      Object.defineProperty(nativeEvent, 'target', {
        value: { value: newValue },
        writable: false,
      });
      inputRef.current.value = newValue;
      inputRef.current.dispatchEvent(nativeEvent);
      onChange(nativeEvent as unknown as React.ChangeEvent<HTMLInputElement>);
    }
  };

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={cn("pr-12", className)}
        disabled={disabled}
      />
      <div className="absolute right-2 top-1/2 -translate-y-1/2">
        <VoiceInputButton
          onTranscription={handleTranscription}
          disabled={disabled}
          size="sm"
          variant="ghost"
        />
      </div>
    </div>
  );
}
