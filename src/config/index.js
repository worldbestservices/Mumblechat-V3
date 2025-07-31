import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';

// ✅ WalletConnect Project ID (localhost)
export const projectId = '5a7ca96b4c20a6f220b969a9e91203d8';

// ✅ Ramestta network
const ramesttaNetwork = {
  id: 1370,
  name: 'Ramestta',
  nativeCurrency: {
    name: 'Rama',
    symbol: 'RAMA',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://blockchain.ramestta.com', 'https://blockchain2.ramestta.com'],
    },
    public: {
      http: ['https://blockchain.ramestta.com', 'https://blockchain2.ramestta.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Ramascan',
      url: 'https://ramascan.com/',
    },
  },
  testnet: false,
};

// ✅ Host-aware WalletConnect metadata
const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';

export const metadata = {
  name: 'MumbleChat',
  description: 'A decentralized messaging app powered by Ramestta Network',
  url: isLocalhost ? 'http://localhost:5173' : 'https://mumblechat.app',
  icons: ['https://mumblechat.app/logo.png'],
};

// ✅ Supported networks
export const networks = [ramesttaNetwork];

// ✅ Create WagmiAdapter — DO NOT pass custom connectors!
export const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks,
});

// ✅ Export wagmi config (optional)
export const config = wagmiAdapter.wagmiConfig;
