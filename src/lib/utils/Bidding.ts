import type { Bid } from '../types/Bid';

export function biddingOpened(bidding: Array<Bid>): boolean {
	return bidding.length > 0 && bidding.filter((bid) => bid.denomination !== 'pass').length != 0;
}
