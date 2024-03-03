<svelte:head>
	<title>Projects</title>
</svelte:head>

<script>
    import projects from '$lib/projects.json';
    import Project from '$lib/Project.svelte';
    import Projects from '$lib/Projects.svelte';
</script>

<article class="content">
    <h1>What am I working on? At least {projects.length} things!</h1>
    <Projects />
</article>