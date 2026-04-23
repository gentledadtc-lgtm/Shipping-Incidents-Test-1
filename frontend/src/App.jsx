import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Dashboard from './components/Dashboard.jsx';
import IncidentList from './components/IncidentList.jsx';
import IncidentForm from './components/IncidentForm.jsx';
import IncidentDetail from './components/IncidentDetail.jsx';
import './App.css';

function App() {
  const [role, setRole] = useState('vessel');

  return (
    <Router>
      <div className="app">
        <Navbar role={role} onRoleChange={setRole} />
        <main className="main-content">
          <Routes>
            <Route path="/"                   element={<Dashboard />} />
            <Route path="/incidents"          element={<IncidentList />} />
            <Route path="/incidents/new"      element={<IncidentForm role={role} />} />
            <Route path="/incidents/:id"      element={<IncidentDetail role={role} />} />
            <Route path="/incidents/:id/edit" element={<IncidentForm role={role} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
