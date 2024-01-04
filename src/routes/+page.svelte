<script lang="ts">
  import PBNParser from '$lib/pbnparser';
  import { deals } from '$lib/deals';
  import type { Board } from '$lib/types/Board';

  let parsed: Board | null = PBNParser(deals[0], 1);
  let deal: number = 1;

  const setDeal = () => {
    parsed = PBNParser(deals[deal - 1], deal);
  };
</script>

<h1>Bidding Bot</h1>
<div>
  <!-- create a numeric input bound to deal which calls setDeal -->
  <input type="number" bind:value={deal} on:change={setDeal} min="1" max={deals.length} />

  <p>Deal: {deal}</p>
  <pre>
{JSON.stringify(parsed, null, 2)}
  </pre>
</div>
