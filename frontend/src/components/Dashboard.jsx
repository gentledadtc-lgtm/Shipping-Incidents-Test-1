import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchStats } from '../api/incidents.js';
import './Dashboard.css';

const STATUS_COLORS = {
  'Submitted':       '#ef4444',
  'DPA Ack.':        '#C5A572',
  'Fleet Mgr Review':'#6b7280',
  'Mgmt Review':     '#2563eb',
  'Safety Inv.':     '#d97706',
  'Closed':          '#003366',
};

const CAT_COLORS = {
  'Grounding':                 '#dc2626',
  'Collision':                 '#7c3aed',
  'Fire / Explosion':          '#ea580c',
  'Crew Injury':               '#0891b2',
  'Cargo Damage':              '#16a34a',
  'Pollution / Spill':         '#2563eb',
  'Loss of Power / Blackout':  '#9333ea',
  'Near Miss':                 '#ca8a04',
  'Security Incident':         '#be185d',
  'Weather Damage':            '#0369a1',
  'Navigation Incident':       '#15803d',
  'Equipment Failure':         '#b45309',
  'Environmental / Inspection':'#065f46',
  'Other':                     '#6b7280',
};

function statusBadgeClass(s) {
  const map = { 'Submitted':'submitted','DPA Ack.':'dpaack','Fleet Mgr Review':'fleetmgr','Mgmt Review':'mgmt','Safety Inv.':'safety','Closed':'closed' };
  return map[s] || 'submitted';
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function Dashboard() {
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats()
      .then(setStats)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-state"><div className="spinner" /><span>Loading dashboard…</span></div>;
  if (error)   return <div className="error-state"><span className="error-icon">&#9888;</span><span>{error}</span></div>;

  const maxType  = Math.max(...stats.byType.map(x => x.count), 1);
  const maxFleet = Math.max(...stats.byFleet.map(x => x.count), 1);

  return (
    <div className="dashboard">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Scorpio Group — Shipping Incident Management</p>
        </div>
        <Link to="/incidents/new" className="btn btn-primary">+ Report New Incident</Link>
      </div>

      {/* Stat cards */}
      <div className="stats-grid">
        <div className="stat-card stat-total">
          <div className="stat-label">Total Incidents</div>
          <div className="stat-value">{stats.total}</div>
        </div>
        <div className="stat-card stat-open">
          <div className="stat-label">Open</div>
          <div className="stat-value">{stats.open}</div>
          <div className="stat-sub">active</div>
        </div>
        <div className="stat-card stat-closed">
          <div className="stat-label">Closed</div>
          <div className="stat-value">{stats.closed}</div>
        </div>
        <div className="stat-card stat-oil">
          <div className="stat-label">Oil Major Pending</div>
          <div className="stat-value">{stats.oilPend}</div>
          <div className="stat-sub">not yet notified</div>
        </div>
        <div className="stat-card stat-submitted">
          <div className="stat-label">Newly Submitted</div>
          <div className="stat-value">{stats.submitted}</div>
        </div>
      </div>

      <div className="dashboard-lower">
        {/* Recent incidents table */}
        <div className="card recent-card">
          <div className="card-header">
            <h2 className="card-title">Recent Incidents</h2>
            <Link to="/incidents" className="card-link">View all &rarr;</Link>
          </div>
          {stats.recent.length === 0 ? (
            <div className="empty-state">No incidents reported yet.</div>
          ) : (
            <div className="recent-table-wrap">
              <table className="recent-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Vessel</th>
                    <th>Fleet</th>
                    <th>Type</th>
                    <th>Event Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recent.map(inc => (
                    <tr key={inc.id} onClick={() => navigate(`/incidents/${inc.id}`)} className="clickable-row">
                      <td className="id-cell">#{inc.id}</td>
                      <td className="vessel-cell">{inc.vessel_name}</td>
                      <td className="muted-cell">{inc.fleet || '—'}</td>
                      <td>{inc.incident_type}</td>
                      <td className="nowrap">{formatDate(inc.date_of_event)}</td>
                      <td><span className={`badge badge-${statusBadgeClass(inc.status)}`}>{inc.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Breakdown sidebar */}
        <div className="breakdown-col">
          {/* By Status */}
          <div className="card breakdown-card">
            <h2 className="card-title">By Status</h2>
            <div className="breakdown-list">
              {stats.byStatus.map(item => {
                const pct = stats.total ? Math.round((item.count / stats.total) * 100) : 0;
                const col = STATUS_COLORS[item.status] || '#6b7280';
                return (
                  <div key={item.status} className="breakdown-row">
                    <span className="breakdown-lbl" style={{ color: col }}>{item.status}</span>
                    <div className="breakdown-bar-wrap">
                      <div className="breakdown-bar" style={{ width: `${pct}%`, background: col }} />
                    </div>
                    <span className="breakdown-count">{item.count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* By Fleet */}
          <div className="card breakdown-card">
            <h2 className="card-title">By Fleet</h2>
            <div className="breakdown-list">
              {stats.byFleet.map(item => {
                const pct = maxFleet ? Math.round((item.count / maxFleet) * 100) : 0;
                return (
                  <div key={item.fleet} className="breakdown-row">
                    <span className="breakdown-lbl" style={{ color: 'var(--navy)' }}>{item.fleet}</span>
                    <div className="breakdown-bar-wrap">
                      <div className="breakdown-bar" style={{ width: `${pct}%`, background: 'var(--gold)' }} />
                    </div>
                    <span className="breakdown-count">{item.count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* By Incident Type */}
          <div className="card breakdown-card">
            <h2 className="card-title">By Type</h2>
            <div className="breakdown-list type-list">
              {stats.byType.slice(0, 8).map(item => {
                const col = CAT_COLORS[item.incident_type] || '#6b7280';
                const pct = maxType ? Math.round((item.count / maxType) * 100) : 0;
                return (
                  <div key={item.incident_type} className="breakdown-row">
                    <span className="breakdown-lbl type-lbl">{item.incident_type}</span>
                    <div className="breakdown-bar-wrap">
                      <div className="breakdown-bar" style={{ width: `${pct}%`, background: col }} />
                    </div>
                    <span className="breakdown-count">{item.count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
