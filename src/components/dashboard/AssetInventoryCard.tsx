import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Boxes, ArrowLeft } from 'lucide-react';
import { SESSION_ASSET_BOXES, TOOLBAR_ASSETS, ASSET_CATEGORIES } from '@/config/sessionAssets';

interface AssetInventoryCardProps {
  animationDelay?: number;
}

export function AssetInventoryCard({ animationDelay = 0 }: AssetInventoryCardProps) {
  const totalAssets = SESSION_ASSET_BOXES.length + TOOLBAR_ASSETS.length;
  const categoryCount = Object.keys(ASSET_CATEGORIES).length;

  // Count by category
  const categoryCounts = Object.entries(ASSET_CATEGORIES).map(([key, value]) => ({
    key,
    label: value.labelHe,
    count: SESSION_ASSET_BOXES.filter(box => box.category === key).length
  })).filter(c => c.count > 0);

  return (
    <Link to="/asset-inventory" className="block h-full">
      <Card 
        className="h-full border-indigo-500/30 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300 cursor-pointer opacity-0 animate-fade-in group"
        style={{ animationDelay: `${animationDelay}ms`, animationFillMode: 'forwards' }}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <Boxes className="h-5 w-5 text-indigo-500" />
            </div>
            <Badge variant="secondary" className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs">
              {totalAssets} כלים
            </Badge>
          </div>
          <CardTitle className="text-base mt-3 flex items-center gap-2">
            מלאי נכסים
            <ArrowLeft className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-500" />
          </CardTitle>
          <CardDescription className="text-xs">
            {SESSION_ASSET_BOXES.length} כפתורים + {TOOLBAR_ASSETS.length} כלי toolbar
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-1.5 mt-2">
            {categoryCounts.slice(0, 4).map((cat) => (
              <Badge 
                key={cat.key} 
                variant="outline" 
                className="text-[10px] px-1.5 py-0.5 border-border/50"
              >
                {cat.label} ({cat.count})
              </Badge>
            ))}
            {categoryCounts.length > 4 && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 border-border/50">
                +{categoryCounts.length - 4}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
