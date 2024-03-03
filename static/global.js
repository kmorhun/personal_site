console.log("IT’S ALIVE!");

function $$ (selector, context = document) {
	return Array.from(context.querySelectorAll(selector));
}
// add the light/dark mode toggle
document.body.insertAdjacentHTML("afterbegin", 
    `
    <label class="switch">
        Theme:
        <select>
            <option value="light dark">Automatic</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
        </select>
    </label>
    `
);

// set the color scheme to the user's preference
if (localStorage.colorScheme) {
    document.documentElement.style.setProperty("color-scheme", localStorage.colorScheme);
    document.querySelector("select").value = localStorage.colorScheme;
}

let select = document.querySelector("select");
select.addEventListener("input", function (event) {
    // console.log("color scheme changed to", event.target.value);
    document.documentElement.style.setProperty("color-scheme", event.target.value);
    localStorage.colorScheme = event.target.value;
});

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