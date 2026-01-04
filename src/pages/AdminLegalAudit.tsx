import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { 
  Scale, 
  Search, 
  RefreshCw, 
  ArrowLeft, 
  CheckCircle2, 
  Calendar,
  User,
  Download,
  Globe,
  Monitor,
  Shield,
  Clock,
  Eye,
  Filter
} from 'lucide-react';
import { format, parseISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface LegalAcknowledgment {
  id: string;
  user_id: string | null;
  acknowledged_at: string;
  ip_address: string | null;
  user_agent: string | null;
  session_id: string | null;
  language: string | null;
}

export default function AdminLegalAudit() {
  const navigate = useNavigate();
  const { isAdmin, isLoading: authLoading } = useAuth();
  const [acknowledgments, setAcknowledgments] = useState<LegalAcknowledgment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<LegalAcknowledgment | null>(null);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      toast.error('Access denied. Admin only.');
      navigate('/admin');
    }
  }, [isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchAcknowledgments();
    }
  }, [isAdmin]);

  const fetchAcknowledgments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('herbal_legal_acknowledgments')
        .select('*')
        .order('acknowledged_at', { ascending: false });

      if (error) throw error;
      setAcknowledgments(data || []);
    } catch (error) {
      console.error('Error fetching acknowledgments:', error);
      toast.error('Failed to load legal acknowledgments');
    } finally {
      setIsLoading(false);
    }
  };

  const getLanguageInfo = (lang: string | null) => {
    switch (lang?.substring(0, 2)) {
      case 'he': return { flag: '🇮🇱', name: 'Hebrew' };
      case 'ru': return { flag: '🇷🇺', name: 'Russian' };
      case 'en': return { flag: '🇺🇸', name: 'English' };
      default: return { flag: '🌐', name: lang || 'Unknown' };
    }
  };

  const parseUserAgent = (ua: string | null) => {
    if (!ua) return { browser: 'Unknown', os: 'Unknown', device: 'Unknown' };
    
    let browser = 'Unknown';
    let os = 'Unknown';
    let device = 'Desktop';

    // Browser detection
    if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Safari')) browser = 'Safari';
    else if (ua.includes('Edge')) browser = 'Edge';

    // OS detection
    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Mac')) os = 'macOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

    // Device detection
    if (ua.includes('Mobile') || ua.includes('Android') || ua.includes('iPhone')) {
      device = 'Mobile';
    } else if (ua.includes('iPad') || ua.includes('Tablet')) {
      device = 'Tablet';
    }

    return { browser, os, device };
  };

  const filteredAcknowledgments = acknowledgments.filter(ack => {
    // Search filter
    const matchesSearch = 
      (ack.user_id?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (ack.session_id?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (ack.ip_address?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

    if (searchTerm && !matchesSearch) return false;

    // Date filter
    if (dateFrom || dateTo) {
      const ackDate = parseISO(ack.acknowledged_at);
      const from = dateFrom ? startOfDay(parseISO(dateFrom)) : new Date('1970-01-01');
      const to = dateTo ? endOfDay(parseISO(dateTo)) : new Date('2100-01-01');
      
      if (!isWithinInterval(ackDate, { start: from, end: to })) {
        return false;
      }
    }

    return true;
  });

  const exportToCSV = () => {
    const headers = ['Date/Time', 'User ID', 'Session ID', 'Language', 'IP Address', 'Browser', 'OS', 'Device'];
    const rows = filteredAcknowledgments.map(ack => {
      const ua = parseUserAgent(ack.user_agent);
      const lang = getLanguageInfo(ack.language);
      return [
        format(parseISO(ack.acknowledged_at), 'yyyy-MM-dd HH:mm:ss'),
        ack.user_id || 'Anonymous',
        ack.session_id || 'N/A',
        lang.name,
        ack.ip_address || 'N/A',
        ua.browser,
        ua.os,
        ua.device
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `legal_audit_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    
    toast.success(`Exported ${filteredAcknowledgments.length} records`);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDateFrom('');
    setDateTo('');
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
        <title>Legal Audit Logs | Admin</title>
        <meta name="description" content="Track liability acknowledgments for audit compliance" />
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
                <Scale className="h-6 w-6 text-jade" />
                Legal Audit Logs
              </h1>
              <p className="text-muted-foreground">מעקב אישורי הצהרת אחריות (Liability Acknowledgments)</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={fetchAcknowledgments} variant="outline" className="gap-2">
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={exportToCSV} variant="default" className="gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Stats Card */}
        <Card className="border-jade/20 bg-gradient-to-r from-jade/5 to-transparent">
          <CardContent className="py-6">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-jade/10 rounded-full">
                <Shield className="h-8 w-8 text-jade" />
              </div>
              <div>
                <p className="text-4xl font-bold text-jade">{acknowledgments.length}</p>
                <p className="text-muted-foreground">Total Signed Acknowledgments</p>
              </div>
              {filteredAcknowledgments.length !== acknowledgments.length && (
                <div className="ml-auto">
                  <Badge variant="secondary" className="text-lg px-4 py-2">
                    <Filter className="h-4 w-4 mr-2" />
                    {filteredAcknowledgments.length} filtered
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="חפש משתמש (User/ID)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div>
                <Input
                  type="date"
                  placeholder="From date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <div>
                <Input
                  type="date"
                  placeholder="To date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
              <Button variant="outline" onClick={clearFilters} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Audit Records</CardTitle>
            <CardDescription>Click on a row to view full details</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin text-jade" />
              </div>
            ) : filteredAcknowledgments.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Scale className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No acknowledgments found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>תאריך ושעה</TableHead>
                      <TableHead>מטפל (User)</TableHead>
                      <TableHead>פעולה</TableHead>
                      <TableHead>IP / Device</TableHead>
                      <TableHead>גרסת מסמך</TableHead>
                      <TableHead>סטטוס</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAcknowledgments.map((ack) => {
                      const ua = parseUserAgent(ack.user_agent);
                      const lang = getLanguageInfo(ack.language);
                      return (
                        <TableRow 
                          key={ack.id} 
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => setSelectedRecord(ack)}
                        >
                          <TableCell>
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {format(parseISO(ack.acknowledged_at), 'MMM d, yyyy HH:mm')}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <code className="text-xs bg-muted px-2 py-0.5 rounded truncate max-w-[120px]">
                                {ack.user_id?.substring(0, 8) || 'Anonymous'}...
                              </code>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="bg-jade/10 text-jade">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Herbal Disclaimer
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-sm">
                              <Monitor className="h-4 w-4 text-muted-foreground" />
                              <span>{ack.ip_address || 'N/A'}</span>
                              <span className="text-muted-foreground">• {ua.device}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{lang.flag}</span>
                              <span className="text-sm">v1.0</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Signed
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

        {/* Pagination placeholder */}
        {filteredAcknowledgments.length > 0 && (
          <div className="flex justify-center gap-2">
            <Button variant="outline" size="sm" disabled>1</Button>
            <Button variant="ghost" size="sm">2</Button>
            <Button variant="ghost" size="sm">3</Button>
          </div>
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedRecord} onOpenChange={() => setSelectedRecord(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-jade" />
              Acknowledgment Details
            </DialogTitle>
            <DialogDescription>
              Full audit trail for this legal acknowledgment
            </DialogDescription>
          </DialogHeader>
          
          {selectedRecord && (() => {
            const ua = parseUserAgent(selectedRecord.user_agent);
            const lang = getLanguageInfo(selectedRecord.language);
            return (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">User ID</p>
                    <code className="text-sm bg-muted px-2 py-1 rounded block truncate">
                      {selectedRecord.user_id || 'Anonymous'}
                    </code>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Session ID</p>
                    <code className="text-sm bg-muted px-2 py-1 rounded block truncate">
                      {selectedRecord.session_id || 'N/A'}
                    </code>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Acknowledged At</p>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{format(parseISO(selectedRecord.acknowledged_at), 'PPpp')}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Language</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{lang.flag}</span>
                      <span>{lang.name}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">IP Address</p>
                  <code className="text-sm bg-muted px-2 py-1 rounded">
                    {selectedRecord.ip_address || 'Not captured'}
                  </code>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Device Information</p>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-muted rounded p-2 text-center">
                      <p className="text-xs text-muted-foreground">Browser</p>
                      <p className="font-medium">{ua.browser}</p>
                    </div>
                    <div className="bg-muted rounded p-2 text-center">
                      <p className="text-xs text-muted-foreground">OS</p>
                      <p className="font-medium">{ua.os}</p>
                    </div>
                    <div className="bg-muted rounded p-2 text-center">
                      <p className="text-xs text-muted-foreground">Device</p>
                      <p className="font-medium">{ua.device}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Raw User Agent</p>
                  <code className="text-xs bg-muted px-2 py-1 rounded block overflow-auto max-h-20">
                    {selectedRecord.user_agent || 'Not captured'}
                  </code>
                </div>

                <div className="pt-4 border-t">
                  <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Legally Binding Acknowledgment
                  </Badge>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
