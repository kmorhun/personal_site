<svelte:head>
	<title>Contact me!</title>
</svelte:head>

<article class="content">
    <h1 id="contact-title">Get in touch!</h1>
    <form action="mailto:kat.morhun@gmail.com">
        <label>Subject:
            <input type="text" id="subject" name="subject" required>
        </label>
        <label>Body:
            <textarea id="body" name="body" required></textarea>
        </label>
        <button>Submit!</button>
    </form>
</article>