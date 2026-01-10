import { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Wifi, WifiOff } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackDescription?: string;
  onRetry?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * AIErrorBoundary - Phase 7 Final: Error Boundaries
 * Ensures Pulse Gallery and Body Map remain 100% functional in manual mode
 * when the AI API is unavailable.
 */
export class AIErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[AIErrorBoundary] Caught error:', error);
    console.error('[AIErrorBoundary] Error info:', errorInfo);
    this.setState({ errorInfo });
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    this.props.onRetry?.();
  };

  public render() {
    if (this.state.hasError) {
      const { fallbackTitle = 'שגיאת AI', fallbackDescription } = this.props;
      const isNetworkError = this.state.error?.message?.toLowerCase().includes('network') ||
                             this.state.error?.message?.toLowerCase().includes('fetch');

      return (
        <Card className="border-amber-500/30 bg-amber-50/10 dark:bg-amber-950/10">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-sm">
              {isNetworkError ? (
                <WifiOff className="h-4 w-4" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
              {fallbackTitle}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground" dir="rtl">
              {fallbackDescription || (
                isNetworkError 
                  ? 'שירות ה-AI אינו זמין כרגע. ניתן להמשיך לעבוד במצב ידני - גלריית הדפוסים ומפת הגוף פועלות כרגיל.'
                  : 'אירעה שגיאה בחיבור ל-AI. ניתן להמשיך לעבוד במצב ידני עם כל הפיצ\'רים הקליניים.'
              )}
            </p>
            
            <div className="flex items-center gap-3 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={this.handleRetry}
                className="gap-2"
              >
                <RefreshCw className="h-3 w-3" />
                נסה שוב
              </Button>
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Wifi className="h-3 w-3" />
                <span>מצב ידני פעיל</span>
              </div>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-xs mt-4">
                <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                  פרטי שגיאה (מפתחים)
                </summary>
                <pre className="mt-2 p-2 bg-muted rounded text-[10px] overflow-auto max-h-32" dir="ltr">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

/**
 * Wrapper for AI-dependent components
 * Provides graceful degradation when AI is unavailable
 */
export function withAIErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options?: { fallbackTitle?: string; fallbackDescription?: string }
) {
  return function WithAIErrorBoundary(props: P) {
    return (
      <AIErrorBoundary
        fallbackTitle={options?.fallbackTitle}
        fallbackDescription={options?.fallbackDescription}
      >
        <WrappedComponent {...props} />
      </AIErrorBoundary>
    );
  };
}

export default AIErrorBoundary;
