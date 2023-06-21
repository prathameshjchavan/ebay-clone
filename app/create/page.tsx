"use client";

import Header from "@/components/Header";
import network from "@/utils/network";
import {
	useAddress,
	useContract,
	MediaRenderer,
	useSwitchChain,
	useNetworkMismatch,
	useOwnedNFTs,
	useCreateAuctionListing,
	useCreateDirectListing,
	NFT,
	NATIVE_TOKENS,
	NATIVE_TOKEN_ADDRESS,
} from "@thirdweb-dev/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {};

const CreatePage = (props: Props) => {
	const [selectedNft, setSelectedNft] = useState<NFT>();

	const address = useAddress();
	const router = useRouter();
	const { contract } = useContract(
		process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT,
		"marketplace"
	);
	const { contract: collectionContract } = useContract(
		process.env.NEXT_PUBLIC_COLLECTION_CONTRACT,
		"nft-collection"
	);
	const ownedNFTS = useOwnedNFTs(collectionContract, address);
	const networkMismatch = useNetworkMismatch();
	const switchChain = useSwitchChain();
	const {
		mutate: createDirectListing,
		isLoading: isLoadingDirect,
		error: errorDirect,
	} = useCreateDirectListing(contract);
	const {
		mutate: createAuctionListing,
		isLoading: isLoadingAuction,
		error: errorAuction,
	} = useCreateAuctionListing(contract);

	const handleCreateListing = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (networkMismatch) {
			switchChain(network);
			return;
		}

		if (!selectedNft) return;

		const target = e.target as typeof e.target & {
			elements: {
				listingType: { value: "directListing" | "auctionListing" };
				price: { value: string };
			};
		};

		const { listingType, price } = target.elements;

		if (listingType.value === "directListing") {
			createDirectListing(
				{
					assetContractAddress: process.env.NEXT_PUBLIC_COLLECTION_CONTRACT!,
					tokenId: selectedNft.metadata.id,
					currencyContractAddress: NATIVE_TOKEN_ADDRESS,
					listingDurationInSeconds: 60 * 60 * 24 * 7, // 1 week
					quantity: 1,
					buyoutPricePerToken: price.value,
					startTimestamp: new Date(),
				},
				{
					onSuccess(data, variables, context) {
						router.push("/");
					},
					onError(error, variables, context) {
						console.log("ERROR: ", error, variables, context);
					},
				}
			);
		}

		if (listingType.value === "auctionListing") {
			createAuctionListing(
				{
					assetContractAddress: process.env.NEXT_PUBLIC_COLLECTION_CONTRACT!,
					buyoutPricePerToken: price.value,
					tokenId: selectedNft.metadata.id,
					startTimestamp: new Date(),
					currencyContractAddress: NATIVE_TOKEN_ADDRESS,
					listingDurationInSeconds: 60 * 60 * 24 * 7, // 1 week
					quantity: 1,
					reservePricePerToken: 0,
				},
				{
					onSuccess(data, variables, context) {
						router.push("/");
					},
					onError(error, variables, context) {
						console.log("ERROR: ", error, variables, context);
					},
				}
			);
		}
	};

	return (
		<div>
			<Header />

			<main className="max-w-6xl mx-auto p-10 pt-2">
				<h1 className="text-4xl font-bold">List an Item</h1>
				<h2 className="text-xl font-semibold pt-5">
					Select an Item you would like to Sell
				</h2>

				<hr className="mb-5" />

				<p>Below you will find the NFT&apos;s you own in your wallet</p>

				<div className="flex overflow-x-auto space-x-2 p-4">
					{ownedNFTS.data?.map((nft) => (
						<div
							onClick={() => setSelectedNft(nft)}
							className={`flex flex-col w-64 space-y-2 card border-2 bg-gray-100 ${
								nft.metadata.id === selectedNft?.metadata.id
									? "border-black"
									: "border-transparent"
							}`}
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

				{selectedNft && (
					<form onSubmit={handleCreateListing}>
						<div className="flex flex-col p-10">
							<div className="grid grid-cols-2 gap-5">
								<label className="border-r font-light">
									Direct Listing / Fixed Price
								</label>
								<input
									className="ml-auto h-10 w-10"
									type="radio"
									name="listingType"
									value="directListing"
								/>

								<label className="border-r font-light">Auction</label>
								<input
									className="ml-auto h-10 w-10"
									type="radio"
									name="listingType"
									value="auctionListing"
								/>

								<label className="border-r font-light">Price</label>
								<input
									type="text"
									name="price"
									placeholder="0.05"
									className="bg-gray-100 p-5"
								/>
							</div>
							<button
								type="submit"
								className="bg-blue-600 text-white rounded-lg p-4 mt-8"
							>
								Create Listing
							</button>
						</div>
					</form>
				)}
			</main>
		</div>
	);
};

export default CreatePage;
