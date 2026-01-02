import { useState, useEffect, useMemo } from 'react';

export interface PointCoordinate {
  figure_filename: string;
  point_code: string;
  x_percent: number;
  y_percent: number;
}

// Parse CSV content
function parseCSV(csvText: string): PointCoordinate[] {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',');
  
  return lines.slice(1).map(line => {
    const values = line.split(',');
    return {
      figure_filename: values[0],
      point_code: values[1],
      x_percent: parseFloat(values[2]),
      y_percent: parseFloat(values[3])
    };
  }).filter(coord => !isNaN(coord.x_percent) && !isNaN(coord.y_percent));
}

export function usePointCoordinates() {
  const [coordinates, setCoordinates] = useState<PointCoordinate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCoordinates() {
      try {
        const response = await fetch('/knowledge-assets/point-coordinates.csv');
        if (!response.ok) throw new Error('Failed to load point coordinates');
        const csvText = await response.text();
        const parsed = parseCSV(csvText);
        setCoordinates(parsed);
      } catch (err) {
        console.error('Error loading point coordinates:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    }
    loadCoordinates();
  }, []);

  // Get coordinates for a specific figure
  const getCoordinatesForFigure = useMemo(() => {
    return (filename: string): PointCoordinate[] => {
      return coordinates.filter(c => c.figure_filename === filename);
    };
  }, [coordinates]);

  // Get coordinate for a specific point on a specific figure
  const getPointCoordinate = useMemo(() => {
    return (filename: string, pointCode: string): PointCoordinate | null => {
      const normalizedCode = pointCode.toUpperCase().replace(/\s/g, '');
      return coordinates.find(c => 
        c.figure_filename === filename && 
        c.point_code.toUpperCase().replace(/\s/g, '') === normalizedCode
      ) || null;
    };
  }, [coordinates]);

  // Get all figures that have a specific point
  const getFiguresForPoint = useMemo(() => {
    return (pointCode: string): string[] => {
      const normalizedCode = pointCode.toUpperCase().replace(/\s/g, '');
      return [...new Set(
        coordinates
          .filter(c => c.point_code.toUpperCase().replace(/\s/g, '') === normalizedCode)
          .map(c => c.figure_filename)
      )];
    };
  }, [coordinates]);

  // Search points by partial code or name
  const searchPoints = useMemo(() => {
    return (query: string): PointCoordinate[] => {
      const normalizedQuery = query.toUpperCase().replace(/\s/g, '');
      return coordinates.filter(c => 
        c.point_code.toUpperCase().replace(/\s/g, '').includes(normalizedQuery)
      );
    };
  }, [coordinates]);

  // Get all unique point codes
  const allPointCodes = useMemo(() => {
    return [...new Set(coordinates.map(c => c.point_code))].sort();
  }, [coordinates]);

  // Get all unique figure filenames
  const allFigures = useMemo(() => {
    return [...new Set(coordinates.map(c => c.figure_filename))].sort();
  }, [coordinates]);

  return {
    coordinates,
    isLoading,
    error,
    getCoordinatesForFigure,
    getPointCoordinate,
    getFiguresForPoint,
    searchPoints,
    allPointCodes,
    allFigures
  };
}
