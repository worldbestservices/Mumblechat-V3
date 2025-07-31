import { useNavigate, Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { Menu, User, LogOut, Wallet, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppKitAccount } from '@reown/appkit/react';
import { useDisconnect } from 'wagmi';

const Header = ({ toggleSidebar }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

const { address, isConnected, balance } = useAppKitAccount();
const { disconnect } = useDisconnect(); // ✅ this gives you the function


  const shortAddress = address
    ? `${address.slice(0, 4)}....${address.slice(-4)}`
    : 'Not connected';

  const handleDisconnect = () => {
    disconnect();
    setDropdownOpen(false);
    navigate('/');
  };

  const handleProfileClick = () => {
    setDropdownOpen(false);
    navigate('/profile');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-gradient-to-r z-[1] from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/50 h-16 flex items-center justify-between px-4 backdrop-blur-sm shadow-lg"
    >
      <div className="flex items-center gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-300 md:hidden transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </motion.button>

        <Link to="/chat" className="flex items-center gap-2">
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
            className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center"
          >
            <span className="text-white font-bold text-sm">M</span>
          </motion.div>
          <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            MumbleChat
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {/* Network Status & Balance */}
        <div className="hidden sm:flex items-center gap-3">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/60 backdrop-blur-sm border border-slate-600/30 rounded-lg"
          >
            <div className="flex items-center gap-1">
              <Globe size={14} className="text-blue-400" />
              <span className="text-xs text-slate-300">Ramestta</span>
            </div>
            <div className="w-px h-4 bg-slate-600"></div>
            <div className="flex items-center gap-1">
              <Wallet size={14} className="text-green-400" />
              <span className="text-xs font-medium text-white">{parseFloat(balance || '0').toFixed(4)}</span>
            </div>
          </motion.div>

          {/* Online Status */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-1 px-2 py-1 bg-green-500/20 border border-green-500/30 rounded-full"
          >
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-300">Online</span>
          </motion.div>
        </div>

        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/60 backdrop-blur-sm border border-slate-600/30 hover:bg-slate-700/60 transition-all duration-200"
          >
            <div className="relative">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
                <User size={16} />
              </div>
              {isConnected && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-slate-800 rounded-full"></div>
              )}
            </div>
            <div className="hidden sm:flex flex-col items-start">
              <span className="text-sm font-medium text-white">Anonymous</span>
              <span className="text-xs text-slate-400 font-mono">{shortAddress}</span>
            </div>
          </motion.button>

          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-800/95 backdrop-blur-sm border border-slate-600/30 shadow-2xl py-2 z-[1000]"
              >
                {/* User Info Header */}
                <div className="px-4 py-3 border-b border-slate-600/30">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white">
                      <User size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Anonymous User</p>
                      <p className="text-xs text-slate-400 font-mono">{shortAddress}</p>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="px-4 py-2 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Balance</span>
                    <span className="text-green-400 font-medium">{parseFloat(balance || '0').toFixed(4)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Network</span>
                    <span className="text-blue-400">Ramestta</span>
                  </div>
                </div>

                <div className="border-t border-slate-600/30 mt-2 pt-2">
                  <motion.button
                    whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                    onClick={handleProfileClick}
                    className="flex w-full items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors"
                  >
                    <User size={16} className="text-blue-400" />
                    <span>View Profile</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                    onClick={handleDisconnect}
                    className="flex w-full items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:text-red-400 transition-colors"
                  >
                    <LogOut size={16} className="text-red-400" />
                    <span>Disconnect</span>
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
