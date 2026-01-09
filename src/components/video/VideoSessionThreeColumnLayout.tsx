import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface VideoSessionThreeColumnLayoutProps {
  // Column 1 (Right in RTL): Clinical Control & Navigation
  rightColumn: ReactNode;
  // Column 2 (Center): Live Interaction Hub
  centerColumn: ReactNode;
  // Column 3 (Left in RTL): Patient Data & Records
  leftColumn: ReactNode;
  className?: string;
}

/**
 * 3-Column RTL Grid Layout for Video Session
 * Distribution: 25% | 50% | 25%
 * 
 * Right (25%): SessionPhaseIndicator + Specialty Icons (60 boxes)
 * Center (50%): Video Container + RAG Live Summary
 * Left (25%): PatientBrief + Timer + Voice-enabled Notes
 */
export function VideoSessionThreeColumnLayout({
  rightColumn,
  centerColumn,
  leftColumn,
  className,
}: VideoSessionThreeColumnLayoutProps) {
  return (
    <div 
      className={cn(
        // RTL layout - grid flows right to left
        "grid grid-cols-1 lg:grid-cols-4 gap-3 md:gap-4",
        "h-full min-h-0 overflow-hidden",
        // RTL direction for natural Hebrew layout
        "dir-rtl",
        className
      )}
      dir="rtl"
    >
      {/* Column 1 (Right): Clinical Control & Navigation - 25% */}
      <div className="lg:col-span-1 flex flex-col gap-3 md:gap-4 overflow-hidden order-1 lg:order-none">
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {rightColumn}
        </div>
      </div>

      {/* Column 2 (Center): Live Interaction Hub - 50% */}
      <div className="lg:col-span-2 flex flex-col gap-3 md:gap-4 overflow-hidden order-3 lg:order-none min-h-0">
        {centerColumn}
      </div>

      {/* Column 3 (Left): Patient Data & Records - 25% */}
      <div className="lg:col-span-1 flex flex-col gap-3 md:gap-4 overflow-hidden order-2 lg:order-none">
        {leftColumn}
      </div>
    </div>
  );
}

/**
 * Sub-component for the Right Column content
 */
interface RightColumnProps {
  phaseIndicator: ReactNode;
  specialtyIcons: ReactNode;
  className?: string;
}

export function VideoSessionRightColumn({ 
  phaseIndicator, 
  specialtyIcons,
  className 
}: RightColumnProps) {
  return (
    <div className={cn("flex flex-col gap-4", className)} dir="rtl">
      {/* Phase Indicator at top */}
      <div className="flex-shrink-0">
        {phaseIndicator}
      </div>
      
      {/* Specialty Icons Grid */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {specialtyIcons}
      </div>
    </div>
  );
}

/**
 * Sub-component for the Center Column content
 */
interface CenterColumnProps {
  videoContainer: ReactNode;
  ragSummaryZone: ReactNode;
  stickyHeader?: ReactNode;
  className?: string;
}

export function VideoSessionCenterColumn({
  videoContainer,
  ragSummaryZone,
  stickyHeader,
  className,
}: CenterColumnProps) {
  return (
    <div className={cn("flex flex-col gap-3 md:gap-4 h-full", className)} dir="rtl">
      {/* Sticky Header (Timer + Status) */}
      {stickyHeader && (
        <div className="flex-shrink-0 sticky top-0 z-30">
          {stickyHeader}
        </div>
      )}
      
      {/* Video Container - Takes priority space */}
      <div className="flex-1 min-h-[300px] md:min-h-[400px]">
        {videoContainer}
      </div>
      
      {/* RAG Live Summary Zone - Fixed height, no shrink */}
      <div className="flex-shrink-0">
        {ragSummaryZone}
      </div>
    </div>
  );
}

/**
 * Sub-component for the Left Column content
 */
interface LeftColumnProps {
  patientBrief: ReactNode;
  sessionTimer: ReactNode;
  voiceNotes: ReactNode;
  className?: string;
}

export function VideoSessionLeftColumn({
  patientBrief,
  sessionTimer,
  voiceNotes,
  className,
}: LeftColumnProps) {
  return (
    <div className={cn("flex flex-col gap-3 md:gap-4 h-full", className)} dir="rtl">
      {/* Patient Brief */}
      <div className="flex-shrink-0">
        {patientBrief}
      </div>
      
      {/* Session Timer */}
      <div className="flex-shrink-0">
        {sessionTimer}
      </div>
      
      {/* Voice-enabled Notes - Takes remaining space */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {voiceNotes}
      </div>
    </div>
  );
}
