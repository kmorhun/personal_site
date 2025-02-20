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
        h1 {
            margin-top: 0;
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

    #selfie {
        width: 100%;
        height: 100%;
        float: right;
        border-radius: 5%;
        margin-right: 5%;
        margin-left: 3%;
        max-width: 40%;
    }

    h2 {
        margin-top: 2em;
    }

    .link-list {
        margin-top: 1em;
        h3, p {
            margin: 0;
        }  
     
        .links {
            display: flex;
            justify-content: flex-start;
            gap: 1em;

            i {
                margin-right: 0.5em;
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
                <a id="email-link" href="mailto:kmorhun@mit.edu" target="_blank" on:click={() => umami.track('email-link')}>kmorhun[at]mit[dot]edu</a>
            </span>
            <span class="profile-link">
                <i class="fa-brands fa-linkedin"></i>
                <a id="linkedin-link" href="https://www.linkedin.com/in/morhunkateryna/" target="_blank" on:click={() => umami.track('linkedin-link')}>LinkedIn</a>
            </span>
            <span class="profile-link">
                <i class="fa-brands fa-github"></i>
                <a id="github-link" href="https://github.com/kmorhun" target="_blank" on:click={() => umami.track('github-link')}>Github</a>
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
    <Projects list={projects.slice(0, 3)}/>

    <h2>Spot me in the wild</h2>
    <div class="link-list">
        <h3>News Article: Thinking on Your Feet - <span class="date">February 2025</span></h3>
       
        <p>
            A news article from MIT News about the class I participated in during Fall 2024 called
            Thinking on Your Feet: Dance as a Learning Science, taught by Jennifer Light. The class explores how dance and movement
            can be used as a pedagogical tool to teach other subjects, ranging from cultural history to 
            pipelined processors, in an embodied way.
        </p>
        <div class="links">
            <a id="thinking-on-your-feet-article" href="https://news.mit.edu/2025/body-of-knowledge-0214" target="_blank" on:click={() => umami.track('thinking-on-your-feet-article')}>
                <i class="fa-solid fa-globe"></i>Read</a>
        </div>
    </div>
    <div class="link-list">
        <h3>JSALT final presentations - <span class="date">August 2024</span></h3>
       
        <p>
            Day two of the Frederick Jelinek Memorial Summer Workshop on Speech and Language Technology (JSALT) 
            final presentations, where my team and I showcased our work on Stacky! To watch the full Stacky team's presentation, watch from 4:38:00 onward. 
            To watch my presentation, specifically, watch 6:18:00-6:30:00 and 6:45:00-6:49:00
        </p>
        <div class="links">
            <a id="jsalt-vid" href="https://www.youtube.com/watch?v=65L7tklQbyc" target="_blank" on:click={() => umami.track('jsalt-vid')}>
                <i class="fa-solid fa-video"></i>Watch</a>
        </div>
    </div>
    <div class="link-list">
        <h3>Ukraine Exhibition: Roots of Resilience - <span class="date">July 2024</span></h3>
        <p>
            In Spring 2024, I took a course at MIT called 
            Circular Recovery Strategies of Wartime Ukraine: History and Urban Planning for a Ukrainian City,
            taught by Elizabeth Wood and Kateryna Lopatiuk. In this course, we collaborated with the local leadership and 
            NGOs in the newly liberated Eastern Ukrainian city of Sviatohirsk to help them develop a plan for recovery and community-building. 
            This video showcases the final exhibition of our work.
        </p>
        <div class="links">
            <a id="ukrexhib-vid" href="https://www.youtube.com/watch?v=qKzzjjaNmAo" target="_blank" on:click={() => umami.track('ukrexhib-vid')}>
                <i class="fa-solid fa-video"></i>Watch</a>
        </div>
    </div>
    <div class="link-list">
        <h3>Blog Post: Social Impact Internships - <span class="date">September 2022</span></h3>
        <p>
            A blog post I wrote reflecting on my experiences during my internship at FindOurView and how they intersect 
            with my career aspirations, as well as my competitive ballroom dancing. 
        </p>
        <div class="links">
            <a id="pkg-blog" href="https://pkgcenter.mit.edu/2022/09/14/social-impact-internships-kateryna-morhun-25/" target="_blank" on:click={() => umami.track('pkg-blog')}>
                <i class="fa-solid fa-globe"></i>Read</a>
        </div>
    </div>

    <h2>What I'm reading</h2>
    <div class="link-list">
        <h3>Is My Toddler a Stochastic Parrot? - by Angie Wang</h3>
        <p>
            A Gorgeously drawn New Yorker Comic created by a new mother musing on the similarities - 
            and differences - between her toddler and ChatGPT
        </p>
        <div class="links">
            <a id="stochasticparrot-article" href="https://www.newyorker.com/humor/sketchbook/is-my-toddler-a-stochastic-parrot" target="_blank" on:click={() => umami.track('stochasticparrot-article')}>
                <i class="fa-solid fa-globe"></i>Read</a>
        </div>
    </div>
    <div class="link-list">
        <h3>A Man Said to the Universe - by Stephen Crane</h3>
        <p>
            "Sir, I Exist!"
        </p>
        <div class="links">
            <a id="sir-i-exist-poem" href="https://www.poetryfoundation.org/poems/44049/a-man-said-to-the-universe" target="_blank" on:click={() => umami.track('sir-i-exist-poem')}>
                <i class="fa-solid fa-globe"></i>Read</a>
        </div>
    </div>
    <div class="link-list">
        <h3>Do Not Go Gentle into That Good Night - by Dylan Thomas</h3>
        <p>
            Old age should burn and rave at close of day;
        </p>
        <div class="links">
            <a id="do-not-go-gentle-poem" href="https://www.poetryfoundation.org/poems/46569/do-not-go-gentle-into-that-good-night" target="_blank" on:click={() => umami.track('do-not-go-gentle-poem')}>
                <i class="fa-solid fa-globe"></i>Read</a>
        </div>
    </div>

</article>
