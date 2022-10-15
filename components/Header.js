import Link from "next/link"
import { ConnectWallet } from "@thirdweb-dev/react"

export default function Header() {
    return (
        <nav className="p-5 border-b-2 flex flex-row justify-between items-center">
            <p className="text-4xl font-bold m-3">Fxop Nft Marketplace</p>
            <div className="flex mt-4">
                <Link href="/">
                    <a className="mr-4 text-teal-500 px-5 text-2xl font-semibold">Home</a>
                </Link>
                <Link href="/sell-item">
                    <a className="mr-4 text-teal-500 px-5 text-2xl font-semibold">Sell NFT</a>
                </Link>
                <Link href="/my-assets">
                    <a className="mr-4 text-teal-500 px-5 text-2xl font-semibold">My assets</a>
                </Link>
                <Link href="/creator-dashboard">
                    <a className="mr-4 text-teal-500 px-5 text-2xl font-semibold">
                        Creator dashboard
                    </a>
                </Link>
                <div className="mr-4">
                    <ConnectWallet accentColor="#55BBD4" colorMode="dark" />
                </div>
            </div>
        </nav>
    )
}
