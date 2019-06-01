/* env browser */
/* global Vue, window, document, getJSON, postJSON */

/**
 * Support for both creating new and editing existing publications
 */
new Vue({
    el: "#edit-pub-app",
    data: {
        pub: {
            name: ""
        },

        isLoaded: false,

        // set both page title and document title
        // dynamically read view URL
        title: "Edit Publication",

        // whether this is an edit or submitting a new publication
        // dynamically read via URL
        isNew: true,

        pubID: null,

        errorMsg: null,
    },
    mounted: function() {
        if(window.location.pathname === "/publications/new") {
            this.title = "New Publication";
            this.isNew = true;
        } else {
            this.title = "Edit Publication";
            this.isNew = false;
            this.pubID = this.readIdFromUrl();
            this.getPublication();
        }
        document.title = this.title;
    },
    methods: {
        readIdFromUrl: function() {
            const parts = window.location.pathname.split(/\//g);
            return Number.parseInt(parts[parts.length - 1]);
        },
        submitPub: async function() {
            if(this.isNew) {
                this.createPublication();
            } else {
                this.editPublication();
            }
        },
        createPublication: async function() {
            const res = await postJSON("/api/publications", this.pub);
            if(res.ok) {
                window.location.href = "/";
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
        getPublication: async function() {
            const res = await getJSON(`/api/publications/${this.pubID}`);
            if(res.ok) {
                this.pub = await res.json();
                this.isLoaded = true;
            } else if(res.status === 401) {
                window.location.href = "/login";
            } else if(res.headers.get("content-type").toLowerCase().indexOf("application/json") >= 0) {
                const j = await res.json();
                console.error(j);
                this.errorMsg = j.msg;
            } else {
                console.error(res);
                const t = await res.text();
                console.error(t);
                this.errorMsg = t;
            }
        },
        editPublication: async function() {
            const res = await postJSON(`/api/publications/${this.pubID}`, this.pub);
            if(res.ok) {
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
