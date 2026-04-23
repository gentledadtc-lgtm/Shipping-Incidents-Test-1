const fs   = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, 'incidents.json');

const SEED = [
  {
    id: 1, incident_date: '2026-01-15', vessel_name: 'MV Atlantic Star',
    vessel_type: 'Container Ship', incident_type: 'Collision',
    location: 'Strait of Malacca', coordinates: '1.2833° N, 103.8607° E',
    description: 'Minor collision with fishing vessel during low visibility conditions. No injuries reported. Damage limited to bow section.',
    severity: 'Low', status: 'Resolved', reported_by: 'Capt. James Wilson',
    casualties: 0, damage_estimate: '$45,000',
    created_at: '2026-01-15T08:00:00Z', updated_at: '2026-01-15T08:00:00Z'
  },
  {
    id: 2, incident_date: '2026-02-03', vessel_name: 'SS Northern Light',
    vessel_type: 'Bulk Carrier', incident_type: 'Grounding',
    location: 'Gulf of Aden', coordinates: '12.5° N, 45.0° E',
    description: 'Vessel ran aground on uncharted shoal during night navigation. Hull breach detected in forward compartment. Salvage tug deployed.',
    severity: 'High', status: 'Resolved', reported_by: 'Capt. Maria Santos',
    casualties: 0, damage_estimate: '$2,300,000',
    created_at: '2026-02-03T02:15:00Z', updated_at: '2026-02-03T02:15:00Z'
  },
  {
    id: 3, incident_date: '2026-02-18', vessel_name: 'MV Pacific Dream',
    vessel_type: 'Cruise Ship', incident_type: 'Fire/Explosion',
    location: 'Caribbean Sea', coordinates: '18.4° N, 66.1° W',
    description: 'Engine room fire contained within 2 hours by crew. Three crew members treated for minor burns. All 2,400 passengers evacuated to muster stations.',
    severity: 'Critical', status: 'Closed', reported_by: 'Chief Officer T. Chen',
    casualties: 3, damage_estimate: '$850,000',
    created_at: '2026-02-18T14:30:00Z', updated_at: '2026-02-18T14:30:00Z'
  },
  {
    id: 4, incident_date: '2026-03-01', vessel_name: 'Tanker Poseidon',
    vessel_type: 'Oil Tanker', incident_type: 'Oil Spill',
    location: 'Persian Gulf', coordinates: '26.5° N, 53.0° E',
    description: 'Minor oil spill occurred during bunkering operations at anchorage. Approximately 500 litres of bunker fuel spilled. Containment booms deployed.',
    severity: 'Medium', status: 'Resolved', reported_by: 'Capt. Ahmed Al-Rashid',
    casualties: 0, damage_estimate: '$120,000',
    created_at: '2026-03-01T09:45:00Z', updated_at: '2026-03-01T09:45:00Z'
  },
  {
    id: 5, incident_date: '2026-03-15', vessel_name: 'MV Horizon Runner',
    vessel_type: 'Container Ship', incident_type: 'Cargo Damage',
    location: 'Port of Rotterdam', coordinates: '51.9225° N, 4.4792° E',
    description: 'Stack collapse during rough weather transit. Twelve containers lost overboard, six additional containers damaged.',
    severity: 'Medium', status: 'Under Investigation', reported_by: 'Port Master R. Dijkstra',
    casualties: 0, damage_estimate: '$380,000',
    created_at: '2026-03-15T11:00:00Z', updated_at: '2026-03-15T11:00:00Z'
  },
  {
    id: 6, incident_date: '2026-03-28', vessel_name: 'FV Sea Eagle',
    vessel_type: 'Fishing Vessel', incident_type: 'Man Overboard',
    location: 'North Sea', coordinates: '56.0° N, 3.0° E',
    description: 'Crew member fell overboard during net hauling operations. Crew member recovered by rescue helicopter after 45 minutes in water. Hypothermia treated onboard.',
    severity: 'High', status: 'Closed', reported_by: 'Capt. Erik Larsen',
    casualties: 1, damage_estimate: '$0',
    created_at: '2026-03-28T06:20:00Z', updated_at: '2026-03-28T06:20:00Z'
  },
  {
    id: 7, incident_date: '2026-04-02', vessel_name: 'MV Coral Bay',
    vessel_type: 'Ferry', incident_type: 'Equipment Failure',
    location: 'Mediterranean Sea', coordinates: '35.5° N, 14.5° E',
    description: 'Main engine failure leaving vessel adrift for 8 hours. All 340 passengers safe. Towing assistance arranged from Malta.',
    severity: 'Medium', status: 'Resolved', reported_by: 'Capt. Sophia Greco',
    casualties: 0, damage_estimate: '$95,000',
    created_at: '2026-04-02T16:00:00Z', updated_at: '2026-04-02T16:00:00Z'
  },
  {
    id: 8, incident_date: '2026-04-10', vessel_name: 'SS Iron Maiden',
    vessel_type: 'Bulk Carrier', incident_type: 'Flooding',
    location: 'South China Sea', coordinates: '10.0° N, 114.0° E',
    description: 'Significant water ingress detected in No.3 cargo hold due to suspected structural failure. Emergency pumps deployed. Cargo of iron ore compromised.',
    severity: 'High', status: 'Under Investigation', reported_by: 'Chief Engineer K. Park',
    casualties: 0, damage_estimate: '$1,200,000',
    created_at: '2026-04-10T03:10:00Z', updated_at: '2026-04-10T03:10:00Z'
  },
  {
    id: 9, incident_date: '2026-04-12', vessel_name: 'MV Swift Trader',
    vessel_type: 'Container Ship', incident_type: 'Navigation Error',
    location: 'English Channel', coordinates: '51.0° N, 1.5° E',
    description: 'Vessel deviated from Traffic Separation Scheme due to GPS receiver malfunction. Near miss with inbound bulk carrier.',
    severity: 'Medium', status: 'Open', reported_by: 'Capt. Oliver Brown',
    casualties: 0, damage_estimate: '$15,000',
    created_at: '2026-04-12T21:30:00Z', updated_at: '2026-04-12T21:30:00Z'
  },
  {
    id: 10, incident_date: '2026-04-14', vessel_name: 'Tanker Gulf Star',
    vessel_type: 'Chemical Tanker', incident_type: 'Equipment Failure',
    location: 'Red Sea', coordinates: '20.0° N, 38.0° E',
    description: 'Cargo pump failure on No.2 tank causing significant delay in discharge operations. No environmental impact. Spare parts flown in.',
    severity: 'Low', status: 'Open', reported_by: 'Capt. Hassan Al-Khoury',
    casualties: 0, damage_estimate: '$25,000',
    created_at: '2026-04-14T10:00:00Z', updated_at: '2026-04-14T10:00:00Z'
  }
];

function load() {
  if (!fs.existsSync(dbPath)) {
    const initial = { nextId: SEED.length + 1, incidents: SEED };
    fs.writeFileSync(dbPath, JSON.stringify(initial, null, 2));
    console.log('Database seeded with 10 sample incidents.');
    return initial;
  }
  return JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
}

function save(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

module.exports = { load, save };
