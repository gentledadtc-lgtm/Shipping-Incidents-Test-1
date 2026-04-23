import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchIncidents } from '../api/incidents.js';
import './IncidentList.css';

const INCIDENT_TYPES = [
  'Grounding', 'Collision', 'Fire / Explosion', 'Crew Injury', 'Cargo Damage',
  'Pollution / Spill', 'Loss of Power / Blackout', 'Near Miss', 'Security Incident',
  'Weather Damage', 'Navigation Incident', 'Equipment Failure',
  'Environmental / Inspection', 'Other',
];

const STATUSES = [
  'Submitted', 'DPA Ack.', 'Fleet Mgr Review', 'Mgmt Review', 'Safety Inv.', 'Closed',
];

const FLEETS = ['Fleet A', 'Fleet B', 'Fleet C', 'Fleet D', 'Fleet E'];

const PAGE_SIZE = 15;

function statusBadgeClass(s) {
  const map = {
    'Submitted':       'submitted',
    'DPA Ack.':        'dpaack',
    'Fleet Mgr Review':'fleetmgr',
    'Mgmt Review':     'mgmt',
    'Safety Inv.':     'safety',
    'Closed':          'closed',
  };
  return map[s] || 'submitted';
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

const EMPTY_FILTERS = { search: '', status: '', incident_type: '', fleet: '', date_from: '', date_to: '' };

export default function IncidentList() {
  const [incidents, setIncidents] = useState([]);
  const [filters, setFilters]     = useState(EMPTY_FILTERS);
  const [applied, setApplied]     = useState(EMPTY_FILTERS);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [page, setPage]           = useState(1);
  const navigate = useNavigate();

  const load = useCallback((f) => {
    setLoading(true);
    setError(null);
    fetchIncidents(f)
      .then(data => { setIncidents(data); setPage(1); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(applied); }, [applied, load]);

  function handleChange(e) {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  }
  function handleApply(e) { e.preventDefault(); setApplied(filters); }
  function handleReset() { setFilters(EMPTY_FILTERS); setApplied(EMPTY_FILTERS); }

  const totalPages = Math.max(1, Math.ceil(incidents.length / PAGE_SIZE));
  const paged      = incidents.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="incident-list-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Incident History</h1>
          <p className="page-subtitle">{incidents.length} incident{incidents.length !== 1 ? 's' : ''} found</p>
        </div>
        <Link to="/incidents/new" className="btn btn-primary">+ Report Incident</Link>
      </div>

      {/* Filters */}
      <div className="card filter-card">
        <form className="filter-form" onSubmit={handleApply}>
          <div className="filter-row">
            <div className="filter-field filter-search">
              <label>Search</label>
              <input type="text" name="search" value={filters.search} onChange={handleChange}
                placeholder="Vessel, location, charterer, type…" />
            </div>
            <div className="filter-field">
              <label>Status</label>
              <select name="status" value={filters.status} onChange={handleChange}>
                <option value="">All</option>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="filter-field">
              <label>Type</label>
              <select name="incident_type" value={filters.incident_type} onChange={handleChange}>
                <option value="">All</option>
                {INCIDENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="filter-field">
              <label>Fleet</label>
              <select name="fleet" value={filters.fleet} onChange={handleChange}>
                <option value="">All Fleets</option>
                {FLEETS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div className="filter-field">
              <label>Event Date From</label>
              <input type="date" name="date_from" value={filters.date_from} onChange={handleChange} />
            </div>
            <div className="filter-field">
              <label>Event Date To</label>
              <input type="date" name="date_to" value={filters.date_to} onChange={handleChange} />
            </div>
          </div>
          <div className="filter-actions">
            <button type="submit" className="btn btn-primary">Apply</button>
            <button type="button" className="btn btn-secondary" onClick={handleReset}>Reset</button>
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="card table-card">
        {loading ? (
          <div className="loading-state"><div className="spinner" /><span>Loading incidents…</span></div>
        ) : error ? (
          <div className="error-state"><span className="error-icon">&#9888;</span><span>{error}</span></div>
        ) : incidents.length === 0 ? (
          <div className="empty-state">
            <span style={{ fontSize: '2rem' }}>&#128196;</span>
            <span>No incidents match your filters.</span>
            <button className="btn btn-secondary" onClick={handleReset}>Clear filters</button>
          </div>
        ) : (
          <>
            <div className="table-wrap">
              <table className="incidents-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Vessel</th>
                    <th>Event Date</th>
                    <th>Report Date</th>
                    <th>Δ Days</th>
                    <th>Type</th>
                    <th>Location</th>
                    <th>Fleet</th>
                    <th>Charterer</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map(inc => (
                    <tr key={inc.id} className="clickable-row" onClick={() => navigate(`/incidents/${inc.id}`)}>
                      <td className="id-cell">#{inc.id}</td>
                      <td className="vessel-cell">{inc.vessel_name}</td>
                      <td className="nowrap">{formatDate(inc.date_of_event)}</td>
                      <td className="nowrap">{formatDate(inc.date_of_reporting)}</td>
                      <td className="diff-cell">{inc.days_diff != null ? inc.days_diff : '—'}</td>
                      <td className="type-cell">{inc.incident_type}</td>
                      <td className="location-cell">{inc.location}</td>
                      <td className="nowrap">{inc.fleet || '—'}</td>
                      <td>{inc.charterer || '—'}</td>
                      <td>
                        <span className={`badge badge-${statusBadgeClass(inc.status)}`}>{inc.status}</span>
                      </td>
                      <td onClick={e => e.stopPropagation()}>
                        <Link to={`/incidents/${inc.id}`} className="btn btn-secondary btn-sm">View</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <span className="page-info">
                  Page {page} of {totalPages} &nbsp;&middot;&nbsp; {incidents.length} total
                </span>
                <div className="page-btns">
                  <button className="btn btn-secondary btn-sm" disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}>&#8592; Prev</button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                    .reduce((acc, p, idx, arr) => {
                      if (idx > 0 && p - arr[idx - 1] > 1) acc.push('…');
                      acc.push(p); return acc;
                    }, [])
                    .map((p, i) =>
                      p === '…'
                        ? <span key={`d${i}`} className="page-dot">…</span>
                        : <button key={p} className={`btn btn-sm ${p === page ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setPage(p)}>{p}</button>
                    )}
                  <button className="btn btn-secondary btn-sm" disabled={page === totalPages}
                    onClick={() => setPage(p => p + 1)}>Next &#8594;</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
