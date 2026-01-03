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
  Home,
  Brain,
  Heart,
  Palmtree,
  Eye,
  User,
  Calendar,
  FileText
} from 'lucide-react';
import { motion } from 'framer-motion';

interface PatientOption {
  id: string;
  name: string;
  phone: string;
}

interface AssessmentRecord {
  id: string;
  date: string;
  type: 'brain' | 'body' | 'retreat';
  summary: string;
  status: 'saved' | 'sent' | 'pending';
}

// Mock data - will be replaced with real Supabase data
const mockPatients: PatientOption[] = [
  { id: '1', name: 'ישראל ישראלי', phone: '050-1234567' },
  { id: '2', name: 'שרה כהן', phone: '054-9876543' },
  { id: '3', name: 'דוד לוי', phone: '052-1112223' },
];

const mockAssessments: Record<string, AssessmentRecord[]> = {
  '1': [
    { id: 'a1', date: '02/01/2026', type: 'brain', summary: 'Stress High, Focus Low', status: 'saved' },
    { id: 'a2', date: '28/12/2025', type: 'body', summary: 'Insomnia, Gut issues', status: 'saved' },
    { id: 'a3', date: '15/12/2025', type: 'retreat', summary: 'Matched: Thailand (Detox)', status: 'sent' },
  ],
  '2': [
    { id: 'a4', date: '01/01/2026', type: 'brain', summary: 'Anxiety moderate, Sleep issues', status: 'saved' },
    { id: 'a5', date: '20/12/2025', type: 'body', summary: 'Headaches, Fatigue', status: 'saved' },
  ],
  '3': [
    { id: 'a6', date: '30/12/2025', type: 'retreat', summary: 'Matched: Bali (Wellness)', status: 'pending' },
  ],
};

const mockLatestResults: Record<string, { brain?: { score: number; date: string; note: string }; body?: { indicators: number; date: string; focus: string }; retreat?: { match: string; date: string; program: string } }> = {
  '1': {
    brain: { score: 72, date: '02/01/2026', note: 'רמות מתח גבוהות' },
    body: { indicators: 15, date: '28/12/2025', focus: 'בעיות שינה ועיכול' },
    retreat: { match: 'Kamalaya', date: '15/12/2025', program: 'Detox & Restart' },
  },
  '2': {
    brain: { score: 65, date: '01/01/2026', note: 'חרדה מתונה' },
    body: { indicators: 15, date: '20/12/2025', focus: 'כאבי ראש ועייפות' },
  },
  '3': {
    retreat: { match: 'Bali Wellness', date: '30/12/2025', program: 'Holistic Retreat' },
  },
};

export default function Patient360() {
  const navigate = useNavigate();
  const [selectedPatientId, setSelectedPatientId] = useState<string>('1');
  
  const selectedPatient = mockPatients.find(p => p.id === selectedPatientId);
  const assessments = mockAssessments[selectedPatientId] || [];
  const latestResults = mockLatestResults[selectedPatientId] || {};

  const getTypeIcon = (type: 'brain' | 'body' | 'retreat') => {
    switch (type) {
      case 'brain': return <Brain className="h-4 w-4 text-violet-500" />;
      case 'body': return <Heart className="h-4 w-4 text-emerald-500" />;
      case 'retreat': return <Palmtree className="h-4 w-4 text-amber-500" />;
    }
  };

  const getTypeLabel = (type: 'brain' | 'body' | 'retreat') => {
    switch (type) {
      case 'brain': return 'Brain';
      case 'body': return 'Full Body';
      case 'retreat': return 'Retreat';
    }
  };

  const getStatusBadge = (status: 'saved' | 'sent' | 'pending') => {
    switch (status) {
      case 'saved': return <Badge variant="default" className="bg-emerald-500">✅ נשמר</Badge>;
      case 'sent': return <Badge variant="secondary" className="bg-blue-500 text-white">📨 נשלח</Badge>;
      case 'pending': return <Badge variant="outline">⏳ ממתין</Badge>;
    }
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
                <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                  <SelectTrigger className="w-72">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {mockPatients.map(patient => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.name} ({patient.phone})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Brain Health Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className={`h-full ${latestResults.brain ? 'border-violet-500/30 bg-violet-500/5' : 'opacity-60'}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Brain className="h-5 w-5 text-violet-500" />
                    🧠 בריאות המוח (אחרון)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {latestResults.brain ? (
                    <>
                      <p className="text-2xl font-bold text-violet-600">Score: {latestResults.brain.score}/100</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-2">
                        <Calendar className="h-3 w-3" />
                        עודכן: {latestResults.brain.date}
                      </p>
                      <p className="text-sm mt-1">הערה: {latestResults.brain.note}</p>
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
              <Card className={`h-full ${latestResults.body ? 'border-emerald-500/30 bg-emerald-500/5' : 'opacity-60'}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Heart className="h-5 w-5 text-emerald-500" />
                    🧘 גוף מלא (אחרון)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {latestResults.body ? (
                    <>
                      <p className="text-2xl font-bold text-emerald-600">{latestResults.body.indicators} המדדים</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-2">
                        <Calendar className="h-3 w-3" />
                        עודכן: {latestResults.body.date}
                      </p>
                      <p className="text-sm mt-1">מיקוד: {latestResults.body.focus}</p>
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
              <Card className={`h-full ${latestResults.retreat ? 'border-amber-500/30 bg-amber-500/5' : 'opacity-60'}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Palmtree className="h-5 w-5 text-amber-500" />
                    🏝️ ריטריט מומלץ
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {latestResults.retreat ? (
                    <>
                      <p className="text-2xl font-bold text-amber-600">{latestResults.retreat.match}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-2">
                        <Calendar className="h-3 w-3" />
                        הותאם: {latestResults.retreat.date}
                      </p>
                      <p className="text-sm mt-1">תוכנית: {latestResults.retreat.program}</p>
                    </>
                  ) : (
                    <p className="text-muted-foreground">לא בוצע התאמה</p>
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
              {assessments.length > 0 ? (
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
                        <TableCell className="font-medium">{assessment.date}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getTypeIcon(assessment.type)}
                            {getTypeLabel(assessment.type)}
                          </div>
                        </TableCell>
                        <TableCell>{assessment.summary}</TableCell>
                        <TableCell>{getStatusBadge(assessment.status)}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" className="gap-1">
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
        </div>
      </div>
    </>
  );
}
