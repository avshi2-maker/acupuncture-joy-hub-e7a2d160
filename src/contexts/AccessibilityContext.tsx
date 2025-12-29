import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type FontSize = 'small' | 'medium' | 'large' | 'xlarge';

interface AccessibilityContextType {
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  highContrast: boolean;
  setHighContrast: (enabled: boolean) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

const FONT_SIZE_CLASSES: Record<FontSize, string> = {
  small: 'text-size-small',
  medium: 'text-size-medium',
  large: 'text-size-large',
  xlarge: 'text-size-xlarge',
};

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [fontSize, setFontSize] = useState<FontSize>(() => {
    const saved = localStorage.getItem('accessibility-font-size');
    return (saved as FontSize) || 'medium';
  });
  
  const [highContrast, setHighContrast] = useState(() => {
    const saved = localStorage.getItem('accessibility-high-contrast');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('accessibility-font-size', fontSize);
    
    // Remove all font size classes and add the current one
    Object.values(FONT_SIZE_CLASSES).forEach(cls => {
      document.documentElement.classList.remove(cls);
    });
    document.documentElement.classList.add(FONT_SIZE_CLASSES[fontSize]);
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem('accessibility-high-contrast', String(highContrast));
    
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [highContrast]);

  return (
    <AccessibilityContext.Provider value={{ fontSize, setFontSize, highContrast, setHighContrast }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}
