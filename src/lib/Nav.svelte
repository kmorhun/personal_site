<nav>
    {#each pages as p}
        <a 
        href={p.url} 
            class:current-page={"." + $page.route.id === p.url}
            target={p.url.startsWith("http") ? "_blank" : null}
            >{p.title}</a>
    {/each}
</nav>

<style>
    nav {
    --border-color: oklch(50% 10% 200 / 40%);
    display: flex;
    border-bottom: 1px solid var(--border-color);

    }

    a {
        flex: 1;
        text-decoration: none;
        color: inherit;
        text-align: center;
        padding: 0.5em;
    }

    a:hover {
        border-bottom: 0.4em solid var(--color-accent);
        /* The following doesn't work in Firefox :(*/
        /* background-color: oklch(from var(--color-accent) 95% 5% h); */
        background-color: color-mix(in oklch, var(--color-accent), canvas 85%);
        /* padding: 0.3em; */
    }

    .current-page {
        border-bottom: 0.4em solid var(--border-color);
        /* background-color: hsl(185, 8.8%, 83%); */
        background-color: color-mix(in oklch, var(--border-color), canvas 85%);
        /* padding: 0.3em; */
    }
</style>

<script>
    import { page } from "$app/stores";
    export let info = {};
    let pages = info;
</script>

