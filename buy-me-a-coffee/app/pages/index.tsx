import type { NextPage } from 'next'
import { useEffect, useState } from 'react'
import Head from 'next/head'
import contract from '../contracts/CoffeeFactory.json'
import { ethers } from 'ethers'
import {
  connectWallet,
  buyCoffee,
  checkIfWalletIsConnected,
  getAllCoffee,
  printBalance,
} from './utils/web3'

import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const Home: NextPage = () => {
  // WHERE IS MY CONTRACTTTTT
  const contractAddress = '0xC625D5F735B95252C925141cAbf7578fFECc8660'
  const contractABI = contract.abi

  const [currentAccount, setCurrentAccount] = useState(null)
  const [message, setMessage] = useState('')
  const [name, setName] = useState('')
  const [allCoffee, setAllCoffee] = useState([])

  // on page load
  useEffect(() => {
    let coffeFactoryContract

    checkIfWalletIsConnected(setCurrentAccount)()
    getAllCoffee(setAllCoffee)()
    printBalance()

    const onNewCoffee = (from, timestamp, message, name) => {
      console.log('new coffee!', { from, timestamp, message, name })
      setAllCoffee((prevState) => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message,
          name,
        },
      ])
    }

    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      // your wallet
      const signer = provider.getSigner()

      coffeFactoryContract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      )

      // triggered by event
      coffeFactoryContract.on('NewCoffeeHurray', onNewCoffee)
    }

    // clean all
    return () => {
      if (!coffeFactoryContract) {
        return
      }
      coffeFactoryContract.off('NewCoffeeHurray', onNewCoffee)
    }
  }, [])

  const connectYourWalletButton = () => (
    <button
      className="mt-3 rounded-full bg-blue-500 py-2 px-3 font-bold text-white hover:bg-blue-700"
      onClick={connectWallet(setCurrentAccount)}
    >
      Connect Your Wallet
    </button>
  )

  const onNameChange = (event) => {
    const { value } = event.target
    setName(value)
  }
  const onMessageChange = (event) => {
    const { value } = event.target
    setMessage(value)
  }

  const displaySendCoffee = () => (
    <div className="sticky top-3 z-50 w-full max-w-xs">
      <form className="mb-4 rounded bg-white px-8 pt-6 pb-8 shadow-md">
        <div className="mb-4">
          <label
            className="mb-2 block text-sm font-bold text-gray-700"
            htmlFor="name"
          >
            Name
          </label>
          <input
            className="focus:shadow-outline w-full appearance-none rounded border py-2 px-3 leading-tight text-gray-700 shadow focus:outline-none"
            id="name"
            placeholder="Name"
            onChange={onNameChange}
            type="text"
            required
          />
        </div>

        <div className="mb-4">
          <label
            className="mb-2 block text-sm font-bold text-gray-700"
            htmlFor="message"
          >
            Customize with a funny message
          </label>

          <textarea
            className="form-textarea focus:shadow-outline mt-1 block w-full appearance-none rounded border py-2 px-3 leading-tight text-gray-700 shadow focus:outline-none"
            rows="3"
            placeholder="Message"
            id="message"
            onChange={onMessageChange}
            required
          ></textarea>
        </div>

        <div className="items-left flex justify-between">
          <button
            className="focus:shadow-outline rounded bg-blue-500 py-2 px-4 text-center font-bold text-white hover:bg-blue-700 focus:outline-none"
            type="button"
            onClick={() => buyCoffee(setMessage, setName)(name, message)}
          >
            Support $5
          </button>
        </div>
      </form>
    </div>
  )

  const displayedCoffees = allCoffee.map((coffee, i) => {
    return (
      <div className="mt-10 border-l-2" key={i}>
        <div className="relative ml-10 mb-10 flex transform cursor-pointer flex-col items-center space-y-4 rounded bg-blue-800 px-6 py-4 text-white transition hover:-translate-y-2 md:flex-row md:space-y-0">
          {/* <!-- Dot Following the Left Vertical Line --> */}
          <div className="absolute -left-10 z-10 mt-2 h-5 w-5 -translate-x-2/4 transform rounded-full bg-blue-600 md:mt-0"></div>

          {/* <!-- Line that connecting the box with the vertical line --> */}
          <div className="absolute -left-10 z-0 h-1 w-10 bg-green-300"></div>

          {/* <!-- Content that showing in the box --> */}
          <div className="flex-auto">
            <h1 className="text-md">Supporter: {coffee.name}</h1>
            <h1 className="text-md">Message: {coffee.message}</h1>
            <h3>Address: {coffee.address}</h3>
            <h1 className="text-md font-bold">
              TimeStamp: {coffee.timestamp.toString()}
            </h1>
          </div>
        </div>
      </div>
    )
  })

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <Head>
        <title>Buy me a ☕!</title>
        <link rel="icon" href="favicon.ico" />
      </Head>

      <main className="flex w-full flex-1 flex-col items-center px-20 text-center">
        <h1 className="mb-6 text-6xl font-bold text-blue-600">
          Hey, this is for poc sake
        </h1>
        <h3 className="mb-3 text-3xl">
          And we're on ropsten, so feel free to offer me lot of coffeess!
        </h3>
        {currentAccount ? displaySendCoffee() : connectYourWalletButton()}

        {displayedCoffees}
      </main>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  )
}

export default Home
