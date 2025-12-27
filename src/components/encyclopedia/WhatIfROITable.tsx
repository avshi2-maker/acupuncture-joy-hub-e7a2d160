import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, TrendingUp, Calculator, DollarSign, Edit3, Download, Share2 } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'sonner';
// Fixed costs that are known and true
const FIXED_COSTS = {
  lovablePlatform: 25, // Lovable Pro plan
  databaseHosting: 10, // Supabase included in Lovable Cloud
  domainSSL: 2, // Domain and SSL
  supportTools: 8, // Support/monitoring tools
  aiProcessingBase: 5, // Base AI infrastructure
  marketing: 10, // Basic marketing
};

const TOTAL_FIXED_MONTHLY = Object.values(FIXED_COSTS).reduce((a, b) => a + b, 0);

// AI cost per query
const AI_COST_PER_QUERY = 0.002;

// Tier pricing
const TIER_PRICING = {
  student: { price: 8, avgQueries: 45 },
  practitioner: { price: 25, avgQueries: 115 },
  researcher: { price: 50, avgQueries: 230 },
};

interface TierInputs {
  student: number;
  practitioner: number;
  researcher: number;
}

export function WhatIfROITable() {
  const [subscribers, setSubscribers] = useState<TierInputs>({
    student: 100,
    practitioner: 200,
    researcher: 50,
  });

  const calculations = useMemo(() => {
    // Revenue per tier
    const studentRevenue = subscribers.student * TIER_PRICING.student.price;
    const practitionerRevenue = subscribers.practitioner * TIER_PRICING.practitioner.price;
    const researcherRevenue = subscribers.researcher * TIER_PRICING.researcher.price;
    const totalRevenue = studentRevenue + practitionerRevenue + researcherRevenue;

    // AI costs per tier (based on average queries)
    const studentAICost = subscribers.student * TIER_PRICING.student.avgQueries * AI_COST_PER_QUERY;
    const practitionerAICost = subscribers.practitioner * TIER_PRICING.practitioner.avgQueries * AI_COST_PER_QUERY;
    const researcherAICost = subscribers.researcher * TIER_PRICING.researcher.avgQueries * AI_COST_PER_QUERY;
    const totalAICost = studentAICost + practitionerAICost + researcherAICost;

    // Total costs
    const totalVariableCost = totalAICost;
    const totalCost = TOTAL_FIXED_MONTHLY + totalVariableCost;

    // Profit
    const netProfit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0';

    // Total subscribers
    const totalSubscribers = subscribers.student + subscribers.practitioner + subscribers.researcher;

    return {
      studentRevenue,
      practitionerRevenue,
      researcherRevenue,
      totalRevenue,
      studentAICost,
      practitionerAICost,
      researcherAICost,
      totalAICost,
      totalVariableCost,
      totalCost,
      netProfit,
      profitMargin,
      totalSubscribers,
    };
  }, [subscribers]);

  const handleChange = (tier: keyof TierInputs, value: string) => {
    const numValue = parseInt(value) || 0;
    setSubscribers(prev => ({ ...prev, [tier]: Math.max(0, numValue) }));
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const date = new Date().toLocaleDateString();
    
    doc.setFontSize(18);
    doc.text('TCM Encyclopedia ROI Scenario', 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated: ${date}`, 14, 28);
    
    doc.setFontSize(12);
    doc.text('Scenario Configuration:', 14, 40);
    doc.setFontSize(10);
    doc.text(`Student Subscribers: ${subscribers.student}`, 20, 48);
    doc.text(`Practitioner Subscribers: ${subscribers.practitioner}`, 20, 55);
    doc.text(`Researcher Subscribers: ${subscribers.researcher}`, 20, 62);
    
    autoTable(doc, {
      startY: 72,
      head: [['Tier', 'Subscribers', 'Revenue', 'AI Costs', 'Net (before fixed)']],
      body: [
        ['Student', subscribers.student.toString(), `$${calculations.studentRevenue.toLocaleString()}`, `$${calculations.studentAICost.toFixed(2)}`, `$${(calculations.studentRevenue - calculations.studentAICost).toFixed(2)}`],
        ['Practitioner', subscribers.practitioner.toString(), `$${calculations.practitionerRevenue.toLocaleString()}`, `$${calculations.practitionerAICost.toFixed(2)}`, `$${(calculations.practitionerRevenue - calculations.practitionerAICost).toFixed(2)}`],
        ['Researcher', subscribers.researcher.toString(), `$${calculations.researcherRevenue.toLocaleString()}`, `$${calculations.researcherAICost.toFixed(2)}`, `$${(calculations.researcherRevenue - calculations.researcherAICost).toFixed(2)}`],
        ['TOTALS', calculations.totalSubscribers.toString(), `$${calculations.totalRevenue.toLocaleString()}`, `$${calculations.totalAICost.toFixed(2)}`, `$${(calculations.totalRevenue - calculations.totalAICost).toFixed(2)}`],
      ],
    });
    
    const finalY = (doc as any).lastAutoTable.finalY || 120;
    doc.setFontSize(12);
    doc.text('Summary:', 14, finalY + 15);
    doc.setFontSize(10);
    doc.text(`Total Revenue: $${calculations.totalRevenue.toLocaleString()}/mo`, 20, finalY + 25);
    doc.text(`Total Costs: $${calculations.totalCost.toFixed(2)}/mo (Fixed: $${TOTAL_FIXED_MONTHLY} + AI: $${calculations.totalAICost.toFixed(2)})`, 20, finalY + 32);
    doc.text(`Net Profit: $${calculations.netProfit.toLocaleString()}/mo`, 20, finalY + 39);
    doc.text(`Profit Margin: ${calculations.profitMargin}%`, 20, finalY + 46);
    
    doc.save(`Encyclopedia-ROI-Scenario-${date.replace(/\//g, '-')}.pdf`);
    toast.success('PDF exported successfully!');
  };

  const shareScenario = async () => {
    const scenarioText = `📊 TCM Encyclopedia ROI Scenario
    
📈 Configuration:
• Student: ${subscribers.student} subscribers ($8/mo)
• Practitioner: ${subscribers.practitioner} subscribers ($25/mo)
• Researcher: ${subscribers.researcher} subscribers ($50/mo)

💰 Results:
• Total Revenue: $${calculations.totalRevenue.toLocaleString()}/mo
• Total Costs: $${calculations.totalCost.toFixed(2)}/mo
• Net Profit: $${calculations.netProfit.toLocaleString()}/mo
• Margin: ${calculations.profitMargin}%

Generated by TCM Brain - ${new Date().toLocaleDateString()}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'TCM Encyclopedia ROI Scenario',
          text: scenarioText,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      await navigator.clipboard.writeText(scenarioText);
      toast.success('Scenario copied to clipboard!');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Edit3 className="h-5 w-5 text-jade" />
          <h3 className="text-xl font-bold">Encyclopedia What-If ROI Calculator</h3>
          <Badge className="bg-jade/20 text-jade border-jade/30 text-xs">Live</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportToPDF} className="gap-1">
            <Download className="h-4 w-4" />
            PDF
          </Button>
          <Button variant="outline" size="sm" onClick={shareScenario} className="gap-1">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </div>
      </div>
      {/* Input Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-jade/5 border-jade/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4 text-jade" />
              Student Tier ($8/mo)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="student" className="text-xs text-muted-foreground">Subscribers</Label>
              <Input
                id="student"
                type="number"
                min="0"
                value={subscribers.student}
                onChange={(e) => handleChange('student', e.target.value)}
                className="text-lg font-bold text-jade"
              />
              <p className="text-xs text-muted-foreground">~45 queries/mo avg</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gold/5 border-gold/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4 text-gold" />
              Practitioner Tier ($25/mo)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="practitioner" className="text-xs text-muted-foreground">Subscribers</Label>
              <Input
                id="practitioner"
                type="number"
                min="0"
                value={subscribers.practitioner}
                onChange={(e) => handleChange('practitioner', e.target.value)}
                className="text-lg font-bold text-gold"
              />
              <p className="text-xs text-muted-foreground">~115 queries/mo avg</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-crimson/5 border-crimson/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4 text-crimson" />
              Researcher Tier ($50/mo)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="researcher" className="text-xs text-muted-foreground">Subscribers</Label>
              <Input
                id="researcher"
                type="number"
                min="0"
                value={subscribers.researcher}
                onChange={(e) => handleChange('researcher', e.target.value)}
                className="text-lg font-bold text-crimson"
              />
              <p className="text-xs text-muted-foreground">~230 queries/mo avg</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-muted/50">
              <th className="border border-border p-3 text-left">Tier</th>
              <th className="border border-border p-3 text-right">Subscribers</th>
              <th className="border border-border p-3 text-right">Revenue</th>
              <th className="border border-border p-3 text-right">AI Costs</th>
              <th className="border border-border p-3 text-right">Net (before fixed)</th>
            </tr>
          </thead>
          <tbody>
            <tr className="hover:bg-jade/5">
              <td className="border border-border p-3 font-medium text-jade">Student</td>
              <td className="border border-border p-3 text-right">{subscribers.student}</td>
              <td className="border border-border p-3 text-right font-medium">${calculations.studentRevenue.toLocaleString()}</td>
              <td className="border border-border p-3 text-right text-crimson">${calculations.studentAICost.toFixed(2)}</td>
              <td className="border border-border p-3 text-right font-medium">${(calculations.studentRevenue - calculations.studentAICost).toFixed(2)}</td>
            </tr>
            <tr className="hover:bg-gold/5">
              <td className="border border-border p-3 font-medium text-gold">Practitioner</td>
              <td className="border border-border p-3 text-right">{subscribers.practitioner}</td>
              <td className="border border-border p-3 text-right font-medium">${calculations.practitionerRevenue.toLocaleString()}</td>
              <td className="border border-border p-3 text-right text-crimson">${calculations.practitionerAICost.toFixed(2)}</td>
              <td className="border border-border p-3 text-right font-medium">${(calculations.practitionerRevenue - calculations.practitionerAICost).toFixed(2)}</td>
            </tr>
            <tr className="hover:bg-crimson/5">
              <td className="border border-border p-3 font-medium text-crimson">Researcher</td>
              <td className="border border-border p-3 text-right">{subscribers.researcher}</td>
              <td className="border border-border p-3 text-right font-medium">${calculations.researcherRevenue.toLocaleString()}</td>
              <td className="border border-border p-3 text-right text-crimson">${calculations.researcherAICost.toFixed(2)}</td>
              <td className="border border-border p-3 text-right font-medium">${(calculations.researcherRevenue - calculations.researcherAICost).toFixed(2)}</td>
            </tr>
            <tr className="bg-muted/30 font-bold">
              <td className="border border-border p-3">TOTALS</td>
              <td className="border border-border p-3 text-right">{calculations.totalSubscribers}</td>
              <td className="border border-border p-3 text-right text-jade">${calculations.totalRevenue.toLocaleString()}</td>
              <td className="border border-border p-3 text-right text-crimson">${calculations.totalAICost.toFixed(2)}</td>
              <td className="border border-border p-3 text-right">${(calculations.totalRevenue - calculations.totalAICost).toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <Card className="bg-jade/5 border-jade/20">
          <CardContent className="pt-4 text-center">
            <DollarSign className="h-6 w-6 text-jade mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Total Revenue</p>
            <p className="text-2xl font-bold text-jade">${calculations.totalRevenue.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className="bg-crimson/5 border-crimson/20">
          <CardContent className="pt-4 text-center">
            <Calculator className="h-6 w-6 text-crimson mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Total Costs</p>
            <p className="text-2xl font-bold text-crimson">${calculations.totalCost.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">(${TOTAL_FIXED_MONTHLY} fixed + ${calculations.totalAICost.toFixed(2)} AI)</p>
          </CardContent>
        </Card>

        <Card className="bg-gold/5 border-gold/20">
          <CardContent className="pt-4 text-center">
            <TrendingUp className="h-6 w-6 text-gold mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Net Profit</p>
            <p className={`text-2xl font-bold ${calculations.netProfit >= 0 ? 'text-gold' : 'text-crimson'}`}>
              ${calculations.netProfit.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-jade/5 to-gold/5 border-jade/20">
          <CardContent className="pt-4 text-center">
            <Badge className="bg-jade/20 text-jade border-jade/30 mb-2">Margin</Badge>
            <p className="text-3xl font-bold text-jade">{calculations.profitMargin}%</p>
          </CardContent>
        </Card>
      </div>

      <p className="text-xs text-muted-foreground text-center mt-4">
        * Fixed costs: ${TOTAL_FIXED_MONTHLY}/mo (Lovable $25 + DB $10 + Domain $2 + Support $8 + AI Base $5 + Marketing $10)
      </p>
    </div>
  );
}
