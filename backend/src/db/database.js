const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'incidents.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS incidents (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    incident_date   TEXT    NOT NULL,
    vessel_name     TEXT    NOT NULL,
    vessel_type     TEXT,
    incident_type   TEXT    NOT NULL,
    location        TEXT    NOT NULL,
    coordinates     TEXT,
    description     TEXT    NOT NULL,
    severity        TEXT    NOT NULL CHECK(severity IN ('Low','Medium','High','Critical')),
    status          TEXT    NOT NULL DEFAULT 'Open'
                            CHECK(status IN ('Open','Under Investigation','Resolved','Closed')),
    reported_by     TEXT    NOT NULL,
    casualties      INTEGER NOT NULL DEFAULT 0,
    damage_estimate TEXT,
    created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT    NOT NULL DEFAULT (datetime('now'))
  )
`);

const rowCount = db.prepare('SELECT COUNT(*) AS n FROM incidents').get();
if (rowCount.n === 0) {
  const ins = db.prepare(`
    INSERT INTO incidents
      (incident_date, vessel_name, vessel_type, incident_type, location,
       coordinates, description, severity, status, reported_by, casualties, damage_estimate)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
  `);

  const seed = [
    [
      '2026-01-15', 'MV Atlantic Star', 'Container Ship', 'Collision',
      'Strait of Malacca', '1.2833° N, 103.8607° E',
      'Minor collision with fishing vessel during low visibility conditions. No injuries reported. Damage limited to bow section.',
      'Low', 'Resolved', 'Capt. James Wilson', 0, '$45,000'
    ],
    [
      '2026-02-03', 'SS Northern Light', 'Bulk Carrier', 'Grounding',
      'Gulf of Aden', '12.5° N, 45.0° E',
      'Vessel ran aground on uncharted shoal during night navigation. Hull breach detected in forward compartment. Salvage tug deployed.',
      'High', 'Resolved', 'Capt. Maria Santos', 0, '$2,300,000'
    ],
    [
      '2026-02-18', 'MV Pacific Dream', 'Cruise Ship', 'Fire/Explosion',
      'Caribbean Sea', '18.4° N, 66.1° W',
      'Engine room fire contained within 2 hours by crew. Three crew members treated for minor burns. All 2,400 passengers evacuated to muster stations.',
      'Critical', 'Closed', 'Chief Officer T. Chen', 3, '$850,000'
    ],
    [
      '2026-03-01', 'Tanker Poseidon', 'Oil Tanker', 'Oil Spill',
      'Persian Gulf', '26.5° N, 53.0° E',
      'Minor oil spill occurred during bunkering operations at anchorage. Approximately 500 litres of bunker fuel spilled. Containment booms deployed.',
      'Medium', 'Resolved', 'Capt. Ahmed Al-Rashid', 0, '$120,000'
    ],
    [
      '2026-03-15', 'MV Horizon Runner', 'Container Ship', 'Cargo Damage',
      'Port of Rotterdam', '51.9225° N, 4.4792° E',
      'Stack collapse during rough weather transit. Twelve containers lost overboard, six additional containers damaged. Debris field reported to coastguard.',
      'Medium', 'Under Investigation', 'Port Master R. Dijkstra', 0, '$380,000'
    ],
    [
      '2026-03-28', 'FV Sea Eagle', 'Fishing Vessel', 'Man Overboard',
      'North Sea', '56.0° N, 3.0° E',
      'Crew member fell overboard during net hauling operations. EPIRB activated. Crew member recovered by rescue helicopter after 45 minutes in water. Hypothermia treated onboard.',
      'High', 'Closed', 'Capt. Erik Larsen', 1, '$0'
    ],
    [
      '2026-04-02', 'MV Coral Bay', 'Ferry', 'Equipment Failure',
      'Mediterranean Sea', '35.5° N, 14.5° E',
      'Main engine failure leaving vessel adrift for 8 hours. Auxiliary engines unable to maintain headway. All 340 passengers safe. Towing assistance arranged from Malta.',
      'Medium', 'Resolved', 'Capt. Sophia Greco', 0, '$95,000'
    ],
    [
      '2026-04-10', 'SS Iron Maiden', 'Bulk Carrier', 'Flooding',
      'South China Sea', '10.0° N, 114.0° E',
      'Significant water ingress detected in No.3 cargo hold due to suspected structural failure of shell plating. Emergency pumps deployed. Cargo of iron ore compromised.',
      'High', 'Under Investigation', 'Chief Engineer K. Park', 0, '$1,200,000'
    ],
    [
      '2026-04-12', 'MV Swift Trader', 'Container Ship', 'Navigation Error',
      'English Channel', '51.0° N, 1.5° E',
      'Vessel deviated from Traffic Separation Scheme due to GPS receiver malfunction. Near miss with inbound bulk carrier. VTMS alerted and corrective course taken.',
      'Medium', 'Open', 'Capt. Oliver Brown', 0, '$15,000'
    ],
    [
      '2026-04-14', 'Tanker Gulf Star', 'Chemical Tanker', 'Equipment Failure',
      'Red Sea', '20.0° N, 38.0° E',
      'Cargo pump failure on No.2 tank causing significant delay in discharge operations at Jeddah Islamic Port. No environmental impact. Spare parts flown in.',
      'Low', 'Open', 'Capt. Hassan Al-Khoury', 0, '$25,000'
    ]
  ];

  const insertAll = db.transaction((rows) => {
    for (const row of rows) ins.run(...row);
  });
  insertAll(seed);
  console.log('Database seeded with 10 sample incidents.');
}

module.exports = db;
