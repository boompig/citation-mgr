/* env browser */
/* global Vue, window, document, getJSON, postJSON, parseSearchString */

/**
 * Support for both creating new and editing existing projects
 */
new Vue({
    el: "#edit-quote-app",
    data: {
        quote: {
            quote: "",
            project: -1,
            publication: -1,
        },
        // set both page title and document title
        // dynamically read view URL
        title: "Edit Quote",

        // whether this is an edit or submitting a new quote
        // dynamically read via URL
        isNew: true,

        quoteID: null,

        projects: [],

        isProjectsLoaded: false,

        publications: [],

        isPublicationsLoaded: false,

        errorMsg: null,
    },
    mounted: function() {
        if(window.location.pathname === "/quotes/new") {
            this.title = "New Quote";
            this.isNew = true;
        } else {
            this.title = "Edit Quote";
            this.isNew = false;
            this.quoteID = this.readQuoteIdFromUrl();
            this.getExisting();
        }

        document.title = this.title;

        this.getAllProjects().then(() => {
            const params = parseSearchString();
            if(params.hasOwnProperty("project")) {
                this.quote.project = Number.parseInt(params.project);
            }
        });

        this.getAllPublications().then(() => {
            const params = parseSearchString();
            if(params.hasOwnProperty("publication")) {
                this.quote.publication = Number(parseInt(params.publication));
            }
        });
    },
    methods: {
        readQuoteIdFromUrl: function() {
            const parts = window.location.pathname.split(/\//g);
            return Number.parseInt(parts[parts.length - 1]);
        },
        submitForm: async function() {
            if(this.isNew) {
                this.createNew();
            } else {
                this.editExisting();
            }
        },
        getAllProjects: async function() {
            const res = await getJSON("/api/projects");
            if(res.ok) {
                this.projects = await res.json();
                this.isProjectsLoaded = true;
            } else {
                if(res.status === 401) {
                    window.location.href = "/login";
                } else {
                    console.error(res);
                    const t = await res.text();
                    console.error(t);
                }
            }
        },
        getAllPublications: async function() {
            const res = await getJSON("/api/publications");
            if(res.ok) {
                this.publications = await res.json();
                this.isPublicationsLoaded = true;
            } else {
                if(res.status === 401) {
                    window.location.href = "/login";
                } else {
                    console.error(res);
                    const t = await res.text();
                    console.error(t);
                }
            }
        },
        createNew: async function() {
            console.log("submitting new data:");
            console.log(this.quote);
            const res = await postJSON("/api/quotes", this.quote);
            if(res.ok) {
                // window.alert("data has been saved");
                window.location.href = "/";
            } else {
                if(res.status === 401) {
                    // window.alert("you have been logged out");
                    window.location.href = "/login";
                } else {
                    console.error(res);
                    const t = await res.text();
                    console.error(t);
                }
            }
        },
        getExisting: async function() {
            const res = await getJSON(`/api/quotes/${this.quoteID}`);
            if(res.ok) {
                this.quote = await res.json();
                console.log("quote:");
                console.log(this.quote);
            } else {
                if(res.status === 401) {
                    // window.alert("you have been logged out");
                    window.location.href = "/login";
                } else {
                    console.error(res);
                    const t = await res.text();
                    console.error(t);
                }
            }
        },
        editExisting: async function() {
            const res = await postJSON(`/api/quotes/${this.quoteID}`, this.quote);
            if(res.ok) {
                // const response = await res.json();
                // console.log(response);
                // successfully updated
                window.location.href = "/";
            } else if(res.status === 401) {
                window.location.href = "/login";
            } else {
                console.error(res);
                const t = await res.text();
                console.error(t);
                this.errorMsg = t;
            }
        },
    }
});
