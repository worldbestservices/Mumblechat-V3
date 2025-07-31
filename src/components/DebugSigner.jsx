// src/components/DebugSigner.jsx
import { useEffect } from 'react';
import { useAppKitAccount } from '@reown/appkit/react';

const DebugSigner = () => {
  const account = useAppKitAccount();

  useEffect(() => {
    console.log("🔍 AppKit Account Info:", account);
  }, [account]);

  return null;
};

export default DebugSigner;
