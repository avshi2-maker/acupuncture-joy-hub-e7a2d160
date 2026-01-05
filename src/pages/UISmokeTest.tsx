import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TokenCalculator } from '@/components/pricing/TokenCalculator';
import { FeatureComparisonTable } from '@/components/pricing/FeatureComparisonTable';
import { CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { useState } from 'react';

/**
 * UI Smoke Test Page
 * - No auth required
 * - Renders key components to catch build/JSX regressions early
 * - Use this page to verify critical UI components render without errors
 */
const UISmokeTest = () => {
  const [testResults, setTestResults] = useState<Record<string, 'pass' | 'fail' | 'loading'>>({});

  const markTest = (name: string, status: 'pass' | 'fail') => {
    setTestResults(prev => ({ ...prev, [name]: status }));
  };

  const TestSection = ({ 
    name, 
    children 
  }: { 
    name: string; 
    children: React.ReactNode;
  }) => {
    const status = testResults[name];
    
    return (
      <Card className="mb-4 overflow-visible">
        <CardHeader className="py-3">
          <CardTitle className="flex items-center justify-between text-base">
            <span>{name}</span>
            <div className="flex gap-2">
              {status === 'pass' && <CheckCircle className="h-5 w-5 text-green-500" />}
              {status === 'fail' && <XCircle className="h-5 w-5 text-red-500" />}
              {status === 'loading' && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
              {!status && (
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" onClick={() => markTest(name, 'pass')}>
                    ✓ Pass
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => markTest(name, 'fail')}>
                    ✗ Fail
                  </Button>
                </div>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-visible">
          {children}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            🧪 UI Smoke Test
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            No auth required. Renders key components to catch build/JSX regressions early.
          </p>
          <Badge variant="outline" className="mt-2">
            Build verification page
          </Badge>
        </div>

        {/* Test Summary */}
        <Card className="mb-6 bg-muted/30">
          <CardContent className="py-4">
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                {Object.values(testResults).filter(v => v === 'pass').length} Passed
              </span>
              <span className="flex items-center gap-1">
                <XCircle className="h-4 w-4 text-red-500" />
                {Object.values(testResults).filter(v => v === 'fail').length} Failed
              </span>
              <span className="flex items-center gap-1">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                {Object.keys(testResults).length === 0 ? 'No tests run' : `${Object.keys(testResults).length} total`}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Core UI Components */}
        <h2 className="text-lg font-semibold mb-4">Core Components</h2>

        <TestSection name="Buttons">
          <div className="flex flex-wrap gap-2">
            <Button variant="default">Default</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="hero">Hero</Button>
            <Button variant="jade">Jade</Button>
            <Button variant="gold">Gold</Button>
          </div>
        </TestSection>

        <TestSection name="Badges">
          <div className="flex flex-wrap gap-2">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Destructive</Badge>
            {/* Badge clipping test */}
            <div className="relative overflow-visible">
              <Badge className="absolute -top-2 -right-2 z-10">Positioned</Badge>
              <div className="w-20 h-10 bg-muted rounded" />
            </div>
          </div>
        </TestSection>

        <TestSection name="Form Elements">
          <div className="grid gap-4 max-w-sm">
            <div>
              <Label htmlFor="test-input">Text Input</Label>
              <Input id="test-input" placeholder="Type something..." />
            </div>
            <div>
              <Label htmlFor="disabled-input">Disabled Input</Label>
              <Input id="disabled-input" disabled placeholder="Disabled" />
            </div>
          </div>
        </TestSection>

        <TestSection name="Cards with Badges (Clipping Test)">
          <div className="grid md:grid-cols-3 gap-4 overflow-visible pt-6">
            {['Basic', 'Popular', 'Premium'].map((tier, i) => (
              <div key={tier} className="relative overflow-visible">
                {i === 1 && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                    <Badge className="bg-gold text-foreground shadow-lg whitespace-nowrap">
                      Most popular
                    </Badge>
                  </div>
                )}
                <Card className={`overflow-visible ${i === 1 ? 'ring-2 ring-gold' : ''}`}>
                  <CardHeader className={i === 1 ? 'pt-8' : ''}>
                    <CardTitle className="text-center">{tier}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground text-center">
                      Test card content
                    </p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </TestSection>

        <TestSection name="Skeleton Loading States">
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-20 w-full" />
          </div>
        </TestSection>

        <TestSection name="Accordion">
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger>Is this accordion working?</AccordionTrigger>
              <AccordionContent>
                Yes! The accordion renders and toggles correctly.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Another test item</AccordionTrigger>
              <AccordionContent>
                Content for the second accordion item.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </TestSection>

        <TestSection name="Tabs">
          <Tabs defaultValue="tab1">
            <TabsList>
              <TabsTrigger value="tab1">Tab 1</TabsTrigger>
              <TabsTrigger value="tab2">Tab 2</TabsTrigger>
              <TabsTrigger value="tab3">Tab 3</TabsTrigger>
            </TabsList>
            <TabsContent value="tab1" className="p-4">
              Content for Tab 1
            </TabsContent>
            <TabsContent value="tab2" className="p-4">
              Content for Tab 2
            </TabsContent>
            <TabsContent value="tab3" className="p-4">
              Content for Tab 3
            </TabsContent>
          </Tabs>
        </TestSection>

        {/* Complex Components */}
        <h2 className="text-lg font-semibold mb-4 mt-8">Complex Components</h2>

        <TestSection name="Token Calculator">
          <TokenCalculator />
        </TestSection>

        <TestSection name="Feature Comparison Table">
          <FeatureComparisonTable />
        </TestSection>

        {/* Mobile Responsiveness Check */}
        <h2 className="text-lg font-semibold mb-4 mt-8">Mobile Responsiveness</h2>
        
        <TestSection name="Responsive Grid">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="bg-muted p-4 rounded text-center">
                Item {n}
              </div>
            ))}
          </div>
        </TestSection>

        <TestSection name="Responsive Text">
          <p className="text-sm md:text-base lg:text-lg">
            This text should scale: small on mobile, base on tablet, large on desktop.
          </p>
        </TestSection>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t text-center text-sm text-muted-foreground">
          <p>Last checked: {new Date().toLocaleString()}</p>
          <p className="mt-1">
            If all components render without errors, the build is healthy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UISmokeTest;
