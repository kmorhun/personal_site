<svelte:head>
	<title>Projects</title>
</svelte:head>

<script>
    import projects from '$lib/projects.json';
</script>

<article class="content">
    <h1>What am I working on? At least {projects.length} things!</h1>
    <div class="projects">
        {#each projects as p}
            <article>
                <h2>{p.title}</h2>
                <img src={p.image} alt="">
                <p>{p.description}</p>
            </article>
        {/each}
    </div>
</article>