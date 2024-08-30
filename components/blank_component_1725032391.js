<template>
  <div class="container mx-auto p-4 bg-white bg-opacity-20 backdrop-blur-lg rounded-lg shadow-lg">
    <h1 class="text-2xl font-bold mb-4 text-fuchsia-600">Wrap Ether (WETH9)</h1>
    <div class="mb-4">
      <button @click="connectWallet" class="bg-fuchsia-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-fuchsia-700 transition duration-300">
        {{ walletConnected ? 'Wallet Connected' : 'Connect Wallet' }}
      </button>
    </div>
    <div class="mb-4">
      <label for="amount" class="block mb-2">Amount of Ether to Wrap:</label>
      <input
        id="amount"
        v-model="amount"
        type="number"
        min="0"
        step="0.01"
        class="w-full p-2 border border-fuchsia-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fuchsia-600"
        placeholder="Enter amount in ETH"
      />
    </div>
    <button
      @click="wrapEther"
      :disabled="!walletConnected || !amount"
      class="bg-fuchsia-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-fuchsia-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      Wrap Ether
    </button>
    <div v-if="result" class="mt-4 p-4 bg-white bg-opacity-30 rounded-lg shadow-md">
      <h2 class="text-lg font-semibold mb-2">Transaction Result:</h2>
      <p>{{ result }}</p>
    </div>
    <div v-if="error" class="mt-4 p-4 bg-red-100 text-red-700 rounded-lg shadow-md">
      <h2 class="text-lg font-semibold mb-2">Error:</h2>
      <p>{{ error }}</p>
    </div>
  </div>
</template>

<script>
import { ethers } from 'ethers'

export default {
  name: 'WrapEther',
  data() {
    return {
      walletConnected: false,
      amount: '',
      result: '',
      error: '',
      contract: null,
      contractABI: [
        {
          name: "deposit",
          stateMutability: "payable",
          inputs: [],
          outputs: []
        }
      ],
      contractAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
    }
  },
  mounted() {
    this.initWalletConnection()
  },
  methods: {
    async initWalletConnection() {
      if (window.ethereum) {
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' })
          this.walletConnected = true
          const provider = new ethers.BrowserProvider(window.ethereum)
          const signer = await provider.getSigner()
          this.contract = new ethers.Contract(this.contractAddress, this.contractABI, signer)
        } catch (err) {
          this.error = 'Failed to connect wallet: ' + err.message
        }
      } else {
        this.error = 'MetaMask is not installed'
      }
    },
    async connectWallet() {
      if (window.ethereum) {
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' })
          this.walletConnected = true
          this.error = ''
        } catch (err) {
          this.error = 'Failed to connect wallet: ' + err.message
        }
      } else {
        this.error = 'MetaMask is not installed'
      }
    },
    async wrapEther() {
      if (!this.walletConnected) {
        this.error = 'Please connect your wallet first'
        return
      }

      if (!this.amount || this.amount <= 0) {
        this.error = 'Please enter a valid amount'
        return
      }

      try {
        const amountInWei = ethers.parseEther(this.amount)
        const tx = await this.contract.deposit({ value: amountInWei })
        await tx.wait()
        this.result = `Successfully wrapped ${this.amount} ETH to WETH`
        this.error = ''
      } catch (err) {
        this.error = 'Failed to wrap Ether: ' + err.message
        this.result = ''
      }
    }
  }
}
</script>