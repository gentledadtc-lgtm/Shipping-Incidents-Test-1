const express = require('express');
const router  = express.Router();
const { load, save } = require('../db/database');

function now() { return new Date().toISOString(); }

function applyFilters(incidents, query) {
  let list = [...incidents];
  const { search, severity, status, incident_type, date_from, date_to } = query;

  if (search) {
    const t = search.toLowerCase();
    list = list.filter(i =>
      (i.vessel_name    || '').toLowerCase().includes(t) ||
      (i.location       || '').toLowerCase().includes(t) ||
      (i.reported_by    || '').toLowerCase().includes(t) ||
      (i.description    || '').toLowerCase().includes(t) ||
      (i.incident_type  || '').toLowerCase().includes(t)
    );
  }
  if (severity)      list = list.filter(i => i.severity === severity);
  if (status)        list = list.filter(i => i.status === status);
  if (incident_type) list = list.filter(i => i.incident_type === incident_type);
  if (date_from)     list = list.filter(i => i.incident_date >= date_from);
  if (date_to)       list = list.filter(i => i.incident_date <= date_to);

  return list.sort((a, b) =>
    b.incident_date.localeCompare(a.incident_date) || b.id - a.id
  );
}

// GET /api/incidents/stats
router.get('/stats', (req, res) => {
  const { incidents } = load();

  const total    = incidents.length;
  const open     = incidents.filter(i => i.status === 'Open').length;
  const critical = incidents.filter(i => i.severity === 'Critical').length;
  const resolved = incidents.filter(i => i.status === 'Resolved').length;
  const underInv = incidents.filter(i => i.status === 'Under Investigation').length;

  const severityOrder = ['Critical','High','Medium','Low'];
  const bySeverity = severityOrder
    .map(s => ({ severity: s, count: incidents.filter(i => i.severity === s).length }))
    .filter(x => x.count > 0);

  const typeMap = {};
  incidents.forEach(i => { typeMap[i.incident_type] = (typeMap[i.incident_type] || 0) + 1; });
  const byType = Object.entries(typeMap)
    .map(([incident_type, count]) => ({ incident_type, count }))
    .sort((a, b) => b.count - a.count);

  const recent = [...incidents]
    .sort((a, b) => b.incident_date.localeCompare(a.incident_date) || b.id - a.id)
    .slice(0, 5);

  res.json({ total, open, critical, resolved, underInv, bySeverity, byType, recent });
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
    incident_date, vessel_name, vessel_type, incident_type,
    location, coordinates, description, severity, status,
    reported_by, casualties, damage_estimate
  } = req.body;

  if (!incident_date || !vessel_name || !incident_type || !location || !description || !severity || !reported_by) {
    return res.status(400).json({ error: 'Missing required fields: incident_date, vessel_name, incident_type, location, description, severity, reported_by' });
  }

  const db = load();
  const incident = {
    id:              db.nextId++,
    incident_date,
    vessel_name,
    vessel_type:     vessel_type     || null,
    incident_type,
    location,
    coordinates:     coordinates     || null,
    description,
    severity,
    status:          status          || 'Open',
    reported_by,
    casualties:      casualties !== undefined ? Number(casualties) : 0,
    damage_estimate: damage_estimate || null,
    created_at:      now(),
    updated_at:      now(),
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
  const updated  = {
    ...existing,
    ...Object.fromEntries(
      Object.entries(req.body).filter(([, v]) => v !== undefined)
    ),
    id:         existing.id,
    updated_at: now(),
  };
  if (req.body.casualties !== undefined) updated.casualties = Number(req.body.casualties);

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
