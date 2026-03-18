import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Analyzer from './pages/Analyzer';
import Compare from './pages/Compare';
import Portfolio from './pages/Portfolio';
import ValuationModels from './pages/ValuationModels';
import News from './pages/News';
import CompanyReport from './pages/CompanyReport';
import Learning from './pages/Learning';
import ExternalResources from './pages/ExternalResources';
import Footer from './components/layout/Footer';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <main className="flex-1 w-full flex flex-col">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected routes – require login */}
              <Route path="/dashboard"         element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/analyzer"           element={<ProtectedRoute><Analyzer /></ProtectedRoute>} />
              <Route path="/compare"            element={<ProtectedRoute><Compare /></ProtectedRoute>} />
              <Route path="/portfolio"          element={<ProtectedRoute><Portfolio /></ProtectedRoute>} />
              <Route path="/valuation-models"   element={<ProtectedRoute><ValuationModels /></ProtectedRoute>} />
              <Route path="/news"               element={<ProtectedRoute><News /></ProtectedRoute>} />
              <Route path="/company-report"     element={<ProtectedRoute><CompanyReport /></ProtectedRoute>} />
              <Route path="/learning"           element={<ProtectedRoute><Learning /></ProtectedRoute>} />
              <Route path="/external-resources" element={<ProtectedRoute><ExternalResources /></ProtectedRoute>} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
