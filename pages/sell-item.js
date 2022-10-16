import nftAbi from "../constants/BasicNft.json"
import nftMarketplaceAbi from "../constants/NftMarketplace.json"
import networkMapping from "../constants/networkMapping.json"
import { ethers } from "ethers"
import { useContractRead, useNetwork, useAccount, useContract } from "wagmi"
import { useEffect, useState } from "react"

const sellItem = () => {
    const { chain } = useNetwork()
    const { isConnected, address } = useAccount()
    const marketplaceAddress = networkMapping[31337].NftMarketplace[0]
    const [proceeds, setProceeds] = useState("0")

    useEffect(() => {
        function setupUI() {
            const returnProceeds = useContractRead({
                address: marketplaceAddress,
                abi: nftMarketplaceAbi,
                function: "getProceeds",
                args: [address],
            })
            if (returnProceeds) {
                setProceeds(returnProceeds.toString())
            }
        }

        if (isConnected) {
            setupUI()
        }
    }, [isConnected])

    async function approveAndList(data) {
        console.log("Approving...")
        const nftAddress = data.data[0].inputResult
        const tokenId = data.data[1].inputResult
        const price = ethers.utils.parseUnits(data.data[2].inputResult, "ether").toString()

        const approveOptions = {
            abi: nftAbi,
            contractAddress: nftAddress,
            functionName: "approve",
            params: {
                to: marketplaceAddress,
                tokenId: tokenId,
            },
        }

        await runContractFunction({
            params: approveOptions,
            onSuccess: () => handleApproveSuccess(nftAddress, tokenId, price),
            onError: (error) => {
                console.log(error)
            },
        })
    }
    async function handleApproveSuccess(nftAddress, tokenId, price) {
        console.log("Ok! Now time to list")
        const listOptions = {
            abi: nftMarketplaceAbi,
            contractAddress: marketplaceAddress,
            functionName: "listItem",
            params: {
                nftAddress: nftAddress,
                tokenId: tokenId,
                price: price,
            },
        }

        await runContractFunction({
            params: listOptions,
            onSuccess: handleListSuccess,
            onError: (error) => console.log(error),
        })
    }

    async function handleListSuccess(tx) {
        await tx.wait(1)
        dispatch({
            type: "success",
            message: "NFT listing",
            title: "NFT listed",
            position: "topR",
        })
    }

    const handleWithdrawSuccess = async (tx) => {
        await tx.wait(1)
        dispatch({
            type: "success",
            message: "Withdrawing proceeds",
            position: "topR",
        })
    }

    async function approveAndListNft(data) {
        console.log("Approving nft...")
        const nftAddress = data.data[0].inputResult
        const tokenId = data.data[1].inputResult
        const price = ethers.utils.parseUnits(data.data[2].inputResult, "ethers").toString()

        const approveOptions = {
            abi: nftAbi,
            contractAddress: nftAddress,
            functionName: "approve",
            params: {
                to: marketplaceAddress,
                from: tokenId,
            },
            onError: (error) => console.log(error),
            onSuccess: handleWithdrawSuccess,
        }
    }

    async function withdrawProceeds() {
        console.log("Withdraw proceeds...")
        const withdraw = await useContractRead({
            abi: nftAbi,
            address: nftAddress,
            functionName: "withdraw",
            args: [],
        })
    }

    /*
    async function setupUI() {
        const returnProceeds = useContractRead({
            address: marketplaceAddress,
            abi: nftMarketplaceAbi,
            function: "getProceeds",
            args: [address],
        })
        if (returnProceeds) {
            setProceeds(returnProceeds.toString())
        }
    }
    */
    return (
        <div>
            {isConnected ? (
                <div>
                    {chain.id == 5 || chain.id == 31337 ? (
                        <div className="flex flex-col">
                            <h1 className="m-5 text-2xl font-semibol text-blue-900">
                                Sell your nft
                            </h1>
                            <form onSubmit={approveAndListNft}>
                                <div className="m-5">
                                    <input
                                        type="text"
                                        name="nftaddress"
                                        placeholder="Nft Address"
                                        className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400
                focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500
                disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none
                invalid:border-pink-500 invalid:text-pink-600 max-w-[25%]"
                                    />
                                </div>
                                <div className="m-5">
                                    <input
                                        type="number"
                                        name="tokenId"
                                        placeholder="NFT TokenId"
                                        className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400
                focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500
                disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none
                invalid:border-pink-500 invalid:text-pink-600 max-w-[25%]"
                                    />
                                </div>
                                <div className="m-5">
                                    <input
                                        type="number"
                                        name="price"
                                        placeholder="Price in ETH"
                                        className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400
                focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500
                disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none max-w-[25%]"
                                    />
                                </div>

                                <label type="submit">
                                    <button className="rounded-md m-5 bg-blue-600 text-white h-8 w-full">
                                        Sumbit
                                    </button>
                                </label>
                            </form>

                            <div>
                                <h2 className="text-blue-800 font-semibold text-2xl px-5">
                                    Withdraw proceeds
                                </h2>
                                <a className="text-xl px-5 py-2">Your balance is {proceeds} ETH</a>
                                <div>
                                    <label type="submit">
                                        <button
                                            className="rounded-md m-5 bg-blue-600 text-white h-6 w-full"
                                            onClick={withdrawProceeds}
                                        >
                                            Withdraw
                                        </button>
                                    </label>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <h1>Invalid net, only goerli(5) and localhost(31337) are valid</h1>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex justify-center">
                    <h2 className="text-blue-700 text-4xl font-extrabold">Connect your wallet</h2>
                </div>
            )}
        </div>
    )
}

export default sellItem
