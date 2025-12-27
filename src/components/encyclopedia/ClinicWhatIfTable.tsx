import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Users, TrendingUp, Calculator, DollarSign, Edit3, MapPin, Globe, Building2, Download, Share2, Save, FolderOpen, GitCompare, Trash2, Copy, Pencil, FileText, Tag, FileDown, X } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

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

const AVAILABLE_TAGS = ['optimistic', 'conservative', 'baseline', 'israel-focus', 'global-focus', 'q1', 'q2', 'q3', 'q4', '2025', '2026', 'growth', 'test'];

interface MarketInputs {
  israelPractitioners: number;
  israelAdoptionRate: number;
  israelPrice: number;
  globalPractitioners: number;
  globalAdoptionRate: number;
  globalPrice: number;
  avgPatientsPerTherapist: number;
}

interface SavedScenario {
  id: string;
  name: string;
  notes: string | null;
  tags: string[];
  configuration: MarketInputs;
  calculations: any;
  created_at: string;
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
  const [savedScenarios, setSavedScenarios] = useState<SavedScenario[]>([]);
  const [scenarioName, setScenarioName] = useState('');
  const [scenarioNotes, setScenarioNotes] = useState('');
  const [scenarioTags, setScenarioTags] = useState<string[]>([]);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isLoadDialogOpen, setIsLoadDialogOpen] = useState(false);
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [comparisonScenarios, setComparisonScenarios] = useState<SavedScenario[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [editingScenario, setEditingScenario] = useState<SavedScenario | null>(null);
  const [editName, setEditName] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editTags, setEditTags] = useState<string[]>([]);
  const [filterTag, setFilterTag] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
      if (user) {
        loadScenarios();
      }
    };
    checkAuth();
  }, []);

  const loadScenarios = async () => {
    const { data, error } = await supabase
      .from('roi_scenarios')
      .select('*')
      .eq('scenario_type', 'clinic')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setSavedScenarios(data.map(s => ({
        id: s.id,
        name: s.name,
        notes: s.notes || null,
        tags: (s as any).tags || [],
        configuration: s.configuration as unknown as MarketInputs,
        calculations: s.calculations,
        created_at: s.created_at
      })));
    }
  };

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

  const saveScenario = async () => {
    if (!scenarioName.trim()) {
      toast.error('Please enter a scenario name');
      return;
    }
    if (!userId) {
      toast.error('Please login to save scenarios');
      return;
    }

    const { error } = await supabase.from('roi_scenarios').insert([{
      user_id: userId,
      name: scenarioName,
      notes: scenarioNotes || null,
      tags: scenarioTags,
      scenario_type: 'clinic',
      configuration: JSON.parse(JSON.stringify(inputs)) as Json,
      calculations: JSON.parse(JSON.stringify(calculations)) as Json
    }]);

    if (error) {
      toast.error('Failed to save scenario');
      console.error(error);
    } else {
      toast.success('Scenario saved to cloud!');
      setScenarioName('');
      setScenarioNotes('');
      setScenarioTags([]);
      setIsSaveDialogOpen(false);
      loadScenarios();
    }
  };

  const updateScenario = async () => {
    if (!editingScenario || !editName.trim()) return;
    
    const { error } = await supabase
      .from('roi_scenarios')
      .update({ name: editName, notes: editNotes || null, tags: editTags })
      .eq('id', editingScenario.id);

    if (!error) {
      toast.success('Scenario updated!');
      setEditingScenario(null);
      loadScenarios();
    }
  };

  const startEditing = (scenario: SavedScenario) => {
    setEditingScenario(scenario);
    setEditName(scenario.name);
    setEditNotes(scenario.notes || '');
    setEditTags(scenario.tags || []);
  };

  const toggleTag = (tag: string, tagList: string[], setTagList: (tags: string[]) => void) => {
    if (tagList.includes(tag)) {
      setTagList(tagList.filter(t => t !== tag));
    } else {
      setTagList([...tagList, tag]);
    }
  };

  const filteredScenarios = useMemo(() => {
    if (!filterTag) return savedScenarios;
    return savedScenarios.filter(s => s.tags?.includes(filterTag));
  }, [savedScenarios, filterTag]);

  const exportAllToPDF = () => {
    if (savedScenarios.length === 0) {
      toast.error('No scenarios to export');
      return;
    }

    const doc = new jsPDF();
    const date = new Date().toLocaleDateString();
    
    doc.setFontSize(20);
    doc.text('Clinic CRM ROI Scenarios Report', 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated: ${date}`, 14, 28);
    doc.text(`Total Scenarios: ${savedScenarios.length}`, 14, 35);
    
    let yPos = 50;
    
    savedScenarios.forEach((scenario, index) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(14);
      doc.text(`${index + 1}. ${scenario.name}`, 14, yPos);
      yPos += 7;
      
      doc.setFontSize(9);
      doc.text(`Created: ${new Date(scenario.created_at).toLocaleDateString()}`, 20, yPos);
      yPos += 5;
      
      if (scenario.tags?.length > 0) {
        doc.text(`Tags: ${scenario.tags.join(', ')}`, 20, yPos);
        yPos += 5;
      }
      
      if (scenario.notes) {
        doc.text(`Notes: ${scenario.notes.slice(0, 80)}${scenario.notes.length > 80 ? '...' : ''}`, 20, yPos);
        yPos += 5;
      }
      
      const calc = scenario.calculations;
      doc.text(`Users: ${calc.totalUsers?.toLocaleString() || 0} | Patients: ${calc.totalPatients?.toLocaleString() || 0}`, 20, yPos);
      yPos += 5;
      doc.text(`Revenue: $${calc.totalRevenue?.toLocaleString() || 0}/mo | Profit: $${calc.netProfit?.toLocaleString() || 0}/mo | Margin: ${calc.profitMargin || 0}%`, 20, yPos);
      yPos += 12;
    });
    
    // Summary table
    doc.addPage();
    doc.setFontSize(14);
    doc.text('Scenarios Comparison Summary', 14, 20);
    
    autoTable(doc, {
      startY: 30,
      head: [['Scenario', 'Users', 'Patients', 'Revenue/mo', 'Profit/mo', 'Margin']],
      body: savedScenarios.map(s => [
        s.name.slice(0, 20),
        s.calculations.totalUsers?.toLocaleString() || '0',
        s.calculations.totalPatients?.toLocaleString() || '0',
        `$${s.calculations.totalRevenue?.toLocaleString() || 0}`,
        `$${s.calculations.netProfit?.toLocaleString() || 0}`,
        `${s.calculations.profitMargin || 0}%`
      ]),
    });
    
    doc.save(`Clinic-CRM-All-Scenarios-${date.replace(/\//g, '-')}.pdf`);
    toast.success(`Exported ${savedScenarios.length} scenarios to PDF!`);
  };

  const loadScenario = (scenario: SavedScenario) => {
    setInputs(scenario.configuration);
    setIsLoadDialogOpen(false);
    toast.success(`Loaded: ${scenario.name}`);
  };

  const deleteScenario = async (id: string) => {
    const { error } = await supabase.from('roi_scenarios').delete().eq('id', id);
    if (!error) {
      toast.success('Scenario deleted');
      loadScenarios();
      setComparisonScenarios(prev => prev.filter(s => s.id !== id));
    }
  };

  const duplicateScenario = async (scenario: SavedScenario) => {
    if (!userId) return;
    
    const { error } = await supabase.from('roi_scenarios').insert([{
      user_id: userId,
      name: `${scenario.name} (Copy)`,
      scenario_type: 'clinic',
      configuration: JSON.parse(JSON.stringify(scenario.configuration)) as Json,
      calculations: JSON.parse(JSON.stringify(scenario.calculations)) as Json
    }]);

    if (!error) {
      toast.success('Scenario duplicated!');
      loadScenarios();
    }
  };

  const toggleComparison = (scenario: SavedScenario) => {
    setComparisonScenarios(prev => {
      const exists = prev.find(s => s.id === scenario.id);
      if (exists) {
        return prev.filter(s => s.id !== scenario.id);
      }
      if (prev.length >= 3) {
        toast.error('Maximum 3 scenarios for comparison');
        return prev;
      }
      return [...prev, scenario];
    });
  };

  const comparisonChartData = useMemo(() => {
    if (comparisonScenarios.length === 0) return [];
    
    const data = [
      {
        name: 'Current',
        Revenue: calculations.totalRevenue,
        Profit: calculations.netProfit,
        Users: calculations.totalUsers,
      },
      ...comparisonScenarios.map(s => ({
        name: s.name.length > 12 ? s.name.slice(0, 12) + '...' : s.name,
        Revenue: s.calculations.totalRevenue,
        Profit: s.calculations.netProfit,
        Users: s.calculations.totalUsers,
      }))
    ];
    return data;
  }, [comparisonScenarios, calculations]);

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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Edit3 className="h-5 w-5 text-gold" />
          <h3 className="text-xl font-bold">Clinic CRM What-If Calculator</h3>
          <Badge className="bg-gold/20 text-gold border-gold/30 text-xs">Live</Badge>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1" disabled={!userId}>
                <Save className="h-4 w-4" />
                Save
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Save Scenario to Cloud</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="clinic-scenario-name">Scenario Name</Label>
                  <Input
                    id="clinic-scenario-name"
                    value={scenarioName}
                    onChange={(e) => setScenarioName(e.target.value)}
                    placeholder="e.g., Israel Focus 2025"
                  />
                </div>
                <div>
                  <Label htmlFor="clinic-scenario-notes">Notes (optional)</Label>
                  <Textarea
                    id="clinic-scenario-notes"
                    value={scenarioNotes}
                    onChange={(e) => setScenarioNotes(e.target.value)}
                    placeholder="Document your assumptions..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Tags (optional)</Label>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {AVAILABLE_TAGS.map(tag => (
                      <Badge 
                        key={tag}
                        variant={scenarioTags.includes(tag) ? "default" : "outline"}
                        className="cursor-pointer text-xs"
                        onClick={() => toggleTag(tag, scenarioTags, setScenarioTags)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button onClick={saveScenario} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Save to Cloud
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isLoadDialogOpen} onOpenChange={setIsLoadDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1" disabled={!userId}>
                <FolderOpen className="h-4 w-4" />
                Load
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Load Saved Scenario</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {/* Tag filter */}
                <div className="flex flex-wrap gap-1 items-center">
                  <span className="text-sm text-muted-foreground mr-2">Filter:</span>
                  <Badge 
                    variant={filterTag === null ? "default" : "outline"}
                    className="cursor-pointer text-xs"
                    onClick={() => setFilterTag(null)}
                  >
                    All
                  </Badge>
                  {AVAILABLE_TAGS.filter(tag => savedScenarios.some(s => s.tags?.includes(tag))).map(tag => (
                    <Badge 
                      key={tag}
                      variant={filterTag === tag ? "default" : "outline"}
                      className="cursor-pointer text-xs"
                      onClick={() => setFilterTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                {filteredScenarios.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No saved scenarios yet</p>
                ) : (
                  filteredScenarios.map(scenario => (
                    <div key={scenario.id} className="p-3 border rounded-lg hover:bg-muted/50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{scenario.name}</p>
                            {scenario.tags?.map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {new Date(scenario.created_at).toLocaleDateString()} • 
                            {scenario.calculations.totalUsers} users • ${scenario.calculations.totalRevenue.toLocaleString()}/mo
                          </p>
                          {scenario.notes && (
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {scenario.notes.length > 50 ? scenario.notes.slice(0, 50) + '...' : scenario.notes}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button size="sm" onClick={() => loadScenario(scenario)}>Load</Button>
                          <Button size="sm" variant="outline" onClick={() => startEditing(scenario)} title="Edit">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => duplicateScenario(scenario)} title="Duplicate">
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => deleteScenario(scenario.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button 
            variant={isCompareMode ? "default" : "outline"} 
            size="sm" 
            className="gap-1"
            onClick={() => {
              setIsCompareMode(!isCompareMode);
              if (isCompareMode) setComparisonScenarios([]);
            }}
            disabled={!userId || savedScenarios.length === 0}
          >
            <GitCompare className="h-4 w-4" />
            Compare
          </Button>

          <Button variant="outline" size="sm" onClick={exportToPDF} className="gap-1">
            <Download className="h-4 w-4" />
            PDF
          </Button>
          
          <Button variant="outline" size="sm" onClick={exportAllToPDF} className="gap-1" disabled={savedScenarios.length === 0}>
            <FileDown className="h-4 w-4" />
            Export All
          </Button>
          
          <Button variant="outline" size="sm" onClick={shareScenario} className="gap-1">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </div>
      </div>

      {!userId && (
        <div className="text-center p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
          Login to save and compare scenarios
        </div>
      )}

      {/* Edit Scenario Dialog */}
      <Dialog open={!!editingScenario} onOpenChange={(open) => !open && setEditingScenario(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Scenario</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="clinic-edit-name">Scenario Name</Label>
              <Input
                id="clinic-edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="clinic-edit-notes">Notes</Label>
              <Textarea
                id="clinic-edit-notes"
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Document your assumptions..."
                rows={4}
              />
            </div>
            <div>
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-1 mt-2">
                {AVAILABLE_TAGS.map(tag => (
                  <Badge 
                    key={tag}
                    variant={editTags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer text-xs"
                    onClick={() => toggleTag(tag, editTags, setEditTags)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            <Button onClick={updateScenario} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Comparison Mode */}
      {isCompareMode && (
        <Card className="bg-gradient-to-r from-gold/5 to-crimson/5 border-gold/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <GitCompare className="h-4 w-4" />
              Select Scenarios to Compare (max 3)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              {savedScenarios.map(scenario => (
                <Button
                  key={scenario.id}
                  variant={comparisonScenarios.find(s => s.id === scenario.id) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleComparison(scenario)}
                >
                  {scenario.name}
                </Button>
              ))}
            </div>

            {comparisonScenarios.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="border border-border p-2 text-left">Metric</th>
                      <th className="border border-border p-2 text-center bg-gold/10">Current</th>
                      {comparisonScenarios.map(s => (
                        <th key={s.id} className="border border-border p-2 text-center">{s.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-border p-2 font-medium">Total Users</td>
                      <td className="border border-border p-2 text-center bg-gold/5">{calculations.totalUsers.toLocaleString()}</td>
                      {comparisonScenarios.map(s => (
                        <td key={s.id} className="border border-border p-2 text-center">
                          {s.calculations.totalUsers.toLocaleString()}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="border border-border p-2 font-medium">Patients Served</td>
                      <td className="border border-border p-2 text-center bg-gold/5">{calculations.totalPatients.toLocaleString()}</td>
                      {comparisonScenarios.map(s => (
                        <td key={s.id} className="border border-border p-2 text-center">
                          {s.calculations.totalPatients.toLocaleString()}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="border border-border p-2 font-medium">Revenue/mo</td>
                      <td className="border border-border p-2 text-center bg-gold/5 text-jade font-bold">${calculations.totalRevenue.toLocaleString()}</td>
                      {comparisonScenarios.map(s => (
                        <td key={s.id} className="border border-border p-2 text-center text-jade font-medium">
                          ${s.calculations.totalRevenue.toLocaleString()}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="border border-border p-2 font-medium">Monthly Profit</td>
                      <td className="border border-border p-2 text-center bg-gold/5 text-gold font-bold">${calculations.netProfit.toLocaleString()}</td>
                      {comparisonScenarios.map(s => (
                        <td key={s.id} className="border border-border p-2 text-center text-gold font-medium">
                          ${s.calculations.netProfit.toLocaleString()}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="border border-border p-2 font-medium">Annual Profit</td>
                      <td className="border border-border p-2 text-center bg-gold/5 font-bold">${calculations.annualProfit.toLocaleString()}</td>
                      {comparisonScenarios.map(s => (
                        <td key={s.id} className="border border-border p-2 text-center font-medium">
                          ${s.calculations.annualProfit.toLocaleString()}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="border border-border p-2 font-medium">Margin</td>
                      <td className="border border-border p-2 text-center bg-gold/5">{calculations.profitMargin}%</td>
                      {comparisonScenarios.map(s => (
                        <td key={s.id} className="border border-border p-2 text-center">{s.calculations.profitMargin}%</td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* Comparison Chart */}
            {comparisonChartData.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium mb-3">Visual Comparison</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={comparisonChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `$${(value/1000).toFixed(0)}k`} />
                    <Tooltip 
                      formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                      contentStyle={{ background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                    />
                    <Legend />
                    <Bar dataKey="Revenue" fill="hsl(var(--jade))" name="Revenue/mo" />
                    <Bar dataKey="Profit" fill="hsl(var(--gold))" name="Profit/mo" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      )}

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