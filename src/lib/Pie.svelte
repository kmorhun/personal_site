<script>
    import * as d3 from 'd3';

    let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);

    export let data = [];
    let total = 0;

    
    for (let d of data) {
        total += d;
    }

    let pieData;
    $: {
        pieData = data.map(d => ({...d}));
        let sliceGenerator = d3.pie().value(d => d.value);
        let arcData = sliceGenerator(data);
        let arcs = arcData.map(d => arcGenerator(d));
        pieData = pieData.map((d, i) => ({...d, ...arcData[i], arc: arcs[i]}));
    }
    
    let colors = d3.scaleOrdinal(d3.schemeSet3);

    export let selectedIndex = -1;

    function toggleWedge (index, event) {
        if (!event. key || event.key === "Enter") {
            selectedIndex = (selectedIndex===index) ? -1 : index;
        }
    }
</script>

<style>
    svg {
        max-width: 20em;
        margin-block: 2em;

        /* Do not clip shapes outside the viewBox */
        overflow: visible;
    }

    svg:has(path:hover, path:focus-visible) {
        path:not(:hover, :focus-visible) {
            opacity: 50%;
        }
    }

    path {
        transition: 300ms;
        transform: rotate(var(--mid-angle))
            translateY(0)
            rotate(calc(-1*var(--mid-angle)));
        cursor: pointer;
        outline: none;

        --angle: calc(var(--end-angle) - var(--start-angle));
        --mid-angle: calc(var(--start-angle) + var(--angle) / 2);

        &.selected {
            transform: rotate(var(--mid-angle))
                translateY(-6px) scale(1.1)
                rotate(calc(-1*var(--mid-angle)));
        }
    }

    .container {
        display: flex;
        align-items: center;
    }

    .swatch {
        /* display: inline-flex; */
        aspect-ratio: 1/1;
        width: 1em;
        height: 1em;
        align-items: center;
        background-color: var(--color);
        border-radius: 30%;
    }
    
    .legend {
        display: grid;
        flex: 1;
        list-style-type: none;
        grid-template-columns: repeat(auto-fill, minmax(8em, 1fr));
        border: 1px solid oklch(50% 10% 200 / 40%);
        padding: 0.5em;
        margin: 1em;

        li {
            display: flex;
            align-items: center;
            gap: 0.5em;
        }
    }

    .selected {
        /* --color: oklch(60% 45% 0) !important; */
        --color: var(--color-accent);

        &:is(path) {
            fill: var(--color);
        }
    }
</style>

<div class="container">
    
    <svg viewBox="-50 -50 100 100">
         {#each pieData as d, i}
            <path d={d.arc} fill={colors(d.label)} 
                on:click={e => toggleWedge(i, e)}
                on:keyup={e => toggleWedge(i, e)}
                class:selected={selectedIndex === i}
                tabindex="0"
                role="button"
                aria-label:button
                style="
                    --start-angle: { d.arc?.startAngle }rad;
                    --end-angle: { d.arc?.endAngle }rad;"/>
        {/each}
    </svg>

    <ul class="legend">
        {#each pieData as d, i}
        <li style="--color: {colors(d.label)}">
            <span class="swatch"
                class:selected={selectedIndex === i}></span>
                {d.label} <em>({d.value})</em>
            </li>
        {/each}
    </ul>
</div>