import React from "react";

type Props = {};

const Header = (props: Props) => {
	return (
		<header>
			<nav>
				<div>
					<button className="connectWalletBtn">Connect your wallet</button>
				</div>
			</nav>
		</header>
	);
};

export default Header;
