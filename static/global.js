console.log("IT’S ALIVE!");

function $$ (selector, context = document) {
	return Array.from(context.querySelectorAll(selector));
}

// intercept the contact form
let contact_form = document.querySelector("form");
contact_form?.addEventListener("submit", function (event) {
    // prevent the default submission
    event.preventDefault();
    let data = new FormData(contact_form);
    let url = contact_form.action + "?"
    for (let [name, value] of data) {
        url += `${name}=${encodeURIComponent(value)}&`;
        // console.log(name, encodeURIComponent(value));
    }
    location.href = url;
});