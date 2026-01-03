import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ClipboardList, 
  Brain, 
  Heart, 
  Palmtree,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AssessmentItem {
  id: string;
  title: string;
  titleEn: string;
  icon: React.ReactNode;
  href: string;
  hoverColor: string;
  bgHover: string;
}

const assessments: AssessmentItem[] = [
  {
    id: 'brain',
    title: 'בריאות המוח',
    titleEn: 'Brain Health & Stress',
    icon: <Brain className="h-5 w-5" />,
    href: '/brain-assessment',
    hoverColor: 'group-hover:border-violet-500',
    bgHover: 'group-hover:bg-violet-500/5',
  },
  {
    id: 'fullbody',
    title: 'אבחון גוף מלא (15 מדדים)',
    titleEn: 'Holistic Body Check',
    icon: <Heart className="h-5 w-5" />,
    href: '/full-body-assessment',
    hoverColor: 'group-hover:border-emerald-500',
    bgHover: 'group-hover:bg-emerald-500/5',
  },
  {
    id: 'retreat',
    title: 'התאמת ריטריט',
    titleEn: 'Global Retreat Finder',
    icon: <Palmtree className="h-5 w-5" />,
    href: '/retreat-quiz',
    hoverColor: 'group-hover:border-amber-500',
    bgHover: 'group-hover:bg-amber-500/5',
  },
];

interface AssessmentCenterCardProps {
  animationDelay?: number;
}

export function AssessmentCenterCard({ animationDelay = 0 }: AssessmentCenterCardProps) {
  return (
    <Card 
      className="h-full opacity-0 animate-fade-in overflow-hidden"
      style={{ 
        animationDelay: `${animationDelay}ms`, 
        animationFillMode: 'forwards' 
      }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <ClipboardList className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base">מרכז האבחונים</CardTitle>
            <p className="text-xs text-muted-foreground">Assessments</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-col gap-2">
          {assessments.map((assessment, index) => (
            <Link
              key={assessment.id}
              to={assessment.href}
              className="group"
            >
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className={`
                  flex items-center gap-3 p-3 rounded-xl
                  border border-transparent
                  bg-muted/30 transition-all duration-200
                  ${assessment.hoverColor} ${assessment.bgHover}
                  hover:shadow-sm
                `}
              >
                <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                  {assessment.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-foreground truncate">
                    {assessment.title}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {assessment.titleEn}
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-muted-foreground group-hover:translate-x-0.5 transition-all" />
              </motion.div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
