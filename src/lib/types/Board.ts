import type { PlayerHand } from './PlayerHand';

export type Board = {
	source: string;
	board: number;
	dealer: string;
	vulnerability: string;
	north: PlayerHand | null;
	east: PlayerHand | null;
	south: PlayerHand | null;
	west: PlayerHand | null;
};
