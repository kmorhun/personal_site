<script>
    import Nav from "../lib/Nav.svelte";

    let pages = [
        {url: "./", title: "Home"},
        {url: "./projects", title: "Projects"},
        {url: "./cv", title: "CV"},
        {url: "./contact", title: "Contact"},
        {url: "https://github.com/kmorhun", title: "Follow Me on Github~"},
    ];
</script>

<Nav info={pages} />

<slot />