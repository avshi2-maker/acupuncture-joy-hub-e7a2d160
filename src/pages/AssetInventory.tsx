import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowRight, Boxes, Wrench, Video, Brain, Check } from 'lucide-react';
import { 
  SESSION_ASSET_BOXES, 
  TOOLBAR_ASSETS, 
  ASSET_CATEGORIES,
  ASSET_SUMMARY,
  type SessionAssetBox,
  type ToolbarAsset 
} from '@/config/sessionAssets';

export default function AssetInventory() {
  // Group header boxes by category
  const groupedAssets = Object.entries(ASSET_CATEGORIES).map(([key, value]) => ({
    category: key as SessionAssetBox['category'],
    label: value.label,
    labelHe: value.labelHe,
    assets: SESSION_ASSET_BOXES.filter(box => box.category === key)
  })).filter(group => group.assets.length > 0);

  return (
    <>
      <Helmet>
        <title>מלאי נכסים | CM Clinic</title>
        <meta name="description" content="Asset inventory for session tools and widgets" />
      </Helmet>

      <div className="min-h-screen bg-background" dir="rtl">
        {/* Header */}
        <header className="bg-card border-b border-border sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/dashboard">
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                  <Boxes className="h-5 w-5 text-indigo-500" />
                </div>
                <div>
                  <h1 className="font-display text-xl">מלאי נכסים</h1>
                  <p className="text-sm text-muted-foreground">כל הכלים והנכסים בפגישות</p>
                </div>
              </div>
            </div>
            
            {/* Summary Badges */}
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-indigo-500/10 text-indigo-600">
                {ASSET_SUMMARY.totalAssets} סה״כ
              </Badge>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="border-indigo-500/30">
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                    <Boxes className="h-5 w-5 text-indigo-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{ASSET_SUMMARY.totalAssets}</p>
                    <p className="text-xs text-muted-foreground">סה״כ נכסים</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-500/30">
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Brain className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{ASSET_SUMMARY.headerBoxes}</p>
                    <p className="text-xs text-muted-foreground">כפתורי Header</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-amber-500/30">
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <Wrench className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{ASSET_SUMMARY.toolbarAssets}</p>
                    <p className="text-xs text-muted-foreground">כלי Toolbar</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-emerald-500/30">
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <Check className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{ASSET_SUMMARY.categories}</p>
                    <p className="text-xs text-muted-foreground">קטגוריות</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Session Sync Status */}
          <Card className="mb-8 border-jade/30 bg-gradient-to-l from-jade/5 to-transparent">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-jade/10 flex items-center justify-center">
                      <Video className="h-4 w-4 text-jade" />
                    </div>
                    <span className="text-sm font-medium">Video Session</span>
                  </div>
                  <div className="flex items-center gap-2 text-jade">
                    <div className="w-2 h-2 rounded-full bg-jade animate-pulse" />
                    <span className="text-sm">מסונכרן</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                      <Brain className="h-4 w-4 text-purple-500" />
                    </div>
                    <span className="text-sm font-medium">Standard Session</span>
                  </div>
                </div>
                <Badge variant="outline" className="border-jade text-jade">
                  ✓ Shared Config Active
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Header Box Assets by Category */}
          <div className="space-y-6 mb-8">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-500" />
              כפתורי Header לפי קטגוריה
            </h2>
            
            <div className="grid gap-4">
              {groupedAssets.map((group, idx) => (
                <Card key={group.category} className="overflow-hidden">
                  <CardHeader className="pb-3 bg-muted/30">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        {idx + 1}. {group.labelHe}
                      </CardTitle>
                      <Badge variant="secondary">{group.assets.length} נכסים</Badge>
                    </div>
                    <CardDescription className="text-xs">{group.label}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {group.assets.map((asset, assetIdx) => (
                        <div 
                          key={asset.id}
                          className={`flex items-center gap-2 p-2 rounded-lg border ${asset.borderColor} bg-card hover:shadow-sm transition-shadow`}
                        >
                          <div className={`w-8 h-8 rounded-md bg-muted/50 flex items-center justify-center ${asset.color}`}>
                            <asset.icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{asset.nameHe}</p>
                            <p className="text-[10px] text-muted-foreground truncate">{asset.name}</p>
                          </div>
                          <span className="text-[10px] text-muted-foreground">#{(idx + 1)}.{assetIdx + 1}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Separator className="my-8" />

          {/* Toolbar Assets */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Wrench className="h-5 w-5 text-amber-500" />
              כלי Toolbar ({TOOLBAR_ASSETS.length})
            </h2>
            
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {TOOLBAR_ASSETS.map((asset, idx) => (
                    <div 
                      key={asset.id}
                      className={`flex items-center gap-2 p-2 rounded-lg border ${asset.borderColor} ${asset.bgColor} hover:shadow-sm transition-shadow`}
                    >
                      <div className={`w-8 h-8 rounded-md bg-white/50 flex items-center justify-center ${asset.color}`}>
                        <asset.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{asset.labelHe}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{asset.label}</p>
                      </div>
                      <span className="text-[10px] text-muted-foreground">#{idx + 1}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </>
  );
}
