import { Zap, MessageSquare, Stethoscope, Leaf, Brain, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';

const TOKEN_EXAMPLES = [
  {
    icon: <Stethoscope className="h-5 w-5" />,
    action: 'אבחון TCM',
    tokens: '~500',
    description: 'ניתוח תסמינים והמלצת דפוס',
  },
  {
    icon: <Brain className="h-5 w-5" />,
    action: 'תכנון טיפול',
    tokens: '~400',
    description: 'בחירת נקודות דיקור מותאמות',
  },
  {
    icon: <Leaf className="h-5 w-5" />,
    action: 'המלצת צמחים',
    tokens: '~350',
    description: 'פורמולה מותאמת אישית',
  },
  {
    icon: <MessageSquare className="h-5 w-5" />,
    action: 'שאלה כללית',
    tokens: '~200',
    description: 'שאילתה במאגר הידע',
  },
];

const USAGE_SCENARIOS = [
  {
    title: 'מטפל מתחיל',
    patients: '5-10',
    frequency: 'מטופלים/שבוע',
    recommended: 'Trial / Standard',
    tokensNeeded: '~30K-60K',
    color: 'from-emerald-500/20 to-emerald-600/10',
    borderColor: 'border-emerald-500/30',
  },
  {
    title: 'קליניקה פעילה',
    patients: '15-25',
    frequency: 'מטופלים/שבוע',
    recommended: 'Standard',
    tokensNeeded: '~90K-150K',
    color: 'from-gold/20 to-gold/10',
    borderColor: 'border-gold/30',
  },
  {
    title: 'קליניקה עמוסה',
    patients: '30+',
    frequency: 'מטופלים/שבוע',
    recommended: 'Premium',
    tokensNeeded: '~200K+',
    color: 'from-primary/20 to-primary/10',
    borderColor: 'border-primary/30',
  },
];

export function TokenExplainer() {
  return (
    <section className="mt-16 space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
          <Zap className="h-4 w-4" />
          <span className="text-sm font-medium">איך טוקנים עובדים?</span>
        </div>
        <h2 className="font-display text-2xl md:text-3xl mb-3">הבנת צריכת הטוקנים</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          כל פעולת AI צורכת כמות טוקנים שונה בהתאם למורכבות הבקשה
        </p>
      </div>

      {/* Token Usage Examples */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {TOKEN_EXAMPLES.map((example) => (
          <Card 
            key={example.action}
            className="p-4 text-center bg-card/50 border-border/50 hover:border-primary/30 transition-colors"
          >
            <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              {example.icon}
            </div>
            <h3 className="font-medium text-sm mb-1">{example.action}</h3>
            <div className="text-xl font-bold text-primary mb-1">{example.tokens}</div>
            <p className="text-xs text-muted-foreground">{example.description}</p>
          </Card>
        ))}
      </div>

      {/* Visual Flow */}
      <Card className="p-6 bg-gradient-to-br from-card to-card/80 border-border/50">
        <h3 className="font-display text-lg mb-4 text-center">דוגמה: טיפול טיפוסי</h3>
        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4">
          <div className="flex items-center gap-2 bg-background/50 rounded-lg px-3 py-2">
            <Stethoscope className="h-4 w-4 text-primary" />
            <span className="text-sm">אבחון</span>
            <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">500</span>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground hidden md:block" />
          <div className="flex items-center gap-2 bg-background/50 rounded-lg px-3 py-2">
            <Brain className="h-4 w-4 text-primary" />
            <span className="text-sm">תכנון</span>
            <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">400</span>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground hidden md:block" />
          <div className="flex items-center gap-2 bg-background/50 rounded-lg px-3 py-2">
            <Leaf className="h-4 w-4 text-primary" />
            <span className="text-sm">צמחים</span>
            <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">350</span>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground hidden md:block" />
          <div className="flex items-center gap-2 bg-gold/20 rounded-lg px-4 py-2 border border-gold/30">
            <span className="text-sm font-medium">סה״כ:</span>
            <span className="text-lg font-bold text-gold">~1,250</span>
            <span className="text-xs text-muted-foreground">טוקנים</span>
          </div>
        </div>
      </Card>

      {/* Usage Scenarios */}
      <div>
        <h3 className="font-display text-lg mb-4 text-center">איזו תוכנית מתאימה לך?</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {USAGE_SCENARIOS.map((scenario) => (
            <Card 
              key={scenario.title}
              className={`p-5 bg-gradient-to-br ${scenario.color} ${scenario.borderColor} border`}
            >
              <h4 className="font-medium mb-2">{scenario.title}</h4>
              <div className="text-2xl font-bold mb-1">{scenario.patients}</div>
              <p className="text-sm text-muted-foreground mb-3">{scenario.frequency}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">צריכה משוערת:</span>
                <span className="font-medium">{scenario.tokensNeeded}</span>
              </div>
              <div className="mt-3 pt-3 border-t border-border/50">
                <span className="text-xs text-muted-foreground">מומלץ: </span>
                <span className="text-sm font-medium text-primary">{scenario.recommended}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Bottom Note */}
      <p className="text-center text-sm text-muted-foreground max-w-xl mx-auto">
        💡 <strong>טיפ:</strong> השימוש בפועל משתנה בהתאם לאורך התשובות ומורכבות השאלות. 
        ניתן לעקוב אחרי הצריכה בזמן אמת בלוח הבקרה.
      </p>
    </section>
  );
}
