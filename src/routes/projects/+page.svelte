<svelte:head>
	<title>Projects</title>
</svelte:head>

<script>
    import projects from '$lib/projects.json';
    import Project from '$lib/Project.svelte';
</script>

<article class="content">
    <h1>What am I working on? At least {projects.length} things!</h1>
    <div class="projects">
        {#each projects as p}
            <Project info={p}/>
        {/each}
    </div>
</article>