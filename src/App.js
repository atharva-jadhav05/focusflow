import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import LoginPage from './components/login';
import Dashboard from './components/dashboard';
import Workspace from './components/workspace';


function App() {

  return (
      <div className="App">
        <Router>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/workspace/:workspace_name" element={<Workspace/>} />
          </Routes>
        </Router>

      </div>
  );
}

export default App;
