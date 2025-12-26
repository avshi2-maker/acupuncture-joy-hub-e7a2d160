import { useLocation, Link } from 'react-router-dom';
import { Home, ChevronRight } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

// Route configuration for breadcrumb labels
const routeLabels: Record<string, string> = {
  'crm': 'CRM Dashboard',
  'calendar': 'Calendar',
  'patients': 'Patients',
  'rooms': 'Rooms',
  'staff': 'Staff',
  'clinics': 'Clinics',
  'settings': 'Settings',
  'new': 'New Patient',
  'edit': 'Edit',
  'visits': 'Visits',
};

// Helper to generate breadcrumb items from path
function generateBreadcrumbs(pathname: string) {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: { label: string; path: string; isLast: boolean }[] = [];

  // Always start with Dashboard
  breadcrumbs.push({
    label: 'Dashboard',
    path: '/dashboard',
    isLast: false,
  });

  // Build path progressively
  let currentPath = '';
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLast = index === segments.length - 1;
    
    // Skip the first 'crm' segment as we'll show "CRM Dashboard" instead
    if (segment === 'crm' && index === 0) {
      breadcrumbs.push({
        label: 'CRM',
        path: '/crm',
        isLast: isLast,
      });
      return;
    }

    // Check if it's a UUID (patient detail page)
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment);
    
    if (isUUID) {
      breadcrumbs.push({
        label: 'Patient Details',
        path: currentPath,
        isLast: isLast,
      });
    } else {
      const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
      breadcrumbs.push({
        label,
        path: currentPath,
        isLast: isLast,
      });
    }
  });

  return breadcrumbs;
}

export function CRMBreadcrumb() {
  const location = useLocation();
  const breadcrumbs = generateBreadcrumbs(location.pathname);

  // Don't show breadcrumbs on main CRM dashboard
  if (location.pathname === '/crm') {
    return null;
  }

  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        {breadcrumbs.map((crumb, index) => (
          <BreadcrumbItem key={crumb.path}>
            {index > 0 && <BreadcrumbSeparator />}
            {crumb.isLast ? (
              <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
            ) : (
              <BreadcrumbLink asChild>
                <Link 
                  to={crumb.path}
                  className="flex items-center gap-1"
                >
                  {index === 0 && <Home className="h-3 w-3" />}
                  {crumb.label}
                </Link>
              </BreadcrumbLink>
            )}
          </BreadcrumbItem>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
