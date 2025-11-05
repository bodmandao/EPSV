import { createConfig, http } from 'wagmi'
import { base,sepolia,zeroGGalileoTestnet,zeroGMainnet } from 'viem/chains'
import { injected, walletConnect } from 'wagmi/connectors'

const Ogchain = {
    id: Number(process.env.NEXT_PUBLIC_OG_CHAIN_ID),
    name: 'OG-Testnet-Galileo',
    network: 'og-chain',
    nativeCurrency: {
        decimals: 18,
        name: 'OG',
        symbol: 'OG',
    },
    rpcUrls: {
        public: { http: [process.env.NEXT_PUBLIC_OG_RPC_URL!] },
        default: { http: [process.env.NEXT_PUBLIC_OG_RPC_URL!] },
    },
} as const;

const OgMainnet = {
    id: 16661,
    name: '0G Mainnet',
    network: 'og-chain',
    nativeCurrency: {
        decimals: 18,
        name: 'OG',
        symbol: 'OG',
    },
    rpcUrls: {
        public: { http: ['https://evmrpc.0g.ai'] },
        default: { http: ['https://evmrpc.0g.ai'] },
    },
} as const;

const config = createConfig({
    chains: [Ogchain, OgMainnet] as const,
    transports: {
        [Ogchain.id]: http(),
        [OgMainnet.id]: http(),
    },
    connectors: [
        injected(),
        walletConnect({
            projectId: process.env.NEXT_PUBLIC_WALLET_PROJECT_ID!,
        })
    ]
})
export default config