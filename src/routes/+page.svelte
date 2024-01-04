<script lang="ts">
	import PBNParser from '$lib/pbnparser';
	import { deals } from '$lib/deals';
	import type { Board } from '$lib/types/Board';
	import { Player } from '$lib/utils/Player';

	let players: Array<Player> = [];
	let parsed: Board | null = PBNParser(deals[0], 1);
	if (parsed) {
		players = [
			new Player(parsed.north),
			new Player(parsed.east),
			new Player(parsed.south),
			new Player(parsed.west)
		];
	}
	let deal: number = 1;

	const setDeal: () => void = () => {
		parsed = PBNParser(deals[deal - 1], deal);
		if (!parsed) return;
		players = [
			new Player(parsed.north),
			new Player(parsed.east),
			new Player(parsed.south),
			new Player(parsed.west)
		];
	};

	function doBidding(player: Player): string {
		player.bid();
		return player.getLastBid();
	}
</script>

<h1>Bidding Bot</h1>
<div>
	<!-- create a numeric input bound to deal which calls setDeal -->
	<input type="number" bind:value={deal} on:change={setDeal} min="1" max={deals.length} />

	<p>Deal: {deal}</p>
	{#if parsed}
		<div style="display: flex; gap: 50px;">
			{#each players as player}
				<div
					style="width: 200px; {player.hand && player.hand.valuation > 12
						? 'background-color: lightyellow;'
						: ''}"
				>
					<p>{player.hand?.valuation} V</p>
					<p>
						{player.hand?.cards.spades}<br />
						{player.hand?.cards.hearts}<br />
						{player.hand?.cards.diamonds}<br />
						{player.hand?.cards.clubs}<br />
					</p>
					<p>
						{doBidding(player)}<br />
						{player.hand?.hcp} HCP<br />
						{player.getExactDistribution()}
					</p>
				</div>
			{/each}
		</div>
	{/if}
</div>
