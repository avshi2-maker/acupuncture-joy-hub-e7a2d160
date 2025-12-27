import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import {
  useQATesting,
  TestStatus,
  ModuleTest,
  TestComment,
} from '@/hooks/useQATesting';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import {
  Play,
  Pause,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  MessageSquare,
  ExternalLink,
  RotateCcw,
  Flag,
  Calendar,
  User,
  Bug,
  Lightbulb,
  HelpCircle,
  FileText,
  Trash2,
  ArrowLeft,
  ClipboardCheck,
  Timer,
  Shield,
  Mail,
  Send,
  Loader2,
} from 'lucide-react';

const statusConfig: Record<TestStatus, { label: string; labelHe: string; icon: React.ReactNode; color: string }> = {
  not_tested: { label: 'Not Tested', labelHe: 'לא נבדק', icon: <Clock className="h-4 w-4" />, color: 'bg-muted text-muted-foreground' },
  in_progress: { label: 'In Progress', labelHe: 'בבדיקה', icon: <Timer className="h-4 w-4" />, color: 'bg-blue-500/20 text-blue-500' },
  passed: { label: 'Passed', labelHe: 'עבר', icon: <CheckCircle2 className="h-4 w-4" />, color: 'bg-jade/20 text-jade' },
  failed: { label: 'Failed', labelHe: 'נכשל', icon: <XCircle className="h-4 w-4" />, color: 'bg-destructive/20 text-destructive' },
  blocked: { label: 'Blocked', labelHe: 'חסום', icon: <AlertCircle className="h-4 w-4" />, color: 'bg-amber-500/20 text-amber-500' },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  low: { label: 'Low', color: 'bg-muted text-muted-foreground' },
  medium: { label: 'Medium', color: 'bg-blue-500/20 text-blue-500' },
  high: { label: 'High', color: 'bg-amber-500/20 text-amber-500' },
  critical: { label: 'Critical', color: 'bg-destructive/20 text-destructive' },
};

const commentTypeConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  bug: { label: 'Bug', icon: <Bug className="h-3 w-3" />, color: 'bg-destructive/20 text-destructive' },
  suggestion: { label: 'Suggestion', icon: <Lightbulb className="h-3 w-3" />, color: 'bg-amber-500/20 text-amber-500' },
  question: { label: 'Question', icon: <HelpCircle className="h-3 w-3" />, color: 'bg-blue-500/20 text-blue-500' },
  note: { label: 'Note', icon: <FileText className="h-3 w-3" />, color: 'bg-muted text-muted-foreground' },
};

function formatDateTime(isoString: string | null): string {
  if (!isoString) return '—';
  return format(new Date(isoString), 'dd/MM/yyyy HH:mm', { locale: he });
}

export default function QATesting() {
  const navigate = useNavigate();
  const {
    session,
    isLoading,
    startSession,
    endSession,
    pauseSession,
    resumeSession,
    updateModuleStatus,
    confirmModule,
    addComment,
    removeComment,
    setFollowUp,
    resetSession,
    getProgress,
    getNextUntestedModule,
  } = useQATesting();

  const [testerName, setTesterName] = useState('');
  const [selectedModule, setSelectedModule] = useState<ModuleTest | null>(null);
  const [newComment, setNewComment] = useState('');
  const [commentType, setCommentType] = useState<'bug' | 'suggestion' | 'question' | 'note'>('note');
  const [followUpNotes, setFollowUpNotes] = useState('');
  const [followUpDueDate, setFollowUpDueDate] = useState('');
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('avshi2@gmail.com');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading QA Session...</div>
      </div>
    );
  }

  const progress = getProgress();
  const nextModule = getNextUntestedModule();

  const handleStartSession = () => {
    if (!testerName.trim()) {
      toast.error('נא להזין שם הבודק');
      return;
    }
    startSession(testerName.trim());
    toast.success('QA Session Started!');
  };

  const handleStatusChange = (moduleId: string, status: TestStatus) => {
    updateModuleStatus(moduleId, status, session?.testerName);
    toast.success(`Status updated to ${statusConfig[status].label}`);
  };

  const handleConfirm = (moduleId: string) => {
    confirmModule(moduleId, session?.testerName || 'Unknown');
    toast.success('Module confirmed with timestamp!');
  };

  const handleAddComment = (moduleId: string) => {
    if (!newComment.trim()) return;
    addComment(moduleId, {
      text: newComment.trim(),
      author: session?.testerName || 'Unknown',
      type: commentType,
    });
    setNewComment('');
    toast.success('Comment added');
  };

  const handleSetFollowUp = (moduleId: string, required: boolean) => {
    setFollowUp(moduleId, required, followUpNotes, followUpDueDate);
    toast.success(required ? 'Follow-up set' : 'Follow-up removed');
  };

  const handleReset = () => {
    resetSession();
    setShowResetDialog(false);
    toast.success('QA Session reset');
  };

  const handleSendEmailReport = async () => {
    if (!session || !recipientEmail.trim()) {
      toast.error('נא להזין כתובת אימייל');
      return;
    }

    setIsSendingEmail(true);
    try {
      const reportData = {
        testerName: session.testerName,
        recipientEmail: recipientEmail.trim(),
        startedAt: session.startedAt,
        endedAt: session.endedAt || new Date().toISOString(),
        modules: session.modules.map(m => ({
          moduleName: m.moduleName,
          moduleNameHe: m.moduleNameHe,
          status: m.status,
          comments: m.comments.map(c => ({
            text: c.text,
            type: c.type,
            author: c.author,
          })),
          followUpRequired: m.followUpRequired,
          followUpNotes: m.followUpNotes,
        })),
        summary: progress,
      };

      const { data, error } = await supabase.functions.invoke('send-qa-report', {
        body: reportData,
      });

      if (error) throw error;

      toast.success('דו״ח QA נשלח בהצלחה!');
      setShowEmailDialog(false);
    } catch (error: any) {
      console.error('Error sending email:', error);
      toast.error('שגיאה בשליחת הדו״ח: ' + error.message);
    } finally {
      setIsSendingEmail(false);
    }
  };

  const filteredModules = session?.modules.filter(m =>
    activeCategory === 'all' || m.category === activeCategory
  ) || [];

  const categories = [
    { id: 'all', label: 'All', labelHe: 'הכל' },
    { id: 'core', label: 'Core', labelHe: 'ליבה' },
    { id: 'crm', label: 'CRM', labelHe: 'CRM' },
    { id: 'tools', label: 'Tools', labelHe: 'כלים' },
    { id: 'admin', label: 'Admin', labelHe: 'ניהול' },
    { id: 'auth', label: 'Auth', labelHe: 'הזדהות' },
  ];

  // No session - show start screen
  if (!session) {
    return (
      <>
        <Helmet>
          <title>QA Testing | TCM Clinic</title>
        </Helmet>
        <div className="min-h-screen bg-background flex items-center justify-center p-4" dir="rtl">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-jade/20 rounded-full flex items-center justify-center mb-4">
                <ClipboardCheck className="h-8 w-8 text-jade" />
              </div>
              <CardTitle className="text-2xl">QA Testing Session</CardTitle>
              <CardDescription>
                התחל סשן בדיקות חדש לבדיקת כל המודולים
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="testerName">שם הבודק</Label>
                <Input
                  id="testerName"
                  placeholder="לדוגמה: ד״ר רוני ספיר"
                  value={testerName}
                  onChange={(e) => setTesterName(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-3">
              <Button onClick={handleStartSession} className="w-full gap-2">
                <Play className="h-4 w-4" />
                התחל סשן בדיקות
              </Button>
              <Button variant="outline" onClick={() => navigate('/')} className="w-full gap-2">
                <ArrowLeft className="h-4 w-4" />
                חזרה לדף הבית
              </Button>
            </CardFooter>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>QA Testing | TCM Clinic</title>
      </Helmet>

      <div className="min-h-screen bg-background" dir="rtl">
        {/* Header */}
        <header className="border-b border-border/50 bg-card/30 backdrop-blur-sm sticky top-0 z-10">
          <div className="container py-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <Link to="/">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">דף הבית</span>
                  </Button>
                </Link>
                <div className="flex items-center gap-2">
                  <Shield className="h-6 w-6 text-jade" />
                  <h1 className="text-xl font-display font-semibold">QA Testing</h1>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="gap-1">
                  <User className="h-3 w-3" />
                  {session.testerName}
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDateTime(session.startedAt)}
                </Badge>
                
                {session.overallStatus === 'in_progress' ? (
                  <Button variant="outline" size="sm" onClick={pauseSession} className="gap-1">
                    <Pause className="h-4 w-4" />
                    Pause
                  </Button>
                ) : session.overallStatus === 'paused' ? (
                  <Button variant="outline" size="sm" onClick={resumeSession} className="gap-1">
                    <Play className="h-4 w-4" />
                    Resume
                  </Button>
                ) : null}

                <Button variant="outline" size="sm" onClick={endSession} className="gap-1">
                  <CheckCircle2 className="h-4 w-4" />
                  End Session
                </Button>

                {/* Email Report Dialog */}
                <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1 border-jade text-jade hover:bg-jade/10">
                      <Mail className="h-4 w-4" />
                      Send Report
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>📧 שליחת דו״ח QA באימייל</DialogTitle>
                      <DialogDescription>
                        הדו״ח יכלול סיכום של כל הבדיקות, הערות ומודולים שנכשלו
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">כתובת אימייל</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="example@email.com"
                          value={recipientEmail}
                          onChange={(e) => setRecipientEmail(e.target.value)}
                          dir="ltr"
                        />
                      </div>
                      <div className="bg-muted/50 p-3 rounded-lg text-sm space-y-1">
                        <p><strong>סיכום הדו״ח:</strong></p>
                        <p>• בודק: {session.testerName}</p>
                        <p>• התקדמות: {progress.percentage}%</p>
                        <p>• עברו: {progress.passed} | נכשלו: {progress.failed} | חסומים: {progress.blocked}</p>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowEmailDialog(false)}>ביטול</Button>
                      <Button 
                        onClick={handleSendEmailReport} 
                        disabled={isSendingEmail}
                        className="gap-2"
                      >
                        {isSendingEmail ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            שולח...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            שלח דו״ח
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
                  <DialogTrigger asChild>
                    <Button variant="destructive" size="sm" className="gap-1">
                      <RotateCcw className="h-4 w-4" />
                      Reset
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Reset QA Session?</DialogTitle>
                      <DialogDescription>
                        This will delete all test results, comments, and confirmations. This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowResetDialog(false)}>Cancel</Button>
                      <Button variant="destructive" onClick={handleReset}>Reset Session</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{progress.percentage}% ({progress.tested}/{progress.total})</span>
              </div>
              <Progress value={progress.percentage} className="h-2" />
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span className="text-jade">✓ Passed: {progress.passed}</span>
                <span className="text-destructive">✗ Failed: {progress.failed}</span>
                <span className="text-amber-500">⚠ Blocked: {progress.blocked}</span>
              </div>
            </div>
          </div>
        </header>

        <main className="container py-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left: Module List */}
            <div className="lg:col-span-2 space-y-4">
              {/* Category Tabs */}
              <Tabs value={activeCategory} onValueChange={setActiveCategory}>
                <TabsList className="flex-wrap h-auto gap-1">
                  {categories.map(cat => (
                    <TabsTrigger key={cat.id} value={cat.id} className="text-xs">
                      {cat.labelHe}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>

              {/* Next Module Suggestion */}
              {nextModule && (
                <Card className="border-jade/50 bg-jade/5">
                  <CardContent className="py-3">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <Flag className="h-4 w-4 text-jade" />
                        <span className="text-sm font-medium">Next to test:</span>
                        <span className="text-sm">{nextModule.moduleNameHe}</span>
                      </div>
                      <Button size="sm" onClick={() => setSelectedModule(nextModule)} className="gap-1">
                        Start Testing
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Modules List */}
              <Accordion type="single" collapsible className="space-y-2">
                {filteredModules.map((module) => {
                  const statusInfo = statusConfig[module.status];
                  const priorityInfo = priorityConfig[module.priority];
                  
                  return (
                    <AccordionItem key={module.id} value={module.id} className="border rounded-lg px-4">
                      <AccordionTrigger className="hover:no-underline py-3">
                        <div className="flex items-center gap-3 flex-1 text-right">
                          <Badge className={statusInfo.color}>
                            {statusInfo.icon}
                            <span className="mr-1">{statusInfo.labelHe}</span>
                          </Badge>
                          <Badge variant="outline" className={priorityInfo.color}>
                            {priorityInfo.label}
                          </Badge>
                          <span className="font-medium">{module.moduleNameHe}</span>
                          <span className="text-muted-foreground text-sm">({module.moduleName})</span>
                          {module.comments.length > 0 && (
                            <Badge variant="secondary" className="gap-1">
                              <MessageSquare className="h-3 w-3" />
                              {module.comments.length}
                            </Badge>
                          )}
                          {module.followUpRequired && (
                            <Badge variant="outline" className="gap-1 border-amber-500 text-amber-500">
                              <Flag className="h-3 w-3" />
                              Follow-up
                            </Badge>
                          )}
                          {module.confirmedAt && (
                            <CheckCircle2 className="h-4 w-4 text-jade" />
                          )}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pb-4">
                          {/* Module Actions */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(module.path, '_blank')}
                              className="gap-1"
                            >
                              <ExternalLink className="h-3 w-3" />
                              Open Page
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedModule(module)}
                              className="gap-1"
                            >
                              <MessageSquare className="h-3 w-3" />
                              Test & Comment
                            </Button>
                          </div>

                          {/* Status Change */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm text-muted-foreground">Status:</span>
                            {Object.entries(statusConfig).map(([status, config]) => (
                              <Button
                                key={status}
                                variant={module.status === status ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => handleStatusChange(module.id, status as TestStatus)}
                                className="gap-1"
                              >
                                {config.icon}
                                {config.labelHe}
                              </Button>
                            ))}
                          </div>

                          {/* Timestamps */}
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Tested:</span>
                              <span className="mr-2">{formatDateTime(module.testedAt)}</span>
                              {module.testedBy && <span className="text-muted-foreground">by {module.testedBy}</span>}
                            </div>
                            <div>
                              <span className="text-muted-foreground">Confirmed:</span>
                              <span className="mr-2">{formatDateTime(module.confirmedAt)}</span>
                              {module.confirmedBy && <span className="text-muted-foreground">by {module.confirmedBy}</span>}
                            </div>
                          </div>

                          {/* Confirm Button */}
                          {!module.confirmedAt && module.status !== 'not_tested' && (
                            <Button onClick={() => handleConfirm(module.id)} className="gap-2">
                              <CheckCircle2 className="h-4 w-4" />
                              Confirm & Lock (Required to Proceed)
                            </Button>
                          )}

                          {/* Comments */}
                          {module.comments.length > 0 && (
                            <div className="space-y-2">
                              <h4 className="text-sm font-medium">Comments ({module.comments.length})</h4>
                              {module.comments.map((comment) => {
                                const typeInfo = commentTypeConfig[comment.type];
                                return (
                                  <div key={comment.id} className="flex items-start gap-2 p-2 bg-muted/50 rounded-lg">
                                    <Badge className={`${typeInfo.color} shrink-0`}>
                                      {typeInfo.icon}
                                      <span className="mr-1">{typeInfo.label}</span>
                                    </Badge>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm">{comment.text}</p>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {comment.author} • {formatDateTime(comment.createdAt)}
                                      </p>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeComment(module.id, comment.id)}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Follow-up */}
                          {module.followUpRequired && module.followUpNotes && (
                            <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/30">
                              <div className="flex items-center gap-2 text-amber-500 mb-2">
                                <Flag className="h-4 w-4" />
                                <span className="font-medium">Follow-up Required</span>
                                {module.followUpDueDate && (
                                  <Badge variant="outline" className="border-amber-500 text-amber-500">
                                    Due: {module.followUpDueDate}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm">{module.followUpNotes}</p>
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </div>

            {/* Right: Testing Panel */}
            <div className="space-y-4">
              {selectedModule ? (
                <Card className="sticky top-32">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ClipboardCheck className="h-5 w-5 text-jade" />
                      {selectedModule.moduleNameHe}
                    </CardTitle>
                    <CardDescription>{selectedModule.moduleName}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Open Page Button */}
                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      onClick={() => window.open(selectedModule.path, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open {selectedModule.path}
                    </Button>

                    <Separator />

                    {/* Quick Status */}
                    <div className="space-y-2">
                      <Label>Quick Status</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          className="gap-1 border-jade text-jade hover:bg-jade/10"
                          onClick={() => handleStatusChange(selectedModule.id, 'passed')}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Pass
                        </Button>
                        <Button
                          variant="outline"
                          className="gap-1 border-destructive text-destructive hover:bg-destructive/10"
                          onClick={() => handleStatusChange(selectedModule.id, 'failed')}
                        >
                          <XCircle className="h-4 w-4" />
                          Fail
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    {/* Add Comment */}
                    <div className="space-y-2">
                      <Label>Add Comment</Label>
                      <Select value={commentType} onValueChange={(v: any) => setCommentType(v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(commentTypeConfig).map(([type, config]) => (
                            <SelectItem key={type} value={type}>
                              <div className="flex items-center gap-2">
                                {config.icon}
                                {config.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Textarea
                        placeholder="Write your comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        rows={3}
                      />
                      <Button
                        onClick={() => handleAddComment(selectedModule.id)}
                        disabled={!newComment.trim()}
                        className="w-full"
                      >
                        Add Comment
                      </Button>
                    </div>

                    <Separator />

                    {/* Follow-up */}
                    <div className="space-y-2">
                      <Label>Follow-up</Label>
                      <Textarea
                        placeholder="Follow-up notes..."
                        value={followUpNotes}
                        onChange={(e) => setFollowUpNotes(e.target.value)}
                        rows={2}
                      />
                      <Input
                        type="date"
                        value={followUpDueDate}
                        onChange={(e) => setFollowUpDueDate(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleSetFollowUp(selectedModule.id, true)}
                        >
                          Set Follow-up
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => handleSetFollowUp(selectedModule.id, false)}
                        >
                          Clear
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    {/* Confirm & Lock */}
                    {!selectedModule.confirmedAt ? (
                      <Button
                        onClick={() => handleConfirm(selectedModule.id)}
                        className="w-full gap-2 bg-jade hover:bg-jade-dark"
                        disabled={selectedModule.status === 'not_tested'}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Confirm Module (with Timestamp)
                      </Button>
                    ) : (
                      <div className="text-center p-3 bg-jade/10 rounded-lg">
                        <CheckCircle2 className="h-6 w-6 text-jade mx-auto mb-2" />
                        <p className="text-sm font-medium text-jade">Confirmed</p>
                        <p className="text-xs text-muted-foreground">{formatDateTime(selectedModule.confirmedAt)}</p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button variant="ghost" onClick={() => setSelectedModule(null)} className="w-full">
                      Close Panel
                    </Button>
                  </CardFooter>
                </Card>
              ) : (
                <Card>
                  <CardContent className="py-8 text-center">
                    <ClipboardCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Select a module to start testing
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Session Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant="outline">{session.overallStatus}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Started:</span>
                    <span>{formatDateTime(session.startedAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Confirmed:</span>
                    <span>{session.modules.filter(m => m.confirmedAt).length}/{session.modules.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Follow-ups:</span>
                    <span>{session.modules.filter(m => m.followUpRequired).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Comments:</span>
                    <span>{session.modules.reduce((sum, m) => sum + m.comments.length, 0)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
