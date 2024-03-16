<svelte:head>
	<title>Projects</title>
</svelte:head>

<script>
    import * as d3 from 'd3';
    import projects from '$lib/projects.json';
    import Project from '$lib/Project.svelte';
    import Projects from '$lib/Projects.svelte';
    import Pie from '$lib/Pie.svelte';

    let filteredProjects;
    let query = "";
    
    $: filteredProjects = projects.filter(project => {
        if (query) {
            return project.title.includes(query) || project.description.includes(query);
        }

        return true;
    }); 

    // console.log(projects);
    // console.log(rolledData);

    let rolledData = d3.rollups(projects, v => v.length, d => d.year);
    let pieData = rolledData.map(([year, count]) => ({label: year, value: count}));
    
    </script>

<article class="content">
    <h1>What am I working on? At least {projects.length} things!</h1>
    
    <input type="search" bind:value={query}
        aria-label="Search projects" placeholder="🔍 Search projects…" />
    
    <Pie data={pieData}/>
    <Projects list={filteredProjects}/>
</article>