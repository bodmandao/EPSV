import abi from './ABI.json'

export const CONTRACT_ADDRESS = "0x9F98d5770f205600b97AF8028C1bD3D5B917FbFD"
export const CONTRACT_ABI = abi
export const APPROVAL_ABI = [

  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
]