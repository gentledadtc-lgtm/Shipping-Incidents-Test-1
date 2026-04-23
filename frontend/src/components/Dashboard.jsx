import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchStats } from '../api/incidents.js';
import './Dashboard.css';

function severityClass(s) {
  return { Low: 'low', Medium: 'medium', High: 'high', Critical: 'critical' }[s] || 'medium';
}
function statusClass(s) {
  if (s === 'Open') return 'open';
  if (s === 'Under Investigation') return 'inv';
  if (s === 'Resolved') return 'res';
  return 'closed';
}
function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats()
      .then(setStats)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="loading-state"><div className="spinner" /><span>Loading dashboard…</span></div>
  );
  if (error) return (
    <div className="error-state"><span className="error-icon">&#9888;</span><span>{error}</span></div>
  );

  const severityOrder = ['Critical', 'High', 'Medium', 'Low'];

  return (
    <div className="dashboard">
      <div className="page-header">
        <div>
          <h1 className="page-title">INCIDENTS &mdash; Test 1</h1>
          <p className="page-subtitle">Shipping incident reporting &amp; management system</p>
        </div>
        <Link to="/incidents/new" className="btn btn-primary">+ Report New Incident</Link>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card stat-total">
          <div className="stat-label">Total Incidents</div>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-icon">&#128196;</div>
        </div>
        <div className="stat-card stat-open">
          <div className="stat-label">Open</div>
          <div className="stat-value">{stats.open}</div>
          <div className="stat-icon">&#128280;</div>
        </div>
        <div className="stat-card stat-critical">
          <div className="stat-label">Critical</div>
          <div className="stat-value">{stats.critical}</div>
          <div className="stat-icon">&#9888;</div>
        </div>
        <div className="stat-card stat-resolved">
          <div className="stat-label">Resolved</div>
          <div className="stat-value">{stats.resolved}</div>
          <div className="stat-icon">&#10003;</div>
        </div>
        <div className="stat-card stat-inv">
          <div className="stat-label">Under Investigation</div>
          <div className="stat-value">{stats.underInv}</div>
          <div className="stat-icon">&#128270;</div>
        </div>
      </div>

      <div className="dashboard-lower">
        {/* Recent Incidents */}
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
                    <th>ID</th>
                    <th>Date</th>
                    <th>Vessel</th>
                    <th>Type</th>
                    <th>Severity</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recent.map(inc => (
                    <tr key={inc.id} onClick={() => navigate(`/incidents/${inc.id}`)} className="clickable-row">
                      <td className="id-cell">#{inc.id}</td>
                      <td>{formatDate(inc.incident_date)}</td>
                      <td className="vessel-cell">{inc.vessel_name}</td>
                      <td>{inc.incident_type}</td>
                      <td><span className={`badge badge-${severityClass(inc.severity)}`}>{inc.severity}</span></td>
                      <td><span className={`badge badge-${statusClass(inc.status)}`}>{inc.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Breakdown sidebar */}
        <div className="breakdown-col">
          {/* By Severity */}
          <div className="card breakdown-card">
            <h2 className="card-title">By Severity</h2>
            <div className="breakdown-list">
              {severityOrder.map(sev => {
                const item = stats.bySeverity.find(x => x.severity === sev);
                const count = item ? item.count : 0;
                const pct   = stats.total ? Math.round((count / stats.total) * 100) : 0;
                return (
                  <div key={sev} className="breakdown-row">
                    <span className={`breakdown-label badge badge-${sev.toLowerCase()}`}>{sev}</span>
                    <div className="breakdown-bar-wrap">
                      <div className={`breakdown-bar bar-${sev.toLowerCase()}`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="breakdown-count">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* By Type */}
          <div className="card breakdown-card">
            <h2 className="card-title">By Incident Type</h2>
            <div className="breakdown-list type-list">
              {stats.byType.slice(0, 6).map(item => (
                <div key={item.incident_type} className="type-row">
                  <span className="type-name">{item.incident_type}</span>
                  <span className="type-count">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
