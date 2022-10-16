import { signIn, useSession } from "next-auth/react"
import { useAccount, useSignMessage, useNetwork } from "wagmi"
import { useEffect } from "react"
import { useRouter } from "next/router"
import axios from "axios"
//import { network } from "hardhat"

export default function Home() {
    const { isConnected, address } = useAccount()
    const { chain } = useNetwork()
    const { status } = useSession()
    const { signMessageAsync } = useSignMessage()
    const { push } = useRouter()

    console.log(`Network: ${chain.id}`)

    return (
        <div>
            {isConnected ? (
                <h1>
                    Wallet address: {address} in {chain.name} ({chain.id}) network
                </h1>
            ) : (
                <h1>Connect your wallet</h1>
            )}
        </div>
    )
}
