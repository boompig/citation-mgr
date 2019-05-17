/* env browser */
/* global Vue, getJSON, postJSON */

new Vue({
    el: "#profile-app",
    data: {
        profile: {
            name: "",
            email: "",
            password: ""
        },
        isProfileLoaded: false,
        errorMsg: null,
        successMsg: null
    },
    mounted: function() {
        this.getProfile();
    },
    methods: {
        getProfile: async function() {
            const res = await getJSON("/api/profile");
            this.profile = await res.json();
            this.isProfileLoaded = true;
        },
        setErrorMsg: function(msg) {
            this.errorMsg = msg;
            this.successMsg = null;
        },
        setSuccessMsg: function(msg) {
            this.successMsg = msg;
            this.errorMsg = null;
        },
        submitForm: async function() {
            const res = await postJSON("/api/profile", this.profile);
            if(res.ok) {
                this.setSuccessMsg("saved");
                // window.location.reload();
                // window.location.href = "/";
            } else {
                // note that 401 does not necessarily mean NOT AUTHENTICATED
                // it may also mean password is wrong
                if(res.headers.get("content-type").toLowerCase().indexOf("application/json") >= 0) {
                    const j = await res.json();
                    this.setErrorMsg(j.msg);
                } else {
                    console.error(res);
                    console.log(res.headers.get("content-type"));
                    const t = await res.text();
                    this.setErrorMsg(t);
                }
            }
        },
    }
});
