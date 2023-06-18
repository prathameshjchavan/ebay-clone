"use client";

import Header from "@/components/Header";
import {
	useAddress,
	useContract,
	MediaRenderer,
	useChain,
	useNetworkMismatch,
	useOwnedNFTs,
	useCreateAuctionListing,
	useCreateDirectListing,
	NFT,
} from "@thirdweb-dev/react";
import { useState } from "react";

type Props = {};

const page = (props: Props) => {
	const address = useAddress();
	const { contract } = useContract(
		process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT,
		"marketplace"
	);
	const { contract: collectionContract } = useContract(
		process.env.NEXT_PUBLIC_COLLECTION_CONTRACT,
		"nft-collection"
	);
	const ownedNFTS = useOwnedNFTs(collectionContract, address);
	const [selectedNft, setSelectedNft] = useState<NFT>();
	console.log(selectedNft);

	return (
		<div>
			<Header />

			<main className="max-w-6xl mx-auto p-10 pt-2">
				<h1 className="text-4xl font-bold">List an Item</h1>
				<h2 className="text-xl font-semibold pt-5">
					Select an Item you would like to Sell
				</h2>

				<hr className="mb-5" />

				<p>Below you will find the NFT's you own in your wallet</p>

				<div className="flex overflow-x-auto space-x-2 p-4">
					{ownedNFTS.data?.map((nft) => (
						<div
							onClick={() => setSelectedNft(nft)}
							className="flex flex-col w-64 space-y-2 card border-2 bg-gray-100"
							key={nft.metadata.id}
						>
							<MediaRenderer
								className="h-48 rounded-lg"
								src={nft.metadata.image}
							/>
							<p className="text-lg truncate font-bold">{nft.metadata.name}</p>
							<p className="text-xs truncate">{nft.metadata.description}</p>
						</div>
					))}
				</div>
			</main>
		</div>
	);
};

export default page;
