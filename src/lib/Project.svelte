<article>
    <svelte:element this={"h"+hlevel}>{p.title}</svelte:element>
    <img src={p.image} alt="">
    <div>
        <p>{p.description}</p>
        <p class="year">c. {p.year}</p>
    </div>
</article>

<style>
    article {
        display: grid;
        grid-row: span 3;
        grid-template-rows: subgrid;
        h2, h3 {
            margin: 0;
        }
    }

    .year {
        font-family: 'Baskerville';
        font-variant-numeric: oldstyle-nums;
    }
</style>

<script>
    // alias info to an internal variable
    export let info = {};
    export let hlevel = 2;
    let p = info;
</script>