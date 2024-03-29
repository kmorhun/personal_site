<script>
    import * as d3 from 'd3';
    import { onMount } from "svelte";
    import {
        computePosition,
        autoPlacement,
        offset,
    } from '@floating-ui/dom';
    
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
    
    // get most frequent time of day
    let workByPeriod = [];
    $: {
        workByPeriod = d3.rollups(data, v => v.length, 
        d => d.datetime.toLocaleString("en", {dayPeriod: "short"})
        );
        // console.log(workByPeriod);
    }
    
    let workByDay = [];
    $: {
        workByDay = d3.rollups(data, v => v.length, 
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
        .domain(d3.extent(data, d => d.datetime))
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
    $: hoveredCommit = commits[hoveredIndex] ?? {};

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
            // cursor = {x: evt.x, y: evt.y};
        }

        else if (evt.type === "mouseleave" || evt.type === "blur") {
            // dot unhovered
            hoveredIndex = -1;
        }
    }

</script>

<style>
    svg {
        overflow: visible;
    }

    .gridlines {
        stroke-opacity: 0.2;
    }

    dl.info {
        display: grid;
        background-color: oklch(100% 0% 0 / 50%);
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
            color: grey;    
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
</style>

<article class="content">
    <h1>Meta</h1>
    <p>A visual deep dive into the code of this website!</p>
    <!-- <p>Total lines of code: {data.length}</p> -->
    <dl class="stats">
        <dt>Total <abbr title="Lines of Code">LOC</abbr></dt>
        <dd>{data.length}</dd>
        <dt>Commits</dt>
        <dd>{commits.length}</dd>
        <dt>Files</dt>
        <dd>{d3.group(data, d => d.file).size}</dd>
        <dt>Most Frequent Time of Day</dt>
        <dd>{maxPeriod}</dd>
        <dt>Most Frequent Day</dt>
        <dd>{maxDay}</dd>
    </dl>
    <dl id="commit-tooltip" 
        class="info tooltip"
        bind:this={commitTooltip}
        hidden={hoveredIndex === -1}
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
    <svg viewBox="0 0 {width} {height}">
        <!-- move the position of the axes to respect the margins -->
        <g class="gridlines" transform="translate({usableArea.left}, 0)" bind:this={yAxisGridlines}/>
        <g transform="translate(0, {usableArea.bottom})" bind:this={xAxis}/>
        <g transform="translate({usableArea.left}, 0)" bind:this={yAxis}/>
        <g class="dots">
            {#each commits as commit, index}
                <circle
                    cx={xScale(commit.datetime)}
                    cy={yScale(commit.hourFrac)}
                    r={rScale(commit.totalLines)}
                    fill="steelblue"
                    tabindex="0"
                    aria-describedby="commit-tooltip"
                    role="tooltip"
                    aria-haspopup="true"
                    on:mouseenter={evt => dotInteraction(index, evt)}
                    on:mouseleave={evt => dotInteraction(index, evt)}
                    on:focus={evt => dotInteraction(index, evt)}
                    on:blur={evt => dotInteraction(index, evt)}
                />
            {/each}
        </g>
    </svg>
</article>