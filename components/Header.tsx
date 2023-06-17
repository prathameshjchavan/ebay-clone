"use client";

import React from "react";
import { useAddress, useDisconnect, useMetamask } from "@thirdweb-dev/react";

type Props = {};

const Header = (props: Props) => {
	const connectWithMetamask = useMetamask();
	const disconnect = useDisconnect();
	const address = useAddress();

	return (
		<header className="max-w-6xl mx-auto p-2">
			<nav className="flex justify-between">
				<div className="flex items-center space-x-2 text-sm">
					{address ? (
						<button onClick={disconnect} className="connectWalletBtn">
							Hi, {address.slice(0, 4)}...{address.slice(-4)}
						</button>
					) : (
						<button
							onClick={(e) => connectWithMetamask()}
							className="connectWalletBtn"
						>
							Connect your wallet
						</button>
					)}
				</div>
			</nav>
		</header>
	);
};

export default Header;
