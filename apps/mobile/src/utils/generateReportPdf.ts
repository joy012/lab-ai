import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

interface LabValue {
  test: string;
  value: number | string;
  unit: string;
  referenceRange: string;
  status: "normal" | "high" | "low" | "critical";
}

interface Recommendations {
  diet?: string[];
  lifestyle?: string[];
  followUp?: string[];
}

interface ReportData {
  title?: string;
  summary?: string;
  summaryBn?: string;
  riskScore?: number | null;
  values?: LabValue[];
  recommendations?: Recommendations;
  labName?: string;
  reportDate?: string;
  createdAt: string;
  patientName?: string;
}

function getStatusColor(status: string): string {
  switch (status) {
    case "critical":
      return "#DC2626";
    case "high":
      return "#D97706";
    case "low":
      return "#0284C7";
    default:
      return "#16A34A";
  }
}

function getStatusBg(status: string): string {
  switch (status) {
    case "critical":
      return "#FEF2F2";
    case "high":
      return "#FFFBEB";
    case "low":
      return "#F0F9FF";
    default:
      return "#F0FDF4";
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case "critical":
      return "CRITICAL";
    case "high":
      return "HIGH";
    case "low":
      return "LOW";
    default:
      return "NORMAL";
  }
}

function getRiskLabel(score: number): { text: string; color: string } {
  if (score > 70) return { text: "High Risk", color: "#DC2626" };
  if (score > 30) return { text: "Moderate Risk", color: "#D97706" };
  return { text: "Low Risk", color: "#16A34A" };
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function buildLabValuesTable(values: LabValue[]): string {
  if (!values || values.length === 0) return "";

  const rows = values
    .map(
      (v) => `
    <tr>
      <td style="padding: 10px 12px; font-weight: 500; color: #0F172A;">${v.test}</td>
      <td style="padding: 10px 12px; font-weight: 700; color: ${getStatusColor(v.status)};">
        ${v.value} ${v.unit}
      </td>
      <td style="padding: 10px 12px; color: #64748B; font-size: 12px;">${v.referenceRange}</td>
      <td style="padding: 10px 12px; text-align: center;">
        <span style="
          display: inline-block;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.5px;
          color: ${getStatusColor(v.status)};
          background: ${getStatusBg(v.status)};
        ">${getStatusLabel(v.status)}</span>
      </td>
    </tr>`,
    )
    .join("");

  return `
    <div style="margin-bottom: 24px;">
      <h2 style="font-size: 16px; font-weight: 700; color: #0F172A; margin-bottom: 12px; display: flex; align-items: center;">
        <span style="display: inline-block; width: 4px; height: 20px; background: #2563EB; border-radius: 2px; margin-right: 10px;"></span>
        Lab Values (${values.length} tests)
      </h2>
      <table style="width: 100%; border-collapse: collapse; border: 1px solid #E2E8F0; border-radius: 8px; overflow: hidden;">
        <thead>
          <tr style="background: #F8FAFC;">
            <th style="padding: 10px 12px; text-align: left; font-size: 12px; font-weight: 600; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px;">Test</th>
            <th style="padding: 10px 12px; text-align: left; font-size: 12px; font-weight: 600; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px;">Result</th>
            <th style="padding: 10px 12px; text-align: left; font-size: 12px; font-weight: 600; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px;">Reference</th>
            <th style="padding: 10px 12px; text-align: center; font-size: 12px; font-weight: 600; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>`;
}

function buildRecommendations(recs: Recommendations): string {
  const sections: string[] = [];

  if (recs.diet && recs.diet.length > 0) {
    sections.push(buildRecSection("Diet & Nutrition", "#16A34A", "#F0FDF4", recs.diet));
  }
  if (recs.lifestyle && recs.lifestyle.length > 0) {
    sections.push(buildRecSection("Lifestyle", "#2563EB", "#EFF6FF", recs.lifestyle));
  }
  if (recs.followUp && recs.followUp.length > 0) {
    sections.push(buildRecSection("Follow-up Actions", "#D97706", "#FFFBEB", recs.followUp));
  }

  if (sections.length === 0) return "";

  return `
    <div style="margin-bottom: 24px;">
      <h2 style="font-size: 16px; font-weight: 700; color: #0F172A; margin-bottom: 12px; display: flex; align-items: center;">
        <span style="display: inline-block; width: 4px; height: 20px; background: #16A34A; border-radius: 2px; margin-right: 10px;"></span>
        Recommendations
      </h2>
      ${sections.join("")}
    </div>`;
}

function buildRecSection(title: string, color: string, bg: string, items: string[]): string {
  const list = items.map((item) => `<li style="margin-bottom: 6px; line-height: 1.5;">${item}</li>`).join("");
  return `
    <div style="background: ${bg}; border-radius: 8px; padding: 14px 16px; margin-bottom: 10px; border-left: 3px solid ${color};">
      <h3 style="font-size: 13px; font-weight: 700; color: ${color}; margin: 0 0 8px 0;">${title}</h3>
      <ul style="margin: 0; padding-left: 18px; font-size: 13px; color: #334155;">${list}</ul>
    </div>`;
}

function buildCriticalAlert(values: LabValue[]): string {
  const critical = values.filter((v) => v.status === "critical");
  if (critical.length === 0) return "";

  const items = critical
    .map((v) => `<li style="margin-bottom: 4px;">${v.test}: <strong>${v.value} ${v.unit}</strong> (Ref: ${v.referenceRange})</li>`)
    .join("");

  return `
    <div style="background: #FEF2F2; border: 1px solid #FECACA; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
      <h3 style="font-size: 14px; font-weight: 700; color: #DC2626; margin: 0 0 8px 0;">&#9888; Critical Values Detected</h3>
      <ul style="margin: 0; padding-left: 18px; font-size: 13px; color: #991B1B;">${items}</ul>
      <p style="font-size: 12px; color: #DC2626; margin: 10px 0 0 0; font-style: italic;">Please consult your doctor immediately about these values.</p>
    </div>`;
}

export function buildReportHtml(report: ReportData): string {
  const values = (report.values || []) as LabValue[];
  const recs = (report.recommendations || {}) as Recommendations;
  const riskInfo = report.riskScore != null ? getRiskLabel(report.riskScore) : null;

  const reportDateStr = report.reportDate
    ? formatDate(report.reportDate)
    : null;
  const generatedDate = formatDate(new Date().toISOString());

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #0F172A;
      background: #fff;
      font-size: 14px;
      line-height: 1.6;
      padding: 0;
    }
    @page { margin: 40px 32px; }
    table { font-size: 13px; }
  </style>
</head>
<body>
  <!-- Header -->
  <div style="background: linear-gradient(135deg, #1E40AF, #2563EB); padding: 28px 32px; color: #fff; margin-bottom: 24px;">
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div>
        <h1 style="font-size: 26px; font-weight: 800; letter-spacing: -0.5px; margin-bottom: 2px;">LabAI</h1>
        <p style="font-size: 12px; opacity: 0.85; letter-spacing: 1px; text-transform: uppercase;">AI-Powered Lab Report Analysis</p>
      </div>
      <div style="text-align: right;">
        <p style="font-size: 12px; opacity: 0.7;">Generated</p>
        <p style="font-size: 14px; font-weight: 600;">${generatedDate}</p>
      </div>
    </div>
  </div>

  <div style="padding: 0 8px;">
    <!-- Report Title & Meta -->
    <div style="margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #E2E8F0;">
      <h1 style="font-size: 20px; font-weight: 700; color: #0F172A; margin-bottom: 10px;">
        ${report.title || "Lab Report"}
      </h1>
      <div style="display: flex; gap: 24px; flex-wrap: wrap;">
        ${report.labName ? `<div><span style="font-size: 11px; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.5px;">Lab</span><p style="font-size: 14px; font-weight: 500; margin-top: 2px;">${report.labName}</p></div>` : ""}
        ${reportDateStr ? `<div><span style="font-size: 11px; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.5px;">Report Date</span><p style="font-size: 14px; font-weight: 500; margin-top: 2px;">${reportDateStr}</p></div>` : ""}
        <div>
          <span style="font-size: 11px; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.5px;">Uploaded</span>
          <p style="font-size: 14px; font-weight: 500; margin-top: 2px;">${formatDate(report.createdAt)}</p>
        </div>
      </div>
    </div>

    <!-- Risk Score -->
    ${
      riskInfo && report.riskScore != null
        ? `
    <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 24px; padding: 20px; background: #F8FAFC; border-radius: 12px; border: 1px solid #E2E8F0;">
      <div style="
        width: 80px; height: 80px; border-radius: 50%;
        border: 4px solid ${riskInfo.color};
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        flex-shrink: 0;
      ">
        <span style="font-size: 28px; font-weight: 800; color: ${riskInfo.color}; line-height: 1;">${report.riskScore}</span>
        <span style="font-size: 9px; color: #94A3B8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Risk</span>
      </div>
      <div>
        <p style="font-size: 16px; font-weight: 700; color: ${riskInfo.color}; margin-bottom: 4px;">${riskInfo.text}</p>
        <p style="font-size: 13px; color: #64748B;">
          ${report.riskScore > 70 ? "Several values are outside normal range. Please consult your doctor promptly." : report.riskScore > 30 ? "Some values need attention. Monitor closely and consider a follow-up." : "Your results are mostly within normal range. Keep up the good work!"}
        </p>
      </div>
    </div>`
        : ""
    }

    <!-- Critical Alert -->
    ${buildCriticalAlert(values)}

    <!-- AI Interpretation -->
    ${
      report.summary
        ? `
    <div style="margin-bottom: 24px;">
      <h2 style="font-size: 16px; font-weight: 700; color: #0F172A; margin-bottom: 12px; display: flex; align-items: center;">
        <span style="display: inline-block; width: 4px; height: 20px; background: #7C3AED; border-radius: 2px; margin-right: 10px;"></span>
        AI Interpretation
      </h2>
      <div style="background: #F8FAFC; border-radius: 8px; padding: 16px; border: 1px solid #E2E8F0;">
        <p style="font-size: 14px; color: #334155; line-height: 1.7; white-space: pre-line;">${report.summary}</p>
      </div>
    </div>`
        : ""
    }

    <!-- Bengali Summary -->
    ${
      report.summaryBn
        ? `
    <div style="margin-bottom: 24px;">
      <h2 style="font-size: 16px; font-weight: 700; color: #0F172A; margin-bottom: 12px; display: flex; align-items: center;">
        <span style="display: inline-block; width: 4px; height: 20px; background: #7C3AED; border-radius: 2px; margin-right: 10px;"></span>
        &#2476;&#2494;&#2434;&#2482;&#2494; &#2476;&#2509;&#2479;&#2494;&#2454;&#2509;&#2479;&#2494;
      </h2>
      <div style="background: #F8FAFC; border-radius: 8px; padding: 16px; border: 1px solid #E2E8F0;">
        <p style="font-size: 14px; color: #334155; line-height: 1.8; white-space: pre-line;">${report.summaryBn}</p>
      </div>
    </div>`
        : ""
    }

    <!-- Lab Values Table -->
    ${buildLabValuesTable(values)}

    <!-- Recommendations -->
    ${buildRecommendations(recs)}

    <!-- Disclaimer -->
    <div style="margin-top: 32px; padding: 16px; background: #FFFBEB; border-radius: 8px; border: 1px solid #FDE68A;">
      <p style="font-size: 11px; color: #92400E; font-weight: 600; margin-bottom: 4px;">DISCLAIMER</p>
      <p style="font-size: 11px; color: #92400E; line-height: 1.6;">
        This report was generated by an AI system and is intended for informational purposes only. It does not constitute medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional for medical decisions. Reference ranges may vary by laboratory and individual factors.
      </p>
    </div>

    <!-- Footer -->
    <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #E2E8F0; text-align: center;">
      <p style="font-size: 11px; color: #94A3B8;">
        Generated by <strong style="color: #2563EB;">LabAI</strong> &mdash; AI-Powered Lab Report Interpreter
      </p>
    </div>
  </div>
</body>
</html>`;
}

export async function generateAndSharePdf(report: ReportData): Promise<void> {
  const html = buildReportHtml(report);
  const title = report.title || "Lab Report";
  const safeName = title.replace(/[^a-zA-Z0-9-_ ]/g, "").replace(/\s+/g, "-");

  const { uri } = await Print.printToFileAsync({
    html,
    base64: false,
  });

  await Sharing.shareAsync(uri, {
    mimeType: "application/pdf",
    dialogTitle: `Share ${title}`,
    UTI: "com.adobe.pdf",
  });
}
