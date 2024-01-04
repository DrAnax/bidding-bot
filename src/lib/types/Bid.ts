import type { Denomination } from './Denomination';

export type Bid = {
	level: number;
	denomination: Denomination;
};

export function createBid(level: number, denomination: Denomination): Bid {
	return { level, denomination };
}
