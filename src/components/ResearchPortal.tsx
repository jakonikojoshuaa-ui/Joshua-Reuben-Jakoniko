/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Database, Plus, Download, Trash2, Tag, MapPin, BarChart3, AlertTriangle, 
  HelpCircle, Calendar, ShieldCheck, RefreshCw, Crosshair, TrendingUp, Compass, Activity,
  PieChart, Sliders, Settings, Users, UserPlus, FolderGit, BookOpen, EyeOff, UserCheck, LogIn, LogOut, Check
} from 'lucide-react';
import { RodentSpecies } from '../types';

export interface RodentSpecimen {
  // Section A: Geospatial, Temporal & System Identifiers
  Record_ID: string;
  Date_Captured: string; // DD/MM/YYYY
  Time_Checked: string;  // HH:MM
  Location_Name: string;
  GPS_Latitude: number;
  GPS_Longitude: number;
  EMA_Node_ID: 'EMA-1' | 'EMA-2' | 'EMA-3' | 'EMA-4';

  // Section B: Taxonomy & Biological Assessment
  Species_ID: 'Mastomys natalensis' | 'Rattus rattus' | 'Mus musculus' | 'Arvicanthis niloticus' | 'Other';
  Sex: 'Male' | 'Female' | 'Undetermined';
  Maturity_Stage: 'Juvenile' | 'Sub-Adult' | 'Adult';
  Reproductive_Condition: 'M: Scrotal' | 'M: Non-scrotal' | 'F: Perforate' | 'F: Lactating' | 'F: Pregnant';

  // Section C: Morphometric Measurements
  Weight_g: number;
  Head_Body_Length_mm: number;
  Tail_Length_mm: number;
  Hind_Foot_mm: number;
  Ear_Length_mm: number;

  // Section D: Eco-Parasitology Surveillance
  Parasite_Load_Ext: 0 | 1 | 2 | 3;
  Ectoparasite_Spp: string;
  Ectoparasite_Common_Name: string;
  Ectoparasite_Count: number;
  Endoparasite_Presence: 'Yes' | 'No' | 'Pending Lab';
  Endoparasite_Spp: string;
  Endoparasite_Common_Name: string;

  // Section E: ERICON Cohort Retention & Long-Term Survival Monitoring
  Survival_24H: 'Alive' | 'Dead';
  Survival_1WK: 'Alive' | 'Dead' | 'Removed';
  Survival_2WK: 'Alive' | 'Dead' | 'Removed';
  Survival_1M: 'Alive' | 'Dead' | 'Removed';
  Survival_3M: 'Alive' | 'Dead' | 'Removed';
  Recapture_Status: 'New Capture' | 'Recapture-Tagged';

  // Section F: Database extensions
  Time_to_Event_Days: number; // Y: Total days survived (up to 90 days)
  Event_Status: 0 | 1;        // Z: 1 (Died), 0 (Censored / Survived)
  Trap_Night_ID: number;      // AA: Cumulative monitoring period integer
}

// Initial robust dataset with balanced, realistic research variables near Morogoro, Tanzania
const INITIAL_SPECIMENS: RodentSpecimen[] = [
  {
    Record_ID: 'ERICON-2026-0001',
    Date_Captured: '24/05/2026',
    Time_Checked: '06:15',
    Location_Name: 'Morogoro_Block_C',
    GPS_Latitude: -6.8245,
    GPS_Longitude: 37.6640,
    EMA_Node_ID: 'EMA-1',
    Species_ID: 'Mastomys natalensis',
    Sex: 'Male',
    Maturity_Stage: 'Adult',
    Reproductive_Condition: 'M: Scrotal',
    Weight_g: 48.5,
    Head_Body_Length_mm: 125,
    Tail_Length_mm: 110,
    Hind_Foot_mm: 24.2,
    Ear_Length_mm: 18.0,
    Parasite_Load_Ext: 2,
    Ectoparasite_Spp: 'Xenopsylla cheopis',
    Ectoparasite_Common_Name: 'Oriental rat flea',
    Ectoparasite_Count: 6,
    Endoparasite_Presence: 'No',
    Endoparasite_Spp: 'None',
    Endoparasite_Common_Name: 'None',
    Survival_24H: 'Alive',
    Survival_1WK: 'Alive',
    Survival_2WK: 'Alive',
    Survival_1M: 'Alive',
    Survival_3M: 'Alive',
    Recapture_Status: 'New Capture',
    Time_to_Event_Days: 90,
    Event_Status: 0,
    Trap_Night_ID: 1
  },
  {
    Record_ID: 'ERICON-2026-0002',
    Date_Captured: '24/05/2026',
    Time_Checked: '06:30',
    Location_Name: 'Morogoro_Block_C',
    GPS_Latitude: -6.8246,
    GPS_Longitude: 37.6642,
    EMA_Node_ID: 'EMA-1',
    Species_ID: 'Mastomys natalensis',
    Sex: 'Female',
    Maturity_Stage: 'Adult',
    Reproductive_Condition: 'F: Pregnant',
    Weight_g: 52.0,
    Head_Body_Length_mm: 128,
    Tail_Length_mm: 112,
    Hind_Foot_mm: 23.8,
    Ear_Length_mm: 17.5,
    Parasite_Load_Ext: 3,
    Ectoparasite_Spp: 'Laelaps echidnina',
    Ectoparasite_Common_Name: 'Spiny rat mite',
    Ectoparasite_Count: 22,
    Endoparasite_Presence: 'Yes',
    Endoparasite_Spp: 'Hymenolepis diminuta',
    Endoparasite_Common_Name: 'Rat tapeworm',
    Survival_24H: 'Alive',
    Survival_1WK: 'Alive',
    Survival_2WK: 'Alive',
    Survival_1M: 'Dead',
    Survival_3M: 'Removed',
    Recapture_Status: 'New Capture',
    Time_to_Event_Days: 25,
    Event_Status: 1,
    Trap_Night_ID: 1
  },
  {
    Record_ID: 'ERICON-2026-0003',
    Date_Captured: '24/05/2026',
    Time_Checked: '07:15',
    Location_Name: 'Morogoro_Block_C',
    GPS_Latitude: -6.8244,
    GPS_Longitude: 37.6639,
    EMA_Node_ID: 'EMA-1',
    Species_ID: 'Mastomys natalensis',
    Sex: 'Male',
    Maturity_Stage: 'Juvenile',
    Reproductive_Condition: 'M: Non-scrotal',
    Weight_g: 22.4,
    Head_Body_Length_mm: 88,
    Tail_Length_mm: 82,
    Hind_Foot_mm: 20.1,
    Ear_Length_mm: 15.0,
    Parasite_Load_Ext: 0,
    Ectoparasite_Spp: 'None',
    Ectoparasite_Common_Name: 'None',
    Ectoparasite_Count: 0,
    Endoparasite_Presence: 'No',
    Endoparasite_Spp: 'None',
    Endoparasite_Common_Name: 'None',
    Survival_24H: 'Alive',
    Survival_1WK: 'Alive',
    Survival_2WK: 'Alive',
    Survival_1M: 'Alive',
    Survival_3M: 'Alive',
    Recapture_Status: 'New Capture',
    Time_to_Event_Days: 90,
    Event_Status: 0,
    Trap_Night_ID: 1
  },
  {
    Record_ID: 'ERICON-2026-0004',
    Date_Captured: '25/05/2026',
    Time_Checked: '06:05',
    Location_Name: 'Morogoro_Block_A',
    GPS_Latitude: -6.8270,
    GPS_Longitude: 37.6680,
    EMA_Node_ID: 'EMA-2',
    Species_ID: 'Rattus rattus',
    Sex: 'Female',
    Maturity_Stage: 'Adult',
    Reproductive_Condition: 'F: Lactating',
    Weight_g: 135.0,
    Head_Body_Length_mm: 172,
    Tail_Length_mm: 185,
    Hind_Foot_mm: 31.5,
    Ear_Length_mm: 19.8,
    Parasite_Load_Ext: 1,
    Ectoparasite_Spp: 'Xenopsylla cheopis',
    Ectoparasite_Common_Name: 'Oriental rat flea',
    Ectoparasite_Count: 2,
    Endoparasite_Presence: 'No',
    Endoparasite_Spp: 'None',
    Endoparasite_Common_Name: 'None',
    Survival_24H: 'Alive',
    Survival_1WK: 'Alive',
    Survival_2WK: 'Dead',
    Survival_1M: 'Removed',
    Survival_3M: 'Removed',
    Recapture_Status: 'New Capture',
    Time_to_Event_Days: 12,
    Event_Status: 1,
    Trap_Night_ID: 2
  },
  {
    Record_ID: 'ERICON-2026-0005',
    Date_Captured: '25/05/2026',
    Time_Checked: '06:45',
    Location_Name: 'Morogoro_Block_A',
    GPS_Latitude: -6.8271,
    GPS_Longitude: 37.6682,
    EMA_Node_ID: 'EMA-2',
    Species_ID: 'Rattus rattus',
    Sex: 'Male',
    Maturity_Stage: 'Adult',
    Reproductive_Condition: 'M: Scrotal',
    Weight_g: 152.4,
    Head_Body_Length_mm: 180,
    Tail_Length_mm: 192,
    Hind_Foot_mm: 32.0,
    Ear_Length_mm: 20.2,
    Parasite_Load_Ext: 2,
    Ectoparasite_Spp: 'Rhipicephalus sanguineus',
    Ectoparasite_Common_Name: 'Brown dog tick',
    Ectoparasite_Count: 8,
    Endoparasite_Presence: 'No',
    Endoparasite_Spp: 'None',
    Endoparasite_Common_Name: 'None',
    Survival_24H: 'Alive',
    Survival_1WK: 'Alive',
    Survival_2WK: 'Alive',
    Survival_1M: 'Alive',
    Survival_3M: 'Alive',
    Recapture_Status: 'New Capture',
    Time_to_Event_Days: 90,
    Event_Status: 0,
    Trap_Night_ID: 2
  },
  {
    Record_ID: 'ERICON-2026-0006',
    Date_Captured: '25/05/2026',
    Time_Checked: '07:30',
    Location_Name: 'Morogoro_Block_A',
    GPS_Latitude: -6.8269,
    GPS_Longitude: 37.6679,
    EMA_Node_ID: 'EMA-2',
    Species_ID: 'Rattus rattus',
    Sex: 'Male',
    Maturity_Stage: 'Sub-Adult',
    Reproductive_Condition: 'M: Non-scrotal',
    Weight_g: 95.0,
    Head_Body_Length_mm: 144,
    Tail_Length_mm: 150,
    Hind_Foot_mm: 29.1,
    Ear_Length_mm: 18.5,
    Parasite_Load_Ext: 1,
    Ectoparasite_Spp: 'Xenopsylla cheopis',
    Ectoparasite_Common_Name: 'Oriental rat flea',
    Ectoparasite_Count: 4,
    Endoparasite_Presence: 'No',
    Endoparasite_Spp: 'None',
    Endoparasite_Common_Name: 'None',
    Survival_24H: 'Alive',
    Survival_1WK: 'Alive',
    Survival_2WK: 'Alive',
    Survival_1M: 'Alive',
    Survival_3M: 'Dead',
    Recapture_Status: 'New Capture',
    Time_to_Event_Days: 62,
    Event_Status: 1,
    Trap_Night_ID: 2
  },
  {
    Record_ID: 'ERICON-2026-0007',
    Date_Captured: '26/05/2026',
    Time_Checked: '06:10',
    Location_Name: 'Morogoro_Block_C',
    GPS_Latitude: -6.8220,
    GPS_Longitude: 37.6610,
    EMA_Node_ID: 'EMA-3',
    Species_ID: 'Arvicanthis niloticus',
    Sex: 'Male',
    Maturity_Stage: 'Adult',
    Reproductive_Condition: 'M: Scrotal',
    Weight_g: 82.1,
    Head_Body_Length_mm: 132,
    Tail_Length_mm: 104,
    Hind_Foot_mm: 26.5,
    Ear_Length_mm: 16.8,
    Parasite_Load_Ext: 0,
    Ectoparasite_Spp: 'None',
    Ectoparasite_Common_Name: 'None',
    Ectoparasite_Count: 0,
    Endoparasite_Presence: 'No',
    Endoparasite_Spp: 'None',
    Endoparasite_Common_Name: 'None',
    Survival_24H: 'Alive',
    Survival_1WK: 'Alive',
    Survival_2WK: 'Alive',
    Survival_1M: 'Alive',
    Survival_3M: 'Alive',
    Recapture_Status: 'New Capture',
    Time_to_Event_Days: 90,
    Event_Status: 0,
    Trap_Night_ID: 3
  },
  {
    Record_ID: 'ERICON-2026-0008',
    Date_Captured: '26/05/2026',
    Time_Checked: '06:20',
    Location_Name: 'Morogoro_Block_C',
    GPS_Latitude: -6.8222,
    GPS_Longitude: 37.6611,
    EMA_Node_ID: 'EMA-3',
    Species_ID: 'Arvicanthis niloticus',
    Sex: 'Female',
    Maturity_Stage: 'Adult',
    Reproductive_Condition: 'F: Perforate',
    Weight_g: 78.4,
    Head_Body_Length_mm: 129,
    Tail_Length_mm: 101,
    Hind_Foot_mm: 25.8,
    Ear_Length_mm: 16.2,
    Parasite_Load_Ext: 1,
    Ectoparasite_Spp: 'Polyplax spinulosa',
    Ectoparasite_Common_Name: 'Spiny rat louse',
    Ectoparasite_Count: 3,
    Endoparasite_Presence: 'No',
    Endoparasite_Spp: 'None',
    Endoparasite_Common_Name: 'None',
    Survival_24H: 'Alive',
    Survival_1WK: 'Alive',
    Survival_2WK: 'Alive',
    Survival_1M: 'Alive',
    Survival_3M: 'Alive',
    Recapture_Status: 'New Capture',
    Time_to_Event_Days: 90,
    Event_Status: 0,
    Trap_Night_ID: 3
  },
  {
    Record_ID: 'ERICON-2026-0009',
    Date_Captured: '26/05/2026',
    Time_Checked: '07:05',
    Location_Name: 'Morogoro_Block_C',
    GPS_Latitude: -6.8219,
    GPS_Longitude: 37.6612,
    EMA_Node_ID: 'EMA-3',
    Species_ID: 'Arvicanthis niloticus',
    Sex: 'Female',
    Maturity_Stage: 'Juvenile',
    Reproductive_Condition: 'F: Perforate',
    Weight_g: 38.0,
    Head_Body_Length_mm: 95,
    Tail_Length_mm: 82,
    Hind_Foot_mm: 22.0,
    Ear_Length_mm: 14.5,
    Parasite_Load_Ext: 0,
    Ectoparasite_Spp: 'None',
    Ectoparasite_Common_Name: 'None',
    Ectoparasite_Count: 0,
    Endoparasite_Presence: 'No',
    Endoparasite_Spp: 'None',
    Endoparasite_Common_Name: 'None',
    Survival_24H: 'Alive',
    Survival_1WK: 'Alive',
    Survival_2WK: 'Alive',
    Survival_1M: 'Alive',
    Survival_3M: 'Alive',
    Recapture_Status: 'New Capture',
    Time_to_Event_Days: 90,
    Event_Status: 0,
    Trap_Night_ID: 3
  },
  {
    Record_ID: 'ERICON-2026-0010',
    Date_Captured: '27/05/2026',
    Time_Checked: '06:00',
    Location_Name: 'Morogoro_Block_C',
    GPS_Latitude: -6.8245,
    GPS_Longitude: 37.6644,
    EMA_Node_ID: 'EMA-1',
    Species_ID: 'Mastomys natalensis',
    Sex: 'Male',
    Maturity_Stage: 'Adult',
    Reproductive_Condition: 'M: Scrotal',
    Weight_g: 45.1,
    Head_Body_Length_mm: 122,
    Tail_Length_mm: 108,
    Hind_Foot_mm: 24.0,
    Ear_Length_mm: 17.8,
    Parasite_Load_Ext: 3,
    Ectoparasite_Spp: 'Xenopsylla cheopis',
    Ectoparasite_Common_Name: 'Oriental rat flea',
    Ectoparasite_Count: 28,
    Endoparasite_Presence: 'Yes',
    Endoparasite_Spp: 'Capillaria hepatica',
    Endoparasite_Common_Name: 'Capillaria liver worm',
    Survival_24H: 'Alive',
    Survival_1WK: 'Alive',
    Survival_2WK: 'Alive',
    Survival_1M: 'Alive',
    Survival_3M: 'Dead',
    Recapture_Status: 'Recapture-Tagged',
    Time_to_Event_Days: 78,
    Event_Status: 1,
    Trap_Night_ID: 4
  },
  {
    Record_ID: 'ERICON-2026-0011',
    Date_Captured: '27/05/2026',
    Time_Checked: '06:40',
    Location_Name: 'Morogoro_Block_C',
    GPS_Latitude: -6.8243,
    GPS_Longitude: 37.6641,
    EMA_Node_ID: 'EMA-1',
    Species_ID: 'Mastomys natalensis',
    Sex: 'Female',
    Maturity_Stage: 'Sub-Adult',
    Reproductive_Condition: 'F: Perforate',
    Weight_g: 35.8,
    Head_Body_Length_mm: 108,
    Tail_Length_mm: 99,
    Hind_Foot_mm: 22.4,
    Ear_Length_mm: 16.5,
    Parasite_Load_Ext: 2,
    Ectoparasite_Spp: 'Xenopsylla cheopis',
    Ectoparasite_Common_Name: 'Oriental rat flea',
    Ectoparasite_Count: 12,
    Endoparasite_Presence: 'Pending Lab',
    Endoparasite_Spp: 'Pending Lab results',
    Endoparasite_Common_Name: 'Pending Lab results',
    Survival_24H: 'Alive',
    Survival_1WK: 'Dead',
    Survival_2WK: 'Removed',
    Survival_1M: 'Removed',
    Survival_3M: 'Removed',
    Recapture_Status: 'New Capture',
    Time_to_Event_Days: 6,
    Event_Status: 1,
    Trap_Night_ID: 4
  },
  {
    Record_ID: 'ERICON-2026-0012',
    Date_Captured: '27/05/2026',
    Time_Checked: '07:10',
    Location_Name: 'Morogoro_Block_A',
    GPS_Latitude: -6.8272,
    GPS_Longitude: 37.6685,
    EMA_Node_ID: 'EMA-2',
    Species_ID: 'Mus musculus',
    Sex: 'Female',
    Maturity_Stage: 'Adult',
    Reproductive_Condition: 'F: Pregnant',
    Weight_g: 19.5,
    Head_Body_Length_mm: 82,
    Tail_Length_mm: 80,
    Hind_Foot_mm: 18.0,
    Ear_Length_mm: 14.1,
    Parasite_Load_Ext: 1,
    Ectoparasite_Spp: 'Laelaps echidnina',
    Ectoparasite_Common_Name: 'Spiny rat mite',
    Ectoparasite_Count: 3,
    Endoparasite_Presence: 'No',
    Endoparasite_Spp: 'None',
    Endoparasite_Common_Name: 'None',
    Survival_24H: 'Alive',
    Survival_1WK: 'Alive',
    Survival_2WK: 'Alive',
    Survival_1M: 'Alive',
    Survival_3M: 'Alive',
    Recapture_Status: 'New Capture',
    Time_to_Event_Days: 90,
    Event_Status: 0,
    Trap_Night_ID: 4
  }
];

// Helper to compute coordinate distance in meters
function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const avgLatRad = ((lat1 + lat2) / 2) * (Math.PI / 180);
  const dLat = lat1 - lat2;
  const dLon = lon1 - lon2;
  // Standard highly precise conversion for local coordinates
  return 111320 * Math.sqrt(dLat * dLat + Math.pow(dLon * Math.cos(avgLatRad), 2));
}

// DBSCAN Clustering algorithm
// eps in meters, minPts in rodents
export function runDBSCAN(specimens: RodentSpecimen[], epsMeters: number = 25, minPts: number = 3): Record<string, string> {
  const n = specimens.length;
  const clusterIds: Record<string, string> = {};
  const visited = new Set<string>();
  let clusterCount = 0;

  specimens.forEach(s => {
    clusterIds[s.Record_ID] = 'Noise';
  });

  function getNeighbors(idx: number) {
    const neighbors: number[] = [];
    for (let i = 0; i < n; i++) {
      const dist = getDistanceMeters(
        specimens[idx].GPS_Latitude, specimens[idx].GPS_Longitude,
        specimens[i].GPS_Latitude, specimens[i].GPS_Longitude
      );
      if (dist <= epsMeters) {
        neighbors.push(i);
      }
    }
    return neighbors;
  }

  for (let i = 0; i < n; i++) {
    const sId = specimens[i].Record_ID;
    if (visited.has(sId)) continue;
    visited.add(sId);

    const neighbors = getNeighbors(i);
    if (neighbors.length < minPts) {
      clusterIds[sId] = 'Noise';
    } else {
      clusterCount++;
      const clusterName = `Cluster_${String(clusterCount).padStart(2, '0')}`;
      clusterIds[sId] = clusterName;

      const queue = [...neighbors.filter(idx => specimens[idx].Record_ID !== sId)];
      const queueSet = new Set(queue);

      for (let j = 0; j < queue.length; j++) {
        const neighborIdx = queue[j];
        const neighborId = specimens[neighborIdx].Record_ID;

        if (!visited.has(neighborId)) {
          visited.add(neighborId);
          const nextNeighbors = getNeighbors(neighborIdx);
          if (nextNeighbors.length >= minPts) {
            nextNeighbors.forEach(idx => {
              if (!queueSet.has(idx)) {
                queueSet.add(idx);
                queue.push(idx);
              }
            });
          }
        }

        if (clusterIds[neighborId] === 'Noise') {
          clusterIds[neighborId] = clusterName;
        }
      }
    }
  }

  return clusterIds;
}

// Chi-square probability CDF approximation via Wilson-Hilferty
function approxChiSqUpperTail(chi2: number, df: number): number {
  if (chi2 <= 0) return 1.0;
  if (df < 1) return 1.0;
  
  // Wilson-Hilferty approximation
  const term1 = chi2 / df;
  const term2 = 2 / (9 * df);
  const z = (Math.pow(term1, 1/3) - (1 - term2)) / Math.sqrt(term2);
  
  // Standard Normal Upper Tail
  const absZ = Math.abs(z);
  const t = 1 / (1 + 0.2316419 * absZ);
  const d = 0.39894228 * Math.exp(-absZ * absZ / 2);
  const phi = 1 - d * t * (0.31938153 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  
  return z > 0 ? 1 - phi : phi;
}

export const ResearchPortal: React.FC = () => {
  // Master database state with robust backward-compatibility parsing
  const [specimens, setSpecimens] = useState<RodentSpecimen[]>(() => {
    try {
      const stored = localStorage.getItem('ericon_research_database_v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.map((item: any) => ({
          Ectoparasite_Spp: item.Ectoparasite_Spp || 'None',
          Ectoparasite_Common_Name: item.Ectoparasite_Common_Name || 'None',
          Ectoparasite_Count: item.Ectoparasite_Count !== undefined ? Number(item.Ectoparasite_Count) : 0,
          Endoparasite_Presence: item.Endoparasite_Presence || 'No',
          Endoparasite_Spp: item.Endoparasite_Spp || 'None',
          Endoparasite_Common_Name: item.Endoparasite_Common_Name || 'None',
          ...item
        }));
      }
      return INITIAL_SPECIMENS;
    } catch {
      return INITIAL_SPECIMENS;
    }
  });

  // DB Filter and Navigation
  const [filterSpecies, setFilterSpecies] = useState<string>('ALL');
  const [filterLocation, setFilterLocation] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // DBSCAN Settings
  const [dbscanEps, setDbscanEps] = useState<number>(30); // 30 meters default
  const [dbscanMinPts, setDbscanMinPts] = useState<number>(3); // 3 rodents minimum

  // Risk Target Coordinates for Hotspot Goodman-Kruskal Gamma & Spearman correlation
  const [riskLat, setRiskLat] = useState<number>(-6.824);
  const [riskLon, setRiskLon] = useState<number>(37.663);
  const [riskName, setRiskName] = useState<string>('Middle Crop Water Stream');

  // CPUE Settings
  const [activeTrapNights, setActiveTrapNights] = useState<number>(10);

  // Survival Cohorts selectors
  const [kmGroupA, setKmGroupA] = useState<string>('Mastomys natalensis');
  const [kmGroupB, setKmGroupB] = useState<string>('Rattus rattus');

  // Species distribution visualizer states
  const [chartDatasetSource, setChartDatasetSource] = useState<'filtered' | 'all'>('filtered');
  const [hoveredSpeciesId, setHoveredSpeciesId] = useState<string | null>(null);

  // ==========================================
  // MULTI-TEAM WORKSPACE & PRIVACY STATES
  // ==========================================
  const [activeTeamCode, setActiveTeamCode] = useState<string>('ERICON-TZ-54821');
  const [activeTeamName, setActiveTeamName] = useState<string>('Sokoine Rodent Ecology Consortium (TZ)');
  const [activeProjectName, setActiveProjectName] = useState<string>('Biosecurity & Suction Core Zoonotic Dispersion Program');
  const [activeInstitution, setActiveInstitution] = useState<string>('Sokoine University of Agriculture');
  const [activeTeamCountry, setActiveTeamCountry] = useState<string>('Tanzania');
  const [activeTeamDuration, setActiveTeamDuration] = useState<string>('24 Months');
  const [activeTeamLeader, setActiveTeamLeader] = useState<string>('Dr. Severine Jenkins');
  const [activeStudySites, setActiveStudySites] = useState<number>(4);
  
  const [privacyMode, setPrivacyMode] = useState<'public' | 'team_only' | 'anonymous'>('team_only');
  const [reviewerModeActive, setReviewerModeActive] = useState<boolean>(false);
  const [showWorkspaceManager, setShowWorkspaceManager] = useState<boolean>(false);
  const [showInvitationGenerator, setShowInvitationGenerator] = useState<boolean>(false);
  const [inviteeRole, setInviteeRole] = useState<'Leader' | 'Member' | 'Reviewer'>('Member');
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamTheme, setNewTeamTheme] = useState('');
  const [generatedInviteCode, setGeneratedInviteCode] = useState('');
  
  // ==========================================
  // SHARED SCIENTIST ACCOUNTS & USER LOGINS
  // ==========================================
  const [currentUser, setCurrentUser] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('ericon_logged_scientist');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authFormMode, setAuthFormMode] = useState<'signin' | 'signup'>('signin');
  const [emailInput, setEmailInput] = useState('');
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [roleInput, setRoleInput] = useState('Research Field Specialist');
  const [professionInput, setProfessionInput] = useState('Bacteriologist');
  const [expertLevel, setExpertLevel] = useState<'Student' | 'Expert'>('Expert');
  const [orcidInput, setOrcidInput] = useState('');
  const [deptInput, setDeptInput] = useState('Epidemiology & Zoonosis');
  const [interestsInput, setInterestsInput] = useState('Rodent Reservoirs, Flea Dispersion Vectoring');
  const [appFocusMode, setAppFocusMode] = useState<'all' | 'research_only'>('all');
  const [authError, setAuthError] = useState<string | null>(null);

  // Sync session authentication with localStorage
  useEffect(() => {
    const handleSyncAuth = () => {
      try {
        const saved = localStorage.getItem('ericon_logged_scientist');
        if (saved) {
          setCurrentUser(JSON.parse(saved));
        } else {
          setCurrentUser(null);
        }
      } catch {}
    };
    handleSyncAuth();
    window.addEventListener('storage', handleSyncAuth);
    const interval = setInterval(handleSyncAuth, 2000);
    return () => {
      window.removeEventListener('storage', handleSyncAuth);
      clearInterval(interval);
    };
  }, []);

  // Save focal preference
  useEffect(() => {
    try {
      localStorage.setItem('ericon_app_focus_mode_v1', appFocusMode);
    } catch {}
  }, [appFocusMode]);

  // Handle invitation join triggers
  const [joinedInviteCode, setJoinedInviteCode] = useState('');
  const handleJoinInvitationCode = () => {
    if (!joinedInviteCode.trim()) return;
    const code = joinedInviteCode.trim().toUpperCase();
    if (code.startsWith('ERICON-REV-') || code === 'ERICON-REV-2034') {
      setReviewerModeActive(true);
      setPrivacyMode('public');
      alert('🔒 SECURITY DE-ESCALATION SUCCESS: Invited Reviewer Mode activated (Read-Only). Direct modifications to capturing databases has been restricted.');
    } else {
      setReviewerModeActive(false);
      setActiveTeamCode(code);
      setActiveTeamName('Tanzania National Zoonotic Taskforce Cluster');
      setActiveProjectName('Collaborative Micro-Biology Dispersion Mapping');
      alert(`🎉 SUCCESS: Joined research team successfully using credentials [${code}]! Raw field telemetry streams mapped.`);
    }
    setJoinedInviteCode('');
  };

  // ==========================================
  // DYNAMIC ACCESSIBILITY & LAYOUT SYNC
  // ==========================================
  const [appFontSize, setAppFontSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('md');
  const [tableZoom, setTableZoom] = useState<number>(100);
  const [pdfFontScale, setPdfFontScale] = useState<number>(0); // off-scale offset
  const [chartTextScale, setChartTextScale] = useState<number>(1.0);
  const [presentationMode, setPresentationMode] = useState<boolean>(false);

  // Parse appearance settings from localStorage periodically
  useEffect(() => {
    const checkAppearanceSettings = () => {
      try {
        const savedFont = localStorage.getItem('ericon_app_font_size');
        if (savedFont) setAppFontSize(savedFont as any);
        
        const savedZoom = localStorage.getItem('ericon_table_zoom');
        if (savedZoom) setTableZoom(Number(savedZoom));

        const savedPdf = localStorage.getItem('ericon_pdf_font_scale');
        if (savedPdf) setPdfFontScale(Number(savedPdf));

        const savedChartText = localStorage.getItem('ericon_chart_font_scale');
        if (savedChartText) setChartTextScale(Number(savedChartText));

        const savedPres = localStorage.getItem('ericon_presentation_mode');
        if (savedPres) setPresentationMode(savedPres === 'true');
      } catch {}
    };
    checkAppearanceSettings();
    const interval = setInterval(checkAppearanceSettings, 1500);
    return () => clearInterval(interval);
  }, []);

  // ==========================================
  // ADVANCED BIOLOGICAL PLENSITY VALIDATIONS
  // ==========================================
  const SPECIES_BIO_RANGES: Record<string, {
    minWeight: number; maxWeight: number;
    minHB: number; maxHB: number;
    minTail: number; maxTail: number;
    footMin: number; footMax: number;
    earMin: number; earMax: number;
  }> = {
    'Mastomys natalensis': { minWeight: 20, maxWeight: 80, minHB: 80, maxHB: 160, minTail: 80, maxTail: 150, footMin: 18, footMax: 30, earMin: 13, earMax: 22 },
    'Rattus rattus': { minWeight: 80, maxWeight: 300, minHB: 150, maxHB: 250, minTail: 150, maxTail: 260, footMin: 25, footMax: 45, earMin: 15, earMax: 28 },
    'Mus musculus': { minWeight: 10, maxWeight: 30, minHB: 50, maxHB: 110, minTail: 50, maxTail: 110, footMin: 12, footMax: 22, earMin: 10, earMax: 18 },
    'Arvicanthis niloticus': { minWeight: 50, maxWeight: 150, minHB: 110, maxHB: 190, minTail: 90, maxTail: 160, footMin: 22, footMax: 36, earMin: 12, earMax: 22 },
    'Other': { minWeight: 5, maxWeight: 500, minHB: 30, maxHB: 300, minTail: 30, maxTail: 300, footMin: 10, footMax: 50, earMin: 8, earMax: 30 },
  };

  const getBioValidationStatus = (species: string, field: 'weight' | 'hb' | 'tail' | 'gps' | 'foot' | 'ear', value: number): any => {
    // If species select is "Other flex" map it to standard "Other" key
    const cleanSpec = (species === 'Other' || species === 'Other flex' || !SPECIES_BIO_RANGES[species]) ? 'Other' : species;
    const ranges = SPECIES_BIO_RANGES[cleanSpec];

    if (field === 'weight') return value >= ranges.minWeight && value <= ranges.maxWeight;
    if (field === 'hb') return value >= ranges.minHB && value <= ranges.maxHB;
    if (field === 'tail') return value >= ranges.minTail && value <= ranges.maxTail;
    if (field === 'foot') return value >= ranges.footMin && value <= ranges.footMax;
    if (field === 'ear') return value >= ranges.earMin && value <= ranges.earMax;
    if (field === 'gps') {
      // East Africa surveillance sectors validation bounds centered near Morogoro (-6.82, 37.66)
      return {
        latValid: value >= -12.0 && value <= -1.0,
        lonValid: value >= 29.0 && value <= 41.0,
        inMorogoroDistrict: value >= -7.5 && value <= -6.0
      };
    }
    return true;
  };

  // ==========================================
  // CSV FILE RECOGNITION & MAPPING ENGINE
  // ==========================================
  const [showCsvImporter, setShowCsvImporter] = useState<boolean>(false);
  const [csvRawText, setCsvRawText] = useState<string>('');
  const [csvUploadError, setCsvUploadError] = useState<string | null>(null);
  const [csvParsedRecords, setCsvParsedRecords] = useState<any[]>([]);
  const [csvFeedbackLogs, setCsvFeedbackLogs] = useState<string[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvSelectedSpecimenMap, setCsvSelectedSpecimenMap] = useState<Record<string, string>>({});

  // Parse comma separated values
  const handleParseCsvText = () => {
    try {
      setCsvUploadError(null);
      setCsvFeedbackLogs([]);
      if (!csvRawText.trim()) {
        throw new Error('CSV text buffer appears empty. Please select a valid file or paste tabular variables.');
      }

      const rows = csvRawText.split(/\r?\n/).map(row => {
        // Simple comma layout parsing, stripping enclosures
        const cells: string[] = [];
        let inQuotes = false;
        let currentCell = '';
        for (let j = 0; j < row.length; j++) {
          const char = row[j];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            cells.push(currentCell.trim());
            currentCell = '';
          } else {
            currentCell += char;
          }
        }
        cells.push(currentCell.trim());
        return cells.map(cell => cell.replace(/^["']|["']$/g, ''));
      }).filter(r => r.length > 0 && r.some(cell => cell.length > 0));

      if (rows.length < 2) {
        throw new Error('Tabular text must contain at least one designated header row and one empirical observational rodent record row.');
      }

      const originalHeaders = rows[0];
      setCsvHeaders(originalHeaders);

      // Intelligent Auto Header Match Synonyms
      const map: Record<string, string> = {};
      const synonymDict: Record<string, string[]> = {
        'Date_Captured': ['date', 'date_captured', 'capture_date', 'day', 'time_captured'],
        'Time_Checked': ['time', 'time_checked', 'hour', 'period'],
        'Location_Name': ['location', 'location_name', 'site', 'village', 'block', 'trap_site'],
        'GPS_Latitude': ['lat', 'latitude', 'gps_latitude', 'gps_lat', 'y_coord'],
        'GPS_Longitude': ['lon', 'long', 'longitude', 'gps_longitude', 'gps_lon', 'x_coord'],
        'Species_ID': ['species', 'species_id', 'taxon', 'rodent_species', 'specimen_species'],
        'Sex': ['sex', 'gender', 's'],
        'Maturity_Stage': ['maturity', 'maturity_stage', 'age_stage', 'age'],
        'Reproductive_Condition': ['reproductive_condition', 'reproductive', 'repro', 'condition'],
        'Weight_g': ['weight', 'weight_g', 'mass', 'g_weight', 'wt'],
        'Head_Body_Length_mm': ['head_body', 'head_body_length_mm', 'hb_length', 'length_hb'],
        'Tail_Length_mm': ['tail', 'tail_length_mm', 'tail_length', 't_length'],
        'Hind_Foot_mm': ['hind_foot', 'hind_foot_mm', 'hf_length', 'foot_mm'],
        'Ear_Length_mm': ['ear', 'ear_length_mm', 'ear_mm'],
        'Ectoparasite_Spp': ['flea', 'tick', 'ecto', 'ectoparasite', 'ectoparasite_spp'],
        'Ectoparasite_Count': ['count', 'ecto_count', 'flea_count', 'parasite_count'],
        'Endoparasite_Presence': ['endo', 'endoparasite', 'endo_presence'],
        'Survival_24H': ['survival_24h', 'survived', 'alive_t1', 'transit_survival']
      };

      originalHeaders.forEach((h, hIdx) => {
        const cleanH = h.toLowerCase().replace(/[\s_-]/g, '');
        let matchedKey = '';
        Object.keys(synonymDict).forEach(k => {
          synonymDict[k].forEach(syn => {
            if (syn.toLowerCase().replace(/[\s_-]/g, '') === cleanH || cleanH === k.toLowerCase()) {
              matchedKey = k;
            }
          });
        });
        if (matchedKey) {
          map[matchedKey] = h;
        }
      });
      
      setCsvSelectedSpecimenMap(map);

      // Parse records based on mappings
      const parsed: any[] = [];
      const logsList: string[] = [];

      for (let i = 1; i < rows.length; i++) {
        const cells = rows[i];
        const record: any = {};
        
        // Populate standard mappings, mapping synonmys
        Object.keys(synonymDict).forEach(key => {
          const mappedColIdx = originalHeaders.indexOf(map[key] || '');
          if (mappedColIdx !== -1 && cells[mappedColIdx] !== undefined) {
            record[key] = cells[mappedColIdx];
          } else {
            // Give sensible fallbacks for blank items
            if (key === 'Date_Captured') record[key] = '28/05/2026';
            else if (key === 'Time_Checked') record[key] = '06:00';
            else if (key === 'Location_Name') record[key] = 'Morogoro_Block_C';
            else if (key === 'GPS_Latitude') record[key] = '-6.8245';
            else if (key === 'GPS_Longitude') record[key] = '37.6635';
            else if (key === 'EMA_Node_ID') record[key] = 'EMA-1';
            else if (key === 'Species_ID') record[key] = 'Mastomys natalensis';
            else if (key === 'Sex') record[key] = 'Male';
            else if (key === 'Maturity_Stage') record[key] = 'Adult';
            else if (key === 'Reproductive_Condition') record[key] = 'M: Scrotal';
            else if (key === 'Weight_g') record[key] = '45';
            else if (key === 'Head_Body_Length_mm') record[key] = '115';
            else if (key === 'Tail_Length_mm') record[key] = '105';
            else if (key === 'Hind_Foot_mm') record[key] = '24';
            else if (key === 'Ear_Length_mm') record[key] = '17.5';
            else if (key === 'Ectoparasite_Spp') record[key] = 'None';
            else if (key === 'Ectoparasite_Count') record[key] = '0';
            else if (key === 'Endoparasite_Presence') record[key] = 'No';
            else if (key === 'Survival_24H') record[key] = 'Alive';
          }
        });

        parsed.push(record);
      }

      setCsvParsedRecords(parsed);
      logsList.push(`✅ Loaded ${parsed.length} raw rodent observational datasets.`);
      logsList.push(`🔍 Matched ${Object.keys(map).length}/18 interface telemetry fields.`);
      setCsvFeedbackLogs(logsList);
    } catch (e: any) {
      setCsvUploadError(e.message || 'Fatal file stream interpretation error.');
    }
  };

  // Final Action to write mapped arrays to Local Database state
  const handleCommitCsvBulkUpload = () => {
    if (csvParsedRecords.length === 0) return;
    
    // Start generating Record_IDs
    const currentMaxNum = specimens.map(s => {
      const parts = s.Record_ID.split('-');
      const num = parseInt(parts[parts.length - 1], 10);
      return isNaN(num) ? 0 : num;
    });
    let maxVal = Math.max(...currentMaxNum, 0);

    const mappedSpecimens: RodentSpecimen[] = csvParsedRecords.map((item, idx) => {
      maxVal += 1;
      const formattedId = `ERICON-2026-${String(maxVal).padStart(4, '0')}`;
      
      // Clean and parsing numeric attributes
      const lat = Number(item.GPS_Latitude) || -6.8245;
      const lon = Number(item.GPS_Longitude) || 37.6635;
      const weight = Number(item.Weight_g) || 45.0;
      const hb = Number(item.Head_Body_Length_mm) || 120;
      const tail = Number(item.Tail_Length_mm) || 110;
      const status24h = (item.Survival_24H === 'Alive' || item.Survival_24H === 'Dead') ? item.Survival_24H : 'Alive';
      
      const cleanSpecies = ['Mastomys natalensis', 'Rattus rattus', 'Mus musculus', 'Arvicanthis niloticus'].includes(item.Species_ID) 
        ? item.Species_ID as any
        : 'Other';

      return {
        Record_ID: formattedId,
        Date_Captured: item.Date_Captured || '28/05/2026',
        Time_Checked: item.Time_Checked || '06:00',
        Location_Name: item.Location_Name || 'Morogoro_Block_C',
        GPS_Latitude: lat,
        GPS_Longitude: lon,
        EMA_Node_ID: 'EMA-1',
        Species_ID: cleanSpecies,
        Sex: (item.Sex === 'Male' || item.Sex === 'Female' || item.Sex === 'Undetermined') ? item.Sex : 'Male',
        Maturity_Stage: (item.Maturity_Stage === 'Juvenile' || item.Maturity_Stage === 'Sub-Adult' || item.Maturity_Stage === 'Adult') ? item.Maturity_Stage : 'Adult',
        Reproductive_Condition: item.Reproductive_Condition || 'M: Scrotal',
        Weight_g: weight,
        Head_Body_Length_mm: hb,
        Tail_Length_mm: tail,
        Hind_Foot_mm: Number(item.Hind_Foot_mm) || 24.0,
        Ear_Length_mm: Number(item.Ear_Length_mm) || 17.5,
        Parasite_Load_Ext: 1,
        Ectoparasite_Spp: item.Ectoparasite_Spp || 'None',
        Ectoparasite_Common_Name: 'None',
        Ectoparasite_Count: Number(item.Ectoparasite_Count) || 0,
        Endoparasite_Presence: 'No',
        Endoparasite_Spp: 'None',
        Endoparasite_Common_Name: 'None',
        Survival_24H: status24h,
        Survival_1WK: 'Alive',
        Survival_2WK: 'Alive',
        Survival_1M: 'Alive',
        Survival_3M: 'Alive',
        Recapture_Status: 'New Capture',
        Time_to_Event_Days: 90,
        Event_Status: 0,
        Trap_Night_ID: 1
      };
    });

    setSpecimens(prev => [...mappedSpecimens, ...prev]);
    alert(`📥 BULK INGESTION COMPLETED COMPLETE: successfully mapped and loaded ${mappedSpecimens.length} external field measurements into the ERICON database!`);
    setShowCsvImporter(false);
    setCsvRawText('');
    setCsvParsedRecords([]);
  };

  // ==========================================
  // SUGGESTED DATABASE EXPANSION VISUAL DICT
  // ==========================================
  const [showDbDict, setShowDbDict] = useState<boolean>(false);
  const SCHEMAS_DICTIONARY = [
    {
      table: 'users',
      description: 'Main authentications table detailing credentials, expert, and profession interests fields.',
      columns: [
        { name: 'id', type: 'VARCHAR (UUID) (PK)', key: 'Yes' },
        { name: 'username', type: 'VARCHAR(45)', key: 'No' },
        { name: 'email', type: 'VARCHAR(120)', key: 'No' },
        { name: 'expert_level', type: 'VARCHAR(12) ("Student" | "Expert")', key: 'No' },
        { name: 'orcid_id', type: 'VARCHAR(24) (Unique)', key: 'No' },
        { name: 'area_of_expertise', type: 'TEXT', key: 'No' },
        { name: 'interests', type: 'TEXT', key: 'No' }
      ],
      samples: [
        { id: 'usr_81b994', username: 'sjenkins', email: 'sjenkins@ericon.org', expert_level: 'Expert', orcid_id: '0000-0002-1825-0097' }
      ]
    },
    {
      table: 'teams',
      description: 'Physical field nodes clusters, grouping field research scopes.',
      columns: [
        { name: 'team_code', type: 'VARCHAR(16) (PK)', key: 'Yes' },
        { name: 'team_name', type: 'VARCHAR(100)', key: 'No' },
        { name: 'institution', type: 'VARCHAR(100)', key: 'No' },
        { name: 'country', type: 'VARCHAR(50)', key: 'No' },
        { name: 'leader_id', type: 'VARCHAR(UUID) (FK)', key: 'No' }
      ],
      samples: [
        { team_code: 'ERICON-TZ-54821', team_name: 'Sokoine Rodent Ecology', institution: 'Sokoine University', country: 'Tanzania' }
      ]
    },
    {
      table: 'projects',
      description: 'Specific clinical focus programs spanning clusters of tracking nodes.',
      columns: [
        { name: 'id', type: 'INT (AUTO_INCREMENT) (PK)', key: 'Yes' },
        { name: 'project_name', type: 'VARCHAR(150)', key: 'No' },
        { name: 'team_code', type: 'VARCHAR(16) (FK)', key: 'No' },
        { name: 'study_duration', type: 'VARCHAR(10)', key: 'No' },
        { name: 'num_sites', type: 'INT', key: 'No' }
      ],
      samples: [
        { id: '1', project_name: 'Zoonotic Vector Dispersion Program', team_code: 'ERICON-TZ-54821', study_duration: '24 Months' }
      ]
    },
    {
      table: 'permissions',
      description: 'Granular ACL matrix regulating actions (e.g., locking datasets, downloading CSV raw streams, approving comments) based on user roles.',
      columns: [
        { name: 'role', type: 'VARCHAR(20) (PK)', key: 'Yes' },
        { name: 'can_insert_raw_data', type: 'BOOLEAN', key: 'No' },
        { name: 'can_export_csv', type: 'BOOLEAN', key: 'No' },
        { name: 'can_approve_comments', type: 'BOOLEAN', key: 'No' },
        { name: 'can_edit_system_variables', type: 'BOOLEAN', key: 'No' }
      ],
      samples: [
        { role: 'Research Member', can_insert_raw_data: '1', can_export_csv: '1', can_approve_comments: '0', can_edit_system_variables: '0' },
        { role: 'Reviewer Mode', can_insert_raw_data: '0', can_export_csv: '0', can_approve_comments: '0', can_edit_system_variables: '0' }
      ]
    }
  ];

  // Interactive Excel Quick Edit row tracking
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editingRowData, setEditingRowData] = useState<Partial<RodentSpecimen> | null>(null);

  // Form State
  const [formData, setFormData] = useState<Omit<RodentSpecimen, 'Record_ID'>>({
    Date_Captured: '28/05/2026',
    Time_Checked: '06:30',
    Location_Name: 'Morogoro_Block_C',
    GPS_Latitude: -6.8245,
    GPS_Longitude: 37.6642,
    EMA_Node_ID: 'EMA-1',
    Species_ID: 'Mastomys natalensis',
    Sex: 'Male',
    Maturity_Stage: 'Adult',
    Reproductive_Condition: 'M: Scrotal',
    Weight_g: 45.0,
    Head_Body_Length_mm: 120,
    Tail_Length_mm: 110,
    Hind_Foot_mm: 24.0,
    Ear_Length_mm: 17.5,
    Parasite_Load_Ext: 1,
    Ectoparasite_Spp: 'Xenopsylla cheopis',
    Ectoparasite_Common_Name: 'Oriental rat flea',
    Ectoparasite_Count: 4,
    Endoparasite_Presence: 'No',
    Endoparasite_Spp: 'None',
    Endoparasite_Common_Name: 'None',
    Survival_24H: 'Alive',
    Survival_1WK: 'Alive',
    Survival_2WK: 'Alive',
    Survival_1M: 'Alive',
    Survival_3M: 'Alive',
    Recapture_Status: 'New Capture',
    Time_to_Event_Days: 90,
    Event_Status: 0,
    Trap_Night_ID: 5
  });

  // Save to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('ericon_research_database_v1', JSON.stringify(specimens));
    } catch (e) {
      console.error(e);
    }
  }, [specimens]);

  // Next Record ID Evaluator
  const nextID = useMemo(() => {
    if (specimens.length === 0) return 'ERICON-2026-0001';
    const ids = specimens.map(s => {
      const parts = s.Record_ID.split('-');
      const num = parseInt(parts[parts.length - 1], 10);
      return isNaN(num) ? 0 : num;
    });
    const maxVal = Math.max(...ids, 0);
    return `ERICON-2026-${String(maxVal + 1).padStart(4, '0')}`;
  }, [specimens]);

  // Insert a fresh blank draft row directly into the grid table (Excel style)
  const handleAddBlankRowExcelStyle = () => {
    const nextRecord: RodentSpecimen = {
      Record_ID: nextID,
      Date_Captured: '28/05/2026',
      Time_Checked: '08:00',
      Location_Name: 'Morogoro_Block_C',
      GPS_Latitude: -6.824,
      GPS_Longitude: 37.663,
      EMA_Node_ID: 'EMA-1',
      Species_ID: 'Mastomys natalensis',
      Sex: 'Male',
      Maturity_Stage: 'Adult',
      Reproductive_Condition: 'M: Scrotal',
      Weight_g: 45.0,
      Head_Body_Length_mm: 120,
      Tail_Length_mm: 110,
      Hind_Foot_mm: 24.0,
      Ear_Length_mm: 17.5,
      Parasite_Load_Ext: 1,
      Ectoparasite_Spp: 'Xenopsylla cheopis',
      Ectoparasite_Common_Name: 'Oriental rat flea',
      Ectoparasite_Count: 1,
      Endoparasite_Presence: 'No',
      Endoparasite_Spp: 'None',
      Endoparasite_Common_Name: 'None',
      Survival_24H: 'Alive',
      Survival_1WK: 'Alive',
      Survival_2WK: 'Alive',
      Survival_1M: 'Alive',
      Survival_3M: 'Alive',
      Recapture_Status: 'New Capture',
      Time_to_Event_Days: 90,
      Event_Status: 0,
      Trap_Night_ID: 5
    };
    setSpecimens(prev => [nextRecord, ...prev]);
    // Enter editing mode for this new row instantly
    setEditingRowId(nextRecord.Record_ID);
    setEditingRowData(nextRecord);
  };

  // Clone record
  const handleCloneSpecimen = (original: RodentSpecimen) => {
    // Generate next sequential record ID properly
    const parts = original.Record_ID.split('-');
    const currentMax = specimens.map(s => {
      const p = s.Record_ID.split('-');
      const num = parseInt(p[p.length - 1], 10);
      return isNaN(num) ? 0 : num;
    });
    const maxVal = Math.max(...currentMax, 0);
    const calculatedId = `ERICON-2026-${String(maxVal + 1).padStart(4, '0')}`;

    const nextRecord: RodentSpecimen = {
      ...original,
      Record_ID: calculatedId,
    };
    setSpecimens(prev => [nextRecord, ...prev]);
    alert(`Rodent Cloned successfully as ${calculatedId}!`);
  };

  // Bulk add 10 Morogoro specimens
  const handleBulkInsertSpecimens = () => {
    const newItems: RodentSpecimen[] = [];
    const speciesOptions: Array<RodentSpecimen['Species_ID']> = [
      'Mastomys natalensis', 'Rattus rattus', 'Mus musculus', 'Arvicanthis niloticus'
    ];
    const ectoOptions = [
      { spp: 'Xenopsylla cheopis', name: 'Oriental rat flea' },
      { spp: 'Laelaps echidnina', name: 'Spiny rat mite' },
      { spp: 'Polyplax louse', name: 'Spiny rat louse' },
    ];
    const endoOptions = [
      { spp: 'Hymenolepis diminuta', name: 'Rat tapeworm' },
      { spp: 'Capillaria hepatica', name: 'Capillaria liver worm' },
    ];

    const currentMax = specimens.map(s => {
      const parts = s.Record_ID.split('-');
      const num = parseInt(parts[parts.length - 1], 10);
      return isNaN(num) ? 0 : num;
    });
    let maxVal = Math.max(...currentMax, 0);

    for (let i = 0; i < 10; i++) {
      maxVal++;
      const rId = `ERICON-2026-${String(maxVal).padStart(4, '0')}`;
      const isFemale = Math.random() > 0.5;
      const species = speciesOptions[Math.floor(Math.random() * speciesOptions.length)];
      
      const load = Math.floor(Math.random() * 4) as RodentSpecimen['Parasite_Load_Ext'];
      const ecto = load > 0 ? ectoOptions[Math.floor(Math.random() * ectoOptions.length)] : { spp: 'None', name: 'None' };
      const ectoCount = load === 1 ? Math.floor(Math.random() * 5 + 1) : load === 2 ? Math.floor(Math.random() * 15 + 6) : load === 3 ? Math.floor(Math.random() * 25 + 21) : 0;
      
      const endoPresent = Math.random() > 0.6 ? 'Yes' : Math.random() > 0.4 ? 'Pending Lab' : 'No';
      const endo = endoPresent === 'Yes' ? endoOptions[Math.floor(Math.random() * endoOptions.length)] : endoPresent === 'Pending Lab' ? { spp: 'Pending Lab results', name: 'Pending Lab results' } : { spp: 'None', name: 'None' };

      const timeToEvent = Math.floor(Math.random() * 85 + 6);
      const died = Math.random() > 0.7 ? 1 : 0;

      newItems.push({
        Record_ID: rId,
        Date_Captured: '28/05/2026',
        Time_Checked: `06:${String(Math.floor(Math.random() * 50) + 10).padStart(2, '0')}`,
        Location_Name: Math.random() > 0.5 ? 'Morogoro_Block_C' : 'Morogoro_Block_A',
        GPS_Latitude: parseFloat((-6.824 + (Math.random() - 0.5) * 0.005).toFixed(6)),
        GPS_Longitude: parseFloat((37.663 + (Math.random() - 0.5) * 0.005).toFixed(6)),
        EMA_Node_ID: `EMA-${Math.floor(Math.random() * 4) + 1}` as any,
        Species_ID: species,
        Sex: isFemale ? 'Female' : 'Male',
        Maturity_Stage: Math.random() > 0.75 ? 'Juvenile' : Math.random() > 0.6 ? 'Sub-Adult' : 'Adult',
        Reproductive_Condition: isFemale ? (Math.random() > 0.5 ? 'F: Pregnant' : 'F: Lactating') : 'M: Scrotal',
        Weight_g: parseFloat((Math.random() * 100 + 15).toFixed(1)),
        Head_Body_Length_mm: Math.floor(Math.random() * 100 + 70),
        Tail_Length_mm: Math.floor(Math.random() * 100 + 65),
        Hind_Foot_mm: parseFloat((Math.random() * 15 + 15).toFixed(1)),
        Ear_Length_mm: parseFloat((Math.random() * 8 + 12).toFixed(1)),
        Parasite_Load_Ext: load,
        Ectoparasite_Spp: ecto.spp,
        Ectoparasite_Common_Name: ecto.name,
        Ectoparasite_Count: ectoCount,
        Endoparasite_Presence: endoPresent as any,
        Endoparasite_Spp: endo.spp,
        Endoparasite_Common_Name: endo.name,
        Survival_24H: died && timeToEvent === 1 ? 'Dead' : 'Alive',
        Survival_1WK: died && timeToEvent <= 7 ? 'Dead' : 'Alive',
        Survival_2WK: died && timeToEvent <= 14 ? 'Dead' : 'Alive',
        Survival_1M: died && timeToEvent <= 30 ? 'Dead' : 'Alive',
        Survival_3M: died ? 'Dead' : 'Alive',
        Recapture_Status: Math.random() > 0.8 ? 'Recapture-Tagged' : 'New Capture',
        Time_to_Event_Days: died ? timeToEvent : 90,
        Event_Status: died as any,
        Trap_Night_ID: Math.floor(Math.random() * 5 + 1)
      });
    }

    setSpecimens(prev => [...newItems, ...prev]);
    alert(`Successfully generated and batch-inserted 10 randomized native Morogoro rodent specimens! Grid now contains ${specimens.length + 10} records.`);
  };

  // Inline Excel Save Handler
  const handleSaveInlineEdit = (id: string) => {
    if (!editingRowData) return;
    setSpecimens(prev => prev.map(s => {
      if (s.Record_ID === id) {
        return {
          ...s,
          ...editingRowData,
          Weight_g: Number(editingRowData.Weight_g),
          Head_Body_Length_mm: Number(editingRowData.Head_Body_Length_mm),
          Tail_Length_mm: Number(editingRowData.Tail_Length_mm),
          Hind_Foot_mm: Number(editingRowData.Hind_Foot_mm),
          Ear_Length_mm: Number(editingRowData.Ear_Length_mm),
          Ectoparasite_Count: Number(editingRowData.Ectoparasite_Count),
          Time_to_Event_Days: Number(editingRowData.Time_to_Event_Days),
          Trap_Night_ID: Number(editingRowData.Trap_Night_ID),
        } as RodentSpecimen;
      }
      return s;
    }));
    setEditingRowId(null);
    setEditingRowData(null);
  };

  // GPS geolocation automatic grabber
  const handleAutoGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            GPS_Latitude: parseFloat(position.coords.latitude.toFixed(6)),
            GPS_Longitude: parseFloat(position.coords.longitude.toFixed(6))
          }));
          alert(`Success: GPS Coordinates retrieved from sensor: ${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`);
        },
        (error) => {
          // Fallback with a randomized variation around Morogoro center coordinates
          const randomLatOffset = (Math.random() - 0.5) * 0.007;
          const randomLonOffset = (Math.random() - 0.5) * 0.007;
          const fallbackLat = parseFloat((-6.824000 + randomLatOffset).toFixed(6));
          const fallbackLon = parseFloat((37.663000 + randomLonOffset).toFixed(6));
          setFormData(prev => ({
            ...prev,
            GPS_Latitude: fallbackLat,
            GPS_Longitude: fallbackLon
          }));
          alert(`GPS Sensor Offline / Permission Denied. Automatic Field Coordinate simulated near Morogoro region:\nLatitude: ${fallbackLat}, Longitude: ${fallbackLon}`);
        }
      );
    } else {
      alert("Geolocator is not supported by this browser. Manual input or Morogoro simulation is required.");
    }
  };

  // Time & Date automatic grabber
  const handleAutoDateTime = () => {
    const now = new Date();
    // format as DD/MM/YYYY
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const dateStr = `${day}/${month}/${year}`;

    // format as HH:MM
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const timeStr = `${hours}:${minutes}`;

    setFormData(prev => ({
      ...prev,
      Date_Captured: dateStr,
      Time_Checked: timeStr
    }));
  };

  // Form Submitter
  const handleAddNewRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (reviewerModeActive) {
      alert("❌ SECURITY EXCEPTION: Database writes locked under Reviewer Mode (Read-Only). Local storage revisions are restricted.");
      return;
    }

    const newRecord: RodentSpecimen = {
      Record_ID: nextID,
      ...formData,
      Weight_g: Number(formData.Weight_g),
      Head_Body_Length_mm: Number(formData.Head_Body_Length_mm),
      Tail_Length_mm: Number(formData.Tail_Length_mm),
      Hind_Foot_mm: Number(formData.Hind_Foot_mm),
      Ear_Length_mm: Number(formData.Ear_Length_mm),
      Time_to_Event_Days: Number(formData.Time_to_Event_Days),
      Trap_Night_ID: Number(formData.Trap_Night_ID),
      Ectoparasite_Count: Number(formData.Ectoparasite_Count)
    };

    setSpecimens(prev => [newRecord, ...prev]);
    alert(`Rodent Record Successfully Created: ${nextID}`);
  };

  // Run live DBSCAN clustering
  const clusterAssignments = useMemo(() => {
    return runDBSCAN(specimens, dbscanEps, dbscanMinPts);
  }, [specimens, dbscanEps, dbscanMinPts]);

  // Filtered Specimens for Spreadsheet View
  const filteredSpecimens = useMemo(() => {
    return specimens.filter(s => {
      const matchSpecies = filterSpecies === 'ALL' || s.Species_ID === filterSpecies;
      const matchLoc = filterLocation === 'ALL' || s.Location_Name === filterLocation;
      const query = searchQuery.trim().toLowerCase();
      const matchSearch = query === '' || 
        s.Record_ID.toLowerCase().includes(query) || 
        s.Location_Name.toLowerCase().includes(query) || 
        s.Species_ID.toLowerCase().includes(query) ||
        s.Ectoparasite_Spp.toLowerCase().includes(query) ||
        s.Endoparasite_Spp.toLowerCase().includes(query);
      return matchSpecies && matchLoc && matchSearch;
    });
  }, [specimens, filterSpecies, filterLocation, searchQuery]);

  // Export spreadsheet as CSV
  const handleExportCSV = () => {
    const headers = [
      'Record_ID', 'Date_Captured', 'Time_Checked', 'Location_Name', 'GPS_Latitude', 'GPS_Longitude', 
      'EMA_Node_ID', 'Species_ID', 'Sex', 'Maturity_Stage', 'Reproductive_Condition', 'Weight_g', 
      'Head_Body_Length_mm', 'Tail_Length_mm', 'Hind_Foot_mm', 'Ear_Length_mm', 'Parasite_Load_Ext', 
      'Ectoparasite_Spp', 'Ectoparasite_Common_Name', 'Ectoparasite_Count',
      'Endoparasite_Presence', 'Endoparasite_Spp', 'Endoparasite_Common_Name', 
      'Survival_24H', 'Survival_1WK', 'Survival_2WK', 'Survival_1M', 'Survival_3M', 
      'Recapture_Status', 'Time_to_Event_Days', 'Event_Status', 'Trap_Night_ID', 'Cluster_ID'
    ];

    const rows = specimens.map(s => [
      s.Record_ID,
      s.Date_Captured,
      s.Time_Checked,
      s.Location_Name,
      s.GPS_Latitude,
      s.GPS_Longitude,
      s.EMA_Node_ID,
      s.Species_ID,
      s.Sex,
      s.Maturity_Stage,
      s.Reproductive_Condition,
      s.Weight_g,
      s.Head_Body_Length_mm,
      s.Tail_Length_mm,
      s.Hind_Foot_mm,
      s.Ear_Length_mm,
      s.Parasite_Load_Ext,
      s.Ectoparasite_Spp,
      s.Ectoparasite_Common_Name,
      s.Ectoparasite_Count,
      s.Endoparasite_Presence,
      s.Endoparasite_Spp,
      s.Endoparasite_Common_Name,
      s.Survival_24H,
      s.Survival_1WK,
      s.Survival_2WK,
      s.Survival_1M,
      s.Survival_3M,
      s.Recapture_Status,
      s.Time_to_Event_Days,
      s.Event_Status,
      s.Trap_Night_ID,
      clusterAssignments[s.Record_ID] || 'Noise'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ERICON_Master_Database_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 1. SURVIVAL ANALYSIS: Kaplan-Meier Curve Generation
  const computeKM = (groupName: string, speciesFilter: string) => {
    const cohort = specimens.filter(s => s.Species_ID === speciesFilter);
    if (cohort.length === 0) return [];

    // Sort by survival times
    const times = cohort.map(s => s.Time_to_Event_Days).sort((a, b) => a - b);
    const uniqueTimes = Array.from(new Set<number>(times));

    let S_t = 1.0;
    const kmCurve: { time: number; survival: number; atRisk: number; deaths: number }[] = [{
      time: 0,
      survival: 1.0,
      atRisk: cohort.length,
      deaths: 0
    }];

    uniqueTimes.forEach(t => {
      // Rodents at risk just before time t (observed time is >= t)
      const atRisk = cohort.filter(s => s.Time_to_Event_Days >= t).length;
      // Deaths occurred exactly at t
      const deaths = cohort.filter(s => s.Time_to_Event_Days === t && s.Event_Status === 1).length;

      if (atRisk > 0) {
        S_t = S_t * (1 - (deaths / atRisk));
      }

      kmCurve.push({
        time: t,
        survival: S_t,
        atRisk,
        deaths
      });
    });

    // Make step extension to 90 days
    if (uniqueTimes.length > 0 && uniqueTimes[uniqueTimes.length - 1] < 90) {
      kmCurve.push({
        time: 90,
        survival: S_t,
        atRisk: 0,
        deaths: 0
      });
    }

    return kmCurve;
  };

  const kmCurveA = useMemo(() => computeKM(kmGroupA, kmGroupA as any), [specimens, kmGroupA]);
  const kmCurveB = useMemo(() => computeKM(kmGroupB, kmGroupB as any), [specimens, kmGroupB]);

  // 1B. LOG-RANK COHORT COMPARISON CALCULATION
  const logRankResult = useMemo(() => {
    // Collect Cohorts
    const cohort1 = specimens.filter(s => s.Species_ID === kmGroupA);
    const cohort2 = specimens.filter(s => s.Species_ID === kmGroupB);

    if (cohort1.length < 2 || cohort2.length < 2) {
      return { 
        hasData: false, 
        message: 'Insufficient cohort size to calculate Log-Rank comparison (minimum 2 specimens per cohort required).'
      };
    }

    // Combine and sort unique failure event times
    const combinedTimes = Array.from(new Set([
      ...cohort1.filter(s => s.Event_Status === 1).map(s => s.Time_to_Event_Days),
      ...cohort2.filter(s => s.Event_Status === 1).map(s => s.Time_to_Event_Days)
    ])).sort((a, b) => a - b);

    let observed1 = 0;
    let expected1 = 0;
    let varSum = 0;

    combinedTimes.forEach(t => {
      // Group 1 metrics
      const n1 = cohort1.filter(s => s.Time_to_Event_Days >= t).length;
      const d1 = cohort1.filter(s => s.Time_to_Event_Days === t && s.Event_Status === 1).length;

      // Group 2 metrics
      const n2 = cohort2.filter(s => s.Time_to_Event_Days >= t).length;
      const d2 = cohort2.filter(s => s.Time_to_Event_Days === t && s.Event_Status === 1).length;

      const n = n1 + n2;
      const d = d1 + d2;

      if (n > 1 && d > 0) {
        observed1 += d1;
        expected1 += n1 * (d / n);
        
        // Variance component
        const v = (n1 * n2 * d * (n - d)) / (n * n * (n - 1));
        varSum += v;
      }
    });

    const diff = observed1 - expected1;
    const chiSquare = varSum > 0 ? (diff * diff) / varSum : 0;
    const pVal = approxChiSqLowerTail(chiSquare, 1);

    function approxChiSqLowerTail(chi2: number, df: number): number {
      return approxChiSqUpperTail(chi2, df); // returns upper tail probability, which is the p-value
    }

    return {
      hasData: true,
      observed1,
      expected1,
      observed2: cohort2.filter(s => s.Event_Status === 1).length,
      expected2: cohort2.length - cohort1.length + expected1, // balance
      chiSquare,
      pVal,
      isSignificant: pVal < 0.05
    };
  }, [specimens, kmGroupA, kmGroupB]);


  // 2. POPULATION DYNAMICS: Catch per Unit Effort (CPUE) & Population Growth Rate λ
  const cpueData = useMemo(() => {
    // Group all captures by Trap_Night_ID
    const uniqueTrapNights = Array.from(new Set<number>(specimens.map(s => s.Trap_Night_ID))).sort((a, b) => a - b);
    
    // Total EMA active nodes is 4, trap nights can be adjusted
    const data = uniqueTrapNights.map(tnId => {
      const recordsOnNight = specimens.filter(s => s.Trap_Night_ID === tnId);
      const count = recordsOnNight.length;
      const cpue = count / (4 * activeTrapNights); // CPUE = Rodents / ( EMA Nodes * Trap Nights )
      return {
        trapNightId: tnId,
        count,
        cpue
      };
    });

    // Compute Population Growth Rate λ
    const withLambda = data.map((d, index) => {
      if (index === 0) return { ...d, lambda: 1.0 };
      const prevCount = data[index - 1].count;
      const lambda = prevCount > 0 ? d.count / prevCount : 1.0;
      return {
        ...d,
        lambda
      };
    });

    return withLambda;
  }, [specimens, activeTrapNights]);


  // 3. GEOSPATIAL CLUSTERING AND CORRELATIONS (Kruskal-Wallis, Goodman-Kruskal, Spearman)
  // Compute distances to Risk coordinate
  const specimensWithRiskDistance = useMemo(() => {
    return specimens.map(s => {
      const dist = getDistanceMeters(s.GPS_Latitude, s.GPS_Longitude, riskLat, riskLon);
      return {
        ...s,
        distToRisk: dist,
        cluster: clusterAssignments[s.Record_ID] || 'Noise'
      };
    });
  }, [specimens, riskLat, riskLon, clusterAssignments]);

  // Compute Kruskal-Wallis H-Test across DBSCAN clusters (excluding noise)
  const kruskalWallisResult = useMemo(() => {
    // 1. Group specimens by clusters
    const clusterGroups: Record<string, number[]> = {};
    specimensWithRiskDistance.forEach(s => {
      if (s.cluster !== 'Noise') {
        if (!clusterGroups[s.cluster]) clusterGroups[s.cluster] = [];
        clusterGroups[s.cluster].push(s.Parasite_Load_Ext);
      }
    });

    const activeClusters = Object.keys(clusterGroups).filter(c => clusterGroups[c].length >= 2);
    if (activeClusters.length < 2) {
      return {
        hasData: false,
        message: 'Requires at least 2 distinct DBSCAN clusters with at least 2 specimens each to compare.'
      };
    }

    // 2. Run Kruskal-Wallis Rank Assignment
    // Combine all rods from active groups
    const flatList: { cluster: string; load: number; index: number; rank: number }[] = [];
    activeClusters.forEach(clusterName => {
      clusterGroups[clusterName].forEach(load => {
        flatList.push({ cluster: clusterName, load, index: 0, rank: 0 });
      });
    });

    // Sort combined of active clusters to assign fractional ranks
    flatList.sort((a, b) => a.load - b.load);
    
    // Assign average ranks for ties
    let i = 0;
    const nTotal = flatList.length;
    while (i < nTotal) {
      let j = i;
      while (j < nTotal && flatList[j].load === flatList[i].load) {
        j++;
      }
      const numTies = j - i;
      // sum of ranks from i+1 to j
      let rankSum = 0;
      for (let r = i + 1; r <= j; r++) {
        rankSum += r;
      }
      const avgRank = rankSum / numTies;
      for (let r = i; r < j; r++) {
        flatList[r].rank = avgRank;
      }
      i = j;
    }

    // 3. Compute rank sum for each group
    const rankSums: Record<string, number> = {};
    activeClusters.forEach(c => { rankSums[c] = 0; });
    
    flatList.forEach(item => {
      rankSums[item.cluster] += item.rank;
    });

    // 4. Calculate Kruskal-Wallis H Statistic
    let sumSqrRanksByN = 0;
    activeClusters.forEach(c => {
      const gSize = clusterGroups[c].length;
      sumSqrRanksByN += (rankSums[c] * rankSums[c]) / gSize;
    });

    const N = nTotal;
    const H = (12 / (N * (N + 1))) * sumSqrRanksByN - 3 * (N + 1);
    const df = activeClusters.length - 1;
    const pVal = approxChiSqUpperTail(H, df);

    return {
      hasData: true,
      H,
      df,
      pVal,
      isSignificant: pVal < 0.05,
      groupsCount: activeClusters.length,
      sampleSize: N
    };
  }, [specimensWithRiskDistance]);

  // Goodman and Kruskal's Gamma (γ) AND Spearman's Rho (ρ)
  const correlationResult = useMemo(() => {
    const list = specimensWithRiskDistance;
    const n = list.length;
    if (n < 4) {
      return {
        hasData: false,
        message: 'Requires at least 4 specimens in database to calculate rank correlations.'
      };
    }

    // Goodman and Kruskal's Gamma:
    // Ordinal variable 1: Parasite_Load_Ext (0, 1, 2, 3)
    // Ordinal variable 2: Inverse distance to risk (closer = higher risk)
    let concordant = 0;
    let discordant = 0;

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const x_diff = list[i].Parasite_Load_Ext - list[j].Parasite_Load_Ext;
        
        // Closer distance = higher risk score
        const risk_i = -list[i].distToRisk;
        const risk_j = -list[j].distToRisk;
        const y_diff = risk_i - risk_j;

        const prod = x_diff * y_diff;
        if (prod > 0) {
          concordant++;
        } else if (prod < 0) {
          discordant++;
        }
      }
    }

    const gamma = (concordant + discordant) > 0 
      ? (concordant - discordant) / (concordant + discordant) 
      : 0;

    // Spearman's Rank Correlation:
    // Rank on Parasite Load
    const sortedByLoad = [...list].map((s, idx) => ({ s, idx, originalIdx: 0, loadRank: 0 }));
    sortedByLoad.sort((a, b) => a.s.Parasite_Load_Ext - b.s.Parasite_Load_Ext);
    
    // Average rank assignment for parasite load ties
    let loadIdx = 0;
    while (loadIdx < n) {
      let nextIdx = loadIdx;
      while (nextIdx < n && sortedByLoad[nextIdx].s.Parasite_Load_Ext === sortedByLoad[loadIdx].s.Parasite_Load_Ext) {
        nextIdx++;
      }
      const numTies = nextIdx - loadIdx;
      let rankSum = 0;
      for (let r = loadIdx + 1; r <= nextIdx; r++) rankSum += r;
      const avgRank = rankSum / numTies;
      for (let r = loadIdx; r < nextIdx; r++) sortedByLoad[r].loadRank = avgRank;
      loadIdx = nextIdx;
    }

    // Rank on Risk Distance
    const sortedByDist = sortedByLoad.map((item, idx) => ({ ...item, distRank: 0 }));
    sortedByDist.sort((a, b) => a.s.distToRisk - b.s.distToRisk); // shorter distance = lower rank or we can do direct distance vs load

    let distIdx = 0;
    while (distIdx < n) {
      let nextIdx = distIdx;
      while (nextIdx < n && sortedByDist[nextIdx].s.distToRisk === sortedByDist[distIdx].s.distToRisk) {
        nextIdx++;
      }
      const numTies = nextIdx - distIdx;
      let rankSum = 0;
      for (let r = distIdx + 1; r <= nextIdx; r++) rankSum += r;
      const avgRank = rankSum / numTies;
      for (let r = distIdx; r < nextIdx; r++) sortedByDist[r].distRank = avgRank;
      distIdx = nextIdx;
    }

    let diffSqSum = 0;
    sortedByDist.forEach(item => {
      const diff = item.loadRank - item.distRank;
      diffSqSum += diff * diff;
    });

    const rho = 1 - (6 * diffSqSum) / (n * (n * n - 1));

    return {
      hasData: true,
      concordant,
      discordant,
      gamma,
      spearmanRho: rho,
      message: gamma > 0.4 ? 'High positive correlation (closer proximity relates to higher ectoparasite loads)' :
               gamma < -0.4 ? 'Alternative environmental buffering' : 'Slight or uncoupled spatial trend'
    };
  }, [specimensWithRiskDistance]);

  // 4. Species Distribution data calculations for Pie Chart
  const speciesDistributionData = useMemo(() => {
    const sourceSet = chartDatasetSource === 'filtered' ? filteredSpecimens : specimens;
    const total = sourceSet.length;

    const counts: { [key: string]: number } = {};
    sourceSet.forEach(s => {
      const sp = s.Species_ID || 'Other';
      counts[sp] = (counts[sp] || 0) + 1;
    });

    const speciesProfiles: {
      [key: string]: {
        name: string;
        color: string;
        accent: string;
        desc: string;
        common: string;
      }
    } = {
      'Mastomys natalensis': {
        name: 'Mastomys natalensis',
        color: '#2563eb', // elegant blue
        accent: 'text-blue-700 bg-blue-50/50 border-blue-200',
        desc: 'Primary reservoir of Lassa virus in East Africa, exhibiting rapid, opportunist reproduction.',
        common: 'Natal Multimammate Mouse',
      },
      'Rattus rattus': {
        name: 'Rattus rattus',
        color: '#0d9488', // teal
        accent: 'text-teal-700 bg-teal-50/50 border-teal-200',
        desc: 'Invasive synanthropic vector, active in grain storage facilities and domestic structures.',
        common: 'Black Rat / Roof Rat',
      },
      'Mus musculus': {
        name: 'Mus musculus',
        color: '#7c3aed', // purple
        accent: 'text-purple-700 bg-purple-50/50 border-purple-200',
        desc: 'Adaptive household colonizer, showing high localized nesting density.',
        common: 'House Mouse',
      },
      'Arvicanthis niloticus': {
        name: 'Arvicanthis niloticus',
        color: '#d97706', // amber
        accent: 'text-amber-800 bg-amber-50/50 border-amber-200',
        desc: 'Diurnal grass-path rodent, heavily active in crop boundaries and agricultural plots.',
        common: 'African Grass Rat',
      },
      'Other': {
        name: 'Other Species',
        color: '#64748b', // slate
        accent: 'text-slate-700 bg-slate-50/50 border-slate-200',
        desc: 'Rare wild rodent species captured in forest border trap setups.',
        common: 'Incidental / Background Species',
      }
    };

    const items = Object.keys(speciesProfiles).map(speciesKey => {
      const count = counts[speciesKey] || 0;
      const pct = total > 0 ? (count / total) * 100 : 0;
      
      const speciesSpecimens = sourceSet.filter(s => (s.Species_ID || 'Other') === speciesKey);
      const avgWeight = speciesSpecimens.length > 0 
        ? speciesSpecimens.reduce((acc, s) => acc + s.Weight_g, 0) / speciesSpecimens.length
        : 0;
      const avgEctoLoad = speciesSpecimens.length > 0
        ? speciesSpecimens.reduce((acc, s) => acc + s.Parasite_Load_Ext, 0) / speciesSpecimens.length
        : 0;
        
      return {
        id: speciesKey,
        name: speciesProfiles[speciesKey].name,
        common: speciesProfiles[speciesKey].common,
        color: speciesProfiles[speciesKey].color,
        accent: speciesProfiles[speciesKey].accent,
        desc: speciesProfiles[speciesKey].desc,
        count,
        pct,
        avgWeight,
        avgEctoLoad,
      };
    }).filter(item => item.count > 0 || item.id !== 'Other'); // always keep primary species, show Others only if count > 0

    return {
      total,
      items,
    };
  }, [specimens, filteredSpecimens, chartDatasetSource]);

  // Shannon Entropy and Simpson Index of Diversity calculations
  const biodiversityIndices = useMemo(() => {
    const sourceSet = chartDatasetSource === 'filtered' ? filteredSpecimens : specimens;
    const N = sourceSet.length;
    if (N <= 1) {
      return { shannon: 0, simpson: 0, status: 'Extremely Low (Homogeneous)' };
    }

    const counts: { [key: string]: number } = {};
    sourceSet.forEach(s => {
      const sp = s.Species_ID || 'Other';
      counts[sp] = (counts[sp] || 0) + 1;
    });

    let shannon = 0;
    let simpsonSum = 0;

    Object.values(counts).forEach(count => {
      const p = count / N;
      if (p > 0) {
        shannon -= p * Math.log(p);
        simpsonSum += p * p;
      }
    });

    const simpson = 1 - simpsonSum;

    let status = 'Moderate Taxonomy';
    if (shannon < 0.5) status = 'Monoculture / Negligible Diversity';
    else if (shannon < 1.0) status = 'Suppressed Biodiversity';
    else if (shannon > 1.3) status = 'Rich Poly-Taxonomic Habitat';
    else status = 'Healthy Natural Balance';

    return {
      shannon,
      simpson,
      status,
    };
  }, [specimens, filteredSpecimens, chartDatasetSource]);

  return (
    <div className="bg-white border-2 border-slate-200 rounded-sm p-5 flex flex-col gap-6 shadow-xs animate-fadeIn" id="research-portal-container">
      
      {/* SECTION TABS FOR PROFESSIONAL FEEL */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-990 text-emerald-400 rounded-xs border border-emerald-800">
            <Compass className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <h2 className="text-md font-mono font-bold text-slate-900 uppercase tracking-tight">ERICON(S) Student & Field Researcher Portal</h2>
            <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase mt-1">Multi-Team Collaboration, Inundation Vector Analytics, and Suction Core Tracking</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="bg-emerald-950 text-emerald-400 hover:bg-emerald-900 border border-emerald-805 font-mono py-1.5 px-3 rounded-xs text-[10.5px] font-extrabold uppercase shadow-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV Master (.CSV)
          </button>
          <button
            type="button"
            onClick={() => {
              if (confirm("Are you sure you want to restore the benchmark research dataset?")) {
                setSpecimens(INITIAL_SPECIMENS);
              }
            }}
            className="bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 font-mono py-1.5 px-3 rounded-xs text-[10.5px] font-bold uppercase transition flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Restore Benchmark
          </button>
        </div>
      </div>

      {/* ========================================================
          COLLABORATIVE WORKSPACE BAR WITH ADVANCED CONTROLLERS
          ======================================================== */}
      <div className="bg-slate-50 border border-slate-200 rounded p-3 text-xs font-mono flex flex-col lg:flex-row lg:items-center justify-between gap-3 shadow-2xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 bg-emerald-900 text-emerald-100 rounded px-2.5 py-1 text-[10px] font-bold">
            <Users className="w-3.5 h-3.5" />
            <span>CRME COLLABORATIVE CLUSTER</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] text-slate-400 font-semibold uppercase leading-tight">Active Research Cluster</span>
            <span className="font-extrabold text-slate-800 uppercase tracking-tight">{activeTeamName} <span className="text-slate-400 font-mono">[{activeTeamCode}]</span></span>
          </div>
          <div className="h-5 w-[1px] bg-slate-200 hidden lg:block" />
          <div className="flex flex-col">
            <span className="text-[9px] text-slate-400 font-semibold uppercase leading-tight">Identity Profile / ORCID ID</span>
            <span className="font-bold text-slate-700">
              {currentUser ? `👤 ${currentUser.username} (${currentUser.role}) [${currentUser.orcid_id || 'No ORCID'}]` : '👤 Standard Field Scientist (Guest)'}
            </span>
          </div>
          {reviewerModeActive && (
            <div className="flex items-center gap-1 bg-blue-100 text-blue-900 border border-blue-200 text-[10px] font-black px-2 py-0.5 rounded animate-pulse shrink-0">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>REVIEWER ACTIVE (READ-ONLY LOCK)</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5 shrink-0 self-end lg:self-auto">
          <button
            type="button"
            onClick={() => { setShowAuthModal(true); setAuthError(null); }}
            className="px-2.5 py-1 bg-white border border-slate-300 rounded hover:bg-slate-50 text-slate-700 transition font-bold flex items-center gap-1 cursor-pointer text-[10.5px]"
          >
            <UserCheck className="w-3.5 h-3.5 text-slate-500" />
            <span>Authorize Scientist</span>
          </button>
          
          <button
            type="button"
            onClick={() => {
              setShowWorkspaceManager(!showWorkspaceManager);
              setShowCsvImporter(false);
              setShowDbDict(false);
            }}
            className={`px-2.5 py-1 rounded transition font-bold flex items-center gap-1 cursor-pointer text-[10.5px] border ${
              showWorkspaceManager ? 'bg-indigo-50 border-indigo-400 text-indigo-900' : 'bg-white border-slate-300 text-slate-700'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>HQ & Hierarchy</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setShowCsvImporter(!showCsvImporter);
              setShowWorkspaceManager(false);
              setShowDbDict(false);
            }}
            className={`px-2.5 py-1 rounded transition font-bold flex items-center gap-1 cursor-pointer text-[10.5px] border ${
              showCsvImporter ? 'bg-teal-50 border-teal-400 text-teal-900' : 'bg-emerald-50 border-emerald-300 text-emerald-950'
            }`}
          >
            <FolderGit className="w-3.5 h-3.5" />
            <span>Bulk CSV Ingest</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setShowDbDict(!showDbDict);
              setShowWorkspaceManager(false);
              setShowCsvImporter(false);
            }}
            className={`px-2.5 py-1 rounded transition font-bold flex items-center gap-1 cursor-pointer text-[10.5px] border ${
              showDbDict ? 'bg-amber-50 border-amber-400 text-amber-900' : 'bg-white border-slate-300 text-slate-700'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-600" />
            <span>SQL Schema Dictionary</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          1. AUTHORIZATION & ACCOUNT SWITCHING REGISTRATION TOOL
          ======================================================== */}
      {showAuthModal && (
        <div className="bg-slate-900 text-slate-100 border-2 border-slate-700 rounded p-4 flex flex-col gap-3 font-mono shadow-md animate-slideIn">
          <div className="flex items-center justify-between border-b border-slate-850 pb-2">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-black uppercase text-emerald-200">ERICON Authorized Scientist Credentials Manager</span>
            </div>
            <button 
              type="button" 
              onClick={() => setShowAuthModal(false)}
              className="text-slate-400 hover:text-slate-200 font-bold border border-slate-700 hover:border-slate-500 rounded px-1 text-[10px]"
            >
              ✕ Close Panel
            </button>
          </div>

          <p className="text-[10px] text-slate-400 leading-relaxed">
            Register or sign-in with your institutional profile credentials. Configuring your profile synchronizes comments inside the Peer Discussion rooms, unlocks premium dashboards, and registers your official ORCID for academic publish streams.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 bg-slate-950 p-3 rounded border border-slate-800">
            {/* Left side credentials */}
            <div className="md:col-span-1 flex flex-col gap-2">
              <span className="text-[9.5px] font-black uppercase tracking-widest text-emerald-300 border-b border-slate-800 pb-1">Science Core Profile</span>
              <div>
                <label className="block text-[9px] text-slate-400 font-bold mb-0.5">Researcher Username</label>
                <input
                  type="text"
                  placeholder="e.g. sjenkins"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white outline-none focus:border-emerald-500 font-bold text-[11px]"
                />
              </div>
              <div>
                <label className="block text-[9px] text-slate-400 font-bold mb-0.5">Institutional Email</label>
                <input
                  type="email"
                  placeholder="e.g. sjenkins@ericon-tz.org"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white outline-none focus:border-emerald-500 text-[11px]"
                />
              </div>
              <div>
                <label className="block text-[9px] text-slate-400 font-bold mb-0.5">Academic ORCID ID</label>
                <input
                  type="text"
                  placeholder="e.g. 0000-0002-1825-0097"
                  value={orcidInput}
                  onChange={(e) => setOrcidInput(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white outline-none focus:border-emerald-500 font-mono text-[11px]"
                />
              </div>
            </div>

            {/* Middle side profile values */}
            <div className="md:col-span-1 flex flex-col gap-2">
              <span className="text-[9.5px] font-black uppercase tracking-widest text-emerald-300 border-b border-slate-800 pb-1">Surveillance Expertise</span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] text-slate-400 font-bold mb-0.5">Science Role</label>
                  <select
                    value={roleInput}
                    onChange={(e) => setRoleInput(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-slate-200 outline-none text-[10.5px]"
                  >
                    <option value="Research Fellow">Research Fellow</option>
                    <option value="Field Biologist">Field Biologist</option>
                    <option value="Lead Investigator">Lead Investigator</option>
                    <option value="Graduate Student">Graduate Student</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] text-slate-400 font-bold mb-0.5">Expert Scale</label>
                  <select
                    value={expertLevel}
                    onChange={(e) => setExpertLevel(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-slate-200 outline-none text-[10.5px]"
                  >
                    <option value="Expert">Expert Scientist</option>
                    <option value="Student">Student (Field Only)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[9px] text-slate-400 font-bold mb-0.5">Academic Specialty</label>
                <input
                  type="text"
                  placeholder="e.g. Zoonosis Reserve Modeling"
                  value={professionInput}
                  onChange={(e) => setProfessionInput(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white outline-none focus:border-emerald-500 text-[11px]"
                />
              </div>
              <div>
                <label className="block text-[9px] text-slate-400 font-bold mb-0.5">University / Dept</label>
                <input
                  type="text"
                  placeholder="e.g. Epidemiology and Public Health"
                  value={deptInput}
                  onChange={(e) => setDeptInput(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white outline-none focus:border-emerald-500 text-[11px]"
                />
              </div>
            </div>

            {/* Right side focus and authentication actions */}
            <div className="md:col-span-1 flex flex-col gap-2 justify-between">
              <div>
                <span className="text-[9.5px] font-black uppercase tracking-widest text-emerald-300 border-b border-slate-800 pb-1">Console View Filter</span>
                <label className="block text-[9px] text-slate-400 font-bold mb-1 mt-1">App Mode Focus Preference</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAppFocusMode('all');
                      localStorage.setItem('ericon_app_focus_mode_v1', 'all');
                    }}
                    className={`flex-1 text-[10px] py-1 border rounded text-center font-bold font-mono transition cursor-pointer ${
                      appFocusMode === 'all' ? 'bg-emerald-800 border-emerald-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    🚀 Full System (Eng + Sim)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAppFocusMode('research_only');
                      localStorage.setItem('ericon_app_focus_mode_v1', 'research_only');
                    }}
                    className={`flex-1 text-[10px] py-1 border rounded text-center font-bold font-mono transition cursor-pointer ${
                      appFocusMode === 'research_only' ? 'bg-amber-800 border-amber-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    🌾 Student Field Suite
                  </button>
                </div>
                <p className="text-[9px] text-slate-500 mt-1 leading-normal italic">
                  Choosing "Student" hides physics components to preserve screen layouts.
                </p>
              </div>

              <div className="flex flex-col gap-1.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const profileData = {
                      username: usernameInput || 'sjenkins',
                      email: emailInput || 'sjenkins@ericon.org',
                      orcid_id: orcidInput || '0000-0002-1825-0097',
                      role: roleInput,
                      specialty: professionInput,
                      expertLevel: expertLevel,
                      dept: deptInput,
                      interests: interestsInput,
                      registeredAt: new Date().toISOString()
                    };
                    localStorage.setItem('ericon_logged_scientist', JSON.stringify(profileData));
                    setCurrentUser(profileData);
                    alert(`✅ AUTHORIZED: Signed up and logged in successfully! Welcome back, ${profileData.username}!`);
                    setShowAuthModal(false);
                  }}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-emerald-950 font-black text-[11px] py-1.5 rounded uppercase cursor-pointer"
                >
                  Verify credentials
                </button>
                
                {currentUser && (
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.removeItem('ericon_logged_scientist');
                      setCurrentUser(null);
                      alert('🔓 Log out completed correctly. Session purged.');
                    }}
                    className="w-full bg-transparent hover:bg-slate-850 text-rose-400 hover:text-rose-300 font-bold border border-rose-800 text-[10px] py-1 rounded cursor-pointer"
                  >
                    Logout active session
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          2. WORKSPACE MANAGER & TEAM COORDINATION CONTROLLER
          ======================================================== */}
      {showWorkspaceManager && (
        <div className="bg-slate-50 border border-indigo-200 rounded p-4 flex flex-col gap-3 font-mono text-xs shadow-xs animate-slideIn">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="flex items-center gap-1.5 text-indigo-900 font-black text-xs uppercase">
              <Settings className="w-4 h-4 text-indigo-700 animate-spin-slow" />
              <span>Collaborative HQ: Cluster Hierarchy & Permissions</span>
            </div>
            <button 
              type="button" 
              onClick={() => setShowWorkspaceManager(false)}
              className="text-slate-500 hover:text-slate-800 border rounded px-1 text-[9px] cursor-pointer"
            >
              ✕ Collapse
            </button>
          </div>

          <p className="text-[10px] text-slate-500 leading-normal">
            Configure target project details, define physical nodes hierarchy, and manage secure invite code verification streams. Invited members receive shared database views with dynamic role privileges.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 bg-white p-3 rounded border border-slate-200">
            {/* Hierarchy Column 1 */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-black text-indigo-950 uppercase pb-1 border-b">1. Node Project Meta</span>
              <div>
                <label className="block text-[9px] text-slate-400 font-semibold uppercase">Cluster Research Project</label>
                <input
                  type="text"
                  value={activeProjectName}
                  onChange={(e) => setActiveProjectName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-0.5 text-[11px]"
                />
              </div>
              <div>
                <label className="block text-[9px] text-slate-400 font-semibold uppercase">Surveillance Institution</label>
                <input
                  type="text"
                  value={activeInstitution}
                  onChange={(e) => setActiveInstitution(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-0.5 text-[11px]"
                />
              </div>
            </div>

            {/* Hierarchy Column 2 */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-black text-indigo-950 uppercase pb-1 border-b">2. Territorial Details</span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] text-slate-400 font-semibold uppercase">Country</label>
                  <input
                    type="text"
                    value={activeTeamCountry}
                    onChange={(e) => setActiveTeamCountry(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-0.5 text-[11.5px] font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[9px] text-slate-400 font-semibold uppercase">Study Sites</label>
                  <input
                    type="number"
                    value={activeStudySites}
                    onChange={(e) => setActiveStudySites(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-0.5 text-[11px]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[9px] text-slate-400 font-semibold uppercase">Active Team Leader</label>
                <input
                  type="text"
                  value={activeTeamLeader}
                  onChange={(e) => setActiveTeamLeader(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-0.5 text-[11px] font-medium"
                />
              </div>
            </div>

            {/* Hierarchy Column 3 */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-black text-indigo-950 uppercase pb-1 border-b">3. Access Credentials & Invites</span>
              <div>
                <label className="block text-[9px] text-slate-400 font-bold uppercase mb-0.5">Enter Invite / Security Code</label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="e.g. ERICON-REV-2034"
                    value={joinedInviteCode}
                    onChange={(e) => setJoinedInviteCode(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-300 rounded px-2 py-1 text-slate-800 outline-none uppercase font-bold text-[11px]"
                  />
                  <button
                    type="button"
                    onClick={handleJoinInvitationCode}
                    className="px-2.5 bg-indigo-900 border border-indigo-750 text-emerald-300 hover:bg-indigo-850 rounded font-black cursor-pointer text-[10.5px]"
                  >
                    Join
                  </button>
                </div>
                <div className="mt-1 font-mono text-[9px] leading-tight text-slate-400 italic">
                  Entering <strong className="text-indigo-850">ERICON-REV-2034</strong> forces Invited Reviewer Mode (Read-Only). Entering any standard string changes cluster.
                </div>
              </div>

              {/* Generate Invite Link */}
              <div className="pt-2 border-t border-dashed">
                <button
                  type="button"
                  onClick={() => {
                    const rnd = Math.floor(10000 + Math.random() * 90000);
                    const link = `https://ai.studio/build/ericon-crme?invite=TZ-${rnd}`;
                    setGeneratedInviteCode(link);
                  }}
                  className="w-full py-1 border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-sm font-bold flex items-center justify-center gap-1 text-[10.5px] cursor-pointer"
                >
                  🔗 Generate Academic Share Code
                </button>
                {generatedInviteCode && (
                  <div className="mt-1.5 p-1 text-[8.5px] bg-indigo-50 text-indigo-905 border border-indigo-200 rounded break-all select-all font-mono">
                    {generatedInviteCode}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          3. ADVANCED CSV FILE INGESTION / PARSING & FIELD MAPPING TOOL
          ======================================================== */}
      {showCsvImporter && (
        <div className="bg-slate-50 border border-teal-200 rounded p-4 flex flex-col gap-3 font-mono text-xs shadow-xs animate-slideIn">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="flex items-center gap-1.5 text-teal-900 font-black text-xs uppercase">
              <FolderGit className="w-4 h-4 text-emerald-800 animate-pulse" />
              <span>External Rodent Survey CSV Parsing & Intelligent Mapping Engine</span>
            </div>
            <button 
              type="button" 
              onClick={() => setShowCsvImporter(false)}
              className="text-slate-500 hover:text-slate-800 border rounded px-1.2 py-0.2 text-[9px] cursor-pointer"
            >
              ✕ Close
            </button>
          </div>

          <p className="text-[10px] text-slate-500 leading-normal">
            Import external spreadsheets or surveillance database CSV logs. Paste text raw streams directly or upload survey databases, specify attribute mappings, and instantly generate compliant <strong>RodentSpecimen</strong> objects.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-1">
            {/* Input column */}
            <div className="lg:col-span-4 flex flex-col gap-2 bg-white p-3 rounded border border-slate-250">
              <span className="text-[10px] font-black uppercase text-slate-700 tracking-tight">1. Raw Text Buffer</span>
              <textarea
                rows={7}
                placeholder={`Capture_Date,Specific_Taxon,Site_Name,Lat,Long,Rodent_Mass,HF_Length
28/05/2026,Mastomys natalensis,Morogoro_Block_C,-6.824,37.663,45.2,24
29/05/2026,Rattus rattus,Morogoro_Block_C,-6.825,37.665,110,31`}
                value={csvRawText}
                onChange={(e) => setCsvRawText(e.target.value)}
                className="w-full bg-slate-50 border border-slate-350 rounded p-1.5 font-mono text-[10px] text-slate-800 outline-none focus:border-teal-600"
              />
              <button
                type="button"
                onClick={handleParseCsvText}
                className="w-full py-1.5 bg-teal-900 text-teal-300 border border-teal-750 hover:bg-teal-850 rounded font-black uppercase text-[10.5px] cursor-pointer transition flex items-center justify-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Parse & Match Headers
              </button>
              {csvUploadError && (
                <div className="p-1.5 bg-rose-50 border border-rose-200 text-rose-800 font-bold text-[9px] rounded leading-relaxed animate-pulse">
                  ❌ Error: {csvUploadError}
                </div>
              )}
            </div>

            {/* Field Mapping column */}
            <div className="lg:col-span-5 flex flex-col gap-2 bg-white p-3 rounded border border-slate-250">
              <span className="text-[10px] font-black uppercase text-slate-700 tracking-tight">2. Attribute Target Map</span>
              <div className="text-[9.5px] text-slate-400 uppercase italic leading-tight pb-1 border-b">
                Maps CSV column headers to the target schema fields:
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                {[
                  { field: 'Date_Captured', label: 'Capture Date' },
                  { field: 'Location_Name', label: 'Site Name' },
                  { field: 'GPS_Latitude', label: 'Lat Coord' },
                  { field: 'GPS_Longitude', label: 'Lon Coord' },
                  { field: 'Species_ID', label: 'Taxon Spp' },
                  { field: 'Sex', label: 'Specimen Sex' },
                  { field: 'Weight_g', label: 'Weight (g)' },
                  { field: 'Head_Body_Length_mm', label: 'HB length' },
                  { field: 'Tail_Length_mm', label: 'Tail length' }
                ].map(item => (
                  <div key={item.field} className="flex items-center justify-between gap-1 border-b border-slate-50 pb-1">
                    <span className="text-[10px] text-slate-650 font-bold max-w-[90px] truncate" title={item.label}>📁 {item.label}</span>
                    <select
                      value={csvSelectedSpecimenMap[item.field] || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCsvSelectedSpecimenMap(prev => ({ ...prev, [item.field]: val }));
                      }}
                      className="bg-slate-50 border rounded-xs px-1 text-[9px] max-w-[100px] text-slate-900 cursor-pointer font-bold"
                    >
                      <option value="">-- Ignore --</option>
                      {csvHeaders.map(ch => (
                        <option key={ch} value={ch}>{ch}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {/* Action/Preview Column */}
            <div className="lg:col-span-3 flex flex-col gap-2 bg-slate-100 p-3 rounded border border-slate-250">
              <span className="text-[10px] font-black uppercase text-slate-850 tracking-tight">3. Preview & Commit</span>
              
              <div className="max-h-[110px] overflow-y-auto border rounded bg-white p-1.5 font-mono text-[8.5px] leading-relaxed">
                <span className="text-[9px] font-extrabold uppercase text-slate-500 border-b pb-0.5 block mb-1">Surveillance Log:</span>
                {csvFeedbackLogs.length === 0 ? (
                  <span className="text-slate-400 italic">Submit raw CSV text rows to populate live processing preview logs.</span>
                ) : (
                  csvFeedbackLogs.map((log, lIdx) => (
                    <div key={lIdx} className="border-b border-slate-50 py-0.2">{log}</div>
                  ))
                )}
                {csvParsedRecords.length > 0 && (
                  <div className="mt-1 font-bold text-teal-800">
                    🔍 Mapped 1st record row sample: 
                    <pre className="text-[7.5px] bg-slate-50 p-1 border rounded leading-tight mt-0.5 whitespace-pre-wrap max-w-full">
                      {JSON.stringify(csvParsedRecords[0], null, 1)}
                    </pre>
                  </div>
                )}
              </div>

              <div className="pt-2 mt-auto border-t border-dashed border-slate-300">
                <button
                  type="button"
                  onClick={handleCommitCsvBulkUpload}
                  disabled={csvParsedRecords.length === 0}
                  className="w-full py-1.5 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-[10.5px] font-black uppercase rounded-xs transition shadow-xs cursor-pointer flex items-center justify-center gap-10.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  Save mapped rows ({csvParsedRecords.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          4. SUGGESTED DATABASE EXPANSION VISUAL DICT
          ======================================================== */}
      {showDbDict && (
        <div className="bg-slate-50 border border-amber-300 rounded p-4 flex flex-col gap-3 font-mono text-xs shadow-xs animate-slideIn" id="db-dictionary-accordion">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="flex items-center gap-1.5 text-amber-900 font-extrabold text-xs uppercase">
              <BookOpen className="w-4 h-4 text-amber-700" />
              <span>SQL Relational Database Schema & Data Dictionary</span>
            </div>
            <button 
              type="button" 
              onClick={() => setShowDbDict(false)}
              className="text-slate-500 hover:text-slate-800 border rounded px-1 text-[9px] cursor-pointer"
            >
              ✕ Collapse Dictionary
            </button>
          </div>

          <p className="text-[10px] text-slate-500 leading-normal">
            This interactive guide documents the actual relational schemas used under the hood to store and validate user registrations, research clusters, and permission lists across the clinical ERICON environment.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1 pr-1">
            {SCHEMAS_DICTIONARY.map((tbl) => (
              <div key={tbl.table} className="bg-white border-2 border-slate-200 hover:border-amber-200 transition p-3 rounded flex flex-col gap-2">
                <div className="flex items-center justify-between border-b pb-1">
                  <span className="font-extrabold text-slate-900 text-xs text-[11px] bg-slate-100 hover:bg-amber-50 px-2 py-0.5 rounded font-mono">
                    Table: {tbl.table}
                  </span>
                  <span className="text-[9px] text-slate-400">MySQL / Postgres Relational</span>
                </div>
                <p className="text-[9.5px] text-slate-400 italic leading-snug">{tbl.description}</p>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[9px] font-mono border-collapse divide-y divide-slate-100">
                    <thead className="bg-slate-50 text-slate-550 font-black">
                      <tr>
                        <th className="py-1 px-1">Column</th>
                        <th className="py-1 px-1">SQL Type</th>
                        <th className="py-1 px-1 text-right">Key</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-slate-700">
                      {tbl.columns.map(col => (
                        <tr key={col.name} className="hover:bg-slate-50/50">
                          <td className="py-1 px-1 font-bold text-[10px] text-indigo-950">{col.name}</td>
                          <td className="py-1 px-1">{col.type}</td>
                          <td className="py-1 px-1 text-right text-rose-700 font-bold">{col.key === 'Yes' ? 'PK 🗝️' : ''}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: FIELD SPECIMEN DATA ENTRY FORM */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-slate-50 border border-slate-250 rounded-sm p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-900 uppercase border-b pb-2">
              <Plus className="w-4 h-4 text-emerald-700 animate-pulse" />
              <span>Specimen Capture Entry Terminal</span>
              <span className="ml-auto text-[9.5px] bg-emerald-50 border border-emerald-250 text-emerald-900 font-mono px-2 py-0.5 rounded-sm">
                Next ID: {nextID}
              </span>
            </div>

            <form onSubmit={handleAddNewRecord} className="text-[11px] font-mono flex flex-col gap-3">
              
              {/* SECTION A: Geospatial, Temporal & System Identifiers */}
              <div className="border border-slate-200 bg-white p-3 rounded-xs flex flex-col gap-2">
                <div className="flex items-center justify-between border-b pb-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Section A: Temporal Identifiers</span>
                  <button 
                    type="button" 
                    onClick={handleAutoDateTime} 
                    className="text-[9px] text-emerald-800 hover:text-emerald-900 border border-emerald-300 bg-emerald-50 px-1.5 py-0.5 rounded font-extrabold transition flex items-center gap-0.5 cursor-pointer"
                  >
                    ⚡ Auto-Set Time & Date
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Date Captured</label>
                    <input 
                      type="text" 
                      required
                      placeholder="DD/MM/YYYY" 
                      value={formData.Date_Captured} 
                      onChange={e => setFormData(prev => ({ ...prev, Date_Captured: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Time Checked</label>
                    <input 
                      type="text" 
                      required
                      placeholder="HH:MM" 
                      value={formData.Time_Checked} 
                      onChange={e => setFormData(prev => ({ ...prev, Time_Checked: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-slate-800"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-1.5 mt-1 pb-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Geospatial Identifiers</span>
                  <button 
                    type="button" 
                    onClick={handleAutoGPS} 
                    className="text-[9px] text-teal-800 hover:text-teal-905 border border-teal-300 bg-teal-50 px-1.5 py-0.5 rounded font-extrabold transition flex items-center gap-0.5 cursor-pointer"
                  >
                    🛰️ Auto-Grab Coordinates
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="block text-slate-500 font-bold mb-1">Location Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Morogoro_Block_C" 
                      value={formData.Location_Name} 
                      onChange={e => setFormData(prev => ({ ...prev, Location_Name: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-bold mb-1">EMA Node ID</label>
                    <select 
                      value={formData.EMA_Node_ID} 
                      onChange={e => setFormData(prev => ({ ...prev, EMA_Node_ID: e.target.value as any }))}
                      className="w-full bg-slate-50 border border-slate-300 rounded px-1.5 py-1 text-slate-800 font-bold"
                    >
                      <option value="EMA-1">EMA-1</option>
                      <option value="EMA-2">EMA-2</option>
                      <option value="EMA-3">EMA-3</option>
                      <option value="EMA-4">EMA-4</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-500 font-bold mb-1">GPS Latitude (-90 to +90)</label>
                    <input 
                      type="number" 
                      step="0.000001" 
                      min="-90" 
                      max="90"
                      required
                      value={formData.GPS_Latitude} 
                      onChange={e => setFormData(prev => ({ ...prev, GPS_Latitude: Number(e.target.value) }))}
                      className={`w-full bg-slate-50 border rounded px-2 py-1 text-slate-800 ${
                        !getBioValidationStatus(formData.Species_ID, 'gps', formData.GPS_Latitude).latValid
                          ? 'border-red-500 bg-red-50/50'
                          : !getBioValidationStatus(formData.Species_ID, 'gps', formData.GPS_Latitude).inMorogoroDistrict
                          ? 'border-amber-400 bg-amber-50/50'
                          : 'border-slate-300 focus:border-emerald-600'
                      }`}
                    />
                    {/* Live Geo Validator */}
                    <div className="mt-1 font-mono text-[9px]">
                      {!getBioValidationStatus(formData.Species_ID, 'gps', formData.GPS_Latitude).latValid ? (
                        <span className="text-red-700 font-bold">❌ Error: Invalid EA Latitude bounds</span>
                      ) : !getBioValidationStatus(formData.Species_ID, 'gps', formData.GPS_Latitude).inMorogoroDistrict ? (
                        <span className="text-amber-700 font-semibold">⚠ Warning: Outside local Morogoro sector</span>
                      ) : (
                        <span className="text-emerald-700 font-bold">✔ Plausible surveillance grid</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-500 font-bold mb-1">GPS Longitude (-180 to +180)</label>
                    <input 
                      type="number" 
                      step="0.000001" 
                      min="-180" 
                      max="180"
                      required
                      value={formData.GPS_Longitude} 
                      onChange={e => setFormData(prev => ({ ...prev, GPS_Longitude: Number(e.target.value) }))}
                      className={`w-full bg-slate-50 border rounded px-2 py-1 text-slate-800 ${
                        formData.GPS_Longitude < 29.0 || formData.GPS_Longitude > 41.0
                          ? 'border-red-500 bg-red-50/50'
                          : formData.GPS_Longitude < 35.0 || formData.GPS_Longitude > 40.0
                          ? 'border-amber-400 bg-amber-50/50'
                          : 'border-slate-300 focus:border-emerald-600'
                      }`}
                    />
                    <div className="mt-1 font-mono text-[9px]">
                      {(formData.GPS_Longitude < 29.0 || formData.GPS_Longitude > 41.0) ? (
                        <span className="text-red-700 font-bold">❌ Error: Invalid EA Longitude bounds</span>
                      ) : (formData.GPS_Longitude < 35.0 || formData.GPS_Longitude > 40.0) ? (
                        <span className="text-amber-700 font-semibold">⚠ Warning: Outside Eastern Trench zone</span>
                      ) : (
                        <span className="text-emerald-700 font-bold">✔ Plausible surveillance grid</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION B: Taxonomy & Biological Assessment */}
              <div className="border border-slate-200 bg-white p-3 rounded-xs flex flex-col gap-2">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pb-1 border-b">Section B: Taxonomy & Biology</span>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div>
                                  <select 
                      value={formData.Species_ID} 
                      onChange={e => setFormData(prev => ({ ...prev, Species_ID: e.target.value as any }))}
                      className="w-full bg-slate-50 border border-slate-300 rounded p-1 text-slate-800 font-bold"
                    >
                      <option value="Mastomys natalensis">Mastomys natalensis</option>
                      <option value="Rattus rattus">Rattus rattus</option>
                      <option value="Mus musculus">Mus musculus</option>
                      <option value="Arvicanthis niloticus">Arvicanthis niloticus</option>
                      <option value="Other">Other Species</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Sex</label>
                    <select 
                      value={formData.Sex} 
                      onChange={e => setFormData(prev => ({ ...prev, Sex: e.target.value as any }))}
                      className="w-full bg-slate-50 border border-slate-300 rounded p-1 text-slate-800 font-semibold"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Undetermined">Undetermined</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Maturity Stage</label>
                    <select 
                      value={formData.Maturity_Stage} 
                      onChange={e => setFormData(prev => ({ ...prev, Maturity_Stage: e.target.value as any }))}
                      className="w-full bg-slate-50 border border-slate-300 rounded p-1 text-slate-800"
                    >
                      <option value="Juvenile">Juvenile</option>
                      <option value="Sub-Adult">Sub-Adult</option>
                      <option value="Adult">Adult</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Reproductive Condition</label>
                    <select 
                      value={formData.Reproductive_Condition} 
                      onChange={e => setFormData(prev => ({ ...prev, Reproductive_Condition: e.target.value as any }))}
                      className="w-full bg-slate-50 border border-slate-300 rounded p-1 text-slate-800"
                    >
                      <option value="M: Scrotal">M: Scrotal (Active)</option>
                      <option value="M: Non-scrotal">M: Non-scrotal</option>
                      <option value="F: Perforate">F: Perforate</option>
                      <option value="F: Lactating">F: Lactating</option>
                      <option value="F: Pregnant">F: Pregnant</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION C: Morphometric Measurements */}
              <div className="border border-slate-200 bg-white p-3 rounded-xs flex flex-col gap-2">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pb-1 border-b">Section C: Morphometric Measurements</span>
                
                {/* Species Reference Badge */}
                <div className="bg-slate-50 border p-1.5 rounded-xs flex items-center justify-between text-[10px]">
                  <span className="text-slate-500">Validation Matrix:</span>
                  <span className="font-bold text-emerald-900 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                    {formData.Species_ID} Bounds
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1.5 mt-1">
                  <div>
                    <label className="block text-slate-500 font-bold mb-0.5">Weight (g)</label>
                    <input 
                      type="number" 
                      step="0.1" 
                      required
                      value={formData.Weight_g} 
                      onChange={e => setFormData(prev => ({ ...prev, Weight_g: Number(e.target.value) }))}
                      className={`w-full bg-slate-50 border rounded px-1.5 py-1 text-slate-800 font-bold ${
                        !getBioValidationStatus(formData.Species_ID, 'weight', formData.Weight_g)
                          ? 'border-amber-400 bg-amber-50/50'
                          : 'border-slate-300 focus:border-emerald-600'
                      }`}
                    />
                    <div className="mt-1 font-mono text-[8px] leading-tight">
                      {!getBioValidationStatus(formData.Species_ID, 'weight', formData.Weight_g) ? (
                        <span className="text-amber-700 font-bold">⚠ Plausible: {SPECIES_BIO_RANGES[formData.Species_ID]?.minWeight}-{SPECIES_BIO_RANGES[formData.Species_ID]?.maxWeight}g</span>
                      ) : (
                        <span className="text-emerald-700">✔ Plausible weight</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-500 font-bold mb-0.5">Head-Body (mm)</label>
                    <input 
                      type="number" 
                      required
                      value={formData.Head_Body_Length_mm} 
                      onChange={e => setFormData(prev => ({ ...prev, Head_Body_Length_mm: Number(e.target.value) }))}
                      className={`w-full bg-slate-50 border rounded px-1.5 py-1 text-slate-800 font-bold ${
                        !getBioValidationStatus(formData.Species_ID, 'hb', formData.Head_Body_Length_mm)
                          ? 'border-amber-400 bg-amber-50/50'
                          : 'border-slate-300 focus:border-emerald-600'
                      }`}
                    />
                    <div className="mt-1 font-mono text-[8px] leading-tight">
                      {!getBioValidationStatus(formData.Species_ID, 'hb', formData.Head_Body_Length_mm) ? (
                        <span className="text-amber-700 font-bold">⚠ Plausible: {SPECIES_BIO_RANGES[formData.Species_ID]?.minHB}-{SPECIES_BIO_RANGES[formData.Species_ID]?.maxHB}mm</span>
                      ) : (
                        <span className="text-emerald-700">✔ Plausible HB</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-500 font-bold mb-0.5">Tail (mm)</label>
                    <input 
                      type="number" 
                      required
                      value={formData.Tail_Length_mm} 
                      onChange={e => setFormData(prev => ({ ...prev, Tail_Length_mm: Number(e.target.value) }))}
                      className={`w-full bg-slate-50 border rounded px-1.5 py-1 text-slate-800 font-bold ${
                        !getBioValidationStatus(formData.Species_ID, 'tail', formData.Tail_Length_mm)
                          ? 'border-amber-400 bg-amber-50/50'
                          : 'border-slate-300 focus:border-emerald-600'
                      }`}
                    />
                    <div className="mt-1 font-mono text-[8px] leading-tight">
                      {!getBioValidationStatus(formData.Species_ID, 'tail', formData.Tail_Length_mm) ? (
                        <span className="text-amber-700 font-bold">⚠ Plausible: {SPECIES_BIO_RANGES[formData.Species_ID]?.minTail}-{SPECIES_BIO_RANGES[formData.Species_ID]?.maxTail}mm</span>
                      ) : (
                        <span className="text-emerald-700">✔ Plausible tail</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Hind Foot (mm)</label>
                    <input 
                      type="number" 
                      step="0.1" 
                      required
                      value={formData.Hind_Foot_mm} 
                      onChange={e => setFormData(prev => ({ ...prev, Hind_Foot_mm: Number(e.target.value) }))}
                      className={`w-full bg-slate-50 border rounded px-2 py-1 text-slate-800 ${
                        !getBioValidationStatus(formData.Species_ID, 'foot', formData.Hind_Foot_mm)
                          ? 'border-amber-400 bg-amber-50/50'
                          : 'border-slate-300 focus:border-emerald-600'
                      }`}
                    />
                    <div className="mt-1 font-mono text-[8px] leading-tight">
                      {!getBioValidationStatus(formData.Species_ID, 'foot', formData.Hind_Foot_mm) ? (
                        <span className="text-amber-700 font-bold">⚠ Plausible: {SPECIES_BIO_RANGES[formData.Species_ID]?.footMin}-{SPECIES_BIO_RANGES[formData.Species_ID]?.footMax}mm</span>
                      ) : (
                        <span className="text-emerald-700">✔ Plausible Foot</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Ear Length (mm)</label>
                    <input 
                      type="number" 
                      step="0.1" 
                      required
                      value={formData.Ear_Length_mm} 
                      onChange={e => setFormData(prev => ({ ...prev, Ear_Length_mm: Number(e.target.value) }))}
                      className={`w-full bg-slate-50 border rounded px-2 py-1 text-slate-800 ${
                        !getBioValidationStatus(formData.Species_ID, 'ear', formData.Ear_Length_mm)
                          ? 'border-amber-400 bg-amber-50/50'
                          : 'border-slate-300 focus:border-emerald-600'
                      }`}
                    />
                    <div className="mt-1 font-mono text-[8px] leading-tight">
                      {!getBioValidationStatus(formData.Species_ID, 'ear', formData.Ear_Length_mm) ? (
                        <span className="text-amber-700 font-bold">⚠ Plausible: {SPECIES_BIO_RANGES[formData.Species_ID]?.earMin}-{SPECIES_BIO_RANGES[formData.Species_ID]?.earMax}mm</span>
                      ) : (
                        <span className="text-emerald-700">✔ Plausible Ear</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION D: Parasitology Surveillance (Ecto & Endo detailed) */}
              <div className="border border-slate-200 bg-white p-3 rounded-xs flex flex-col gap-2">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pb-1 border-b">Section D: Parasitology Detail Entry</span>
                
                {/* Ectoparasite Core Load & Count */}
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div>
                    <label className="block text-slate-500 font-bold mb-1 text-emerald-800">Ectoparasite Load Grade</label>
                    <select 
                      value={formData.Parasite_Load_Ext} 
                      onChange={e => setFormData(prev => ({ ...prev, Parasite_Load_Ext: Number(e.target.value) as any }))}
                      className="w-full bg-emerald-50/50 border border-emerald-300 font-black rounded p-1 text-emerald-950"
                    >
                      <option value="0">0 — Grade 0 (Absence)</option>
                      <option value="1">1 — Grade 1 (Mild)</option>
                      <option value="2">2 — Grade 2 (Moderate)</option>
                      <option value="3">3 — Grade 3 (Heavy)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-500 font-bold mb-1 text-emerald-800 font-bold">Ectoparasites Count</label>
                    <input 
                      type="number" 
                      min="0"
                      required
                      value={formData.Ectoparasite_Count} 
                      onChange={e => setFormData(prev => ({ ...prev, Ectoparasite_Count: Number(e.target.value) }))}
                      className="w-full bg-emerald-50/50 border border-emerald-300 rounded px-2 py-1 text-slate-800"
                    />
                  </div>
                </div>

                {/* Ectoparasite Species and Common name */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-500 font-bold mb-0.5">Ectoparasites Spp</label>
                    <input 
                      type="text" 
                      required
                      list="ecto-spp-list"
                      placeholder="e.g. Xenopsylla cheopis" 
                      value={formData.Ectoparasite_Spp} 
                      onChange={e => setFormData(prev => ({ ...prev, Ectoparasite_Spp: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-slate-800"
                    />
                    <datalist id="ecto-spp-list">
                      <option value="Xenopsylla cheopis">Xenopsylla cheopis (Oriental rat flea)</option>
                      <option value="Laelaps echidnina">Laelaps echidnina (Spiny rat mite)</option>
                      <option value="Rhipicephalus sanguineus">Rhipicephalus sanguineus (Brown dog tick)</option>
                      <option value="Polyplax spinulosa">Polyplax spinulosa (Spiny rat louse)</option>
                      <option value="None">None (Clear of Ectoparasites)</option>
                    </datalist>
                  </div>
                  <div>
                    <label className="block text-slate-500 font-bold mb-0.5">Ectoparasite Common Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Oriental rat flea" 
                      value={formData.Ectoparasite_Common_Name} 
                      onChange={e => setFormData(prev => ({ ...prev, Ectoparasite_Common_Name: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-slate-800"
                    />
                  </div>
                </div>

                {/* Endoparasite Status & Species */}
                <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-2 mt-1">
                  <div>
                    <label className="block text-slate-500 font-bold mb-1 text-blue-800">Endoparasite Status</label>
                    <select 
                      value={formData.Endoparasite_Presence} 
                      onChange={e => setFormData(prev => ({ ...prev, Endoparasite_Presence: e.target.value as any }))}
                      className="w-full bg-blue-50/50 border border-blue-200 rounded p-1 text-blue-950 font-bold"
                    >
                      <option value="Yes">Yes (Presence confirmed)</option>
                      <option value="No">No (Healthy / Negative)</option>
                      <option value="Pending Lab">Pending Lab Results</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-500 font-bold mb-0.5 text-blue-800">Endoparasites Spp</label>
                    <input 
                      type="text" 
                      required
                      list="endo-spp-list"
                      placeholder="e.g. Hymenolepis diminuta" 
                      value={formData.Endoparasite_Spp} 
                      onChange={e => setFormData(prev => ({ ...prev, Endoparasite_Spp: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-slate-800"
                    />
                    <datalist id="endo-spp-list">
                      <option value="Hymenolepis diminuta">Hymenolepis diminuta (Rat tapeworm)</option>
                      <option value="Capillaria hepatica">Capillaria hepatica (Capillaria liver worm)</option>
                      <option value="Moniliformis moniliformis">Moniliformis moniliformis (Thorny-headed worm)</option>
                      <option value="None">None (Negative)</option>
                      <option value="Pending Lab results">Pending Lab results (Awaiting Lab)</option>
                    </datalist>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-0.5 text-blue-850">Endoparasite Common Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Rat tapeworm" 
                    value={formData.Endoparasite_Common_Name} 
                    onChange={e => setFormData(prev => ({ ...prev, Endoparasite_Common_Name: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-slate-800"
                  />
                </div>
              </div>

              {/* SECTION E: Survival track & Extensions */}
              <div className="border border-slate-200 bg-white p-3 rounded-xs flex flex-col gap-2">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pb-1 border-b">Section E: Survival Track Controls</span>
                
                <div className="grid grid-cols-3 gap-1.5 mt-1 border-t border-slate-100 pt-1.5">
                  <div>
                    <label className="block text-slate-400 font-bold mb-0.5">Event Obs. Days (Y)</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="90"
                      required
                      value={formData.Time_to_Event_Days} 
                      onChange={e => setFormData(prev => ({ ...prev, Time_to_Event_Days: Number(e.target.value) }))}
                      className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-0.5">Event Status (Z)</label>
                    <select 
                      value={formData.Event_Status} 
                      onChange={e => setFormData(prev => ({ ...prev, Event_Status: Number(e.target.value) as any }))}
                      className="w-full bg-slate-50 border border-slate-300 rounded p-1 text-slate-800"
                    >
                      <option value="0">0 (Censored/Alive)</option>
                      <option value="1">1 (Died in study)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-0.5">Trap Night (AA)</label>
                    <input 
                      type="number" 
                      min="1"
                      required
                      value={formData.Trap_Night_ID} 
                      onChange={e => setFormData(prev => ({ ...prev, Trap_Night_ID: Number(e.target.value) }))}
                      className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-1 text-[8.5px] mt-1 border-t pt-1.5 bg-slate-50 p-1.5 rounded-xs">
                  <div>
                    <span className="block text-slate-400 font-bold text-[7px]">24H</span>
                    <select value={formData.Survival_24H} onChange={e => setFormData(prev => ({ ...prev, Survival_24H: e.target.value as any }))} className="w-full bg-white border border-slate-300">
                      <option value="Alive">Alive</option>
                      <option value="Dead">Dead</option>
                    </select>
                  </div>
                  <div>
                    <span className="block text-slate-400 font-bold text-[7px]">1WK</span>
                    <select value={formData.Survival_1WK} onChange={e => setFormData(prev => ({ ...prev, Survival_1WK: e.target.value as any }))} className="w-full bg-white border border-slate-300">
                      <option value="Alive">Alive</option>
                      <option value="Dead">Dead</option>
                      <option value="Removed">Rem</option>
                    </select>
                  </div>
                  <div>
                    <span className="block text-slate-400 font-bold text-[7px]">2WK</span>
                    <select value={formData.Survival_2WK} onChange={e => setFormData(prev => ({ ...prev, Survival_2WK: e.target.value as any }))} className="w-full bg-white border border-slate-300">
                      <option value="Alive">Alive</option>
                      <option value="Dead">Dead</option>
                      <option value="Removed">Rem</option>
                    </select>
                  </div>
                  <div>
                    <span className="block text-slate-400 font-bold text-[7px]">1M</span>
                    <select value={formData.Survival_1M} onChange={e => setFormData(prev => ({ ...prev, Survival_1M: e.target.value as any }))} className="w-full bg-white border border-slate-300">
                      <option value="Alive">Alive</option>
                      <option value="Dead">Dead</option>
                      <option value="Removed">Rem</option>
                    </select>
                  </div>
                  <div>
                    <span className="block text-slate-400 font-bold text-[7px]">3M</span>
                    <select value={formData.Survival_3M} onChange={e => setFormData(prev => ({ ...prev, Survival_3M: e.target.value as any }))} className="w-full bg-white border border-slate-300">
                      <option value="Alive">Alive</option>
                      <option value="Dead">Dead</option>
                      <option value="Removed">Rem</option>
                    </select>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-900 hover:bg-emerald-800 text-white border-b-2 border-emerald-950 hover:border-emerald-900 shadow-sm transition px-3 py-2 rounded-xs font-bold text-center uppercase tracking-wider cursor-pointer mt-1"
              >
                📥 Register Specimen into Master Database
              </button>
            </form>
          </div>

          {/* Ectoparasite Score Index Guidelines Box */}
          <div className="bg-slate-900 border border-slate-800 text-[10px] font-mono rounded p-3 text-slate-300 flex flex-col gap-1.5 leading-normal">
            <span className="text-teal-400 font-bold uppercase tracking-wider text-[9px] border-b border-slate-800 pb-1 flex items-center gap-1">
              <Activity className="w-3 h-3" />
              Ectoparasite Grade Index Reference Matrix [Column Q]
            </span>
            <p><strong className="text-white">Grade 0 [Absence]:</strong> Epidermal clean. No moving arthropods, ticks, or feces during 2-minute examination sweep.</p>
            <p><strong className="text-white">Grade 1 [Mild]:</strong> 1 to 5 individual ectoparasites. Infestation restricted to single zone (e.g. inner ear margins). No alopecia.</p>
            <p><strong className="text-white">Grade 2 [Moderate]:</strong> 6 to 20 ectoparasites. Multiple groups present simultaneously. Minor coat matting.</p>
            <p><strong className="text-white">Grade 3 [Heavy]:</strong> &gt;20 ectoparasites or layered clusters of ticks. Severe alopecia, skin scabs, or systemic anemia.</p>
          </div>
        </div>

        {/* RIGHT COLUMN: HIGH FIDELITY ANALYSIS PANELS & CHARTS */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* 1. SURVIVAL KAPLAN-MEIER & LOG-RANK SUITE */}
          <div className="border border-slate-200 bg-white p-4 rounded-sm shadow-xs flex flex-col gap-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-2 gap-2">
              <span className="text-xs font-mono font-bold text-slate-900 uppercase flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-800" />
                Kaplan-Meier Non-Parametric Survival Analysis Evaluator
              </span>
              
              <div className="flex items-center gap-2 font-mono text-[9px]">
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 bg-blue-600 inline-block rounded-xs" />
                  <select 
                    value={kmGroupA} 
                    onChange={e => setKmGroupA(e.target.value)}
                    className="bg-slate-50 border p-0.5 font-bold"
                  >
                    <option value="Mastomys natalensis">Mastomys natalensis</option>
                    <option value="Rattus rattus">Rattus rattus</option>
                    <option value="Arvicanthis niloticus">Arvicanthis niloticus</option>
                    <option value="Mus musculus">Mus musculus</option>
                  </select>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 bg-rose-600 inline-block rounded-xs" />
                  <select 
                    value={kmGroupB} 
                    onChange={e => setKmGroupB(e.target.value)}
                    className="bg-slate-50 border p-0.5 font-bold"
                  >
                    <option value="Mastomys natalensis">Mastomys natalensis</option>
                    <option value="Rattus rattus">Rattus rattus</option>
                    <option value="Arvicanthis niloticus">Arvicanthis niloticus</option>
                    <option value="Mus musculus">Mus musculus</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Kaplan-Meier Plotting SVG */}
            <div className="bg-slate-950 border border-slate-900 rounded p-2 flex flex-col items-center">
              <div className="h-[140px] w-full relative">
                
                {/* Y-axis labels */}
                <div className="absolute left-1 top-1 text-[8px] font-mono text-slate-500">100% Probability</div>
                <div className="absolute left-1 top-1/2 text-[8px] font-mono text-slate-500">50% Prob</div>
                <div className="absolute left-1 bottom-1 text-[8px] font-mono text-slate-500">0%</div>

                <svg viewBox="0 0 400 120" preserveAspectRatio="none" className="w-full h-[120px] overflow-visible">
                  {/* Grid Lines */}
                  <line x1="0" y1="2" x2="400" y2="2" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3,3" />
                  <line x1="0" y1="60" x2="400" y2="60" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3,3" />
                  <line x1="0" y1="120" x2="400" y2="120" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3,3" />
                  <line x1="100" y1="0" x2="100" y2="120" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3,3" />
                  <line x1="200" y1="0" x2="200" y2="120" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3,3" />
                  <line x1="300" y1="0" x2="300" y2="120" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3,3" />

                  {/* Curve A (Blue Step line) */}
                  {(() => {
                    if (kmCurveA.length === 0) return null;
                    const pathParts: string[] = [];
                    pathParts.push(`M 0,0`);
                    kmCurveA.forEach((pt, idx) => {
                      const x = (pt.time / 90) * 400;
                      const y = (1 - pt.survival) * 120;
                      if (idx > 0) {
                        const prevX = (kmCurveA[idx - 1].time / 90) * 400;
                        pathParts.push(`L ${x},${(1 - kmCurveA[idx - 1].survival) * 120}`);
                      }
                      pathParts.push(`L ${x},${y}`);
                    });
                    return (
                      <path 
                        d={pathParts.join(' ')} 
                        fill="none" 
                        stroke="#2563eb" 
                        strokeWidth="2" 
                        strokeLinecap="square"
                      />
                    );
                  })()}

                  {/* Curve B (Rose Step line) */}
                  {(() => {
                    if (kmCurveB.length === 0) return null;
                    const pathParts: string[] = [];
                    pathParts.push(`M 0,0`);
                    kmCurveB.forEach((pt, idx) => {
                      const x = (pt.time / 90) * 400;
                      const y = (1 - pt.survival) * 120;
                      if (idx > 0) {
                        const prevX = (kmCurveB[idx - 1].time / 90) * 400;
                        pathParts.push(`L ${x},${(1 - kmCurveB[idx - 1].survival) * 120}`);
                      }
                      pathParts.push(`L ${x},${y}`);
                    });
                    return (
                      <path 
                        d={pathParts.join(' ')} 
                        fill="none" 
                        stroke="#e11d48" 
                        strokeWidth="2" 
                        strokeLinecap="square"
                      />
                    );
                  })()}
                </svg>
              </div>

              {/* Time reference timeline axis labels */}
              <div className="w-full flex justify-between text-[8px] font-mono text-slate-500 border-t border-slate-900 pt-1 px-1 mt-1">
                <span>Day 0</span>
                <span>Day 30 (1M)</span>
                <span>Day 60 (2M)</span>
                <span>Day 90 (3M Timeline Limit)</span>
              </div>
            </div>

            {/* Log-Rank statistical analysis readout */}
            <div className="bg-slate-50 border border-slate-200 rounded p-3 font-mono text-[10px] text-slate-700">
              <div className="font-bold border-b pb-1 mb-1.5 uppercase tracking-wider text-[9px] text-slate-800 flex items-center justify-between">
                <span>Log-Rank Test Results & Hypothesis Screening</span>
                <span className="text-[8.5px] text-indigo-700 bg-indigo-50 px-1.5 rounded">H₀: Curve A = Curve B</span>
              </div>
              
              {logRankResult.hasData ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center">
                  <div className="bg-white border p-1 rounded">
                    <span className="block text-slate-400 text-[8px] uppercase">Chi-Square (χ²)</span>
                    <strong className="text-slate-900 text-xs">{logRankResult.chiSquare!.toFixed(3)}</strong>
                  </div>
                  <div className="bg-white border p-1 rounded">
                    <span className="block text-slate-400 text-[8px] uppercase">Deg. Freedom (df)</span>
                    <strong className="text-slate-900 text-xs">1</strong>
                  </div>
                  <div className="bg-white border p-1 rounded">
                    <span className="block text-slate-400 text-[8px] uppercase">Log-Rank p-value</span>
                    <strong className={`text-xs block ${logRankResult.pVal! < 0.05 ? 'text-emerald-700 font-extrabold' : 'text-slate-950 font-bold'}`}>
                      {logRankResult.pVal!.toFixed(5)}
                    </strong>
                  </div>
                  <div className="bg-white border p-1 rounded flex flex-col justify-center">
                    <span className="block text-slate-400 text-[8px] uppercase">Assessment</span>
                    <strong className={`text-[8.5px] uppercase tracking-tighter ${logRankResult.pVal! < 0.05 ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}`}>
                      {logRankResult.pVal! < 0.05 ? 'Significant (p<0.05)' : 'Reject Significance'}
                    </strong>
                  </div>
                </div>
              ) : (
                <div className="text-center py-1 text-slate-400 font-bold uppercase text-[9px]">
                  {logRankResult.message}
                </div>
              )}
            </div>
          </div>

          {/* 2. POPULATION DYNAMICS AND CPUE SYSTEM RATIOS */}
          <div className="border border-slate-200 bg-white p-4 rounded-sm shadow-xs flex flex-col gap-3">
            <span className="text-xs font-mono font-bold text-slate-900 uppercase flex items-center gap-1.5 border-b pb-2">
              <TRENDINGUP_ICON_CLEAN className="w-4 h-4 text-emerald-800" />
              Catch Per Unit Effort (CPUE) & Population Expansion (λ)
            </span>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              
              {/* Active Trap Nights adjustment bar toggle */}
              <div className="md:col-span-4 bg-slate-50 border p-3 rounded flex flex-col gap-2 font-mono text-[10.5px]">
                <div className="flex justify-between font-bold">
                  <span>Trap Nights Standard</span>
                  <span className="text-emerald-800 font-extrabold">{activeTrapNights} Nights</span>
                </div>
                <input 
                  type="range"
                  min="2"
                  max="30"
                  step="1"
                  value={activeTrapNights}
                  onChange={e => setActiveTrapNights(Number(e.target.value))}
                  className="w-full accent-emerald-800 cursor-pointer"
                />
                <p className="text-[8.5px] text-slate-400 leading-normal uppercase">
                  Standardizes the relative pest abundance captures normalized against subterranean EMA archive network collection chambers.
                </p>
              </div>

              {/* Nights breakdown table */}
              <div className="md:col-span-8 flex flex-col gap-1">
                <div className="grid grid-cols-4 text-[8px] uppercase tracking-wider text-slate-400 font-black border-b pb-1 font-mono text-center">
                  <span>Monitoring Period</span>
                  <span> specimen tally</span>
                  <span>CPUE Ratio</span>
                  <span>Growth Index (λ)</span>
                </div>

                <div className="max-h-[85px] overflow-y-auto flex flex-col gap-1.5 font-mono text-[10px]">
                  {cpueData.map((cp, idx) => (
                    <div key={cp.trapNightId} className="grid grid-cols-4 p-1 rounded text-center border-b hover:bg-slate-50 transition items-center">
                      <span className="text-slate-900 font-bold">Trap Period {cp.trapNightId}</span>
                      <span className="text-slate-650">{cp.count} Rodents</span>
                      <span className="text-slate-800 font-black">{(cp.cpue).toFixed(3)}</span>
                      <span className={`text-[9.5px] font-black ${
                        idx === 0 ? 'text-slate-500' :
                        cp.lambda > 1 ? 'text-rose-600' :
                        cp.lambda === 1 ? 'text-slate-800' : 'text-emerald-600'
                      }`}>
                        {idx === 0 ? '— Baseline' : `${(cp.lambda).toFixed(2)} [${cp.lambda > 1 ? '▲ Influx' : cp.lambda < 1 ? '▼ Decreasing' : '● Stable'}]`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* 3. BIODIVERSITY & TAXONOMIC DISTRIBUTION */}
          <div className="border border-slate-200 bg-white p-4 rounded-sm shadow-xs flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-2 gap-3">
              <span className="text-xs font-mono font-bold text-slate-900 uppercase flex items-center gap-1.5 animate-fade-in">
                <PieChart className="w-4 h-4 text-emerald-800 animate-spin-slow" style={{ animationDuration: '8s' }} />
                Taxonomic Species Distribution & Biodiversity Indexing
              </span>
              
              {/* Dataset selection controls */}
              <div className="flex bg-slate-100 p-0.5 rounded border border-slate-200 self-start sm:self-center font-mono text-[9px] font-bold uppercase shadow-inner">
                <button
                  type="button"
                  onClick={() => setChartDatasetSource('filtered')}
                  className={`px-2 py-1 rounded-xs transition-all cursor-pointer ${chartDatasetSource === 'filtered' ? 'bg-white text-emerald-950 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Filtered AppSet ({filteredSpecimens.length})
                </button>
                <button
                  type="button"
                  onClick={() => setChartDatasetSource('all')}
                  className={`px-2 py-1 rounded-xs transition-all cursor-pointer ${chartDatasetSource === 'all' ? 'bg-white text-emerald-950 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Full Registry Set ({specimens.length})
                </button>
              </div>
            </div>

            {/* Main Interactive Aspect */}
            {(() => {
              if (speciesDistributionData.total === 0) {
                return (
                  <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400 bg-slate-50 border rounded-xs italic text-[11px] font-mono leading-relaxed">
                    <AlertTriangle className="w-5 h-5 text-amber-500 mb-1.5" />
                    No active specimens match the filtering guidelines.<br />
                    Reset standard query parameters to construct the taxonomic pie distribution.
                  </div>
                );
              }

              let accumAngle = 0;
              return (
                <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                  
                  {/* Left Column: SVG Circle Donut Pie with central telemetry readouts */}
                  <div className="flex flex-col items-center justify-center flex-shrink-0 bg-slate-50/40 border border-slate-100 p-3 rounded-sm relative shadow-xs">
                    <div className="relative w-[180px] h-[180px]">
                      <svg viewBox="0 0 200 200" className="w-[180px] h-[180px] transform -rotate-90 select-none">
                        {speciesDistributionData.items.map((item) => {
                          if (item.count === 0) return null;

                          const isHovered = hoveredSpeciesId === item.id;
                          const strokeWidth = isHovered ? 26 : 18;
                          const radius = 65;

                          // If there's only one species representing 100% of the sample set
                          if (item.pct > 99.9) {
                            return (
                              <circle
                                key={item.id}
                                cx="100"
                                cy="100"
                                r={radius}
                                fill="none"
                                stroke={item.color}
                                strokeWidth={strokeWidth}
                                onMouseEnter={() => setHoveredSpeciesId(item.id)}
                                onMouseLeave={() => setHoveredSpeciesId(null)}
                                className="transition-all duration-300 cursor-pointer"
                              />
                            );
                          }

                          const startAngle = accumAngle;
                          const angleExtent = (item.pct / 100) * 360;
                          const endAngle = accumAngle + angleExtent;
                          accumAngle = endAngle;

                          // Convert polar limits
                          const polarToCartesianObj = (cx: number, cy: number, r: number, angleDeg: number) => {
                            const radians = ((angleDeg - 90) * Math.PI) / 180.0;
                            return {
                              x: cx + r * Math.cos(radians),
                              y: cy + r * Math.sin(radians)
                            };
                          };

                          const start = polarToCartesianObj(100, 100, radius, startAngle);
                          const end = polarToCartesianObj(100, 100, radius, endAngle);
                          const largeArcFlag = angleExtent <= 180 ? "0" : "1";
                          const pathData = `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;

                          return (
                            <path
                              key={item.id}
                              d={pathData}
                              fill="none"
                              stroke={item.color}
                              strokeWidth={strokeWidth}
                              onMouseEnter={() => setHoveredSpeciesId(item.id)}
                              onMouseLeave={() => setHoveredSpeciesId(null)}
                              className="transition-all duration-200 cursor-pointer stroke-linecap-round"
                              style={{
                                filter: isHovered ? 'drop-shadow(0px 0px 3px rgba(0,0,0,0.2))' : 'none',
                                opacity: hoveredSpeciesId && !isHovered ? 0.65 : 1
                              }}
                            />
                          );
                        })}
                      </svg>

                      {/* Central responsive display panel */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                        {hoveredSpeciesId ? (() => {
                          const hoverMatch = speciesDistributionData.items.find(it => it.id === hoveredSpeciesId);
                          return hoverMatch ? (
                            <div className="p-1 max-w-[125px] animate-fade-in">
                              <div className="text-[15px] font-black leading-none" style={{ color: hoverMatch.color }}>
                                {hoverMatch.pct.toFixed(1)}%
                              </div>
                              <div className="text-[8px] text-slate-500 font-extrabold truncate max-w-[110px] uppercase font-mono mt-1">
                                {hoverMatch.name.split(' ')[1] || hoverMatch.name}
                              </div>
                              <div className="text-[9px] text-slate-800 font-bold font-mono mt-0.5">
                                {hoverMatch.count} specimens
                              </div>
                            </div>
                          ) : null;
                        })() : (
                          <div className="p-1">
                            <div className="text-[15px] font-black text-slate-800 leading-none">
                              {speciesDistributionData.total}
                            </div>
                            <div className="text-[7.5px] text-slate-400 font-extrabold font-mono uppercase tracking-wider mt-1">
                              Rodents
                            </div>
                            <div className="text-[6.5px] text-emerald-805 font-bold font-mono mt-1 uppercase tracking-tight">
                              {chartDatasetSource === 'filtered' ? 'Active Filtered' : 'Whole Deck'}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <span className="text-[7px] text-slate-450 font-mono tracking-widest mt-1.5 uppercase">
                      Hover segments for micro-statistics
                    </span>
                  </div>

                  {/* Right Column: Species Legends, Metrics & Biodiversity Quality Indices */}
                  <div className="flex-1 w-full flex flex-col gap-3 font-mono">
                    <div className="flex flex-col gap-1.5">
                      {speciesDistributionData.items.map((item) => {
                        const isHovered = hoveredSpeciesId === item.id;
                        return (
                          <div
                            key={item.id}
                            onMouseEnter={() => setHoveredSpeciesId(item.id)}
                            onMouseLeave={() => setHoveredSpeciesId(null)}
                            className={`p-2 border rounded-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10.5px] ${
                              isHovered ? 'bg-slate-50 border-slate-350 shadow-xs translate-x-1' : 'bg-white border-slate-205'
                            }`}
                          >
                            <div className="flex items-start gap-2.5 max-w-[70%]">
                              <span 
                                className="w-2.5 h-2.5 mt-0.5 inline-block rounded-xs flex-shrink-0" 
                                style={{ backgroundColor: item.color }} 
                              />
                              <div className="flex flex-col">
                                <span className="font-bold text-slate-900 leading-tight">
                                  {item.name}
                                </span>
                                <span className="text-[8.5px] text-slate-450 italic leading-snug">
                                  {item.common}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 self-end sm:self-center font-bold text-[9.5px]">
                              <div className="text-right">
                                <div className="text-slate-850 font-black">{item.count} Cap</div>
                                <div className="text-[8.5px] text-slate-455 font-medium">{item.pct.toFixed(1)}%</div>
                              </div>
                              <span className="text-slate-250">|</span>
                              <div className="text-right">
                                <div className="text-emerald-950 font-extrabold">{item.avgWeight.toFixed(1)}g</div>
                                <div className="text-[8px] text-slate-450 font-medium whitespace-nowrap">Avg Wt</div>
                              </div>
                              <span className="text-slate-250">|</span>
                              <div className="text-right">
                                <div className="text-rose-700 font-extrabold">G-{item.avgEctoLoad.toFixed(1)}</div>
                                <div className="text-[8px] text-slate-455 font-medium whitespace-nowrap">Avg Ecto</div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Integrated Biodiversity Shannon Entropy & Simpson Index Panel */}
                    <div className="bg-slate-50/70 border border-slate-255 rounded p-2.5 flex flex-col gap-2 mt-1">
                      <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                          <Activity className="w-3 h-3 text-emerald-800" />
                          System Diversity Indicators
                        </span>
                        <span className="text-[8.5px] font-extrabold text-blue-900 bg-blue-50 border border-blue-200 rounded px-1.5 uppercase tracking-wide">
                          {biodiversityIndices.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-center text-[10px]">
                        <div className="bg-white border rounded p-1.5">
                          <div className="text-slate-400 text-[7px] uppercase font-bold">Shannon Index (H')</div>
                          <div className="text-slate-800 text-[11.5px] font-black mt-0.5">{biodiversityIndices.shannon.toFixed(4)}</div>
                        </div>
                        <div className="bg-white border rounded p-1.5">
                          <div className="text-slate-400 text-[7px] uppercase font-bold">Simpson Diversity (1 - D)</div>
                          <div className="text-slate-800 text-[11.5px] font-black mt-0.5">{biodiversityIndices.simpson.toFixed(4)}</div>
                        </div>
                      </div>
                      
                      <p className="text-[7.5px] text-slate-400 mt-0.5 leading-normal uppercase">
                        High Shannon values indicate multi-species dispersion. Suppressed values signify localized rodent monoculture infestation risks.
                      </p>
                    </div>

                  </div>

                </div>
              );
            })()}
          </div>

          {/* 4. GEOSPATIAL CLUSTERING: DBSCAN VISUALIZER & HOTSPOT CORRELATIONS */}
          <div className="border border-slate-200 bg-white p-4 rounded-sm shadow-xs flex flex-col gap-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-2 gap-2">
              <span className="text-xs font-mono font-bold text-slate-900 uppercase flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-emerald-800" />
                Geospatial Hotspots Correlation & DBSCAN Spatial Projector
              </span>
              <div className="flex items-center gap-2 font-mono text-[9px] text-slate-500">
                <span>Eps: {dbscanEps}m</span>
                <input 
                  type="range" 
                  min="5" 
                  max="100" 
                  step="5" 
                  value={dbscanEps} 
                  onChange={e => setDbscanEps(Number(e.target.value))} 
                  className="w-16 accent-emerald-800 cursor-pointer"
                />
                <span>MinPts: {dbscanMinPts}</span>
                <select 
                  value={dbscanMinPts} 
                  onChange={e => setDbscanMinPts(Number(e.target.value))} 
                  className="bg-slate-50 border px-1"
                >
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              
              {/* Projected Plot Mapping Scatter view */}
              <div className="md:col-span-5 bg-slate-900 border border-slate-800 rounded p-2 flex flex-col items-center">
                <span className="text-[8px] font-mono text-slate-450 uppercase tracking-widest pb-1 self-start">Grid Projected Scatter Layout</span>
                <div className="h-[120px] w-full bg-slate-950 border border-slate-910/60 rounded relative flex items-center justify-center p-1 overflow-hidden">
                  
                  {/* Grid background reference */}
                  <div className="absolute inset-x-0 top-1/4 border-b border-white/5 border-dashed w-full pointer-events-none" />
                  <div className="absolute inset-x-0 top-2/4 border-b border-white/5 border-dashed w-full pointer-events-none" />
                  <div className="absolute inset-x-0 top-3/4 border-b border-white/5 border-dashed w-full pointer-events-none" />
                  <div className="absolute inset-y-0 left-1/4 border-l border-white/5 border-dashed h-full pointer-events-none" />
                  <div className="absolute inset-y-0 left-2/4 border-l border-white/5 border-dashed h-full pointer-events-none" />
                  <div className="absolute inset-y-0 left-3/4 border-l border-white/5 border-dashed h-full pointer-events-none" />

                  {/* Scatter dots */}
                  {(() => {
                    const lats = specimens.map(s => s.GPS_Latitude);
                    const lons = specimens.map(s => s.GPS_Longitude);

                    const minLat = Math.min(...lats, -6.828);
                    const maxLat = Math.max(...lats, -6.821);
                    const minLon = Math.min(...lons, 37.660);
                    const maxLon = Math.max(...lons, 37.669);

                    const latRange = maxLat - minLat || 0.01;
                    const lonRange = maxLon - minLon || 0.01;

                    return specimensWithRiskDistance.map(s => {
                      const x = ((s.GPS_Longitude - minLon) / lonRange) * 100;
                      // invert y so North is top
                      const y = 100 - ((s.GPS_Latitude - minLat) / latRange) * 100;

                      let color = '#94a3b8'; // Noise (slate)
                      if (s.cluster === 'Cluster_01') color = '#2563eb'; // blue
                      if (s.cluster === 'Cluster_02') color = '#e11d48'; // rose
                      if (s.cluster === 'Cluster_03') color = '#10b981'; // emerald
                      if (s.cluster === 'Cluster_04') color = '#8b5cf6'; // violet

                      return (
                        <div 
                          key={s.Record_ID}
                          className="absolute w-2.5 h-2.5 rounded-full border border-white/30 cursor-help group transition-transform hover:scale-135"
                          style={{ left: `${Math.min(92, Math.max(8, x))}%`, top: `${Math.min(90, Math.max(10, y))}%`, backgroundColor: color }}
                          title={`${s.Record_ID} (${s.Species_ID}) Cluster: ${s.cluster}`}
                        />
                      );
                    });
                  })()}

                  {/* Risk source coordinates indicator */}
                  <div 
                    className="absolute w-3.5 h-3.5 bg-yellow-500 border-2 border-slate-900 transform rotate-45 flex items-center justify-center font-bold text-[7px] text-slate-800"
                    style={{ left: '44%', top: '48%' }}
                    title={`Risk Hazard Source: ${riskName}`}
                  >
                    R
                  </div>
                </div>
                <div className="w-full flex justify-between text-[7px] font-mono text-slate-500 mt-1 uppercase">
                  <span>WGS84 Boundaries</span>
                  <span className="text-yellow-500">◆ Risk Anchor Center</span>
                </div>
              </div>

              {/* Statistical Correlation test results for Ectoparasites */}
              <div className="md:col-span-7 flex flex-col gap-2 font-mono text-[10px]">
                
                {/* 1. Kruskal Wallis group variance */}
                <div className="bg-slate-50 border p-2.5 rounded flex flex-col gap-1.5">
                  <div className="font-bold border-b pb-0.5 text-slate-900 text-[9.5px] uppercase">
                    Kruskal-Wallis Variance Test [DBSCAN clusters]
                  </div>
                  {kruskalWallisResult.hasData ? (
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between">
                        <span className="text-slate-450">H statistic (K-W sum):</span>
                        <strong className="text-slate-800">{kruskalWallisResult.H!.toFixed(4)}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-450">Degrees of freedom (k-1):</span>
                        <strong className="text-slate-800">{kruskalWallisResult.df!}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-450">Empirical Probability p-val:</span>
                        <strong className={`font-black ${kruskalWallisResult.isSignificant ? 'text-emerald-700' : 'text-slate-800'}`}>
                          {kruskalWallisResult.pVal!.toFixed(5)} ({kruskalWallisResult.isSignificant ? 'Significant' : 'Non-Sig'})
                        </strong>
                      </div>
                      <p className="text-[7.5px] text-slate-550 leading-tight border-t pt-1 uppercase">
                        {kruskalWallisResult.isSignificant 
                          ? '✅ Confirm spatial focal hot spots do present statistically variant external parasite scores.'
                          : '✕ Reject spatial grouping variance. Parasites seem uniformly loaded across regional catch plots.'
                        }
                      </p>
                    </div>
                  ) : (
                    <div className="text-slate-450 italic py-1 text-center text-[9px] uppercase">
                      {kruskalWallisResult.message}
                    </div>
                  )}
                </div>

                {/* 2. Goodman Kruskal Gamma Spatial risk index correlation */}
                <div className="bg-emerald-50 border border-emerald-250 p-2.5 rounded flex flex-col gap-1 text-[10.5px]">
                  <div className="font-bold border-b border-emerald-200 text-emerald-950 uppercase text-[9.5px]">
                    Risk Proximity Spatial Rankings Suite
                  </div>
                  {correlationResult.hasData ? (
                    <div className="flex flex-col gap-1 text-emerald-900 text-[10px]">
                      <div className="flex justify-between">
                        <span>Goodman & Kruskal Gamma (γ):</span>
                        <strong className="text-emerald-950 font-black">{(correlationResult.gamma!).toFixed(4)}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Spearman Rank Correlation (ρ):</span>
                        <strong className="text-emerald-950 font-medium">{(correlationResult.spearmanRho!).toFixed(4)}</strong>
                      </div>
                      <p className="text-[7.5px] leading-tight border-t border-emerald-200 pt-1 uppercase text-slate-500">
                        <strong>Correlation Analysis:</strong> {correlationResult.message}
                      </p>
                    </div>
                  ) : (
                    <div className="text-emerald-700 italic text-[9.5px] uppercase">
                      {correlationResult.message}
                    </div>
                  )}
                </div>

              </div>

            </div>
          </div>
        </div>
      </div>

          {/* BOTTOM ROW: PRIMARY SPREADSHEET DATABASE TABLE GRID view */}
      <div className="border border-slate-200 rounded p-4 bg-slate-50 flex flex-col gap-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-2 gap-3">
          <span className="text-xs font-mono font-bold text-slate-900 uppercase flex items-center gap-1.5">
            <Database className="w-4 h-4 text-emerald-800" />
            ERICON Ecological Master Database Grid Space [{filteredSpecimens.length} Row Entries]
          </span>

          {/* Table queries filters */}
          <div className="flex items-center gap-2 flex-wrap font-mono text-[9px]">
            <div>
              <span className="text-slate-400 font-bold uppercase mr-1">Species Filter:</span>
              <select value={filterSpecies} onChange={e => setFilterSpecies(e.target.value)} className="bg-white border px-1">
                <option value="ALL">ALL SPECIES</option>
                <option value="Mastomys natalensis">Mastomys natalensis</option>
                <option value="Rattus rattus">Rattus rattus</option>
                <option value="Arvicanthis niloticus">Arvicanthis niloticus</option>
                <option value="Mus musculus">Mus musculus</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <span className="text-slate-400 font-bold uppercase mr-1">Location Filter:</span>
              <select value={filterLocation} onChange={e => setFilterLocation(e.target.value)} className="bg-white border px-1">
                <option value="ALL">ALL LOCATIONS</option>
                <option value="Morogoro_Block_C">Morogoro_Block_C</option>
                <option value="Morogoro_Block_A">Morogoro_Block_A</option>
              </select>
            </div>
            <input 
              type="text" 
              placeholder="🔍 Search Record ID/Location..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-white border rounded px-1.5 py-0.5 text-slate-800 w-44"
            />
          </div>
        </div>

        {/* Quick action actions for adding unlimited row-by-row rodential specimens and bulk population */}
        <div className="flex flex-wrap items-center gap-1.5 bg-white p-2.5 border rounded-xs shadow-xs text-[10px] font-mono justify-between">
          <div className="flex items-center gap-2">
            <button 
              type="button" 
              onClick={handleAddBlankRowExcelStyle} 
              className="bg-emerald-900 hover:bg-emerald-800 text-white font-extrabold px-3 py-1.5 rounded transition flex items-center gap-1 cursor-pointer shadow-sm border-b border-emerald-950"
            >
              <Plus className="w-3.5 h-3.5 animate-pulse" /> ➕ Add Row (Insert Inline Row-by-Row)
            </button>
            <button 
              type="button" 
              onClick={handleBulkInsertSpecimens}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-extrabold px-3 py-1.5 rounded transition flex items-center gap-1 cursor-pointer"
            >
              🎲 Bulk Populating Sample Rodents (+10 Rows)
            </button>
          </div>
          <div className="text-[9.5px] text-slate-650 font-bold uppercase">
            ⚡ Click <strong className="text-emerald-805">✏️ EDIT INLINE</strong> or duplicate records in real-time below!
          </div>
        </div>

        {/* Real Master SpreadSheet Scroll table */}
        <div className="hidden md:block overflow-x-auto border border-slate-200 bg-white rounded shadow-2xs" style={{ zoom: `${tableZoom}%` }}>
          <table className="w-full text-left border-collapse text-[10px] font-mono whitespace-nowrap">
            <thead>
              <tr className="bg-slate-100 uppercase text-slate-450 font-bold border-b border-slate-200">
                <th className="p-2 border-r">Record ID</th>
                <th className="p-2 border-r">Date</th>
                <th className="p-2 border-r">Time</th>
                <th className="p-2 border-r">Location</th>
                <th className="p-2 border-r text-center">GPS Coordinates</th>
                <th className="p-2 border-r">Cluster ID</th>
                <th className="p-2 border-r text-teal-800">Species ID</th>
                <th className="p-2 border-r">Sex</th>
                <th className="p-2 border-r">Maturity</th>
                <th className="p-2 border-r">Weight (g)</th>
                <th className="p-2 border-r">Head-Body (mm)</th>
                <th className="p-2 border-r">Tail (mm)</th>
                <th className="p-2 border-r text-emerald-800">Ecto Load</th>
                <th className="p-2 border-r text-emerald-800">Ecto Count</th>
                <th className="p-2 border-r text-emerald-800">Ecto Spp / Common Name</th>
                <th className="p-2 border-r text-blue-800">Endo Presence</th>
                <th className="p-2 border-r text-blue-800">Endo Spp / Common Name</th>
                <th className="p-2 border-r">24H</th>
                <th className="p-2 border-r font-bold text-slate-800">Days (Y)</th>
                <th className="p-2 border-r font-bold text-slate-800">Event (Z)</th>
                <th className="p-2 border-r font-bold text-slate-800">Period (AA)</th>
                <th className="p-2 text-center">Action Controls</th>
              </tr>
            </thead>
            <tbody>
              {filteredSpecimens.map(s => {
                const sCluster = clusterAssignments[s.Record_ID] || 'Noise';
                const isEditing = editingRowId === s.Record_ID;

                if (isEditing) {
                  return (
                    <tr key={s.Record_ID} className="bg-amber-50/70 border-b border-amber-200 transition text-[9px]">
                      <td className="p-1 border-r font-bold text-emerald-900 bg-amber-100/50">{s.Record_ID}</td>
                      <td className="p-1 border-r">
                        <input 
                          type="text" 
                          value={editingRowData?.Date_Captured || ''}
                          onChange={e => setEditingRowData(prev => prev ? ({ ...prev, Date_Captured: e.target.value }) : null)}
                          className="bg-white border border-slate-300 rounded px-1 py-0.5 text-slate-800 font-mono w-[80px]"
                        />
                      </td>
                      <td className="p-1 border-r">
                        <input 
                          type="text" 
                          value={editingRowData?.Time_Checked || ''}
                          onChange={e => setEditingRowData(prev => prev ? ({ ...prev, Time_Checked: e.target.value }) : null)}
                          className="bg-white border border-slate-300 rounded px-1 py-0.5 text-slate-800 font-mono w-[55px]"
                        />
                      </td>
                      <td className="p-1 border-r">
                        <input 
                          type="text" 
                          value={editingRowData?.Location_Name || ''}
                          onChange={e => setEditingRowData(prev => prev ? ({ ...prev, Location_Name: e.target.value }) : null)}
                          className="bg-white border border-slate-300 rounded px-1 py-0.5 text-slate-800 font-mono w-[110px]"
                        />
                      </td>
                      <td className="p-1 border-r flex items-center gap-1">
                        <input 
                          type="number" 
                          step="0.000001" 
                          value={editingRowData?.GPS_Latitude || 0}
                          onChange={e => setEditingRowData(prev => prev ? ({ ...prev, GPS_Latitude: Number(e.target.value) }) : null)}
                          className="bg-white border border-slate-300 rounded px-1 py-0.5 text-slate-800 font-mono w-[85px]"
                          placeholder="Lat"
                        />
                        <input 
                          type="number" 
                          step="0.000001" 
                          value={editingRowData?.GPS_Longitude || 0}
                          onChange={e => setEditingRowData(prev => prev ? ({ ...prev, GPS_Longitude: Number(e.target.value) }) : null)}
                          className="bg-white border border-slate-300 rounded px-1 py-0.5 text-slate-800 font-mono w-[85px]"
                          placeholder="Lon"
                        />
                      </td>
                      <td className="p-1 border-r font-bold text-slate-400 italic">Auto</td>
                      <td className="p-1 border-r text-teal-850">
                        <select 
                          value={editingRowData?.Species_ID || ''}
                          onChange={e => setEditingRowData(prev => prev ? ({ ...prev, Species_ID: e.target.value as any }) : null)}
                          className="bg-white border border-slate-300 rounded p-0.5 text-slate-800 font-sans"
                        >
                          <option value="Mastomys natalensis">Mastomys natalensis</option>
                          <option value="Rattus rattus">Rattus rattus</option>
                          <option value="Mus musculus">Mus musculus</option>
                          <option value="Arvicanthis niloticus">Arvicanthis niloticus</option>
                        </select>
                      </td>
                      <td className="p-1 border-r">
                        <select 
                          value={editingRowData?.Sex || 'Undetermined'}
                          onChange={e => setEditingRowData(prev => prev ? ({ ...prev, Sex: e.target.value as any }) : null)}
                          className="bg-white border border-slate-300 rounded p-0.5 text-slate-800"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Undetermined">Undetermined</option>
                        </select>
                      </td>
                      <td className="p-1 border-r">
                        <select 
                          value={editingRowData?.Maturity_Stage || 'Adult'}
                          onChange={e => setEditingRowData(prev => prev ? ({ ...prev, Maturity_Stage: e.target.value as any }) : null)}
                          className="bg-white border border-slate-300 rounded p-0.5 text-slate-800"
                        >
                          <option value="Juvenile">Juvenile</option>
                          <option value="Sub-Adult">Sub-Adult</option>
                          <option value="Adult">Adult</option>
                        </select>
                      </td>
                      <td className="p-1 border-r">
                        <input 
                          type="number" 
                          step="0.1" 
                          value={editingRowData?.Weight_g || 0}
                          onChange={e => setEditingRowData(prev => prev ? ({ ...prev, Weight_g: Number(e.target.value) }) : null)}
                          className="bg-white border border-slate-300 rounded px-1 py-0.5 text-slate-800 font-mono w-[55px]"
                        />
                      </td>
                      <td className="p-1 border-r">
                        <input 
                          type="number" 
                          value={editingRowData?.Head_Body_Length_mm || 0}
                          onChange={e => setEditingRowData(prev => prev ? ({ ...prev, Head_Body_Length_mm: Number(e.target.value) }) : null)}
                          className="bg-white border border-slate-300 rounded px-1 py-0.5 text-slate-800 font-mono w-[55px]"
                        />
                      </td>
                      <td className="p-1 border-r">
                        <input 
                          type="number" 
                          value={editingRowData?.Tail_Length_mm || 0}
                          onChange={e => setEditingRowData(prev => prev ? ({ ...prev, Tail_Length_mm: Number(e.target.value) }) : null)}
                          className="bg-white border border-slate-300 rounded px-1 py-0.5 text-slate-800 font-mono w-[55px]"
                        />
                      </td>
                      <td className="p-1 border-r">
                        <select 
                          value={editingRowData?.Parasite_Load_Ext ?? 0}
                          onChange={e => setEditingRowData(prev => prev ? ({ ...prev, Parasite_Load_Ext: Number(e.target.value) as any }) : null)}
                          className="bg-white border border-slate-300 rounded p-0.5 text-slate-800"
                        >
                          <option value="0">Grade 0</option>
                          <option value="1">Grade 1</option>
                          <option value="2">Grade 2</option>
                          <option value="3">Grade 3</option>
                        </select>
                      </td>
                      <td className="p-1 border-r">
                        <input 
                          type="number" 
                          min="0"
                          value={editingRowData?.Ectoparasite_Count ?? 0}
                          onChange={e => setEditingRowData(prev => prev ? ({ ...prev, Ectoparasite_Count: Number(e.target.value) }) : null)}
                          className="bg-white border border-slate-300 rounded px-1 py-0.5 text-slate-800 font-mono w-[45px]"
                        />
                      </td>
                      <td className="p-1 border-r">
                        <div className="flex gap-1 items-center">
                          <input 
                            type="text" 
                            placeholder="Spp"
                            value={editingRowData?.Ectoparasite_Spp || ''}
                            onChange={e => setEditingRowData(prev => prev ? ({ ...prev, Ectoparasite_Spp: e.target.value }) : null)}
                            className="bg-white border border-slate-300 rounded px-1 py-0.5 font-sans w-[100px]"
                          />
                          <input 
                            type="text" 
                            placeholder="Common Name"
                            value={editingRowData?.Ectoparasite_Common_Name || ''}
                            onChange={e => setEditingRowData(prev => prev ? ({ ...prev, Ectoparasite_Common_Name: e.target.value }) : null)}
                            className="bg-white border border-slate-300 rounded px-1 py-0.5 font-sans w-[100px]"
                          />
                        </div>
                      </td>
                      <td className="p-1 border-r">
                        <select 
                          value={editingRowData?.Endoparasite_Presence || 'No'}
                          onChange={e => setEditingRowData(prev => prev ? ({ ...prev, Endoparasite_Presence: e.target.value as any }) : null)}
                          className="bg-white border border-slate-300 rounded p-0.5 text-slate-800"
                        >
                          <option value="Yes">Yes Presence</option>
                          <option value="No">No (Healthy)</option>
                          <option value="Pending Lab">Pending Assay</option>
                        </select>
                      </td>
                      <td className="p-1 border-r">
                        <div className="flex gap-1 items-center">
                          <input 
                            type="text" 
                            placeholder="Spp"
                            value={editingRowData?.Endoparasite_Spp || ''}
                            onChange={e => setEditingRowData(prev => prev ? ({ ...prev, Endoparasite_Spp: e.target.value }) : null)}
                            className="bg-white border border-slate-300 rounded px-1 py-0.5 font-sans w-[100px]"
                          />
                          <input 
                            type="text" 
                            placeholder="Common Name"
                            value={editingRowData?.Endoparasite_Common_Name || ''}
                            onChange={e => setEditingRowData(prev => prev ? ({ ...prev, Endoparasite_Common_Name: e.target.value }) : null)}
                            className="bg-white border border-slate-300 rounded px-1 py-0.5 font-sans w-[100px]"
                          />
                        </div>
                      </td>
                      <td className="p-1 border-r">
                        <select 
                          value={editingRowData?.Survival_24H || 'Alive'}
                          onChange={e => setEditingRowData(prev => prev ? ({ ...prev, Survival_24H: e.target.value as any }) : null)}
                          className="bg-white border border-slate-300 rounded p-0.5 text-slate-800 font-mono"
                        >
                          <option value="Alive">Alive</option>
                          <option value="Dead">Dead</option>
                        </select>
                      </td>
                      <td className="p-1 border-r">
                        <input 
                          type="number" 
                          min="1" max="90"
                          value={editingRowData?.Time_to_Event_Days || 90}
                          onChange={e => setEditingRowData(prev => prev ? ({ ...prev, Time_to_Event_Days: Number(e.target.value) }) : null)}
                          className="bg-white border border-slate-300 rounded px-1 py-0.5 w-[50px]"
                        />
                      </td>
                      <td className="p-1 border-r">
                        <select 
                          value={editingRowData?.Event_Status ?? 0}
                          onChange={e => setEditingRowData(prev => prev ? ({ ...prev, Event_Status: Number(e.target.value) as any }) : null)}
                          className="bg-white border border-slate-300 rounded p-0.5 text-slate-800"
                        >
                          <option value="0">0 (Censored)</option>
                          <option value="1">1 (Died)</option>
                        </select>
                      </td>
                      <td className="p-1 border-r">
                        <input 
                          type="number" 
                          value={editingRowData?.Trap_Night_ID || 1}
                          onChange={e => setEditingRowData(prev => prev ? ({ ...prev, Trap_Night_ID: Number(e.target.value) }) : null)}
                          className="bg-white border border-slate-300 rounded px-1 py-0.5 w-[45px]"
                        />
                      </td>
                      <td className="p-1 text-center inline-flex gap-1.5 justify-center">
                        <button
                          type="button"
                          onClick={() => handleSaveInlineEdit(s.Record_ID)}
                          className="bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold px-1.5 py-0.5 rounded shadow-sm text-[9.5px] cursor-pointer"
                        >
                          ✔ Save
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingRowId(null);
                            setEditingRowData(null);
                          }}
                          className="bg-slate-500 hover:bg-slate-600 text-white font-bold px-1.5 py-0.5 rounded shadow-sm text-[9.5px] cursor-pointer"
                        >
                          ✖ Cancel
                        </button>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={s.Record_ID} className="border-b hover:bg-slate-50 transition text-[9px] group">
                    <td className="p-1.5 border-r font-bold text-slate-900 text-[10px]">{s.Record_ID}</td>
                    <td className="p-1.5 border-r">{s.Date_Captured}</td>
                    <td className="p-1.5 border-r text-slate-705">{s.Time_Checked}</td>
                    <td className="p-1.5 border-r">{s.Location_Name}</td>
                    <td className="p-1.5 border-r text-slate-650 text-center">{s.GPS_Latitude.toFixed(6)}, {s.GPS_Longitude.toFixed(6)}</td>
                    <td className="p-1.5 border-r font-bold text-[9px] text-slate-650">
                      <span className={`px-1 py-0.2 rounded ${
                        sCluster === 'Noise' ? 'bg-slate-100 text-slate-400' :
                        sCluster === 'Cluster_01' ? 'bg-blue-50 text-blue-800 border border-blue-200' :
                        sCluster === 'Cluster_02' ? 'bg-rose-50 text-rose-800 border border-rose-200' :
                        'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}>
                        {sCluster}
                      </span>
                    </td>
                    <td className="p-1.5 border-r font-extrabold text-blue-900 group-hover:text-blue-500 italic">{s.Species_ID}</td>
                    <td className="p-1.5 border-r">{s.Sex}</td>
                    <td className="p-1.5 border-r">{s.Maturity_Stage}</td>
                    <td className="p-1.5 border-r font-bold text-slate-800 text-right">{s.Weight_g.toFixed(1)}g</td>
                    <td className="p-1.5 border-r text-right">{s.Head_Body_Length_mm}mm</td>
                    <td className="p-1.5 border-r text-right">{s.Tail_Length_mm}mm</td>
                    <td className="p-1.5 border-r text-center font-black">
                      <span className={`px-1 rounded ${
                        s.Parasite_Load_Ext === 0 ? 'bg-emerald-100 text-emerald-800' :
                        s.Parasite_Load_Ext === 1 ? 'bg-lime-100 text-lime-800' :
                        s.Parasite_Load_Ext === 2 ? 'bg-amber-100 text-amber-805' :
                        'bg-rose-100 text-rose-800 animate-pulse'
                      }`}>
                        G-{s.Parasite_Load_Ext}
                      </span>
                    </td>
                    <td className="p-1.5 border-r text-center font-bold text-emerald-950">
                      {s.Ectoparasite_Count ?? 0}
                    </td>
                    <td className="p-1.5 border-r font-medium text-slate-650 italic">
                      {s.Ectoparasite_Spp && s.Ectoparasite_Spp !== 'None' ? (
                        <>
                          <strong className="text-emerald-950">{s.Ectoparasite_Spp}</strong>
                          <span className="text-[8.5px] text-slate-500 ms-1 bg-slate-100 px-1 py-0.2 rounded font-normal">
                            ({s.Ectoparasite_Common_Name || 'flea/tick'})
                          </span>
                        </>
                      ) : (
                        <span className="text-slate-400">Clear</span>
                      )}
                    </td>
                    <td className="p-1.5 border-r">
                      <span className={`px-1 rounded text-[8.5px] font-bold ${
                        s.Endoparasite_Presence === 'Yes' ? 'bg-red-100 text-red-800' :
                        s.Endoparasite_Presence === 'No' ? 'bg-blue-100 text-blue-800' :
                        'bg-slate-205 text-slate-550 border'
                      }`}>
                        {s.Endoparasite_Presence || 'No'}
                      </span>
                    </td>
                    <td className="p-1.5 border-r font-medium text-slate-650 italic">
                      {s.Endoparasite_Spp && s.Endoparasite_Spp !== 'None' ? (
                        <>
                          <strong className="text-blue-950">{s.Endoparasite_Spp}</strong>
                          <span className="text-[8.5px] text-slate-500 ms-1 bg-slate-100 px-1 py-0.2 rounded font-normal">
                            ({s.Endoparasite_Common_Name || 'assay results'})
                          </span>
                        </>
                      ) : (
                        <span className="text-slate-400">{s.Endoparasite_Presence === 'Pending Lab' ? 'Awaiting Lab Assay' : 'Clean'}</span>
                      )}
                    </td>
                    <td className="p-1.5 border-r">{s.Survival_24H}</td>
                    <td className="p-1.5 border-r font-bold text-slate-800 text-right">{s.Time_to_Event_Days}</td>
                    <td className="p-1.5 border-r text-center">{s.Event_Status === 1 ? '1 (Died)' : '0 (Censored)'}</td>
                    <td className="p-1.5 border-r text-center font-bold">{s.Trap_Night_ID}</td>
                    <td className="p-1.5 text-center flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingRowId(s.Record_ID);
                          setEditingRowData({ ...s });
                        }}
                        className="text-[9.5px] text-emerald-800 hover:text-white hover:bg-emerald-900 border border-emerald-300 font-bold px-1.5 py-0.1 select-none rounded transition cursor-pointer"
                        title="Edit rodent details inline"
                      >
                        ✏ Edit Inline
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCloneSpecimen(s)}
                        className="text-[9.5px] text-blue-805 hover:text-white hover:bg-blue-900 border border-blue-300 font-bold px-1.5 py-0.1 select-none rounded transition cursor-pointer"
                        title="Clone/duplicate this rodent data with sequential ID"
                      >
                        📋 Clone
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Confirm deletion of specimen ${s.Record_ID}?`)) {
                            setSpecimens(prev => prev.filter(item => item.Record_ID !== s.Record_ID));
                          }
                        }}
                        className="p-0.5 text-slate-400 hover:text-rose-600 transition hover:bg-rose-50 rounded cursor-pointer"
                        title="Delete Specimen Record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredSpecimens.length === 0 && (
                <tr>
                  <td colSpan={24} className="p-8 text-center text-slate-400 italic text-[11px]">
                    No search, location or species filters match the current ERICON registry dataset.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View: Compact stacking card-based display */}
        <div className="block md:hidden flex flex-col gap-3">
          {filteredSpecimens.map(s => {
            const sCluster = clusterAssignments[s.Record_ID] || 'Noise';
            const isEditing = editingRowId === s.Record_ID;

            if (isEditing) {
              return (
                <div key={s.Record_ID} className="border-2 border-amber-400 bg-amber-50/40 p-3 rounded shadow-xs text-[11px] font-mono flex flex-col gap-3">
                  <div className="flex items-center justify-between border-b border-amber-200 pb-1.5 mb-1 bg-amber-100/50 p-2 rounded-t-xs -mx-3 -mt-3">
                    <span className="font-bold text-emerald-900 text-xs">Editing {s.Record_ID}</span>
                    <span className="text-[9px] text-amber-805 uppercase font-bold">Active Inline Session</span>
                  </div>

                  {/* Core metadata: Date, Time & Loc */}
                  <div className="grid grid-cols-2 gap-2 bg-white/75 p-2 rounded border border-amber-200">
                    <div>
                      <label className="block text-slate-500 font-bold mb-0.5 text-[9px] uppercase">Date Captured</label>
                      <input 
                        type="text" 
                        value={editingRowData?.Date_Captured || ''}
                        onChange={e => setEditingRowData(prev => prev ? ({ ...prev, Date_Captured: e.target.value }) : null)}
                        className="w-full bg-white border border-slate-300 rounded px-1.5 py-1 text-slate-800 text-[10px]"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-bold mb-0.5 text-[9px] uppercase">Time Checked</label>
                      <input 
                        type="text" 
                        value={editingRowData?.Time_Checked || ''}
                        onChange={e => setEditingRowData(prev => prev ? ({ ...prev, Time_Checked: e.target.value }) : null)}
                        className="w-full bg-white border border-slate-300 rounded px-1.5 py-1 text-slate-800 text-[10px]"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-slate-500 font-bold mb-0.5 text-[9px] uppercase">Location Name</label>
                      <input 
                        type="text" 
                        value={editingRowData?.Location_Name || ''}
                        onChange={e => setEditingRowData(prev => prev ? ({ ...prev, Location_Name: e.target.value }) : null)}
                        className="w-full bg-white border border-slate-300 rounded px-1.5 py-1 text-slate-800 text-[10px]"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-bold mb-0.5 text-[9px] uppercase">GPS Latitude</label>
                      <input 
                        type="number" 
                        step="0.000001" 
                        value={editingRowData?.GPS_Latitude || 0}
                        onChange={e => setEditingRowData(prev => prev ? ({ ...prev, GPS_Latitude: Number(e.target.value) }) : null)}
                        className="w-full bg-white border border-slate-300 rounded px-1.5 py-1 text-slate-800 text-[10px]"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-bold mb-0.5 text-[9px] uppercase">GPS Longitude</label>
                      <input 
                        type="number" 
                        step="0.000001" 
                        value={editingRowData?.GPS_Longitude || 0}
                        onChange={e => setEditingRowData(prev => prev ? ({ ...prev, GPS_Longitude: Number(e.target.value) }) : null)}
                        className="w-full bg-white border border-slate-300 rounded px-1.5 py-1 text-slate-800 text-[10px]"
                      />
                    </div>
                  </div>

                  {/* Taxonomy / Morphology */}
                  <div className="grid grid-cols-2 gap-2 bg-white/75 p-2 rounded border border-amber-200">
                    <div className="col-span-2">
                      <label className="block text-teal-850 font-bold mb-0.5 text-[9px] uppercase">Species ID</label>
                      <select 
                        value={editingRowData?.Species_ID || ''}
                        onChange={e => setEditingRowData(prev => prev ? ({ ...prev, Species_ID: e.target.value as any }) : null)}
                        className="w-full bg-white border border-slate-300 rounded p-1 text-slate-800 text-[10px] font-sans"
                      >
                        <option value="Mastomys natalensis">Mastomys natalensis</option>
                        <option value="Rattus rattus">Rattus rattus</option>
                        <option value="Mus musculus">Mus musculus</option>
                        <option value="Arvicanthis niloticus">Arvicanthis niloticus</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-500 font-bold mb-0.5 text-[9px] uppercase">Sex</label>
                      <select 
                        value={editingRowData?.Sex || 'Undetermined'}
                        onChange={e => setEditingRowData(prev => prev ? ({ ...prev, Sex: e.target.value as any }) : null)}
                        className="w-full bg-white border border-slate-300 rounded p-1 text-slate-800 text-[10px]"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Undetermined">Undetermined</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-500 font-bold mb-0.5 text-[9px] uppercase">Maturity Stage</label>
                      <select 
                        value={editingRowData?.Maturity_Stage || 'Adult'}
                        onChange={e => setEditingRowData(prev => prev ? ({ ...prev, Maturity_Stage: e.target.value as any }) : null)}
                        className="w-full bg-white border border-slate-300 rounded p-1 text-slate-800 text-[10px]"
                      >
                        <option value="Juvenile">Juvenile</option>
                        <option value="Sub-Adult">Sub-Adult</option>
                        <option value="Adult">Adult</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-500 font-bold mb-0.5 text-[9px] uppercase">Weight (g)</label>
                      <input 
                        type="number" 
                        step="0.1" 
                        value={editingRowData?.Weight_g || 0}
                        onChange={e => setEditingRowData(prev => prev ? ({ ...prev, Weight_g: Number(e.target.value) }) : null)}
                        className="w-full bg-white border border-slate-300 rounded px-1.5 py-1 text-slate-800 text-[10px]"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-bold mb-0.5 text-[9px] uppercase">Head-Body (mm)</label>
                      <input 
                        type="number" 
                        value={editingRowData?.Head_Body_Length_mm || 0}
                        onChange={e => setEditingRowData(prev => prev ? ({ ...prev, Head_Body_Length_mm: Number(e.target.value) }) : null)}
                        className="w-full bg-white border border-slate-300 rounded px-1.5 py-1 text-slate-800 text-[10px]"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-slate-500 font-bold mb-0.5 text-[9px] uppercase">Tail Length (mm)</label>
                      <input 
                        type="number" 
                        value={editingRowData?.Tail_Length_mm || 0}
                        onChange={e => setEditingRowData(prev => prev ? ({ ...prev, Tail_Length_mm: Number(e.target.value) }) : null)}
                        className="w-full bg-white border border-slate-300 rounded px-1.5 py-1 text-slate-800 text-[10px]"
                      />
                    </div>
                  </div>

                  {/* Parasites detail */}
                  <div className="grid grid-cols-2 gap-2 bg-white/75 p-2 rounded border border-amber-200">
                    <div>
                      <label className="block text-emerald-800 font-bold mb-0.5 text-[9px] uppercase">Ecto Load</label>
                      <select 
                        value={editingRowData?.Parasite_Load_Ext ?? 0}
                        onChange={e => setEditingRowData(prev => prev ? ({ ...prev, Parasite_Load_Ext: Number(e.target.value) as any }) : null)}
                        className="w-full bg-white border border-slate-300 rounded p-1 text-slate-800 text-[10px]"
                      >
                        <option value="0">Grade 0</option>
                        <option value="1">Grade 1</option>
                        <option value="2">Grade 2</option>
                        <option value="3">Grade 3</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-emerald-800 font-bold mb-0.5 text-[9px] uppercase">Ecto Count</label>
                      <input 
                        type="number" 
                        min="0"
                        value={editingRowData?.Ectoparasite_Count ?? 0}
                        onChange={e => setEditingRowData(prev => prev ? ({ ...prev, Ectoparasite_Count: Number(e.target.value) }) : null)}
                        className="w-full bg-white border border-slate-300 rounded px-1.5 py-1 text-slate-800 text-[10px]"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-bold mb-0.5 text-[9px] uppercase">Ecto Spp</label>
                      <input 
                        type="text" 
                        placeholder="Spp"
                        value={editingRowData?.Ectoparasite_Spp || ''}
                        onChange={e => setEditingRowData(prev => prev ? ({ ...prev, Ectoparasite_Spp: e.target.value }) : null)}
                        className="w-full bg-white border border-slate-300 rounded px-1.5 py-1 text-slate-800 text-[10px]"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-bold mb-0.5 text-[9px] uppercase">Ecto Common Name</label>
                      <input 
                        type="text" 
                        placeholder="Common Name"
                        value={editingRowData?.Ectoparasite_Common_Name || ''}
                        onChange={e => setEditingRowData(prev => prev ? ({ ...prev, Ectoparasite_Common_Name: e.target.value }) : null)}
                        className="w-full bg-white border border-slate-300 rounded px-1.5 py-1 text-slate-800 text-[10px]"
                      />
                    </div>

                    <div className="border-t border-slate-200 col-span-2 pt-1 mt-1 font-extrabold text-[9px]">Endoparasites Status:</div>

                    <div>
                      <label className="block text-blue-800 font-bold mb-0.5 text-[9px] uppercase">Endo Presence</label>
                      <select 
                        value={editingRowData?.Endoparasite_Presence || 'No'}
                        onChange={e => setEditingRowData(prev => prev ? ({ ...prev, Endoparasite_Presence: e.target.value as any }) : null)}
                        className="w-full bg-white border border-slate-300 rounded p-1 text-slate-800 text-[10px]"
                      >
                        <option value="Yes">Yes Presence</option>
                        <option value="No">No (Healthy)</option>
                        <option value="Pending Lab">Pending Assay</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-500 font-bold mb-0.5 text-[9px] uppercase">Endo Spp</label>
                      <input 
                        type="text" 
                        placeholder="Spp"
                        value={editingRowData?.Endoparasite_Spp || ''}
                        onChange={e => setEditingRowData(prev => prev ? ({ ...prev, Endoparasite_Spp: e.target.value }) : null)}
                        className="w-full bg-white border border-slate-300 rounded px-1.5 py-1 text-slate-800 text-[10px]"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-slate-500 font-bold mb-0.5 text-[9px] uppercase">Endo Common Name</label>
                      <input 
                        type="text" 
                        placeholder="Common Name"
                        value={editingRowData?.Endoparasite_Common_Name || ''}
                        onChange={e => setEditingRowData(prev => prev ? ({ ...prev, Endoparasite_Common_Name: e.target.value }) : null)}
                        className="w-full bg-white border border-slate-300 rounded px-1.5 py-1 text-slate-800 text-[10px]"
                      />
                    </div>
                  </div>

                  {/* Tracking & Survival */}
                  <div className="grid grid-cols-4 gap-2 bg-white/75 p-2 rounded border border-amber-200">
                    <div className="col-span-2">
                      <label className="block text-slate-500 font-bold mb-0.5 text-[9px] uppercase">24H survival</label>
                      <select 
                        value={editingRowData?.Survival_24H || 'Alive'}
                        onChange={e => setEditingRowData(prev => prev ? ({ ...prev, Survival_24H: e.target.value as any }) : null)}
                        className="w-full bg-white border border-slate-300 rounded p-1 text-slate-800 text-[10px] font-mono"
                      >
                        <option value="Alive">Alive</option>
                        <option value="Dead">Dead</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-500 font-bold mb-0.5 text-[9px] uppercase">Days (Y)</label>
                      <input 
                        type="number" 
                        min="1" max="90"
                        value={editingRowData?.Time_to_Event_Days || 90}
                        onChange={e => setEditingRowData(prev => prev ? ({ ...prev, Time_to_Event_Days: Number(e.target.value) }) : null)}
                        className="w-full bg-white border border-slate-300 rounded px-1.5 py-1 text-slate-800 text-[10px]"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-bold mb-0.5 text-[9px] uppercase">Event (Z)</label>
                      <select 
                        value={editingRowData?.Event_Status ?? 0}
                        onChange={e => setEditingRowData(prev => prev ? ({ ...prev, Event_Status: Number(e.target.value) as any }) : null)}
                        className="w-full bg-white border border-slate-300 rounded p-1 text-slate-800 text-[10px]"
                      >
                        <option value="0">0 (Censored)</option>
                        <option value="1">1 (Died)</option>
                      </select>
                    </div>
                    <div className="col-span-4">
                      <label className="block text-slate-500 font-bold mb-0.5 text-[9px] uppercase">Period (Trap Night AA)</label>
                      <input 
                        type="number" 
                        value={editingRowData?.Trap_Night_ID || 1}
                        onChange={e => setEditingRowData(prev => prev ? ({ ...prev, Trap_Night_ID: Number(e.target.value) }) : null)}
                        className="w-full bg-white border border-slate-300 rounded px-1.5 py-1 text-slate-800 text-[10px]"
                      />
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex gap-2 justify-end mt-1">
                    <button
                      type="button"
                      onClick={() => handleSaveInlineEdit(s.Record_ID)}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold px-3 py-1.5 rounded shadow-sm text-[10px] cursor-pointer flex items-center gap-1"
                    >
                      ✔ Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingRowId(null);
                        setEditingRowData(null);
                      }}
                      className="bg-slate-500 hover:bg-slate-600 text-white font-bold px-3 py-1.5 rounded shadow-sm text-[10px] cursor-pointer flex items-center gap-1"
                    >
                      ✖ Cancel
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div key={s.Record_ID} className="border border-slate-200 bg-white p-3 rounded shadow-xs text-[10px] font-mono flex flex-col gap-2.5 hover:border-slate-350 transition relative group">
                {/* Header info */}
                <div className="flex items-start justify-between border-b pb-1.5">
                  <div>
                    <div className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                      <span className="text-emerald-900">{s.Record_ID}</span>
                      <span className={`text-[8px] px-1 rounded font-bold ${
                        sCluster === 'Noise' ? 'bg-slate-100 text-slate-400' :
                        sCluster === 'Cluster_01' ? 'bg-blue-50 text-blue-800 border border-blue-200' :
                        sCluster === 'Cluster_02' ? 'bg-rose-50 text-rose-800 border border-rose-200' :
                        'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}>
                        {sCluster}
                      </span>
                    </div>
                    <div className="text-[10px] font-extrabold text-blue-900 italic mt-0.5 font-sans">
                      {s.Species_ID}
                    </div>
                  </div>

                  {/* Action Controls */}
                  <div className="flex items-center gap-1 mt-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingRowId(s.Record_ID);
                        setEditingRowData({ ...s });
                      }}
                      className="text-[9px] text-emerald-800 hover:text-white hover:bg-emerald-900 border border-emerald-250 font-extrabold px-1.5 py-0.5 rounded transition cursor-pointer"
                      title="Edit rodent"
                    >
                      ✏ Edit Inline
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCloneSpecimen(s)}
                      className="text-[9px] text-blue-800 hover:text-white hover:bg-blue-900 border border-blue-250 font-extrabold px-1.5 py-0.5 rounded transition cursor-pointer"
                      title="Clone"
                    >
                      📋 Clone
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Confirm deletion of specimen ${s.Record_ID}?`)) {
                          setSpecimens(prev => prev.filter(item => item.Record_ID !== s.Record_ID));
                        }
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 transition hover:bg-rose-50 rounded cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Sub-grid of demographic & morphologic readings */}
                <div className="grid grid-cols-2 gap-2 text-[9px] text-slate-650">
                  <div className="flex flex-col gap-1 bg-slate-50 p-1.5 rounded">
                    <span className="text-[8px] font-extrabold text-slate-400 uppercase tracking-wider">⏱ Spatial & Temps</span>
                    <div>Captured: <strong>{s.Date_Captured}</strong> @ <strong>{s.Time_Checked}</strong></div>
                    <div>Location: <strong className="text-slate-850">{s.Location_Name}</strong></div>
                    <div>GPS: <span className="text-slate-550 font-bold">{s.GPS_Latitude.toFixed(5)}, {s.GPS_Longitude.toFixed(5)}</span></div>
                  </div>

                  <div className="flex flex-col gap-1 bg-slate-50 p-1.5 rounded">
                    <span className="text-[8px] font-extrabold text-slate-400 uppercase tracking-wider">🐹 Demographics</span>
                    <div className="flex gap-1.5 items-center">
                      <span>Sex: <strong>{s.Sex}</strong></span>
                      <span className="text-slate-350">|</span>
                      <span>Maturity: <strong>{s.Maturity_Stage}</strong></span>
                    </div>
                    <div>Weight: <strong className="text-slate-800">{s.Weight_g.toFixed(1)}g</strong></div>
                    <div>H&B Length: <strong>{s.Head_Body_Length_mm}mm</strong> | Tail: <strong>{s.Tail_Length_mm}mm</strong></div>
                  </div>

                  <div className="flex flex-col gap-1 bg-slate-50 p-1.5 rounded col-span-2">
                    <span className="text-[8px] font-extrabold text-slate-400 uppercase tracking-wider">🔬 Parasitology Profile</span>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <div className="flex items-center gap-1">
                        <span className="text-slate-500">Ecto Load:</span>
                        <span className={`px-1 py-0.1 rounded font-extrabold text-[8.5px] ${
                          s.Parasite_Load_Ext === 0 ? 'bg-emerald-100 text-emerald-800' :
                          s.Parasite_Load_Ext === 1 ? 'bg-lime-100 text-lime-800' :
                          s.Parasite_Load_Ext === 2 ? 'bg-amber-100 text-amber-800' :
                          'bg-rose-100 text-rose-800 animate-pulse'
                        }`}>
                          G-{s.Parasite_Load_Ext}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-slate-500">Count:</span>
                        <strong className="text-emerald-950 font-black">{s.Ectoparasite_Count ?? 0}</strong>
                      </div>
                      {s.Ectoparasite_Spp && s.Ectoparasite_Spp !== 'None' ? (
                        <div className="text-[8.5px] text-slate-705 italic">
                          Spp: <strong className="text-emerald-950 font-bold">{s.Ectoparasite_Spp}</strong> ({s.Ectoparasite_Common_Name})
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">No Ectoparasites</span>
                      )}
                    </div>
                    
                    <div className="border-t border-slate-100/80 my-0.5"></div>

                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <div className="flex items-center gap-1">
                        <span className="text-slate-500">Endo Presence:</span>
                        <span className={`px-1 py-0.1 rounded text-[8.5px] font-bold ${
                          s.Endoparasite_Presence === 'Yes' ? 'bg-red-100 text-red-800' :
                          s.Endoparasite_Presence === 'No' ? 'bg-blue-100 text-blue-800' :
                          'bg-slate-205 text-slate-550 border'
                        }`}>
                          {s.Endoparasite_Presence || 'No'}
                        </span>
                      </div>
                      {s.Endoparasite_Spp && s.Endoparasite_Spp !== 'None' ? (
                        <div className="text-[8.5px] text-slate-705 italic">
                          Spp: <strong className="text-blue-950 font-bold">{s.Endoparasite_Spp}</strong> ({s.Endoparasite_Common_Name})
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-slate-500">No Endoparasites</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 bg-slate-50 p-1.5 rounded col-span-2">
                    <span className="text-[8px] font-extrabold text-slate-400 uppercase tracking-wider">🩻 Post-Capture Survival Tracking</span>
                    <div className="grid grid-cols-4 gap-1 text-center font-bold">
                      <div className="bg-white/80 p-1 rounded border">
                        <div className="text-slate-400 text-[7px] uppercase font-bold">24H</div>
                        <div className="text-slate-850 text-[8.5px] font-mono mt-0.5">{s.Survival_24H}</div>
                      </div>
                      <div className="bg-white/80 p-1 rounded border">
                        <div className="text-slate-400 text-[7px] uppercase font-bold">Days (Y)</div>
                        <div className="text-emerald-950 text-[8.5px] font-mono mt-0.5">{s.Time_to_Event_Days}</div>
                      </div>
                      <div className="bg-white/80 p-1 rounded border">
                        <div className="text-slate-400 text-[7px] uppercase font-bold">Event (Z)</div>
                        <div className="text-slate-850 text-[8.5px] font-mono mt-0.5">{s.Event_Status === 1 ? '1 (Died)' : '0 (Cens)'}</div>
                      </div>
                      <div className="bg-white/80 p-1 rounded border">
                        <div className="text-slate-400 text-[7px] uppercase font-bold">Trap Nt</div>
                        <div className="text-slate-850 text-[8.5px] font-mono mt-0.5">{s.Trap_Night_ID}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredSpecimens.length === 0 && (
            <div className="p-8 text-center text-slate-405 bg-white border rounded italic text-[11px]">
              No search, location or species filters match the current ERICON registry dataset.
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

// Clean icons replacement
const TRENDINGUP_ICON_CLEAN: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
