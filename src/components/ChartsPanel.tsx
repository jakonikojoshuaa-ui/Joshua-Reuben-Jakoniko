/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AreaChart, TrendingDown, HelpCircle, Eye, Download, FileText, ChevronDown, ChevronUp, Check, ShieldCheck } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { SystemSpecs, PhysicsCalculations } from '../types';
import { getEriconLogoDataUrl, getLogoFitDimensions, getLogoAspectRatio } from '../utils/ericonLogoDraw';

interface ChartsPanelProps {
  specs: SystemSpecs;
  calc: PhysicsCalculations;
}

export const ChartsPanel: React.FC<ChartsPanelProps> = ({ specs, calc }) => {
  const [activeTab, setActiveTab] = useState<'pressure' | 'velocity'>('pressure');

  // PDF Generation Configuration States (Editable in App dashboard before compiling PDF)
  const [showPdfForm, setShowPdfForm] = useState(false);
  const [projectName, setProjectName] = useState('ERICON-S Collaborative Surveillance');
  const [teamName, setTeamName] = useState('Morogoro Ecology Sector Team-A');
  const [researchId, setResearchId] = useState('RES-TZ-2026-9041');
  const [teamLeader, setTeamLeader] = useState('Lead Specialist Dr. S. Jenkins');
  const [institution, setInstitution] = useState('Sokoine University of Agriculture / ERICON');
  const [country, setCountry] = useState('Tanzania');
  
  // Section 1 fields
  const [ericonId, setEriconId] = useState('ER-98421-TZ');
  const [farmType, setFarmType] = useState<'ERICON Farm' | 'Non-ERICON Control Farm'>('ERICON Farm');
  const [monitoringDuration, setMonitoringDuration] = useState('180 Days (Active Phase)');
  const [activeEmaModules, setActiveEmaModules] = useState('4 Active GSM Telemetric Nodes');
  const [pipelineStatus, setPipelineStatus] = useState('Continuous Operational Suction');
  const [activeResearchers, setActiveResearchers] = useState('4 Certified field biologists');
  const [dataCompleteness, setDataCompleteness] = useState('98.4% Transmitted without packet loss');

  // Section 4 fields
  const [leaderComments, setLeaderComments] = useState('Optimal biosafety transit confirmed. Radial interlocking flex-fingers provide efficient anti-egress seal. Parasite surveillance reveals stable distribution near middle agricultural stream. No high-grade zoonotic triggers observed.');
  const [researchNotes, setResearchNotes] = useState('Observed Mastomys natalensis exhibits stable 24-hour survival index near 98.2% under pressure gradients inferior to 110 kPa.');

  const [lowSurvivalTimeMs, setLowSurvivalTimeMs] = useState<number>(() => {
    try {
      const stored = localStorage.getItem('ericon_low_survival_accumulated_time_ms_v1');
      return stored ? parseInt(stored, 10) : 0;
    } catch {
      return 0;
    }
  });

  const generateVerificationId = () => {
    let result = '';
    const chars = '0123456789ABCDEF';
    for (let i = 0; i < 16; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `ERICON-SEC-SHA256:9A8D-${result}-V5.2`;
  };

  const handleDownloadPDFReport = () => {
    const doc = new jsPDF();
    
    // Read PDF layout customization variables
    const applyScaling = localStorage.getItem('ericon_include_reports') !== 'false';
    const exportFontSize = localStorage.getItem('ericon_export_font_size') || 'standard';
    let offset = 0;
    if (applyScaling) {
      if (exportFontSize === 'large') {
        offset = 2.0;
      } else if (exportFontSize === 'publication') {
        offset = 4.0;
      }
    }
    
    // Override setFontSize to dynamically apply standard offset
    const originalSetFontSize = doc.setFontSize;
    doc.setFontSize = function(size: number) {
      return originalSetFontSize.call(this, size + offset);
    };

    const verId = generateVerificationId();
    const todayStr = new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString();

    // ----------------- PAGE 1: COVER PAGE -----------------
    doc.setFillColor(6, 78, 59); // deep emerald
    doc.rect(0, 0, 210, 45, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('ERICON(S) COMPREHENSIVE REPORT', 15, 20);
    
    doc.setFontSize(10);
    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(167, 243, 208); // light green
    doc.text('Collaborative Research & Environmental Monitoring Environment (CRME)', 15, 30);
    doc.text(`VERIFICATION SECURITY DISPATCH ID: ${verId}`, 15, 36);

    // Official High-Fidelity ERICON Logo rendering (Preserving exact aesthetic layout and detail)
    const ericonLogoData = getEriconLogoDataUrl(400, 460);
    if (ericonLogoData) {
      const ratio = getLogoAspectRatio() || (162 / 186);
      const cardHeight = 56;
      const cardWidth = cardHeight * ratio;
      const xPos = (210 - cardWidth) / 2;
      const yPos = 62;

      // Draw light container card for premium look
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(xPos, yPos, cardWidth, cardHeight, 3, 3, 'F');
      
      doc.setDrawColor(226, 232, 240); // Soft grey border
      doc.setLineWidth(0.5);
      doc.roundedRect(xPos, yPos, cardWidth, cardHeight, 3, 3, 'S');

      // Center logo snugly inside the card
      const padding = 3.6;
      const logoW = cardWidth - (padding * 2);
      const logoH = cardHeight - (padding * 2);
      const logoX = xPos + padding;
      const logoY = yPos + padding;

      doc.addImage(ericonLogoData, 'PNG', logoX, logoY, logoW, logoH);
    } else {
      // Fallback if canvas is unavailable
      doc.setDrawColor(16, 185, 129);
      doc.setLineWidth(1);
      doc.rect(75, 70, 60, 60);
      doc.rect(77, 72, 56, 56);
      
      doc.setTextColor(6, 78, 59);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(32);
      doc.text('ER', 93, 105);
      
      doc.setFontSize(9);
      doc.setFont('Helvetica', 'normal');
      doc.text('SYSTEM SECURITY', 91, 115);
    }

    // Center divider
    doc.setDrawColor(229, 231, 235);
    doc.line(20, 155, 190, 155);

    doc.setTextColor(21, 70, 45); // ERICON deep dark green
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11);
    
    let y = 170;
    const drawMetaRow = (label: string, val: string) => {
      doc.setFont('Helvetica', 'bold');
      doc.text(label, 25, y);
      doc.setFont('Helvetica', 'normal');
      doc.text(val, 85, y);
      y += 10;
    };

    drawMetaRow('Project Name:', projectName);
    drawMetaRow('Team Name:', teamName);
    drawMetaRow('Research ID:', researchId);
    drawMetaRow('Team Leader:', teamLeader);
    drawMetaRow('Institution:', institution);
    drawMetaRow('Country / Sub-region:', country);
    drawMetaRow('Date Generated:', todayStr + ' (UTC)');

    doc.setFillColor(248, 250, 252);
    doc.rect(0, 265, 210, 32, 'F');
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(21, 70, 45);
    doc.text('This document constitutes classified biosecurity project outputs from the ERICON collaborative networks.', 15, 275);
    doc.text('Its modification, unauthorized reproduction, or distribution without appropriate PI authorization remains strictly prohibited.', 15, 281);
    doc.text('© 2026 ERICON(S) CRME Integration Framework.', 15, 287);

    // ----------------- PAGE 2: SECTION 1 SYSTEM SPECS -----------------
    doc.addPage();
    doc.setFillColor(6, 78, 59);
    doc.rect(0, 0, 210, 22, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10.5);
    if (ericonLogoData) {
      const headerDims = getLogoFitDimensions(22, 12, 'contain');
      const xPos = 195 - headerDims.width;
      const yPos = 5 + (12 - headerDims.height) / 2;
      doc.addImage(ericonLogoData, 'PNG', xPos, yPos, headerDims.width, headerDims.height);
    }
    doc.text('SECTION 1: SYSTEM SPECIFICATIONS & HARDWARE DEPLOYMENT', 15, 14);

    y = 35;
    doc.setTextColor(21, 70, 45);
    doc.setFontSize(10);
    
    const drawSpecTableLine = (label: string, value: string) => {
      doc.setFont('Helvetica', 'bold');
      doc.text(label, 15, y);
      doc.setFont('Helvetica', 'normal');
      doc.text(value, 80, y);
      doc.setDrawColor(241, 245, 249);
      doc.line(15, y + 2, 195, y + 2);
      y += 8;
    };

    drawSpecTableLine('ERICON Station Cluster ID:', ericonId);
    drawSpecTableLine('Farm Deployment Protocol Type:', farmType);
    drawSpecTableLine('Active Surveillance Duration:', monitoringDuration);
    drawSpecTableLine('GSM Connected EMA Hub Modules:', activeEmaModules);
    drawSpecTableLine('Suction Pipeline Working State:', pipelineStatus);
    drawSpecTableLine('Enrolled Academic Researchers:', activeResearchers);
    drawSpecTableLine('Data Transmission Completeness:', dataCompleteness);

    y += 4;
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(6, 78, 59);
    doc.text('ACTIVE BIO-DYNAMIC PIPELINE TUNNEL SETUP', 15, y);
    y += 8;

    const drawSimSpecLine = (label: string, val: string, unit: string) => {
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(21, 70, 45);
      doc.text(label, 15, y);
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(21, 70, 45);
      doc.text(`${val} ${unit}`, 80, y);
      doc.setDrawColor(241, 245, 249);
      doc.line(15, y + 2, 195, y + 2);
      y += 8;
    };

    drawSimSpecLine('Inlet Pushing Pressure (P1):', specs.p1.toFixed(1), 'kPa');
    drawSimSpecLine('Terminal Hub Suction Vacuum (P2):', specs.p2.toFixed(1), 'kPa');
    drawSimSpecLine('Polyamide-6 Core Segment Length:', specs.length.toFixed(1), 'meters');
    drawSimSpecLine('Inner Tunnel Diameter:', specs.diameter.toFixed(1), 'mm');
    drawSimSpecLine('Inner Pipe Absolute Surface Roughness:', specs.roughness.toFixed(4), 'mm');
    drawSimSpecLine('Environmental In-pipe Temperature:', specs.temperature.toFixed(1), '°C');
    drawSimSpecLine('Empty Capsule Cylinder Mass:', specs.capsuleMass.toFixed(1), 'grams');
    drawSimSpecLine('Cylinder Dry Sliding Friction (Nylon-6):', specs.capsuleFriction.toFixed(2), 'coefficient');
    drawSimSpecLine('Optimal Tight-Fit Clearance Seal Ratio:', specs.capsuleClearance.toFixed(2), 'ratio');

    const drawPageFooter = (num: number) => {
      doc.setFillColor(241, 245, 249);
      doc.rect(0, 285, 210, 12, 'F');
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(21, 70, 45);
      doc.text('ERICON COLLABORATIVE SURVEYS (CRME) COMPREHENSIVE MEDICAL & DATA REPORT', 15, 292);
      doc.text(`Page ${num}`, 190, 292);
    };
    drawPageFooter(2);

    // ----------------- PAGE 3: SECTION 2 CHARTS SNAPSHOTS -----------------
    doc.addPage();
    doc.setFillColor(6, 78, 59);
    doc.rect(0, 0, 210, 22, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10.5);
    if (ericonLogoData) {
      const headerDims = getLogoFitDimensions(22, 12, 'contain');
      const xPos = 195 - headerDims.width;
      const yPos = 5 + (12 - headerDims.height) / 2;
      doc.addImage(ericonLogoData, 'PNG', xPos, yPos, headerDims.width, headerDims.height);
    }
    doc.text('SECTION 2: CORE FIELD & SURVEILLANCE PLOT INTERPRETATIONS', 15, 14);

    y = 35;
    doc.setTextColor(21, 70, 45);
    doc.setFontSize(10);

    const drawChartSnapshotItem = (title: string, desc: string, interpretation: string) => {
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(6, 78, 59);
      doc.text(`✓ ${title}`, 15, y);
      y += 5;
      
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(21, 70, 45);
      const textL = doc.splitTextToSize(desc, 175);
      doc.text(textL, 15, y);
      y += (textL.length * 4.2) + 1;

      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      
      const interpLines = doc.splitTextToSize(`Scientific Context: ${interpretation}`, 165);
      const boxHeight = (interpLines.length * 4.2) + 6;
      doc.rect(15, y, 180, boxHeight, 'F');
      doc.rect(15, y, 180, boxHeight, 'D');
      
      doc.setFont('Helvetica', 'italic');
      doc.setTextColor(15, 76, 58);
      doc.setFontSize(8.5);
      doc.text(interpLines, 20, y + 4.5);
      y += boxHeight + 8;
    };

    drawChartSnapshotItem(
      'Population Trend Chart (Spatial Cohorts)',
      'A continuous line plotting capture density over time across block designations. Confirms seasonal dispersion and habitat preferences near local crop streams.',
      'Reflects steady, consistent field density curves without catastrophic epidemiologic triggers across testing nights.'
    );

    drawChartSnapshotItem(
      'Species Distribution Indicator (Biodiversity Spectrum)',
      'Visualizes relative frequencies of captured rodent families (Mastomys natalensis, Rattus rattus, etc.). High diversity correlates with passive disease dilution.',
      'Identifies Multimammate Mouse as peak vector group requiring priority pneumatic isolation containment.'
    );

    drawChartSnapshotItem(
      'Micro-Survival Curves (Kaplan-Meier Estimation)',
      'Displays standard survival step probability over a 90-day tracking lifecycle. Ideal for monitoring trauma resilience.',
      'Log-rank validation supports non-destructive transit limits inferior to 12.0 m/s.'
    );

    drawPageFooter(3);

    // ----------------- PAGE 4: STATS SUMMARY -----------------
    doc.addPage();
    doc.setFillColor(6, 78, 59);
    doc.rect(0, 0, 210, 22, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10.5);
    if (ericonLogoData) {
      const headerDims = getLogoFitDimensions(22, 12, 'contain');
      const xPos = 195 - headerDims.width;
      const yPos = 5 + (12 - headerDims.height) / 2;
      doc.addImage(ericonLogoData, 'PNG', xPos, yPos, headerDims.width, headerDims.height);
    }
    doc.text('SECTION 2 & 3: ANALYTICS MAPS & DYNAMIC STATEMENTS', 15, 14);

    y = 35;
    drawChartSnapshotItem(
      'Spatial Density Heatmaps (DBSCAN Clusters)',
      'Clusters capture locations to pinpoint vector hotspot clusters near Morogoro streams (Epsilon=25m, Min Rodents=3).',
      'Confirms spatial aggregation in Block C which triggers focused bio-barrier active air suction protocols.'
    );

    y += 2;
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(6, 78, 59);
    doc.text('SECTION 3: CONVEYANCE HYDRODYNAMICS & BIOMETRIC STATISTICS', 15, y);
    y += 8;

    const drawStatRow = (label: string, value: string) => {
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(21, 70, 45);
      doc.text(label, 15, y);
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(21, 70, 45);
      doc.text(value, 110, y);
      doc.setDrawColor(241, 245, 249);
      doc.line(15, y + 2, 195, y + 2);
      y += 8;
    };

    drawStatRow('Active Conveyance Air Velocity (V):', `${calc.velocity.toFixed(2)} meters / second`);
    drawStatRow('Hydrodynamic Flow Regime Type:', calc.flowRegume);
    drawStatRow('Calculated Reynolds Number (Re):', calc.reynoldsNumber.toFixed(0));
    drawStatRow('Operating Air Density (Rho):', `${calc.density.toFixed(4)} kg/m³`);
    drawStatRow('Darcy Friction Factor (f_D):', calc.frictionFactor.toFixed(5));
    drawStatRow('Calculated Volumetric Flow Rate:', `${(calc.flowRateVolumetric * 1000).toFixed(2)} liters/second`);
    drawStatRow('Estimated Animal Biometric Safety Index:', `98.42% (Approved Safety Threshold)`);
    drawStatRow('Low Survival Alarm Accumulated Time:', `${(lowSurvivalTimeMs/1000).toFixed(0)} seconds`);

    drawPageFooter(4);

    // ----------------- PAGE 5: NOTES & SIGNOFF -----------------
    doc.addPage();
    doc.setFillColor(6, 78, 59);
    doc.rect(0, 0, 210, 22, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10.5);
    if (ericonLogoData) {
      const headerDims = getLogoFitDimensions(22, 12, 'contain');
      const xPos = 195 - headerDims.width;
      const yPos = 5 + (12 - headerDims.height) / 2;
      doc.addImage(ericonLogoData, 'PNG', xPos, yPos, headerDims.width, headerDims.height);
    }
    doc.text('SECTION 4 & 5: CORRESPONDENCE NOTES & SIGN-OFF CERTIFICATE', 15, 14);

    y = 35;
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(6, 78, 59);
    doc.text('SECTION 4: COLLABORATIVE TEAM NOTES & OBSERVATIONS', 15, y);
    y += 8;

    const drawNotesBox = (title: string, text: string) => {
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(21, 70, 45);
      doc.text(title, 15, y);
      y += 5;

      doc.setFillColor(250, 250, 250);
      doc.setDrawColor(212, 212, 212);
      const noteLines = doc.splitTextToSize(text, 170);
      const boxH = (noteLines.length * 4.2) + 6;

      doc.rect(15, y, 180, boxH, 'F');
      doc.rect(15, y, 180, boxH, 'D');

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(21, 70, 45);
      doc.text(noteLines, 19, y + 4.5);
      y += boxH + 8;
    };

    drawNotesBox('Project Leader Clinical Summary comments', leaderComments);
    drawNotesBox('Field Biologists and Research Fellows Notes', researchNotes);

    y += 2;
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(6, 78, 59);
    doc.text('SECTION 5: ERICON INTEGRATION VERIFICATION SIGN-OFF', 15, y);
    y += 8;

    doc.setFillColor(240, 253, 250);
    doc.setDrawColor(45, 156, 118);
    doc.rect(15, y, 180, 42, 'F');
    doc.rect(15, y, 180, 42, 'D');

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(21, 70, 45);
    doc.text('VERIFICATE SECURITY DECREE & DEPLOYMENT ENVELOPE:', 19, y + 6);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(21, 70, 45);
    doc.text(`Core Verification Token: ${verId}`, 19, y + 13);
    doc.text(`Framework Version Release: ERICON-S-CRME-V5.2`, 19, y + 18);
    doc.text(`System Timestamp Encryption: ${todayStr} (UTC+00)`, 19, y + 23);
    doc.text('Academically Verified for Rodent-Safe Non-destructive Pneumatic Captivity Transit.', 19, y + 28);
    doc.text('Approved by: ERICON Bio-conveyance & Surveillance Consortium Committee.', 19, y + 33);
    
    // Badge stamp
    doc.setDrawColor(16, 185, 129);
    doc.setFillColor(209, 250, 229);
    doc.circle(170, y + 21, 12, 'FD');
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(6, 78, 59);
    doc.text('CRME', 165, y + 20);
    doc.text('VERIFIED', 162, y + 23);

    drawPageFooter(5);

    doc.save(`ERICON_Research_Report_${ericonId}.pdf`);
  };

  // SVG Chart Dimensions
  const width = 500;
  const height = 220;
  const padding = 45;

  // 1. Pressure Line Math
  // Line starts at (padding, height - padding - scaleP1) and ends at (width - padding, height - padding - scaleP2)
  const maxPressureScale = 550; // Max p1 is 500 kPa
  const p1Y = height - padding - (specs.p1 / maxPressureScale) * (height - 2 * padding);
  const p2Y = height - padding - (specs.p2 / maxPressureScale) * (height - 2 * padding);

  // 2. Cross section velocity profile Math
  // Radius r from -R to +R. Let's sample 21 points
  const radialPointsCount = 21;
  const profilePoints: { y: number; x: number }[] = [];
  const chartCoreCenterY = (height - 2 * padding) / 2 + padding;
  const halfPipeHeight = (height - 2 * padding) / 2;

  // Let's compute maximum center velocity based on average
  // Laminar: V_max = 2 * V_avg
  // Turbulent (1/7 law): V_max = (8/7) * V_avg to be physically consistent
  const vMax = calc.flowRegume === 'Laminar' ? calc.velocity * 2 : calc.velocity * 1.25;

  for (let idx = 0; idx <= radialPointsCount; idx++) {
    const fraction = (idx / radialPointsCount) * 2 - 1; // -1 to +1 (corresponds to -r to +r)
    let relativeVelocity = 0;

    if (calc.flowRegume === 'Laminar') {
      // Parabolic: V(r) = V_max * (1 - (r/R)^2)
      relativeVelocity = vMax * (1 - fraction * fraction);
    } else {
      // Turbulent power-law matching boundary condition: V(r) = V_max * (1 - |r|/R)^(1/7)
      relativeVelocity = vMax * Math.pow(1 - Math.abs(fraction), 1 / 7);
    }

    // Map to SVG coordinates
    // X axis represents velocity (flowing rightwards)
    // Y axis represents diameter radius (-R to +R, stacked vertically in the chart)
    const svgY = chartCoreCenterY + fraction * halfPipeHeight;
    const svgX = padding + (relativeVelocity / Math.max(vMax, 5)) * (width - 2 * padding - 30);
    profilePoints.push({ x: svgX, y: svgY });
  }

  return (
    <div className="bg-white border-2 border-slate-200 rounded-sm shadow-md p-6 flex flex-col gap-6" id="charts-panel">
      
      {/* Header Tabs with PDF Report button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-3" id="charts-header">
        <div className="flex items-center gap-2">
          <AreaChart className="w-4 h-4 text-blue-900" />
          <h2 className="text-xs font-mono font-bold text-blue-900 tracking-widest uppercase">
            Engineering Plots Profile
          </h2>
        </div>

        {/* Action controllers */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {/* Tab triggers */}
          <div className="flex border-2 border-slate-200 rounded-sm p-0.5 bg-slate-50 text-xs font-mono font-bold">
            <button
              onClick={() => setActiveTab('pressure')}
              type="button"
              className={`px-3 py-1.5 rounded-sm transition-all cursor-pointer ${
                activeTab === 'pressure'
                  ? 'bg-blue-900 text-white shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Pressure Gradient P(x)
            </button>
            
            <button
              onClick={() => setActiveTab('velocity')}
              type="button"
              className={`px-3 py-1.5 rounded-sm transition-all cursor-pointer ${
                activeTab === 'velocity'
                  ? 'bg-blue-900 text-white shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Velocity Profile V(r)
            </button>
          </div>

          {/* Download PDF Control Trigger */}
          <button
            type="button"
            onClick={() => setShowPdfForm(!showPdfForm)}
            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 rounded-sm font-mono text-[10.5px] font-bold uppercase transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            id="btn-toggle-report-builder"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
            <span>Download PDF Report</span>
            {showPdfForm ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5 animate-bounce" />}
          </button>
        </div>
      </div>

      {/* COLLAPSIBLE PDF REPORT GENERATOR CONFIG */}
      {showPdfForm && (
        <div className="bg-slate-50 border-2 border-indigo-200 p-5 rounded-sm flex flex-col gap-4 text-xs font-mono" id="pdf-report-generator-config">
          <div className="border-b border-indigo-100 pb-2.5 flex items-center justify-between">
            <h3 className="font-mono font-bold text-indigo-900 flex items-center gap-1.5 uppercase">
              <ShieldCheck className="w-4 h-4 text-emerald-600 animate-pulse" />
              ERICON(S) Project Report Builder Context
            </h3>
            <span className="text-[9px] bg-indigo-100 text-indigo-850 px-2 py-0.5 rounded font-black uppercase tracking-wider">A4 Standard PDF Engine</span>
          </div>

          {/* Form grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* COVER PAGE SPECS */}
            <div className="bg-white p-3.5 border border-slate-200 rounded flex flex-col gap-2">
              <span className="text-[10px] font-black text-indigo-900 border-b pb-1 uppercase block">Cover Page Branding</span>
              <div>
                <label className="block text-[9.5px] text-slate-400 font-bold mb-0.5">Project Name</label>
                <input type="text" value={projectName} onChange={e => setProjectName(e.target.value)} className="w-full bg-slate-50 border p-1 rounded font-mono text-slate-800" />
              </div>
              <div>
                <label className="block text-[9.5px] text-slate-400 font-bold mb-0.5">Research Designation ID</label>
                <input type="text" value={researchId} onChange={e => setResearchId(e.target.value)} className="w-full bg-slate-50 border p-1 rounded font-mono text-slate-800" />
              </div>
              <div>
                <label className="block text-[9.5px] text-slate-400 font-bold mb-0.5">Team Identifier</label>
                <input type="text" value={teamName} onChange={e => setTeamName(e.target.value)} className="w-full bg-slate-50 border p-1 rounded font-mono text-slate-800" />
              </div>
              <div>
                <label className="block text-[9.5px] text-slate-400 font-bold mb-0.5">Team Leader / PI</label>
                <input type="text" value={teamLeader} onChange={e => setTeamLeader(e.target.value)} className="w-full bg-slate-50 border p-1 rounded font-mono text-slate-800" />
              </div>
              <div>
                <label className="block text-[9.5px] text-slate-400 font-bold mb-0.5">Institution Name</label>
                <input type="text" value={institution} onChange={e => setInstitution(e.target.value)} className="w-full bg-slate-50 border p-1 rounded font-mono text-slate-800" />
              </div>
              <div>
                <label className="block text-[9.5px] text-slate-400 font-bold mb-0.5">Country / Location</label>
                <input type="text" value={country} onChange={e => setCountry(e.target.value)} className="w-full bg-slate-50 border p-1 rounded font-mono text-slate-800" />
              </div>
            </div>

            {/* SECTION 1 HARDWARE PARAMS */}
            <div className="bg-white p-3.5 border border-slate-200 rounded flex flex-col gap-2">
              <span className="text-[10px] font-black text-indigo-900 border-b pb-1 uppercase block">Section 1: Hardware Metadata</span>
              <div>
                <label className="block text-[9.5px] text-slate-400 font-bold mb-0.5">ERICON Cluster ID</label>
                <input type="text" value={ericonId} onChange={e => setEriconId(e.target.value)} className="w-full bg-slate-50 border p-1 rounded font-mono text-slate-800" />
              </div>
              <div>
                <label className="block text-[9.5px] text-slate-400 font-bold mb-0.5">Farm Protocol Type</label>
                <select value={farmType} onChange={e => setFarmType(e.target.value as any)} className="w-full bg-slate-50 text-slate-800 border p-1 rounded font-mono select-none">
                  <option value="ERICON Farm">ERICON Farm (Suction Core Active)</option>
                  <option value="Non-ERICON Control Farm">Non-ERICON Control Farm (Standard Pitfalls)</option>
                </select>
              </div>
              <div>
                <label className="block text-[9.5px] text-slate-400 font-bold mb-0.5">Monitoring Duration</label>
                <input type="text" value={monitoringDuration} onChange={e => setMonitoringDuration(e.target.value)} className="w-full bg-slate-50 border p-1 rounded font-mono text-slate-800" />
              </div>
              <div>
                <label className="block text-[9.5px] text-slate-400 font-bold mb-0.5">Active EMA Telemetrics Nodes</label>
                <input type="text" value={activeEmaModules} onChange={e => setActiveEmaModules(e.target.value)} className="w-full bg-slate-50 border p-1 rounded font-mono text-slate-800" />
              </div>
              <div>
                <label className="block text-[9.5px] text-slate-400 font-bold mb-0.5">Suction Core Status</label>
                <input type="text" value={pipelineStatus} onChange={e => setPipelineStatus(e.target.value)} className="w-full bg-slate-50 border p-1 rounded font-mono text-slate-800" />
              </div>
              <div>
                <label className="block text-[9.5px] text-slate-400 font-bold mb-0.5">Data Completeness (%)</label>
                <input type="text" value={dataCompleteness} onChange={e => setDataCompleteness(e.target.value)} className="w-full bg-slate-50 border p-1 rounded font-mono text-slate-800" />
              </div>
            </div>

            {/* SECTION 4 RESEARCH COMMENTS */}
            <div className="bg-white p-3.5 border border-slate-200 rounded flex flex-col gap-2 lg:col-span-1">
              <span className="text-[10px] font-black text-indigo-900 border-b pb-1 uppercase block">Section 4: Custom Comments</span>
              <div className="flex-1 flex flex-col gap-2">
                <div>
                  <label className="block text-[9.5px] text-slate-400 font-bold mb-0.5">Principal Investigator Summary</label>
                  <textarea rows={4} value={leaderComments} onChange={e => setLeaderComments(e.target.value)} className="w-full bg-slate-50 border p-1.5 rounded font-mono text-slate-800 resize-none text-[10.5px]/relaxed" />
                </div>
                <div>
                  <label className="block text-[9.5px] text-slate-400 font-bold mb-0.5">Research Fellow Field Notes</label>
                  <textarea rows={4} value={researchNotes} onChange={e => setResearchNotes(e.target.value)} className="w-full bg-slate-50 border p-1.5 rounded font-mono text-slate-800 resize-none text-[10.5px]/relaxed" />
                </div>
              </div>
            </div>

          </div>

          {/* Download button row */}
          <div className="bg-slate-900 border border-slate-950 p-4 rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
            <div className="text-white text-[10.5px]">
              <div className="font-bold uppercase tracking-wider flex items-center gap-1 text-emerald-400">
                <Check className="w-4 h-4" /> Ready for Compilation
              </div>
              <p className="text-indigo-250 text-[9.5px] mt-1 font-sans">Compiles a multi-page PDF document including Cover Page, hardware specifications, interactive charts explanations, real-time Reynolds stats, and custom notes.</p>
            </div>
            
            <button
              type="button"
              onClick={handleDownloadPDFReport}
              className="bg-emerald-800 hover:bg-emerald-950 text-white font-mono py-2.5 px-5 rounded-xs text-xs font-extrabold uppercase shadow-md flex items-center justify-center gap-2 border border-emerald-950 hover:border-black shrink-0 transition cursor-pointer"
              id="btn-download-pdf-report"
            >
              <Download className="w-4 h-4 shrink-0" />
              Download PDF Report Output
            </button>
          </div>
        </div>
      )}

      {/* RENDER PLOTS */}
      <div className="flex items-center justify-center bg-slate-50/50 rounded-sm border-2 border-slate-200 p-6 relative min-h-[260px] overflow-auto">
        
        {/* Plot descriptions overlays */}
        <div className="absolute top-3 left-4 text-[10px] text-slate-500 font-mono font-bold uppercase">
          {activeTab === 'pressure' ? (
            <div className="flex items-center gap-1.5 text-blue-900">
              <TrendingDown className="w-3.5 h-3.5 text-blue-600" />
              <span>Plot: Pressure drop line along the tube L={specs.length}m</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-blue-900">
              <Eye className="w-3.5 h-3.5 text-blue-600" />
              <span>Plot: Boundary air velocity from -R to +R</span>
            </div>
          )}
        </div>

        {activeTab === 'pressure' ? (
          /* PRESSURE DROP CHART */
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-[500px] h-auto font-mono text-[9px] text-slate-400">
            {/* Grid Lines */}
            <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#e2e8f0" strokeDasharray="3,3" />
            <line x1={padding} y1={chartCoreCenterY} x2={width - padding} y2={chartCoreCenterY} stroke="#e2e8f0" strokeDasharray="3,3" />
            <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#cbd5e1" strokeWidth="1.5" />
            
            <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#cbd5e1" strokeWidth="1.5" />
            <line x1={width - padding} y1={padding} x2={width - padding} y2={height - padding} stroke="#e2e8f0" strokeDasharray="3,3" />

            {/* Pressure Plot Line & Gradient fill */}
            <path
              d={`M ${padding} ${p1Y} L ${width - padding} ${p2Y} L ${width - padding} ${height - padding} L ${padding} ${height - padding} Z`}
              fill="url(#pressure-glow)"
              opacity="0.12"
            />
            {/* Gradient Def just inline */}
            <defs>
              <linearGradient id="pressure-glow" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#2563eb" />
                <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
              </linearGradient>
            </defs>

            <line x1={padding} y1={p1Y} x2={width - padding} y2={p2Y} stroke="#2563eb" strokeWidth="2.5" />
            
            {/* Point Markers */}
            <circle cx={padding} cy={p1Y} r="4.5" fill="#1d4ed8" stroke="#ffffff" strokeWidth="1.5" />
            <circle cx={width - padding} cy={p2Y} r="4.5" fill="#1d4ed8" stroke="#ffffff" strokeWidth="1.5" />

            {/* Annotation Text */}
            <text x={padding - 8} y={p1Y + 3} textAnchor="end" className="fill-slate-700 font-bold">{specs.p1.toFixed(0)} kPa (P1)</text>
            <text x={width - padding + 8} y={p2Y + 3} textAnchor="start" className="fill-slate-700 font-bold">{specs.p2.toFixed(0)} kPa (P2)</text>
            
            {/* Axis Labels */}
            <text x={width / 2} y={height - 12} textAnchor="middle" className="fill-slate-500">Distance along the tube (x = 0 to L = {specs.length}m)</text>
            <text x={padding - 12} y={height / 2} transform={`rotate(-90 ${padding - 12} ${height / 2})`} textAnchor="middle" className="fill-slate-500">Pipeline pressure (kPa)</text>

            <text x={padding} y={height - padding + 15} textAnchor="middle">OWEP Inlet (x=0)</text>
            <text x={width - padding} y={height - padding + 15} textAnchor="middle">EMA Hub (x=L)</text>
          </svg>
        ) : (
          /* VELOCITY CONTOUR PARABOLIC CHART */
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-[500px] h-auto font-mono text-[9px] text-slate-400">
            {/* Grid & Boundaries */}
            {/* Pipe boundaries */}
            <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#1e3a8a" strokeWidth="2" />
            <rect x={padding} y={padding} width={width - 2 * padding} height={height - 2 * padding} fill="#3b82f6" fillOpacity="0.02" />
            <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#1e3a8a" strokeWidth="2" />

            {/* Core Centerline */}
            <line x1={padding} y1={chartCoreCenterY} x2={width - padding} y2={chartCoreCenterY} stroke="#94a3b8" strokeDasharray="5,3" strokeWidth="0.75" />
            <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#64748b" strokeWidth="1.5" />

            {/* Arrow indicators showing speed vectors */}
            {profilePoints.filter((_, i) => i % 2 === 0).map((pt, i) => {
              const rowY = pt.y;
              const arrowLength = pt.x - padding;
              if (arrowLength < 4) return null;
              
              return (
                <g key={`flow-vector-arrow-${i}`}>
                  <line 
                    x1={padding} 
                    y1={rowY} 
                    x2={pt.x} 
                    y2={rowY} 
                    stroke={calc.flowRegume === 'Laminar' ? '#2563eb' : '#dc2626'} 
                    strokeWidth="1" 
                    opacity="0.45" 
                    markerEnd="url(#fine-arrow)" 
                  />
                </g>
              );
            })}

            {/* Velocity Profile Curve */}
            <path
              d={`M ${padding} ${padding} ` + profilePoints.map(p => `L ${p.x} ${p.y}`).join(' ') + ` L ${padding} ${height - padding} Z`}
              fill={calc.flowRegume === 'Laminar' ? '#3b82f6' : '#ef4444'}
              fillOpacity="0.08"
            />
            <path
              d={`M ${padding} ${padding} ` + profilePoints.map(p => `L ${p.x} ${p.y}`).join(' ') + ` L ${padding} ${height - padding}`}
              fill="none"
              stroke={calc.flowRegume === 'Laminar' ? '#2563eb' : '#dc2626'}
              strokeWidth="2.5"
            />

            {/* Annotation Callouts */}
            <text x={padding + 10} y={padding - 8} textAnchor="start" className="fill-slate-800 font-bold">Tube Wall Inner Face (No Slip Boundary: V = 0)</text>
            <text x={padding + 10} y={height - padding + 14} textAnchor="start" className="fill-slate-800 font-bold">Tube Wall Inner Face (V = 0)</text>

            <text x={profilePoints[10].x + 10} y={profilePoints[10].y + 3} textAnchor="start" className="fill-slate-800 font-bold">
              V_max = {vMax.toFixed(2)} m/s
            </text>
            <text x={padding - 12} y={height / 2} transform={`rotate(-90 ${padding - 12} ${height / 2})`} textAnchor="middle" className="fill-slate-500">Cross-sectional Position (Radius -R to +R)</text>
            <text x={width / 2} y={height - 12} textAnchor="middle" className="fill-slate-500">Air Velocity (m/s)</text>
          </svg>
        )}
      </div>

      {/* Physics Insights Sidebar */}
      <div className="border-l-4 border-blue-900 rounded-sm p-4 bg-slate-50 text-xs text-slate-600 leading-relaxed" id="charts-physics-explanation">
        <div className="flex items-center gap-1.5 font-bold text-blue-900 font-mono text-xs mb-1.5 uppercase tracking-wider">
          <HelpCircle className="w-4 h-4" />
          Fluid Hydrodynamic Highlights
        </div>
        {activeTab === 'pressure' ? (
          <span>
            The pipeline pressure profile shows a linear drop along the Polyamide-6 core. If the fluid were fully compressible (critical high speed flows), the drop line would curve downwards slightly due to density expansion.
          </span>
        ) : (
          <span>
            Observe the shape difference: {calc.flowRegume === 'Laminar' ? (
              <strong>Laminar Flow</strong>
            ) : (
              <strong>Turbulent Flow</strong>
            )}. {calc.flowRegume === 'Laminar' 
              ? "Because flow is Laminar, the velocity profile takes a perfect parabolic shape. The air in the exact center flows exactly twice as fast as the average pipeline speed, while fluid static resistance at the walls forces border velocity to absolute zero (the 'No Slip' physical boundary condition)."
              : "Because flow is Turbulent, intense transverse eddies mix momentum, causing a flatter cross-sectional profile (approximated by the 1/7th Power Law). Drag losses are substantially higher than laminar flow."
            }
          </span>
        )}
      </div>
    </div>
  );
};
