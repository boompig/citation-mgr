/* env browser */
/* global Vue, window, getJSON, deleteJSON */

/**
 * Support for both creating new and editing existing publications
 */
new Vue({
    el: "#publications-app",
    data: {
        publications: [],

        isLoaded: false,

        errorMsg: null,
    },
    mounted: function() {
        this.getPublications();
    },
    methods: {
        getPublications: async function() {
            const res = await getJSON("/api/publications");
            if(res.ok) {
                this.publications = await res.json();
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
        getEditUrl: function(pub) {
            return `/publications/${pub.id}`;
        },
        onDeleteClick: function(pub) {
            if(window.confirm(`Delete publication with name ${pub.name}?`)) {
                this.deletePublication(pub);
            }
        },
        deletePublication: async function(pub) {
            const res = await deleteJSON(`/api/publications/${pub.id}`);
            if(res.ok) {
                window.location.reload();
                // this.publications.remove(pub);
            } else {
                console.error(res);
            }
        },
    }
});
