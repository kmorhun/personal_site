<dl class="files">
    <!-- iterate over keyed each block to avoid datapoints moving around too much -->
    {#each files as file (file.name)}
        <div animate:flip={{duration: 1000}}>
            <dt>
                <code>{file.name}</code>
                <small>{file.lines.length} lines</small>
            </dt>
            <dd>
                {#each file.lines as line (line.line) }
                    <div 
                        class="line" 
                        style="--color: {colors(line.type)}"
                        in:scale
                    />
                {/each}
            </dd>
        </div>
    {/each}
</dl>

<style>
    dl {
        display: grid;
        grid-template-columns: auto auto;
        gap: 1em;

        & > div {
            grid-column: 1 / -1;
            display: grid;
            grid-template-columns: subgrid
        }

        dt {
            grid-column: 1;
        }
    
        dd {
            grid-column: 2;

            /* sllow the dots to wrap and be tightly packed */
            display: flex;
            flex-wrap: wrap;
            align-items: start;
            align-content: start;
            gap: 0.15em;
            padding-top: 0.6em;
            margin-left: 0;
        }
    }

    small {
        display: block;
        opacity: 0.7;
    }

    .line {
        display: flex;
        width: 0.5em;
        aspect-ratio: 1;
        background: var(--color);
        border-radius: 50%;
    }


</style>

<script>
    import * as d3 from 'd3';
    import { scale } from 'svelte/transition';
    import { flip as originalFlip } from 'svelte/animate';

    export let lines = [];
    let files = [];
    $: {
        files = d3.groups(lines, d => d.file).map(([name, lines]) => {
            return {name, lines};
        });
        files = d3.sort(files, d => -d.lines.length);
    }

    export let colors = d3.scaleOrdinal(d3.schemeSet3);

    // force flip to update whenever files changes, rather than every time the slider changes
    function getFlip() {
        return originalFlip;
    }
    $: flip = getFlip(files); // forces a rerun when files changes
</script>