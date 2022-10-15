require("dotenv").config()
const fs = require("fs")
const { network, ethers } = require("hardhat")
const {
    BASIC_NFT,
    NFT_MARKET,
    frontEndContractsFile,
    frontEndAbiLocation,
} = require("../helper-hardhat-config")

const frontEndDir = "./constants/networkMapping.json"
module.exports = async () => {
    if (process.env.UPDATE_FRONT_END) {
        console.log("02")
        await updateFrontend()
        await updateAbi()
    }
}

async function updateFrontend() {
    const chainId = network.config.chainId.toString()
    const nftMarketplace = await ethers.getContract(NFT_MARKET)

    const contractAddress = JSON.parse(fs.readFileSync(frontEndContractsFile, "utf8"))
    if (chainId in contractAddress) {
        if (!contractAddress[chainId][NFT_MARKET].includes(nftMarketplace.address)) {
            contractAddress[chainId][NFT_MARKET].push(nftMarketplace.address)
        } else {
            contractAddress[chainId] = { NftMarketplace: [nftMarketplace.address] }
        }
    }
    console.log(contractAddress)
    fs.writeFileSync(frontEndDir, JSON.stringify(contractAddress))
    console.log("Completed")
}

async function updateAbi() {
    const nftMarketplace = await ethers.getContract(NFT_MARKET)
    fs.writeFileSync(
        `${frontEndAbiLocation}NftMarketplace.json`,
        nftMarketplace.interface.format(ethers.utils.FormatTypes.json)
    )
    const basicNft = await ethers.getContract("BasicNft")
    fs.writeFileSync(
        `${frontEndAbiLocation}BasicNft.json`,
        basicNft.interface.format(ethers.utils.FormatTypes.json)
    )
    console.log("ABI created")
}

module.exports.tags = ["all", "updatefrontend"]
