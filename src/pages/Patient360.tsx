import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Home,
  Brain,
  Heart,
  Palmtree,
  Eye,
  User,
  Calendar,
  FileText,
  Loader2,
  X,
  Compass
} from 'lucide-react';
import { motion } from 'framer-motion';
import { usePatients } from '@/hooks/usePatients';
import { usePatientAssessments, useLatestAssessments, AssessmentType, PatientAssessment } from '@/hooks/usePatientAssessments';
import { format } from 'date-fns';

export default function Patient360() {
  const navigate = useNavigate();
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [selectedAssessment, setSelectedAssessment] = useState<PatientAssessment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { data: patients = [], isLoading: patientsLoading } = usePatients();
  const { data: assessments = [], isLoading: assessmentsLoading } = usePatientAssessments(selectedPatientId);
  const { data: latestResults } = useLatestAssessments(selectedPatientId);

  const selectedPatient = patients.find(p => p.id === selectedPatientId);

  const getTypeIcon = (type: AssessmentType) => {
    switch (type) {
      case 'brain': return <Brain className="h-4 w-4 text-violet-500" />;
      case 'body': return <Heart className="h-4 w-4 text-emerald-500" />;
      case 'retreat': return <Palmtree className="h-4 w-4 text-amber-500" />;
      case 'health_compass': return <Compass className="h-4 w-4 text-rose-500" />;
    }
  };

  const getTypeLabel = (type: AssessmentType) => {
    switch (type) {
      case 'brain': return 'Brain';
      case 'body': return 'Full Body';
      case 'retreat': return 'Retreat';
      case 'health_compass': return 'Health Compass';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'saved': return <Badge variant="default" className="bg-emerald-500">✅ נשמר</Badge>;
      case 'sent': return <Badge variant="secondary" className="bg-blue-500 text-white">📨 נשלח</Badge>;
      case 'pending': return <Badge variant="outline">⏳ ממתין</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'dd/MM/yyyy');
    } catch {
      return dateStr;
    }
  };

  const openAssessmentDetails = (assessment: PatientAssessment) => {
    setSelectedAssessment(assessment);
    setIsModalOpen(true);
  };

  const renderAssessmentDetails = (assessment: PatientAssessment) => {
    const details = assessment.details as Record<string, unknown> | null;
    
    if (!details || Object.keys(details).length === 0) {
      return <p className="text-muted-foreground">אין פרטים נוספים</p>;
    }

    return (
      <div className="space-y-4">
        {/* Score */}
        {assessment.score !== null && (
          <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
            <span className="font-medium">ציון:</span>
            <Badge variant="secondary" className="text-lg">{assessment.score}</Badge>
          </div>
        )}

        {/* Summary */}
        {assessment.summary && (
          <div className="p-3 bg-muted/50 rounded-lg">
            <span className="font-medium block mb-1">סיכום:</span>
            <p className="text-sm">{assessment.summary}</p>
          </div>
        )}

        {/* Detailed info based on assessment type */}
        {assessment.assessment_type === 'brain' && details && (
          <div className="space-y-3">
            {details.ageGroup && (
              <div className="p-3 bg-violet-500/10 rounded-lg">
                <span className="font-medium">קבוצת גיל:</span> {String(details.ageGroup)}
              </div>
            )}
            {Array.isArray(details.selectedSymptoms) && details.selectedSymptoms.length > 0 && (
              <div className="p-3 bg-violet-500/10 rounded-lg">
                <span className="font-medium block mb-2">סימפטומים:</span>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {details.selectedSymptoms.map((s: unknown, i: number) => (
                    <li key={i}>{String(s)}</li>
                  ))}
                </ul>
              </div>
            )}
            {Array.isArray(details.points) && details.points.length > 0 && (
              <div className="p-3 bg-violet-500/10 rounded-lg">
                <span className="font-medium">נקודות:</span>
                <p className="text-sm">{details.points.join(', ')}</p>
              </div>
            )}
            {Array.isArray(details.formulas) && details.formulas.length > 0 && (
              <div className="p-3 bg-violet-500/10 rounded-lg">
                <span className="font-medium">פורמולות:</span>
                <p className="text-sm">{details.formulas.join(', ')}</p>
              </div>
            )}
          </div>
        )}

        {assessment.assessment_type === 'body' && details && (
          <div className="space-y-3">
            {Array.isArray(details.selectedSymptoms) && details.selectedSymptoms.length > 0 && (
              <div className="p-3 bg-emerald-500/10 rounded-lg">
                <span className="font-medium block mb-2">מדדי גוף נבחרים:</span>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {details.selectedSymptoms.map((s: unknown, i: number) => (
                    <li key={i}>{String(s)}</li>
                  ))}
                </ul>
              </div>
            )}
            {typeof details.protocol === 'string' && (
              <div className="p-3 bg-emerald-500/10 rounded-lg">
                <span className="font-medium block mb-2">פרוטוקול:</span>
                <pre className="text-xs whitespace-pre-wrap font-mono bg-background p-2 rounded max-h-48 overflow-y-auto">
                  {details.protocol}
                </pre>
              </div>
            )}
          </div>
        )}

        {assessment.assessment_type === 'retreat' && details && (
          <div className="space-y-3">
            {typeof details.answeredYes === 'number' && typeof details.totalQuestions === 'number' && (
              <div className="p-3 bg-amber-500/10 rounded-lg">
                <span className="font-medium">תשובות חיוביות:</span> {details.answeredYes} / {details.totalQuestions}
              </div>
            )}
            {Array.isArray(details.collectedTCM) && details.collectedTCM.length > 0 && (
              <div className="p-3 bg-amber-500/10 rounded-lg">
                <span className="font-medium block mb-2">דפוסי TCM שזוהו:</span>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {details.collectedTCM.map((item: unknown, i: number) => {
                    const tcmItem = item as { q?: string; pts?: string; herb?: string };
                    return (
                      <div key={i} className="text-xs p-2 bg-background rounded">
                        <p className="font-medium">{tcmItem.q}</p>
                        <p className="text-muted-foreground">נקודות: {tcmItem.pts}</p>
                        <p className="text-muted-foreground">פורמולה: {tcmItem.herb}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {assessment.assessment_type === 'health_compass' && details && (
          <div className="space-y-3">
            {typeof details.version === 'string' && (
              <div className="p-3 bg-rose-500/10 rounded-lg">
                <span className="font-medium">גרסה:</span> {details.version}
              </div>
            )}
            {typeof details.completedAt === 'string' && (
              <div className="p-3 bg-rose-500/10 rounded-lg">
                <span className="font-medium">הושלם ב:</span> {formatDate(details.completedAt)}
              </div>
            )}
            {details.answers && typeof details.answers === 'object' && (
              <div className="p-3 bg-rose-500/10 rounded-lg">
                <span className="font-medium block mb-2">תשובות השאלון:</span>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {Object.entries(details.answers as Record<string, unknown>).map(([key, value], i) => (
                    <div key={i} className="text-xs p-2 bg-background rounded">
                      <p className="font-medium text-muted-foreground">שאלה {key}:</p>
                      <p>{String(value)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>Patient 360° Health Record | תיק מטופל</title>
        <meta name="description" content="Comprehensive patient health record with all assessments and protocols" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-8 px-4" dir="rtl">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
                <FileText className="h-8 w-8 text-primary" />
                תיק מטופל (Patient 360°)
              </h1>
              <p className="text-muted-foreground">סיכום כלל האבחונים והמדדים הקליניים</p>
            </div>
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="gap-2"
            >
              <Home className="h-4 w-4" />
              חזרה לדשבורד
            </Button>
          </div>

          {/* Patient Selector */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <User className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">בחר מטופל:</span>
                {patientsLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                    <SelectTrigger className="w-72">
                      <SelectValue placeholder="בחר מטופל..." />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map(patient => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.full_name} {patient.phone ? `(${patient.phone})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </CardContent>
          </Card>

          {selectedPatientId ? (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Brain Health Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className={`h-full ${latestResults?.brain ? 'border-violet-500/30 bg-violet-500/5' : 'opacity-60'}`}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Brain className="h-5 w-5 text-violet-500" />
                        🧠 בריאות המוח (אחרון)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {latestResults?.brain ? (
                        <>
                          <p className="text-2xl font-bold text-violet-600">
                            Score: {latestResults.brain.score ?? 'N/A'}/100
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-2">
                            <Calendar className="h-3 w-3" />
                            עודכן: {formatDate(latestResults.brain.created_at)}
                          </p>
                          {latestResults.brain.summary && (
                            <p className="text-sm mt-1">הערה: {latestResults.brain.summary}</p>
                          )}
                        </>
                      ) : (
                        <p className="text-muted-foreground">לא בוצע אבחון</p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Body Health Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className={`h-full ${latestResults?.body ? 'border-emerald-500/30 bg-emerald-500/5' : 'opacity-60'}`}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Heart className="h-5 w-5 text-emerald-500" />
                        🧘 גוף מלא (אחרון)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {latestResults?.body ? (
                        <>
                          <p className="text-2xl font-bold text-emerald-600">
                            {latestResults.body.score ?? 15} המדדים
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-2">
                            <Calendar className="h-3 w-3" />
                            עודכן: {formatDate(latestResults.body.created_at)}
                          </p>
                          {latestResults.body.summary && (
                            <p className="text-sm mt-1">מיקוד: {latestResults.body.summary}</p>
                          )}
                        </>
                      ) : (
                        <p className="text-muted-foreground">לא בוצע אבחון</p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Retreat Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className={`h-full ${latestResults?.retreat ? 'border-amber-500/30 bg-amber-500/5' : 'opacity-60'}`}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Palmtree className="h-5 w-5 text-amber-500" />
                        🏝️ ריטריט מומלץ
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {latestResults?.retreat ? (
                        <>
                          <p className="text-2xl font-bold text-amber-600">
                            {latestResults.retreat.summary ?? 'Matched'}
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-2">
                            <Calendar className="h-3 w-3" />
                            הותאם: {formatDate(latestResults.retreat.created_at)}
                          </p>
                        </>
                      ) : (
                        <p className="text-muted-foreground">לא בוצע התאמה</p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Health Compass Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Card className={`h-full ${latestResults?.health_compass ? 'border-rose-500/30 bg-rose-500/5' : 'opacity-60'}`}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Compass className="h-5 w-5 text-rose-500" />
                        🧭 המצפן הבריאותי
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {latestResults?.health_compass ? (
                        <>
                          <p className="text-2xl font-bold text-rose-600">
                            {latestResults.health_compass.summary ?? 'הושלם'}
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-2">
                            <Calendar className="h-3 w-3" />
                            עודכן: {formatDate(latestResults.health_compass.created_at)}
                          </p>
                        </>
                      ) : (
                        <p className="text-muted-foreground">לא מולא שאלון</p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* History Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    היסטוריית אבחונים
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {assessmentsLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : assessments.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>תאריך</TableHead>
                          <TableHead>סוג אבחון</TableHead>
                          <TableHead>תוצאות עיקריות</TableHead>
                          <TableHead>סטטוס</TableHead>
                          <TableHead>פעולות</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {assessments.map(assessment => (
                          <TableRow key={assessment.id}>
                            <TableCell className="font-medium">
                              {formatDate(assessment.created_at)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getTypeIcon(assessment.assessment_type)}
                                {getTypeLabel(assessment.assessment_type)}
                              </div>
                            </TableCell>
                            <TableCell>{assessment.summary || 'No summary'}</TableCell>
                            <TableCell>{getStatusBadge(assessment.status)}</TableCell>
                            <TableCell>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="gap-1"
                                onClick={() => openAssessmentDetails(assessment)}
                              >
                                <Eye className="h-3 w-3" />
                                צפה
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>אין אבחונים עדיין למטופל זה</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <User className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">בחר מטופל כדי לצפות בתיק שלו</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Assessment Details Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto" dir="rtl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedAssessment && getTypeIcon(selectedAssessment.assessment_type)}
                פרטי אבחון - {selectedAssessment && getTypeLabel(selectedAssessment.assessment_type)}
              </DialogTitle>
            </DialogHeader>
            
            {selectedAssessment && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(selectedAssessment.created_at)}
                  </span>
                  {getStatusBadge(selectedAssessment.status)}
                </div>
                
                {renderAssessmentDetails(selectedAssessment)}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
