import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  History, 
  FileText, 
  Mail, 
  MessageCircle, 
  Trash2, 
  Download,
  Clock,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Search,
  X
} from 'lucide-react';
import { TcmSession, useTcmSessionHistory } from '@/hooks/useTcmSessionHistory';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface SessionHistoryDialogProps {
  trigger?: React.ReactNode;
}

export function SessionHistoryDialog({ trigger }: SessionHistoryDialogProps) {
  const { 
    sessions, 
    deleteSession, 
    clearAllSessions, 
    exportSessionAsPDF, 
    openGmailWithSession, 
    openWhatsAppWithSession 
  } = useTcmSessionHistory();
  
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [emailInput, setEmailInput] = useState<Record<string, string>>({});
  const [phoneInput, setPhoneInput] = useState<Record<string, string>>({});

  const filteredSessions = sessions.filter(session => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      session.id.toLowerCase().includes(query) ||
      session.patientName?.toLowerCase().includes(query) ||
      session.questionsAsked.some(q => q.toLowerCase().includes(query)) ||
      new Date(session.startTime).toLocaleDateString().includes(query)
    );
  });

  const handleExportPDF = (session: TcmSession) => {
    exportSessionAsPDF(session);
    toast.success('PDF exported successfully');
  };

  const handleOpenGmail = (session: TcmSession) => {
    const email = emailInput[session.id] || session.patientEmail;
    openGmailWithSession(session, email);
    toast.success('Opening Gmail...');
  };

  const handleOpenWhatsApp = (session: TcmSession) => {
    const phone = phoneInput[session.id] || session.patientPhone;
    openWhatsAppWithSession(session, phone);
    toast.success('Opening WhatsApp...');
  };

  const handleDelete = (sessionId: string) => {
    deleteSession(sessionId);
    toast.success('Session deleted');
  };

  const toggleExpand = (sessionId: string) => {
    setExpandedSession(prev => prev === sessionId ? null : sessionId);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <History className="h-4 w-4" />
            Session History
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-jade" />
            Session History
            <Badge variant="secondary" className="ml-2">{sessions.length} sessions</Badge>
          </DialogTitle>
        </DialogHeader>

        {/* Search and Clear */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search sessions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => setSearchQuery('')}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
          
          {sessions.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-1" />
                  Clear All
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear all session history?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all {sessions.length} saved sessions. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={clearAllSessions} className="bg-destructive text-destructive-foreground">
                    Delete All
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        {/* Sessions List */}
        <ScrollArea className="flex-1 pr-4">
          {filteredSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <History className="h-12 w-12 mb-4 opacity-30" />
              <p className="text-lg font-medium">No sessions found</p>
              <p className="text-sm">{sessions.length === 0 ? 'Start a session to see it here' : 'Try a different search'}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredSessions.map((session) => (
                <Card key={session.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    {/* Session Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs text-muted-foreground">{session.id}</span>
                          <Badge variant="outline" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            {session.duration}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            <HelpCircle className="h-3 w-3 mr-1" />
                            {session.totalQuestions} questions
                          </Badge>
                        </div>
                        <p className="text-sm mt-1">
                          {new Date(session.startTime).toLocaleDateString()} at {new Date(session.startTime).toLocaleTimeString()}
                        </p>
                        {session.patientName && (
                          <p className="text-sm text-muted-foreground">Patient: {session.patientName}</p>
                        )}
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpand(session.id)}
                        className="shrink-0"
                      >
                        {expandedSession === session.id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    {/* Expanded Content */}
                    {expandedSession === session.id && (
                      <div className="mt-4 pt-4 border-t border-border space-y-4">
                        {/* Questions Preview */}
                        <div>
                          <h4 className="text-sm font-medium mb-2">Questions Asked:</h4>
                          <ul className="text-sm text-muted-foreground space-y-1 max-h-32 overflow-y-auto">
                            {session.questionsAsked.slice(0, 5).map((q, i) => (
                              <li key={i} className="truncate">• {q}</li>
                            ))}
                            {session.questionsAsked.length > 5 && (
                              <li className="text-jade">+ {session.questionsAsked.length - 5} more...</li>
                            )}
                          </ul>
                        </div>

                        {/* Email & Phone Inputs */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-muted-foreground mb-1 block">Patient Email</label>
                            <Input
                              type="email"
                              placeholder="patient@email.com"
                              value={emailInput[session.id] || session.patientEmail || ''}
                              onChange={(e) => setEmailInput(prev => ({ ...prev, [session.id]: e.target.value }))}
                              className="h-8 text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground mb-1 block">Patient Phone</label>
                            <Input
                              type="tel"
                              placeholder="+1234567890"
                              value={phoneInput[session.id] || session.patientPhone || ''}
                              onChange={(e) => setPhoneInput(prev => ({ ...prev, [session.id]: e.target.value }))}
                              className="h-8 text-sm"
                            />
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleExportPDF(session)}
                            className="gap-1"
                          >
                            <Download className="h-3.5 w-3.5" />
                            Export PDF
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenGmail(session)}
                            className="gap-1"
                          >
                            <Mail className="h-3.5 w-3.5" />
                            Email
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenWhatsApp(session)}
                            className="gap-1 text-green-600 border-green-300 hover:bg-green-50"
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                            WhatsApp
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="gap-1 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete this session?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete this session. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(session.id)} className="bg-destructive text-destructive-foreground">
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
