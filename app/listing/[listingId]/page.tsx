"use client";

import Header from "@/components/Header";
import { UserCircleIcon } from "@heroicons/react/24/solid";
import {
	ListingType,
	MediaRenderer,
	useContract,
	useListing,
	useSwitchChain,
	useNetworkMismatch,
	useBuyNow,
	useMakeOffer,
	useOffers,
	useMakeBid,
} from "@thirdweb-dev/react";
import Countdown from "react-countdown";
import React, { Fragment, useEffect, useState } from "react";
import network from "@/utils/network";
import { useRouter } from "next/navigation";
import { ethers } from "ethers";

type Props = { params: { listingId: string } };

const ListingPage = ({ params }: Props) => {
	const { contract } = useContract(
		process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT,
		"marketplace"
	);
	const {
		data: listing,
		isLoading,
		error,
	} = useListing(contract, params.listingId);
	const [minimumNextBid, setMinimumNextBid] = useState<{
		displayValue: string;
		symbol: string;
	}>();
	const { mutate: buyNow } = useBuyNow(contract);
	const { mutate: makeOffer } = useMakeOffer(contract);
	const { mutate: makeBid } = useMakeBid(contract);
	const { data: offers } = useOffers(contract, params.listingId);
	const networkMismatch = useNetworkMismatch();
	const switchChain = useSwitchChain();
	const [bidAmount, setBidAmount] = useState("");
	const router = useRouter();

	const formatPlaceholder = () => {
		if (!listing) return;

		if (listing.type === ListingType.Direct) {
			return "Enter Offer Amount";
		}

		if (listing.type === ListingType.Auction) {
			if (!minimumNextBid?.displayValue) return "Enter Bid Amount";

			return Number(minimumNextBid.displayValue) === 0
				? "Enter Bid Amount"
				: `${minimumNextBid.displayValue} ${minimumNextBid.symbol} or more`;
		}
	};

	const fetchMinNextBid = async () => {
		if (!params.listingId || !contract) return;

		const { displayValue, symbol } = await contract.auction.getMinimumNextBid(
			params.listingId
		);

		setMinimumNextBid({
			displayValue,
			symbol,
		});
	};

	const buyNft = () => {
		if (networkMismatch) {
			switchChain(network);
			return;
		}

		if (!params.listingId || !contract || !listing) return;

		buyNow(
			{ id: params.listingId, buyAmount: 1, type: listing.type },
			{
				onSuccess(data, variables, context) {
					alert("NFT bought successfully");
					console.log("SUCCESS", data, variables, context);
					router.replace("/");
				},
				onError(error, variables, context) {
					alert("ERROR: NFT could not be bought");
					console.log("ERROR", error, variables, context);
				},
			}
		);
	};

	const createBidOrOffer = () => {
		try {
			if (networkMismatch) {
				switchChain(network);
				return;
			}

			if (!params.listingId || !listing || !contract) return;

			// Direct Listing
			if (listing.type === ListingType.Direct) {
				if (
					listing.buyoutPrice.toString() ===
					ethers.utils.parseEther(bidAmount).toString()
				) {
					console.log("Buyout Price met, buying NFT...");

					buyNft();
					return;
				}

				console.log("Buyout price not met, making offer...");
				makeOffer(
					{
						listingId: params.listingId,
						quantity: 1,
						pricePerToken: bidAmount,
					},
					{
						onSuccess(data, variables, context) {
							setBidAmount("");
							alert("Offer made successfully!");
							console.log("SUCCESS", data, variables, context);
						},
						onError(error, variables, context) {
							alert("ERROR: Offer could not be made");
							console.log("ERROR", error, variables, context);
						},
					}
				);
			}

			// Auction Listing
			if (listing.type === ListingType.Auction) {
				console.log("Making Bid...");

				makeBid(
					{
						listingId: params.listingId,
						bid: bidAmount,
					},
					{
						onSuccess(data, variables, context) {
							setBidAmount("");
							alert("Bid made successfully!");
							console.log("SUCCESS", data, variables, context);
						},
						onError(error, variables, context) {
							alert("ERROR: Bid could not be made");
							console.log("ERROR", error, variables, context);
						},
					}
				);
			}
		} catch (error) {
			console.error(error);
		}
	};

	useEffect(() => {
		if (!params.listingId || !contract || !listing) return;

		if (listing.type === ListingType.Auction) {
			fetchMinNextBid();
		}
	}, [params.listingId, contract, listing]);

	return (
		<div>
			<Header />
			<main className="max-w-6xl mx-auto p-2 flex flex-col lg:flex-row space-y-10 space-x-5 pr-10">
				{isLoading ? (
					<div className="text-center animate-pulse text-blue-500">
						<p>Loading Item...</p>
					</div>
				) : !listing ? (
					<div>
						<p>Listing not found</p>
					</div>
				) : (
					<Fragment>
						<div className="p-10 border mx-auto lg:mx-0 max-w-md lg:max-w-xl">
							<MediaRenderer src={listing?.asset.image} />
						</div>

						<section className="flex-1 space-y-5 pb-20 lg:pb-0">
							<div>
								<h1 className="text-xl font-bold">{listing.asset.name}</h1>
								<p className="text-gray-600">{listing.asset.description}</p>
								<p className="flex items-center text-xs sm:text-base">
									<UserCircleIcon className="h-5" />
									<span className="font-bold pr-1">Seller: </span>
									{listing.sellerAddress}
								</p>
							</div>

							<div className="grid grid-cols-2 items-center py-2">
								<p className="font-bold">Listing Type:</p>
								<p>
									{listing.type === ListingType.Direct
										? "Direct Listing"
										: "Auction Listing"}
								</p>

								<p className="font-bold">Buy it Now Price:</p>
								<p className="text-4xl font-bold">
									{listing.buyoutCurrencyValuePerToken.displayValue}{" "}
									{listing.buyoutCurrencyValuePerToken.symbol}
								</p>

								<button
									onClick={buyNft}
									className="col-start-2 mt-2 bg-blue-600 font-bold text-white rounded-full w-44 py-4 px-10"
								>
									Buy Now
								</button>
							</div>

							{/* TODO: If Direct, show offers here... */}

							<div className="grid grid-cols-2 space-y-2 items-center justify-end">
								<hr className="col-span-2" />

								<p className="col-span-2 font-bold">
									{listing.type == ListingType.Direct
										? "Make an Offer"
										: "Bid on this Auction"}
								</p>

								{/* TODO: Remaining time on auction goes here... */}
								{listing.type === ListingType.Auction && (
									<Fragment>
										<p>Current Minimum Bid:</p>
										<p className="font-bold">
											{minimumNextBid?.displayValue} {minimumNextBid?.symbol}
										</p>

										<p>Time Remaining:</p>
										<Countdown
											date={
												Number(listing.endTimeInEpochSeconds.toString()) * 1000
											}
										/>
									</Fragment>
								)}

								<input
									className="border p-2 rounded-lg mr-5"
									type="text"
									onChange={(e) => setBidAmount(e.target.value)}
									placeholder={formatPlaceholder()}
								/>
								<button
									onClick={createBidOrOffer}
									className="bg-red-600 font-bold text-white rounded-full w-44 py-4 px-10"
								>
									{listing.type === ListingType.Direct ? "Offer" : "Bid"}
								</button>
							</div>
						</section>
					</Fragment>
				)}
			</main>
		</div>
	);
};

export default ListingPage;
