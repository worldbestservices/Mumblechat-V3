import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Wallet, AlertTriangle, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppKit, useAppKitAccount } from '@reown/appkit/react';

const ConnectWallet = () => {
  const { open } = useAppKit(); // Reown WalletConnect modal
  const { address, isConnected: connected, isConnecting } = useAppKitAccount();
  const navigate = useNavigate();

  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState(null);

  useEffect(() => {
    if (connected) {
      setConnectError(null);
      navigate('/chat');
    }
  }, [connected, navigate]);

  const handleConnect = async () => {
    setConnecting(true);
    setConnectError(null);

    try {
      await open(); // show WalletConnect modal
    } catch (err) {
      console.error("Wallet connection failed:", err);
      setConnectError("Failed to connect wallet. Please try again or choose a different wallet.");
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md card p-8"
      >
        <button onClick={() => navigate('/')} className="text-muted-foreground hover:text-foreground flex items-center mb-6">
          <ChevronLeft size={16} />
          <span>Back to home</span>
        </button>

        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
            <MessageCircle size={28} />
          </div>
          <h1 className="text-2xl font-bold mb-2">Connect to MumbleChat</h1>
          <p className="text-muted-foreground">
            Connect your wallet to start sending encrypted messages on the Ramestta blockchain
          </p>
        </div>

        {connectError && (
          <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-md flex items-start gap-3">
            <AlertTriangle size={18} className="text-error mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-medium mb-1">Connection Error</h3>
              <p className="text-sm text-muted-foreground">{connectError}</p>
            </div>
          </div>
        )}

        <button
          onClick={handleConnect}
          disabled={connecting}
          className="btn btn-primary w-full py-3"
        >
          {connecting ? (
            <>
              <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-white animate-spin mr-2"></div>
              Connecting...
            </>
          ) : (
            <>
              <Wallet size={18} className="mr-2" />
              Connect Wallet
            </>
          )}
        </button>

        <p className="text-xs text-muted-foreground text-center mt-4">
          By connecting, you agree to the MumbleChat Terms of Service and Privacy Policy
        </p>
      </motion.div>
    </div>
  );
};

export default ConnectWallet;
