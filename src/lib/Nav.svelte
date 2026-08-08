<nav>
    {#each pages as p}
    <a href={p.url.startsWith('http') ? p.url : base + p.url} 
        class:current={p.url === "/" // is this link the home page?
        ? $page.url.pathname === (base + "/") // if yes - set current = true if the path name matches. Else, set current = true if the path name starts correctly
        : $page.url.pathname.startsWith(base + p.url)} 
        target={p.url.startsWith("http") ? "_blank": null}
    >
        {p.title}
    </a>
    {/each}
</nav>

<style>
    nav {
        --border-color: oklch(50% 10% 200 / 40%);
        display: contents;
        display: flex;
        margin-bottom: 4em;
        border-bottom: 2px solid var(--border-color);

    }

    a {
        flex: 1;
        text-decoration: none;
        color: inherit;
        text-align: center;
        padding: 0.5em;
    }

    a:hover {
        border-bottom: 4px solid var(--color-accent);
        /* The following doesn't work in Firefox :(*/
        /* background-color: oklch(from var(--color-accent) 95% 5% h); */
        background-color: color-mix(in oklch, var(--color-accent), canvas 85%);
        /* padding: 0.3em; */
    }

    .current {
        border-bottom: 4px solid var(--border-color); 
    }
</style>

<script>
    import { base } from "$app/paths";
    import { page } from "$app/stores";
    export let info = {};
    let pages = info;
</script>

