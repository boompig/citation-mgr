/* env browser */
/* global Vue, window, document, getJSON, postJSON */
/* exported app */

/**
 * Support for both creating new and editing existing projects
 */
const app = new Vue({
    el: "#edit-project-app",
    data: {
        project: {
            name: ""
        },
        // set both page title and document title
        // dynamically read view URL
        title: "Edit Project",

        // whether this is an edit or submitting a new project
        // dynamically read via URL
        isNew: true,

        projectID: null,
    },
    mounted: function() {
        if(window.location.pathname === "/projects/new") {
            this.title = "New Project";
            this.isNew = true;
        } else {
            this.title = "Edit Project";
            this.isNew = false;
            this.projectID = this.readProjectIdFromUrl();
            this.getProject();
        }
        document.title = this.title;
    },
    methods: {
        readProjectIdFromUrl: function() {
            const parts = window.location.pathname.split(/\//g);
            return Number.parseInt(parts[parts.length - 1]);
        },
        submitProject: async function() {
            if(this.isNew) {
                this.createProject();
            } else {
                this.editProject();
            }
        },
        createProject: async function() {
            console.log("submitting new project:");
            console.log(this.project);
            const res = await postJSON("/api/projects", this.project);
            if(res.ok) {
                window.alert("project has been saved");
                window.location.href = "/";
            } else {
                if(res.status === 401) {
                    window.alert("you have been logged out");
                    window.location.href = "/login";
                } else {
                    console.error(res);
                    const t = await res.text();
                    console.error(t);
                }
            }
        },
        getProject: async function() {
            const res = await getJSON(`/api/projects/${this.projectID}`);
            if(res.ok) {
                this.project = await res.json();
                console.log("project:");
                console.log(this.project);
            } else {
                if(res.status === 401) {
                    window.alert("you have been logged out");
                    window.location.href = "/login";
                } else {
                    console.error(res);
                    const t = await res.text();
                    console.error(t);
                }
            }
        },
        editProject: async function() {
            const res = await postJSON(`/api/projects/${this.projectID}`, this.project);
            if(res.ok) {
                // const response = await res.json();
                // console.log(response);
                // successfully updated
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
    }
});
