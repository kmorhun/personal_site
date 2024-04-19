<script>
    import * as d3 from 'd3';

    let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);

    export let data = [];
    let oldData = []; // keep track of old data for transitions
    let total = 0;

    
    for (let d of data) {
        total += d;
    }
    
    // mapping data labels to DOM elements representing each wedge
    let wedges = {};
    $: console.log(wedges);
    
    export let transitionDuration = 300;
    function transitionArcs() {
        let wedgeElements = Object.values(wedges);

        d3.selectAll(wedgeElements).transition("arc")
            .duration(transitionDuration)
            .styleTween("d", function (_, index) {
                let wedge = this;

                // get the label of the wedge
                let label = Object.keys(wedges)[index];
                let transition = transitionArc(wedge, label);
                return transition?.interpolator;
            });
    }

    function getEmptyArc (label, data = pieData) {
        // Union of old and new labels in the order they appear
        let labels = d3.sort(new Set([...oldData, ...pieData].map(d => d.label)));
        let labelIndex = labels.indexOf(label);
        let sibling;
        for (let i = labelIndex - 1; i >= 0; i--) {
            sibling = data.find(d => d.label === labels[i]);
            if (sibling) {
                break;
            }
        }

        let angle = sibling?.endAngle ?? 0;
        return {startAngle: angle, endAngle: angle};
    }

    function arc (wedge) {
        // Calculations that will only be done once per element go here
        return {
            duration: transitionDuration,
            css: (t, u) => {
                // t is a number between 0 and 1 that represents the transition progress; u is 1 - t
                let transitionDetails = transitionArc(wedge);
                let cssString = transitionDetails?.interpolator(transition.type === "out" ? u : t);
                return "d: " + cssString;
            }
        }
    }

    function sameArc (a, b) {
        let sameAngles = a?.startAngle === b?.startAngle && a?.endAngle === b?.endAngle;
        let falsy = !a && !b;
        return sameAngles || falsy;
    }

    function transitionArc (wedge, label) {
        // label is optional, but it's a performance optimization
        label ??= Object.entries(wedges).find(([label, w]) => w === wedge)[0];
       
        let d = pieData.find(d => d.label === label);
        let d_old = oldData.find(d => d.label === label);
        
        // if (sameArc(d_old, d)) { // if the arcs are the same, don't transition
        //     return null;
        // }
        if (!d || !d_old) { // if that wedge doesn't exist
            return;
        }
        let type = d ? (d_old ? "update" : "in") : "out";

        let from = d_old ? {...d_old} : getEmptyArc(label, oldData);
        let to =  d ? {...d} : getEmptyArc(label, data);

        let angleInterpolator = d3.interpolate(from, to);
        let interpolator = t => `path("${ arcGenerator(angleInterpolator(t)) }")`;

        return {d, d_old, from, to, interpolator, type};
    }

    // prevent the arcs from sorting by value by default
    let sliceGenerator = d3.pie().value(d => d.value).sort(null);

    let pieData;
    $: {
        oldData = pieData;
        // make a copy of data
        pieData = data.map(d => ({...d}));
        
        // sort the data by label
        pieData = d3.sort(pieData, d => d.label);
        
        let arcData = sliceGenerator(data);
        let arcs = arcData.map(d => arcGenerator(d));
        
        pieData = pieData.map((d, i) => ({...d, ...arcData[i], arc: arcs[i]}));
        
        // runs whenever the data changes
        transitionArcs();
    }
    
    export let colors = d3.scaleOrdinal(d3.schemeSet3);

    export let selectedIndex = -1;

    function toggleWedge (index, event) {
        if (!event. key || event.key === "Enter") {
            selectedIndex = (selectedIndex===index) ? -1 : index;
        }
    }


</script>

<style>
    svg {
        max-width: 10em;
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
        /* allows interpolating any property the browser can interpolate */
        transition: 300ms;
        transition-property: transform, opacity, fill;

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

        /* fill-opacity: 0.7; */
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
        <!-- key by label to eliminate flashing -->
        {#each pieData as d, i (d.label)}
            <path d={d.arc} fill={colors(d.id ?? d.label)} 
                bind:this={wedges[d.label]}
                on:click={e => toggleWedge(i, e)}
                on:keyup={e => toggleWedge(i, e)}
                transition:arc
                class:selected={selectedIndex === i}
                tabindex="0"
                role="button"
                aria-label="button"
                style="
                    --start-angle: { d.arc?.startAngle }rad;
                    --end-angle: { d.arc?.endAngle }rad;"/>
        {/each}
    </svg>

    <ul class="legend">
        {#each pieData as d, i}
        <li style="--color: {colors(d.id ?? d.label)}">
            <span class="swatch"
                class:selected={selectedIndex === i}></span>
                {d.label} <em>({d.value})</em>
            </li>
        {/each}
    </ul>
</div>