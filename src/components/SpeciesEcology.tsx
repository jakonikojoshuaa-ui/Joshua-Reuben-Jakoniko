/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * ERICON Simulator - Tab 6: Species Ecology & Biothermal Catalog.
 * Contains exhaustive scientific records on African & global rodent vectors.
 */

import React, { useState } from 'react';
import { 
  Heart, 
  Wind, 
  Thermometer, 
  Droplets, 
  Activity, 
  Gauge, 
  Layers, 
  Compass, 
  Check,
  Shield,
  BookOpen,
  Info
} from 'lucide-react';
import { RodentSpecies } from '../types';

interface SpeciesEcologyData {
  id: RodentSpecies;
  commonName: string;
  scientificName: string;
  weight: string;
  bodyLength: string;
  tunnelBehaviour: string;
  activityPeriod: string;
  tempMin: number;
  tempMax: number;
  humidityMin: number;
  humidityMax: number;
  nestingPreference: string;
  scientificObservations: string;
  anatomyDetail: string;
  emoji: string;
}

const SPECIES_RECORDS: Record<RodentSpecies, SpeciesEcologyData> = {
  field_mouse: {
    id: 'field_mouse',
    commonName: 'Field Mouse / Wood Mouse',
    scientificName: 'Apodemus sylvaticus',
    weight: '15 - 30 g',
    bodyLength: '80 - 110 mm (Tail: 75 - 115 mm)',
    tunnelBehaviour: 'Primarily surface cursorial transit; utilizes shallow natural cavities, leaf litter trails, and loose topsoil cracks. Displays high climbing agility.',
    activityPeriod: 'Strictly nocturnal, with minor crepuscular foraging waves during seasonal cold spells.',
    tempMin: 20,
    tempMax: 26,
    humidityMin: 45,
    humidityMax: 65,
    nestingPreference: 'Shallow subterranean chambers packed with dry grass, leaf matter, and seeds, located under hedges or root networks.',
    scientificObservations: 'Extremely sensitive to mechanical airflow drafts. Air velocity exceeding 1.5 m/s initiates high neophobic sensory stress and immediately triggers retrograde avoidance gait. Under stable pipeline transit tests, maintain velocity range below 2.5 m/s to prevent elevated heart/metabolic stress indices.',
    anatomyDetail: 'Prominent, large black eyes adapted for dim light; long hind feet providing jumping spring; tail is usually equal to head-body length.',
    emoji: '🐹'
  },
  house_mouse: {
    id: 'house_mouse',
    commonName: 'Common House Mouse',
    scientificName: 'Mus musculus',
    weight: '12 - 25 g',
    bodyLength: '70 - 100 mm (Tail: 60 - 105 mm)',
    tunnelBehaviour: 'Tight-void squeeze crawler. Extremely inquisitive. Fits through channels as narrow as 8-10 mm. Highly habituated to indoor structural pathways.',
    activityPeriod: 'Mainly nocturnal, though acclimates rapidly to match human harvest schedules or feed storage quiet hours.',
    tempMin: 22,
    tempMax: 26,
    humidityMin: 40,
    humidityMax: 60,
    nestingPreference: 'Opportunistic. Shredded textiles, paper, crop residues packed inside dry masonry gaps, agricultural subfloors, or deep wall insulation.',
    scientificObservations: 'Reacts aggressively to drop-pressure variations. Very low air requirements (0.25 L/min minimum flow). Draft velocities of >2.0 m/s trigger thigmotactic wall-clinging behaviors, forcing them to lock claws in place inside textured tubes. Short pneumatic accelerations to 8.0 m/s are survived with low impact risk.',
    anatomyDetail: 'Grizzled grey-brown fur, paler underneath; tail is sparsely haired, with distinct scaly rings; large ears relative to body size.',
    emoji: '🐭'
  },
  mastomys_natalensis: {
    id: 'mastomys_natalensis',
    commonName: 'African Multimammate Mouse',
    scientificName: 'Mastomys natalensis',
    weight: '20 - 80 g',
    bodyLength: '80 - 140 mm (Tail: 80 - 135 mm)',
    tunnelBehaviour: 'Highly gregarious cursorial. Constructs extensive agricultural runway lines. Excels at high-speed sub-surface soil tunneling and perimeter crop-row crossings.',
    activityPeriod: 'Nocturnal, exhibiting intense feeding spikes 1-2 hours post-dusk and preceding dawn.',
    tempMin: 24,
    tempMax: 32,
    humidityMin: 35,
    humidityMax: 70,
    nestingPreference: 'Communal, multi-chambered underground burrows dug into crumbly, dry agricultural soil or hollow tree bases.',
    scientificObservations: 'Primary vector of Lassa virus and Leptospirosis in tropical Africa. High adaptation to semi-arid settings. Responds to airflow drafts with immediate retreat behaviors. Pipeline transport is highly effective at nominal 3.0 m/s velocities; continuous suction currents above 6.5 m/s provide excellent non-chemical perimeter capture rate.',
    anatomyDetail: 'Females have up to 24 nipples (multimammate), enabling highly prolific reproductive booms; soft brownish-grey fur with silver-grey belly.',
    emoji: '🌍'
  },
  arvicanthis_spp: {
    id: 'arvicanthis_spp',
    commonName: 'African Grass Rat',
    scientificName: 'Arvicanthis niloticus',
    weight: '50 - 150 g',
    bodyLength: '120 - 190 mm (Tail: 90 - 110 mm)',
    tunnelBehaviour: 'Heavy, robust runway builder. Chews distinct trails in heavy turf or maize stems. Moves along surface lineaments and shallow, horizontal multi-exit tunnels.',
    activityPeriod: 'Diurnal. Shows peak activity during early morning and late afternoon hours, avoiding mid-day heat waves.',
    tempMin: 22,
    tempMax: 29,
    humidityMin: 50,
    humidityMax: 75,
    nestingPreference: 'Thicker field cover nests constructed from dried crop foliage and grasses, located under crop beds or field margins.',
    scientificObservations: 'Diurnal activity necessitates continuous daytime air ventilation (0.8 L/min minimum exchange). Thick coat and high body mass insulate them from drafts, but laminar air speeds exceeding 3.5 m/s induce nesting responses, making active vacuum pressure an effective biological barrier.',
    anatomyDetail: 'Coarse, grizzled yellowish-black dorsal fur; shorter tail than head-body; compact, stout skull with strong mastication muscles.',
    emoji: '🌾'
  },
  roof_rat: {
    id: 'roof_rat',
    commonName: 'Roof Rat / Black Rat',
    scientificName: 'Rattus rattus',
    weight: '150 - 250 g',
    bodyLength: '160 - 220 mm (Tail: 190 - 250 mm)',
    tunnelBehaviour: 'Arboreal and vertical specialist. Navigates wires, pipes, and overhead agricultural joists with extreme balance. Reluctant to tunnel underground.',
    activityPeriod: 'Strictly nocturnal, highly secretive, and extremely neophobic (reacts with heavy suspicion to new conduit elements).',
    tempMin: 20,
    tempMax: 26,
    humidityMin: 45,
    humidityMax: 70,
    nestingPreference: 'High-elevation nests. Constructed in tree crowns, thatched roofs, elevated grain silos, and warehouse rafters.',
    scientificObservations: 'Agile climber that bypasses primitive gravity traps. Passive duct systems are easily breached; physical vacuum barriers are required. Air velocity below 4.0 m/s is navigated with high mobility. Draft currents between 4.5 m/s and 6.0 m/s create high air resistance, triggering immediate overhead holding patterns.',
    anatomyDetail: 'Long, hairless tail exceeding the head-body length; large, thin, translucent ears; slender body frame designed for high climbing leverage.',
    emoji: '🧗'
  },
  brown_rat: {
    id: 'brown_rat',
    commonName: 'Brown Rat / sewer Rat',
    scientificName: 'Rattus norvegicus',
    weight: '200 - 500 g',
    bodyLength: '200 - 270 mm (Tail: 150 - 200 mm)',
    tunnelBehaviour: 'Subterranean fossorial and swimmer. Excels at deep tunneling beneath foundations. Highly aggressive burrower, creating extensive network complexes.',
    activityPeriod: 'Nocturnal, with high activity in muddy creeks, utility conduits, and subsurface grain storehouse channels.',
    tempMin: 18,
    tempMax: 24,
    humidityMin: 50,
    humidityMax: 80,
    nestingPreference: 'Deep earth burrows lined with paper or soft foliage, typically dug near water sources, riverbanks, or concrete slab perimeters.',
    scientificObservations: 'Large body mass requires high ventilation exchange rate (1.2 L/min minimum). Extremely strong, capable of forcing through vertical flap gates unless a spring lock or passive stopper ridge is installed. Well-insulated; velocity under 4.5 m/s doesn\'t impede transit, but limits above 12.0 m/s pose severe pneumatic flight impact risks.',
    anatomyDetail: 'Heavy, thick body with blunt muzzle; short ears covered in fine hairs; thick tail that is always shorter than head-body length.',
    emoji: '🐀'
  }
};

export const SpeciesEcology: React.FC = () => {
  const [selectedId, setSelectedId] = useState<RodentSpecies>('field_mouse');
  const record = SPECIES_RECORDS[selectedId];

  return (
    <div className="space-y-6 animate-fade-in text-slate-800 dark:text-slate-100" id="species-ecology-container">
      
      {/* EXPLANATORY HEADER */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-slate-100 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-900 border border-emerald-850 text-emerald-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
              Target Species Ecological &amp; Biothermal Directory
            </h3>
            <p className="text-[10px] text-slate-400 font-sans mt-0.5">
              Review morphological, behavioral, and environmental characteristics of target rodent families.
            </p>
          </div>
        </div>
        <p className="text-[11px] font-mono leading-relaxed text-slate-400 max-w-5xl">
          Scientific monitoring of Sokoine University (SUA) field trials confirms that mechanical containment must be tailored to mammalian biological envelopes. Selective velocities and pressure boundaries prevent animal lethality while securing high agricultural yield defense indexes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: SPECIES SELECTOR INDEX (No Simulator Controls) */}
        <div className="lg:col-span-4 flex flex-col gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-3xs">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-2 mb-2">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
              1. Taxonomy Index
            </span>
            <p className="text-[9px] text-slate-500 font-sans mt-0.5">
              Select a species to load its comprehensive biological record catalog.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            {(Object.values(SPECIES_RECORDS)).map((sp) => {
              const isSelected = sp.id === selectedId;
              return (
                <button
                  key={sp.id}
                  type="button"
                  onClick={() => setSelectedId(sp.id)}
                  className={`w-full text-left p-3 border rounded-xl flex items-center justify-between transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-500/5 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-400 ring-2 ring-emerald-500/10 font-bold'
                      : 'border-slate-100 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-950/60 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl shrink-0" role="img" aria-label={sp.commonName}>
                      {sp.emoji}
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-mono font-bold truncate leading-tight">
                        {sp.commonName}
                      </span>
                      <span className="text-[9.5px] italic text-slate-400 dark:text-slate-500 truncate font-sans">
                        {sp.scientificName}
                      </span>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="p-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-750 dark:text-emerald-400">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/50 rounded-lg p-3 border border-slate-150 dark:border-slate-850/80 font-mono text-[9px] text-slate-500 mt-2 space-y-1">
            <span className="font-bold text-slate-700 dark:text-slate-350 block uppercase tracking-tight">Ecology Advisory Notice</span>
            <p className="leading-relaxed">
              These records are extracted from field surveys conducted in the United Republic of Tanzania and SUA laboratories. Morphological values are based on healthy post-pubescent populations.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: SPECIES SCIENTIFIC DETAILS CARD  */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-3xs space-y-6">
            
            {/* CARD HEADER - SPECIES MONOMIAL */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3.5">
                <span className="text-3xl p-2 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl leading-none">
                  {record.emoji}
                </span>
                <div>
                  <h4 className="text-sm font-mono font-black text-[#15462D] dark:text-emerald-400 uppercase tracking-wide">
                    {record.commonName}
                  </h4>
                  <p className="text-[11px] italic text-slate-400 font-sans mt-0.5">
                    Scientific nomenclature: <strong className="font-semibold text-slate-600 dark:text-slate-300">{record.scientificName}</strong>
                  </p>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-2">
                <span className="text-[9px] bg-slate-100 dark:bg-slate-950 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded font-mono font-medium uppercase tracking-wider">
                  Species ID: {record.id}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* SECTION A: BIOLOGICAL PROFILE */}
              <div className="space-y-4">
                <h5 className="text-[11px] font-mono font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-1.5">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  Biological Profile
                </h5>

                <div className="space-y-3 text-[11px] font-mono">
                  <div className="flex justify-between border-b border-dashed border-slate-100 dark:border-slate-800/60 pb-1">
                    <span className="text-slate-400">Scientific Name</span>
                    <span className="font-bold italic text-slate-700 dark:text-slate-200">{record.scientificName}</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-slate-100 dark:border-slate-800/60 pb-1">
                    <span className="text-slate-400">Biological Weight</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">{record.weight}</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-slate-100 dark:border-slate-800/60 pb-1">
                    <span className="text-slate-400">Body Length</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">{record.bodyLength}</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-slate-100 dark:border-slate-800/60 pb-1">
                    <span className="text-slate-400">Activity Period</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">{record.activityPeriod}</span>
                  </div>
                  <div className="flex flex-col gap-1.5 pt-1 text-[10.5px] font-sans text-slate-500 leading-normal">
                    <strong className="font-mono text-[9px] uppercase tracking-wide text-slate-405">Tunnel &amp; Runway Behaviour:</strong>
                    <p className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-sm border border-slate-100 dark:border-slate-800 italic">
                      {record.tunnelBehaviour}
                    </p>
                  </div>
                </div>
              </div>

              {/* SECTION B: ENVIRONMENTAL PREFERENCES */}
              <div className="space-y-4">
                <h5 className="text-[11px] font-mono font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-1.5">
                  <Thermometer className="w-4 h-4 text-emerald-600" />
                  Environmental Preferences
                </h5>

                <div className="space-y-4 font-mono text-[11px]">
                  
                  {/* Thermoneutral temperature range representation */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-400 uppercase">Thermoneutral Temp Range</span>
                      <strong className="text-slate-700 dark:text-slate-200">{record.tempMin}°C - {record.tempMax}°C</strong>
                    </div>
                    {/* Visual bar range */}
                    <div className="relative h-2 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden">
                      <div 
                        className="absolute h-full bg-emerald-500 rounded-full"
                        style={{
                          left: `${(record.tempMin / 40) * 100}%`,
                          right: `${100 - (record.tempMax / 40) * 100}%`
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-[8px] text-slate-400">
                      <span>0°C</span>
                      <span>20°C</span>
                      <span>30°C</span>
                      <span>40°C</span>
                    </div>
                  </div>

                  {/* Relative humidity range representation */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-400 uppercase">Optimal Humidity Range</span>
                      <strong className="text-slate-700 dark:text-slate-200">{record.humidityMin}% - {record.humidityMax}% RH</strong>
                    </div>
                    {/* Visual bar range */}
                    <div className="relative h-2 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden">
                      <div 
                        className="absolute h-full bg-blue-500 rounded-full"
                        style={{
                          left: `${record.humidityMin}%`,
                          right: `${100 - record.humidityMax}%`
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-[8px] text-slate-400">
                      <span>0%</span>
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 pt-1 text-[10.5px] font-sans text-slate-500 leading-normal">
                    <strong className="font-mono text-[9px] uppercase tracking-wide text-slate-405">Nesting Preference:</strong>
                    <p className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-sm border border-slate-100 dark:border-slate-800 italic">
                      {record.nestingPreference}
                    </p>
                  </div>

                </div>
              </div>

            </div>

            {/* SECTION C: SPECIES RESPONSE TO AIRFLOW (FULL-WIDTH BANNER) */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-5">
              <div className="space-y-3">
                <h5 className="text-[11px] font-mono font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Wind className="w-4 h-4 text-emerald-600 animate-pulse" />
                  Species Response to Airflow &amp; Scientific Observations
                </h5>

                <div className="bg-gradient-to-br from-emerald-50/20 to-slate-50/10 dark:from-slate-950 dark:to-slate-950/40 border border-emerald-500/20 dark:border-emerald-500/10 rounded-xl p-4 text-[11px]">
                  <p className="font-sans leading-relaxed text-slate-650 dark:text-slate-300">
                    {record.scientificObservations}
                  </p>
                  
                  <div className="mt-3.5 pt-3.5 border-t border-emerald-500/10 grid grid-cols-1 sm:grid-cols-2 gap-4 text-[9.5px] font-mono text-slate-450 uppercase">
                    <div className="flex items-center gap-1.5">
                      <Gauge className="w-4 h-4 text-emerald-500" />
                      <span>Anatomical Class: <strong className="text-slate-700 dark:text-slate-200">{record.id.includes('rat') ? 'Heavy Rodent Block' : 'Light Cursorial'}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-emerald-500" />
                      <span>Biosafety Level: <strong className="text-slate-700 dark:text-slate-200">Non-Lethal Containment</strong></span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* TAXONOMICAL ANATOMY NOTE */}
            <div className="p-3 bg-slate-50 dark:bg-slate-950 p-3 rounded-lg flex gap-3 text-xs font-mono border border-slate-150 dark:border-slate-850/60">
              <div className="shrink-0 text-blue-505 dark:text-blue-400 mt-0.5">
                <Info className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <span className="font-extrabold text-blue-850 dark:text-blue-300 text-[10px] uppercase">Morphometrical Anatomy Details</span>
                <p className="text-[10px] text-slate-505 dark:text-slate-400 leading-relaxed normal-case font-normal font-sans">
                  {record.anatomyDetail}
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
