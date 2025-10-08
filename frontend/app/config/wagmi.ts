import { createConfig, http } from 'wagmi'
import { base,sepolia } from 'viem/chains'
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

const config = createConfig({
    chains: [Ogchain, base] as const,
    transports: {
        [Ogchain.id]: http(),
    },
    connectors: [
        injected(),
        walletConnect({
            projectId: process.env.NEXT_PUBLIC_WALLET_PROJECT_ID!,
        })
    ]
})
export default config