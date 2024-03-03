<article>
    <h2>{p.title}</h2>
    <img src={p.image} alt="">
    <p>{p.description}</p>
</article>

<script>
    // alias info to an internal variable
    export let info = {};
    let p = info;
</script>