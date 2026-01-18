import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Download, Package, ArrowLeft, FileArchive, 
  Calendar, Users, Brain, Stethoscope, BookOpen,
  Heart, Shield, Sparkles, Activity, Sun,
  Calculator, Smartphone, TestTube, Settings,
  Music, Code, Lock, Contact, TreePine,
  Palette, Pill, Eye, Target, Leaf, ClipboardCheck
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import JSZip from 'jszip';
import { format } from 'date-fns';

// Module definitions from the Excel file
const MODULES = [
  // Clinical & Core Modules
  { 
    id: 'whole-gate', 
    name: 'Whole Gate Module', 
    nameHe: 'מודול שער מלא',
    icon: TreePine, 
    category: 'core',
    description: 'Complete gate entry and navigation module',
    color: 'emerald'
  },
  { 
    id: 'pulse-gallery', 
    name: 'Pulse Gallery', 
    nameHe: 'גלריית דופק',
    icon: Activity, 
    category: 'clinical',
    description: 'Pulse diagnosis image gallery and references',
    color: 'rose'
  },
  { 
    id: 'video-session', 
    name: 'Video Session', 
    nameHe: 'פגישת וידאו',
    icon: Calendar, 
    category: 'crm',
    description: 'Video session recording and management',
    color: 'blue'
  },
  { 
    id: 'contact', 
    name: 'Contact Module', 
    nameHe: 'מודול יצירת קשר',
    icon: Contact, 
    category: 'core',
    description: 'Contact forms and communication',
    color: 'slate'
  },
  { 
    id: 'retreat-quiz', 
    name: 'Retreat Quiz', 
    nameHe: 'שאלון ריטריט',
    icon: ClipboardCheck, 
    category: 'assessment',
    description: 'Retreat assessment questionnaire',
    color: 'amber'
  },
  { 
    id: 'invite', 
    name: 'Professional Invite', 
    nameHe: 'הזמנה מקצועית',
    icon: Users, 
    category: 'core',
    description: 'Professional invitation system',
    color: 'indigo'
  },
  { 
    id: 'caf-clinical-browser', 
    name: 'CAF Clinical Browser', 
    nameHe: 'דפדפן קליני CAF',
    icon: Stethoscope, 
    category: 'clinical',
    description: 'Clinical assessment framework browser',
    color: 'teal'
  },
  
  // Questionnaires & Assessments
  { 
    id: 'vitality-longevity', 
    name: 'Vitality & Longevity Assessment', 
    nameHe: 'הערכת חיוניות ואריכות ימים',
    icon: Heart, 
    category: 'assessment',
    description: 'Comprehensive vitality assessment questionnaire',
    color: 'red'
  },
  { 
    id: 'patient-questionnaire', 
    name: 'Patient Questionnaire', 
    nameHe: 'שאלון מטופל',
    icon: ClipboardCheck, 
    category: 'assessment',
    description: 'General patient intake questionnaire',
    color: 'cyan'
  },
  { 
    id: 'admin', 
    name: 'Admin Module', 
    nameHe: 'מודול ניהול',
    icon: Settings, 
    category: 'admin',
    description: 'Administration and management tools',
    color: 'gray'
  },
  { 
    id: 'encyclopedia', 
    name: 'Encyclopedia', 
    nameHe: 'אנציקלופדיה',
    icon: BookOpen, 
    category: 'knowledge',
    description: 'TCM knowledge encyclopedia',
    color: 'purple'
  },
  { 
    id: 'internal-climate', 
    name: 'Internal Climate Control', 
    nameHe: 'שליטה באקלים פנימי',
    icon: Sun, 
    category: 'assessment',
    description: 'Internal climate assessment questionnaire',
    color: 'orange'
  },
  { 
    id: 'balance-strengthening', 
    name: 'Balance & Strengthening', 
    nameHe: 'איזון וחיזוק',
    icon: Shield, 
    category: 'assessment',
    description: 'Balance and strengthening assessment',
    color: 'green'
  },
  { 
    id: 'golden-age-vitality', 
    name: 'Golden Age Vitality', 
    nameHe: 'חיוניות גיל הזהב',
    icon: Sparkles, 
    category: 'assessment',
    description: 'Senior vitality assessment questionnaire',
    color: 'yellow'
  },
  { 
    id: 'longevity-dignity', 
    name: 'Longevity & Dignity', 
    nameHe: 'אריכות ימים וכבוד',
    icon: Heart, 
    category: 'assessment',
    description: 'Longevity and quality of life assessment',
    color: 'pink'
  },
  { 
    id: 'nourishing-life', 
    name: 'Nourishing Life', 
    nameHe: 'הזנת חיים',
    icon: Leaf, 
    category: 'assessment',
    description: 'Yang Sheng lifestyle assessment',
    color: 'lime'
  },
  { 
    id: 'mental-clarity', 
    name: 'Mental Clarity', 
    nameHe: 'בהירות מנטלית',
    icon: Brain, 
    category: 'assessment',
    description: 'Cognitive and mental clarity assessment',
    color: 'violet'
  },
  { 
    id: 'pain-rehabilitation', 
    name: 'Pain Rehabilitation', 
    nameHe: 'שיקום כאב',
    icon: Activity, 
    category: 'assessment',
    description: 'Pain management and rehabilitation',
    color: 'red'
  },
  { 
    id: 'immune-shield', 
    name: 'Immune Shield', 
    nameHe: 'מגן חיסוני',
    icon: Shield, 
    category: 'assessment',
    description: 'Immune system assessment',
    color: 'blue'
  },
  { 
    id: 'zang-fu-syndromes', 
    name: 'Zang Fu Syndromes', 
    nameHe: 'תסמונות זאנג פו',
    icon: Target, 
    category: 'clinical',
    description: 'Organ syndrome differentiation',
    color: 'emerald'
  },
  { 
    id: 'pulse-tongue-diagnosis', 
    name: 'Pulse & Tongue Diagnosis', 
    nameHe: 'אבחון דופק ולשון',
    icon: Eye, 
    category: 'clinical',
    description: 'Comprehensive pulse and tongue diagnosis',
    color: 'rose'
  },
  { 
    id: 'acupuncture-points', 
    name: 'Acupuncture Points', 
    nameHe: 'נקודות דיקור',
    icon: Palette, 
    category: 'clinical',
    description: 'Acupuncture point reference and selection',
    color: 'amber'
  },
  
  // ROI & Business Tools
  { 
    id: 'roi-simulator', 
    name: 'ROI Simulator', 
    nameHe: 'סימולטור החזר השקעה',
    icon: Calculator, 
    category: 'business',
    description: 'Return on investment calculator',
    color: 'cyan'
  },
  { 
    id: 'therapist-roi', 
    name: 'Therapist ROI', 
    nameHe: 'החזר השקעה למטפל',
    icon: Calculator, 
    category: 'business',
    description: 'Therapist-specific ROI calculations',
    color: 'teal'
  },
  { 
    id: 'simulation-calculators', 
    name: 'Simulation Calculators', 
    nameHe: 'מחשבוני סימולציה',
    icon: Calculator, 
    category: 'business',
    description: 'Various business simulation tools',
    color: 'indigo'
  },
  
  // Testing & Developer Tools
  { 
    id: 'ui-smoke-test', 
    name: 'UI Smoke Test', 
    nameHe: 'בדיקת עשן ממשק',
    icon: TestTube, 
    category: 'dev',
    description: 'UI component testing module',
    color: 'gray'
  },
  { 
    id: 'music-test', 
    name: 'Music Test', 
    nameHe: 'בדיקת מוזיקה',
    icon: Music, 
    category: 'dev',
    description: 'Audio and music player testing',
    color: 'purple'
  },
  { 
    id: 'private-developer', 
    name: 'Private Developer', 
    nameHe: 'מפתח פרטי',
    icon: Code, 
    category: 'dev',
    description: 'Developer tools and utilities',
    color: 'slate'
  },
  { 
    id: 'auth', 
    name: 'Authentication', 
    nameHe: 'אימות',
    icon: Lock, 
    category: 'core',
    description: 'User authentication and authorization',
    color: 'red'
  },
  { 
    id: 'install', 
    name: 'Install App', 
    nameHe: 'התקנת אפליקציה',
    icon: Smartphone, 
    category: 'core',
    description: 'PWA installation module',
    color: 'green'
  }
];

// Category definitions
const CATEGORIES = [
  { id: 'core', name: 'Core Modules', nameHe: 'מודולים ליבתיים', color: 'emerald' },
  { id: 'clinical', name: 'Clinical Tools', nameHe: 'כלים קליניים', color: 'teal' },
  { id: 'crm', name: 'CRM & Sessions', nameHe: 'CRM ופגישות', color: 'blue' },
  { id: 'assessment', name: 'Assessments', nameHe: 'הערכות', color: 'amber' },
  { id: 'knowledge', name: 'Knowledge Base', nameHe: 'מאגר ידע', color: 'purple' },
  { id: 'business', name: 'Business Tools', nameHe: 'כלי עסקים', color: 'cyan' },
  { id: 'admin', name: 'Administration', nameHe: 'ניהול', color: 'gray' },
  { id: 'dev', name: 'Developer Tools', nameHe: 'כלי פיתוח', color: 'slate' }
];

// Get color classes based on module color
function getColorClasses(color: string) {
  const colorMap: Record<string, { bg: string; border: string; text: string; hover: string }> = {
    emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-500', hover: 'hover:border-emerald-500/50' },
    rose: { bg: 'bg-rose-500/10', border: 'border-rose-500/30', text: 'text-rose-500', hover: 'hover:border-rose-500/50' },
    blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-500', hover: 'hover:border-blue-500/50' },
    slate: { bg: 'bg-slate-500/10', border: 'border-slate-500/30', text: 'text-slate-500', hover: 'hover:border-slate-500/50' },
    amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-500', hover: 'hover:border-amber-500/50' },
    indigo: { bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', text: 'text-indigo-500', hover: 'hover:border-indigo-500/50' },
    teal: { bg: 'bg-teal-500/10', border: 'border-teal-500/30', text: 'text-teal-500', hover: 'hover:border-teal-500/50' },
    red: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-500', hover: 'hover:border-red-500/50' },
    cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-500', hover: 'hover:border-cyan-500/50' },
    gray: { bg: 'bg-gray-500/10', border: 'border-gray-500/30', text: 'text-gray-500', hover: 'hover:border-gray-500/50' },
    purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-500', hover: 'hover:border-purple-500/50' },
    orange: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-500', hover: 'hover:border-orange-500/50' },
    green: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-500', hover: 'hover:border-green-500/50' },
    yellow: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-500', hover: 'hover:border-yellow-500/50' },
    pink: { bg: 'bg-pink-500/10', border: 'border-pink-500/30', text: 'text-pink-500', hover: 'hover:border-pink-500/50' },
    lime: { bg: 'bg-lime-500/10', border: 'border-lime-500/30', text: 'text-lime-500', hover: 'hover:border-lime-500/50' },
    violet: { bg: 'bg-violet-500/10', border: 'border-violet-500/30', text: 'text-violet-500', hover: 'hover:border-violet-500/50' },
  };
  return colorMap[color] || colorMap.gray;
}

// Download module as ZIP
async function downloadModule(module: typeof MODULES[0]) {
  toast.loading(`Preparing ${module.name}...`, { id: `download-${module.id}` });
  
  try {
    const zip = new JSZip();
    
    // Create README
    const readme = `# ${module.name}
## ${module.nameHe}

**Category:** ${CATEGORIES.find(c => c.id === module.category)?.name || module.category}
**Description:** ${module.description}
**Generated:** ${new Date().toISOString()}

## Overview
This module is part of the TCM Clinic Management System.

## Files Included
- README.md (this file)
- MODULE_INFO.json
- IMPLEMENTATION_NOTES.md

## Implementation
Please refer to the main project repository for the complete source code.

---
*Generated by TCM Clinic Module Export System*
`;
    
    zip.file('README.md', readme);
    
    // Create module info JSON
    const moduleInfo = {
      id: module.id,
      name: module.name,
      nameHe: module.nameHe,
      category: module.category,
      description: module.description,
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    };
    zip.file('MODULE_INFO.json', JSON.stringify(moduleInfo, null, 2));
    
    // Create implementation notes
    const implNotes = `# Implementation Notes for ${module.name}

## Dependencies
- React 18+
- TypeScript 5+
- Tailwind CSS
- Shadcn/UI Components
- Supabase (Backend)
- React Query (Data fetching)
- Framer Motion (Animations)

## Database Tables
Refer to DATABASE_SCHEMA.md in the main export for table structures.

## Integration Points
- Authentication: Uses Supabase Auth
- Data Storage: Supabase PostgreSQL
- File Storage: Supabase Storage
- State Management: React Query + Context

## Notes
- Ensure all RLS policies are configured
- Check environment variables are set
- Test with sample data before production use
`;
    zip.file('IMPLEMENTATION_NOTES.md', implNotes);
    
    // Generate ZIP
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${module.id}-module-${format(new Date(), 'yyyy-MM-dd')}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success(`${module.name} downloaded successfully!`, { id: `download-${module.id}` });
  } catch (error) {
    console.error('Download error:', error);
    toast.error(`Failed to download ${module.name}`, { id: `download-${module.id}` });
  }
}

// Download all modules as one ZIP
async function downloadAllModules() {
  toast.loading('Preparing all modules...', { id: 'download-all' });
  
  try {
    const zip = new JSZip();
    
    // Create main README
    const mainReadme = `# TCM Clinic - Complete Module Export
**Generated:** ${new Date().toISOString()}
**Total Modules:** ${MODULES.length}

## Categories
${CATEGORIES.map(cat => {
  const count = MODULES.filter(m => m.category === cat.id).length;
  return `- **${cat.name}** (${cat.nameHe}): ${count} modules`;
}).join('\n')}

## Modules List
${MODULES.map((m, i) => `${i + 1}. ${m.name} - ${m.nameHe}`).join('\n')}

---
*TCM Clinic Module Export System*
`;
    zip.file('README.md', mainReadme);
    
    // Create module list Excel-compatible CSV
    const csvContent = [
      '\ufeff' + 'Module ID,Name (EN),Name (HE),Category,Description',
      ...MODULES.map(m => 
        `"${m.id}","${m.name}","${m.nameHe}","${m.category}","${m.description}"`
      )
    ].join('\n');
    zip.file('MODULES_LIST.csv', csvContent);
    
    // Add each module as a folder
    for (const mod of MODULES) {
      const folder = zip.folder(mod.id);
      if (folder) {
        folder.file('MODULE_INFO.json', JSON.stringify({
          id: mod.id,
          name: mod.name,
          nameHe: mod.nameHe,
          category: mod.category,
          description: mod.description
        }, null, 2));
        folder.file('README.md', `# ${mod.name}\n${mod.description}`);
      }
    }
    
    // Generate ZIP
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tcm-clinic-all-modules-${format(new Date(), 'yyyy-MM-dd')}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success(`All ${MODULES.length} modules downloaded!`, { id: 'download-all' });
  } catch (error) {
    console.error('Download error:', error);
    toast.error('Failed to download modules', { id: 'download-all' });
  }
}

export default function ModuleDownloads() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const filteredModules = selectedCategory 
    ? MODULES.filter(m => m.category === selectedCategory)
    : MODULES;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <Link to="/knowledge-registry">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Package className="h-8 w-8 text-primary" />
                Module Downloads
              </h1>
              <p className="text-muted-foreground mt-1">
                הורדת מודולים | Download all system modules as ZIP files
              </p>
            </div>
          </div>
          
          <Button onClick={downloadAllModules} size="lg" className="gap-2">
            <FileArchive className="h-5 w-5" />
            Download All ({MODULES.length})
          </Button>
        </motion.div>

        {/* Category Filter */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-2 mb-6"
        >
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            All ({MODULES.length})
          </Button>
          {CATEGORIES.map(cat => {
            const count = MODULES.filter(m => m.category === cat.id).length;
            return (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.name} ({count})
              </Button>
            );
          })}
        </motion.div>

        {/* Stats */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <Card className="border-primary/20">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-primary">{MODULES.length}</p>
              <p className="text-sm text-muted-foreground">Total Modules</p>
            </CardContent>
          </Card>
          <Card className="border-emerald-500/20">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-emerald-500">{CATEGORIES.length}</p>
              <p className="text-sm text-muted-foreground">Categories</p>
            </CardContent>
          </Card>
          <Card className="border-amber-500/20">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-amber-500">
                {MODULES.filter(m => m.category === 'assessment').length}
              </p>
              <p className="text-sm text-muted-foreground">Assessments</p>
            </CardContent>
          </Card>
          <Card className="border-teal-500/20">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-teal-500">
                {MODULES.filter(m => m.category === 'clinical').length}
              </p>
              <p className="text-sm text-muted-foreground">Clinical Tools</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Module Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredModules.map((module, index) => {
            const colors = getColorClasses(module.color);
            const Icon = module.icon;
            const category = CATEGORIES.find(c => c.id === module.category);
            
            return (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <Card 
                  className={`h-full ${colors.border} ${colors.hover} transition-all duration-300 hover:shadow-lg cursor-pointer group`}
                  onClick={() => downloadModule(module)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center`}>
                        <Icon className={`h-5 w-5 ${colors.text}`} />
                      </div>
                      <Badge variant="secondary" className="text-[10px]">
                        {category?.name || module.category}
                      </Badge>
                    </div>
                    <CardTitle className="text-sm mt-3 flex items-center gap-2">
                      {module.name}
                      <Download className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
                    </CardTitle>
                    <CardDescription className="text-xs text-right" dir="rtl">
                      {module.nameHe}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {module.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center text-sm text-muted-foreground"
        >
          <p>Click any module box to download it as a ZIP file</p>
          <p className="mt-1">Or use "Download All" to get everything in one archive</p>
        </motion.div>
      </div>
    </div>
  );
}
