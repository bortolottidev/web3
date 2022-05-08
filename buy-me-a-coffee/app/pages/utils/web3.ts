import { ethers } from 'ethers'
import { toast } from 'react-toastify'
import contract from '../../contracts/CoffeeFactory.json'

const contractABI = contract.abi
// .env is your friend but im lazy
const contractAddress = '0xC625D5F735B95252C925141cAbf7578fFECc8660'

export const connectWallet = (setCurrentAccountFn) => async () => {
  try {
    const { ethereum } = window
    if (!ethereum) {
      toast.warn('Make sure your metamask is connected', {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
      return
    }

    const accounts = await ethereum.request({
      method: 'eth_requestAccounts',
    })

    const [currentAccount] = accounts

    console.log('Welcome', currentAccount)
    setCurrentAccountFn(currentAccount)
  } catch (error) {
    console.error('Cannot connect wallet', error)
  }
}

export const checkIfWalletIsConnected = (setCurrentAccountFn) => async () => {
  try {
    const { ethereum } = window

    const [account] = await ethereum.request({ method: 'eth_accounts' })
    if (account) {
      setCurrentAccountFn(account)
      toast.success('🦄 Wallet is Connected', {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
      return
    }

    toast.warn('Make sure you have MetaMask Connected', {
      position: 'top-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    })
  } catch (error) {
    toast.error(error.message, {
      position: 'top-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    })
  }
}

export const printBalance = async () => {
  try {
    const { ethereum } = window
    if (!ethereum) {
      console.log('Have you correctly installed metamask?')
      throw new Error('Cannot find ethereum connect000r')
    }

    const provider = new ethers.providers.Web3Provider(ethereum)
    const balance = await provider.getBalance(contractAddress)
    console.log('Contract balance: ', ethers.utils.formatUnits(balance, 'wei'))
  } catch (error) {
    console.error('Cannot retrieve contract balance', error)
  }
}

export const buyCoffee = (setMessageFn, setNameFn) => async (name, message) => {
  try {
    const { ethereum } = window
    if (!ethereum) {
      console.log('Have you correctly installed metamask?')
      throw new Error('Cannot find ethereum connect000r')
    }

    //repetita iuvant
    const provider = new ethers.providers.Web3Provider(ethereum)
    const signer = provider.getSigner()
    const coffeFactoryContract = new ethers.Contract(
      contractAddress,
      contractABI,
      signer
    )

    let count = await coffeFactoryContract.getTotalCoffee()
    console.log('Already served coffee: ', count.toNumber())
    printBalance()

    const coffeeTxn = await coffeFactoryContract.buyACoffee(
      message || 'Enjoy your coffee!',
      name || 'An anonymous fan',
      {
        value: ethers.utils.parseEther('0.001'),
        gasLimit: 300000,
      }
    )
    console.log('Mining time.....')

    toast.info('Sending fund for coffee', {
      position: 'top-left',
      autoClose: 18050,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    })

    await coffeeTxn.wait()
    console.log('Mined!')

    count = await coffeFactoryContract.getTotalCoffee()
    console.log('Now you have another coffee: ', count.toNumber())
    printBalance()

    setMessageFn('')
    setNameFn('')

    toast.success('Coffee Purchased!', {
      position: 'top-left',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    })
  } catch (error) {
    console.error('Cannot buy a coffee', error)
    toast.error(error.message, {
      position: 'top-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    })
  }
}

export const getAllCoffee = (setAllCoffeeFn) => async () => {
  try {
    const { ethereum } = window
    if (!ethereum) {
      throw new Error('Ethereum object doesnt exists, check your metamask!')
    }

    const provider = new ethers.providers.Web3Provider(ethereum)
    const signer = provider.getSigner()
    const coffeFactoryContract = new ethers.Contract(
      contractAddress,
      contractABI,
      signer
    )

    const coffees = await coffeFactoryContract.getAllCoffee()
    console.log('coffees found', coffees)
    setAllCoffeeFn(coffees)
  } catch (error) {
    console.log('Cannot get all coffee', error)

    toast.error(error.message, {
      position: 'top-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    })
  }
}
