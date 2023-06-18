"use client";

import Header from "@/components/Header";
import {
	useContract,
	useActiveListings,
	MediaRenderer,
} from "@thirdweb-dev/react";

export default function Home() {
	const { contract } = useContract(
		process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT,
		"marketplace"
	);
	const { data: listings, isLoading: loadingListings } =
		useActiveListings(contract);

	console.log({ listings });
	return (
		<main>
			<Header />
		</main>
	);
}
