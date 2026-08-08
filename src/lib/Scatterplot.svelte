<script>
    import * as d3 from 'd3';
    import {
        computePosition,
        autoPlacement,
        offset,
    } from '@floating-ui/dom';
    import BarHorizontal from '$lib/BarHorizontal.svelte';

    export let locData = []
    export let commits = [];
    
    // order commits in decending order for drawing order
    commits = d3.sort(commits, d => -d.totalLines);

    // viewport metadata
    let width = 1000;
    let height = 600;

    let margin = { top: 20, right: 20, bottom: 30, left: 60 };
    let usableArea = {
        top: margin.top,
        right: width - margin.right,
        bottom: height - margin.bottom,
        left: margin.left
    };
    usableArea.width = usableArea.right - usableArea.left;
    usableArea.height = usableArea.bottom - usableArea.top;

    // scales
    $: [minDate, maxDate] = d3.extent(commits.map(d => d.date));
    $: maxDatePlusOne = new Date(maxDate);
    $: maxDatePlusOne.setDate(maxDatePlusOne.getDate() + 1);
    $: [minLines, maxLines] = d3.extent(commits.map(d => d.totalLines)); 
    
    $: yScale = d3.scaleLinear()
    .domain([24, 0])
    .range([usableArea.bottom, usableArea.top]);
    
    $: xScale = d3.scaleTime()
    .domain([minDate, maxDatePlusOne])
    .range([usableArea.left, usableArea.right])
    .nice();
    
    $: rScale = d3.scaleSqrt()
    .domain([minLines, maxLines])
    .range([5, 30])
    
    // axes
    let xAxis, yAxis;
    $: {
        d3.select(xAxis).call(d3.axisBottom(xScale));
        d3.select(yAxis).call(d3.axisLeft(yScale)
        .tickFormat(d => String(d % 24).padStart(2, "0") + ":00"));
    }
    
    let yAxisGridlines;
    $: {
        d3.select(yAxisGridlines).call(
            d3.axisLeft(yScale)
            .tickFormat("")
            .tickSize(-usableArea.width)
        );
    }

    // brushing area
    let svg;
    $: {
        d3.select(svg).call(d3.brush()
        .extent([[usableArea.left, usableArea.top], [usableArea.right, usableArea.bottom]])
        .on("start brush end", brushed));            // raise the other elements of the svg in front of the bushing area
        d3.select(svg).selectAll(".dots, .overlay ~ *").raise();
    }
    $: brushSelection = null;
    $: brushedCommits = brushSelection ? commits.filter(isCommitBrushed) : [];
    $: selectedCommits = Array.from(new Set([...clickedCommits, ...brushedCommits]));
    
    function brushed (evt) {
        brushSelection = evt.selection;
    }

    function isCommitBrushed (commit) {
        if (!brushSelection) {
            return false;
        }
        else {
            // Return true if commit is within brushSelection
            // and false if not
            let min = {x: brushSelection[0][0], y: brushSelection[0][1]};
            let max = {x: brushSelection[1][0], y: brushSelection[1][1]};
            let commitX = xScale(commit.date);
            let commitY = yScale(commit.hourFrac);
            return commitX >= min.x && commitX <= max.x && commitY >= min.y && commitY <= max.y;
        }
    }
    
    // selecting the right commit for the tooltip
    let hoveredIndex = -1;
    $: hoveredCommit = commits[hoveredIndex] ?? hoveredCommit ?? {};
    let commitTooltip;
    let tooltipPosition = {x: 0, y: 0};
    
    async function dotInteraction (index, evt) {
        let hoveredDot = evt.target;
        if (evt.type === "mouseenter") {
            hoveredIndex = index;
            tooltipPosition = await computePosition(hoveredDot, commitTooltip, {
                strategy: "fixed", // because we use position: fixed
                middleware: [
                    offset(5), // spacing from tooltip to dot
                    autoPlacement() // see https://floating-ui.com/docs/autoplacement
                ],
            });        
        }
        else if (evt.type === "mouseleave") {
            hoveredIndex = -1
        }
        else if (evt.type === "click") {
            let commit = commits[index]
            if (!clickedCommits.includes(commit)) {
                // Add the commit to the clickedCommits array
                clickedCommits = [...clickedCommits, commit];
            }
            else {
                // Remove the commit from the array
                clickedCommits = clickedCommits.filter(c => c !== commit);
            }
        }
            
    }
        
    // clickable commits
    let clickedCommits = [];
    
    //filtered bar graph
    $: selectedLines = (selectedCommits.length > 0 ? selectedCommits.flatMap(d => d.lines) : locData);
    $: selectedCounts = d3.rollup(
        selectedLines,
        v => v.length,
        d => d.type
    );
    $: allTypes = Array.from(new Set(locData.map(d => d.type)));
    $: barData = allTypes.map(type =>  ({ label: String(type), value: selectedCounts.get(type) || 0 }));
    $: barTitle = selectedCommits.length == 0 ? "Lines of Code: Website Breakdown" : `Lines of Code: ${selectedCommits.length} Selected Commits`;
    </script>

<div class="container">
    <svg viewBox="0 0 {width} {height}" bind:this={svg}>
        <g transform="translate(0, {usableArea.bottom})" bind:this={xAxis} />
        <g class="gridlines" transform="translate({usableArea.left}, 0)" bind:this={yAxisGridlines} />
        <g transform="translate({usableArea.left}, 0)" bind:this={yAxis} />
        <g class="dots">
            {#each commits as commit, index }
                <circle
                    on:mouseenter={evt => dotInteraction(index, evt)}
                    on:mouseleave={evt => dotInteraction(index, evt)}
                    on:click={ evt => dotInteraction(index, evt) }
                    class:selected={ selectedCommits.includes(commit) }
                    cx={ xScale(commit.datetime) }
                    cy={ yScale(commit.hourFrac) }
                    r={ rScale(commit.totalLines) }
                    fill="steelblue"
                />
            {/each}
        </g>  
    </svg>
</div>

<dl class="info tooltip" 
    bind:this={commitTooltip} 
    hidden={hoveredIndex === -1} 
    style="top: {tooltipPosition.y}px; left: {tooltipPosition.x}px"
>
	<dt>Commit</dt>
	<dd><a href="{ hoveredCommit.url }" target="_blank">{ hoveredCommit.id }</a></dd>

	<dt>Date</dt>
	<dd>{ hoveredCommit.datetime?.toLocaleString("en", {dateStyle: "full"}) }</dd>

	<!-- Add: Time, author, lines edited -->
</dl>

<BarHorizontal data={barData} title={barTitle}/>

<style>
	svg {
		overflow: visible;
	}

    .gridlines {
	    stroke-opacity: .2;
    }

    .dots {
        fill-opacity: .7;
    }

    circle {
        transition: 200ms;
        &:hover {
            fill: darkgreen;
        }
    }

    .selected {
        fill: var(--color-accent);
    }


    dl.info {
        display: grid;
        background-color: color-mix(in oklch, oklch(100% 0% 0 / 70%), canvas 85%);
        box-shadow: 10px 5px 5px oklch(0% 0% 0 / 30%);
        border-radius: 5px;
        backdrop-filter: blur(5px);
        padding: 1em;

        transition-duration: 300ms;
        transition-property: opacity, visibility;

        &[hidden]:not(:hover, :focus-within) {
            opacity: 0;
            visibility: hidden;
        }
    }

    dl.info dt {
        grid-column: 1;
        text-align: right;
        text-transform: uppercase;
        color: rgb(87, 87, 87);    
        font-weight: bold;       
    }

    dl.info dd {
        margin-left: 1em;
        grid-column: 2;
    }

    .tooltip {
        position: fixed;
        top: 1em;
        left: 1em;
    }
    
    @keyframes marching-ants {
        to {
            stroke-dashoffset: -8; /* 5 + 3 */
        }
    }

    svg :global(.selection) {
        fill-opacity: 10%;
        stroke: black;
        stroke-opacity: 70%;
        stroke-dasharray: 5 3;
        animation: marching-ants 2s linear infinite;
    }



</style>