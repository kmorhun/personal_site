<script>
    import * as d3 from 'd3';
    import { onMount } from "svelte";

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

</script>

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
</article>