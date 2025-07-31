// src/App.jsx
import { useEffect, useMemo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createAppKit } from '@reown/appkit/react';
import { WagmiProvider } from 'wagmi';

import { projectId, metadata, networks, wagmiAdapter } from './config';
import { ChatProvider } from './context/ChatContext';
import AppNavigator from './AppNavigator';
import DebugSigner from './components/DebugSigner'; // 👈 Add this

function App() {
  // ✅ React Query client (for caching and async hooks)
  const queryClient = useMemo(() => new QueryClient(), []);

  // ✅ Init WalletConnect modal via AppKit (runs once)
  useEffect(() => {
    createAppKit({
      adapters: [wagmiAdapter],
      projectId,
      metadata,
      networks,
      themeMode: 'light', // or 'dark'
      themeVariables: {
        '--w3m-accent': '#000000',
      },
      features: {
        analytics: true,
      },
    });
  }, []);

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ChatProvider>
          <DebugSigner /> {/* 👈 Insert debug component */}
          <AppNavigator />
        </ChatProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
