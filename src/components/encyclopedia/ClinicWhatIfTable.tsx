import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, TrendingUp, Calculator, DollarSign, Edit3, MapPin, Globe, Building2, Download, Share2 } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'sonner';

// Fixed costs - these are known and true
const FIXED_COSTS = {
  lovablePlatform: 25, // Lovable Pro plan
  databaseHosting: 10, // Database costs
  domainSSL: 2, // Domain/SSL
  supportTools: 8, // Support infrastructure
  aiProcessingBase: 5, // Base AI costs
  marketing: 10, // Basic marketing
};

const TOTAL_FIXED_MONTHLY = Object.values(FIXED_COSTS).reduce((a, b) => a + b, 0);

// AI cost per query for CRM
const AI_COST_PER_QUERY = 0.002;
const AVG_QUERIES_PER_PATIENT = 20; // Per month per patient

interface MarketInputs {
  israelPractitioners: number;
  israelAdoptionRate: number;
  israelPrice: number;
  globalPractitioners: number;
  globalAdoptionRate: number;
  globalPrice: number;
  avgPatientsPerTherapist: number;
}

export function ClinicWhatIfTable() {
  const [inputs, setInputs] = useState<MarketInputs>({
    israelPractitioners: 2500,
    israelAdoptionRate: 5,
    israelPrice: 11, // $11 = ₪40
    globalPractitioners: 450000,
    globalAdoptionRate: 1,
    globalPrice: 50,
    avgPatientsPerTherapist: 25,
  });

  const calculations = useMemo(() => {
    // Israel calculations
    const israelUsers = Math.round((inputs.israelPractitioners * inputs.israelAdoptionRate) / 100);
    const israelRevenue = israelUsers * inputs.israelPrice;
    const israelPatients = israelUsers * inputs.avgPatientsPerTherapist;
    const israelAICost = israelPatients * AVG_QUERIES_PER_PATIENT * AI_COST_PER_QUERY;

    // Global calculations
    const globalUsers = Math.round((inputs.globalPractitioners * inputs.globalAdoptionRate) / 100);
    const globalRevenue = globalUsers * inputs.globalPrice;
    const globalPatients = globalUsers * inputs.avgPatientsPerTherapist;
    const globalAICost = globalPatients * AVG_QUERIES_PER_PATIENT * AI_COST_PER_QUERY;

    // Totals
    const totalUsers = israelUsers + globalUsers;
    const totalRevenue = israelRevenue + globalRevenue;
    const totalAICost = israelAICost + globalAICost;
    const totalPatients = israelPatients + globalPatients;

    // Total costs and profit
    const totalCost = TOTAL_FIXED_MONTHLY + totalAICost;
    const netProfit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0';

    // Annual projections
    const annualRevenue = totalRevenue * 12;
    const annualProfit = netProfit * 12;

    return {
      israelUsers,
      israelRevenue,
      israelPatients,
      israelAICost,
      globalUsers,
      globalRevenue,
      globalPatients,
      globalAICost,
      totalUsers,
      totalRevenue,
      totalAICost,
      totalPatients,
      totalCost,
      netProfit,
      profitMargin,
      annualRevenue,
      annualProfit,
    };
  }, [inputs]);

  const handleChange = (field: keyof MarketInputs, value: string) => {
    const numValue = parseFloat(value) || 0;
    setInputs(prev => ({ ...prev, [field]: Math.max(0, numValue) }));
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const date = new Date().toLocaleDateString();
    
    doc.setFontSize(18);
    doc.text('Clinic CRM ROI Scenario', 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated: ${date}`, 14, 28);
    
    doc.setFontSize(12);
    doc.text('Israel Market Configuration:', 14, 40);
    doc.setFontSize(10);
    doc.text(`TCM Practitioners: ${inputs.israelPractitioners.toLocaleString()}`, 20, 48);
    doc.text(`Adoption Rate: ${inputs.israelAdoptionRate}%`, 20, 55);
    doc.text(`Price: $${inputs.israelPrice}/mo`, 20, 62);
    
    doc.setFontSize(12);
    doc.text('Global Market Configuration:', 14, 75);
    doc.setFontSize(10);
    doc.text(`TCM Practitioners: ${inputs.globalPractitioners.toLocaleString()}`, 20, 83);
    doc.text(`Adoption Rate: ${inputs.globalAdoptionRate}%`, 20, 90);
    doc.text(`Price: $${inputs.globalPrice}/mo`, 20, 97);
    
    doc.text(`Avg Patients per Therapist: ${inputs.avgPatientsPerTherapist}`, 14, 110);
    
    autoTable(doc, {
      startY: 120,
      head: [['Market', 'Users', 'Patients', 'Revenue/mo', 'AI Costs/mo', 'Net/mo']],
      body: [
        ['Israel', calculations.israelUsers.toString(), calculations.israelPatients.toLocaleString(), `$${calculations.israelRevenue.toLocaleString()}`, `$${calculations.israelAICost.toFixed(2)}`, `$${(calculations.israelRevenue - calculations.israelAICost).toFixed(2)}`],
        ['Global', calculations.globalUsers.toLocaleString(), calculations.globalPatients.toLocaleString(), `$${calculations.globalRevenue.toLocaleString()}`, `$${calculations.globalAICost.toFixed(2)}`, `$${(calculations.globalRevenue - calculations.globalAICost).toFixed(2)}`],
        ['COMBINED', calculations.totalUsers.toLocaleString(), calculations.totalPatients.toLocaleString(), `$${calculations.totalRevenue.toLocaleString()}`, `$${calculations.totalAICost.toFixed(2)}`, `$${(calculations.totalRevenue - calculations.totalAICost).toFixed(2)}`],
      ],
    });
    
    const finalY = (doc as any).lastAutoTable.finalY || 160;
    doc.setFontSize(12);
    doc.text('Summary:', 14, finalY + 15);
    doc.setFontSize(10);
    doc.text(`Monthly Revenue: $${calculations.totalRevenue.toLocaleString()}`, 20, finalY + 25);
    doc.text(`Monthly Costs: $${calculations.totalCost.toLocaleString()} (Fixed: $${TOTAL_FIXED_MONTHLY})`, 20, finalY + 32);
    doc.text(`Monthly Profit: $${calculations.netProfit.toLocaleString()}`, 20, finalY + 39);
    doc.text(`Annual Profit: $${calculations.annualProfit.toLocaleString()}`, 20, finalY + 46);
    doc.text(`Profit Margin: ${calculations.profitMargin}%`, 20, finalY + 53);
    
    doc.save(`Clinic-CRM-ROI-Scenario-${date.replace(/\//g, '-')}.pdf`);
    toast.success('PDF exported successfully!');
  };

  const shareScenario = async () => {
    const scenarioText = `📊 Clinic CRM ROI Scenario

🇮🇱 Israel Market:
• Practitioners: ${inputs.israelPractitioners.toLocaleString()} | Adoption: ${inputs.israelAdoptionRate}%
• Users: ${calculations.israelUsers} | Revenue: $${calculations.israelRevenue.toLocaleString()}/mo

🌍 Global Market:
• Practitioners: ${inputs.globalPractitioners.toLocaleString()} | Adoption: ${inputs.globalAdoptionRate}%
• Users: ${calculations.globalUsers.toLocaleString()} | Revenue: $${calculations.globalRevenue.toLocaleString()}/mo

💰 Combined Results:
• Total Users: ${calculations.totalUsers.toLocaleString()}
• Monthly Revenue: $${calculations.totalRevenue.toLocaleString()}
• Monthly Profit: $${calculations.netProfit.toLocaleString()}
• Annual Profit: $${calculations.annualProfit.toLocaleString()}
• Margin: ${calculations.profitMargin}%

Generated by TCM Brain - ${new Date().toLocaleDateString()}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Clinic CRM ROI Scenario',
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
          <Edit3 className="h-5 w-5 text-gold" />
          <h3 className="text-xl font-bold">Clinic CRM What-If Calculator</h3>
          <Badge className="bg-gold/20 text-gold border-gold/30 text-xs">Live</Badge>
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
      {/* Market Inputs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Israel Market */}
        <Card className="bg-gold/5 border-gold/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5 text-gold" />
              Israel Market
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Total TCM Practitioners</Label>
                <Input
                  type="number"
                  min="0"
                  value={inputs.israelPractitioners}
                  onChange={(e) => handleChange('israelPractitioners', e.target.value)}
                  className="font-medium"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Adoption Rate (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={inputs.israelAdoptionRate}
                  onChange={(e) => handleChange('israelAdoptionRate', e.target.value)}
                  className="font-medium"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Price per User ($ / ₪40)</Label>
              <Input
                type="number"
                min="0"
                value={inputs.israelPrice}
                onChange={(e) => handleChange('israelPrice', e.target.value)}
                className="font-medium"
              />
            </div>
            <div className="pt-2 border-t border-gold/20">
              <p className="text-sm">
                <span className="text-muted-foreground">Users: </span>
                <span className="font-bold text-gold">{calculations.israelUsers}</span>
                <span className="text-muted-foreground ml-4">Revenue: </span>
                <span className="font-bold text-gold">${calculations.israelRevenue.toLocaleString()}/mo</span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Global Market */}
        <Card className="bg-crimson/5 border-crimson/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="h-5 w-5 text-crimson" />
              Global Market
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Total TCM Practitioners</Label>
                <Input
                  type="number"
                  min="0"
                  value={inputs.globalPractitioners}
                  onChange={(e) => handleChange('globalPractitioners', e.target.value)}
                  className="font-medium"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Adoption Rate (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={inputs.globalAdoptionRate}
                  onChange={(e) => handleChange('globalAdoptionRate', e.target.value)}
                  className="font-medium"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Price per User ($)</Label>
              <Input
                type="number"
                min="0"
                value={inputs.globalPrice}
                onChange={(e) => handleChange('globalPrice', e.target.value)}
                className="font-medium"
              />
            </div>
            <div className="pt-2 border-t border-crimson/20">
              <p className="text-sm">
                <span className="text-muted-foreground">Users: </span>
                <span className="font-bold text-crimson">{calculations.globalUsers.toLocaleString()}</span>
                <span className="text-muted-foreground ml-4">Revenue: </span>
                <span className="font-bold text-crimson">${calculations.globalRevenue.toLocaleString()}/mo</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Common Settings */}
      <Card className="bg-muted/30">
        <CardContent className="pt-4">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <Label className="text-xs text-muted-foreground">Avg Patients/Therapist:</Label>
              <Input
                type="number"
                min="0"
                value={inputs.avgPatientsPerTherapist}
                onChange={(e) => handleChange('avgPatientsPerTherapist', e.target.value)}
                className="w-20 font-medium"
              />
            </div>
            <div className="text-xs text-muted-foreground">
              AI Cost: ${AI_COST_PER_QUERY}/query × {AVG_QUERIES_PER_PATIENT} queries/patient = ${(AI_COST_PER_QUERY * AVG_QUERIES_PER_PATIENT).toFixed(2)}/patient/mo
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-muted/50">
              <th className="border border-border p-3 text-left">Market</th>
              <th className="border border-border p-3 text-right">Users</th>
              <th className="border border-border p-3 text-right">Patients Served</th>
              <th className="border border-border p-3 text-right">Revenue/mo</th>
              <th className="border border-border p-3 text-right">AI Costs/mo</th>
              <th className="border border-border p-3 text-right">Net/mo</th>
            </tr>
          </thead>
          <tbody>
            <tr className="hover:bg-gold/5">
              <td className="border border-border p-3 font-medium">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gold" />
                  Israel
                </div>
              </td>
              <td className="border border-border p-3 text-right">{calculations.israelUsers}</td>
              <td className="border border-border p-3 text-right">{calculations.israelPatients.toLocaleString()}</td>
              <td className="border border-border p-3 text-right font-medium text-gold">${calculations.israelRevenue.toLocaleString()}</td>
              <td className="border border-border p-3 text-right text-crimson">${calculations.israelAICost.toFixed(2)}</td>
              <td className="border border-border p-3 text-right font-medium">${(calculations.israelRevenue - calculations.israelAICost).toFixed(2)}</td>
            </tr>
            <tr className="hover:bg-crimson/5">
              <td className="border border-border p-3 font-medium">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-crimson" />
                  Global
                </div>
              </td>
              <td className="border border-border p-3 text-right">{calculations.globalUsers.toLocaleString()}</td>
              <td className="border border-border p-3 text-right">{calculations.globalPatients.toLocaleString()}</td>
              <td className="border border-border p-3 text-right font-medium text-crimson">${calculations.globalRevenue.toLocaleString()}</td>
              <td className="border border-border p-3 text-right text-crimson">${calculations.globalAICost.toFixed(2)}</td>
              <td className="border border-border p-3 text-right font-medium">${(calculations.globalRevenue - calculations.globalAICost).toFixed(2)}</td>
            </tr>
            <tr className="bg-jade/5 font-bold">
              <td className="border border-border p-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-jade" />
                  COMBINED
                </div>
              </td>
              <td className="border border-border p-3 text-right">{calculations.totalUsers.toLocaleString()}</td>
              <td className="border border-border p-3 text-right">{calculations.totalPatients.toLocaleString()}</td>
              <td className="border border-border p-3 text-right text-jade">${calculations.totalRevenue.toLocaleString()}</td>
              <td className="border border-border p-3 text-right text-crimson">${calculations.totalAICost.toFixed(2)}</td>
              <td className="border border-border p-3 text-right text-jade">${(calculations.totalRevenue - calculations.totalAICost).toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <Card className="bg-jade/5 border-jade/20">
          <CardContent className="pt-4 text-center">
            <DollarSign className="h-6 w-6 text-jade mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Monthly Revenue</p>
            <p className="text-2xl font-bold text-jade">${calculations.totalRevenue.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className="bg-crimson/5 border-crimson/20">
          <CardContent className="pt-4 text-center">
            <Calculator className="h-6 w-6 text-crimson mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Monthly Costs</p>
            <p className="text-2xl font-bold text-crimson">${calculations.totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
            <p className="text-xs text-muted-foreground">(${TOTAL_FIXED_MONTHLY} fixed)</p>
          </CardContent>
        </Card>

        <Card className="bg-gold/5 border-gold/20">
          <CardContent className="pt-4 text-center">
            <TrendingUp className="h-6 w-6 text-gold mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Monthly Profit</p>
            <p className={`text-2xl font-bold ${calculations.netProfit >= 0 ? 'text-gold' : 'text-crimson'}`}>
              ${calculations.netProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-jade/5 to-gold/5 border-jade/20">
          <CardContent className="pt-4 text-center">
            <Badge className="bg-jade/20 text-jade border-jade/30 mb-2">Annual</Badge>
            <p className="text-2xl font-bold text-jade">${calculations.annualProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
            <p className="text-xs text-muted-foreground">{calculations.profitMargin}% margin</p>
          </CardContent>
        </Card>
      </div>

      <p className="text-xs text-muted-foreground text-center mt-4">
        * Fixed costs: ${TOTAL_FIXED_MONTHLY}/mo | AI: ${AI_COST_PER_QUERY}/query × {AVG_QUERIES_PER_PATIENT} queries/patient/mo = ${(AI_COST_PER_QUERY * AVG_QUERIES_PER_PATIENT).toFixed(2)}/patient
      </p>
    </div>
  );
}
