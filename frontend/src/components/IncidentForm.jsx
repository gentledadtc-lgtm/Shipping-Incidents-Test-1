import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchIncident, createIncident, updateIncident } from '../api/incidents.js';
import './IncidentForm.css';

const VESSEL_TYPES = [
  'Container Ship','Bulk Carrier','Oil Tanker','Chemical Tanker',
  'Ferry','Fishing Vessel','Cruise Ship','Cargo Ship','Tug Boat','Other',
];

const INCIDENT_TYPES = [
  'Collision','Grounding','Fire/Explosion','Flooding','Cargo Damage',
  'Equipment Failure','Man Overboard','Oil Spill','Navigation Error','Piracy','Other',
];

const EMPTY_FORM = {
  incident_date: '', vessel_name: '', vessel_type: '', incident_type: '',
  location: '', coordinates: '', description: '', severity: '',
  status: 'Open', reported_by: '', casualties: '0', damage_estimate: '',
};

export default function IncidentForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm]       = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState(null);
  const [errors, setErrors]   = useState({});

  useEffect(() => {
    if (!isEdit) return;
    fetchIncident(id)
      .then(inc => setForm({
        incident_date:   inc.incident_date   || '',
        vessel_name:     inc.vessel_name     || '',
        vessel_type:     inc.vessel_type     || '',
        incident_type:   inc.incident_type   || '',
        location:        inc.location        || '',
        coordinates:     inc.coordinates     || '',
        description:     inc.description     || '',
        severity:        inc.severity        || '',
        status:          inc.status          || 'Open',
        reported_by:     inc.reported_by     || '',
        casualties:      String(inc.casualties ?? 0),
        damage_estimate: inc.damage_estimate || '',
      }))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  }

  function validate() {
    const e = {};
    if (!form.incident_date)  e.incident_date  = 'Date is required';
    if (!form.vessel_name.trim()) e.vessel_name = 'Vessel name is required';
    if (!form.incident_type)  e.incident_type  = 'Incident type is required';
    if (!form.location.trim()) e.location       = 'Location is required';
    if (!form.description.trim()) e.description = 'Description is required';
    if (!form.severity)       e.severity        = 'Severity is required';
    if (!form.reported_by.trim()) e.reported_by = 'Reporter name is required';
    const cas = Number(form.casualties);
    if (isNaN(cas) || cas < 0) e.casualties = 'Must be 0 or more';
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSaving(true);
    setError(null);
    try {
      const payload = {
        ...form,
        casualties: Number(form.casualties),
      };
      const saved = isEdit
        ? await updateIncident(id, payload)
        : await createIncident(payload);
      navigate(`/incidents/${saved.id}`);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  if (loading) return (
    <div className="loading-state"><div className="spinner" /><span>Loading incident…</span></div>
  );

  return (
    <div className="incident-form-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">{isEdit ? 'Edit Incident' : 'Report New Incident'}</h1>
          <p className="page-subtitle">
            {isEdit ? `Updating record #${id}` : 'Submit a new shipping incident report'}
          </p>
        </div>
        <Link to={isEdit ? `/incidents/${id}` : '/incidents'} className="btn btn-secondary">
          &#8592; Cancel
        </Link>
      </div>

      {error && (
        <div className="form-error-banner">&#9888;&nbsp;{error}</div>
      )}

      <form className="incident-form" onSubmit={handleSubmit} noValidate>
        {/* Section: Vessel Information */}
        <div className="form-section">
          <h2 className="section-title">Vessel Information</h2>
          <div className="form-grid">
            <div className={`form-field${errors.vessel_name ? ' has-error' : ''}`}>
              <label htmlFor="vessel_name">Vessel Name <span className="required">*</span></label>
              <input
                id="vessel_name" name="vessel_name" type="text"
                value={form.vessel_name} onChange={handleChange}
                placeholder="e.g. MV Atlantic Star"
              />
              {errors.vessel_name && <span className="field-error">{errors.vessel_name}</span>}
            </div>
            <div className="form-field">
              <label htmlFor="vessel_type">Vessel Type</label>
              <select id="vessel_type" name="vessel_type" value={form.vessel_type} onChange={handleChange}>
                <option value="">Select type…</option>
                {VESSEL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Section: Incident Details */}
        <div className="form-section">
          <h2 className="section-title">Incident Details</h2>
          <div className="form-grid">
            <div className={`form-field${errors.incident_date ? ' has-error' : ''}`}>
              <label htmlFor="incident_date">Incident Date <span className="required">*</span></label>
              <input
                id="incident_date" name="incident_date" type="date"
                value={form.incident_date} onChange={handleChange}
              />
              {errors.incident_date && <span className="field-error">{errors.incident_date}</span>}
            </div>
            <div className={`form-field${errors.incident_type ? ' has-error' : ''}`}>
              <label htmlFor="incident_type">Incident Type <span className="required">*</span></label>
              <select id="incident_type" name="incident_type" value={form.incident_type} onChange={handleChange}>
                <option value="">Select type…</option>
                {INCIDENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              {errors.incident_type && <span className="field-error">{errors.incident_type}</span>}
            </div>
            <div className={`form-field${errors.severity ? ' has-error' : ''}`}>
              <label htmlFor="severity">Severity <span className="required">*</span></label>
              <select id="severity" name="severity" value={form.severity} onChange={handleChange}>
                <option value="">Select severity…</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
              {errors.severity && <span className="field-error">{errors.severity}</span>}
            </div>
            <div className="form-field">
              <label htmlFor="status">Status</label>
              <select id="status" name="status" value={form.status} onChange={handleChange}>
                <option value="Open">Open</option>
                <option value="Under Investigation">Under Investigation</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section: Location */}
        <div className="form-section">
          <h2 className="section-title">Location</h2>
          <div className="form-grid">
            <div className={`form-field form-field-wide${errors.location ? ' has-error' : ''}`}>
              <label htmlFor="location">Location <span className="required">*</span></label>
              <input
                id="location" name="location" type="text"
                value={form.location} onChange={handleChange}
                placeholder="e.g. Strait of Malacca"
              />
              {errors.location && <span className="field-error">{errors.location}</span>}
            </div>
            <div className="form-field">
              <label htmlFor="coordinates">Coordinates (optional)</label>
              <input
                id="coordinates" name="coordinates" type="text"
                value={form.coordinates} onChange={handleChange}
                placeholder="e.g. 1.28° N, 103.86° E"
              />
            </div>
          </div>
        </div>

        {/* Section: Description */}
        <div className="form-section">
          <h2 className="section-title">Description</h2>
          <div className={`form-field${errors.description ? ' has-error' : ''}`}>
            <label htmlFor="description">Incident Description <span className="required">*</span></label>
            <textarea
              id="description" name="description"
              value={form.description} onChange={handleChange}
              rows={5}
              placeholder="Provide a detailed description of what happened…"
            />
            {errors.description && <span className="field-error">{errors.description}</span>}
          </div>
        </div>

        {/* Section: Response & Impact */}
        <div className="form-section">
          <h2 className="section-title">Response &amp; Impact</h2>
          <div className="form-grid">
            <div className={`form-field${errors.reported_by ? ' has-error' : ''}`}>
              <label htmlFor="reported_by">Reported By <span className="required">*</span></label>
              <input
                id="reported_by" name="reported_by" type="text"
                value={form.reported_by} onChange={handleChange}
                placeholder="e.g. Capt. James Wilson"
              />
              {errors.reported_by && <span className="field-error">{errors.reported_by}</span>}
            </div>
            <div className={`form-field${errors.casualties ? ' has-error' : ''}`}>
              <label htmlFor="casualties">Casualties</label>
              <input
                id="casualties" name="casualties" type="number"
                min="0" value={form.casualties} onChange={handleChange}
              />
              {errors.casualties && <span className="field-error">{errors.casualties}</span>}
            </div>
            <div className="form-field">
              <label htmlFor="damage_estimate">Damage Estimate (optional)</label>
              <input
                id="damage_estimate" name="damage_estimate" type="text"
                value={form.damage_estimate} onChange={handleChange}
                placeholder="e.g. $250,000"
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Submit Report'}
          </button>
          <Link to={isEdit ? `/incidents/${id}` : '/incidents'} className="btn btn-secondary">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
