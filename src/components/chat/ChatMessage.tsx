import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Brain, User, Copy, Check, ThumbsUp, ThumbsDown } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  userMessage?: string; // The user's question that prompted this response
}

// Simple markdown-like formatting for chat responses
function formatContent(content: string): React.ReactNode {
  if (!content) return null;

  // Split content into lines
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let currentList: string[] = [];
  let listType: 'ul' | 'ol' | null = null;
  let codeBlock = false;
  let codeContent: string[] = [];

  const flushList = () => {
    if (currentList.length > 0) {
      const ListTag = listType === 'ol' ? 'ol' : 'ul';
      elements.push(
        <ListTag 
          key={`list-${elements.length}`} 
          className={cn(
            "my-2 space-y-1 text-right",
            listType === 'ol' ? "list-decimal list-inside" : "list-disc list-inside"
          )}
        >
          {currentList.map((item, i) => (
            <li key={i} className="text-sm leading-relaxed">{formatInlineText(item)}</li>
          ))}
        </ListTag>
      );
      currentList = [];
      listType = null;
    }
  };

  const flushCode = () => {
    if (codeContent.length > 0) {
      elements.push(
        <pre 
          key={`code-${elements.length}`} 
          className="my-2 p-3 bg-muted/50 rounded-lg overflow-x-auto text-xs font-mono border border-border/50"
        >
          <code>{codeContent.join('\n')}</code>
        </pre>
      );
      codeContent = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code block handling
    if (line.startsWith('```')) {
      if (codeBlock) {
        flushCode();
        codeBlock = false;
      } else {
        flushList();
        codeBlock = true;
      }
      continue;
    }

    if (codeBlock) {
      codeContent.push(line);
      continue;
    }

    // Empty line
    if (line.trim() === '') {
      flushList();
      elements.push(<div key={`space-${i}`} className="h-2" />);
      continue;
    }

    // Headers
    if (line.startsWith('### ')) {
      flushList();
      elements.push(
        <h4 key={`h4-${i}`} className="font-semibold text-sm mt-3 mb-1 text-foreground">
          {formatInlineText(line.slice(4))}
        </h4>
      );
      continue;
    }
    if (line.startsWith('## ')) {
      flushList();
      elements.push(
        <h3 key={`h3-${i}`} className="font-bold text-base mt-4 mb-2 text-foreground">
          {formatInlineText(line.slice(3))}
        </h3>
      );
      continue;
    }
    if (line.startsWith('# ')) {
      flushList();
      elements.push(
        <h2 key={`h2-${i}`} className="font-bold text-lg mt-4 mb-2 text-foreground">
          {formatInlineText(line.slice(2))}
        </h2>
      );
      continue;
    }

    // Bullet lists
    if (line.match(/^[-*•]\s/)) {
      if (listType !== 'ul') {
        flushList();
        listType = 'ul';
      }
      currentList.push(line.slice(2));
      continue;
    }

    // Numbered lists
    if (line.match(/^\d+\.\s/)) {
      if (listType !== 'ol') {
        flushList();
        listType = 'ol';
      }
      currentList.push(line.replace(/^\d+\.\s/, ''));
      continue;
    }

    // Regular paragraph
    flushList();
    elements.push(
      <p key={`p-${i}`} className="text-sm leading-relaxed my-1">
        {formatInlineText(line)}
      </p>
    );
  }

  flushList();
  flushCode();

  return elements;
}

// Format inline text (bold, italic, code)
function formatInlineText(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let keyIndex = 0;

  while (remaining.length > 0) {
    // Bold **text**
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    // Italic *text* or _text_
    const italicMatch = remaining.match(/(?<!\*)\*([^*]+)\*(?!\*)|_([^_]+)_/);
    // Inline code `code`
    const codeMatch = remaining.match(/`([^`]+)`/);

    const matches = [
      boldMatch && { match: boldMatch, type: 'bold', index: boldMatch.index! },
      italicMatch && { match: italicMatch, type: 'italic', index: italicMatch.index! },
      codeMatch && { match: codeMatch, type: 'code', index: codeMatch.index! },
    ].filter(Boolean).sort((a, b) => a!.index - b!.index);

    if (matches.length === 0 || matches[0]!.index > 0) {
      const textEnd = matches.length > 0 ? matches[0]!.index : remaining.length;
      parts.push(<span key={keyIndex++}>{remaining.slice(0, textEnd)}</span>);
      remaining = remaining.slice(textEnd);
      continue;
    }

    const first = matches[0]!;
    const content = first.match[1] || first.match[2];

    if (first.type === 'bold') {
      parts.push(<strong key={keyIndex++} className="font-semibold">{content}</strong>);
      remaining = remaining.slice(first.match[0].length);
    } else if (first.type === 'italic') {
      parts.push(<em key={keyIndex++} className="italic">{content}</em>);
      remaining = remaining.slice(first.match[0].length);
    } else if (first.type === 'code') {
      parts.push(
        <code key={keyIndex++} className="px-1.5 py-0.5 bg-muted/70 rounded text-xs font-mono">
          {content}
        </code>
      );
      remaining = remaining.slice(first.match[0].length);
    }
  }

  return parts.length > 0 ? parts : text;
}

export function ChatMessage({ role, content, userMessage }: ChatMessageProps) {
  const isUser = role === 'user';
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<'positive' | 'negative' | null>(null);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success('הועתק ללוח');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('שגיאה בהעתקה');
    }
  };

  const handleFeedback = async (rating: 'positive' | 'negative') => {
    if (feedback || isSubmittingFeedback) return;
    
    setIsSubmittingFeedback(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        await supabase.from('chat_feedback').insert({
          user_id: user.id,
          message_content: userMessage || '',
          response_content: content,
          rating
        });
      }
      
      setFeedback(rating);
      toast.success(rating === 'positive' ? 'תודה על המשוב!' : 'תודה, נשתפר!');
    } catch (error) {
      console.error('Feedback error:', error);
      // Still show feedback locally even if save fails
      setFeedback(rating);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  return (
    <div
      className={cn(
        "flex gap-3 animate-fade-in-up group",
        isUser ? "flex-row" : "flex-row-reverse"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
          isUser 
            ? "bg-jade text-primary-foreground" 
            : "bg-gradient-to-br from-jade-light to-gold-light border border-jade/20"
        )}
      >
        {isUser ? (
          <User className="h-4 w-4" />
        ) : (
          <Brain className="h-4 w-4 text-jade" />
        )}
      </div>

      {/* Message bubble */}
      <div className="flex-1 max-w-[85%] relative">
        <div
          className={cn(
            "rounded-2xl px-4 py-3 shadow-soft",
            isUser 
              ? "bg-jade text-primary-foreground rounded-tr-sm" 
              : "bg-card border border-border/50 rounded-tl-sm"
          )}
        >
          {isUser ? (
            <p className="text-sm leading-relaxed text-right whitespace-pre-wrap">{content}</p>
          ) : (
            <div className="text-right" dir="rtl">
              {formatContent(content)}
            </div>
          )}
        </div>

        {/* Action buttons for assistant messages */}
        {!isUser && content && (
          <div className="absolute -bottom-1 left-2 flex gap-1">
            {/* Copy button */}
            <button
              onClick={handleCopy}
              className={cn(
                "p-1.5 rounded-lg transition-all duration-200",
                "bg-card border border-border/50 shadow-sm",
                "opacity-0 group-hover:opacity-100 hover:bg-muted",
                copied && "opacity-100 bg-jade/10 border-jade/30"
              )}
              title="העתק תגובה"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-jade" />
              ) : (
                <Copy className="h-3.5 w-3.5 text-muted-foreground" />
              )}
            </button>

            {/* Thumbs up */}
            <button
              onClick={() => handleFeedback('positive')}
              disabled={feedback !== null || isSubmittingFeedback}
              className={cn(
                "p-1.5 rounded-lg transition-all duration-200",
                "bg-card border border-border/50 shadow-sm",
                feedback === null && "opacity-0 group-hover:opacity-100 hover:bg-jade/10 hover:border-jade/30",
                feedback === 'positive' && "opacity-100 bg-jade/20 border-jade/40",
                feedback === 'negative' && "opacity-50",
                isSubmittingFeedback && "opacity-50 cursor-wait"
              )}
              title="תגובה מועילה"
            >
              <ThumbsUp className={cn(
                "h-3.5 w-3.5",
                feedback === 'positive' ? "text-jade" : "text-muted-foreground"
              )} />
            </button>

            {/* Thumbs down */}
            <button
              onClick={() => handleFeedback('negative')}
              disabled={feedback !== null || isSubmittingFeedback}
              className={cn(
                "p-1.5 rounded-lg transition-all duration-200",
                "bg-card border border-border/50 shadow-sm",
                feedback === null && "opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:border-destructive/30",
                feedback === 'negative' && "opacity-100 bg-destructive/20 border-destructive/40",
                feedback === 'positive' && "opacity-50",
                isSubmittingFeedback && "opacity-50 cursor-wait"
              )}
              title="תגובה לא מועילה"
            >
              <ThumbsDown className={cn(
                "h-3.5 w-3.5",
                feedback === 'negative' ? "text-destructive" : "text-muted-foreground"
              )} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function ChatTypingIndicator() {
  return (
    <div className="flex gap-3 flex-row-reverse animate-fade-in-up">
      <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-jade-light to-gold-light border border-jade/20">
        <Brain className="h-4 w-4 text-jade" />
      </div>
      <div className="bg-card border border-border/50 rounded-2xl rounded-tl-sm px-4 py-3 shadow-soft">
        <div className="flex gap-1 items-center h-5">
          <span className="w-2 h-2 bg-jade/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-jade/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-jade/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
