/* env browser */
/* global Vue, window, getJSON, postJSON */
/* exported app */

const app = new Vue({
    el: "#projects-main-app",
    data: {
        projects: [],
        quotes: {},
        activeProject: null,
        profile: null
    },
    mounted: function() {
        this.getProjects();
    },
    methods: {
        // using function keyword intentionally here
        getProjects: async function() {
            const res = await getJSON("/projects");
            if(res.ok) {
                this.projects = await res.json();
                console.log("projects:");
                console.log(this.projects);
            } else {
                if(res.status === 401) {
                    window.location.href = "/login";
                } else {
                    console.error(res);
                    const t = await res.text();
                    console.error(t);
                }
            }
        }
    },
});