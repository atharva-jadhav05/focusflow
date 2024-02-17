import React from 'react';
import './App.css';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import LoginPage from './components/login';
import Dashboard from './components/dashboard';


function App() {

  return (
    <GoogleOAuthProvider clientId='356377434224-gv1sfl0pk97qbiu2v2ub0fmsh8mh3plj.apps.googleusercontent.com'>
      <div className="App">
        <Router>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </Router>

      </div>
    </GoogleOAuthProvider>
  );
}

export default App;
