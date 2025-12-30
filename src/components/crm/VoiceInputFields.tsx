import type React from 'react';
import { forwardRef, useCallback, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { VoiceInputButton } from '@/components/ui/VoiceInputButton';
import { cn } from '@/lib/utils';

type VoiceTextareaProps = Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  'onChange' | 'value'
> & {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onValueChange?: (value: string) => void;
};

export const VoiceTextarea = forwardRef<HTMLTextAreaElement, VoiceTextareaProps>(
  ({ value, onChange, onValueChange, className, ...textareaProps }, forwardedRef) => {
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    const setRefs = useCallback(
      (node: HTMLTextAreaElement | null) => {
        textareaRef.current = node;

        if (typeof forwardedRef === 'function') {
          forwardedRef(node);
        } else if (forwardedRef) {
          (forwardedRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
        }
      },
      [forwardedRef]
    );

    const handleTranscription = (text: string) => {
      const currentValue = value || '';
      const newValue = currentValue ? `${currentValue} ${text}` : text;

      if (onValueChange) {
        onValueChange(newValue);
        return;
      }

      if (onChange && textareaRef.current) {
        // Create a synthetic event (keeps react-hook-form Controller happy)
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
          ref={setRefs}
          value={value}
          onChange={onChange}
          className={cn('pr-12', className)}
          {...textareaProps}
        />
        <div className="absolute right-2 top-2">
          <VoiceInputButton
            onTranscription={handleTranscription}
            disabled={textareaProps.disabled}
            size="sm"
            variant="ghost"
          />
        </div>
      </div>
    );
  }
);
VoiceTextarea.displayName = 'VoiceTextarea';

type VoiceInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> & {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onValueChange?: (value: string) => void;
};

export const VoiceInput = forwardRef<HTMLInputElement, VoiceInputProps>(
  ({ value, onChange, onValueChange, className, type = 'text', ...inputProps }, forwardedRef) => {
    const inputRef = useRef<HTMLInputElement | null>(null);

    const setRefs = useCallback(
      (node: HTMLInputElement | null) => {
        inputRef.current = node;

        if (typeof forwardedRef === 'function') {
          forwardedRef(node);
        } else if (forwardedRef) {
          (forwardedRef as React.MutableRefObject<HTMLInputElement | null>).current = node;
        }
      },
      [forwardedRef]
    );

    const handleTranscription = (text: string) => {
      const currentValue = value || '';
      const newValue = currentValue ? `${currentValue} ${text}` : text;

      if (onValueChange) {
        onValueChange(newValue);
        return;
      }

      if (onChange && inputRef.current) {
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
          ref={setRefs}
          type={type}
          value={value}
          onChange={onChange}
          className={cn('pr-12', className)}
          {...inputProps}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <VoiceInputButton
            onTranscription={handleTranscription}
            disabled={inputProps.disabled}
            size="sm"
            variant="ghost"
          />
        </div>
      </div>
    );
  }
);
VoiceInput.displayName = 'VoiceInput';
