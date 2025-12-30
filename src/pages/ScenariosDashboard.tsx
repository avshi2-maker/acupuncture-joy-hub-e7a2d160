import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { 
  ArrowLeft, 
  FolderOpen, 
  Trash2, 
  Copy, 
  Pencil, 
  Archive, 
  ArchiveRestore, 
  Download, 
  Search,
  BookOpen,
  Building2,
  Tag,
  Calendar,
  TrendingUp,
  X,
  Save,
  FileDown,
  GitCompare,
  CheckSquare
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Scenario {
  id: string;
  name: string;
  notes: string | null;
  tags: string[];
  archived: boolean;
  scenario_type: string;
  configuration: any;
  calculations: any;
  created_at: string;
  updated_at: string;
}

const DEFAULT_TAGS = ['optimistic', 'conservative', 'baseline', 'q1', 'q2', 'q3', 'q4', '2025', '2026', 'growth', 'test'];

export default function ScenariosDashboard() {
  const navigate = useNavigate();
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'encyclopedia' | 'clinic'>('all');
  
  // Edit dialog state
  const [editingScenario, setEditingScenario] = useState<Scenario | null>(null);
  const [editName, setEditName] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editTags, setEditTags] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState('');
  
  // Delete confirmation state
  const [deletingScenarioId, setDeletingScenarioId] = useState<string | null>(null);
  const [deletingScenarioName, setDeletingScenarioName] = useState('');
  
  // Comparison mode state
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
      if (user) {
        loadScenarios();
      } else {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const loadScenarios = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('roi_scenarios')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setScenarios(data.map(s => ({
        id: s.id,
        name: s.name,
        notes: s.notes || null,
        tags: (s as any).tags || [],
        archived: (s as any).archived || false,
        scenario_type: s.scenario_type,
        configuration: s.configuration,
        calculations: s.calculations,
        created_at: s.created_at,
        updated_at: s.updated_at
      })));
    }
    setLoading(false);
  };

  const allUsedTags = useMemo(() => {
    const tags = new Set<string>();
    scenarios.forEach(s => s.tags?.forEach(t => tags.add(t)));
    return Array.from(tags);
  }, [scenarios]);

  const filteredScenarios = useMemo(() => {
    return scenarios.filter(s => {
      // Filter by type
      if (activeTab !== 'all' && s.scenario_type !== activeTab) return false;
      // Filter by archived
      if (!showArchived && s.archived) return false;
      // Filter by tag
      if (filterTag && !s.tags?.includes(filterTag)) return false;
      // Filter by search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchName = s.name.toLowerCase().includes(query);
        const matchNotes = s.notes?.toLowerCase().includes(query);
        const matchTags = s.tags?.some(t => t.toLowerCase().includes(query));
        if (!matchName && !matchNotes && !matchTags) return false;
      }
      return true;
    });
  }, [scenarios, activeTab, showArchived, filterTag, searchQuery]);

  const stats = useMemo(() => {
    return {
      total: scenarios.length,
      encyclopedia: scenarios.filter(s => s.scenario_type === 'encyclopedia').length,
      clinic: scenarios.filter(s => s.scenario_type === 'clinic').length,
      archived: scenarios.filter(s => s.archived).length,
    };
  }, [scenarios]);

  const toggleTag = (tag: string) => {
    setEditTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const addCustomTag = () => {
    const tag = customTagInput.trim().toLowerCase();
    if (tag && !editTags.includes(tag)) {
      setEditTags([...editTags, tag]);
      setCustomTagInput('');
    }
  };

  const startEditing = (scenario: Scenario) => {
    setEditingScenario(scenario);
    setEditName(scenario.name);
    setEditNotes(scenario.notes || '');
    setEditTags(scenario.tags || []);
  };

  const updateScenario = async () => {
    if (!editingScenario) return;
    
    const { error } = await supabase
      .from('roi_scenarios')
      .update({ 
        name: editName, 
        notes: editNotes, 
        tags: editTags,
        updated_at: new Date().toISOString() 
      })
      .eq('id', editingScenario.id);
    
    if (!error) {
      toast.success('Scenario updated');
      setEditingScenario(null);
      loadScenarios();
    } else {
      toast.error('Failed to update scenario');
    }
  };

  const toggleArchive = async (scenario: Scenario) => {
    const { error } = await supabase
      .from('roi_scenarios')
      .update({ archived: !scenario.archived })
      .eq('id', scenario.id);
    
    if (!error) {
      toast.success(scenario.archived ? 'Scenario restored' : 'Scenario archived');
      loadScenarios();
    }
  };

  const duplicateScenario = async (scenario: Scenario) => {
    const { error } = await supabase
      .from('roi_scenarios')
      .insert({
        user_id: userId,
        name: `${scenario.name} (Copy)`,
        notes: scenario.notes,
        tags: scenario.tags,
        scenario_type: scenario.scenario_type,
        configuration: scenario.configuration,
        calculations: scenario.calculations
      });
    
    if (!error) {
      toast.success('Scenario duplicated');
      loadScenarios();
    }
  };

  const confirmDelete = (scenario: Scenario) => {
    setDeletingScenarioId(scenario.id);
    setDeletingScenarioName(scenario.name);
  };

  const deleteScenario = async () => {
    if (!deletingScenarioId) return;
    
    const { error } = await supabase
      .from('roi_scenarios')
      .delete()
      .eq('id', deletingScenarioId);
    
    if (!error) {
      toast.success('Scenario deleted');
      setSelectedForComparison(prev => prev.filter(id => id !== deletingScenarioId));
      loadScenarios();
    }
    setDeletingScenarioId(null);
    setDeletingScenarioName('');
  };

  const toggleComparisonSelection = (id: string) => {
    setSelectedForComparison(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const comparisonScenarios = useMemo(() => {
    return scenarios.filter(s => selectedForComparison.includes(s.id));
  }, [scenarios, selectedForComparison]);

  const comparisonChartData = useMemo(() => {
    return comparisonScenarios.map(s => ({
      name: s.name.length > 15 ? s.name.substring(0, 15) + '...' : s.name,
      revenue: s.calculations?.totalRevenue || 0,
      profit: s.calculations?.netProfit || 0,
      cost: s.calculations?.totalCost || 0,
    }));
  }, [comparisonScenarios]);

  const exportAllToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('ROI Scenarios Report', 14, 22);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);
    doc.text(`Total Scenarios: ${filteredScenarios.length}`, 14, 36);

    const tableData = filteredScenarios.map(s => [
      s.name,
      s.scenario_type === 'encyclopedia' ? 'Encyclopedia' : 'Clinic',
      s.calculations?.netProfit ? `$${s.calculations.netProfit.toLocaleString()}` : 'N/A',
      s.calculations?.profitMargin ? `${s.calculations.profitMargin}%` : 'N/A',
      s.tags?.join(', ') || '-',
      new Date(s.created_at).toLocaleDateString()
    ]);

    autoTable(doc, {
      head: [['Name', 'Type', 'Net Profit', 'Margin', 'Tags', 'Created']],
      body: tableData,
      startY: 42,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [16, 124, 108] }
    });

    doc.save('roi-scenarios-report.pdf');
    toast.success('PDF exported');
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (!userId && !loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8">
          <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Login Required</h2>
          <p className="text-muted-foreground mb-4">Please login to view your saved scenarios.</p>
          <Button onClick={() => navigate('/auth')}>Login</Button>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Scenarios Dashboard | CM Brain</title>
        <meta name="description" content="Manage all your saved ROI scenarios in one place" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/encyclopedia')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">Scenarios Dashboard</h1>
                <p className="text-sm text-muted-foreground">Manage all your saved ROI scenarios</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant={isCompareMode ? "default" : "outline"} 
                onClick={() => {
                  setIsCompareMode(!isCompareMode);
                  if (isCompareMode) setSelectedForComparison([]);
                }}
                className="gap-2"
              >
                <GitCompare className="h-4 w-4" />
                {isCompareMode ? 'Exit Compare' : 'Compare'}
              </Button>
              <Button variant="outline" onClick={exportAllToPDF} disabled={filteredScenarios.length === 0}>
                <FileDown className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-card/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-jade/10 rounded-lg">
                    <FolderOpen className="h-5 w-5 text-jade" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.total}</p>
                    <p className="text-xs text-muted-foreground">Total Scenarios</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-jade/10 rounded-lg">
                    <BookOpen className="h-5 w-5 text-jade" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.encyclopedia}</p>
                    <p className="text-xs text-muted-foreground">Encyclopedia</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gold/10 rounded-lg">
                    <Building2 className="h-5 w-5 text-gold" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.clinic}</p>
                    <p className="text-xs text-muted-foreground">Clinic CRM</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-lg">
                    <Archive className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.archived}</p>
                    <p className="text-xs text-muted-foreground">Archived</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search scenarios..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="show-archived"
                      checked={showArchived}
                      onCheckedChange={setShowArchived}
                    />
                    <Label htmlFor="show-archived" className="text-sm">Show Archived</Label>
                  </div>
                </div>
              </div>
              
              {/* Tag Filters */}
              {allUsedTags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-4">
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
                      onClick={() => setFilterTag(filterTag === tag ? null : tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="mb-6">
            <TabsList>
              <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
              <TabsTrigger value="encyclopedia">Encyclopedia ({stats.encyclopedia})</TabsTrigger>
              <TabsTrigger value="clinic">Clinic ({stats.clinic})</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Comparison Panel */}
          {isCompareMode && selectedForComparison.length > 0 && (
            <Card className="mb-6 border-jade/50 bg-jade/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <GitCompare className="h-4 w-4 text-jade" />
                  Comparing {selectedForComparison.length} Scenarios
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Comparison Table */}
                <div className="overflow-x-auto mb-6">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-3 font-medium">Scenario</th>
                        <th className="text-left py-2 px-3 font-medium">Type</th>
                        <th className="text-right py-2 px-3 font-medium">Revenue</th>
                        <th className="text-right py-2 px-3 font-medium">Cost</th>
                        <th className="text-right py-2 px-3 font-medium">Profit</th>
                        <th className="text-right py-2 px-3 font-medium">Margin</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonScenarios.map(s => (
                        <tr key={s.id} className="border-b hover:bg-muted/50">
                          <td className="py-2 px-3 font-medium">{s.name}</td>
                          <td className="py-2 px-3">
                            <Badge variant="outline" className="text-xs">
                              {s.scenario_type === 'encyclopedia' ? 'Encyclopedia' : 'Clinic'}
                            </Badge>
                          </td>
                          <td className="py-2 px-3 text-right">${s.calculations?.totalRevenue?.toLocaleString() || 0}</td>
                          <td className="py-2 px-3 text-right">${s.calculations?.totalCost?.toFixed(2) || 0}</td>
                          <td className="py-2 px-3 text-right font-bold text-jade">${s.calculations?.netProfit?.toLocaleString() || 0}</td>
                          <td className="py-2 px-3 text-right">{s.calculations?.profitMargin || 0}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Comparison Chart */}
                {comparisonChartData.length > 1 && (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={comparisonChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" fontSize={10} />
                        <YAxis fontSize={10} />
                        <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                        <Legend />
                        <Bar dataKey="revenue" name="Revenue" fill="#107c6c" />
                        <Bar dataKey="profit" name="Profit" fill="#d4a853" />
                        <Bar dataKey="cost" name="Cost" fill="#dc2626" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                <div className="flex justify-end mt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setSelectedForComparison([])}
                  >
                    Clear Selection
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Scenarios Grid */}
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading scenarios...</div>
          ) : filteredScenarios.length === 0 ? (
            <Card className="text-center py-12">
              <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No scenarios found</p>
              <Button variant="link" onClick={() => navigate('/encyclopedia#roi-calculator')}>
                Create your first scenario
              </Button>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredScenarios.map(scenario => (
                <Card 
                  key={scenario.id} 
                  className={`transition-all hover:shadow-lg ${scenario.archived ? 'opacity-60' : ''} ${isCompareMode && selectedForComparison.includes(scenario.id) ? 'ring-2 ring-jade' : ''}`}
                  onClick={isCompareMode ? () => toggleComparisonSelection(scenario.id) : undefined}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-2 flex-1">
                        {isCompareMode && (
                          <Checkbox 
                            checked={selectedForComparison.includes(scenario.id)}
                            onCheckedChange={() => toggleComparisonSelection(scenario.id)}
                            className="mt-1"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base flex items-center gap-2">
                            {scenario.scenario_type === 'encyclopedia' ? (
                              <BookOpen className="h-4 w-4 text-jade shrink-0" />
                            ) : (
                              <Building2 className="h-4 w-4 text-gold shrink-0" />
                            )}
                            <span className="truncate">{scenario.name}</span>
                          </CardTitle>
                          <CardDescription className="text-xs mt-1">
                            <Calendar className="h-3 w-3 inline mr-1" />
                            {formatDate(scenario.created_at)}
                          </CardDescription>
                        </div>
                      </div>
                      {scenario.archived && (
                        <Badge variant="secondary" className="text-xs">Archived</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-2">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="bg-muted/50 rounded p-2 text-center">
                        <p className="text-xs text-muted-foreground">Net Profit</p>
                        <p className="font-bold text-jade">
                          ${scenario.calculations?.netProfit?.toLocaleString() || 'N/A'}
                        </p>
                      </div>
                      <div className="bg-muted/50 rounded p-2 text-center">
                        <p className="text-xs text-muted-foreground">Margin</p>
                        <p className="font-bold text-jade">
                          {scenario.calculations?.profitMargin || 'N/A'}%
                        </p>
                      </div>
                    </div>

                    {/* Tags */}
                    {scenario.tags && scenario.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {scenario.tags.slice(0, 3).map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {scenario.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{scenario.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Notes Preview */}
                    {scenario.notes && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                        {scenario.notes}
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-1 pt-2 border-t">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="flex-1 h-8 text-xs"
                        onClick={() => startEditing(scenario)}
                      >
                        <Pencil className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="flex-1 h-8 text-xs"
                        onClick={() => duplicateScenario(scenario)}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 text-xs"
                        onClick={() => toggleArchive(scenario)}
                      >
                        {scenario.archived ? (
                          <ArchiveRestore className="h-3 w-3" />
                        ) : (
                          <Archive className="h-3 w-3" />
                        )}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 text-xs text-destructive hover:text-destructive"
                        onClick={() => confirmDelete(scenario)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingScenario} onOpenChange={(open) => !open && setEditingScenario(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5" />
              Edit Scenario
            </DialogTitle>
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
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
                {editTags.filter(t => !DEFAULT_TAGS.includes(t)).map(tag => (
                  <Badge key={tag} variant="default" className="text-xs gap-1">
                    {tag}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => toggleTag(tag)} />
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add custom tag..."
                  value={customTagInput}
                  onChange={(e) => setCustomTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addCustomTag()}
                  className="text-xs h-8"
                />
                <Button size="sm" variant="outline" onClick={addCustomTag}>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingScenarioId} onOpenChange={(open) => !open && setDeletingScenarioId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Delete Scenario
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "<strong>{deletingScenarioName}</strong>"? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={deleteScenario}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
