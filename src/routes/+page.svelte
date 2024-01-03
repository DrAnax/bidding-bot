<script>
  import {pbnParser} from '$lib/pbnparser';
  import {deals} from '$lib/deals';

  let parsed = pbnParser(deals[0], 1);
  let deal = 1;

  const setDeal = () => {
    parsed = pbnParser(deals[deal-1], deal);
  }
</script>

<h1>Bidding Bot</h1>
<div>
  <!-- create a numeric input bound to deal which calls setDeal -->
  <input type="number" bind:value={deal} on:change={setDeal} min="1" max="{deals.length}" />
 
  <p>Deal: {deal}</p>
  <pre>
{JSON.stringify(parsed, null, 2)}
  </pre>
</div>
