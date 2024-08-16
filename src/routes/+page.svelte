<svelte:head>
	<title>Home Page</title>
    <script src="https://kit.fontawesome.com/167f1ca93a.js" crossorigin="anonymous"></script>
</svelte:head>

<script>
    import projects from '$lib/projects.json';
    import Project from '$lib/Project.svelte';
    import Projects from '../lib/Projects.svelte';

    let profileData = {
	ok: true,
	json: async () => ({
		followers: 100,
		following: 100,
		public_repos: 100,
		public_gists: 100,
	})
};
</script>

<style>
    #quick-facts {
        /* reduce line height */
        h1 {
            margin-bottom: 0;
        }

        p {
            margin-top: 0;
        }
    }

    #profile-links {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        margin-top: 1em;

        .profile-link {
            display: flex;
            align-items: center;

            i {
                margin-right: 1em;
            }
        }
    }

</style>

<article class="content">
    <div id="quick-facts">
        <h1>Kateryna Morhun</h1>
        <p>Pronouns: she/her</p>

        <div id="profile-links">
            <span class="profile-link">
                <i class="fa fa-envelope"></i>
                <a href="mailto:kmorhun@mit.edu" target="_blank">kmorhun[at]mit[dot]edu</a>
            </span>
            <span class="profile-link">
                <i class="fa-brands fa-linkedin"></i>
                <a href="https://www.linkedin.com/in/morhunkateryna/" target="_blank">LinkedIn</a>
            </span>
            <span class="profile-link">
                <i class="fa-brands fa-github"></i>
                <a href="https://github.com/kmorhun" target="_blank">Github</a>
            </span>
        </div>
    </div>

    <h2>Привіт! Welcome!</h2>
    <div id="intro-content">
        <img id="selfie" src="images/kateryna_portrait_greece.jpg" alt="A selfie of me standing in front of the ancient Greek agora in Athens!">
        <div id="intro">
            <p>My name is Kateryna, a Ukrainian-American MIT student 
            pursuing public interest technology.</p>
            <p>I am committed to using my technological and 
            interpersonal skills for social good, and help 
            others do the same. In particular, I am passionate 
            about involving ethics into every step of the 
            development process, from ideation to data collection, 
            development, and deployment. I believe that the only 
            way to build a more equitable world is to do it 
            relentlessly and holistically.</p>
            <p>To that end, I follow machine learning engineering,
            AI regulation and technology policy, education 
            technology, and urban/transportation planning. I 
            believe it is crucial for us to interrogate the 
            status quo we find ourselves in and ask how we 
            can change our systems to be more equitable, 
            sustainable, and maintainable.</p>   
            <p>My personal philosophy doesn't end with my 
            professional interests - I have been ballroom dancing 
            competitively for over 15 years, and have experienced
            first-hand the effects of applying this philosophy 
            to my own physical body. I am convinced that this 
            can and must be applied to the larger societal 
            systems we find ourselves in.</p>
        </div>
    </div>

    <h2>My GitHub Stats</h2>
    {#await fetch("https://api.github.com/users/kmorhun") }
        <p>Loading...</p>
    {:then response}
        {#await response.json()}
            <p>Decoding...</p>
        {:then data}
            <dl class="stats">
                <dt>Followers</dt>
                <dd>{data.followers}</dd>
                <dt>Following</dt>
                <dd>{data.following}</dd>
                <dt>Public Repos</dt>
                <dd>{data.public_repos}</dd>
            </dl>        
        {:catch error}
            <p class="error">
                Something went wrong: {error.message}
            </p>
        {/await}
    {:catch error}
        <p class="error">
            Something went wrong: {error.message}
        </p>
    {/await}
    
    <h2>A peek at what I'm working on...</h2>
    <Projects list={projects.slice(0, 2)}/>
</article>
