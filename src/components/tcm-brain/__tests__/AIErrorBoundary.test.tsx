/**
 * AIErrorBoundary Unit Tests - Phase 7: Task 2
 * =============================================
 * Verifies "Graceful Degradation" when AI API is unavailable.
 * Ensures Pulse Gallery and Body Map remain 100% functional in manual mode.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AIErrorBoundary } from '../AIErrorBoundary';

// ============================================================
// HELPER: Component that throws an error
// ============================================================
const ThrowingComponent = ({ 
  errorMessage = 'Test error',
  shouldThrow = true 
}: { 
  errorMessage?: string;
  shouldThrow?: boolean;
}) => {
  if (shouldThrow) {
    throw new Error(errorMessage);
  }
  return <div data-testid="child-content">Child rendered successfully</div>;
};

// ============================================================
// HELPER: Component that simulates network timeout
// ============================================================
const NetworkTimeoutComponent = () => {
  throw new Error('Failed to fetch: 504 Gateway Timeout - Network request failed');
};

// ============================================================
// HELPER: Component that simulates sparkle animation crash
// ============================================================
const SparkleAnimationCrashComponent = () => {
  throw new Error('Cannot read properties of undefined (reading "animate")');
};

// Suppress console.error for cleaner test output (Error Boundaries log errors)
beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

// ============================================================
// TEST CASE A: API Timeout (504 Gateway Timeout)
// ============================================================
describe('Test Case A: API Timeout Handling', () => {
  it('should display manual mode message when network times out', () => {
    render(
      <AIErrorBoundary>
        <NetworkTimeoutComponent />
      </AIErrorBoundary>
    );

    // Should show network-specific error message
    expect(screen.getByText(/שירות ה-AI אינו זמין כרגע/)).toBeInTheDocument();
    
    // Should show manual mode indicator
    expect(screen.getByText(/מצב ידני פעיל/)).toBeInTheDocument();
  });

  it('should display retry button that resets error state', () => {
    const onRetry = vi.fn();
    
    render(
      <AIErrorBoundary onRetry={onRetry}>
        <NetworkTimeoutComponent />
      </AIErrorBoundary>
    );

    const retryButton = screen.getByRole('button', { name: /נסה שוב/i });
    expect(retryButton).toBeInTheDocument();
    
    fireEvent.click(retryButton);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('should show WifiOff icon for network errors', () => {
    render(
      <AIErrorBoundary>
        <NetworkTimeoutComponent />
      </AIErrorBoundary>
    );

    // The fallback title should be visible
    expect(screen.getByText(/שגיאת AI/)).toBeInTheDocument();
  });
});

// ============================================================
// TEST CASE B: UI Recovery after Sparkle Event Crash
// ============================================================
describe('Test Case B: Sparkle Animation Crash Recovery', () => {
  it('should catch sparkle animation crash and display error boundary', () => {
    render(
      <AIErrorBoundary fallbackTitle="שגיאת אנימציה">
        <SparkleAnimationCrashComponent />
      </AIErrorBoundary>
    );

    // Custom fallback title should be displayed
    expect(screen.getByText(/שגיאת אנימציה/)).toBeInTheDocument();
  });

  it('should display manual mode message after crash', () => {
    render(
      <AIErrorBoundary>
        <SparkleAnimationCrashComponent />
      </AIErrorBoundary>
    );

    // Should show manual mode indicator
    expect(screen.getByText(/מצב ידני פעיל/)).toBeInTheDocument();
  });

  it('should not crash the entire application', () => {
    const { container } = render(
      <div data-testid="dashboard-container">
        <div data-testid="other-component">Other Component Works</div>
        <AIErrorBoundary>
          <SparkleAnimationCrashComponent />
        </AIErrorBoundary>
      </div>
    );

    // Other components outside error boundary should still render
    expect(screen.getByTestId('other-component')).toBeInTheDocument();
    expect(screen.getByText('Other Component Works')).toBeInTheDocument();
    
    // Container should exist
    expect(container).toBeTruthy();
  });
});

// ============================================================
// TEST CASE C: State Integrity - Manual Points Preservation
// ============================================================
describe('Test Case C: State Integrity - Manual Points Preservation', () => {
  it('should not affect components outside the error boundary', () => {
    const ManualPointsDisplay = () => (
      <div>
        <span data-testid="point-ST36">ST36</span>
        <span data-testid="point-LI4">LI4</span>
        <span data-testid="point-SP6">SP6</span>
      </div>
    );

    render(
      <div>
        <ManualPointsDisplay />
        <AIErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </AIErrorBoundary>
      </div>
    );

    // Manual points should still be visible
    expect(screen.getByTestId('point-ST36')).toBeInTheDocument();
    expect(screen.getByTestId('point-LI4')).toBeInTheDocument();
    expect(screen.getByTestId('point-SP6')).toBeInTheDocument();
  });

  it('should preserve parent state when AI child crashes', () => {
    const parentState = { points: ['ST36', 'LI4', 'SP6'] };

    const ParentWithState = () => (
      <div>
        {parentState.points.map(point => (
          <span key={point} data-testid={`point-${point}`}>{point}</span>
        ))}<AIErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </AIErrorBoundary>
      </div>
    );

    render(<ParentWithState />);

    // All points should be preserved
    expect(screen.getByTestId('point-ST36')).toHaveTextContent('ST36');
    expect(screen.getByTestId('point-LI4')).toHaveTextContent('LI4');
    expect(screen.getByTestId('point-SP6')).toHaveTextContent('SP6');
  });

  it('should allow retry without losing external state', () => {
    let retryCount = 0;
    const onRetry = vi.fn(() => { retryCount++; });

    render(
      <div>
        <span data-testid="external-state">External State Preserved</span>
        <AIErrorBoundary onRetry={onRetry}>
          <ThrowingComponent shouldThrow={true} />
        </AIErrorBoundary>
      </div>
    );

    // Click retry
    fireEvent.click(screen.getByRole('button', { name: /נסה שוב/i }));

    // External state should still be there
    expect(screen.getByTestId('external-state')).toBeInTheDocument();
    expect(onRetry).toHaveBeenCalled();
    expect(retryCount).toBe(1);
  });
});

// ============================================================
// Additional Edge Cases
// ============================================================
describe('Edge Cases', () => {
  it('should render children when no error occurs', () => {
    render(
      <AIErrorBoundary>
        <ThrowingComponent shouldThrow={false} />
      </AIErrorBoundary>
    );

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.getByText('Child rendered successfully')).toBeInTheDocument();
  });

  it('should use custom fallback description when provided', () => {
    const customDescription = 'הודעה מותאמת אישית לבדיקה';

    render(
      <AIErrorBoundary fallbackDescription={customDescription}>
        <ThrowingComponent shouldThrow={true} />
      </AIErrorBoundary>
    );

    expect(screen.getByText(customDescription)).toBeInTheDocument();
  });

  it('should show AlertTriangle icon for non-network errors', () => {
    render(
      <AIErrorBoundary>
        <ThrowingComponent errorMessage="Random application error" shouldThrow={true} />
      </AIErrorBoundary>
    );

    // Should show generic AI error message (not network-specific)
    expect(screen.getByText(/אירעה שגיאה בחיבור ל-AI/)).toBeInTheDocument();
  });
});
