import { useEffect, useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ContactList from './pages/ContactList';
import { googleAuth } from './services/googleAuth';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(googleAuth.isAuthenticated());

  useEffect(() => {
    const tokenDetected = googleAuth.handleCallback();
    if (tokenDetected) {
      // Prevent synchronous state update in effect cascading
      setTimeout(() => setIsAuthenticated(true), 0);
    }
  }, []);

  return (
    <div className="min-h-screen bg-base-200 text-base-content flex flex-col">
      <header className="navbar bg-base-100 shadow-sm px-4 border-b border-base-300">
        <div className="flex-1">
          <Link to="/" className="btn btn-ghost text-xl font-bold tracking-wide">
            🕸️ Network Tracker
          </Link>
          {isAuthenticated ? (
            <span className="badge badge-success gap-1 ml-2 font-semibold text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-base-100 animate-pulse"></span>
              Google Verbunden
            </span>
          ) : (
            <span className="badge badge-error gap-1 ml-2 font-semibold text-xs text-white">
              Getrennt
            </span>
          )}
        </div>
        <div className="flex-none gap-4">
          <ul className="menu menu-horizontal px-1 gap-2 font-medium">
            <li>
              <Link to="/" className="rounded-lg">Dashboard</Link>
            </li>
            <li>
              <Link to="/contacts" className="rounded-lg">Kontaktliste</Link>
            </li>
          </ul>

          <div className="border-l border-base-300 pl-4">
            {isAuthenticated ? (
              <button 
                onClick={() => googleAuth.logout()} 
                className="btn btn-sm btn-outline btn-error font-semibold"
              >
                Abmelden
              </button>
            ) : (
              <button 
                onClick={() => googleAuth.login()} 
                className="btn btn-sm btn-primary font-semibold shadow-xs"
              >
                Mit Google anmelden
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4 md:p-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/contacts" element={<ContactList />} />
        </Routes>
      </main>
    </div>
  );
}