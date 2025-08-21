// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Experts from './pages/Experts';
import About from './pages/About';
import Contact from './pages/Contact';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import ExpertDetail from './pages/ExpertDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import PrivateRoute from './components/PrivateRoute';
import Profile from './pages/Profile';

function App() {
  return (
    <AuthProvider>
      <GoogleOAuthProvider clientId="508054214791-7q4lfcrbjrv80lf01vdcrlcsgelpt78u.apps.googleusercontent.com">
        <Router>
          <div className="relative min-h-screen flex flex-col overflow-hidden">
            <div className="absolute inset-0 z-0 w-full h-full pointer-events-none bg-white" />
            <div className="relative z-10 flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow pt-20">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/experts" element={<Experts />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/dashboard" element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  } />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/experts/:id" element={<ExpertDetail />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/profile" element={<Profile />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </div>
        </Router>
      </GoogleOAuthProvider>
    </AuthProvider>
  );
}

export default App;
