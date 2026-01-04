import { cn } from '@/lib/utils';

interface BillingToggleProps {
  isAnnual: boolean;
  onToggle: (isAnnual: boolean) => void;
  discountPercent: number;
}

export function BillingToggle({ isAnnual, onToggle, discountPercent }: BillingToggleProps) {
  return (
    <div className="flex flex-col items-center gap-3 mb-8">
      <div className="inline-flex items-center bg-muted/50 rounded-full p-1">
        <button
          onClick={() => onToggle(false)}
          className={cn(
            "px-6 py-2 rounded-full text-sm font-medium transition-all",
            !isAnnual 
              ? "bg-background text-foreground shadow-sm" 
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          חודשי
        </button>
        <button
          onClick={() => onToggle(true)}
          className={cn(
            "px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2",
            isAnnual 
              ? "bg-background text-foreground shadow-sm" 
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          שנתי
          <span className="bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full">
            -{discountPercent}%
          </span>
        </button>
      </div>
      {isAnnual && (
        <p className="text-sm text-emerald-500 font-medium animate-fade-in">
          חסכו {discountPercent}% עם תשלום שנתי!
        </p>
      )}
    </div>
  );
}
