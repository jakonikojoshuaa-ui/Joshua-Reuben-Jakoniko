/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SystemSpecs, PhysicsCalculations, RodentSpecies } from '../types';

/**
 * Calculates dynamic viscosity of air using Sutherland's Formula.
 * @param tempC Temperature in °C
 * @returns viscosity in Pa·s
 */
export function calculateViscosity(tempC: number): number {
  const Tk = tempC + 273.15;
  const mu0 = 1.827e-5; // reference viscosity at T0 (Pa·s)
  const T0 = 291.15; // reference temperature (K)
  const S = 120.0; // Sutherland constant (K)
  
  return mu0 * Math.pow(Tk / T0, 1.5) * ((T0 + S) / (Tk + S));
}

/**
 * Calculates air density using the Ideal Gas Law.
 * @param avgPressKPa Average pressure in kPa
 * @param tempC Temperature in °C
 * @returns density in kg/m^3
 */
export function calculateDensity(avgPressKPa: number, tempC: number): number {
  const Tk = tempC + 273.15;
  const R = 287.05; // Specific gas constant for dry air J/(kg·K)
  const pressPa = avgPressKPa * 1000;
  return pressPa / (R * Tk);
}

/**
 * Solves the flow equations using an iterative Darcy-Weisbach method with Haaland's equation.
 */
export function calculatePhysics(specs: SystemSpecs): PhysicsCalculations {
  const p1Pa = specs.p1 * 1000;
  const p2Pa = specs.p2 * 1000;
  const dp = specs.p1 - specs.p2; // limit to positive values
  const avgPressure = (specs.p1 + specs.p2) / 2;
  const tempK = specs.temperature + 273.15;
  
  // Basic properties
  const density = calculateDensity(avgPressure, specs.temperature);
  const viscosity = calculateViscosity(specs.temperature);
  
  const D_meters = specs.diameter / 1000;
  const L_meters = specs.length;
  const roughness_meters = specs.roughness / 1000;
  
  // Solve for air velocity iteratively
  // We use Haaland's approximation to estimate the friction factor f
  let velocity = 1.0; // initial guess (m/s)
  let f = 0.02; // initial guess of friction factor
  const pipeArea = (Math.PI / 4) * Math.pow(D_meters, 2);
  
  // Convergence loops
  for (let idx = 0; idx < 10; idx++) {
    const reynoldsNumber = (density * velocity * D_meters) / viscosity;
    
    // Friction factor calculation
    if (reynoldsNumber < 1) {
      f = 64; // arbitrary large number for extremely slow movement
    } else if (reynoldsNumber < 2300) {
      // Laminar flow
      f = 64 / reynoldsNumber;
    } else {
      // Turbulent or Transition flow - Haaland approximation
      const epsD = roughness_meters / D_meters;
      const haalandInverse = -1.8 * Math.log10(
        Math.pow(epsD / 3.7, 1.11) + 6.9 / Math.max(reynoldsNumber, 10)
      );
      f = Math.max(1 / Math.pow(haalandInverse, 2), 0.005);
    }
    
    // Darcy-Weisbach: dp_Pa = f * (L/D) * (rho * v^2 / 2)
    // Solved for velocity: v = sqrt(2 * D * dp_Pa / (f * rho * L))
    const dragForceFactor = (f * L_meters) / D_meters;
    const dpPaValue = Math.max(dp * 1000, 0.1); // avoid division by zero or negative
    
    const newVal = Math.sqrt((2 * D_meters * dpPaValue) / (f * density * L_meters));
    if (Math.abs(velocity - newVal) < 0.01) {
      velocity = newVal;
      break;
    }
    velocity = 0.6 * velocity + 0.4 * newVal; // relaxation
  }
  
  // Re-calculate finalized properties
  const reynoldsNumber = (density * velocity * D_meters) / viscosity;
  let flowRegume: 'Laminar' | 'Transition' | 'Turbulent' = 'Laminar';
  if (reynoldsNumber >= 4000) {
    flowRegume = 'Turbulent';
  } else if (reynoldsNumber >= 2300) {
    flowRegume = 'Transition';
  }
  
  const flowRateVolumetric = velocity * pipeArea; // m^3/s
  const flowRateMass = flowRateVolumetric * density; // kg/s
  
  // Shear stress at pipe wall: tau_w = f * rho * v^2 / 8
  const shearStress = (f * density * Math.pow(velocity, 2)) / 8;
  
  // Pneumatic mechanical power: W = Q * dp_Pa
  const pneumaticPower = flowRateVolumetric * Math.max(dp * 1000, 0);
  
  // Steady state terminal velocity of a pneumatic capsule:
  // F_pressure = F_friction + F_drag
  // dp * Area * ClearanceRatio = f_sliding * Mass * g + 0.5 * Cd * Area * rho * V_cap^2
  // Solved for V_cap:
  const capArea = pipeArea;
  const massKg = specs.capsuleMass / 1000;
  const gravity = 9.81;
  const f_press = Math.max(dp * 1000, 0) * capArea * specs.capsuleClearance;
  const f_fric = specs.capsuleFriction * massKg * gravity;
  
  let maxCapsuleVelocity = 0;
  if (f_press > f_fric) {
    const cd = 1.05; // drag coefficient of cylindrical capsule
    const excessForce = f_press - f_fric;
    maxCapsuleVelocity = Math.sqrt((2 * excessForce) / (cd * capArea * density));
    // Capsule cannot turn faster than the surrounding air drive speed
    if (maxCapsuleVelocity > velocity) {
      maxCapsuleVelocity = velocity * specs.capsuleClearance;
    }
  }

  return {
    dp,
    avgPressure,
    density,
    viscosity,
    velocity,
    flowRateVolumetric,
    flowRateMass,
    reynoldsNumber,
    flowRegume,
    frictionFactor: f,
    shearStress,
    pneumaticPower,
    maxCapsuleVelocity
  };
}

export const SPECIES_PROFILES: Record<RodentSpecies, { 
  isRat: boolean; 
  optMin: number; 
  optMax: number; 
  maxSafeVel: number; 
  fatalVel: number;
  minFlowLmin: number;
}> = {
  field_mouse: { isRat: false, optMin: 20, optMax: 26, maxSafeVel: 2.5, fatalVel: 8.0, minFlowLmin: 0.25 },
  house_mouse: { isRat: false, optMin: 22, optMax: 26, maxSafeVel: 2.5, fatalVel: 8.0, minFlowLmin: 0.25 },
  mastomys_natalensis: { isRat: false, optMin: 24, optMax: 32, maxSafeVel: 3.0, fatalVel: 9.0, minFlowLmin: 0.45 },
  arvicanthis_spp: { isRat: true, optMin: 22, optMax: 29, maxSafeVel: 3.5, fatalVel: 10.0, minFlowLmin: 0.8 },
  roof_rat: { isRat: true, optMin: 20, optMax: 26, maxSafeVel: 4.0, fatalVel: 11.0, minFlowLmin: 1.0 },
  brown_rat: { isRat: true, optMin: 18, optMax: 24, maxSafeVel: 4.5, fatalVel: 12.0, minFlowLmin: 1.2 },
};

/**
 * Computes survival score using standard biological thresholds.
 */
export function calculateSurvivalScore(specs: SystemSpecs, calc: PhysicsCalculations, rodentSpecies: RodentSpecies): number {
  const activeProfile = SPECIES_PROFILES[rodentSpecies] || SPECIES_PROFILES.field_mouse;
  const isRat = activeProfile.isRat;
  const optMin = activeProfile.optMin;
  const optMax = activeProfile.optMax;
  const fatalVel = activeProfile.fatalVel;
  const maxSafeVel = activeProfile.maxSafeVel;

  const volumeTube = Math.PI * Math.pow(specs.diameter / 2000, 2) * specs.length;
  const flowHourly = calc.flowRateVolumetric * 3600;
  const ach = flowHourly / Math.max(volumeTube, 0.001);

  let achStatus: 'excellent' | 'warning' | 'fatal' = 'excellent';
  if (ach < 8) {
    achStatus = 'fatal';
  } else if (ach < 18 || ach > 180) {
    achStatus = 'warning';
  }

  let velStatus: 'excellent' | 'warning' | 'fatal' = 'excellent';
  if (calc.velocity < 0.05) {
    velStatus = 'warning';
  } else if (calc.velocity > fatalVel) {
    velStatus = 'fatal';
  } else if (calc.velocity > maxSafeVel) {
    velStatus = 'warning';
  }

  let pressStatus: 'excellent' | 'warning' | 'fatal' = 'excellent';
  if (calc.avgPressure < 45 || specs.p2 < 45) {
    pressStatus = 'fatal';
  } else if (calc.avgPressure < 85 || specs.p2 < 82) {
    pressStatus = 'warning';
  } else if (calc.avgPressure > 175 || specs.p1 > 175) {
    pressStatus = 'fatal';
  } else if (calc.avgPressure > 120 || specs.p1 > 120) {
    pressStatus = 'warning';
  }

  let tempStatus: 'excellent' | 'warning' | 'fatal' = 'excellent';
  if (specs.temperature <= 0 || specs.temperature >= 38) {
    tempStatus = 'fatal';
  } else if (specs.temperature < optMin || specs.temperature > optMax) {
    tempStatus = 'warning';
  }

  let survivalScore = 98;
  if (achStatus === 'fatal' || velStatus === 'fatal' || pressStatus === 'fatal' || tempStatus === 'fatal') {
    survivalScore = 0;
  } else {
    if (achStatus === 'warning') survivalScore -= 15;
    if (velStatus === 'warning') survivalScore -= 20;
    if (pressStatus === 'warning') survivalScore -= 22;
    if (tempStatus === 'warning') {
      const diff = Math.abs(specs.temperature - (optMin + optMax) / 2);
      survivalScore -= Math.min(Math.round(diff * 2.5), 32);
    }
    survivalScore = Math.max(Math.min(survivalScore, 99), 5);
  }

  return survivalScore;
}

