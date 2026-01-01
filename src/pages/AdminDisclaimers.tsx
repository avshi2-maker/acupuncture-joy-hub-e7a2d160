import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { 
  Shield, 
  Search, 
  RefreshCw, 
  ArrowLeft, 
  CheckCircle2, 
  AlertTriangle,
  Clock,
  User,
  Award,
  Calendar,
  Mail,
  Bell,
  Eye,
  FileSignature,
  Globe
} from 'lucide-react';
import { format, isAfter, isBefore, addDays, differenceInDays } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Disclaimer {
  id: string;
  user_id: string | null;
  therapist_name: string;
  license_number: string;
  language: string;
  signature_url: string | null;
  signed_at: string;
  expires_at: string;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export default function AdminDisclaimers() {
  const navigate = useNavigate();
  const { isAdmin, isLoading: authLoading } = useAuth();
  const [disclaimers, setDisclaimers] = useState<Disclaimer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDisclaimer, setSelectedDisclaimer] = useState<Disclaimer | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      toast.error('Access denied. Admin only.');
      navigate('/admin');
    }
  }, [isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchDisclaimers();
    }
  }, [isAdmin]);

  const fetchDisclaimers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('therapist_disclaimers')
        .select('*')
        .order('signed_at', { ascending: false });

      if (error) throw error;
      setDisclaimers(data || []);
    } catch (error) {
      console.error('Error fetching disclaimers:', error);
      toast.error('Failed to load disclaimers');
    } finally {
      setIsLoading(false);
    }
  };

  const getExpirationStatus = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const warningDate = addDays(now, 30);
    const daysLeft = differenceInDays(expiry, now);

    if (isBefore(expiry, now)) {
      return { status: 'expired', label: 'Expired', variant: 'destructive' as const, daysLeft: Math.abs(daysLeft) };
    } else if (isBefore(expiry, warningDate)) {
      return { status: 'expiring', label: `${daysLeft} days left`, variant: 'secondary' as const, daysLeft };
    }
    return { status: 'valid', label: 'Valid', variant: 'default' as const, daysLeft };
  };

  const getLanguageFlag = (lang: string) => {
    switch (lang) {
      case 'he': return '🇮🇱';
      case 'ru': return '🇷🇺';
      default: return '🇺🇸';
    }
  };

  const getLanguageName = (lang: string) => {
    switch (lang) {
      case 'he': return 'Hebrew';
      case 'ru': return 'Russian';
      default: return 'English';
    }
  };

  const filteredDisclaimers = disclaimers.filter(d => {
    const matchesSearch = d.therapist_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.license_number.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    
    const status = getExpirationStatus(d.expires_at).status;
    if (activeTab === 'all') return true;
    if (activeTab === 'valid') return status === 'valid';
    if (activeTab === 'expiring') return status === 'expiring';
    if (activeTab === 'expired') return status === 'expired';
    return true;
  });

  const stats = {
    total: disclaimers.length,
    valid: disclaimers.filter(d => getExpirationStatus(d.expires_at).status === 'valid').length,
    expiring: disclaimers.filter(d => getExpirationStatus(d.expires_at).status === 'expiring').length,
    expired: disclaimers.filter(d => getExpirationStatus(d.expires_at).status === 'expired').length,
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-jade" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <Helmet>
        <title>Signed Disclaimers | Admin</title>
      </Helmet>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Shield className="h-6 w-6 text-jade" />
                Therapist Disclaimers
              </h1>
              <p className="text-muted-foreground">View and manage therapist legal disclaimers</p>
            </div>
          </div>
          <Button onClick={fetchDisclaimers} variant="outline" className="gap-2">
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Expiring Soon Alert */}
        {stats.expiring > 0 && (
          <Card className="border-amber-500/50 bg-amber-500/5">
            <CardContent className="py-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-500/20 rounded-full">
                  <Bell className="h-6 w-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-amber-700 dark:text-amber-400">
                    {stats.expiring} Disclaimer{stats.expiring > 1 ? 's' : ''} Expiring Soon
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    These therapists need to renew their disclaimer within the next 30 days.
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  className="border-amber-500/50 text-amber-600 hover:bg-amber-500/10"
                  onClick={() => setActiveTab('expiring')}
                >
                  View Expiring
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Expired Alert */}
        {stats.expired > 0 && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="py-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-destructive/20 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-destructive">
                    {stats.expired} Disclaimer{stats.expired > 1 ? 's' : ''} Expired
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    These therapists must sign a new disclaimer to continue using the platform.
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  className="border-destructive/50 text-destructive hover:bg-destructive/10"
                  onClick={() => setActiveTab('expired')}
                >
                  View Expired
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="cursor-pointer hover:border-jade/50 transition-colors" onClick={() => setActiveTab('all')}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-jade/10 rounded-lg">
                  <Shield className="h-5 w-5 text-jade" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Total Signed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:border-green-500/50 transition-colors" onClick={() => setActiveTab('valid')}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.valid}</p>
                  <p className="text-sm text-muted-foreground">Valid</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:border-amber-500/50 transition-colors" onClick={() => setActiveTab('expiring')}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <Clock className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.expiring}</p>
                  <p className="text-sm text-muted-foreground">Expiring Soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:border-destructive/50 transition-colors" onClick={() => setActiveTab('expired')}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-destructive/10 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.expired}</p>
                  <p className="text-sm text-muted-foreground">Expired</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs and Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Disclaimer Records</CardTitle>
                <CardDescription>Click on a row to view full details</CardDescription>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or license..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all" className="gap-1">
                  All <Badge variant="secondary" className="ml-1">{stats.total}</Badge>
                </TabsTrigger>
                <TabsTrigger value="valid" className="gap-1">
                  Valid <Badge variant="secondary" className="ml-1 bg-green-500/20">{stats.valid}</Badge>
                </TabsTrigger>
                <TabsTrigger value="expiring" className="gap-1">
                  Expiring <Badge variant="secondary" className="ml-1 bg-amber-500/20">{stats.expiring}</Badge>
                </TabsTrigger>
                <TabsTrigger value="expired" className="gap-1">
                  Expired <Badge variant="secondary" className="ml-1 bg-destructive/20">{stats.expired}</Badge>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin text-jade" />
              </div>
            ) : filteredDisclaimers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No disclaimers found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Therapist</TableHead>
                      <TableHead>License #</TableHead>
                      <TableHead>Language</TableHead>
                      <TableHead>Signed</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDisclaimers.map((disclaimer) => {
                      const expStatus = getExpirationStatus(disclaimer.expires_at);
                      return (
                        <TableRow 
                          key={disclaimer.id} 
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => setSelectedDisclaimer(disclaimer)}
                        >
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{disclaimer.therapist_name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Award className="h-4 w-4 text-muted-foreground" />
                              <code className="text-sm bg-muted px-2 py-0.5 rounded">
                                {disclaimer.license_number}
                              </code>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-lg">{getLanguageFlag(disclaimer.language)}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {format(new Date(disclaimer.signed_at), 'MMM d, yyyy')}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              {format(new Date(disclaimer.expires_at), 'MMM d, yyyy')}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={expStatus.variant} className={
                              expStatus.status === 'valid' ? 'bg-green-500/10 text-green-600 border-green-500/20' :
                              expStatus.status === 'expiring' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
                              ''
                            }>
                              {expStatus.status === 'valid' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                              {expStatus.status === 'expiring' && <Clock className="h-3 w-3 mr-1" />}
                              {expStatus.status === 'expired' && <AlertTriangle className="h-3 w-3 mr-1" />}
                              {expStatus.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedDisclaimer} onOpenChange={() => setSelectedDisclaimer(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSignature className="h-5 w-5 text-jade" />
              Disclaimer Details
            </DialogTitle>
            <DialogDescription>
              Full information about this signed disclaimer
            </DialogDescription>
          </DialogHeader>
          
          {selectedDisclaimer && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Therapist Name</label>
                  <p className="font-medium">{selectedDisclaimer.therapist_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">License Number</label>
                  <p className="font-mono">{selectedDisclaimer.license_number}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Signed Date</label>
                  <p>{format(new Date(selectedDisclaimer.signed_at), 'PPP')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Expiry Date</label>
                  <div className="flex items-center gap-2">
                    <p>{format(new Date(selectedDisclaimer.expires_at), 'PPP')}</p>
                    {(() => {
                      const status = getExpirationStatus(selectedDisclaimer.expires_at);
                      return (
                        <Badge variant={status.variant} className={
                          status.status === 'valid' ? 'bg-green-500/10 text-green-600' :
                          status.status === 'expiring' ? 'bg-amber-500/10 text-amber-600' :
                          'bg-destructive/10 text-destructive'
                        }>
                          {status.label}
                        </Badge>
                      );
                    })()}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Globe className="h-3 w-3" /> Language
                </label>
                <p>{getLanguageFlag(selectedDisclaimer.language)} {getLanguageName(selectedDisclaimer.language)}</p>
              </div>

              {selectedDisclaimer.signature_url && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Signature</label>
                  <div className="mt-2 p-4 bg-muted rounded-lg">
                    <img 
                      src={selectedDisclaimer.signature_url} 
                      alt="Signature" 
                      className="max-h-24 mx-auto"
                    />
                  </div>
                </div>
              )}

              <div className="pt-4 border-t text-xs text-muted-foreground space-y-1">
                <p><strong>IP Address:</strong> {selectedDisclaimer.ip_address || 'Not recorded'}</p>
                <p><strong>User Agent:</strong> {selectedDisclaimer.user_agent?.substring(0, 60) || 'Not recorded'}...</p>
                <p><strong>User ID:</strong> {selectedDisclaimer.user_id || 'Anonymous'}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
