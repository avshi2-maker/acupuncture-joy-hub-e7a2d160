import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  CheckCircle2, 
  AlertTriangle, 
  Database, 
  Clock, 
  FileText, 
  ExternalLink 
} from 'lucide-react';
import { format } from 'date-fns';

interface AuditEvidencePanelProps {
  ragMeta: {
    chunksFound: number;
    documentsSearched: number;
    isExternal?: boolean;
    auditLogged?: boolean;
    auditLogId?: string | null;
    auditLoggedAt?: string | null;
    searchTerms?: string;
  };
  queryText?: string;
}

export function AuditEvidencePanel({ ragMeta, queryText }: AuditEvidencePanelProps) {
  // Calculate proprietary percentage
  const proprietaryPercent = ragMeta.isExternal 
    ? 0 
    : ragMeta.chunksFound > 0 
      ? 100 
      : 0;

  const statusColor = ragMeta.isExternal
    ? 'text-amber-600'
    : ragMeta.chunksFound > 0
      ? 'text-green-600'
      : 'text-red-600';

  const statusBg = ragMeta.isExternal
    ? 'bg-amber-500/10 border-amber-500/30'
    : ragMeta.chunksFound > 0
      ? 'bg-green-500/10 border-green-500/30'
      : 'bg-red-500/10 border-red-500/30';

  const statusIcon = ragMeta.isExternal
    ? <ExternalLink className="w-5 h-5 text-amber-600" />
    : ragMeta.chunksFound > 0
      ? <CheckCircle2 className="w-5 h-5 text-green-600" />
      : <AlertTriangle className="w-5 h-5 text-red-600" />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`border-2 ${statusBg}`}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <span>Audit Evidence Panel</span>
            </div>
            <Badge 
              variant="outline" 
              className={`${statusColor} ${statusBg} font-semibold`}
            >
              {proprietaryPercent}% Proprietary Data
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Proprietary Data Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Knowledge Base Coverage</span>
              <span className={`font-medium ${statusColor}`}>{proprietaryPercent}%</span>
            </div>
            <Progress 
              value={proprietaryPercent} 
              className="h-2"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>External AI</span>
              <span>Proprietary KB</span>
            </div>
          </div>

          {/* Evidence Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-background border flex items-center gap-3">
              {statusIcon}
              <div>
                <p className="text-xs text-muted-foreground">Source</p>
                <p className="text-sm font-medium">
                  {ragMeta.isExternal ? 'External AI' : 'Dr. Sapir KB'}
                </p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-background border flex items-center gap-3">
              <Database className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-xs text-muted-foreground">Chunks Matched</p>
                <p className="text-sm font-medium">{ragMeta.chunksFound}</p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-background border flex items-center gap-3">
              <FileText className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-xs text-muted-foreground">Docs Searched</p>
                <p className="text-sm font-medium">{ragMeta.documentsSearched}</p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-background border flex items-center gap-3">
              <Clock className="w-5 h-5 text-teal-600" />
              <div>
                <p className="text-xs text-muted-foreground">Audit Logged</p>
                <p className="text-sm font-medium">
                  {ragMeta.auditLogged ? 'Yes' : 'No'}
                </p>
              </div>
            </div>
          </div>

          {/* Audit Log Details */}
          {ragMeta.auditLogged && ragMeta.auditLogId && (
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 space-y-2">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold">Audit Trail Record</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Log ID:</span>
                  <p className="font-mono text-[10px] break-all">{ragMeta.auditLogId}</p>
                </div>
                {ragMeta.auditLoggedAt && (
                  <div>
                    <span className="text-muted-foreground">Timestamp:</span>
                    <p className="font-mono text-[10px]">
                      {format(new Date(ragMeta.auditLoggedAt), 'yyyy-MM-dd HH:mm:ss')}
                    </p>
                  </div>
                )}
              </div>
              {queryText && (
                <div className="pt-2 border-t border-primary/10">
                  <span className="text-[10px] text-muted-foreground">Query:</span>
                  <p className="text-xs truncate">{queryText}</p>
                </div>
              )}
            </div>
          )}

          {/* Liability Notice */}
          <div className={`text-[10px] p-2 rounded ${statusBg}`}>
            {ragMeta.isExternal ? (
              <p className="text-amber-700">
                ⚠️ External AI response: NOT covered by Dr. Sapir's liability. User accepted responsibility.
              </p>
            ) : ragMeta.chunksFound > 0 ? (
              <p className="text-green-700">
                ✓ Response verified against proprietary knowledge base. Covered by Dr. Sapir's clinical liability.
              </p>
            ) : (
              <p className="text-red-700">
                ⚠️ No matching knowledge found. Response uses general AI knowledge only.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
