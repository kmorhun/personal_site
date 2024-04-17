<script>
    import * as d3 from 'd3';
    import { onMount } from "svelte";
    import {
        computePosition,
        autoPlacement,
        offset,
    } from '@floating-ui/dom';
    import Pie from '$lib/Pie.svelte';
    import Scatterplot from '$lib/Scatterplot.svelte';
    import FileLines from '$lib/FileLines.svelte';
    
    let data = [];
    let commits = [];
    let colors = d3.scaleOrdinal(d3.schemeSet3);
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
    
    // set up time scale for commit progress
    let commitProgress = 100;
    let commitMaxTime;
    $: timeScale = d3.scaleTime()
        .domain(d3.extent(commits, d => d.datetime))
        .range([0, 100]);
    
    $: commitMaxTime = timeScale.invert(commitProgress);
    
    //  filter commits
    let filteredCommits = [];
    let filteredLines = [];
    $: {
        filteredCommits = commits.filter(d => d.datetime <= commitMaxTime);
        // console.log("filteredCommits", filteredCommits);
    }
    $: {
        filteredLines = data.filter(d => d.datetime <= commitMaxTime);
        // console.log("filteredLines", filteredLines);
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


    let selectedCommits, hasSelection, selectedLines;
    selectedCommits = [];

    $: {
        hasSelection = selectedCommits.length > 0;
        // console.log("hasSelection", hasSelection);
    }
    $: {
        selectedLines = (hasSelection ? selectedCommits : commits).flatMap(d => d.lines);
        // console.log("selectedLines", selectedLines);
    }

    let languageBreakdown;
    $: {
        // console.log("selectedLines", selectedLines);
        languageBreakdown = d3.rollups(selectedLines, v => v.length, d => d.type);
        // console.log(languageBreakdown);
    }

    let pieData;
    $: {
        pieData = Array.from(languageBreakdown).map(([language, lines]) => ({label: language.toUpperCase(), value: lines}));
        // console.log("piedata", pieData);
    }
    const percentFormat = d3.format(".1~%");

</script>

<style>
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
    
    <h2>Commits by time of day</h2>

    <label>
        Show commits until: 
        <input type="range" min="0" max="100" step="1" bind:value={commitProgress}/>
    </label>
    <div id="commitRange">
        <time>{commitMaxTime.toLocaleString("en", {dateStyle: "long", timeStyle: "short"})}</time>
    </div>

    <FileLines lines={filteredLines} colors={colors}/>
    <Scatterplot commits={filteredCommits} lines={filteredLines} bind:selectedCommits={selectedCommits} />

    <Pie data={pieData} colors={colors}/>
</article>