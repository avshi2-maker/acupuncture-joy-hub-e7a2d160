import { useMemo, useCallback } from 'react';
import { 
  findFiguresForPoints, 
  findBestFigureForPoint, 
  findFiguresForMeridian,
  findFiguresForBodyPart,
  getPointsForFigure,
  isPointOnFigure,
  normalizePointCode,
  FigureMapping,
  FIGURE_MAPPINGS,
  GenderFilter,
  AgeGroupFilter,
  getGenderAwareFigure,
  getAgeAwareFigure,
  getDemographicAwareFigure,
  findFiguresForPointsWithDemographics
} from '@/data/point-figure-mapping';
import { parsePointReferences } from '@/components/acupuncture/BodyFigureSelector';

interface DemographicFilters {
  gender?: GenderFilter;
  ageGroup?: AgeGroupFilter;
}

/**
 * Hook for working with point-to-figure mappings
 * Useful for RAG/AI integrations to automatically display correct body figures
 */
export function usePointFigureMapping(demographics?: DemographicFilters) {
  const { gender = null, ageGroup = null } = demographics || {};

  /**
   * Parse AI response text and find the best matching figures
   */
  const findFiguresFromText = useCallback((text: string): FigureMapping[] => {
    const pointCodes = parsePointReferences(text);
    return findFiguresForPointsWithDemographics(pointCodes, gender, ageGroup);
  }, [gender, ageGroup]);

  /**
   * Get the primary (best) figure for an AI response
   */
  const getBestFigureFromText = useCallback((text: string): FigureMapping | null => {
    const figures = findFiguresFromText(text);
    return figures[0] || null;
  }, [findFiguresFromText]);

  /**
   * Get all figures that should be displayed for a set of points
   */
  const getFiguresForPoints = useCallback((pointCodes: string[]): FigureMapping[] => {
    return findFiguresForPointsWithDemographics(pointCodes, gender, ageGroup);
  }, [gender, ageGroup]);

  /**
   * Get points that should be highlighted on a specific figure
   */
  const getHighlightedPointsForFigure = useCallback((filename: string, allPoints: string[]): string[] => {
    const figurePoints = getPointsForFigure(filename);
    const normalizedFigurePoints = figurePoints.map(normalizePointCode);
    
    return allPoints.filter(code => 
      normalizedFigurePoints.includes(normalizePointCode(code))
    );
  }, []);

  /**
   * Extract point codes from text
   */
  const extractPointsFromText = useCallback((text: string): string[] => {
    return parsePointReferences(text);
  }, []);

  /**
   * Get demographic-aware figure filename
   */
  const getDemographicFigure = useCallback((filename: string): string => {
    return getDemographicAwareFigure(filename, gender, ageGroup);
  }, [gender, ageGroup]);

  /**
   * Get all available figures
   */
  const allFigures = useMemo(() => FIGURE_MAPPINGS, []);

  /**
   * Get high priority figures (good for quick selection)
   */
  const highPriorityFigures = useMemo(() => 
    FIGURE_MAPPINGS.filter(f => f.clinicalPriority === 'High'),
  []);

  return {
    findFiguresFromText,
    getBestFigureFromText,
    getFiguresForPoints,
    getHighlightedPointsForFigure,
    extractPointsFromText,
    findFiguresForMeridian,
    findFiguresForBodyPart,
    findBestFigureForPoint,
    getPointsForFigure,
    isPointOnFigure,
    allFigures,
    highPriorityFigures,
    // New demographic-aware functions
    getDemographicFigure,
    getGenderAwareFigure,
    getAgeAwareFigure,
  };
}
