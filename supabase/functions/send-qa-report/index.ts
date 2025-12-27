import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ModuleResult {
  moduleName: string;
  moduleNameHe: string;
  status: string;
  comments: { text: string; type: string; author: string }[];
  followUpRequired: boolean;
  followUpNotes: string | null;
}

interface QAReportRequest {
  testerName: string;
  recipientEmail: string;
  startedAt: string;
  endedAt: string;
  modules: ModuleResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    blocked: number;
    percentage: number;
  };
}

const statusEmoji: Record<string, string> = {
  passed: "✅",
  failed: "❌",
  blocked: "⚠️",
  not_tested: "⏳",
  in_progress: "🔄",
};

const statusLabel: Record<string, string> = {
  passed: "Passed",
  failed: "Failed",
  blocked: "Blocked",
  not_tested: "Not Tested",
  in_progress: "In Progress",
};

function generateEmailHtml(data: QAReportRequest): string {
  const failedModules = data.modules.filter(m => m.status === "failed");
  const blockedModules = data.modules.filter(m => m.status === "blocked");
  const followUpModules = data.modules.filter(m => m.followUpRequired);
  const allComments = data.modules.flatMap(m => 
    m.comments.map(c => ({ ...c, moduleName: m.moduleNameHe }))
  );

  return `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #2D5A4A, #3D7A5A); color: white; padding: 30px; border-radius: 10px; margin-bottom: 20px; }
    .header h1 { margin: 0 0 10px 0; }
    .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 20px 0; }
    .summary-box { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
    .summary-box.passed { border-left: 4px solid #22c55e; }
    .summary-box.failed { border-left: 4px solid #ef4444; }
    .summary-box.blocked { border-left: 4px solid #f59e0b; }
    .summary-box.total { border-left: 4px solid #3b82f6; }
    .summary-number { font-size: 32px; font-weight: bold; }
    .summary-label { color: #666; font-size: 14px; }
    .section { background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .section h2 { margin-top: 0; color: #2D5A4A; border-bottom: 2px solid #2D5A4A; padding-bottom: 10px; }
    .module-item { padding: 10px; border-bottom: 1px solid #eee; }
    .module-item:last-child { border-bottom: none; }
    .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
    .status-passed { background: #dcfce7; color: #166534; }
    .status-failed { background: #fee2e2; color: #991b1b; }
    .status-blocked { background: #fef3c7; color: #92400e; }
    .comment { background: #f8f9fa; padding: 10px; margin: 5px 0; border-radius: 5px; border-right: 3px solid #3b82f6; }
    .comment.bug { border-right-color: #ef4444; }
    .comment.suggestion { border-right-color: #f59e0b; }
    .footer { text-align: center; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 12px; text-align: right; border-bottom: 1px solid #eee; }
    th { background: #f8f9fa; font-weight: bold; }
    .progress-bar { background: #e5e7eb; border-radius: 10px; height: 20px; overflow: hidden; }
    .progress-fill { background: linear-gradient(90deg, #22c55e, #3D7A5A); height: 100%; transition: width 0.3s; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📋 דו״ח בדיקות QA</h1>
    <p>נשלח על ידי: <strong>${data.testerName}</strong></p>
    <p>תאריך: ${new Date(data.endedAt).toLocaleDateString('he-IL')} | ${new Date(data.endedAt).toLocaleTimeString('he-IL')}</p>
  </div>

  <div class="section">
    <h2>📊 סיכום</h2>
    <div class="progress-bar">
      <div class="progress-fill" style="width: ${data.summary.percentage}%"></div>
    </div>
    <p style="text-align: center; font-size: 18px; margin-top: 10px;">
      <strong>${data.summary.percentage}%</strong> הושלם (${data.summary.passed + data.summary.failed + data.summary.blocked}/${data.summary.total})
    </p>
    <div class="summary-grid">
      <div class="summary-box passed">
        <div class="summary-number" style="color: #22c55e;">${data.summary.passed}</div>
        <div class="summary-label">עברו ✅</div>
      </div>
      <div class="summary-box failed">
        <div class="summary-number" style="color: #ef4444;">${data.summary.failed}</div>
        <div class="summary-label">נכשלו ❌</div>
      </div>
      <div class="summary-box blocked">
        <div class="summary-number" style="color: #f59e0b;">${data.summary.blocked}</div>
        <div class="summary-label">חסומים ⚠️</div>
      </div>
      <div class="summary-box total">
        <div class="summary-number" style="color: #3b82f6;">${data.summary.total}</div>
        <div class="summary-label">סה״כ מודולים</div>
      </div>
    </div>
  </div>

  ${failedModules.length > 0 ? `
  <div class="section">
    <h2>❌ מודולים שנכשלו (${failedModules.length})</h2>
    ${failedModules.map(m => `
      <div class="module-item">
        <strong>${m.moduleNameHe}</strong> (${m.moduleName})
        ${m.comments.length > 0 ? m.comments.map(c => `
          <div class="comment ${c.type}">${c.text} - <em>${c.author}</em></div>
        `).join('') : ''}
      </div>
    `).join('')}
  </div>
  ` : ''}

  ${blockedModules.length > 0 ? `
  <div class="section">
    <h2>⚠️ מודולים חסומים (${blockedModules.length})</h2>
    ${blockedModules.map(m => `
      <div class="module-item">
        <strong>${m.moduleNameHe}</strong> (${m.moduleName})
        ${m.comments.length > 0 ? m.comments.map(c => `
          <div class="comment ${c.type}">${c.text} - <em>${c.author}</em></div>
        `).join('') : ''}
      </div>
    `).join('')}
  </div>
  ` : ''}

  ${followUpModules.length > 0 ? `
  <div class="section">
    <h2>🚩 דורש מעקב (${followUpModules.length})</h2>
    ${followUpModules.map(m => `
      <div class="module-item">
        <strong>${m.moduleNameHe}</strong>
        ${m.followUpNotes ? `<p>${m.followUpNotes}</p>` : ''}
      </div>
    `).join('')}
  </div>
  ` : ''}

  <div class="section">
    <h2>📝 כל המודולים</h2>
    <table>
      <thead>
        <tr>
          <th>מודול</th>
          <th>סטטוס</th>
          <th>הערות</th>
        </tr>
      </thead>
      <tbody>
        ${data.modules.map(m => `
          <tr>
            <td>${m.moduleNameHe}</td>
            <td><span class="status-badge status-${m.status}">${statusEmoji[m.status]} ${statusLabel[m.status]}</span></td>
            <td>${m.comments.length > 0 ? m.comments.length + ' הערות' : '-'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  ${allComments.length > 0 ? `
  <div class="section">
    <h2>💬 כל ההערות (${allComments.length})</h2>
    ${allComments.map(c => `
      <div class="comment ${c.type}">
        <strong>${c.moduleName}</strong>: ${c.text}
        <br><em style="color: #666;">מאת: ${c.author}</em>
      </div>
    `).join('')}
  </div>
  ` : ''}

  <div class="footer">
    <p>דו״ח זה נוצר אוטומטית על ידי מערכת QA Testing</p>
    <p>Dr Roni Sapir - Complementary Medicine Clinic</p>
  </div>
</body>
</html>
  `;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: QAReportRequest = await req.json();
    
    console.log("Sending QA report to:", data.recipientEmail);
    console.log("Summary:", data.summary);

    const html = generateEmailHtml(data);

    const emailResponse = await resend.emails.send({
      from: "TCM Clinic QA <onboarding@resend.dev>",
      to: [data.recipientEmail],
      subject: `📋 דו״ח QA: ${data.summary.percentage}% הושלם - ${data.summary.passed} עברו, ${data.summary.failed} נכשלו`,
      html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending QA report:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
