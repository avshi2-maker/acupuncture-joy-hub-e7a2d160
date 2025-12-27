import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Users, TrendingUp, Calculator, DollarSign, Edit3, Download, Share2, Save, FolderOpen, GitCompare, Trash2, Copy, Pencil, FileText, Tag, FileDown, X } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

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

const DEFAULT_TAGS = ['optimistic', 'conservative', 'baseline', 'q1', 'q2', 'q3', 'q4', '2025', '2026', 'growth', 'test'];

interface TierInputs {
  student: number;
  practitioner: number;
  researcher: number;
}

interface SavedScenario {
  id: string;
  name: string;
  notes: string | null;
  tags: string[];
  archived: boolean;
  configuration: TierInputs;
  calculations: any;
  created_at: string;
}

export function WhatIfROITable() {
  const [subscribers, setSubscribers] = useState<TierInputs>({
    student: 100,
    practitioner: 200,
    researcher: 50,
  });
  const [savedScenarios, setSavedScenarios] = useState<SavedScenario[]>([]);
  const [scenarioName, setScenarioName] = useState('');
  const [scenarioNotes, setScenarioNotes] = useState('');
  const [scenarioTags, setScenarioTags] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState('');
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isLoadDialogOpen, setIsLoadDialogOpen] = useState(false);
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [comparisonScenarios, setComparisonScenarios] = useState<SavedScenario[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [editingScenario, setEditingScenario] = useState<SavedScenario | null>(null);
  const [editName, setEditName] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editTags, setEditTags] = useState<string[]>([]);
  const [editCustomTagInput, setEditCustomTagInput] = useState('');
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);

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
      .eq('scenario_type', 'encyclopedia')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setSavedScenarios(data.map(s => ({
        id: s.id,
        name: s.name,
        notes: s.notes || null,
        tags: (s as any).tags || [],
        archived: (s as any).archived || false,
        configuration: s.configuration as unknown as TierInputs,
        calculations: s.calculations,
        created_at: s.created_at
      })));
    }
  };

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
      scenario_type: 'encyclopedia',
      configuration: JSON.parse(JSON.stringify(subscribers)) as Json,
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

  const addCustomTag = (input: string, tagList: string[], setTagList: (tags: string[]) => void, setInput: (val: string) => void) => {
    const tag = input.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (tag && !tagList.includes(tag) && tag.length <= 20) {
      setTagList([...tagList, tag]);
      setInput('');
    }
  };

  const allUsedTags = useMemo(() => {
    const tags = new Set<string>();
    savedScenarios.forEach(s => s.tags?.forEach(t => tags.add(t)));
    return Array.from(tags);
  }, [savedScenarios]);

  const filteredScenarios = useMemo(() => {
    let filtered = savedScenarios.filter(s => showArchived ? s.archived : !s.archived);
    if (filterTag) {
      filtered = filtered.filter(s => s.tags?.includes(filterTag));
    }
    return filtered;
  }, [savedScenarios, filterTag, showArchived]);

  const toggleArchive = async (scenario: SavedScenario) => {
    const { error } = await supabase
      .from('roi_scenarios')
      .update({ archived: !scenario.archived })
      .eq('id', scenario.id);
    
    if (!error) {
      toast.success(scenario.archived ? 'Scenario restored!' : 'Scenario archived!');
      loadScenarios();
    }
  };

  const exportAllToPDF = () => {
    if (savedScenarios.length === 0) {
      toast.error('No scenarios to export');
      return;
    }

    const doc = new jsPDF();
    const date = new Date().toLocaleDateString();
    
    doc.setFontSize(20);
    doc.text('TCM Encyclopedia ROI Scenarios Report', 14, 20);
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
      
      const config = scenario.configuration;
      const calc = scenario.calculations;
      doc.text(`Subscribers: Student=${config.student}, Practitioner=${config.practitioner}, Researcher=${config.researcher}`, 20, yPos);
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
      head: [['Scenario', 'Total Subs', 'Revenue/mo', 'Profit/mo', 'Margin']],
      body: savedScenarios.map(s => [
        s.name.slice(0, 25),
        (s.configuration.student + s.configuration.practitioner + s.configuration.researcher).toString(),
        `$${s.calculations.totalRevenue?.toLocaleString() || 0}`,
        `$${s.calculations.netProfit?.toLocaleString() || 0}`,
        `${s.calculations.profitMargin || 0}%`
      ]),
    });
    
    doc.save(`Encyclopedia-All-Scenarios-${date.replace(/\//g, '-')}.pdf`);
    toast.success(`Exported ${savedScenarios.length} scenarios to PDF!`);
  };

  const loadScenario = (scenario: SavedScenario) => {
    setSubscribers(scenario.configuration);
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
      scenario_type: 'encyclopedia',
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
        Subscribers: calculations.totalSubscribers,
      },
      ...comparisonScenarios.map(s => ({
        name: s.name.length > 12 ? s.name.slice(0, 12) + '...' : s.name,
        Revenue: s.calculations.totalRevenue,
        Profit: s.calculations.netProfit,
        Subscribers: s.configuration.student + s.configuration.practitioner + s.configuration.researcher,
      }))
    ];
    return data;
  }, [comparisonScenarios, calculations]);

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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Edit3 className="h-5 w-5 text-jade" />
          <h3 className="text-xl font-bold">Encyclopedia What-If ROI Calculator</h3>
          <Badge className="bg-jade/20 text-jade border-jade/30 text-xs">Live</Badge>
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
                  <Label htmlFor="scenario-name">Scenario Name</Label>
                  <Input
                    id="scenario-name"
                    value={scenarioName}
                    onChange={(e) => setScenarioName(e.target.value)}
                    placeholder="e.g., Optimistic Q1 2025"
                  />
                </div>
                <div>
                  <Label htmlFor="scenario-notes">Notes (optional)</Label>
                  <Textarea
                    id="scenario-notes"
                    value={scenarioNotes}
                    onChange={(e) => setScenarioNotes(e.target.value)}
                    placeholder="Document your assumptions..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Tags (optional)</Label>
                  <div className="flex flex-wrap gap-1 mt-2 mb-2">
                    {DEFAULT_TAGS.map(tag => (
                      <Badge 
                        key={tag}
                        variant={scenarioTags.includes(tag) ? "default" : "outline"}
                        className="cursor-pointer text-xs"
                        onClick={() => toggleTag(tag, scenarioTags, setScenarioTags)}
                      >
                        {tag}
                      </Badge>
                    ))}
                    {scenarioTags.filter(t => !DEFAULT_TAGS.includes(t)).map(tag => (
                      <Badge key={tag} variant="default" className="text-xs gap-1">
                        {tag}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => toggleTag(tag, scenarioTags, setScenarioTags)} />
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add custom tag..."
                      value={customTagInput}
                      onChange={(e) => setCustomTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addCustomTag(customTagInput, scenarioTags, setScenarioTags, setCustomTagInput)}
                      className="text-xs h-8"
                    />
                    <Button size="sm" variant="outline" onClick={() => addCustomTag(customTagInput, scenarioTags, setScenarioTags, setCustomTagInput)}>
                      <Tag className="h-3 w-3" />
                    </Button>
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
                {/* Tag filter and archive toggle */}
                <div className="flex flex-wrap gap-1 items-center justify-between">
                  <div className="flex flex-wrap gap-1 items-center">
                    <span className="text-sm text-muted-foreground mr-2">Filter:</span>
                    <Badge 
                      variant={filterTag === null ? "default" : "outline"}
                      className="cursor-pointer text-xs"
                      onClick={() => setFilterTag(null)}
                    >
                      All
                    </Badge>
                    {allUsedTags.map(tag => (
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
                  <Button 
                    size="sm" 
                    variant={showArchived ? "default" : "outline"}
                    onClick={() => setShowArchived(!showArchived)}
                  >
                    {showArchived ? 'Show Active' : 'Show Archived'}
                  </Button>
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
                            {scenario.configuration.student + scenario.configuration.practitioner + scenario.configuration.researcher} subscribers
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
                          <Button size="sm" variant="outline" onClick={() => toggleArchive(scenario)} title={scenario.archived ? "Restore" : "Archive"}>
                            {scenario.archived ? "↩" : "📦"}
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

      {/* Edit Scenario Dialog */}
      <Dialog open={!!editingScenario} onOpenChange={(open) => !open && setEditingScenario(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Scenario</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="edit-name">Scenario Name</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Document your assumptions..."
                rows={4}
              />
            </div>
            <div>
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-1 mt-2 mb-2">
                {DEFAULT_TAGS.map(tag => (
                  <Badge 
                    key={tag}
                    variant={editTags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer text-xs"
                    onClick={() => toggleTag(tag, editTags, setEditTags)}
                  >
                    {tag}
                  </Badge>
                ))}
                {editTags.filter(t => !DEFAULT_TAGS.includes(t)).map(tag => (
                  <Badge key={tag} variant="default" className="text-xs gap-1">
                    {tag}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => toggleTag(tag, editTags, setEditTags)} />
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add custom tag..."
                  value={editCustomTagInput}
                  onChange={(e) => setEditCustomTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addCustomTag(editCustomTagInput, editTags, setEditTags, setEditCustomTagInput)}
                  className="text-xs h-8"
                />
                <Button size="sm" variant="outline" onClick={() => addCustomTag(editCustomTagInput, editTags, setEditTags, setEditCustomTagInput)}>
                  <Tag className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <Button onClick={updateScenario} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {!userId && (
        <div className="text-center p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
          Login to save and compare scenarios
        </div>
      )}

      {/* Comparison Mode */}
      {isCompareMode && (
        <Card className="bg-gradient-to-r from-jade/5 to-gold/5 border-jade/30">
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
                      <th className="border border-border p-2 text-center bg-jade/10">Current</th>
                      {comparisonScenarios.map(s => (
                        <th key={s.id} className="border border-border p-2 text-center">{s.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-border p-2 font-medium">Total Subscribers</td>
                      <td className="border border-border p-2 text-center bg-jade/5">{calculations.totalSubscribers}</td>
                      {comparisonScenarios.map(s => (
                        <td key={s.id} className="border border-border p-2 text-center">
                          {s.configuration.student + s.configuration.practitioner + s.configuration.researcher}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="border border-border p-2 font-medium">Revenue/mo</td>
                      <td className="border border-border p-2 text-center bg-jade/5 text-jade font-bold">${calculations.totalRevenue.toLocaleString()}</td>
                      {comparisonScenarios.map(s => (
                        <td key={s.id} className="border border-border p-2 text-center text-jade font-medium">
                          ${s.calculations.totalRevenue.toLocaleString()}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="border border-border p-2 font-medium">Total Costs/mo</td>
                      <td className="border border-border p-2 text-center bg-jade/5 text-crimson">${calculations.totalCost.toFixed(0)}</td>
                      {comparisonScenarios.map(s => (
                        <td key={s.id} className="border border-border p-2 text-center text-crimson">
                          ${s.calculations.totalCost.toFixed(0)}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="border border-border p-2 font-medium">Net Profit/mo</td>
                      <td className="border border-border p-2 text-center bg-jade/5 text-gold font-bold">${calculations.netProfit.toLocaleString()}</td>
                      {comparisonScenarios.map(s => (
                        <td key={s.id} className="border border-border p-2 text-center text-gold font-medium">
                          ${s.calculations.netProfit.toLocaleString()}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="border border-border p-2 font-medium">Margin</td>
                      <td className="border border-border p-2 text-center bg-jade/5">{calculations.profitMargin}%</td>
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