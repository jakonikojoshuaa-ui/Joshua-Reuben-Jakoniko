/**
 * SPDX-License-Identifier: Apache-2.0
 * ERICON Premium Corporate Export Branding Framework
 * Standardizes Excel worksheets and PDF documents to official institutional standards.
 */

import { jsPDF } from 'jspdf';
import { GOOGLE_DRIVE_LOGO_URL, getEriconLogoDataUrl, getLogoFitDimensions, getLogoAspectRatio } from './ericonLogoDraw';

// ERICON corporate branding color definitions
export const ERICON_COLORS = {
  primaryGreenBg: '#15462D',      // Hex for brand deep green
  textWhite: '#FFFFFF',
  accentGold: '#C5A02B',          // Prestigious Gold branding color
  accentGoldLight: '#FDFBF7',     // Soft gold tinted bg
  neutralSlateBg: '#F8FAFC',      // Alternating row shade
  borderLight: '#CBD5E1',         // Clean soft gray grid borders
};

/**
 * Downloads a premium-styled Excel-compatible Spreadsheet.
 * Leverages structured HTML/XML layout rules that modern Microsoft Excel interprets 
 * with pixel-perfect background colors, bold display titles, a grid framework,
 * and high-fidelity embedded logo imagery.
 */
export function exportPremiumExcelSpreadsheet(
  filename: string,
  reportTitle: string,
  subtitle: string,
  headers: string[],
  rows: any[][],
  metadataFields?: Record<string, string>
) {
  const finalFilename = filename.endsWith('.xls') ? filename : `${filename}.xls`;
  const defaultMeta = {
    'Project Name': 'ERICON Bio-Integrated Direct Transit & Containment Program',
    'Study Area': 'Tanzania Collaborative Research Nodes',
    'Date Generated': new Date().toUTCString(),
    'Principal Investigator': 'Dr. Severine Jenkins & Lead Regional Biologists',
    'Report Version': 'v4.5.2-Compliance-Stable'
  };

  const meta = { ...defaultMeta, ...metadataFields };

  const excelLogoHeight = 70;
  const excelLogoWidth = Math.round(excelLogoHeight * getLogoAspectRatio());

  // Setup rich HTML spreadsheet with special XML definitions for Excel worksheets
  let html = `
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <!--[if gte mso 9]>
  <xml>
    <x:ExcelWorkbook>
      <x:ExcelWorksheets>
        <x:ExcelWorksheet>
          <x:Name>ERICON Active Ledger</x:Name>
          <x:WorksheetOptions>
            <x:DisplayGridlines/>
            <x:FreezePanes/>
            <x:SplitHorizontal>7</x:SplitHorizontal>
            <x:TopRowBottomPane>7</x:TopRowBottomPane>
            <x:ActivePane>2</x:ActivePane>
          </x:WorksheetOptions>
        </x:ExcelWorksheet>
      </x:ExcelWorksheets>
    </x:ExcelWorkbook>
  </xml>
  <![endif]-->
  <style>
    body {
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      margin: 0;
      padding: 0;
      color: #1e293b;
    }
    table {
      border-collapse: collapse;
      width: 100%;
    }
    .header-banner {
      background-color: ${ERICON_COLORS.primaryGreenBg};
      color: ${ERICON_COLORS.textWhite};
      text-align: left;
      height: 75px;
    }
    .header-logo-cell {
      background-color: ${ERICON_COLORS.primaryGreenBg};
      vertical-align: middle;
      text-align: center;
      width: 90px;
    }
    .header-title-cell {
      background-color: ${ERICON_COLORS.primaryGreenBg};
      color: ${ERICON_COLORS.textWhite};
      font-size: 16pt;
      font-weight: bold;
      vertical-align: middle;
      padding-left: 15px;
    }
    .header-gold-bar {
      background-color: ${ERICON_COLORS.accentGold};
      height: 4px;
      font-size: 1px;
      line-height: 1px;
    }
    .meta-title {
      font-weight: bold;
      background-color: #f1f5f9;
      color: #334155;
      font-size: 9pt;
      padding: 6px 12px;
      border: 1px solid #e2e8f0;
      width: 180px;
    }
    .meta-value {
      color: #0f172a;
      font-size: 9pt;
      padding: 6px 12px;
      border: 1px solid #e2e8f0;
      background-color: #ffffff;
    }
    .data-th {
      background-color: ${ERICON_COLORS.primaryGreenBg};
      color: ${ERICON_COLORS.textWhite};
      font-weight: bold;
      font-size: 10pt;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 10px 14px;
      border: 1.5px solid #1c5436;
      text-align: left;
    }
    .data-td {
      font-size: 9.5pt;
      padding: 8px 14px;
      border: 1px solid ${ERICON_COLORS.borderLight};
      vertical-align: middle;
    }
    .row-even {
      background-color: ${ERICON_COLORS.neutralSlateBg};
    }
    .row-odd {
      background-color: #ffffff;
    }
    .status-highlight-green {
      color: #15462D;
      font-weight: bold;
      background-color: #ecfdf5;
    }
    .status-highlight-gold {
      color: #b45309;
      font-weight: bold;
      background-color: #fef3c7;
    }
    .footer-cell {
      background-color: ${ERICON_COLORS.accentGold};
      color: ${ERICON_COLORS.primaryGreenBg};
      font-size: 8.5pt;
      font-weight: bold;
      font-style: italic;
      padding: 10px 14px;
      text-align: center;
    }
  </style>
</head>
<body>

  <table>
    <!-- Top Branded Header -->
    <tr style="height: 75px;">
      <td class="header-logo-cell" colspan="1" rowspan="2">
        <!-- Display official ERICON Logo prominently with responsive fallback sizing -->
        <img src="${GOOGLE_DRIVE_LOGO_URL}" width="${excelLogoWidth}" height="${excelLogoHeight}" alt="ERICON" style="display:block; margin:auto;" />
      </td>
      <td class="header-title-cell" colspan="${headers.length - 1}">
        ${reportTitle.toUpperCase()}
      </td>
    </tr>
    <tr style="height: 25px; background-color: ${ERICON_COLORS.primaryGreenBg};">
      <td colspan="${headers.length - 1}" style="color: #cbd5e1; font-size: 10pt; font-style: italic; padding-left: 15px; vertical-align: top;">
        ${subtitle}
      </td>
    </tr>
    
    <!-- Accent Gold Bar spacer -->
    <tr style="height: 6px;">
      <td class="header-gold-bar" colspan="${headers.length}">&nbsp;</td>
    </tr>

    <!-- Empty Metadata space row -->
    <tr style="height: 12px;"><td colspan="${headers.length}">&nbsp;</td></tr>

    <!-- Metadata Section -->
    <tr>
      <td class="meta-title">REPORT TYPE</td>
      <td class="meta-value" colspan="${headers.length - 1}">Scientific Research Compliance Log</td>
    </tr>
  `;

  // Dynamic Metadata key-values
  Object.entries(meta).forEach(([key, val]) => {
    html += `
    <tr>
      <td class="meta-title">${key.toUpperCase()}</td>
      <td class="meta-value" colspan="${headers.length - 1}">${val}</td>
    </tr>`;
  });

  html += `
    <tr style="height: 20px;"><td colspan="${headers.length}">&nbsp;</td></tr>

    <!-- Main Table Column Headers -->
    <tr style="height: 38px;">
  `;

  headers.forEach(h => {
    html += `<th class="data-th">${h}</th>`;
  });

  html += `</tr>`;

  // Draw Grid Rows with alternating backgrounds
  rows.forEach((row, rIdx) => {
    const rowClass = rIdx % 2 === 0 ? 'row-even' : 'row-odd';
    html += `<tr style="height: 28px;" class="${rowClass}">`;
    row.forEach(cell => {
      const cellVal = cell === null || cell === undefined ? '' : String(cell);
      
      // Add custom styles for standard biosecurity or simulation labels representing safety status
      let highlightClass = '';
      if (cellVal === 'COMPLIANT' || cellVal === 'NOMINAL' || cellVal === 'VERIFIED' || cellVal === 'ACTIVE' || cellVal === 'SAFE') {
        highlightClass = ' status-highlight-green';
      } else if (cellVal === 'WARNING' || cellVal === 'ATTENTION' || cellVal === 'ALERT' || cellVal === 'SIGNED') {
        highlightClass = ' status-highlight-gold';
      }

      html += `<td class="data-td${highlightClass}">${cellVal}</td>`;
    });
    html += '</tr>';
  });

  // Footer Row
  html += `
    <tr style="height: 25px;"><td colspan="${headers.length}">&nbsp;</td></tr>
    <tr style="height: 35px;">
      <td class="footer-cell" colspan="${headers.length}">
        AUTHENTIC ERICON DIGITAL EXPORT // EXPORT TIMESTAMP: ${new Date().toISOString()} // SECURE REPOSITORY IDENTIFICATION SEAL APPROVED.
      </td>
    </tr>
  </table>

</body>
</html>`;

  // Trigger spreadsheet file download
  const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const downloadLink = document.createElement('a');
  downloadLink.href = url;
  downloadLink.setAttribute('download', finalFilename);
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(url);
}

/**
 * Applies professional ERICON Institutional Branding elements to a jsPDF instance.
 * Embeds a deep green background banner, a gold accent ribbon underneath,
 * prominent official logo, styled research/security headings, and a page footer.
 */
export function applyPdfPageGoldBranding(
  doc: jsPDF,
  title: string,
  subtitle: string,
  pageNumber = 1,
  totalPages = 1
) {
  const pageHeight = doc.internal.pageSize.height || 297;
  const pageWidth = doc.internal.pageSize.width || 210;

  // 1. Draw top brand deep green header block
  doc.setFillColor(21, 70, 45); // `#15462D`
  doc.rect(0, 0, pageWidth, 38, 'F');

  // 2. Add high-fidelity ERICON logo on the right side (within a neat, modern square shield card)
  try {
    const ericonLogoData = getEriconLogoDataUrl();
    const ratio = getLogoAspectRatio() || (162 / 186);
    const cardHeight = 25;
    const cardWidth = cardHeight * ratio;
    const xPos = pageWidth - 14 - cardWidth;
    const yPos = 6.5; // beautifully centered vertically in the 38mm deep green header

    // Draw card background (White with slightly rounded corners)
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(xPos, yPos, cardWidth, cardHeight, 1.8, 1.8, 'F');

    // Draw a thin golden border around the card for extreme premium quality
    doc.setDrawColor(197, 160, 43); // Gold `#C5A02B`
    doc.setLineWidth(0.4);
    doc.roundedRect(xPos, yPos, cardWidth, cardHeight, 1.8, 1.8, 'S');

    // Get proportional snug fit dimensions for the trimmed logo inside the card
    const padding = 1.6;
    const logoW = cardWidth - (padding * 2);
    const logoH = cardHeight - (padding * 2);
    const logoX = xPos + padding;
    const logoY = yPos + padding;

    doc.addImage(ericonLogoData, 'PNG', logoX, logoY, logoW, logoH);
  } catch (err) {
    // fallback if external image URL load is blocked in direct PDF stream
    const ratio = getLogoAspectRatio() || (162 / 186);
    const cardHeight = 25;
    const cardWidth = cardHeight * ratio;
    const xPos = pageWidth - 14 - cardWidth;
    const yPos = 6.5;
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(xPos, yPos, cardWidth, cardHeight, 1.8, 1.8, 'F');
    doc.setDrawColor(197, 160, 43);
    doc.setLineWidth(0.4);
    doc.roundedRect(xPos, yPos, cardWidth, cardHeight, 1.8, 1.8, 'S');
    
    doc.setTextColor(21, 70, 45);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.text('ERICON', xPos + (cardWidth - 11.5) / 2, yPos + cardHeight / 2 + 1);
  }

  // 3. Gold Accent Divider Stripe under header banner
  doc.setFillColor(197, 160, 43); // Gold `#C5A02B`
  doc.rect(0, 38, pageWidth, 3, 'F');

  // 4. Header Text Styling
  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(title.toUpperCase(), 14, 16);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(196, 224, 208); // lighter muted brand green text
  doc.text(subtitle, 14, 25);
  doc.text(`SECURITY ENCLAVE CODE: ERICON-SEC-REF-${Date.now().toString().slice(-6)}`, 14, 30);

  // 5. Draw persistent ERICON bottom footer bar with page numbering and security clearance seal
  doc.setDrawColor(197, 160, 43); // Gold bottom line
  doc.setLineWidth(0.5);
  doc.line(14, pageHeight - 16, pageWidth - 14, pageHeight - 16);

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(21, 70, 45); // deep green
  doc.text('AUTHENTIC ERICON CONSERVATION RECORD', 14, pageHeight - 10);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(115, 125, 135);
  doc.text('// CLUSTER LEVEL-4 BIOSECURITY PROTOCOLS SECURE // GOVERNANCE SEAL CERTIFIED', 75, pageHeight - 10);

  doc.setFont('Helvetica', 'bold');
  doc.text(`PAGE ${pageNumber} OF ${totalPages}`, pageWidth - 32, pageHeight - 10);
}
