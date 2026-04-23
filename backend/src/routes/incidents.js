const express = require('express');
const router  = express.Router();
const { load, save } = require('../db/database');

function now() { return new Date().toISOString(); }

function calcDaysDiff(eventDate, reportDate) {
  if (!eventDate || !reportDate) return null;
  const diff = Math.round((new Date(reportDate) - new Date(eventDate)) / 86400000);
  return diff >= 0 ? diff : null;
}

function applyFilters(incidents, query) {
  let list = [...incidents];
  const { search, status, incident_type, fleet, date_from, date_to } = query;

  if (search) {
    const t = search.toLowerCase();
    list = list.filter(i =>
      (i.vessel_name    || '').toLowerCase().includes(t) ||
      (i.location       || '').toLowerCase().includes(t) ||
      (i.charterer      || '').toLowerCase().includes(t) ||
      (i.nature         || '').toLowerCase().includes(t) ||
      (i.incident_type  || '').toLowerCase().includes(t)
    );
  }
  if (status)        list = list.filter(i => i.status === status);
  if (incident_type) list = list.filter(i => i.incident_type === incident_type);
  if (fleet)         list = list.filter(i => i.fleet === fleet);
  if (date_from)     list = list.filter(i => i.date_of_event >= date_from);
  if (date_to)       list = list.filter(i => i.date_of_event <= date_to);

  return list.sort((a, b) =>
    (b.date_of_reporting || '').localeCompare(a.date_of_reporting || '') || b.id - a.id
  );
}

// GET /api/incidents/stats
router.get('/stats', (req, res) => {
  const { incidents } = load();

  const total     = incidents.length;
  const open      = incidents.filter(i => i.status !== 'Closed').length;
  const closed    = incidents.filter(i => i.status === 'Closed').length;
  const oilPend   = incidents.filter(i => i.oil_informed !== 'Yes' && i.status !== 'Closed').length;
  const submitted = incidents.filter(i => i.status === 'Submitted').length;

  const STATUSES = ['Submitted', 'DPA Ack.', 'Fleet Mgr Review', 'Mgmt Review', 'Safety Inv.', 'Closed'];
  const byStatus = STATUSES.map(s => ({
    status: s,
    count: incidents.filter(i => i.status === s).length,
  }));

  const FLEETS = ['Fleet A', 'Fleet B', 'Fleet C', 'Fleet D', 'Fleet E'];
  const byFleet = FLEETS.map(f => ({
    fleet: f,
    count: incidents.filter(i => i.fleet === f).length,
  }));

  const typeMap = {};
  incidents.forEach(i => { typeMap[i.incident_type] = (typeMap[i.incident_type] || 0) + 1; });
  const byType = Object.entries(typeMap)
    .map(([incident_type, count]) => ({ incident_type, count }))
    .sort((a, b) => b.count - a.count);

  const recent = [...incidents]
    .sort((a, b) => (b.date_of_reporting || '').localeCompare(a.date_of_reporting || '') || b.id - a.id)
    .slice(0, 6);

  res.json({ total, open, closed, oilPend, submitted, byStatus, byFleet, byType, recent });
});

// GET /api/incidents
router.get('/', (req, res) => {
  const { incidents } = load();
  res.json(applyFilters(incidents, req.query));
});

// GET /api/incidents/:id
router.get('/:id', (req, res) => {
  const { incidents } = load();
  const incident = incidents.find(i => i.id === Number(req.params.id));
  if (!incident) return res.status(404).json({ error: 'Incident not found' });
  res.json(incident);
});

// POST /api/incidents
router.post('/', (req, res) => {
  const {
    vessel_name, date_of_event, date_of_reporting,
    incident_type, location, charterer, cargo,
    last_port, next_port, nature, action_plan,
    oil_informed, oil_which, follow_up, status, fleet,
  } = req.body;

  if (!vessel_name || !date_of_event || !date_of_reporting || !incident_type || !location || !nature || !action_plan) {
    return res.status(400).json({
      error: 'Missing required fields: vessel_name, date_of_event, date_of_reporting, incident_type, location, nature, action_plan',
    });
  }

  const db = load();
  const incident = {
    id:                db.nextId++,
    vessel_name,
    date_of_event,
    date_of_reporting,
    days_diff:         calcDaysDiff(date_of_event, date_of_reporting),
    incident_type,
    location,
    charterer:         charterer   || '',
    cargo:             cargo       || '',
    last_port:         last_port   || '',
    next_port:         next_port   || '',
    nature,
    action_plan,
    oil_informed:      oil_informed || '',
    oil_which:         oil_which    || '',
    follow_up:         follow_up    || '',
    status:            status       || 'Submitted',
    fleet:             fleet        || '',
    created_at:        now(),
    updated_at:        now(),
  };
  db.incidents.push(incident);
  save(db);
  res.status(201).json(incident);
});

// PUT /api/incidents/:id
router.put('/:id', (req, res) => {
  const db = load();
  const idx = db.incidents.findIndex(i => i.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Incident not found' });

  const existing = db.incidents[idx];
  const body     = { ...req.body };
  delete body.id;
  delete body.created_at;

  const updated = { ...existing, ...body, id: existing.id, updated_at: now() };

  // Recalculate days_diff if dates changed
  const eventDate  = updated.date_of_event;
  const reportDate = updated.date_of_reporting;
  updated.days_diff = calcDaysDiff(eventDate, reportDate);

  db.incidents[idx] = updated;
  save(db);
  res.json(updated);
});

// DELETE /api/incidents/:id
router.delete('/:id', (req, res) => {
  const db = load();
  const idx = db.incidents.findIndex(i => i.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Incident not found' });
  db.incidents.splice(idx, 1);
  save(db);
  res.json({ message: 'Incident deleted successfully' });
});

module.exports = router;
