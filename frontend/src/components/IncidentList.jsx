import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchIncidents } from '../api/incidents.js';
import './IncidentList.css';

const INCIDENT_TYPES = [
  'Collision','Grounding','Fire/Explosion','Flooding','Cargo Damage',
  'Equipment Failure','Man Overboard','Oil Spill','Navigation Error','Piracy','Other',
];

const PAGE_SIZE = 10;

function severityClass(s) {
  return { Low:'low', Medium:'medium', High:'high', Critical:'critical' }[s] || 'medium';
}
function statusClass(s) {
  if (s === 'Open') return 'open';
  if (s === 'Under Investigation') return 'inv';
  if (s === 'Resolved') return 'res';
  return 'closed';
}
function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });
}

const EMPTY_FILTERS = {
  search: '', severity: '', status: '', incident_type: '', date_from: '', date_to: '',
};

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

  function handleApply(e) {
    e.preventDefault();
    setApplied(filters);
  }

  function handleReset() {
    setFilters(EMPTY_FILTERS);
    setApplied(EMPTY_FILTERS);
  }

  const totalPages = Math.max(1, Math.ceil(incidents.length / PAGE_SIZE));
  const paged = incidents.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleChange}
                placeholder="Vessel, location, type, reporter…"
              />
            </div>
            <div className="filter-field">
              <label>Severity</label>
              <select name="severity" value={filters.severity} onChange={handleChange}>
                <option value="">All</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
            <div className="filter-field">
              <label>Status</label>
              <select name="status" value={filters.status} onChange={handleChange}>
                <option value="">All</option>
                <option value="Open">Open</option>
                <option value="Under Investigation">Under Investigation</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
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
              <label>Date From</label>
              <input type="date" name="date_from" value={filters.date_from} onChange={handleChange} />
            </div>
            <div className="filter-field">
              <label>Date To</label>
              <input type="date" name="date_to" value={filters.date_to} onChange={handleChange} />
            </div>
          </div>
          <div className="filter-actions">
            <button type="submit" className="btn btn-primary">Apply Filters</button>
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
                    <th>ID</th>
                    <th>Date</th>
                    <th>Vessel</th>
                    <th>Type</th>
                    <th>Location</th>
                    <th>Severity</th>
                    <th>Status</th>
                    <th>Reported By</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map(inc => (
                    <tr
                      key={inc.id}
                      className="clickable-row"
                      onClick={() => navigate(`/incidents/${inc.id}`)}
                    >
                      <td className="id-cell">#{inc.id}</td>
                      <td className="nowrap">{formatDate(inc.incident_date)}</td>
                      <td className="vessel-cell">{inc.vessel_name}</td>
                      <td>{inc.incident_type}</td>
                      <td className="location-cell">{inc.location}</td>
                      <td><span className={`badge badge-${severityClass(inc.severity)}`}>{inc.severity}</span></td>
                      <td><span className={`badge badge-${statusClass(inc.status)}`}>{inc.status}</span></td>
                      <td>{inc.reported_by}</td>
                      <td onClick={e => e.stopPropagation()}>
                        <Link
                          to={`/incidents/${inc.id}`}
                          className="btn btn-secondary btn-sm"
                        >View</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <span className="page-info">
                  Page {page} of {totalPages} &nbsp;&middot;&nbsp; {incidents.length} total
                </span>
                <div className="page-btns">
                  <button
                    className="btn btn-secondary btn-sm"
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                  >&#8592; Prev</button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                    .reduce((acc, p, idx, arr) => {
                      if (idx > 0 && p - arr[idx - 1] > 1) acc.push('…');
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((p, i) =>
                      p === '…'
                        ? <span key={`dot-${i}`} className="page-dot">…</span>
                        : <button
                            key={p}
                            className={`btn btn-sm ${p === page ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setPage(p)}
                          >{p}</button>
                    )
                  }
                  <button
                    className="btn btn-secondary btn-sm"
                    disabled={page === totalPages}
                    onClick={() => setPage(p => p + 1)}
                  >Next &#8594;</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
