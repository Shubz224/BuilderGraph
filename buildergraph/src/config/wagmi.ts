import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, sepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
    appName: 'BuilderGraph',
    projectId: 'c8c9a4c5e0e8f4b3a2d1c0b9a8f7e6d5', // WalletConnect Project ID
    chains: [sepolia, mainnet],
    ssr: false,
});
