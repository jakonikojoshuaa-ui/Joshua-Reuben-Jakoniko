/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SystemSpecs {
  p1: number; // OWEP Inlet Pressure (kPa)
  p2: number; // Terminal EMA Hub Pressure (kPa)
  length: number; // Tube Length (m)
  diameter: number; // Tube Inner Diameter (mm)
  roughness: number; // Polyamide-6 surface roughness (mm, nominal 0.0015)
  temperature: number; // Operating temperature (°C)
  capsuleMass: number; // Canister/Capsule mass (g)
  capsuleFriction: number; // Kinematic friction coefficient (nominal 0.08)
  capsuleClearance: number; // Clearance ratio between capsule & tube (e.g. 0.98, seal quality)
}

export interface PhysicsCalculations {
  dp: number; // Differential Pressure (kPa)
  avgPressure: number; // Average pressure (kPa)
  density: number; // Air Density (kg/m^3)
  viscosity: number; // Dynamic Viscosity (Pa·s)
  velocity: number; // Air flow velocity (m/s)
  flowRateVolumetric: number; // Q (m^3/s)
  flowRateMass: number; // kg/s
  reynoldsNumber: number; // Re
  flowRegume: 'Laminar' | 'Transition' | 'Turbulent'; // flow regime
  frictionFactor: number; // Darcy friction factor f
  shearStress: number; // Wall shear stress (Pa)
  pneumaticPower: number; // Theoretical power input (W)
  maxCapsuleVelocity: number; // Steady-state maximum speed (m/s)
}

export interface CapsuleSimulation {
  position: number; // current position along tube (m)
  velocity: number; // current speed (m/s)
  acceleration: number; // structural acceleration (m/s^2)
  time: number; // elapsed time (s)
  isActive: boolean; // is simulation executing
  isCompleted: boolean; // did capsule reach the end
  pressuresP1Array: number[]; // custom trace data
}

export type RodentSpecies = 'field_mouse' | 'house_mouse' | 'mastomys_natalensis' | 'arvicanthis_spp' | 'roof_rat' | 'brown_rat';

export interface ProjectMember {
  userId: string;
  username: string;
  role: 'Administrator' | 'Project Leader' | 'Research Member' | 'Reviewer';
  status: 'Active' | 'Pending Acceptance';
}

export interface ReviewerLink {
  id: string;
  code: string;
  accessType: 'Dashboard Only' | 'Charts Only' | 'Reports Only' | 'Full Read-Only Access';
  expiration: '7 Days' | '30 Days' | 'Custom';
  expiresAt: string;
  createdAt: string;
}

export interface DiscussionCommentReply {
  id: string;
  username: string;
  text: string;
  timestamp: string;
}

export interface DiscussionComment {
  id: string;
  username: string;
  text: string;
  timestamp: string;
  attachments?: { name: string; url: string; tempType?: 'image' | 'file' }[];
  replies?: DiscussionCommentReply[];
}

export interface ProjectDataRecord {
  id: string;
  date: string;
  speciesCaught: string;
  count: number;
  location: string;
  capsuleSpeed: number;
  darcyFriction: number;
  comments: string;
  submittedBy: string;
}

export interface SpecimenRecord {
  id: string;
  // 1. Capture Info
  captureDate: string;
  captureTime: string;
  researchProject: string;
  siteName: string;
  farmId: string;
  warehouseId: string;
  researchTeam: string;
  
  // 2. Geographic Info
  country: string;
  region: string;
  district: string;
  village: string;
  gpsLatitude: number;
  gpsLongitude: number;
  altitude: number;
  
  // 3. Biological Info
  species: string;
  sex: 'Male' | 'Female' | 'Unknown';
  ageClass: 'Juvenile' | 'Sub-adult' | 'Adult';
  reproductiveStatus: 'Active' | 'Inactive' | 'Pregnant' | 'Lactating';
  weight: number;
  headBodyLength: number;
  tailLength: number;
  hindFootLength: number;
  earLength: number;
  
  // 4. Health Info
  bodyConditionScore: number;
  externalParasiteLoad: 'None' | 'Low' | 'Medium' | 'High';
  internalParasiteStatus: 'Negative' | 'Positive' | 'Untested';
  visibleInjuries: 'None' | 'Mild' | 'Severe';
  diseaseNotes: string;
  
  // 5. Survival Monitoring
  survival24h: 'Alive' | 'Deceased';
  survival1wk: 'Alive' | 'Deceased' | 'Lost' | 'Recaptured';
  survival2wk: 'Alive' | 'Deceased' | 'Lost' | 'Recaptured';
  survival1m: 'Alive' | 'Deceased' | 'Lost' | 'Recaptured';
  survival3m: 'Alive' | 'Deceased' | 'Lost' | 'Recaptured';
  
  // 6. Research Notes & Media
  observerNotes: string;
  imageUrls?: string[];
  attachments?: string;
  
  // 7. Lab Results
  virusPcr: 'Negative' | 'Positive' | 'Pending';
  plagueAntibody: 'Negative' | 'Positive' | 'Pending';
  leptospiraPcr: 'Negative' | 'Positive' | 'Pending';
  bacterialCulture: string;
}

export interface ProjectWorkspace {
  id: string;
  name: string;
  type: string;
  description?: string;
  location?: string;
  startDate: string;
  members: ProjectMember[];
  invitationCode: string;
  reviewerLinks: ReviewerLink[];
  comments: DiscussionComment[];
  records: ProjectDataRecord[];
  specimens?: SpecimenRecord[];
  isCustom?: boolean;
}

export interface ProjectNotification {
  id: string;
  title: string;
  message: string;
  unread: boolean;
  timestamp: string;
}

export interface CropDamageRecord {
  id: string;
  date: string;
  farmName: string;
  cropStage: 'Planting' | 'Germination' | 'Vegetative' | 'Flowering' | 'Fruiting' | 'Maturity' | 'Harvest';
  plantsSampled: number;
  plantsDamaged: number;
  percentDamage: number;
  severityScore: number;
  damageCauses: ('Rodents' | 'Birds' | 'Insects' | 'Livestock' | 'Weather' | 'Unknown')[];
}

export interface WarehouseRecord {
  id: string;
  date: string;
  warehouseName: string;
  classification: 'ERICON Protected Warehouse' | 'Partially Protected Warehouse' | 'Non-ERICON Warehouse';
  capacity: number;
  commodityStored: string;
  rodentActivityScore: number;
  sightingsCount: number;
  capturedCount: number;
  damageIncidents: number;
  initialWeightStored: number;
  currentWeight: number;
  estimatedLoss: number;
  economicLossValue: number;
}

export interface RodentSpecimen {
  Record_ID: string;
  Date_Captured: string;
  Time_Checked: string;
  Location_Name: string;
  GPS_Latitude: number;
  GPS_Longitude: number;
  EMA_Node_ID: 'EMA-1' | 'EMA-2' | 'EMA-3' | 'EMA-4';
  Species_ID: 'Mastomys natalensis' | 'Rattus rattus' | 'Mus musculus' | 'Arvicanthis niloticus' | 'Other';
  Sex: 'Male' | 'Female' | 'Undetermined';
  Maturity_Stage: 'Juvenile' | 'Sub-Adult' | 'Adult';
  Reproductive_Condition: 'M: Scrotal' | 'M: Non-scrotal' | 'F: Perforate' | 'F: Lactating' | 'F: Pregnant';
  Weight_g: number;
  Head_Body_Length_mm: number;
  Tail_Length_mm: number;
  Hind_Foot_mm: number;
  Ear_Length_mm: number;
  Parasite_Load_Ext: 0 | 1 | 2 | 3;
  Ectoparasite_Spp: string;
  Ectoparasite_Common_Name: string;
  Ectoparasite_Count: number;
  Endoparasite_Presence: 'Yes' | 'No' | 'Pending Lab';
  Endoparasite_Spp: string;
  Endoparasite_Common_Name: string;
  Survival_24H: 'Alive' | 'Dead';
  Survival_1WK: 'Alive' | 'Dead' | 'Removed';
  Survival_2WK: 'Alive' | 'Dead' | 'Removed';
  Survival_1M: 'Alive' | 'Dead' | 'Removed';
  Survival_3M: 'Alive' | 'Dead' | 'Removed';
  Recapture_Status: 'New Capture' | 'Recapture-Tagged';
  Time_to_Event_Days: number;
  Event_Status: 0 | 1;
  Trap_Night_ID: number;
  Experiment_ID?: string;
  Team_ID?: string;
  Researcher_ID?: string;
  Site_Type?: 'ERICON Fully Protected Farm' | 'ERICON Semi-Protected Farm' | 'Non-ERICON Control Farm' | 'Warehouse Protected by ERICON' | 'Warehouse Not Protected' | 'Mixed Intervention Site' | 'Seasonal Trial Site' | 'Validation Site';
  Farm_Name?: string;
  Village?: string;
  Crop_Type?: string;
  Planting_Date?: string;
  Harvest_Date?: string;
  Farm_Size_Acre?: number;
  ERICON_Coverage_Pct?: number;
  Distance_to_Warehouse?: number;
  Irrigation?: 'Yes' | 'No';
  Soil_Type?: string;
  ERICON_Installed?: 'Yes' | 'No';
  Installation_Date?: string;
  Rodent_Sightings?: number;
  Trap_Success_Rate?: number;
  Crop_Attack_Frequency?: 'Low' | 'Medium' | 'High' | 'Severe';
  Observation_Date?: string;
  Crop_Stage?: 'Pre-Planting' | 'Planting' | 'Seedling' | 'Vegetative' | 'Flowering' | 'Booting' | 'Maturity' | 'Harvest';
  Rodent_Signs?: string;
  Burrow_Count?: number;
  Trap_Count?: number;
  Rodent_Count?: number;
  Damaged_Plants?: number;
  Total_Plants?: number;
  Damage_Pct?: number;
  Cause?: 'Rodent' | 'Other';
  Severity?: 'Low' | 'Moderate' | 'Severe';
  Expected_Yield?: number;
  Actual_Yield?: number;
  Yield_Loss?: number;
  Economic_Loss?: number;
  Storage_Type?: string;
  Protected?: 'Yes' | 'No';
  Rodent_Activity?: 'Low' | 'Medium' | 'High';
  Contaminated_Bags?: number;
  Loss_Pct?: number;
}

export interface BiodiversitySurveyItem {
  id: string;
  date: string;
  farmName: string;
  farmType: 'ERICON Fully Protected Farm' | 'ERICON Semi-Protected Farm' | 'Non-ERICON Control Farm';
  mammals: { speciesName: string; count: number; observationMethod: string }[];
  birds: { species: string; count: number; activity: string }[];
  reptiles: { species: string; count: number }[];
  amphibians: { species: string; count: number }[];
  insects: { speciesGroup: string; abundanceScore: 'Low' | 'Medium' | 'High' }[];
  vegetation: { plantSpecies: string; density: string; coverage: number }[];
}


