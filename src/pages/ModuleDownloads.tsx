import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Download, Package, ArrowLeft, FileArchive, 
  Calendar, Users, Brain, Stethoscope, BookOpen,
  Heart, Shield, Sparkles, Activity, Sun,
  Calculator, Smartphone, TestTube, Settings,
  Music, Code, Lock, Contact, TreePine,
  Palette, Pill, Eye, Target, Leaf, ClipboardCheck,
  FileCode, Database, Folder
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import JSZip from 'jszip';
import { format } from 'date-fns';
import { MODULE_FILE_MAPPINGS, getModuleFileCount, type ModuleFileMapping } from '@/utils/moduleFileMappings';

// Icon mapping for modules
const ICON_MAP: Record<string, any> = {
  'whole-gate': TreePine,
  'pulse-gallery': Activity,
  'video-session': Calendar,
  'contact': Contact,
  'retreat-quiz': ClipboardCheck,
  'invite': Users,
  'caf-clinical-browser': Stethoscope,
  'vitality-longevity': Heart,
  'patient-questionnaire': ClipboardCheck,
  'admin': Settings,
  'encyclopedia': BookOpen,
  'internal-climate': Sun,
  'balance-strengthening': Shield,
  'golden-age-vitality': Sparkles,
  'longevity-dignity': Heart,
  'nourishing-life': Leaf,
  'mental-clarity': Brain,
  'pain-rehabilitation': Activity,
  'immune-shield': Shield,
  'zang-fu-syndromes': Target,
  'pulse-tongue-diagnosis': Eye,
  'acupuncture-points': Palette,
  'roi-simulator': Calculator,
  'therapist-roi': Calculator,
  'simulation-calculators': Calculator,
  'ui-smoke-test': TestTube,
  'music-test': Music,
  'private-developer': Code,
  'auth': Lock,
  'install': Smartphone,
  'crm': Users,
  'knowledge-registry': Database,
  'tcm-brain': Brain,
  'clinical-trials': Stethoscope
};

// Color mapping for categories
const CATEGORY_COLORS: Record<string, string> = {
  core: 'emerald',
  clinical: 'teal',
  crm: 'blue',
  assessment: 'amber',
  knowledge: 'purple',
  business: 'cyan',
  admin: 'gray',
  dev: 'slate'
};

// Category definitions
const CATEGORIES = [
  { id: 'core', name: 'Core Modules', nameHe: 'מודולים ליבתיים' },
  { id: 'clinical', name: 'Clinical Tools', nameHe: 'כלים קליניים' },
  { id: 'crm', name: 'CRM & Sessions', nameHe: 'CRM ופגישות' },
  { id: 'assessment', name: 'Assessments', nameHe: 'הערכות' },
  { id: 'knowledge', name: 'Knowledge Base', nameHe: 'מאגר ידע' },
  { id: 'business', name: 'Business Tools', nameHe: 'כלי עסקים' },
  { id: 'admin', name: 'Administration', nameHe: 'ניהול' },
  { id: 'dev', name: 'Developer Tools', nameHe: 'כלי פיתוח' }
];

// Get color classes based on category
function getColorClasses(category: string) {
  const color = CATEGORY_COLORS[category] || 'gray';
  const colorMap: Record<string, { bg: string; border: string; text: string; hover: string }> = {
    emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-500', hover: 'hover:border-emerald-500/50' },
    teal: { bg: 'bg-teal-500/10', border: 'border-teal-500/30', text: 'text-teal-500', hover: 'hover:border-teal-500/50' },
    blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-500', hover: 'hover:border-blue-500/50' },
    amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-500', hover: 'hover:border-amber-500/50' },
    purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-500', hover: 'hover:border-purple-500/50' },
    cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-500', hover: 'hover:border-cyan-500/50' },
    gray: { bg: 'bg-gray-500/10', border: 'border-gray-500/30', text: 'text-gray-500', hover: 'hover:border-gray-500/50' },
    slate: { bg: 'bg-slate-500/10', border: 'border-slate-500/30', text: 'text-slate-500', hover: 'hover:border-slate-500/50' },
  };
  return colorMap[color] || colorMap.gray;
}

/**
 * Generate comprehensive README for a module
 */
function generateModuleReadme(module: ModuleFileMapping): string {
  const fileCount = getModuleFileCount(module);
  const category = CATEGORIES.find(c => c.id === module.category);
  
  return `# ${module.name}
## ${module.nameHe}

**Category:** ${category?.name || module.category}
**Description:** ${module.description}
**Total Files:** ${fileCount}
**Generated:** ${new Date().toISOString()}

---

## 📁 File Structure

### Pages (${module.files.pages.length})
${module.files.pages.length > 0 ? module.files.pages.map(f => `- \`${f}\``).join('\n') : '_No pages_'}

### Components (${module.files.components.length})
${module.files.components.length > 0 ? module.files.components.map(f => `- \`${f}\``).join('\n') : '_No components_'}

### Hooks (${module.files.hooks.length})
${module.files.hooks.length > 0 ? module.files.hooks.map(f => `- \`${f}\``).join('\n') : '_No hooks_'}

### Utilities (${module.files.utils.length})
${module.files.utils.length > 0 ? module.files.utils.map(f => `- \`${f}\``).join('\n') : '_No utilities_'}

### Contexts (${module.files.contexts.length})
${module.files.contexts.length > 0 ? module.files.contexts.map(f => `- \`${f}\``).join('\n') : '_No contexts_'}

### Data Files (${module.files.data.length})
${module.files.data.length > 0 ? module.files.data.map(f => `- \`${f}\``).join('\n') : '_No data files_'}

### Config (${module.files.config.length})
${module.files.config.length > 0 ? module.files.config.map(f => `- \`${f}\``).join('\n') : '_No config files_'}

---

## 🗄️ Database Tables

${module.databaseTables.length > 0 
  ? module.databaseTables.map(t => `- \`${t}\``).join('\n')
  : '_No database tables required_'}

---

## 📦 Dependencies

${module.dependencies.length > 0
  ? module.dependencies.map(d => `- ${d}`).join('\n')
  : '_Standard React/TypeScript dependencies only_'}

---

## 🔧 Installation

1. Copy all files to their respective paths in your project
2. Ensure database tables are created (see DATABASE_SCHEMA.sql)
3. Install dependencies: \`npm install ${module.dependencies.join(' ')}\`
4. Import and use components as needed

---

## 📋 Usage Example

\`\`\`tsx
import { /* Component */ } from '${module.files.pages[0] || './module'}';

// Use in your app
function App() {
  return </* Component */ />;
}
\`\`\`

---

*Generated by TCM Clinic Module Export System*
*Version: 1.0.0*
`;
}

/**
 * Generate database schema documentation
 */
function generateDatabaseSchema(module: ModuleFileMapping): string {
  if (module.databaseTables.length === 0) {
    return '-- No database tables required for this module\n';
  }

  return `-- Database Schema for ${module.name}
-- Generated: ${new Date().toISOString()}
-- 
-- NOTE: These are schema references. Actual column definitions
-- should be obtained from the main Supabase types file.
--
-- Tables Required:
${module.databaseTables.map(table => `
-- ============================================
-- TABLE: ${table}
-- ============================================
-- CREATE TABLE IF NOT EXISTS public.${table} (
--   id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
--   created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
--   updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
--   -- Additional columns defined in src/integrations/supabase/types.ts
-- );
--
-- Enable Row Level Security
-- ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;
`).join('\n')}

-- For complete schema definitions, refer to:
-- src/integrations/supabase/types.ts
`;
}

/**
 * Generate file manifest
 */
function generateFileManifest(module: ModuleFileMapping): string {
  const allFiles = [
    ...module.files.pages.map(f => ({ path: f, type: 'page' })),
    ...module.files.components.map(f => ({ path: f, type: 'component' })),
    ...module.files.hooks.map(f => ({ path: f, type: 'hook' })),
    ...module.files.utils.map(f => ({ path: f, type: 'utility' })),
    ...module.files.contexts.map(f => ({ path: f, type: 'context' })),
    ...module.files.data.map(f => ({ path: f, type: 'data' })),
    ...module.files.config.map(f => ({ path: f, type: 'config' }))
  ];

  return `FILE MANIFEST: ${module.name}
${'='.repeat(60)}
Generated: ${new Date().toISOString()}
Total Files: ${allFiles.length}

${allFiles.map((f, i) => `${String(i + 1).padStart(3, '0')}. [${f.type.toUpperCase().padEnd(10)}] ${f.path}`).join('\n')}

${'='.repeat(60)}
End of manifest
`;
}

/**
 * Generate implementation notes
 */
function generateImplementationNotes(module: ModuleFileMapping): string {
  return `# Implementation Notes: ${module.name}

## Overview
${module.description}

## Tech Stack
- **Framework:** React 18+ with TypeScript
- **Styling:** Tailwind CSS + Shadcn/UI
- **State Management:** React Query + Context API
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **Animations:** Framer Motion

## Key Dependencies
${module.dependencies.map(d => `- ${d}`).join('\n') || '- No additional dependencies'}

## Database Integration
${module.databaseTables.length > 0 
  ? `This module uses the following tables:\n${module.databaseTables.map(t => `- ${t}`).join('\n')}`
  : 'This module does not require database access.'}

## Security Considerations
- All database tables should have RLS (Row Level Security) enabled
- User authentication is required for data access
- Sensitive operations should be validated server-side

## File Organization
\`\`\`
${module.id}/
├── pages/           # Main page components
├── components/      # Reusable UI components  
├── hooks/           # Custom React hooks
├── utils/           # Utility functions
├── contexts/        # React contexts for state
├── data/            # Static data files
└── config/          # Configuration files
\`\`\`

## Integration Points
1. **Authentication:** Uses \`useAuth\` hook from \`src/hooks/useAuth.ts\`
2. **Data Fetching:** Uses \`@tanstack/react-query\` for caching
3. **Supabase Client:** Import from \`src/integrations/supabase/client.ts\`
4. **UI Components:** Import from \`src/components/ui/\`

## Testing
- Unit tests should cover utility functions and hooks
- Component tests should verify rendering and user interactions
- Integration tests should verify database operations

---
*TCM Clinic Module Documentation*
`;
}

// Download module as ZIP with comprehensive content
async function downloadModule(module: ModuleFileMapping) {
  toast.loading(`Preparing ${module.name}...`, { id: `download-${module.id}` });
  
  try {
    const zip = new JSZip();
    const fileCount = getModuleFileCount(module);
    
    // Add README
    zip.file('README.md', generateModuleReadme(module));
    
    // Add file manifest
    zip.file('FILE_MANIFEST.txt', generateFileManifest(module));
    
    // Add database schema
    zip.file('DATABASE_SCHEMA.sql', generateDatabaseSchema(module));
    
    // Add implementation notes
    zip.file('IMPLEMENTATION_NOTES.md', generateImplementationNotes(module));
    
    // Add module info JSON
    const moduleInfo = {
      id: module.id,
      name: module.name,
      nameHe: module.nameHe,
      category: module.category,
      description: module.description,
      fileCount,
      databaseTables: module.databaseTables,
      dependencies: module.dependencies,
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    };
    zip.file('MODULE_INFO.json', JSON.stringify(moduleInfo, null, 2));
    
    // Create source file stubs organized by type
    const sourceFolder = zip.folder('source');
    if (sourceFolder) {
      // Pages
      if (module.files.pages.length > 0) {
        const pagesFolder = sourceFolder.folder('pages');
        module.files.pages.forEach(path => {
          const fileName = path.split('/').pop() || 'unknown.tsx';
          pagesFolder?.file(fileName, `// Source: ${path}\n// Copy this file from the main project\n\nexport {};\n`);
        });
      }
      
      // Components
      if (module.files.components.length > 0) {
        const componentsFolder = sourceFolder.folder('components');
        module.files.components.forEach(path => {
          const fileName = path.split('/').pop() || 'unknown.tsx';
          componentsFolder?.file(fileName, `// Source: ${path}\n// Copy this file from the main project\n\nexport {};\n`);
        });
      }
      
      // Hooks
      if (module.files.hooks.length > 0) {
        const hooksFolder = sourceFolder.folder('hooks');
        module.files.hooks.forEach(path => {
          const fileName = path.split('/').pop() || 'unknown.ts';
          hooksFolder?.file(fileName, `// Source: ${path}\n// Copy this file from the main project\n\nexport {};\n`);
        });
      }
      
      // Utils
      if (module.files.utils.length > 0) {
        const utilsFolder = sourceFolder.folder('utils');
        module.files.utils.forEach(path => {
          const fileName = path.split('/').pop() || 'unknown.ts';
          utilsFolder?.file(fileName, `// Source: ${path}\n// Copy this file from the main project\n\nexport {};\n`);
        });
      }
      
      // Contexts
      if (module.files.contexts.length > 0) {
        const contextsFolder = sourceFolder.folder('contexts');
        module.files.contexts.forEach(path => {
          const fileName = path.split('/').pop() || 'unknown.tsx';
          contextsFolder?.file(fileName, `// Source: ${path}\n// Copy this file from the main project\n\nexport {};\n`);
        });
      }
      
      // Data
      if (module.files.data.length > 0) {
        const dataFolder = sourceFolder.folder('data');
        module.files.data.forEach(path => {
          const fileName = path.split('/').pop() || 'unknown.ts';
          dataFolder?.file(fileName, `// Source: ${path}\n// Copy this file from the main project\n\nexport {};\n`);
        });
      }
      
      // Config
      if (module.files.config.length > 0) {
        const configFolder = sourceFolder.folder('config');
        module.files.config.forEach(path => {
          const fileName = path.split('/').pop() || 'unknown.ts';
          configFolder?.file(fileName, `// Source: ${path}\n// Copy this file from the main project\n\nexport {};\n`);
        });
      }
    }
    
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
    
    toast.success(`${module.name} downloaded! (${fileCount} files)`, { id: `download-${module.id}` });
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
    const totalFiles = MODULE_FILE_MAPPINGS.reduce((sum, m) => sum + getModuleFileCount(m), 0);
    
    // Create main README
    const mainReadme = `# TCM Clinic - Complete Module Export
**Generated:** ${new Date().toISOString()}
**Total Modules:** ${MODULE_FILE_MAPPINGS.length}
**Total Files:** ${totalFiles}

## Categories
${CATEGORIES.map(cat => {
  const modules = MODULE_FILE_MAPPINGS.filter(m => m.category === cat.id);
  const files = modules.reduce((sum, m) => sum + getModuleFileCount(m), 0);
  return `- **${cat.name}** (${cat.nameHe}): ${modules.length} modules, ${files} files`;
}).join('\n')}

## Modules List
${MODULE_FILE_MAPPINGS.map((m, i) => {
  const fileCount = getModuleFileCount(m);
  return `${String(i + 1).padStart(2, '0')}. **${m.name}** - ${m.nameHe} (${fileCount} files)`;
}).join('\n')}

## Quick Start
1. Extract all modules to your project
2. Install dependencies from each module's package requirements
3. Set up database tables using the SQL schemas provided
4. Import and use components as needed

---
*TCM Clinic Module Export System v1.0*
`;
    zip.file('README.md', mainReadme);
    
    // Create master CSV
    const csvContent = [
      '\ufeff' + 'Module ID,Name (EN),Name (HE),Category,Description,File Count,Database Tables,Dependencies',
      ...MODULE_FILE_MAPPINGS.map(m => 
        `"${m.id}","${m.name}","${m.nameHe}","${m.category}","${m.description}","${getModuleFileCount(m)}","${m.databaseTables.join('; ')}","${m.dependencies.join('; ')}"`
      )
    ].join('\n');
    zip.file('MODULES_LIST.csv', csvContent);
    
    // Add each module as a folder
    for (const mod of MODULE_FILE_MAPPINGS) {
      const folder = zip.folder(mod.id);
      if (folder) {
        folder.file('README.md', generateModuleReadme(mod));
        folder.file('MODULE_INFO.json', JSON.stringify({
          id: mod.id,
          name: mod.name,
          nameHe: mod.nameHe,
          category: mod.category,
          description: mod.description,
          fileCount: getModuleFileCount(mod),
          files: mod.files,
          databaseTables: mod.databaseTables,
          dependencies: mod.dependencies
        }, null, 2));
        folder.file('FILE_MANIFEST.txt', generateFileManifest(mod));
        folder.file('DATABASE_SCHEMA.sql', generateDatabaseSchema(mod));
        folder.file('IMPLEMENTATION_NOTES.md', generateImplementationNotes(mod));
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
    
    toast.success(`All ${MODULE_FILE_MAPPINGS.length} modules downloaded! (${totalFiles} total files)`, { id: 'download-all' });
  } catch (error) {
    console.error('Download error:', error);
    toast.error('Failed to download modules', { id: 'download-all' });
  }
}

export default function ModuleDownloads() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const filteredModules = selectedCategory 
    ? MODULE_FILE_MAPPINGS.filter(m => m.category === selectedCategory)
    : MODULE_FILE_MAPPINGS;
  
  const totalFiles = MODULE_FILE_MAPPINGS.reduce((sum, m) => sum + getModuleFileCount(m), 0);

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
                הורדת מודולים | Download system modules with full documentation
              </p>
            </div>
          </div>
          
          <Button onClick={downloadAllModules} size="lg" className="gap-2">
            <FileArchive className="h-5 w-5" />
            Download All ({MODULE_FILE_MAPPINGS.length})
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
            All ({MODULE_FILE_MAPPINGS.length})
          </Button>
          {CATEGORIES.map(cat => {
            const count = MODULE_FILE_MAPPINGS.filter(m => m.category === cat.id).length;
            if (count === 0) return null;
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
              <p className="text-3xl font-bold text-primary">{MODULE_FILE_MAPPINGS.length}</p>
              <p className="text-sm text-muted-foreground">Total Modules</p>
            </CardContent>
          </Card>
          <Card className="border-emerald-500/20">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-emerald-500">{totalFiles}</p>
              <p className="text-sm text-muted-foreground">Source Files</p>
            </CardContent>
          </Card>
          <Card className="border-amber-500/20">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-amber-500">
                {MODULE_FILE_MAPPINGS.filter(m => m.category === 'assessment').length}
              </p>
              <p className="text-sm text-muted-foreground">Assessments</p>
            </CardContent>
          </Card>
          <Card className="border-teal-500/20">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-teal-500">
                {new Set(MODULE_FILE_MAPPINGS.flatMap(m => m.databaseTables)).size}
              </p>
              <p className="text-sm text-muted-foreground">DB Tables</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Module Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredModules.map((module, index) => {
            const colors = getColorClasses(module.category);
            const Icon = ICON_MAP[module.id] || Package;
            const category = CATEGORIES.find(c => c.id === module.category);
            const fileCount = getModuleFileCount(module);
            
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
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant="secondary" className="text-[10px]">
                          {category?.name || module.category}
                        </Badge>
                        <Badge variant="outline" className="text-[9px] gap-1">
                          <FileCode className="h-2.5 w-2.5" />
                          {fileCount} files
                        </Badge>
                      </div>
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
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {module.description}
                    </p>
                    {module.databaseTables.length > 0 && (
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Database className="h-3 w-3" />
                        <span>{module.databaseTables.length} tables</span>
                      </div>
                    )}
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
          className="mt-8 text-center text-sm text-muted-foreground space-y-1"
        >
          <p>Click any module box to download it as a ZIP file with full documentation</p>
          <p>Each ZIP includes: README, file manifest, database schema, and implementation notes</p>
        </motion.div>
      </div>
    </div>
  );
}
