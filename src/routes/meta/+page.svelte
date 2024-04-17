<script>
    import * as d3 from 'd3';
    import { onMount } from "svelte";
    import {
        computePosition,
        autoPlacement,
        offset,
    } from '@floating-ui/dom';
    import Pie from '$lib/Pie.svelte';
    
    let data = [];
    let commits = [];
    onMount(async () => {
        data = await d3.csv("loc.csv", row => ({
            ...row,
            line: Number(row.line),
            depth: Number(row.depth),
            length: Number(row.length),
            date: new Date(row.date + "T00:00" + row.timezone),
            datetime: new Date(row.datetime),
        }));
        
        // extract data about commits
        commits = d3.groups(data, d => d.commit).map(([commit, lines]) => {
            let first = lines[0];
            let {author, date, time, timezone, datetime} = first;
            let ret = {
                id: commit,
                url: "https://github.com/kmorhun/personal_site/commit/" + commit,
                author, date, time, timezone, datetime,
                hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
                totalLines: lines.length
            };
            
            // like setting ret.lines = lines, but make it not show up in JSON.stringify
            Object.defineProperty(ret, "lines", {
                value: lines,
                configurable: true,
                writable: true,
                enumerable: false,
            });

            return ret;
        });

        //sort commits by number of lines so smaller dots are painted on top
        commits = d3.sort(commits, d => -d.totalLines)

        // console.log(commits);
        
    });
    
    //  filter commits
    let commitMaxTime;
    let filteredCommits = [];
    let filteredLines = [];
    $: commitMaxTime = timeScale.invert(commitProgress);
    $: {
        filteredCommits = commits.filter(d => d.datetime <= commitMaxTime);
        console.log("filteredCommits", filteredCommits);
    }
    $: {
        filteredLines = data.filter(d => d.datetime <= commitMaxTime);
        console.log("filteredLines", filteredLines);
    }
    
    // get most frequent time of day
    let workByPeriod = [];
    $: {
        workByPeriod = d3.rollups(filteredLines, v => v.length, 
        d => d.datetime.toLocaleString("en", {dayPeriod: "short"})
        );
        // console.log(workByPeriod);
    }
    
    let workByDay = [];
    $: {
        workByDay = d3.rollups(filteredLines, v => v.length, 
        d => d.datetime.toLocaleString("en", {weekday: "long"})
        );
        // console.log(workByDay);
    }
    
    $: maxPeriod = d3.greatest(workByPeriod, (d) => d[1])?.[0];
    $: maxDay = d3.greatest(workByDay, (d) => d[1])?.[0];
    
    // create a scatterplot
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
        .domain(d3.extent(filteredLines, d => d.datetime))
        .range([usableArea.left, usableArea.right])
        .nice();
    
    $: rScale = d3.scaleSqrt()
        .domain(d3.extent(commits, d => d.totalLines))
        .range([5, 20]); 
        
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
    $: hoveredCommit = filteredCommits[hoveredIndex] ?? {};

    // let cursor = {x: 0, y: 0};
    let commitTooltip;
    let tooltipPosition = {x: 0, y: 0};
    
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
            selectedCommits = [filteredCommits[index]];
        }
    }

    // set up brushing
    let svg;

    function brushed (evt) {
        // console.log(evt);
        let brushSelection = evt.selection;

        // update selected commits when brushed called
        selectedCommits = !brushSelection ? [] : filteredCommits.filter(commit => {
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

    let selectedCommits, hasSelection, selectedLines;
    selectedCommits = [];

    $: {
        hasSelection = selectedCommits.length > 0;
        // console.log("hasSelection", hasSelection);
    }
    $: {
        selectedLines = (hasSelection ? selectedCommits : filteredCommits).flatMap(d => d.lines);
        // console.log("selectedLines", selectedLines);
    }

    let languageBreakdown;
    $: {
        languageBreakdown = d3.rollups(selectedLines, v => v.length, d => d.type);
        // console.log(languageBreakdown);
    }

    $: pieData = Array.from(languageBreakdown).map(([language, lines]) => ({label: language.toUpperCase(), value: lines}))
    const percentFormat = d3.format(".1~%");

    // set up time scale for commit progress
    let commitProgress = 100;
    $: timeScale = d3.scaleTime()
        .domain(d3.extent(commits, d => d.datetime))
        .range([0, 100]);


</script>

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

        @starting-style {
            /* make css transitions fire when circles appear */
            /* doesn't work in firefox */
            r:0;
        }
    }

    circle.selected {
        fill: var(--color-accent);
    }

    label {
        display: flex;
        align-items: center;
        gap: 0.5em;

        input {
            flex: 1;
        }
    }

    #commitRange {
        display: flex;
        flex-direction: column;
        text-align: right;
        margin-bottom: 1em;
    }

</style>

<article class="content">
    <h1>Meta</h1>
    <p>A visual deep dive into the code of this website!</p>
    <!-- <p>Total lines of code: {filteredLines.length}</p> -->
    <dl class="stats">
        <dt>Total <abbr title="Lines of Code">LOC</abbr></dt>
        <dd>{filteredLines.length}</dd>
        <dt>Commits</dt>
        <dd>{filteredCommits.length}</dd>
        <dt>Files</dt>
        <dd>{d3.group(filteredLines, d => d.file).size}</dd>
        <dt>Most Frequent Time of Day</dt>
        <dd>{maxPeriod}</dd>
        <dt>Most Frequent Day</dt>
        <dd>{maxDay}</dd>
    </dl>
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

    <h2>Commits by time of day</h2>

    <label>
        Show commits until: 
        <input type="range" min="0" max="100" step="1" bind:value={commitProgress}/>
    </label>
    <div id="commitRange">
        <time>{commitMaxTime.toLocaleString("en", {dateStyle: "long", timeStyle: "short"})}</time>
    </div>

    <svg viewBox="0 0 {width} {height}"
        bind:this={svg}>
        <!-- move the position of the axes to respect the margins -->
        <g class="gridlines" transform="translate({usableArea.left}, 0)" bind:this={yAxisGridlines}/>
        <g transform="translate(0, {usableArea.bottom})" bind:this={xAxis}/>
        <g transform="translate({usableArea.left}, 0)" bind:this={yAxis}/>
        <g class="dots">
            {#each filteredCommits as commit, index (commit.id)}
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
    <p>{hasSelection ? selectedCommits.length : "No"} commits selected</p>
    <!-- <dl class="stats">
        {#each languageBreakdown as [language, lines]}
            <dt>{language.toUpperCase()}</dt>
            <dd>{lines} lines ({percentFormat(lines/selectedLines.length)})</dd>
        {/each}
    </dl> -->
    <Pie data={pieData}/>
</article>