import { http, createConfig } from 'wagmi'
import { defineChain } from 'viem'
import { injected } from 'wagmi/connectors'

export const tempoTestnet = defineChain({
  id: 42429,
  name: 'Tempo Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'USD',
    symbol: 'USD',
  },
  rpcUrls: {
    default: { http: ['https://rpc.testnet.tempo.xyz'] },
  },
  blockExplorers: {
    default: { name: 'Explorer', url: 'https://explore.tempo.xyz' },
  },
})

export const config = createConfig({
  chains: [tempoTestnet],
  connectors: [injected()],
  transports: {
    [tempoTestnet.id]: http(),
  },
})
