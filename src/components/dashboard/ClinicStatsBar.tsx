import { memo } from 'react';
import { Link } from 'react-router-dom';
import { Users, Calendar, CheckCircle, Clock, Video } from 'lucide-react';

interface ClinicStatsBarProps {
  totalPatients: number;
  appointmentsToday: number;
  patientsWithConsent: number;
  pendingConsents: number;
  sessionsThisWeek: number;
  isLoading: boolean;
}

interface StatCardProps {
  icon: React.ReactNode;
  value: number | string;
  label: string;
  href: string;
  color: string;
  bgColor: string;
}

const StatCard = memo(function StatCard({ icon, value, label, href, color, bgColor }: StatCardProps) {
  return (
    <Link to={href} className="group">
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-500/50 transition-all duration-200">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-lg ${bgColor} flex items-center justify-center`}>
            <div className={color}>{icon}</div>
          </div>
          <div>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
          </div>
        </div>
      </div>
    </Link>
  );
});

export const ClinicStatsBar = memo(function ClinicStatsBar({
  totalPatients,
  appointmentsToday,
  patientsWithConsent,
  pendingConsents,
  sessionsThisWeek,
  isLoading
}: ClinicStatsBarProps) {
  const stats = [
    {
      icon: <Users className="h-6 w-6" />,
      value: isLoading ? '-' : totalPatients,
      label: 'מטופלים',
      href: '/crm/patients',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-600/20'
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      value: isLoading ? '-' : appointmentsToday,
      label: 'תורים היום',
      href: '/crm/calendar',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100 dark:bg-indigo-600/20'
    },
    {
      icon: <CheckCircle className="h-6 w-6" />,
      value: isLoading ? '-' : patientsWithConsent,
      label: 'חתמו הסכמה',
      href: '/crm/patients',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100 dark:bg-emerald-600/20'
    },
    {
      icon: <Clock className="h-6 w-6" />,
      value: isLoading ? '-' : pendingConsents,
      label: 'ממתינים',
      href: '/crm/patients',
      color: 'text-amber-600',
      bgColor: 'bg-amber-100 dark:bg-amber-600/20'
    },
    {
      icon: <Video className="h-6 w-6" />,
      value: isLoading ? '-' : sessionsThisWeek,
      label: 'טיפולים השבוע',
      href: '/crm/calendar',
      color: 'text-violet-600',
      bgColor: 'bg-violet-100 dark:bg-violet-600/20'
    }
  ];

  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
      <h3 className="text-lg font-semibold text-center mb-4 text-slate-800 dark:text-slate-100">סטטיסטיקות הקליניקה</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>
    </div>
  );
});
