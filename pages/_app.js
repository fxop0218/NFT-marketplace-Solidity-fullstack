import "../styles/globals.css"
import Header from "../components/Header"
import { ChainId, ThirdwebProvider } from "@thirdweb-dev/react"

const activeChainId = [ChainId.Goerli, "31337"]

function MyApp({ Component, pageProps }) {
    return (
        <div>
            <ThirdwebProvider desiredChainId={activeChainId}>
                <Header />
                <Component {...pageProps} />
            </ThirdwebProvider>
        </div>
    )
}

export default MyApp
