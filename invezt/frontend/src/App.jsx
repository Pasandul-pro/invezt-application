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

export default App;