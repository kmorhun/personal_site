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
        <!-- {#each commits as commit, index }
            <p>
                On {commit.datetime.toLocaleString("en", {dateStyle: "full", timeStyle: "short"})},
                I made <a href="{commit.url}" target="_blank">{ index > 0 ? 'another glorious commit' : 'my first commit, and it was glorious' }</a>.
                I edited {commit.totalLines} lines across { d3.rollups(commit.lines, D => D.length, d => d.file).length } files.
                Then I looked over all I had made, and I saw that it was very good.
            </p> 
            
        {/each} -->
        
        <p> As you can see, I've spent,,, a lot of time working on this site between the hours of midnight and 2:00am</p>

        <p>Alas, the life of a college student</p>

        <p>You may be wondering why my most common day of the week is Thursday. It's actually a function of 
            the structure of the class I took (6.C35, Interactive Data Visualization and Society), 
            where I learned the skills to build this site. 
        </p>

        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ratione, minima veniam perspiciatis magnam 
            delectus corrupti expedita? Suscipit magni magnam quos distinctio nesciunt, repellendus quod mollitia 
            animi modi porro. Quasi deleniti possimus ipsam deserunt nam, autem rerum commodi ea ab tempora. 
            Enim numquam, incidunt ipsa quisquam repellat laudantium mollitia voluptatum temporibus cum modi 
            velit similique non quo? Atque itaque enim aspernatur architecto consectetur sequi accusamus beatae 
            maxime blanditiis! Et amet totam qui minus officiis neque deserunt! Aut provident dolore quos veniam 
            sed similique fuga officiis asperiores, perspiciatis molestias aspernatur, laboriosam aliquam, nesciunt
             ipsum veritatis repellendus et fugit vitae accusamus beatae architecto culpa. Dolorum, minus 
             recusandae. Veritatis pariatur fuga dignissimos obcaecati nostrum. Sed sit suscipit labore, 
             dolor ut eius. Ut odit blanditiis expedita temporibus assumenda quae quos harum placeat fugiat 
             asperiores delectus, iusto voluptatem officia mollitia eos quas eligendi? Hic molestias nihil 
             debitis culpa ad magni ducimus eos necessitatibus delectus, tenetur quam, mollitia aperiam 
             veniam maxime expedita dignissimos facere aliquam beatae neque dolor, esse non fugit odit. Ipsa 
             sequi at repellendus asperiores maiores ipsum ad quia et aspernatur alias minima, illum harum 
             recusandae quos, quo dolores optio incidunt neque aliquid suscipit repudiandae, doloribus doloremque. 
             Quis iure illo error qui porro quisquam facere mollitia maxime, unde, possimus tenetur aperiam.
              Saepe quia voluptas sequi nulla amet, tempore cum rem consequuntur animi voluptatem eveniet esse 
              modi fuga ex vitae expedita mollitia perferendis doloremque deleniti culpa laudantium quaerat 
              soluta ad. Esse eligendi atque fuga neque blanditiis, pariatur unde at? Commodi cupiditate provident
               accusamus expedita recusandae fugit ex nostrum aut totam tempore ratione alias sint incidunt 
               voluptate laudantium nemo at facilis, vero debitis odio officiis! Reprehenderit modi natus 
               eius harum cumque ipsum saepe quidem, aspernatur suscipit eveniet? Quae, eos omnis repellat harum 
               adipisci ducimus rem aperiam voluptatibus quod beatae dolores facere sunt inventore. Ipsam quam 
               voluptas voluptatum optio temporibus nisi laboriosam recusandae reiciendis, provident ex fugit 
               inventore libero sed, quae neque corrupti! Nemo labore ut minus delectus ipsam nam architecto 
               voluptas optio magnam dolores illum saepe inventore, numquam reprehenderit perspiciatis ullam!
                Ratione aspernatur iste praesentium sunt fuga! Nobis maiores obcaecati autem eveniet dicta modi 
                dolores nostrum quae quisquam? Hic quod reprehenderit officia quo ad eveniet exercitationem modi
                 eius quos provident, placeat facilis, odit reiciendis nam, magni at labore nihil obcaecati rem 
                 blanditiis eligendi quasi ducimus! Praesentium ratione corrupti delectus hic non, dignissimos 
                 earum, ullam eos rem voluptatibus, nihil deleniti at accusantium expedita. Libero ipsa illum 
                 doloremque, cum nesciunt impedit natus sapiente magnam repellat, quam accusamus minus placeat
                  repellendus iure. Velit eaque quae, delectus voluptatibus iusto tempore earum adipisci iure 
                  consectetur aliquid, ducimus deleniti enim, aut magni sed dolores possimus cumque! Commodi 
                  id pariatur adipisci laborum quasi, voluptatum quae doloribus perspiciatis, vero accusamus 
                  aliquid beatae quisquam repellendus maxime iure quod quas modi, sunt repellat placeat 
                  asperiores. Assumenda facilis nesciunt necessitatibus sed ea accusamus dolores repudiandae 
                  reprehenderit officiis, similique cum ut vitae! Ullam temporibus sapiente nulla, aliquam, 
                  odit dolores impedit, praesentium amet tempora tenetur obcaecati nam quas alias voluptas 
                  totam minima ad reiciendis modi. Velit magni obcaecati error possimus.</p>


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
    
    <Scrolly bind:progress={raceProgress} --scrolly-layout="viz-first"  throttle=200>
        <!-- The flip doesn't work on firefox -->
        
        <!-- the narrative component -->

        <!-- {#each commits as commit, index }
            <p>
                On {commit.datetime.toLocaleString("en", {dateStyle: "full", timeStyle: "short"})},
                I made <a href="{commit.url}" target="_blank">{ index > 0 ? 'another glorious commit' : 'my first commit, and it was glorious' }</a>.
                I edited {commit.totalLines} lines across { d3.rollups(commit.lines, D => D.length, d => d.file).length } files.
                Then I looked over all I had made, and I saw that it was very good.
            </p>
        {/each} -->

        <p>oh look the files are racing</p>

        <p>look at them go woooooo</p>

        <p>they're going so fast</p>

        <p>
            They often jump in size after spending a while being static, because I tend to work in long, marathon-like 
            sessions where I make a lot of changes at once, followed by long periods of inactivity. It helps me focus
            to spend a long time thinking about the same problem :)
        </p>

        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolorem inventore saepe quos deserunt eos 
            quis a. Excepturi vel tenetur doloribus cum maxime nemo sed non enim magni corporis hic inventore 
            corrupti adipisci laborum autem omnis, illum, incidunt culpa iure perferendis perspiciatis dolore 
            nostrum, unde amet? Quia incidunt id ea minus laborum a dolores perspiciatis corporis, dicta 
            accusantium tenetur voluptatem fugit ullam? Sequi perspiciatis eius dolorum laborum vel autem quam 
            voluptates pariatur veritatis, amet incidunt repellat illo fugiat magnam. Nam reprehenderit dolores 
            placeat quis unde ab deleniti fuga pariatur vitae inventore doloremque minus in nisi provident nostrum 
            ad, ullam quia molestias, id cumque voluptas! Provident ut sequi velit possimus fuga rem nemo ullam 
            aliquam rerum aspernatur! Quo, natus doloremque! Provident facere distinctio excepturi eveniet 
            mollitia, vitae incidunt non repellendus harum deserunt quam aliquam voluptas quos quaerat libero at. 
            Labore quia dolore iure maiores quibusdam odio debitis suscipit quod, vero magni soluta! Dolore 
            quidem, saepe impedit illo sequi ad distinctio fuga explicabo iure soluta labore quisquam id deserunt 
            animi ea voluptatibus, ex corporis eligendi necessitatibus? Minima facere commodi odio dolorum aut 
            sapiente. Tempore alias veritatis, est sint saepe ipsam obcaecati sed fuga asperiores perferendis iure 
            ab eveniet, accusantium similique porro id. Numquam.</p>

        <svelte:fragment slot="viz">
            <!-- the visual component -->
            <FileLines lines={filteredRaceLines} colors={colors}/>
        </svelte:fragment>

    </Scrolly>
</article>