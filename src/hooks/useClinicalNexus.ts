import { useMemo, useCallback } from 'react';
import clinicalNexusData from '@/data/master-clinical-nexus.json';

// Types for the Clinical Nexus
export interface BodyMapCoord {
  figure: string;
  x: number;
  y: number;
}

export interface PulseNexusEntry {
  pulseId: string;
  finding: string;
  chineseName: string;
  category: string;
  tcmPatterns: string[];
  primaryPoints: string[];
  bodyMapCoords: Record<string, BodyMapCoord>;
  treatmentPrinciple: string;
  clinicalSignificance: string;
}

export interface ClinicalNexusResult {
  found: boolean;
  pulse: PulseNexusEntry | null;
  points: string[];
  coords: Record<string, BodyMapCoord>;
  figures: string[];
  metadata: {
    category: string;
    tcmPatterns: string[];
    treatmentPrinciple: string;
    clinicalSignificance: string;
  } | null;
}

// Type assertion for the imported JSON
const nexusData = clinicalNexusData as {
  version: string;
  description: string;
  lastUpdated: string;
  pulseNexus: PulseNexusEntry[];
  figureIndex: Record<string, string>;
  categoryIndex: string[];
};

/**
 * Hook for clinical pulse-to-point nexus operations
 * Provides mapping between pulse diagnoses and acupuncture points
 */
export function useClinicalNexus() {
  // Index pulses by ID for fast lookup
  const pulseIndex = useMemo(() => {
    const index = new Map<string, PulseNexusEntry>();
    nexusData.pulseNexus.forEach(pulse => {
      index.set(pulse.pulseId, pulse);
    });
    return index;
  }, []);

  // Index pulses by finding name for alternative lookup
  const findingIndex = useMemo(() => {
    const index = new Map<string, PulseNexusEntry>();
    nexusData.pulseNexus.forEach(pulse => {
      index.set(pulse.finding.toLowerCase(), pulse);
    });
    return index;
  }, []);

  // Index pulses by category
  const categoryIndex = useMemo(() => {
    const index = new Map<string, PulseNexusEntry[]>();
    nexusData.pulseNexus.forEach(pulse => {
      const existing = index.get(pulse.category) || [];
      existing.push(pulse);
      index.set(pulse.category, existing);
    });
    return index;
  }, []);

  /**
   * Get pulse data by Pulse_ID
   * @param pulseId - The pulse identifier (e.g., 'P-HUA-03')
   * @returns ClinicalNexusResult with pulse data, points, and coordinates
   */
  const getPulseById = useCallback((pulseId: string): ClinicalNexusResult => {
    const pulse = pulseIndex.get(pulseId);
    
    if (!pulse) {
      return {
        found: false,
        pulse: null,
        points: [],
        coords: {},
        figures: [],
        metadata: null
      };
    }

    // Extract unique figures from coordinates
    const figures = [...new Set(Object.values(pulse.bodyMapCoords).map(c => c.figure))];

    return {
      found: true,
      pulse,
      points: pulse.primaryPoints,
      coords: pulse.bodyMapCoords,
      figures,
      metadata: {
        category: pulse.category,
        tcmPatterns: pulse.tcmPatterns,
        treatmentPrinciple: pulse.treatmentPrinciple,
        clinicalSignificance: pulse.clinicalSignificance
      }
    };
  }, [pulseIndex]);

  /**
   * Get pulse data by finding name (fuzzy match)
   * @param findingName - The pulse finding name (e.g., 'Slippery Pulse')
   * @returns ClinicalNexusResult
   */
  const getPulseByFinding = useCallback((findingName: string): ClinicalNexusResult => {
    // Try exact match first
    let pulse = findingIndex.get(findingName.toLowerCase());
    
    // Try partial match if exact fails
    if (!pulse) {
      const searchTerm = findingName.toLowerCase();
      for (const [key, value] of findingIndex.entries()) {
        if (key.includes(searchTerm) || searchTerm.includes(key.split(' ')[0])) {
          pulse = value;
          break;
        }
      }
    }

    if (!pulse) {
      return {
        found: false,
        pulse: null,
        points: [],
        coords: {},
        figures: [],
        metadata: null
      };
    }

    const figures = [...new Set(Object.values(pulse.bodyMapCoords).map(c => c.figure))];

    return {
      found: true,
      pulse,
      points: pulse.primaryPoints,
      coords: pulse.bodyMapCoords,
      figures,
      metadata: {
        category: pulse.category,
        tcmPatterns: pulse.tcmPatterns,
        treatmentPrinciple: pulse.treatmentPrinciple,
        clinicalSignificance: pulse.clinicalSignificance
      }
    };
  }, [findingIndex]);

  /**
   * Get all pulses in a category
   * @param category - The pulse category (e.g., 'Pulse Rate')
   * @returns Array of PulseNexusEntry
   */
  const getPulsesByCategory = useCallback((category: string): PulseNexusEntry[] => {
    return categoryIndex.get(category) || [];
  }, [categoryIndex]);

  /**
   * Get all pulses that recommend a specific point
   * @param pointCode - The acupuncture point code (e.g., 'ST36')
   * @returns Array of PulseNexusEntry
   */
  const getPulsesForPoint = useCallback((pointCode: string): PulseNexusEntry[] => {
    return nexusData.pulseNexus.filter(pulse => 
      pulse.primaryPoints.includes(pointCode)
    );
  }, []);

  /**
   * Get all pulses matching a TCM pattern
   * @param pattern - The TCM pattern (e.g., 'Phlegm')
   * @returns Array of PulseNexusEntry
   */
  const getPulsesByPattern = useCallback((pattern: string): PulseNexusEntry[] => {
    const searchTerm = pattern.toLowerCase();
    return nexusData.pulseNexus.filter(pulse => 
      pulse.tcmPatterns.some(p => p.toLowerCase().includes(searchTerm))
    );
  }, []);

  /**
   * Get figure description
   * @param figureId - The figure identifier
   * @returns Description string or undefined
   */
  const getFigureDescription = useCallback((figureId: string): string | undefined => {
    return nexusData.figureIndex[figureId];
  }, []);

  /**
   * Get all available categories
   * @returns Array of category names
   */
  const getAllCategories = useCallback((): string[] => {
    return nexusData.categoryIndex;
  }, []);

  /**
   * Get all pulse entries
   * @returns Array of all PulseNexusEntry
   */
  const getAllPulses = useCallback((): PulseNexusEntry[] => {
    return nexusData.pulseNexus;
  }, []);

  /**
   * Search pulses by any text field
   * @param searchText - Search term
   * @returns Array of matching PulseNexusEntry
   */
  const searchPulses = useCallback((searchText: string): PulseNexusEntry[] => {
    const term = searchText.toLowerCase();
    return nexusData.pulseNexus.filter(pulse => 
      pulse.finding.toLowerCase().includes(term) ||
      pulse.chineseName.toLowerCase().includes(term) ||
      pulse.category.toLowerCase().includes(term) ||
      pulse.tcmPatterns.some(p => p.toLowerCase().includes(term)) ||
      pulse.treatmentPrinciple.toLowerCase().includes(term) ||
      pulse.clinicalSignificance.toLowerCase().includes(term)
    );
  }, []);

  return {
    // Primary lookup functions
    getPulseById,
    getPulseByFinding,
    
    // Category and filtering
    getPulsesByCategory,
    getPulsesForPoint,
    getPulsesByPattern,
    
    // Utility functions
    getFigureDescription,
    getAllCategories,
    getAllPulses,
    searchPulses,
    
    // Raw data access
    nexusVersion: nexusData.version,
    nexusLastUpdated: nexusData.lastUpdated,
    totalPulses: nexusData.pulseNexus.length
  };
}

// Standalone validation function for testing
export function validateClinicalNexus(pulseId: string): void {
  const nexus = nexusData.pulseNexus.find(p => p.pulseId === pulseId);
  
  if (nexus) {
    console.log('=== Clinical Nexus Validation ===');
    console.log('Pulse ID:', nexus.pulseId);
    console.log('Finding:', nexus.finding);
    console.log('Chinese Name:', nexus.chineseName);
    console.log('Category:', nexus.category);
    console.log('TCM Patterns:', nexus.tcmPatterns);
    console.log('Primary Points:', nexus.primaryPoints);
    console.log('Body Map Coords:', nexus.bodyMapCoords);
    console.log('Treatment Principle:', nexus.treatmentPrinciple);
    console.log('Clinical Significance:', nexus.clinicalSignificance);
    console.log('================================');
  } else {
    console.error(`Pulse ID "${pulseId}" not found in Clinical Nexus`);
  }
}

// Run validation for P-HUA-03 (Slippery Pulse) on module load for development
if (import.meta.env.DEV) {
  validateClinicalNexus('P-HUA-03');
}
