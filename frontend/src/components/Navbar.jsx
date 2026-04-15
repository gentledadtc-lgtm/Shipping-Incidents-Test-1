import { Link, NavLink } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="navbar-anchor" aria-hidden="true">&#9875;</span>
        <Link to="/" className="navbar-title">INCIDENTS&nbsp;&mdash;&nbsp;Test&nbsp;1</Link>
      </div>

      <div className="navbar-links">
        <NavLink
          to="/"
          end
          className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/incidents"
          className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
        >
          Incidents
        </NavLink>
        <Link to="/incidents/new" className="nav-link nav-btn-report">
          + Report Incident
        </Link>
      </div>
    </nav>
  );
}
