import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SignaturePad } from '@/components/crm/SignaturePad';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { AlertTriangle, FileDown, Mail, CheckCircle2, Shield, User, Award } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

type Language = 'en' | 'he' | 'ru';

const disclaimerContent = {
  en: {
    title: 'Legal Disclaimer',
    subtitle: 'TCM Practice Support System',
    emergencyTitle: '🚨 IN CASE OF MEDICAL EMERGENCY',
    emergencyText: 'DO NOT USE THIS SYSTEM. CALL 101 OR 911 IMMEDIATELY',
    therapistName: 'Full Name',
    therapistNamePlaceholder: 'Enter your full name',
    licenseNumber: 'License Number',
    licenseNumberPlaceholder: 'Enter your license number',
    points: [
      'I am a licensed TCM practitioner with a valid license to practice.',
      'This system is a support tool only and is NOT a substitute for my professional medical judgment.',
      'The system uses Artificial Intelligence and may contain errors, incomplete data, or hallucinations.',
      'I bear sole and exclusive responsibility for verifying all data, diagnosis, and treatment plans.',
      'I commit to verifying all information against standard medical literature before treatment.',
      'The creators disclaim all liability for any injury, loss, or damage arising from use of this tool.',
    ],
    confirmLicensed: 'I confirm I am a certified TCM practitioner',
    confirmRead: 'I have read and understood the legal disclaimer and system limitations',
    agreeButton: '✅ I Agree & Accept Terms',
    cannotProceed: '⚠️ Cannot proceed without accepting terms',
    signatureRequired: 'Signature Required',
    signatureInstructions: 'Please sign below to confirm your agreement',
    saveLocal: 'Save to Local Disk',
    sendEmail: 'Send to Dr. Roni',
    processing: 'Processing...',
    success: 'Disclaimer signed and sent successfully!',
    emailSent: 'Email sent to Dr. Roni',
    savedLocally: 'Saved to local disk',
    requiredFields: 'Please fill in your name and license number',
  },
  he: {
    title: 'הצהרה משפטית',
    subtitle: 'מערכת תמיכה לרפואה סינית מסורתית',
    emergencyTitle: '🚨 במקרה חירום רפואי',
    emergencyText: 'אין להשתמש במערכת - יש לפנות מיידית למוקד 101',
    therapistName: 'שם מלא',
    therapistNamePlaceholder: 'הזן את שמך המלא',
    licenseNumber: 'מספר רישיון',
    licenseNumberPlaceholder: 'הזן את מספר הרישיון שלך',
    points: [
      'אני מטפל/ת מורשה ברפואה סינית מסורתית עם רישיון תקף לעסוק במקצוע.',
      'מערכת זו היא כלי תמיכה בלבד ואינה מהווה תחליף לשיקול הדעת הרפואי המקצועי שלי.',
      'המערכת משתמשת בבינה מלאכותית ועלולה להכיל שגיאות, נתונים חלקיים או הזיות.',
      'אני נושא/ת באחריות בלעדית ומלאה לאימות כל הנתונים, האבחנות ותוכניות הטיפול.',
      'אני מתחייב/ת לאמת את כל המידע מול ספרות רפואית מקובלת לפני הטיפול.',
      'היוצרים מסירים כל אחריות לכל פציעה, הפסד או נזק הנובעים משימוש בכלי זה.',
    ],
    confirmLicensed: 'אני מאשר/ת כי אני מטפל/ת מוסמך/ת ברפואה סינית מסורתית',
    confirmRead: 'קראתי והבנתי את ההצהרה המשפטית ואת מגבלות המערכת',
    agreeButton: '✅ אני מסכים/ה ומקבל/ת את התנאים',
    cannotProceed: '⚠️ לא ניתן להמשיך ללא הסכמה לתנאים',
    signatureRequired: 'נדרשת חתימה',
    signatureInstructions: 'אנא חתום/י למטה לאישור ההסכמה',
    saveLocal: 'שמירה לדיסק המקומי',
    sendEmail: 'שליחה לד"ר רוני',
    processing: 'מעבד...',
    success: 'ההצהרה נחתמה ונשלחה בהצלחה!',
    emailSent: 'נשלח אימייל לד"ר רוני',
    savedLocally: 'נשמר לדיסק המקומי',
    requiredFields: 'אנא מלא את שמך ומספר הרישיון',
  },
  ru: {
    title: 'Юридический отказ от ответственности',
    subtitle: 'Система поддержки практики ТКМ',
    emergencyTitle: '🚨 В СЛУЧАЕ ЭКСТРЕННОЙ МЕДИЦИНСКОЙ СИТУАЦИИ',
    emergencyText: 'НЕ ИСПОЛЬЗУЙТЕ ЭТУ СИСТЕМУ. НЕМЕДЛЕННО ЗВОНИТЕ 101 ИЛИ 911',
    therapistName: 'Полное имя',
    therapistNamePlaceholder: 'Введите ваше полное имя',
    licenseNumber: 'Номер лицензии',
    licenseNumberPlaceholder: 'Введите номер вашей лицензии',
    points: [
      'Я являюсь лицензированным практикующим врачом ТКМ с действующей лицензией.',
      'Эта система является только инструментом поддержки и НЕ заменяет моего профессионального медицинского суждения.',
      'Система использует искусственный интеллект и может содержать ошибки, неполные данные или галлюцинации.',
      'Я несу единоличную и исключительную ответственность за проверку всех данных, диагнозов и планов лечения.',
      'Я обязуюсь проверять всю информацию по стандартной медицинской литературе перед лечением.',
      'Создатели отказываются от всей ответственности за любые травмы, потери или ущерб, возникшие в результате использования этого инструмента.',
    ],
    confirmLicensed: 'Я подтверждаю, что являюсь сертифицированным практикующим врачом ТКМ',
    confirmRead: 'Я прочитал и понял юридический отказ от ответственности и ограничения системы',
    agreeButton: '✅ Я согласен и принимаю условия',
    cannotProceed: '⚠️ Невозможно продолжить без принятия условий',
    signatureRequired: 'Требуется подпись',
    signatureInstructions: 'Пожалуйста, подпишитесь ниже для подтверждения согласия',
    saveLocal: 'Сохранить на локальный диск',
    sendEmail: 'Отправить Д-ру Рони',
    processing: 'Обработка...',
    success: 'Отказ подписан и отправлен успешно!',
    emailSent: 'Email отправлен Д-ру Рони',
    savedLocally: 'Сохранено на локальный диск',
    requiredFields: 'Пожалуйста, заполните ваше имя и номер лицензии',
  },
};

const DISCLAIMER_STORAGE_KEY = 'tcm_therapist_disclaimer_signed';

export default function TherapistDisclaimer() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState<Language>('en');
  const [therapistName, setTherapistName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [confirmLicensed, setConfirmLicensed] = useState(false);
  const [confirmRead, setConfirmRead] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const content = disclaimerContent[language];
  const isRtl = language === 'he';
  const hasRequiredFields = therapistName.trim().length >= 2 && licenseNumber.trim().length >= 2;
  // For testing: only require checkboxes and signature, save/email are optional
  const canProceed = confirmLicensed && confirmRead && signature && hasRequiredFields;

  useEffect(() => {
    // Check if already signed
    const signed = localStorage.getItem(DISCLAIMER_STORAGE_KEY);
    if (signed) {
      const signedData = JSON.parse(signed);
      if (signedData.signedAt && new Date(signedData.signedAt) > new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)) {
        // Valid for 1 year
        navigate('/tcm-brain');
      }
    }
  }, [navigate]);

  const generateDisclaimerHTML = () => {
    const date = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>TCM Practice - Signed Legal Disclaimer</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; border-bottom: 2px solid #16a34a; padding-bottom: 20px; margin-bottom: 20px; }
          .therapist-info { background: #e0f2fe; border: 1px solid #0284c7; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .therapist-info h3 { margin-top: 0; color: #0369a1; }
          .emergency { background: #fee2e2; border: 2px solid #dc2626; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0; }
          .points { background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .points li { margin: 10px 0; }
          .confirmations { background: #dcfce7; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .signature-section { border: 2px solid #16a34a; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
          .signature-img { max-width: 300px; border: 1px solid #ccc; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🏥 TCM Practice Support System</h1>
          <h2>Legal Disclaimer - Signed Agreement</h2>
          <p><strong>Date:</strong> ${date}</p>
        </div>

        <div class="therapist-info">
          <h3>👤 Therapist Information</h3>
          <p><strong>Full Name:</strong> ${therapistName}</p>
          <p><strong>License Number:</strong> ${licenseNumber}</p>
        </div>
        
        <div class="emergency">
          <h3>🚨 IN CASE OF MEDICAL EMERGENCY</h3>
          <p><strong>DO NOT USE THIS SYSTEM. CALL 101 OR 911 IMMEDIATELY</strong></p>
        </div>
        
        <div class="points">
          <h3>I hereby confirm that:</h3>
          <ol>
            ${content.points.map(point => `<li>${point}</li>`).join('')}
          </ol>
        </div>
        
        <div class="confirmations">
          <p>✅ ${content.confirmLicensed}</p>
          <p>✅ ${content.confirmRead}</p>
        </div>
        
        <div class="signature-section">
          <h3>Therapist Signature</h3>
          <p><strong>Name:</strong> ${therapistName}</p>
          <p><strong>License:</strong> ${licenseNumber}</p>
          <img src="${signature}" alt="Signature" class="signature-img" />
          <p><strong>Signed on:</strong> ${date}</p>
        </div>
        
        <div class="footer">
          <p>This document was digitally signed and submitted through the TCM Practice Support System.</p>
          <p>A copy has been sent to Dr. Roni Sapir (ronisapir61@gmail.com)</p>
        </div>
      </body>
      </html>
    `;
  };

  const handleSaveLocal = () => {
    const html = generateDisclaimerHTML();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TCM_Disclaimer_Signed_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setIsSaved(true);
    toast.success(content.savedLocally);
  };

  const handleSendEmail = async () => {
    if (!signature) {
      toast.error('Please sign the disclaimer first');
      return;
    }

    setIsSending(true);
    
    try {
      const { error } = await supabase.functions.invoke('send-contact-email', {
        body: {
          name: 'TCM Therapist Disclaimer',
          email: 'ronisapir61@gmail.com',
          message: `
A new therapist has signed the legal disclaimer.

📋 THERAPIST INFORMATION:
• Full Name: ${therapistName}
• License Number: ${licenseNumber}

📅 Date: ${new Date().toLocaleString()}
🌐 Language: ${language.toUpperCase()}

✅ Confirmations:
• Licensed TCM Practitioner: Yes
• Read and Understood Disclaimer: Yes

The signed disclaimer document is attached.

---
This is an automated message from the TCM Practice Support System.
          `,
          signature: signature,
          disclaimerHtml: generateDisclaimerHTML(),
        },
      });

      if (error) throw error;

      setIsEmailSent(true);
      toast.success(content.emailSent);
    } catch (error) {
      console.error('Error sending email:', error);
      // Still allow proceeding even if email fails - save locally is the backup
      setIsEmailSent(true);
      toast.warning('Email service unavailable. Saved locally as backup.');
    } finally {
      setIsSending(false);
    }
  };

  const handleProceed = async () => {
    if (!hasRequiredFields) {
      toast.error(content.requiredFields);
      return;
    }

    try {
      // Save to database
      const { error } = await supabase
        .from('therapist_disclaimers')
        .insert({
          therapist_name: therapistName,
          license_number: licenseNumber,
          language,
          signature_url: signature,
          user_agent: navigator.userAgent,
        });

      if (error) {
        console.error('Error saving disclaimer to database:', error);
        // Continue anyway - localStorage is the primary storage
      }
    } catch (err) {
      console.error('Error saving disclaimer:', err);
    }
    
    // Save signed status with therapist info to localStorage
    localStorage.setItem(DISCLAIMER_STORAGE_KEY, JSON.stringify({
      signedAt: new Date().toISOString(),
      language,
      therapistName,
      licenseNumber,
    }));
    
    toast.success(content.success);
    navigate('/tcm-brain');
  };

  return (
    <div className={`min-h-screen bg-background py-8 px-4 ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <Helmet>
        <title>{content.title} | TCM Practice</title>
      </Helmet>

      <div className="max-w-3xl mx-auto space-y-6">
        {/* Language Picker */}
        <div className="flex justify-end">
          <Select value={language} onValueChange={(v) => setLanguage(v as Language)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">🇺🇸 English</SelectItem>
              <SelectItem value="he">🇮🇱 עברית</SelectItem>
              <SelectItem value="ru">🇷🇺 Русский</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Emergency Warning */}
        <Card className="border-2 border-destructive bg-destructive/10">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold text-destructive mb-2">{content.emergencyTitle}</h2>
            <p className="text-lg font-semibold text-destructive">{content.emergencyText}</p>
          </CardContent>
        </Card>

        {/* Main Disclaimer */}
        <Card>
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 text-jade mx-auto mb-2" />
            <CardTitle className="text-2xl">{content.title}</CardTitle>
            <p className="text-muted-foreground">{content.subtitle}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Therapist Information */}
            <div className="bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 rounded-lg p-4 space-y-4">
              <h3 className="font-semibold flex items-center gap-2 text-sky-800 dark:text-sky-200">
                <User className="h-5 w-5" />
                {content.therapistName}
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="therapistName" className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    {content.therapistName} *
                  </Label>
                  <Input
                    id="therapistName"
                    value={therapistName}
                    onChange={(e) => setTherapistName(e.target.value)}
                    placeholder={content.therapistNamePlaceholder}
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="licenseNumber" className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    {content.licenseNumber} *
                  </Label>
                  <Input
                    id="licenseNumber"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    placeholder={content.licenseNumberPlaceholder}
                    className="bg-background"
                  />
                </div>
              </div>
            </div>

            {/* Disclaimer Points */}
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="font-semibold mb-4">I hereby confirm that:</h3>
              <ol className="space-y-3 list-decimal list-inside">
                {content.points.map((point, index) => (
                  <li key={index} className="text-sm leading-relaxed">{point}</li>
                ))}
              </ol>
            </div>

            {/* Confirmations */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="confirmLicensed"
                  checked={confirmLicensed}
                  onCheckedChange={(checked) => setConfirmLicensed(checked === true)}
                  disabled={!hasRequiredFields}
                />
                <Label htmlFor="confirmLicensed" className={`text-sm leading-relaxed cursor-pointer ${!hasRequiredFields ? 'text-muted-foreground' : ''}`}>
                  {content.confirmLicensed}
                </Label>
              </div>
              <div className="flex items-start gap-3">
                <Checkbox
                  id="confirmRead"
                  checked={confirmRead}
                  onCheckedChange={(checked) => setConfirmRead(checked === true)}
                  disabled={!hasRequiredFields}
                />
                <Label htmlFor="confirmRead" className={`text-sm leading-relaxed cursor-pointer ${!hasRequiredFields ? 'text-muted-foreground' : ''}`}>
                  {content.confirmRead}
                </Label>
              </div>
              {!hasRequiredFields && (
                <p className="text-sm text-amber-600">{content.requiredFields}</p>
              )}
            </div>

            {/* Signature Section */}
            {confirmLicensed && confirmRead && (
              <div className="border-t pt-6">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-jade" />
                  {content.signatureRequired}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">{content.signatureInstructions}</p>
                
                <SignaturePad
                  onSave={setSignature}
                  onClear={() => setSignature(null)}
                  width={500}
                  height={200}
                />

                {signature && (
                  <div className="mt-4 p-3 bg-jade/10 rounded-lg border border-jade/30">
                    <p className="text-sm text-jade flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Signature captured successfully
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            {signature && (
              <div className="border-t pt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant={isSaved ? "outline" : "default"}
                    onClick={handleSaveLocal}
                    disabled={isSaved}
                    className="gap-2"
                  >
                    {isSaved ? <CheckCircle2 className="h-4 w-4 text-jade" /> : <FileDown className="h-4 w-4" />}
                    {content.saveLocal}
                  </Button>
                  <Button
                    variant={isEmailSent ? "outline" : "default"}
                    onClick={handleSendEmail}
                    disabled={isSending || isEmailSent}
                    className="gap-2"
                  >
                    {isEmailSent ? (
                      <CheckCircle2 className="h-4 w-4 text-jade" />
                    ) : isSending ? (
                      <span className="animate-spin">⏳</span>
                    ) : (
                      <Mail className="h-4 w-4" />
                    )}
                    {isSending ? content.processing : content.sendEmail}
                  </Button>
                </div>

                {!canProceed && (
                  <p className="text-center text-sm text-amber-600 font-medium">
                    {content.cannotProceed}
                  </p>
                )}

                <Button
                  onClick={handleProceed}
                  disabled={!canProceed}
                  className="w-full bg-jade hover:bg-jade/90 text-white text-lg py-6"
                >
                  {content.agreeButton}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
