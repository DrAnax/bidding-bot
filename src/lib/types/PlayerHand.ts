export type PlayerHand = {
	position: number;
	cards: {
		spades: string;
		hearts: string;
		diamonds: string;
		clubs: string;
	};
	hcp: number;
	length: number;
	valuation: number;
};
