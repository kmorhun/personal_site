<article>
    <svelte:element this={"h"+hlevel}>{p.title} - {p.year}</svelte:element>
    <img src={p.image} alt="">
    <p>{p.description}</p>
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
</style>

<script>
    // alias info to an internal variable
    export let info = {};
    export let hlevel = 2;
    let p = info;
</script>