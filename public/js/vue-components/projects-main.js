/* env browser */
/* global Vue, window, getJSON */

new Vue({
    el: "#projects-main-app",
    data: {
        isQuotesLoaded: false,
        isProjectsLoaded: false,
        // array of projects
        projects: [],
        // map from int to quote arrays
        quotes: {},
        // project
        activeProject: null,
        // profile object
        profile: null
    },
    mounted: function() {
        this.getProjects().then(() => {
            this.getAllQuotes();
        });
    },
    methods: {
        // using function keyword intentionally here
        getProjects: async function() {
            const res = await getJSON("/api/projects");
            if(res.ok) {
                this.projects = await res.json();
                this.isProjectsLoaded = true;
                if(this.projects.length > 0) {
                    this.activeProject = this.projects[0];
                }
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
        getAllQuotes: async function() {
            const res = await getJSON("/api/quotes");
            if(res.ok) {
                const quotes = await res.json();

                // create the quote map
                this.quotes = {};
                for(const quote of quotes) {
                    if(!this.quotes.hasOwnProperty(quote.project)) {
                        this.quotes[quote.project] = [];
                    }
                    this.quotes[quote.project].push(quote);
                }
                this.isQuotesLoaded = true;
            } else {
                console.error(res);
                const t = await res.text();
                console.error(t);
            }
        },
        getQuotesForProject: async function() {
            const res = await getJSON("/api/quotes", {project: this.projects[this.activeProject]});
            if(res.ok) {
                this.quotes[this.activeProject] = await res.json();
            } else {
                console.error(res);
                const t = await res.text();
                console.error(t);
            }
        },
        editProject: function(project) {
            window.location.href = `/projects/${project.id}`;
        },
        editQuote: function(quote) {
            window.location.href= `/quotes/${quote.id}`;
        },
        setActiveProject: function(project) {
            this.activeProject = project;
        },
        getAddQuotesUrl: function() {
            if(this.activeProject) {
                return `/quotes/new?project=${this.activeProject.id}`;
            } else {
                return "/quotes/new";
            }
        },
        getEditProjectUrl: function(project) {
            return `/projects/${project.id}`;
        },
        getQuoteText: function(quote) {
            const maxCharacters = 36;

            if(quote.link.length >= maxCharacters - 3) {
                return quote.link.substr(0, maxCharacters - 3) + "...";
            } else {
                return quote.link;
            }
        },
    },
});