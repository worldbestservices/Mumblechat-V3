import { useState, useEffect } from 'react';
import { useChat } from '../hooks/useChat';
import { User, Copy, ExternalLink, Wallet, Globe, Activity, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { truncateAddress } from '../utils/formatters';
import { useAppKitAccount } from '@reown/appkit/react';

const Profile = () => {
  const { address, isConnected, balance } = useAppKitAccount();
  const { users, updateUserProfile } = useChat();

  const [displayName, setDisplayName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const balanceSymbol = 'RAMA'; // fixed symbol since AppKit gives formatted balance

  useEffect(() => {
    if (address && users[address]) {
      const userProfile = users[address];
      setDisplayName(userProfile.displayName || '');
      setAvatar(userProfile.avatar || '');
    }
  }, [address, users]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!address) return;
    try {
      setIsSaving(true);
      await updateUserProfile(displayName, avatar);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const copyAddressToClipboard = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  if (!isConnected || !address) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center">
          <Wallet className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Connect Your Wallet</h2>
          <p className="text-muted-foreground">Please connect your wallet to view your profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Your Profile
          </h1>

          <div className="bg-card border border-border rounded-xl p-8 shadow-lg mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-6">
                <motion.div whileHover={{ scale: 1.05 }} className="relative">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt="Profile"
                      className="h-20 w-20 rounded-full object-cover border-4 border-primary/20"
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
                      <User size={32} />
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-green-500 border-2 border-background rounded-full flex items-center justify-center">
                    <div className="h-2 w-2 bg-white rounded-full"></div>
                  </div>
                </motion.div>

                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-1">
                    {displayName || 'Anonymous User'}
                  </h2>
                  <p className="text-muted-foreground">Ramestta Network User</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={copyAddressToClipboard}
                  className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
                >
                  <Copy size={16} />
                  <span className="font-mono text-sm">
                    {copySuccess ? 'Copied!' : truncateAddress(address)}
                  </span>
                </motion.button>

                <motion.a
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  href={`https://ramascan.com/address/${address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors"
                >
                  <ExternalLink size={16} />
                  <span>View on Explorer</span>
                </motion.a>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <motion.div whileHover={{ scale: 1.02 }} className="bg-card border border-border rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Wallet className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold text-foreground">Balance</h3>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {balance ? `${parseFloat(balance).toFixed(4)} ${balanceSymbol}` : '0.0000 RAMA'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Available funds</p>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} className="bg-card border border-border rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-foreground">Network</h3>
              </div>
              <p className="text-xl font-bold text-foreground">Ramestta</p>
              <p className="text-sm text-muted-foreground mt-1">Mainnet</p>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} className="bg-card border border-border rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Activity className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold text-foreground">Status</h3>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                <p className="text-xl font-bold text-foreground">Online</p>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Connected</p>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} className="bg-card border border-border rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Eye className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-semibold text-foreground">Privacy</h3>
              </div>
              <p className="text-xl font-bold text-foreground">Public</p>
              <p className="text-sm text-muted-foreground mt-1">Profile visible</p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-card border border-border rounded-xl p-8 shadow-lg"
          >
            <h3 className="text-xl font-bold mb-6 text-foreground">Edit Profile</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your display name"
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Avatar URL
                  </label>
                  <input
                    type="url"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-3 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </motion.button>

                {saveSuccess && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 text-green-600 dark:text-green-400"
                  >
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium">Profile updated!</span>
                  </motion.div>
                )}
              </div>
            </form>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
