const { network, ethers } = require("hardhat")
const { fs } = require("fs")

const frontEndDir = "../constants/networkMapping.json"
module.exports = async () => {
    if (process.env.UPDATE_FRONT_END) {
        updateFrontend()
    }
}

async function updateFrontend() {
    const nftMarketplace = await ethers.getContract("NftMarketplace")
    const chainId = network.config.chainId

    if (!fs.exists(frontEndDir)) {
        var dir = { chainId: [nftMarketplace.address] }
        fs.writeFile(frontEndDir, dir, function (err, result) {
            if (err) console.log("error", err)
        })
    } else {
        const contractAddress = JSON.parse(fs.readFileSync())
        if (contractAddress in chainId) {
            if (contractAddress[chainId]["NftMarketplace"].includes(nftMarketplace.address)) {
                contractAddress[chainId]["NftMarketplace"].push(nftMarketplace.address)
            } else {
                contractAddress[chainId] = { NftMarketplace: [nftMarketplace.address] }
            }
        }
        console.log(contractAddress)
        fs.writeFileSync(frontEndDir, JSON.stringify(contractAddressess))
        console.log("Completed")
    }
}

module.exports.tags = ["all", "updatefrontend"]
