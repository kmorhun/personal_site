<dl id="commit-tooltip" 
    class="info tooltip"
    bind:this={commitTooltip}
    hidden={hovering === -1}
    style="top: {tooltipPosition.y}px; left: {tooltipPosition.x}px"
>
    <dt>Commit</dt>
    <dd><a href="{hoveredCommit.url}" target="_blank">{hoveredCommit.id}</a></dd>
    <dt>Date</dt>
    <dd>{hoveredCommit.datetime?.toLocaleString("en", {date: "full"})}</dd>
    <dt>Time</dt>
    <dd>{hoveredCommit.datetime?.toLocaleString("en", {time: "short"})}</dd>
    <dt>Author</dt>
    <dd>{hoveredCommit.author}</dd>
    <dt>Total Lines</dt>
    <dd>{hoveredCommit.totalLines}</dd>
</dl>
<svg viewBox="0 0 {width} {height}" 
        bind:this={svg}>
    <!-- move the position of the axes to respect the margins -->
    <g class="gridlines" transform="translate({usableArea.left}, 0)" bind:this={yAxisGridlines}/>
    <g transform="translate(0, {usableArea.bottom})" bind:this={xAxis}/>
    <g transform="translate({usableArea.left}, 0)" bind:this={yAxis}/>
    <g class="dots">
        {#each commits as commit, index (commit.id)}
            <circle
                cx={xScale(commit.datetime)}
                cy={yScale(commit.hourFrac)}
                r={rScale(commit.totalLines)}
                fill="steelblue"
                tabindex="0"
                aria-describedby="commit-tooltip"
                role="tooltip"
                aria-haspopup="true"
                class:selected={isCommitSelected(commit)}
                on:mouseenter={evt => dotInteraction(index, evt)}
                on:mouseleave={evt => dotInteraction(index, evt)}
                on:click={evt => dotInteraction(index, evt)}
                on:keyup={evt => dotInteraction(index, evt)}
                on:focus={evt => dotInteraction(index, evt)}
                on:blur={evt => dotInteraction(index, evt)}
            />
        {/each}
    </g>
</svg>

<p>{selectedCommits ? selectedCommits.length : "No"} commits selected</p>


<style>
    svg {
        overflow: visible;
    }

    svg :global(.selection) {
        fill-opacity: 10%;
        stroke: black;
        stroke-opacity: 70%;
        stroke-dasharray: 5 3;
        animation: marching-ants 2s linear infinite; 
    }

    @keyframes marching-ants {
        to {
            stroke-dashoffset: -8; /*5+3*/
        }
    }

    .gridlines {
        stroke-opacity: 0.2;
    }

    dl.info {
        display: grid;
        background-color: oklch(100% 0% 0 / 70%);
        box-shadow: 10px 5px 5px oklch(0% 0% 0 / 30%);
        border-radius: 5px;
        backdrop-filter: blur(5px);
        padding: 1em;
        transition-duration: 500ms;
        transition-property: opacity, visibility;


        &[hidden]:not(:hover, :focus-within) {
            opacity: 0;
            visibility: hidden;
        }

        dt {
            grid-column: 1;
            text-align: right;
            text-transform: uppercase;
            color: rgb(87, 87, 87);    
            font-weight: bold;       
        }

        dd {
            margin-left: 1em;
            grid-column: 2;
        }
    }

    .tooltip {
        position: fixed;
        top: 1em; 
        left: 1em;
    }

    circle {
        transition: 200ms;
        transform-origin: center;
        transform-box: fill-box;

        &:hover {
            transform: scale(1.5);
        }

        &:not(:hover) {
            fill-opacity: 0.6;
        }
    }

    circle.selected {
        fill: var(--color-accent);
    }
    
    </style>

<script>
    import * as d3 from 'd3';
    import { onMount } from "svelte";
    import {
        computePosition,
        autoPlacement,
        offset,
    } from '@floating-ui/dom';
    import Pie from '$lib/Pie.svelte';

    export let commits = [];
    export let lines = [];
    export let selectedCommits = [];

    // physical setup of scatterplot
    let width = 1000, height = 600;
    let margin = {top: 10, right: 10, bottom: 30, left: 20};
    let xAxis, yAxis;
    let yAxisGridlines;

    let usableArea = {
        top: margin.top,
        right: width - margin.right,
        bottom: height - margin.bottom,
        left: margin.left
    };
    usableArea.width = usableArea.right - usableArea.left;
    usableArea.height = usableArea.bottom - usableArea.top;


    $: yScale = d3.scaleLinear()
        .domain([0, 24])
        .range([usableArea.bottom, usableArea.top]);
    
    $: xScale = d3.scaleTime()
        .domain(d3.extent(lines, d => d.datetime))
        .range([usableArea.left, usableArea.right])
        .nice();
    
    $: rScale = d3.scaleSqrt()
        .domain(d3.extent(commits, d => d.totalLines))
        .range([5, 20]); 
    
    // set up axes
    $: {
        d3.select(xAxis).call(d3.axisBottom(xScale));
        d3.select(yAxis).call(d3.axisLeft(yScale).tickFormat(d => String(d % 24).padStart(2, "0") + ":00"));
    }

    $: {
        d3.select(yAxisGridlines).call(
            d3.axisLeft(yScale)
            .tickFormat("")
            .tickSize(-usableArea.width));
    }

    // tooltip information
    let hoveredIndex = -1;
    let hovering = -1;
    $: hoveredCommit = commits[hoveredIndex] ?? {};

    // let cursor = {x: 0, y: 0};
    let commitTooltip;
    let tooltipPosition = {x: 0, y: 0};
    
    //define behavior for dot interaction
    async function dotInteraction (index, evt) {
        let hoveredDot = evt.target;
        tooltipPosition = await computePosition(hoveredDot, commitTooltip, {
            strategy: "fixed", // because we use position: fixed
            middleware: [
                offset(5), // spacing from tooltip to dot
                autoPlacement() // see https://floating-ui.com/docs/autoplacement
            ],
        })
        
        if (evt.type === "mouseenter" || evt.type === "focus") {
            // dot hovered
            hoveredIndex = index;
            hovering = 1;
            // cursor = {x: evt.x, y: evt.y};
        }

        else if (evt.type === "mouseleave" || evt.type === "blur") {
            // dot unhovered
            hovering = -1;
        }

        else if (evt.type === "click" || (evt.type === "keyup" && evt.key === "enter")) {
            selectedCommits = [commits[index]];
        }
    }

    // set up brushing
    let svg;

    function brushed (evt) {
        // console.log(evt);
        let brushSelection = evt.selection;

        // update selected commits when brushed called
        selectedCommits = !brushSelection ? [] : commits.filter(commit => {
		let min = {x: brushSelection[0][0], y: brushSelection[0][1]};
		let max = {x: brushSelection[1][0], y: brushSelection[1][1]};
		let x = xScale(commit.date);
		let y = yScale(commit.hourFrac);

		return x >= min.x && x <= max.x && y >= min.y && y <= max.y;
	    });
    }

    function isCommitSelected (commit) {
        return selectedCommits.includes(commit);
    }

    $: {
        d3.select(svg).call(d3.brush().on("start brush end", brushed));
        // bring the dots to the front of the layers of svgs
        // ~ selects elements after this selector but still in the same parent
        d3.select(svg).selectAll(".dots, .overlay ~ *").raise();
    }

</script>