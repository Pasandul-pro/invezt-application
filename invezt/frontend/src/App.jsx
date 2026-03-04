import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Analyzer from './pages/Analyzer';
import Compare from './pages/Compare';
import Portfolio from './pages/Portfolio';
import ValuationModels from './pages/ValuationModels';
import News from './pages/News';
import CompanyReport from './pages/CompanyReport';
export default App;
import { useState } from 'react';
import Search from './components/news/Search';
import ExternalResources from './pages/ExternalResources';
import Learning from './pages/Learning';
import Navbar from './utils/Navbar';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/analyzer" element={<Analyzer />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/valuation-models" element={<ValuationModels />} />
        <Route path="/news" element={<News />} />
        <Route path="/company-report" element={<CompanyReport />} />
      </Routes>
    </Router>
  );
}


function App() {
  const [activeSection, setActiveSection] = useState('news');
  const [activeSubTab, setActiveSubTab] = useState('search');

  const renderContent = () => {
    switch (activeSection) {
      case 'news':
        return activeSubTab === 'search' ? <Search /> : <ExternalResources />;
      case 'learning':
        return <Learning />;
      case 'analytics':
        return (
          <div className="flex items-center justify-center min-h-[60vh] animate-fadeIn">
            <div className="text-center bg-slate-900/50 p-12 rounded-3xl border border-white/5 backdrop-blur-xl max-w-md">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mx-auto mb-6 shadow-xl">
                <span className="text-4xl">📊</span>
              </div>
              <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Analytics Lab</h2>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                Advanced market analytics and trend forecasting models are currently being calibrated.
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></div>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">In Development</span>
              </div>
            </div>
          </div>
        );
      default:
        return <Search />;
    }
  };}