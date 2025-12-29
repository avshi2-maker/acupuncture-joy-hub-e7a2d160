import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, RefreshCw, Key, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

function generatePassword(length: number = 12): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const digits = '0123456789';
  const special = '!@#$%';
  const all = uppercase + lowercase + digits + special;

  // Ensure at least one of each type
  let password = [
    uppercase[Math.floor(Math.random() * uppercase.length)],
    lowercase[Math.floor(Math.random() * lowercase.length)],
    digits[Math.floor(Math.random() * digits.length)],
    special[Math.floor(Math.random() * special.length)],
  ];

  // Fill remaining with random chars
  for (let i = 4; i < length; i++) {
    password.push(all[Math.floor(Math.random() * all.length)]);
  }

  // Shuffle
  for (let i = password.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [password[i], password[j]] = [password[j], password[i]];
  }

  return password.join('');
}

export default function AdminPasswordGenerator() {
  const [count, setCount] = useState(3);
  const [passwords, setPasswords] = useState<string[]>([]);

  const handleGenerate = () => {
    const newPasswords = Array.from({ length: count }, () => generatePassword(12));
    setPasswords(newPasswords);
    toast.success(`נוצרו ${count} סיסמאות`);
  };

  const copyToClipboard = (password: string) => {
    navigator.clipboard.writeText(password);
    toast.success('הסיסמה הועתקה!');
  };

  const copyAll = () => {
    navigator.clipboard.writeText(passwords.join('\n'));
    toast.success('כל הסיסמאות הועתקו!');
  };

  return (
    <>
      <Helmet>
        <title>מחולל סיסמאות | TCM Clinic</title>
      </Helmet>

      <div className="min-h-screen bg-background p-6" dir="rtl">
        <div className="max-w-xl mx-auto">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
            <ArrowRight className="h-4 w-4" />
            חזרה לדשבורד
          </Link>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-jade-light rounded-lg flex items-center justify-center">
                  <Key className="h-6 w-6 text-jade" />
                </div>
                <div>
                  <CardTitle>מחולל סיסמאות לבטא טסטרים</CardTitle>
                  <CardDescription>צרו סיסמאות לשליחה למטפלים לבדיקה</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label htmlFor="count">מספר סיסמאות</Label>
                  <Input
                    id="count"
                    type="number"
                    min={1}
                    max={20}
                    value={count}
                    onChange={(e) => setCount(Math.min(20, Math.max(1, parseInt(e.target.value) || 1)))}
                  />
                </div>
                <Button onClick={handleGenerate} className="mt-6">
                  <RefreshCw className="h-4 w-4 ml-2" />
                  צור סיסמאות
                </Button>
              </div>

              {passwords.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>סיסמאות שנוצרו:</Label>
                    <Button variant="outline" size="sm" onClick={copyAll}>
                      <Copy className="h-3 w-3 ml-1" />
                      העתק הכל
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    {passwords.map((password, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-muted p-3 rounded-lg font-mono text-sm"
                      >
                        <span>{password}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(password)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <p className="text-xs text-muted-foreground">
                    שלחו את הסיסמאות למטפלים. הם ישתמשו בהן בדף /gate כדי לקבל גישה למערכת.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
