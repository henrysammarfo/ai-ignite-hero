import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ReportOptions {
  type: "FINMA" | "AML" | "Travel Rule" | "Performance";
  walletAddress: string;
  date?: string;
}

const MOCK_DATA = {
  FINMA: {
    title: "FINMA Compliance Report",
    subtitle: "Swiss Financial Market Supervisory Authority — Quarterly Summary",
    sections: [
      {
        heading: "1. Entity Overview",
        rows: [
          ["Reporting Entity", "Fortis Protocol AG (simulated)"],
          ["Jurisdiction", "Switzerland (FINMA-regulated)"],
          ["Reporting Period", "Q1 2026 (Jan 1 – Mar 31)"],
          ["Wallet Address", "{{WALLET}}"],
          ["Report Generated", "{{DATE}}"],
        ],
      },
      {
        heading: "2. KYC / Identity Verification",
        rows: [
          ["Provider", "Civic Pass (on-chain)"],
          ["Status", "✓ Verified"],
          ["Verification Level", "Institutional — Enhanced Due Diligence"],
          ["Gateway Token", "CivicGwy...8xKQ (Devnet)"],
          ["Last Reverification", "2026-02-15"],
        ],
      },
      {
        heading: "3. AML Screening",
        rows: [
          ["Provider", "TRM Labs"],
          ["Wallet Risk Score", "Low (2/100)"],
          ["Sanctions Match", "None"],
          ["Adverse Media", "None"],
          ["OFAC / EU / UN Lists", "Clear"],
          ["Last Screening", "2026-03-10T09:14:22Z"],
        ],
      },
      {
        heading: "4. Travel Rule Compliance",
        rows: [
          ["Provider", "Notabene (IVMS-101)"],
          ["Transfers Logged", "17"],
          ["Transfers Compliant", "17 / 17 (100%)"],
          ["Threshold Trigger", "≥ 1,000 CHF equivalent"],
          ["Last Transfer ID", "NTB-2026-0312-0017"],
        ],
      },
      {
        heading: "5. Vault Summary",
        rows: [
          ["Total Value Locked", "$2,450,000 USDC"],
          ["Vault Program", "Fortis Anchor (Devnet)"],
          ["PDA Authority", "FtsVault...9pRm"],
          ["Source-of-Funds Hash", "0x7a3f...c812 (SHA-256, on-chain)"],
          ["Current APY", "4.8% (Pyth-fed)"],
          ["Yield Accrued (Q1)", "$29,400.00"],
        ],
      },
    ],
    footer:
      "This report is generated for compliance demonstration purposes as part of the Fortis Protocol MVP (StableHacks 2026). It does not constitute a legally binding regulatory filing. All data shown is simulated on Solana Devnet.",
  },
  AML: {
    title: "AML Screening Summary",
    subtitle: "Anti-Money Laundering Risk Assessment via TRM Labs",
    sections: [
      {
        heading: "Screening Overview",
        rows: [
          ["Wallet Address", "{{WALLET}}"],
          ["Screening Date", "{{DATE}}"],
          ["Provider", "TRM Labs API v3"],
          ["Risk Rating", "Low (2/100)"],
        ],
      },
      {
        heading: "Risk Breakdown",
        rows: [
          ["OFAC Sanctions", "Clear"],
          ["EU Sanctions", "Clear"],
          ["UN Sanctions", "Clear"],
          ["Darknet Exposure", "0.00%"],
          ["Mixer Exposure", "0.00%"],
          ["Gambling Exposure", "0.00%"],
          ["Adverse Media Hits", "0"],
          ["High-Risk Jurisdiction", "No"],
        ],
      },
      {
        heading: "Transaction Pattern Analysis",
        rows: [
          ["Total Transactions (90d)", "42"],
          ["Avg Transaction Size", "$58,333"],
          ["Largest Transaction", "$500,000"],
          ["Counterparty Risk", "Low"],
          ["Structuring Detected", "No"],
        ],
      },
    ],
    footer:
      "AML screening powered by TRM Labs. Simulated data for Fortis Protocol MVP demonstration on Solana Devnet.",
  },
  "Travel Rule": {
    title: "Travel Rule Transfers Log",
    subtitle: "IVMS-101 Compliant Transfer Records via Notabene",
    sections: [
      {
        heading: "Summary",
        rows: [
          ["Wallet Address", "{{WALLET}}"],
          ["Report Date", "{{DATE}}"],
          ["Provider", "Notabene (IVMS-101)"],
          ["Total Transfers", "17"],
          ["Compliant", "17 / 17 (100%)"],
        ],
      },
    ],
    transferTable: {
      heading: "Transfer Log",
      headers: ["ID", "Date", "Amount", "Beneficiary", "Status"],
      rows: [
        ["NTB-0017", "2026-03-12", "$125,000", "0x8f2a...b41c", "✓ Compliant"],
        ["NTB-0016", "2026-03-10", "$80,000", "0x3d1e...7fa9", "✓ Compliant"],
        ["NTB-0015", "2026-03-08", "$200,000", "0xc44b...12de", "✓ Compliant"],
        ["NTB-0014", "2026-03-05", "$50,000", "0x91af...e3c7", "✓ Compliant"],
        ["NTB-0013", "2026-03-02", "$175,000", "0x6b8d...5a10", "✓ Compliant"],
        ["NTB-0012", "2026-02-28", "$300,000", "0xd72c...89f4", "✓ Compliant"],
        ["NTB-0011", "2026-02-25", "$95,000", "0xa1f3...c602", "✓ Compliant"],
      ],
    },
    footer:
      "Travel Rule compliance via Notabene IVMS-101 standard. Simulated data for Fortis Protocol MVP.",
  },
  Performance: {
    title: "Vault Performance Report",
    subtitle: "Yield & Portfolio Analytics — Pyth Oracle-Fed Data",
    sections: [
      {
        heading: "Portfolio Overview",
        rows: [
          ["Wallet Address", "{{WALLET}}"],
          ["Report Date", "{{DATE}}"],
          ["Total Deposited", "$2,450,000 USDC"],
          ["Current Value", "$2,479,400 USDC"],
          ["Total Yield Earned", "$29,400.00"],
          ["Current APY", "4.8%"],
        ],
      },
      {
        heading: "Monthly Breakdown (Q1 2026)",
        rows: [
          ["January 2026", "+$8,200 (4.6% APY)"],
          ["February 2026", "+$9,800 (4.7% APY)"],
          ["March 2026 (to date)", "+$11,400 (4.8% APY)"],
        ],
      },
      {
        heading: "Risk Metrics",
        rows: [
          ["Max Drawdown", "0.0% (stablecoin vault)"],
          ["Volatility (30d)", "< 0.01%"],
          ["Oracle Feed", "Pyth USDC/USD"],
          ["Feed Confidence", "±0.0001"],
          ["Last Price Update", "2026-03-12T14:22:00Z"],
        ],
      },
    ],
    footer:
      "Performance data derived from Pyth Network oracle feeds. Simulated for Fortis Protocol MVP on Solana Devnet.",
  },
};

export function generateReport({ type, walletAddress, date }: ReportOptions): void {
  const now = date || new Date().toISOString().split("T")[0];
  const data = MOCK_DATA[type];
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = 20;

  const addPageIfNeeded = (needed: number) => {
    if (y + needed > 270) {
      doc.addPage();
      y = 20;
    }
  };

  // Header bar
  doc.setFillColor(26, 26, 26);
  doc.rect(0, 0, pageWidth, 40, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(212, 175, 55);
  doc.text("FORTIS", margin, 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text("Institutional Compliance Infrastructure", margin, 25);
  doc.text(`Generated: ${now}`, margin, 31);
  doc.text(`Wallet: ${walletAddress}`, pageWidth - margin, 31, { align: "right" });

  y = 50;

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(30, 30, 30);
  doc.text(data.title, margin, y);
  y += 7;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(data.subtitle, margin, y);
  y += 4;

  // Divider
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // Sections
  for (const section of data.sections) {
    addPageIfNeeded(20);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(30, 30, 30);
    doc.text(section.heading, margin, y);
    y += 3;

    const tableRows = section.rows.map((row) =>
      row.map((cell) =>
        cell.replace("{{WALLET}}", walletAddress).replace("{{DATE}}", now)
      )
    );

    autoTable(doc, {
      startY: y,
      head: [],
      body: tableRows,
      theme: "plain",
      margin: { left: margin, right: margin },
      styles: {
        fontSize: 9,
        cellPadding: 3,
        textColor: [60, 60, 60],
        lineColor: [230, 230, 230],
        lineWidth: 0.1,
      },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 55, textColor: [30, 30, 30] },
      },
      didDrawPage: () => {
        y = 20;
      },
    });

    y = (doc as any).lastAutoTable.finalY + 8;
  }

  // Transfer table (Travel Rule only)
  if ("transferTable" in data && data.transferTable) {
    const tt = data.transferTable;
    addPageIfNeeded(30);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(30, 30, 30);
    doc.text(tt.heading, margin, y);
    y += 3;

    autoTable(doc, {
      startY: y,
      head: [tt.headers],
      body: tt.rows,
      theme: "grid",
      margin: { left: margin, right: margin },
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: {
        fillColor: [26, 26, 26],
        textColor: [212, 175, 55],
        fontStyle: "bold",
      },
    });

    y = (doc as any).lastAutoTable.finalY + 8;
  }

  // Footer disclaimer
  addPageIfNeeded(25);
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  doc.setFont("helvetica", "italic");
  doc.setFontSize(7);
  doc.setTextColor(140, 140, 140);
  const footerLines = doc.splitTextToSize(data.footer, pageWidth - margin * 2);
  doc.text(footerLines, margin, y);

  // Save
  const filename = `Fortis_${type.replace(/\s/g, "_")}_${now}.pdf`;
  doc.save(filename);
}
