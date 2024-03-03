<div class="projects">
    {#each list as p}
        <Project info={p}/>
    {/each}
</div>

<style>
    .projects {
        display: grid;
        grid-column-gap: 1em;
        grid-template-columns: repeat(auto-fill, minmax(15em, 1fr));
    }
</style>

<script>
    import projects from '$lib/projects.json';
    import Project from '$lib/Project.svelte';
    export let list = projects;
</script>