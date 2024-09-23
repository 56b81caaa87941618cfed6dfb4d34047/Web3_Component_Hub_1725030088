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
import { ref, onMounted } from 'vue'
import { ethers } from 'ethers'

export default {
  name: 'WrapEther',
  setup() {
    const walletConnected = ref(false)
    const amount = ref('')
    const result = ref('')
    const error = ref('')
    const contract = ref(null)

    const contractABI = [
      {
        name: "deposit",
        stateMutability: "payable",
        inputs: [],
        outputs: []
      }
    ]

    const contractAddress = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'

    onMounted(async () => {
      if (window.ethereum) {
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' })
          walletConnected.value = true
          const provider = new ethers.BrowserProvider(window.ethereum)
          const signer = await provider.getSigner()
          contract.value = new ethers.Contract(contractAddress, contractABI, signer)
        } catch (err) {
          error.value = 'Failed to connect wallet: ' + err.message
        }
      } else {
        error.value = 'MetaMask is not installed'
      }
    })

    const connectWallet = async () => {
      if (window.ethereum) {
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' })
          walletConnected.value = true
          error.value = ''
        } catch (err) {
          error.value = 'Failed to connect wallet: ' + err.message
        }
      } else {
        error.value = 'MetaMask is not installed'
      }
    }

    const wrapEther = async () => {
      if (!walletConnected.value) {
        error.value = 'Please connect your wallet first'
        return
      }

      if (!amount.value || amount.value <= 0) {
        error.value = 'Please enter a valid amount'
        return
      }

      try {
        const amountInWei = ethers.parseEther(amount.value)
        const tx = await contract.value.deposit({ value: amountInWei })
        await tx.wait()
        result.value = `Successfully wrapped ${amount.value} ETH to WETH`
        error.value = ''
      } catch (err) {
        error.value = 'Failed to wrap Ether: ' + err.message
        result.value = ''
      }
    }

    return () => ({
      walletConnected,
      amount,
      result,
      error,
      connectWallet,
      wrapEther
    })
  }
}
}
</script>