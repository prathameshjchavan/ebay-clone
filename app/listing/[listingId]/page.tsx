import React from "react";

type Props = { params: { listingId: String } };

const ListingPage = ({ params }: Props) => {
	return <div>ListingPage: {params.listingId}</div>;
};

export default ListingPage;
