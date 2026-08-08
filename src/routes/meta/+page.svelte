<script>
    import { base } from '$app/paths';
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    import ScatterPlot from '$lib/ScatterPlot.svelte';
    import LineChart from '$lib/LineChart.svelte';

    let locData = [];
    // let wrangled = [];
    let commits = [];

    onMount(async () => {
        locData = await d3.csv(`${base}/loc.csv`, row => ({
            ...row,
            line: Number(row.line),
            length: Number(row.length),
            depth: Number(row.depth),
            date: new Date(row.date + "T00:00" + row.timezone),
	        datetime: new Date(row.datetime)
        }));

        console.log(locData);
        
        // wrangled = d3.rollups(
        //     locData,
        //     v => v.length,
        //     d => d.type
        // ).map(([type, count]) => ({ label: String(type), value: count }));;
        

        commits = d3.groups(locData, d => d.commit).map(([commit, lines]) => {
            let first = lines[0];
            let {author, date, time, timezone, datetime} = first;
            let ret = {
                id: commit,
                url: "https://github.com/vis-society/lab-7/commit/" + commit,
                author, date, time, timezone, datetime,
                hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
                totalLines: lines.length,
                lines: lines
            };

            return ret;
        });

    });
    
    // get most frequent time of day
    let workByPeriod = [];
    $: {
        workByPeriod = d3.rollups(locData, v => v.length, 
            d => d.datetime.toLocaleString("en", {dayPeriod: "short"})
        );
    }

    let workByDay = [];
    $: {
        workByDay = d3.rollups(locData, v => v.length, 
        d => d.datetime.toLocaleString("en", {weekday: "long"})
    );
    }

    $: maxPeriod = d3.greatest(workByPeriod, (d) => d[1])?.[0];
    $: maxDay = d3.greatest(workByDay, (d) => d[1])?.[0];   

    let linesByDate = [];
    // $: {
    //     linesByDate = d3.rollups(
    //         locData,
    //         v => v.length,
    //         d => d3.timeDay.floor(d.datetime)  // floor to day for clean grouping
    //     )
    //     .map(([date, count]) => ({ date, count }))
    //     .sort((a, b) => a.date - b.date);  // sort chronologically
    // }

    $: {
        // get the count for each date in the data
        const rolled = d3.rollups(
            locData,
            v => v.length,
            d => d3.timeDay.floor(d.datetime)
        ).map(([date, count]) => ({ date, count }));

        // get an array of all days covered by the data
        const [minDate, maxDate] = d3.extent(rolled, d => d.date);
        const allDays = d3.timeDays(minDate, d3.timeDay.offset(maxDate, 1));

        // const countByDate = new Map(rolled.map(d => [d.date.getTime(), d.count]));

        // linesByDate = allDays.map(date => ({
        //     date,
        //     count: countByDate.get(date.getTime()) ?? 0
        // }));
        
        // build linesByDate by filling all undefined dates with 0 counts
        linesByDate = allDays.map(date => ({
            date,
            count: rolled.find(d => d.date.getTime() === date.getTime())?.count ?? 0
        }));
        console.log(linesByDate);
    }
</script>

<h1>Meta</h1>

<p>A visual deep dive into the code of this website!</p>

<dl class="stats">
	<dt>Total <abbr title="Lines of code">LOC</abbr></dt>
	<dd>{locData.length}</dd>
    <dt>Commits</dt>
    <dd>{commits.length}</dd>
    <dt>Files</dt>
    <dd>{d3.group(locData, d => d.file).size}</dd>
    <dt>Most Frequent Time of Day</dt>
    <dd>{maxPeriod}</dd>
    <dt>Most Frequent Day</dt>
    <dd>{maxDay}</dd>
</dl>

<ScatterPlot commits={commits} locData={locData}/>

<!-- <hr/>

    TODO: Fix the outlier in this chart so it looks nice

<LineChart data={linesByDate} /> -->