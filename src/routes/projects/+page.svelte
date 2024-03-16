<svelte:head>
	<title>Projects</title>
</svelte:head>

<script>
    import * as d3 from 'd3';
    import projects from '$lib/projects.json';
    import Project from '$lib/Project.svelte';
    import Projects from '$lib/Projects.svelte';
    import Pie from '$lib/Pie.svelte';

    
    let rolledData = d3.rollups(projects, v => v.length, d => d.year);
    let pieData = rolledData.map(([year, count]) => ({label: year, value: count}));
    
    </script>

<article class="content">
    <h1>What am I working on? At least {projects.length} things!</h1>
    <Pie data={pieData}/>
    <Projects />
</article>