import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database, ArrowLeft } from 'lucide-react';

interface KnowledgeBaseCardProps {
  animationDelay?: number;
  activeAssets?: number;
}

export function KnowledgeBaseCard({ animationDelay = 0, activeAssets = 0 }: KnowledgeBaseCardProps) {
  return (
    <Link to="/knowledge-registry" className="block h-full">
      <Card 
        className="h-full border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 via-transparent to-teal-500/5 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300 cursor-pointer opacity-0 animate-fade-in group"
        style={{ animationDelay: `${animationDelay}ms`, animationFillMode: 'forwards' }}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Database className="h-5 w-5 text-emerald-500" />
            </div>
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs">
              {activeAssets} Active
            </Badge>
          </div>
          <CardTitle className="text-base mt-3 flex items-center gap-2">
            Knowledge Base
            <ArrowLeft className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-500" />
          </CardTitle>
          <CardDescription className="text-xs">
            מאגר הידע של ד"ר ספיר
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-1.5 mt-2">
            <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 border-border/50">
              RAG Search
            </Badge>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 border-border/50">
              AI Assistant
            </Badge>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 border-border/50">
              Clinical Data
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
