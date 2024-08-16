<script>
    import Nav from "../lib/Nav.svelte";
    import "../style.css";
    
    let pages = [
        {url: "./", title: "Home"},
        {url: "./projects", title: "Projects"},
        {url: "./cv", title: "CV"},
        {url: "./contact", title: "Contact"},
        {url: "./meta", title: "Meta"},
    ];

    // let colorScheme = "light dark";
    let localStorage = globalThis.localStorage ?? {};
    let colorScheme = localStorage.colorScheme ?? "light dark";
    let root = globalThis?.document?.documentElement;
    
    // reactive properties
    $: localStorage.colorScheme = colorScheme;
    $: root?.style.setProperty("color-scheme", colorScheme);

</script>

<style>
    .switch {
        position: fixed;
        top: 1rem;
        right: 1rem;
        font-size: 80%;
    }

    .warning {
        max-width: 100%;
        margin-top: 1em;
        padding: 0.5em;
        border-radius: 10px;
        background-color: color-mix(in oklch, var(--color-accent), canvas 50%);
    }
</style>

<Nav info={pages} />

<div class="content">
    <div class="warning">
        This site is always a work in progress, but aren't we all?
    </div>
</div>

<label class="switch">
    Theme:
    <select bind:value={ colorScheme }>
        <option value="light dark">Automatic</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
    </select>
</label>

<slot />