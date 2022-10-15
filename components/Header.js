import Link from "next/link"

export default function Header() {
    return (
        <nav className="border-b -p6">
            <p className="text-4xl font-bold m-3">Fxop Nft Marketplace</p>
            <div className="flex mt-4">
                <Link href="/">
                    <a className="mr-4 text-teal-500 px-5 text-2xl font-semibold">Home</a>
                </Link>
                <Link href="/create-item">
                    <a className="mr-4 text-teal-500 px-5 text-2xl font-semibold">Create NFT</a>
                </Link>
                <Link href="/my-assets">
                    <a className="mr-4 text-teal-500 px-5 text-2xl font-semibold">My assets</a>
                </Link>
                <Link href="/creator-dashboard">
                    <a className="mr-4 text-teal-500 px-5 text-2xl font-semibold">
                        Creator dashboard
                    </a>
                </Link>
            </div>
        </nav>
    )
}
