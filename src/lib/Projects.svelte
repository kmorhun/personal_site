<div class="projects">
    {#each list as p}
        <Project info={p}/>
    {/each}
</div>

<script>
    import projects from '$lib/projects.json';
    import Project from '$lib/Project.svelte';
    export let list = projects;
</script>