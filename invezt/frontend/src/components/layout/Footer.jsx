import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-slate-900/95 border-t border-slate-800/50 backdrop-blur-md text-slate-400 py-10 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    {/* Brand Section */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                            <span className="text-lg font-black text-white tracking-tighter">
                                Invezt
                            </span>
                        </div>
                        <p className="text-sm">Smart investing in the Colombo Stock Exchange starts with proper valuation and data-driven insights.</p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Platform</h4>
                        <ul className="flex flex-col gap-2 text-sm max-w-max">
                            <li><Link to="/dashboard" className="block hover:text-blue-400 transition-colors">Dashboard</Link></li>
                            <li><Link to="/portfolio" className="block hover:text-blue-400 transition-colors">Portfolio Management</Link></li>
                            <li><Link to="/analyzer" className="block hover:text-blue-400 transition-colors">Stock Analyzer</Link></li>
                            <li><Link to="/compare" className="block hover:text-blue-400 transition-colors">Company Comparison</Link></li>
                            <li><Link to="/company-report" className="block hover:text-blue-400 transition-colors">AI Valuation Report</Link></li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Resources</h4>
                        <ul className="flex flex-col gap-2 text-sm max-w-max">
                            <li><Link to="/news" className="block hover:text-blue-400 transition-colors">Market News</Link></li>
                            <li><Link to="/learning" className="block hover:text-blue-400 transition-colors">Learning Hub</Link></li>
                            <li><Link to="/valuation-models" className="block hover:text-blue-400 transition-colors">Valuation Models</Link></li>
                            <li><Link to="/external-resources" className="block hover:text-blue-400 transition-colors">External Resources</Link></li>
                        </ul>
                    </div>

                    {/* Account Links */}
                    <div>
                        <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Account</h4>
                        <ul className="flex flex-col gap-2 text-sm max-w-max">
                            <li><Link to="/" className="block hover:text-blue-400 transition-colors">Home</Link></li>
                            <li><Link to="/login" className="block hover:text-blue-400 transition-colors">Log In</Link></li>
                            <li><Link to="/register" className="block hover:text-blue-400 transition-colors">Sign Up</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="flex justify-between items-center gap-4 pt-6 text-center md:text-left border-t border-slate-800">
                    <div className="text-xs">
                        &copy; {new Date().getFullYear()} Invezt. All rights reserved. 
                    </div>
                    <div className="hidden sm:flex gap-4 text-xs font-semibold">
                        <Link to="#" className="hover:text-blue-400 transition-colors">Privacy Policy</Link>
                        <Link to="#" className="hover:text-blue-400 transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
