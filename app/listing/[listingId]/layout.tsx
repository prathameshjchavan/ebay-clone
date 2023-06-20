import "../../globals.css";

export const metadata = {
	title: "Ebay Clone - View Listing",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body>{children}</body>
		</html>
	);
}
