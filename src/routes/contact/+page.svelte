<svelte:head>
	<title>Contact me!</title>
</svelte:head>

<script>
    import { onMount } from 'svelte';

    // Umami is not available during server-side rendering, only on the client
    let umamiAvailable = false;

    onMount(() => {
        // This svelte lifecycle function only runs once the component is first rendered in the client
        // So this keeps umami unavailable until server-side rendering is complete
        umamiAvailable = typeof umami !== 'undefined';
    });

    function submitEmail() {
        if (umamiAvailable && umami?.track) {
            umami.track('submit-email');
        }
    }
</script>

<style>
    #contact-title {
        text-align: center;
    }

    form {
        margin: auto;
        max-width: 50ch;
        display: grid;
        gap: 1em;
        /* grid-template-columns: auto 1fr; */
        grid-template-columns: subgrid;
        
        label {
            display: grid;
            grid-template-columns: .2fr 1fr;
        }

        button {
            grid-column: 1 / -1;
        }
    }

    input, textarea, button, select {
        font: inherit;
    }
</style>

<article class="content">
    <h1 id="contact-title">Get in touch!</h1>
    <form action="mailto:kat.morhun@gmail.com">
        <label>Subject:
            <input type="text" id="subject" name="subject" required>
        </label>
        <label>Body:
            <textarea id="body" name="body" required></textarea>
        </label>
        <button id="submit-email" on:click={submitEmail}>Submit!</button>
    </form>
</article>