<svelte:head>
	<title>CV</title>
</svelte:head>

<style>
    #resume {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        margin: 5%;
    }

    #resume h3 {
        margin: 5px;
    }

    #resume-header {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    #resume-header h2 {
        margin: 5px;
    }

    #resume-head a {
        margin: 5px;
    }

    .resume-entry-header {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
    }

    .resume-entry-header h4 {
        margin: 5px;
    }

    .resume-entry-header p {
        margin: 5px;
    }

    .resume-entry-header-right {
        text-align: right;
    }

    #resume-skills-body p{
        margin: 5px;
    }
</style>
<!-- 
    <article class="resume-entry">
        <div class="resume-entry-header">
            <div class="resume-entry-header-left">
                <h4>Employer</h4>
                <p><em>JobTitle</em></p>
            </div>
            <div class="resume-entry-header-right">
                <h4>Dates</h4>
                <p>Location</p>
            </div>
        </div>
        <div class="resume-entry-main">
            <ul>
                <li>Task</li>
                <li>Task</li>
                <li>Task</li>
            </ul>
        </div>
    </article> 
-->
<article class="content">
    <iframe id="pdf-js-viewer" src="/pdfjs/web/viewer.html?file=/assets/pdf/summer2024_cv.pdf" title="webviewer" frameborder="0" width="100%" height="600"></iframe>    
</article>