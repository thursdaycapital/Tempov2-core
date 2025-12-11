import { useState, useEffect } from 'react'
import { useAccount, useConnect, useDisconnect, useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { DEPLOYED_ADDRESSES } from './config'
import { ROUTER_ABI, ERC20_ABI, FAUCET_ABI, CREATOR_ABI, MYNFT_ABI, BATCH_ABI } from './abis'

// Icons
const ArrowDown = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
)
const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.39a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
)

function App() {
  const { address, isConnected } = useAccount()
  const { connectors, connect } = useConnect()
  const { disconnect } = useDisconnect()
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash })

  // Config State
  const [routerAddress] = useState(DEPLOYED_ADDRESSES.ROUTER)
  const [libTokenAddress, setLibTokenAddress] = useState(DEPLOYED_ADDRESSES.LIB_TOKEN)
  const [libUSDAddress, setLibUSDAddress] = useState(DEPLOYED_ADDRESSES.LIB_USD)
  const [faucetAddress] = useState(DEPLOYED_ADDRESSES.FAUCET)
  const [creatorAddress] = useState(DEPLOYED_ADDRESSES.TOKEN_CREATOR)

  // UI State
  const [tab, setTab] = useState<'swap' | 'liquidity' | 'faucet' | 'create' | 'nft' | 'batch'>('swap')
  const [amountA, setAmountA] = useState('')
  const [amountB, setAmountB] = useState('')
  const [newTokenName, setNewTokenName] = useState('')
  const [newTokenSymbol, setNewTokenSymbol] = useState('')
  const [newTokenSupply, setNewTokenSupply] = useState('1000000000')
  const [nftURI, setNftURI] = useState('')
  const [batchToken, setBatchToken] = useState(DEPLOYED_ADDRESSES.LIB_USD)
  const [batchAmount, setBatchAmount] = useState('')
  const [batchRecipients, setBatchRecipients] = useState('')

  // Read Balances
  const { data: libBalance, refetch: refetchLib } = useReadContract({
    address: libTokenAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [address || '0x0000000000000000000000000000000000000000'],
  })

  const { data: usdBalance, refetch: refetchUsd } = useReadContract({
    address: libUSDAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [address || '0x0000000000000000000000000000000000000000'],
  })

  useEffect(() => {
    if (isConfirmed) {
      refetchLib()
      refetchUsd()
    }
  }, [isConfirmed])

  const mintTokens = async (token: string) => {
    if (!address) return
    writeContract({
      address: faucetAddress as `0x${string}`,
      abi: FAUCET_ABI,
      functionName: 'mint',
      args: [token as `0x${string}`, parseEther('1000')],
    })
  }

  const approve = async (token: string, amount: string) => {
    if (!amount) return
    writeContract({
      address: token as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [routerAddress as `0x${string}`, parseEther(amount)],
    })
  }

  const addLiquidity = async () => {
    if (!amountA || !amountB) return
    writeContract({
      address: routerAddress as `0x${string}`,
      abi: ROUTER_ABI,
      functionName: 'addLiquidity',
      args: [
        libTokenAddress as `0x${string}`,
        libUSDAddress as `0x${string}`,
        parseEther(amountA),
        parseEther(amountB),
        0n,
        0n,
        address as `0x${string}`,
        BigInt(Math.floor(Date.now() / 1000) + 60 * 20),
      ],
    })
  }

  const swap = async () => {
    if (!amountA) return
    writeContract({
      address: routerAddress as `0x${string}`,
      abi: ROUTER_ABI,
      functionName: 'swapExactTokensForTokens',
      args: [
        parseEther(amountA),
        0n,
        [libTokenAddress as `0x${string}`, libUSDAddress as `0x${string}`],
        address as `0x${string}`,
        BigInt(Math.floor(Date.now() / 1000) + 60 * 20),
      ],
      // @ts-ignore
      feeToken: '0x20c0000000000000000000000000000000000001',
    })
  }

  const createToken = async () => {
    if (!newTokenName || !newTokenSymbol) return
    writeContract({
      address: creatorAddress as `0x${string}`,
      abi: CREATOR_ABI,
      functionName: 'createToken',
      args: [
        newTokenName, 
        newTokenSymbol, 
        parseEther(newTokenSupply)
      ],
      // @ts-ignore
      feeToken: '0x20c0000000000000000000000000000000000001',
    })
  }

  const mintNft = async () => {
    if (!nftURI) return
    writeContract({
      address: DEPLOYED_ADDRESSES.MYNFT as `0x${string}`,
      abi: MYNFT_ABI,
      functionName: 'mint',
      args: [address as `0x${string}`, nftURI],
      // @ts-ignore
      feeToken: '0x20c0000000000000000000000000000000000001',
    })
  }

  const parseRecipients = () => {
    const items = batchRecipients
      .split(/[\n,;]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
    const valid = items.filter((a) => /^0x[a-fA-F0-9]{40}$/.test(a))
    if (valid.length !== items.length) {
      alert('Some recipient addresses are invalid')
      return null
    }
    return valid
  }

  const approveBatch = async () => {
    const recips = parseRecipients()
    if (!recips) return
    if (!batchAmount) return
    const total = parseEther(batchAmount) * BigInt(recips.length)
    writeContract({
      address: batchToken as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [DEPLOYED_ADDRESSES.BATCH_TRANSFER as `0x${string}`, total],
    })
  }

  const sendBatch = async () => {
    const recips = parseRecipients()
    if (!recips) return
    if (!batchAmount) return
    const amt = parseEther(batchAmount)
    const amounts = recips.map(() => amt)
    writeContract({
      address: DEPLOYED_ADDRESSES.BATCH_TRANSFER as `0x${string}`,
      abi: BATCH_ABI,
      functionName: 'batchTransfer',
      args: [batchToken as `0x${string}`, recips, amounts],
    })
  }

  const formatBalance = (balance: bigint | undefined) => {
    if (!balance) return '0'
    return parseFloat(formatEther(balance)).toFixed(2)
  }

  return (
    <div className="min-h-screen bg-transparent text-white font-sans flex flex-col items-center">
      {/* Navbar */}
      <nav className="w-full flex justify-between items-center p-4 px-6 max-w-7xl">
        <div className="flex items-center gap-8">
          <div className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            Tempo Swap
          </div>
          <div className="hidden md:flex gap-4">
            {['Swap', 'Liquidity', 'Faucet', 'Create', 'NFT', 'Batch'].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t.toLowerCase() as any)}
                className={`px-4 py-2 rounded-xl transition-colors font-medium ${
                  tab === t.toLowerCase()
                    ? 'bg-uniswap-card text-white'
                    : 'text-gray-400 hover:text-white hover:bg-uniswap-card/50'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          {isConnected ? (
            <div className="flex items-center gap-3">
               <div className="hidden md:block px-3 py-2 bg-uniswap-card rounded-xl border border-uniswap-border text-sm">
                  {formatBalance(usdBalance)} libUSD
               </div>
               <button 
                onClick={() => disconnect()}
                className="px-4 py-2 bg-[#293249] hover:bg-[#394461] rounded-2xl font-medium flex items-center gap-2"
              >
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </button>
            </div>
           
          ) : (
            connectors.map((connector) => (
              <button
                key={connector.uid}
                onClick={() => connect({ connector })}
                className="px-4 py-2 bg-pink-500 hover:bg-pink-600 rounded-2xl font-semibold text-pink-100"
              >
                Connect Wallet
              </button>
            )).slice(0,1) // Show only first connector (usually MetaMask/Injected)
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 w-full flex justify-center items-start pt-20 px-4">
        
        <div className="w-full max-w-[480px] bg-[#131a2a] rounded-3xl border border-[#0d111c] p-2 shadow-xl">
          <div className="px-4 py-3 flex justify-between items-center mb-2">
            <h2 className="text-white font-medium text-lg capitalize">{tab}</h2>
            <button className="text-gray-400 hover:text-white transition-colors">
              <SettingsIcon />
            </button>
          </div>

          {tab === 'swap' && (
            <div className="flex flex-col gap-1">
              {/* Input Token */}
              <div className="bg-[#0d111c] rounded-2xl p-4 hover:border hover:border-gray-700 border border-transparent transition-colors">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400 text-sm font-medium">You pay</span>
                  <span className="text-gray-400 text-sm font-medium">
                    Balance: {formatBalance(libBalance)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <input
                    type="number"
                    placeholder="0"
                    value={amountA}
                    onChange={(e) => setAmountA(e.target.value)}
                    className="bg-transparent text-4xl text-white placeholder-gray-500 outline-none w-full"
                  />
                  <button className="bg-[#293249] hover:bg-[#343e59] text-white px-3 py-1 rounded-full font-bold flex items-center gap-2 shrink-0 ml-4">
                    <span className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-[10px]">L</span>
                    LIB
                  </button>
                </div>
              </div>

              {/* Arrow */}
              <div className="relative h-2">
                 <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#131a2a] p-1 rounded-lg border-[4px] border-[#131a2a] z-10">
                    <div className="bg-[#293249] p-2 rounded-lg text-gray-400">
                      <ArrowDown />
                    </div>
                 </div>
              </div>

              {/* Output Token */}
              <div className="bg-[#0d111c] rounded-2xl p-4 hover:border hover:border-gray-700 border border-transparent transition-colors">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400 text-sm font-medium">You receive</span>
                  <span className="text-gray-400 text-sm font-medium">
                     Balance: {formatBalance(usdBalance)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <input
                    type="number"
                    placeholder="0"
                    value={amountA ? (parseFloat(amountA) * 0.997).toFixed(4) : ''} // Fake calculation for demo UI, real implementation uses quote
                    readOnly
                    className="bg-transparent text-4xl text-white placeholder-gray-500 outline-none w-full"
                  />
                   <button className="bg-[#293249] hover:bg-[#343e59] text-white px-3 py-1 rounded-full font-bold flex items-center gap-2 shrink-0 ml-4">
                    <span className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-[10px]">$</span>
                    libUSD
                  </button>
                </div>
              </div>
              
               {/* Actions */}
               <div className="mt-2 grid grid-cols-2 gap-2">
                 <button
                    onClick={() => approve(libTokenAddress, amountA)}
                    disabled={!amountA || isPending || isConfirming}
                    className="bg-[#293249] hover:bg-[#343e59] text-[#4c82fb] font-bold py-4 rounded-2xl text-lg transition-colors disabled:opacity-50"
                  >
                    1. Approve LIB
                  </button>
                  <button
                    onClick={swap}
                    disabled={!amountA || isPending || isConfirming}
                    className="bg-[#4c82fb] hover:bg-[#3b66c4] text-white font-bold py-4 rounded-2xl text-lg transition-colors disabled:bg-[#293249] disabled:text-gray-500"
                  >
                    {isPending ? 'Swapping...' : 'Swap'}
                  </button>
               </div>
            </div>
          )}

          {tab === 'liquidity' && (
             <div className="flex flex-col gap-4 p-2">
                <div className="bg-[#1b2236] p-4 rounded-xl text-sm text-gray-300">
                   Add liquidity to earn fees.
                </div>
                 
                 <div className="grid gap-2">
                    <div className="bg-[#0d111c] p-4 rounded-xl">
                       <div className="flex justify-between mb-2">
                          <label className="text-gray-400">LIB Amount</label>
                          <span className="text-xs text-gray-500">Bal: {formatBalance(libBalance)}</span>
                       </div>
                       <input 
                         className="bg-transparent w-full text-2xl outline-none" 
                         placeholder="0.0" 
                         value={amountA}
                         onChange={e => setAmountA(e.target.value)}
                       />
                    </div>
                     <div className="flex justify-center -my-3 z-10">
                        <span className="text-gray-500">+</span>
                     </div>
                    <div className="bg-[#0d111c] p-4 rounded-xl">
                       <div className="flex justify-between mb-2">
                          <label className="text-gray-400">libUSD Amount</label>
                          <span className="text-xs text-gray-500">Bal: {formatBalance(usdBalance)}</span>
                       </div>
                       <input 
                         className="bg-transparent w-full text-2xl outline-none" 
                         placeholder="0.0" 
                         value={amountB}
                         onChange={e => setAmountB(e.target.value)}
                       />
                    </div>
                 </div>

                 <div className="grid grid-cols-1 gap-2 mt-2">
                    <div className="flex gap-2">
                        <button onClick={() => approve(libTokenAddress, amountA)} className="flex-1 bg-[#293249] py-3 rounded-xl font-bold text-[#4c82fb]">Approve LIB</button>
                        <button onClick={() => approve(libUSDAddress, amountB)} className="flex-1 bg-[#293249] py-3 rounded-xl font-bold text-[#4c82fb]">Approve libUSD</button>
                    </div>
                    <button onClick={addLiquidity} className="w-full bg-[#4c82fb] py-3 rounded-xl font-bold text-white text-lg">Add Liquidity</button>
                 </div>
             </div>
          )}

          {tab === 'faucet' && (
            <div className="flex flex-col gap-4 p-4 text-center">
               <div className="bg-[#1b2236] p-4 rounded-xl text-sm text-gray-300">
                  Mint test tokens to simulate trading on Tempo Testnet.
               </div>
               
               <button 
                onClick={() => window.open('https://docs.tempo.xyz/guide/use-accounts/add-funds', '_blank')}
                className="w-full bg-[#293249] hover:bg-[#343e59] p-4 rounded-2xl flex items-center justify-between group border border-yellow-500/30"
              >
                  <div className="flex items-center gap-3">
                     <span className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-xs font-bold text-black">⛽</span>
                     <div className="text-left">
                        <span className="font-bold text-lg block">Get Tempo USD (Gas)</span>
                        <span className="text-xs text-gray-400">Required for transaction fees</span>
                     </div>
                  </div>
                  <span className="text-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity">Open &rarr;</span>
               </button>

               <button 
                onClick={() => mintTokens(libTokenAddress)}
                className="w-full bg-[#293249] hover:bg-[#343e59] p-4 rounded-2xl flex items-center justify-between group"
              >
                  <div className="flex items-center gap-3">
                     <span className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold">L</span>
                     <span className="font-bold text-lg">Mint 1000 LIB</span>
                  </div>
                  <span className="text-pink-500 opacity-0 group-hover:opacity-100 transition-opacity">Mint &rarr;</span>
               </button>

               <button 
                onClick={() => mintTokens(libUSDAddress)}
                className="w-full bg-[#293249] hover:bg-[#343e59] p-4 rounded-2xl flex items-center justify-between group"
              >
                  <div className="flex items-center gap-3">
                     <span className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-xs font-bold">$</span>
                     <span className="font-bold text-lg">Mint 1000 libUSD</span>
                  </div>
                   <span className="text-pink-500 opacity-0 group-hover:opacity-100 transition-opacity">Mint &rarr;</span>
               </button>
            </div>
          )}

          {tab === 'create' && (
            <div className="flex flex-col gap-4 p-4">
               <div className="bg-[#1b2236] p-4 rounded-xl text-sm text-gray-300">
                  Create your own ERC20 token on Tempo.
               </div>
               
               <div className="grid gap-2">
                  <div className="bg-[#0d111c] p-4 rounded-xl">
                     <label className="text-gray-400 mb-2 block">Token Name</label>
                     <input 
                       className="bg-transparent w-full text-lg outline-none text-white placeholder-gray-600" 
                       placeholder="e.g. My Custom Token" 
                       value={newTokenName}
                       onChange={e => setNewTokenName(e.target.value)}
                     />
                  </div>
                  <div className="bg-[#0d111c] p-4 rounded-xl">
                     <label className="text-gray-400 mb-2 block">Symbol</label>
                     <input 
                       className="bg-transparent w-full text-lg outline-none text-white placeholder-gray-600" 
                       placeholder="e.g. MCT" 
                       value={newTokenSymbol}
                       onChange={e => setNewTokenSymbol(e.target.value)}
                     />
                  </div>
                  <div className="bg-[#0d111c] p-4 rounded-xl">
                     <label className="text-gray-400 mb-2 block">Initial Supply</label>
                     <input 
                       className="bg-transparent w-full text-lg outline-none text-white placeholder-gray-600" 
                       placeholder="1000000000" 
                       type="number"
                       value={newTokenSupply}
                       onChange={e => setNewTokenSupply(e.target.value)}
                     />
                  </div>
               </div>

               <button 
                onClick={createToken}
                disabled={!newTokenName || !newTokenSymbol || isPending}
                className="w-full bg-[#4c82fb] hover:bg-[#3b66c4] disabled:bg-[#293249] disabled:text-gray-500 py-4 rounded-2xl font-bold text-white text-lg transition-colors"
              >
                {isPending ? 'Creating...' : 'Create Token'}
              </button>
            </div>
          )}
          
          {tab === 'nft' && (
            <div className="flex flex-col gap-4 p-4">
               <div className="bg-[#1b2236] p-4 rounded-xl text-sm text-gray-300">
                  Mint an NFT to your address. Provide a full tokenURI (e.g. https://.../metadata.json).
               </div>
               <div className="bg-[#0d111c] p-4 rounded-xl">
                 <label className="text-gray-400 mb-2 block">tokenURI</label>
                 <input
                   className="bg-transparent w-full text-lg outline-none text-white placeholder-gray-600"
                   placeholder="https://example.com/metadata.json"
                   value={nftURI}
                   onChange={e => setNftURI(e.target.value)}
                 />
               </div>

               <button
                 onClick={mintNft}
                 disabled={!nftURI || isPending}
                 className="w-full bg-[#4c82fb] hover:bg-[#3b66c4] disabled:bg-[#293249] disabled:text-gray-500 py-4 rounded-2xl font-bold text-white text-lg transition-colors"
               >
                 {isPending ? 'Minting...' : 'Mint NFT'}
               </button>
            </div>
          )}

          {tab === 'batch' && (
            <div className="flex flex-col gap-4 p-4">
               <div className="bg-[#1b2236] p-4 rounded-xl text-sm text-gray-300">
                  Batch transfer a stablecoin to multiple recipients. Paste addresses (one per line / comma / semicolon) and set the amount per recipient.
               </div>

               <div className="bg-[#0d111c] p-4 rounded-xl">
                 <label className="text-gray-400 mb-2 block">Token address (ERC20)</label>
                 <input
                   className="bg-transparent w-full text-lg outline-none text-white placeholder-gray-600"
                   value={batchToken}
                   onChange={e => setBatchToken(e.target.value)}
                 />
               </div>

               <div className="bg-[#0d111c] p-4 rounded-xl">
                 <label className="text-gray-400 mb-2 block">Recipients (one per line / comma / semicolon)</label>
                 <textarea
                   className="bg-transparent w-full text-sm outline-none text-white placeholder-gray-600 h-32"
                   placeholder={"0xabc...\n0xdef...\n0xghi..."}
                   value={batchRecipients}
                   onChange={e => setBatchRecipients(e.target.value)}
                 />
               </div>

               <div className="bg-[#0d111c] p-4 rounded-xl">
                 <label className="text-gray-400 mb-2 block">Amount per recipient</label>
                 <input
                   className="bg-transparent w-full text-lg outline-none text-white placeholder-gray-600"
                   placeholder="10"
                   type="number"
                   min="0"
                   value={batchAmount}
                   onChange={e => setBatchAmount(e.target.value)}
                 />
               </div>

               <div className="grid grid-cols-2 gap-2">
                 <button
                   onClick={approveBatch}
                   disabled={!batchAmount || !batchRecipients}
                   className="bg-[#293249] hover:bg-[#343e59] text-[#4c82fb] font-bold py-4 rounded-2xl text-lg transition-colors disabled:opacity-50"
                 >
                   Approve
                 </button>
                 <button
                   onClick={sendBatch}
                   disabled={!batchAmount || !batchRecipients}
                   className="bg-[#4c82fb] hover:bg-[#3b66c4] text-white font-bold py-4 rounded-2xl text-lg transition-colors disabled:bg-[#293249] disabled:text-gray-500"
                 >
                   Send Batch
                 </button>
               </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm break-all">
               {error.message}
            </div>
          )}
          
          {hash && (
            <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-500 text-sm flex justify-between items-center">
               <span>Transaction Submitted</span>
               <a href={`https://explore.tempo.xyz/tx/${hash}`} target="_blank" className="underline">View</a>
            </div>
          )}

        </div>
      </main>

       {/* Footer */}
       <footer className="w-full p-6 text-center text-gray-600 text-sm">
          Tempo Testnet DEX Demo
       </footer>
    </div>
  )
}

export default App
