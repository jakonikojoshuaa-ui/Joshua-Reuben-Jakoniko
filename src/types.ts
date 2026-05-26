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

