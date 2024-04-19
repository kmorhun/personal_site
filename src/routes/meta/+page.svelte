<script>
    import * as d3 from 'd3';
    import { onMount } from "svelte";
    import Pie from '$lib/Pie.svelte';
    import Scatterplot from '$lib/Scatterplot.svelte';
    import FileLines from '$lib/FileLines.svelte';
    import Scrolly from "svelte-scrolly";

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
    let raceProgress = 0; // for the filerace scrolly
    let commitProgress = 100; // for the scatterplot scrolly
    let commitMaxTime;
    $: timeScale = d3.scaleTime()
        .domain(d3.extent(commits, d => d.datetime))
        .range([0, 100]);
    
    $: commitMaxTime = timeScale.invert(commitProgress);
    
    let fileRaceMaxTime;
    $: fileRaceMaxTime = timeScale.invert(raceProgress);

    //  filter commits
    let filteredCommits = [];
    let filteredLines = [];
    let filteredRaceLines = [];
    $: {
        filteredCommits = commits.filter(d => d.datetime <= commitMaxTime);
        // console.log("filteredCommits", filteredCommits);
    }
    $: {
        filteredLines = data.filter(d => d.datetime <= commitMaxTime);
        // console.log("filteredLines", filteredLines);
    }
    $: {
        filteredRaceLines = data.filter(d => d.datetime <= fileRaceMaxTime);
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
        selectedLines = (hasSelection ? selectedCommits : filteredCommits).flatMap(d => d.lines);
        // console.log("selectedLines", selectedLines);
    }

    let languageBreakdown;
    $: {
        languageBreakdown = d3.rollups(selectedLines, v => v.length, d => d.type);
        // console.log(languageBreakdown);
    }

    let pieData;
    $: {
        pieData = Array.from(languageBreakdown).map(([language, lines]) => ({label: language.toUpperCase(), id: language, value: lines}));
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

    /* only affect the body of the meta page */
    :global(body) {
        max-width: min(120ch, 80vw);
    }
</style>

<article class="content">
    <h1>Meta</h1>
    <p>A visual deep dive into the code of this website!</p>
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
    
    <Scrolly bind:progress={commitProgress}>

        <!-- The narrative component -->
        {#each commits as commit, index }
            <p>
                On {commit.datetime.toLocaleString("en", {dateStyle: "full", timeStyle: "short"})},
                I made <a href="{commit.url}" target="_blank">{ index > 0 ? 'another glorious commit' : 'my first commit, and it was glorious' }</a>.
                I edited {commit.totalLines} lines across { d3.rollups(commit.lines, D => D.length, d => d.file).length } files.
                Then I looked over all I had made, and I saw that it was very good.
            </p>
        {/each}


        <svelte:fragment slot="viz">
            <!-- The visualization component -->
            <!-- <p>Total lines of code: {filteredLines.length}</p> -->
            
            <h2>Commits by time of day</h2>
        
            <!-- <label>
                Show commits until: 
                <input type="range" min="0" max="100" step="1" bind:value={commitProgress}/>
            </label>
            <div id="commitRange">
                <time>{commitMaxTime.toLocaleString("en", {dateStyle: "long", timeStyle: "short"})}</time>
            </div> -->

            <!-- TODO: add the date to the actual browser scrollbar thumb -->
        
            <Scatterplot commits={filteredCommits} lines={filteredLines} bind:selectedCommits={selectedCommits} />
            
            <Pie data={pieData} colors={colors}/>
            
        </svelte:fragment>
    </Scrolly>

    <br/>
    
    <Scrolly bind:progress={raceProgress} --scrolly-layout="viz-first"  throttle=500>
        <!-- The flip doesn't work on firefox -->
        
        <!-- the narrative component -->

        {#each commits as commit, index }
            <p>
                On {commit.datetime.toLocaleString("en", {dateStyle: "full", timeStyle: "short"})},
                I made <a href="{commit.url}" target="_blank">{ index > 0 ? 'another glorious commit' : 'my first commit, and it was glorious' }</a>.
                I edited {commit.totalLines} lines across { d3.rollups(commit.lines, D => D.length, d => d.file).length } files.
                Then I looked over all I had made, and I saw that it was very good.
            </p>
        {/each}

        <svelte:fragment slot="viz">
            <!-- the visual component -->
            <FileLines lines={filteredRaceLines} colors={colors}/>
        </svelte:fragment>

    </Scrolly>
</article>