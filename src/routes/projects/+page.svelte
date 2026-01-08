<svelte:head>
	<title>Projects</title>
</svelte:head>

<!-- TODO: FIGURE OUT FILTERING BY BOTH YEAR AND QUERY -->
<script>
    import * as d3 from 'd3';
    import projects from '$lib/projects.json';
    import Project from '$lib/Project.svelte';
    import Projects from '$lib/Projects.svelte';
    import Pie from '$lib/Pie.svelte';
    import { onMount } from 'svelte';

    // Umami is not available during server-side rendering, only on the client
    let umamiAvailable = false;

    onMount(() => {
        // This svelte lifecycle function only runs once the component is first rendered in the client
        // So this keeps umami unavailable until server-side rendering is complete
        umamiAvailable = typeof umami !== 'undefined';
    });

    function trackSearch() {
        if (umamiAvailable && umami?.track) {
            umami.track('search-projects');
        }
    }
    // end umami tracking logic

    let filteredProjects;
    let query = "";
    
    $: filteredProjects = projects.filter(project => {
        
        let allValues = Object.values(project).join("\n").toLowerCase();
        if (query) {
            return allValues.includes(query.toLowerCase());
        }

        return true;
    }); 

    let pieData;
    let rolledData;

    $: {
        pieData = {};
        rolledData = {};
        rolledData = d3.rollups(filteredProjects, v => v.length, d => d.year);
        pieData = rolledData.map(([year, count]) => ({label: year, value: count}));
    }

    let selectedYearIndex = -1;
    let selectedYear;
    $: selectedYear = selectedYearIndex > -1 ? pieData[selectedYearIndex].label : null;

    let filteredByYear;
    
    $: filteredByYear = filteredProjects.filter(project => {
        
        if (selectedYearIndex > -1) {
            return project.year === selectedYear;
        }

        return true;
    }); 

</script>

<style>
  input {
    width: 100%;
    margin: 1em 0;
  }  
</style>

<article class="content">
    <h1>What am I working on? At least {filteredProjects.length} things!</h1>
    
    <Pie data={pieData} bind:selectedIndex={selectedYearIndex}/>
    <input type="search" bind:value={query} on:click={trackSearch}
        aria-label="Search projects" placeholder="🔍 Search projects…" />
    
    <Projects list={filteredProjects}/>
</article>