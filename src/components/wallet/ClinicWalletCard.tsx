import { useState } from 'react';
import { Wallet, Coins, TrendingUp, AlertTriangle, Mail, Sparkles, History, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useClinicWallet, type CreditPack } from '@/hooks/useClinicWallet';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

// Your contact email for upgrade requests
const UPGRADE_EMAIL = 'support@yourdomain.com';
const WHATSAPP_NUMBER = '+972501234567';

export function ClinicWalletCard() {
  const { wallet, creditPacks, transactions, walletLoading, getWalletStatus, patientsRemaining } =
    useClinicWallet();
  const [topUpDialogOpen, setTopUpDialogOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const status = getWalletStatus();

  const handleContactForUpgrade = (pack: CreditPack) => {
    const subject = encodeURIComponent(`בקשת רכישת קרדיטים - ${pack.name_he}`);
    const body = encodeURIComponent(
      `שלום,\n\nאני מעוניין/ת לרכוש חבילת קרדיטים:\n\n` +
        `חבילה: ${pack.name_he}\n` +
        `קרדיטים: ${pack.credits}\n` +
        `מחיר: ₪${pack.price_ils}\n\n` +
        `אנא צרו איתי קשר להשלמת הרכישה.\n\nתודה!`
    );

    window.open(`mailto:${UPGRADE_EMAIL}?subject=${subject}&body=${body}`);
    setTopUpDialogOpen(false);
  };

  const handleWhatsAppUpgrade = (pack: CreditPack) => {
    const message = encodeURIComponent(
      `שלום, אני מעוניין/ת לרכוש חבילת ${pack.name_he} (${pack.credits} קרדיטים)`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER.replace('+', '')}?text=${message}`);
    setTopUpDialogOpen(false);
  };

  if (walletLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader className="pb-2">
          <div className="h-6 bg-muted rounded w-1/3" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-20 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  const statusColors = {
    good: 'bg-jade/10 border-jade/30 text-jade-dark',
    warning: 'bg-amber-500/10 border-amber-500/30 text-amber-600',
    critical: 'bg-destructive/10 border-destructive/30 text-destructive',
    empty: 'bg-destructive/20 border-destructive/50 text-destructive',
    loading: 'bg-muted',
  };

  const progressColors = {
    good: '[&>div]:bg-jade',
    warning: '[&>div]:bg-amber-500',
    critical: '[&>div]:bg-destructive',
    empty: '[&>div]:bg-destructive',
    loading: '',
  };

  return (
    <Card className={cn('overflow-hidden border-2', statusColors[status.status as keyof typeof statusColors])}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Wallet className="h-5 w-5 text-gold" />
            ארנק המרפאה
          </CardTitle>
          <Badge
            variant="outline"
            className={cn(
              'text-xs',
              status.status === 'good' && 'bg-jade/20 text-jade-dark border-jade/30',
              status.status === 'warning' && 'bg-amber-500/20 text-amber-600 border-amber-500/30',
              (status.status === 'critical' || status.status === 'empty') &&
                'bg-destructive/20 text-destructive border-destructive/30'
            )}
          >
            {status.status === 'good' && 'תקין'}
            {status.status === 'warning' && 'שימו לב'}
            {status.status === 'critical' && 'קריטי'}
            {status.status === 'empty' && 'ריק'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4" dir="rtl">
        {/* Balance Display */}
        <div className="text-center py-4 bg-gradient-to-br from-jade/5 to-gold/5 rounded-xl">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Coins className="h-6 w-6 text-gold" />
            <span className="text-4xl font-bold text-foreground">
              {wallet?.credits_balance?.toLocaleString() || 0}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">קרדיטים זמינים</p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              מתוך {wallet?.total_purchased?.toLocaleString() || 500}
            </span>
            <span className={cn('font-medium', status.status !== 'good' && 'text-destructive')}>
              {status.percent}%
            </span>
          </div>
          <Progress
            value={status.percent}
            className={cn('h-3', progressColors[status.status as keyof typeof progressColors])}
          />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-jade">
              <TrendingUp className="h-4 w-4" />
              <span className="text-lg font-bold">{patientsRemaining}</span>
            </div>
            <p className="text-xs text-muted-foreground">מטופלים (בקירוב)</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-gold-dark">
              <Sparkles className="h-4 w-4" />
              <span className="text-lg font-bold">{Math.floor((wallet?.credits_balance || 0) / 5)}</span>
            </div>
            <p className="text-xs text-muted-foreground">שאילתות AI</p>
          </div>
        </div>

        {/* Warning Banner */}
        {status.status !== 'good' && (
          <div
            className={cn(
              'flex items-center gap-2 p-3 rounded-lg text-sm',
              status.status === 'warning' && 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
              (status.status === 'critical' || status.status === 'empty') &&
                'bg-destructive/10 text-destructive'
            )}
          >
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{status.message}</span>
          </div>
        )}

        {/* Top Up Button */}
        <Dialog open={topUpDialogOpen} onOpenChange={setTopUpDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className={cn(
                'w-full gap-2',
                status.status === 'good'
                  ? 'bg-jade hover:bg-jade-dark text-white'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white'
              )}
            >
              <Coins className="h-4 w-4" />
              {status.status === 'good' ? 'טעינת קרדיטים' : 'טען עכשיו!'}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Wallet className="h-5 w-5 text-gold" />
                בחר חבילת קרדיטים
              </DialogTitle>
              <DialogDescription>
                היתרה הנוכחית שלך: {wallet?.credits_balance?.toLocaleString() || 0} קרדיטים
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-4">
              {creditPacks
                .filter((pack) => pack.price_ils > 0)
                .map((pack) => (
                  <div
                    key={pack.id}
                    className="border rounded-lg p-4 hover:border-jade/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">{pack.name_he}</h4>
                        <p className="text-sm text-muted-foreground">{pack.description}</p>
                      </div>
                      <div className="text-left">
                        <div className="text-xl font-bold text-jade">₪{pack.price_ils}</div>
                        <div className="text-xs text-muted-foreground">
                          {pack.credits.toLocaleString()} קרדיטים
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-1"
                        onClick={() => handleContactForUpgrade(pack)}
                      >
                        <Mail className="h-3 w-3" />
                        אימייל
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 gap-1 bg-green-600 hover:bg-green-700"
                        onClick={() => handleWhatsAppUpgrade(pack)}
                      >
                        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        וואטסאפ
                      </Button>
                    </div>
                  </div>
                ))}
            </div>

            <p className="text-xs text-muted-foreground text-center">
              לאחר הרכישה, הקרדיטים יתווספו לחשבונך תוך 24 שעות
            </p>
          </DialogContent>
        </Dialog>

        {/* Transaction History */}
        <Collapsible open={historyOpen} onOpenChange={setHistoryOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full gap-2 text-muted-foreground">
              <History className="h-4 w-4" />
              היסטוריית פעולות
              <ChevronDown className={cn('h-4 w-4 transition-transform', historyOpen && 'rotate-180')} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 mt-2">
            {transactions.slice(0, 10).map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between text-sm p-2 bg-muted/30 rounded"
              >
                <div>
                  <span className={tx.amount > 0 ? 'text-jade' : 'text-muted-foreground'}>
                    {tx.amount > 0 ? '+' : ''}
                    {tx.amount}
                  </span>
                  <span className="text-muted-foreground text-xs mr-2">
                    {tx.description || tx.transaction_type}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(tx.created_at), 'dd/MM', { locale: he })}
                </span>
              </div>
            ))}
            {transactions.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-2">אין היסטוריה עדיין</p>
            )}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
