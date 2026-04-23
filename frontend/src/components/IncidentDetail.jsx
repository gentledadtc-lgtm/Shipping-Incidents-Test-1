import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchIncident, deleteIncident } from '../api/incidents.js';
import './IncidentDetail.css';

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
  return new Date(d).toLocaleDateString('en-GB', { weekday:'long', day:'2-digit', month:'long', year:'numeric' });
}
function formatDateTime(d) {
  if (!d) return '—';
  const dt = new Date(d + (d.includes('T') ? '' : 'Z'));
  return dt.toLocaleString('en-GB', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
}

function DetailField({ label, value, wide }) {
  return (
    <div className={`detail-field${wide ? ' detail-field-wide' : ''}`}>
      <span className="detail-label">{label}</span>
      <span className="detail-value">{value || '—'}</span>
    </div>
  );
}

export default function IncidentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [incident, setIncident] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    fetchIncident(id)
      .then(setIncident)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleDelete() {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setDeleting(true);
    try {
      await deleteIncident(id);
      navigate('/incidents');
    } catch (e) {
      setError(e.message);
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  if (loading) return (
    <div className="loading-state"><div className="spinner" /><span>Loading incident…</span></div>
  );
  if (error) return (
    <div className="error-state"><span className="error-icon">&#9888;</span><span>{error}</span><Link to="/incidents" className="btn btn-secondary">Back to List</Link></div>
  );
  if (!incident) return null;

  return (
    <div className="incident-detail-page">
      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <Link to="/">Dashboard</Link>
        <span className="bc-sep">›</span>
        <Link to="/incidents">Incidents</Link>
        <span className="bc-sep">›</span>
        <span>#{incident.id}</span>
      </nav>

      {/* Header */}
      <div className="detail-header card">
        <div className="detail-header-main">
          <div className="detail-id">Incident #{incident.id}</div>
          <h1 className="detail-vessel">{incident.vessel_name}</h1>
          <div className="detail-meta">
            <span>{incident.vessel_type || 'Vessel'}</span>
            <span className="meta-sep">·</span>
            <span>{incident.incident_type}</span>
            <span className="meta-sep">·</span>
            <span>{formatDate(incident.incident_date)}</span>
          </div>
        </div>
        <div className="detail-header-badges">
          <span className={`badge badge-${severityClass(incident.severity)} badge-lg`}>
            {incident.severity}
          </span>
          <span className={`badge badge-${statusClass(incident.status)} badge-lg`}>
            {incident.status}
          </span>
        </div>
      </div>

      {/* Main content */}
      <div className="detail-body">
        <div className="detail-main">
          {/* Location */}
          <div className="card detail-section">
            <h2 className="section-heading">&#127758;&nbsp; Location</h2>
            <div className="detail-grid">
              <DetailField label="Location" value={incident.location} />
              {incident.coordinates && (
                <DetailField label="Coordinates" value={incident.coordinates} />
              )}
            </div>
          </div>

          {/* Description */}
          <div className="card detail-section">
            <h2 className="section-heading">&#128196;&nbsp; Description</h2>
            <p className="description-text">{incident.description}</p>
          </div>

          {/* Response */}
          <div className="card detail-section">
            <h2 className="section-heading">&#128270;&nbsp; Response &amp; Impact</h2>
            <div className="detail-grid">
              <DetailField label="Reported By" value={incident.reported_by} />
              <DetailField label="Casualties" value={incident.casualties === 0 ? 'None' : incident.casualties} />
              <DetailField label="Damage Estimate" value={incident.damage_estimate} />
            </div>
          </div>

          {/* Record info */}
          <div className="card detail-section">
            <h2 className="section-heading">&#128336;&nbsp; Record Information</h2>
            <div className="detail-grid">
              <DetailField label="Created" value={formatDateTime(incident.created_at)} />
              <DetailField label="Last Updated" value={formatDateTime(incident.updated_at)} />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="detail-sidebar">
          <div className="card sidebar-card">
            <h2 className="sidebar-heading">Quick Info</h2>
            <div className="sidebar-rows">
              <div className="sidebar-row">
                <span className="sidebar-label">Incident ID</span>
                <span className="sidebar-value mono">#{incident.id}</span>
              </div>
              <div className="sidebar-row">
                <span className="sidebar-label">Severity</span>
                <span className={`badge badge-${severityClass(incident.severity)}`}>{incident.severity}</span>
              </div>
              <div className="sidebar-row">
                <span className="sidebar-label">Status</span>
                <span className={`badge badge-${statusClass(incident.status)}`}>{incident.status}</span>
              </div>
              <div className="sidebar-row">
                <span className="sidebar-label">Type</span>
                <span className="sidebar-value">{incident.incident_type}</span>
              </div>
              <div className="sidebar-row">
                <span className="sidebar-label">Date</span>
                <span className="sidebar-value">{incident.incident_date}</span>
              </div>
              <div className="sidebar-row">
                <span className="sidebar-label">Vessel Type</span>
                <span className="sidebar-value">{incident.vessel_type || '—'}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="card sidebar-card">
            <h2 className="sidebar-heading">Actions</h2>
            <div className="action-btns">
              <Link to={`/incidents/${incident.id}/edit`} className="btn btn-primary action-btn">
                &#9998;&nbsp; Edit Incident
              </Link>
              <button
                className="btn btn-danger action-btn"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting
                  ? 'Deleting…'
                  : confirmDelete
                  ? '&#10006; Confirm Delete'
                  : '&#128465;&nbsp; Delete Incident'}
              </button>
              {confirmDelete && !deleting && (
                <button
                  className="btn btn-secondary action-btn"
                  onClick={() => setConfirmDelete(false)}
                >
                  Cancel
                </button>
              )}
            </div>
            {confirmDelete && (
              <p className="delete-warning">This action cannot be undone.</p>
            )}
          </div>

          <Link to="/incidents" className="btn btn-secondary action-btn">
            &#8592;&nbsp; Back to List
          </Link>
        </div>
      </div>
    </div>
  );
}
