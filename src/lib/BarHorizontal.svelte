<script>
    import * as d3 from 'd3';

    export let data = [];
    export let title = "";

    let width = 600;
    let height = 200;
    let margin = { top: 40, right: 50, bottom: 60, left: 80 };
    let innerWidth  = width  - margin.left - margin.right;
    let innerHeight = height - margin.top  - margin.bottom;

    $: yScale = d3.scaleBand()
        .domain(data.map(d => d.label))
        .range([0, innerHeight])
        .padding(0.2);

    $: xScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.value) || 1])
        .range([0, innerWidth]);

    $: colorScale = d3.scaleOrdinal(d3.schemeTableau10)
        .domain(data.map(d => d.label));

    let xAxis, yAxis;
    $: if (xAxis && yAxis) {
        d3.select(xAxis).call(
            d3.axisBottom(xScale)
            .tickFormat(d => Number.isInteger(d) ? d : "")
            .ticks(Math.min(d3.max(data, d => d.value), 10))
        );
        d3.select(yAxis).call(d3.axisLeft(yScale));
    }

    $: maxBar = d3.greatest(data, d => d.value);

</script>

<div class="container">
    <svg viewBox="0 0 {width} {height}">
        <g transform="translate({margin.left}, {margin.top + innerHeight})"
        bind:this={xAxis} />
        <g transform="translate({margin.left}, {margin.top})"
            bind:this={yAxis} />
        <!-- title -->
        <text
            x={margin.left + innerWidth / 2}
            y={margin.top / 2}
            text-anchor="middle"
            class="chart-title">
            {title}
        </text>    
        <g transform="translate({margin.left}, {margin.top})">
            <!-- x-axis label -->
            <text
                x={innerWidth / 2}
                y={innerHeight + margin.bottom - 10}
                text-anchor="middle"
                class="axis-label">
                Number of Lines
            </text>

            <!-- y-axis label -->
            <text
                x={-(innerHeight / 2)}
                y={-margin.left + 30}
                text-anchor="middle"
                transform="rotate(-90)"
                class="axis-label">
                <tspan x={-(innerHeight / 2)} dy="-1em">Programming</tspan>
                <tspan x={-(innerHeight / 2)} dy="1.2em">Language</tspan>
            </text>

            {#each data as d}
            <rect
                    x={0} 
                    y={yScale(d.label)}
                    width={xScale(d.value)}
                    height={yScale.bandwidth()}
                    fill={colorScale(d.label)}
                />
            {/each}
            {#if maxBar}
            <!-- highlight outline around the tallest bar -->
            <!-- <rect
                x={0}
                y={yScale(maxBar.label)}
                width={xScale(maxBar.value)}
                height={yScale.bandwidth()}
                fill="none"
                stroke="currentColor"
                stroke-width="2"
            /> -->
            <!-- annotation text at end of leader line -->
            <!-- <text
                x={xScale(maxBar.value) + 10}
                y={yScale(maxBar.label) + yScale.bandwidth()/2}
                text-anchor="start"
                dominant-baseline="auto"
                class="annotation">
                Most lines of code
            </text> -->
        {/if}
        </g>
    </svg>
    <ul class="legend">
        {#each data as d}
            <li style="--color: {colorScale(d.label)}">
                <span class="swatch"></span>
                {d.label} <em>({d.value})</em>
            </li>
        {/each}
    </ul>
</div>
    

<style>
    svg {
        max-width: 80%;
        height: auto;
        overflow: visible;
    }

    .container {
        display: flex;
    }

    .legend {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 0.5em;
    }

    li {
        display: flex;
        align-items: center;
        gap: 0.3em;
    }

    .swatch {
        width: 1em;
        height: 1em;
        background-color: var(--color);
        border-radius: 10%;
    }

    .chart-title {
        font-size: 0.8em;
        font-weight: bold;
        fill: currentColor;
    }

    .axis-label {
        font-size: 0.5em;
        fill: currentColor;
    }

    .annotation {
        font-size: 0.7em;
        fill: currentColor;
        font-style: italic;
    }


</style>