const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET /api/incidents/stats  — must come before /:id
router.get('/stats', (req, res) => {
  const total    = db.prepare('SELECT COUNT(*) AS n FROM incidents').get().n;
  const open     = db.prepare("SELECT COUNT(*) AS n FROM incidents WHERE status = 'Open'").get().n;
  const critical = db.prepare("SELECT COUNT(*) AS n FROM incidents WHERE severity = 'Critical'").get().n;
  const resolved = db.prepare("SELECT COUNT(*) AS n FROM incidents WHERE status = 'Resolved'").get().n;
  const underInv = db.prepare("SELECT COUNT(*) AS n FROM incidents WHERE status = 'Under Investigation'").get().n;

  const bySeverity = db.prepare(
    "SELECT severity, COUNT(*) AS count FROM incidents GROUP BY severity ORDER BY CASE severity WHEN 'Critical' THEN 1 WHEN 'High' THEN 2 WHEN 'Medium' THEN 3 ELSE 4 END"
  ).all();

  const byType = db.prepare(
    "SELECT incident_type, COUNT(*) AS count FROM incidents GROUP BY incident_type ORDER BY count DESC"
  ).all();

  const recent = db.prepare(
    'SELECT * FROM incidents ORDER BY incident_date DESC, id DESC LIMIT 5'
  ).all();

  res.json({ total, open, critical, resolved, underInv, bySeverity, byType, recent });
});

// GET /api/incidents
router.get('/', (req, res) => {
  const { search, severity, status, incident_type, date_from, date_to } = req.query;

  let sql = 'SELECT * FROM incidents WHERE 1=1';
  const params = [];

  if (search) {
    sql += ' AND (vessel_name LIKE ? OR location LIKE ? OR reported_by LIKE ? OR description LIKE ? OR incident_type LIKE ?)';
    const term = `%${search}%`;
    params.push(term, term, term, term, term);
  }
  if (severity)      { sql += ' AND severity = ?';      params.push(severity); }
  if (status)        { sql += ' AND status = ?';        params.push(status); }
  if (incident_type) { sql += ' AND incident_type = ?'; params.push(incident_type); }
  if (date_from)     { sql += ' AND incident_date >= ?'; params.push(date_from); }
  if (date_to)       { sql += ' AND incident_date <= ?'; params.push(date_to); }

  sql += ' ORDER BY incident_date DESC, id DESC';

  const incidents = db.prepare(sql).all(...params);
  res.json(incidents);
});

// GET /api/incidents/:id
router.get('/:id', (req, res) => {
  const incident = db.prepare('SELECT * FROM incidents WHERE id = ?').get(req.params.id);
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

  const result = db.prepare(`
    INSERT INTO incidents
      (incident_date, vessel_name, vessel_type, incident_type, location, coordinates,
       description, severity, status, reported_by, casualties, damage_estimate, updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,datetime('now'))
  `).run(
    incident_date, vessel_name, vessel_type || null, incident_type,
    location, coordinates || null, description, severity,
    status || 'Open', reported_by,
    casualties !== undefined ? casualties : 0,
    damage_estimate || null
  );

  const created = db.prepare('SELECT * FROM incidents WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(created);
});

// PUT /api/incidents/:id
router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM incidents WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Incident not found' });

  const {
    incident_date, vessel_name, vessel_type, incident_type,
    location, coordinates, description, severity, status,
    reported_by, casualties, damage_estimate
  } = req.body;

  db.prepare(`
    UPDATE incidents SET
      incident_date   = ?,
      vessel_name     = ?,
      vessel_type     = ?,
      incident_type   = ?,
      location        = ?,
      coordinates     = ?,
      description     = ?,
      severity        = ?,
      status          = ?,
      reported_by     = ?,
      casualties      = ?,
      damage_estimate = ?,
      updated_at      = datetime('now')
    WHERE id = ?
  `).run(
    incident_date   ?? existing.incident_date,
    vessel_name     ?? existing.vessel_name,
    vessel_type     !== undefined ? vessel_type     : existing.vessel_type,
    incident_type   ?? existing.incident_type,
    location        ?? existing.location,
    coordinates     !== undefined ? coordinates     : existing.coordinates,
    description     ?? existing.description,
    severity        ?? existing.severity,
    status          ?? existing.status,
    reported_by     ?? existing.reported_by,
    casualties      !== undefined ? casualties      : existing.casualties,
    damage_estimate !== undefined ? damage_estimate : existing.damage_estimate,
    req.params.id
  );

  const updated = db.prepare('SELECT * FROM incidents WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// DELETE /api/incidents/:id
router.delete('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM incidents WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Incident not found' });
  db.prepare('DELETE FROM incidents WHERE id = ?').run(req.params.id);
  res.json({ message: 'Incident deleted successfully' });
});

module.exports = router;
