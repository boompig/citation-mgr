/* env browser */
/* global Vue, window, getJSON */

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
        }
    }
});
