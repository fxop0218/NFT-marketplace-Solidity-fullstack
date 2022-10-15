import { useEffect, useState } from "react"
import { axios } from "axios"
import Web3Modal from "Web3Modal"
//import { network } from "hardhat"

export default function Home() {
    /*
    const chainId = network.config.chainId
    const [nfts, setNfts] = useState([])
    const [loadingState, setLoadingState] = useState("not-loaded")

    useEffect(() => {
        loadNft()
    }, [])
    async function loadNft() {
        const provider = new ethers.providers.JsonRpcProvider()
        const marketContract = new ethers.Contract(
            marketAddress[chainId]["NftMarketplace"],
            Market,
            provider 
        )
        const data = await marketContract.fetch
    }
    */
    return (
        <div>
            <h2>Home page</h2>
        </div>
    )
}
