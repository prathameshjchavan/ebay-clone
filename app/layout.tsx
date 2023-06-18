"use client";

import "./globals.css";
import network from "@/utils/network";
import { ThirdwebProvider } from "@thirdweb-dev/react";

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<head>
				<title>Ebay Clone</title>
			</head>
			<ThirdwebProvider activeChain={network}>
				<body>{children}</body>
			</ThirdwebProvider>
		</html>
	);
}
