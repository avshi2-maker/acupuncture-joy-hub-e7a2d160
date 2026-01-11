import { memo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  Video, 
  Brain, 
  Database, 
  ClipboardCheck,
  UserPlus,
  FileCheck,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuickAction {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  color: string;
  bgColor: string;
  primary?: boolean;
}

interface QuickActionsGridProps {
  disclaimerSigned?: boolean;
  hasAppointmentWithConsent?: boolean;
}

export const QuickActionsGrid = memo(function QuickActionsGrid({
  disclaimerSigned,
  hasAppointmentWithConsent
}: QuickActionsGridProps) {
  const patientActions: QuickAction[] = [
    {
      icon: <UserPlus className="h-6 w-6" />,
      title: 'הוספת מטופל',
      description: 'רישום מטופל חדש במערכת',
      href: '/crm/patients/new',
      color: 'text-jade',
      bgColor: 'bg-jade/10 group-hover:bg-jade/20',
      primary: true
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      title: 'קביעת תור',
      description: 'תיאום פגישה חדשה',
      href: '/crm/calendar',
      color: 'text-blue-500',
      bgColor: 'bg-blue-100 dark:bg-blue-500/20 group-hover:bg-blue-200 dark:group-hover:bg-blue-500/30'
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: 'רשימת מטופלים',
      description: 'צפייה וניהול מטופלים',
      href: '/crm/patients',
      color: 'text-purple-500',
      bgColor: 'bg-purple-100 dark:bg-purple-500/20 group-hover:bg-purple-200 dark:group-hover:bg-purple-500/30'
    },
    {
      icon: <FileCheck className="h-6 w-6" />,
      title: 'טפסי הסכמה',
      description: 'ניהול הסכמות מטופלים',
      href: '/crm/patients',
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-100 dark:bg-emerald-500/20 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-500/30'
    }
  ];

  const sessionActions: QuickAction[] = [
    {
      icon: <Video className="h-6 w-6" />,
      title: 'פגישת וידאו',
      description: 'טיפול מרחוק עם וידאו',
      href: '/video-session',
      color: 'text-rose-500',
      bgColor: 'bg-rose-100 dark:bg-rose-500/20 group-hover:bg-rose-200 dark:group-hover:bg-rose-500/30',
      primary: hasAppointmentWithConsent
    },
    {
      icon: <Brain className="h-6 w-6" />,
      title: 'טיפול AI',
      description: 'ייעוץ עם בינה מלאכותית',
      href: '/tcm-brain',
      color: 'text-amber-500',
      bgColor: 'bg-amber-100 dark:bg-amber-500/20 group-hover:bg-amber-200 dark:group-hover:bg-amber-500/30'
    },
    {
      icon: <Database className="h-6 w-6" />,
      title: 'מאגר ידע',
      description: 'ניהול וחיפוש במאגר',
      href: '/knowledge-registry',
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-100 dark:bg-cyan-500/20 group-hover:bg-cyan-200 dark:group-hover:bg-cyan-500/30'
    },
    {
      icon: <ClipboardCheck className="h-6 w-6" />,
      title: 'פרופיל מטפל',
      description: disclaimerSigned ? 'עריכת פרטים' : 'השלמת רישום',
      href: disclaimerSigned ? '/therapist-profile/edit' : '/therapist-intake',
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-100 dark:bg-indigo-500/20 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-500/30'
    }
  ];

  const ActionCard = ({ action }: { action: QuickAction }) => (
    <Link to={action.href} className="group">
      <div className={`bg-white dark:bg-card rounded-xl p-5 shadow-sm border transition-all duration-200 h-full ${
        action.primary 
          ? 'border-jade ring-2 ring-jade/20 hover:shadow-lg hover:shadow-jade/10' 
          : 'border-border hover:shadow-md hover:border-jade/30'
      }`}>
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-xl ${action.bgColor} flex items-center justify-center transition-colors shrink-0`}>
            <div className={action.color}>{action.icon}</div>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-foreground mb-1 flex items-center gap-2">
              {action.title}
              {action.primary && <span className="text-xs text-jade">מומלץ</span>}
            </h4>
            <p className="text-sm text-muted-foreground">{action.description}</p>
          </div>
          <ArrowLeft className="h-5 w-5 text-muted-foreground group-hover:text-jade transition-colors shrink-0 mt-1" />
        </div>
      </div>
    </Link>
  );

  return (
    <div className="space-y-8">
      {/* Patient Quick Actions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">פעולות מהירות - מטופלים</h3>
          <Button variant="ghost" size="sm" asChild className="text-jade hover:text-jade-dark">
            <Link to="/crm/patients">
              לכל המטופלים
              <ArrowLeft className="h-4 w-4 mr-1" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {patientActions.map((action, index) => (
            <ActionCard key={index} action={action} />
          ))}
        </div>
      </div>

      {/* Session Quick Actions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">פעולות מהירות - טיפולים</h3>
          <Button variant="ghost" size="sm" asChild className="text-jade hover:text-jade-dark">
            <Link to="/crm/calendar">
              ליומן התורים
              <ArrowLeft className="h-4 w-4 mr-1" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {sessionActions.map((action, index) => (
            <ActionCard key={index} action={action} />
          ))}
        </div>
      </div>
    </div>
  );
});
