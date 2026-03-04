import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

const Header = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/analyzer', label: 'Analyzer' },
    { path: '/compare', label: 'Compare' },
    { path: '/portfolio', label: 'Portfolio' },
    { path: '/valuation-models', label: 'Valuation Models' },
    { path: '/news', label: 'News' },
  ];

  return (
    <header className="bg-primary text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link
            to="/dashboard"
            className="flex items-center gap-3 hover:opacity-90 transition-opacity"
          >
            <img
              src="/resources/Logo.png"
              alt="Invezt Logo"
              className="h-10 w-auto"
            />
            <div className="flex flex-col">
              <span className="text-2xl font-bold">Invezt</span>
              <span className="text-xs opacity-90">Investing Made Simple</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  isActive(link.path)
                    ? 'bg-white/20 font-semibold shadow-lg'
                    : 'hover:bg-white/10'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/"
              className="ml-4 px-6 py-2 border-2 border-white rounded-lg hover:bg-white hover:text-primary transition-all font-semibold"
            >
              Logout
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="lg:hidden pb-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-lg transition-all ${
                  isActive(link.path)
                    ? 'bg-white/20 font-semibold'
                    : 'hover:bg-white/10'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 border-2 border-white rounded-lg hover:bg-white hover:text-primary transition-all font-semibold text-center"
            >
              Logout
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;