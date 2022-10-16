import "../styles/globals.css"
import Header from "../components/Header"
import { ChainId, ThirdwebProvider } from "@thirdweb-dev/react"
import { WagmiConfig, createClient, configureChains, chain, defaultChains } from "wagmi"
import { publicProvider } from "wagmi/providers/public"
import { SessionProvider } from "next-auth/react"
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit"

const { chains, provider, webSocketProvider } = configureChains(
    [chain.goerli, chain.hardhat],
    [publicProvider()]
)

const { connectors } = getDefaultWallets({
    appName: "My RainbowKit App",
    chains,
})

const client = createClient({
    autoConnect: true,
    provider,
    webSocketProvider,
    connectors,
})

function MyApp({ Component, pageProps }) {
    return (
        <div>
            <WagmiConfig client={client}>
                <SessionProvider>
                    <RainbowKitProvider chains={chains}>
                        <Header />
                        <Component {...pageProps} />
                    </RainbowKitProvider>
                </SessionProvider>
            </WagmiConfig>
        </div>
    )
}

export default MyApp
