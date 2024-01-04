import svelteFsm from 'svelte-fsm';

import { createBid, type Bid } from '$lib/types/Bid';
import type { PlayerHand } from '$lib/types/PlayerHand';

export class Player {
	#balancedDistributions = ['4-3-3-3', '4-4-3-2', '5-3-3-2'];
	#lastBid: Bid | null = null;
	bidding: Array<Bid> = [];
	hand: PlayerHand | null = null;

	#robot = svelteFsm('ready', {
		ready: {
			bid(player: Player) {
				const biddingStarted = (bidding: Array<Bid>): boolean => {
					return (
						bidding.length > 0 && bidding.filter((bid) => bid.denomination !== 'pass').length != 0
					);
				};

				if (biddingStarted(player.bidding)) {
					player.#lastBid = null;
					return 'biddingOpened';
				}

				if (!player.hand) {
					return 'ready';
				}

				if (player.hand.valuation < 13) {
					player.#lastBid = createBid(0, 'pass');
					return 'ready';
				}

				if (player.hand.valuation > 21) {
					player.#lastBid = null;
					return 'unknownOpening';
				}

				if (player.#couldBid1NT()) {
					return 'ready';
				}

				if (player.#couldBid1S()) {
					return 'ready';
				}

				if (player.#couldBid1H()) {
					return 'ready';
				}

				if (player.#couldBid1D()) {
					return 'ready';
				}

				player.#lastBid = createBid(1, 'clubs');
				return 'ready';
			}
		},

		biddingOpened: {},
		unknownOpening: {}
	});

	constructor(hand: PlayerHand | null) {
		this.hand = hand;
	}

	bid() {
		if (!this.hand) {
			this.#lastBid = null;
			return null;
		}

		this.#robot.bid(this);
		return this.#lastBid;
	}

	/**
	 * Returns the last bid in the form of a string.
	 *
	 * @return {string} The last bid, or an empty string if there is no last bid.
	 */
	getLastBid(): string {
		if (this.#lastBid) {
			if (this.#lastBid.denomination == 'pass') return 'pass';

			const d = this.#lastBid.denomination;
			return this.#lastBid.level + ' ' + d.replace(d[0], d[0].toUpperCase());
		}

		return '';
	}

	/**
	 * Retrieves the distribution of cards in the player's hand.
	 *
	 * @return {string | null} - The distribution of cards in the player's hand. Returns null if the player's hand is empty.
	 */
	getDistribution(): string | null {
		if (!this.hand || !this.hand.cards) return null;

		const pattern: Array<number> = [
			this.hand.cards.spades?.length,
			this.hand.cards.hearts?.length,
			this.hand.cards.diamonds?.length,
			this.hand.cards.clubs?.length
		];

		pattern.sort().reverse();
		return pattern.join('-');
	}

	/**
	 * Calculates and returns the exact distribution of cards in the player's hand.
	 *
	 * @return {string | null} The distribution of cards in the player's hand as a string,
	 *                         where each number represents the count of cards in a suit,
	 *                         separated by '='. If the player's hand is empty, null is returned.
	 */
	getExactDistribution(): string | null {
		if (!this.hand) return null;
		const pattern = Object.values(this.hand.cards).map((suit) => suit.length);

		return pattern.join('=');
	}

	/**
	 * Checks if the player can open with a bid of One No Trump.
	 *
	 * @return {boolean} Returns true if the player has a balanced hand with High Card Points (HCP)
	 *                   between 15 and 17 (inclusive), and the distribution of the player's hand
	 *                   is included in the predefined set of balanced distributions.
	 *                   Otherwise, returns false.
	 */
	#couldBid1NT(): boolean {
		if (!this.hand || this.hand.hcp < 15 || this.hand.hcp > 17) {
			return false;
		}

		const distribution = this.getDistribution();
		if (!distribution || !this.#balancedDistributions.includes(distribution)) {
			return false;
		}

		this.#lastBid = createBid(1, 'no trump');
		return true;
	}

	/**
	 * Determines whether the player should open with a bid of 1S (one spade).
	 *
	 * The player should open with 1S if the following conditions are met:
	 * - The valuation of the player's hand is between 13 and 21 (inclusive).
	 * - The number of spades in the player's hand is greater than or equal to 5.
	 * - The number of spades in the player's hand is equal to the length of the longest suit in the hand.
	 *
	 * @returns {boolean} True if the player should open with a bid of 1S, false otherwise.
	 */
	#couldBid1S(): boolean {
		if (!this.hand || !this.hand.cards) return false;

		const { valuation, cards } = this.hand;
		const spades = cards.spades.length;
		const longestSuit = this.#getLongestSuitLength();

		const shouldBid = valuation >= 13 && valuation <= 21 && spades >= 5 && spades == longestSuit;

		if (!shouldBid) return false;

		this.#lastBid = createBid(1, 'spades');
		return true;
	}

	/**
	 * Determines whether the player should open with a bid of 1H (one heart).
	 *
	 * The player should open with 1H if the following conditions are met:
	 * - The valuation of the player's hand is between 13 and 21 (inclusive).
	 * - The number of hearts in the player's hand is greater than or equal to 5.
	 * - The number of hearts in the player's hand is either equal to the length of the longest suit in the hand,
	 *   or it is greater than the number of spades in the hand.
	 *
	 * @returns {boolean} True if the player should open with a bid of 1H, false otherwise.
	 */
	#couldBid1H(): boolean {
		if (!this.hand || !this.hand.cards) return false;

		const { valuation, cards } = this.hand;
		const spades = cards.spades.length;
		const hearts = cards.hearts.length;
		const longestSuit = this.#getLongestSuitLength();

		const shouldBid =
			valuation >= 13 &&
			valuation <= 21 &&
			hearts >= 5 &&
			(hearts == longestSuit || hearts > spades);

		if (!shouldBid) return false;

		this.#lastBid = createBid(1, 'hearts');
		return true;
	}

	/**
	 * Determines whether the player should open with a bid of 1D (one diamond).
	 *
	 * The player should open with 1D if the following conditions are met:
	 * - The valuation of the player's hand is between 13 and 21 (inclusive).
	 * - The number of diamonds in the player's hand is greater than the number of clubs in the hand, or
	 *   the number of diamonds in the player's hand is equal to the number of clubs in the hand, and both are greater than or equal to 4.
	 *
	 * @returns {boolean} True if the player should open with a bid of 1D, false otherwise.
	 */
	#couldBid1D(): boolean {
		if (!this.hand || !this.hand.cards) return false;

		const { valuation, cards } = this.hand;
		const diamonds = cards.diamonds.length;
		const clubs = cards.diamonds.length;

		const shouldBid =
			valuation >= 13 &&
			valuation <= 21 &&
			(diamonds > clubs || (diamonds == clubs && diamonds >= 4));

		if (!shouldBid) return false;

		this.#lastBid = createBid(1, 'diamonds');
		return true;
	}

	/**
	 * Returns the length of the longest suit in the player's hand.
	 *
	 * @return {number} The length of the longest suit in the player's hand.
	 *                 If the player's hand is empty, returns 0.
	 */
	#getLongestSuitLength(): number {
		if (!this.hand || !this.hand.cards) return 0;

		return Object.values(this.hand.cards).reduce((maxLength, suit) => {
			return Math.max(maxLength, suit.length);
		}, 0);
	}
}
