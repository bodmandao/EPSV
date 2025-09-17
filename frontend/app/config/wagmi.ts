import { createConfig, http } from 'wagmi'
import { filecoin, filecoinCalibration } from 'viem/chains'
import { injected, walletConnect } from 'wagmi/connectors'

const config = createConfig({
    chains: [filecoin, filecoinCalibration] as const,
    transports: {
        [filecoin.id]: http(),
        [filecoinCalibration.id]: http(),
    },
    connectors: [
        injected(),
        walletConnect({
            projectId: process.env.NEXT_PUBLIC_WALLET_PROJECT_ID!,
        })
    ]
})
export default config