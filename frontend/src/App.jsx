import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { LayoutDashboard, Users, Settings as SettingsIcon, Mail, Calendar } from 'lucide-react'
import Dashboard from './pages/Dashboard'
import Leads from './pages/Leads'
import Settings from './pages/Settings'

function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-slate-900 text-slate-100">
        {/* Sidebar */}
        <aside className="w-64 bg-slate-800 border-r border-slate-700">
          <div className="p-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Mail className="text-primary-500" /> OutreachAI
            </h2>
          </div>
          <nav className="mt-6 px-4 space-y-2">
            <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-700 transition-colors">
              <LayoutDashboard size={20} /> Dashboard
            </Link>
            <Link to="/leads" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-700 transition-colors">
              <Users size={20} /> Leads
            </Link>
            <Link to="/meetings" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-700 transition-colors">
              <Calendar size={20} /> Meetings
            </Link>
            <Link to="/settings" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-700 transition-colors">
              <SettingsIcon size={20} /> Settings
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/leads" element={<Leads />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
