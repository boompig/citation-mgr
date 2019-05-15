/* env browser */
/* global Vue, window */
/* exported app */

const app = new Vue({
    el: "#login-app",
    data: {
        activeForm: "login",
        loginErrorMsg: null,
        registerErrorMsg: null,
        loginData: {
            email: "",
            password: ""
        },
        registerData: {
            email: "",
            password: "",
            name: ""
        }
    },
    methods: {
        // NOTE: using function keyword here for obvious reason:
        // this has to point to view instance

        setActiveForm: function(formName) {
            this.activeForm = formName;
        },
        isActiveForm: function(formName) {
            return this.activeForm === formName;
        },
        postJSON: async function(url, data) {
            return window.fetch(url, {
                method: "POST",
                body: JSON.stringify(data),
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                }
            });
        },
        submitLogin: async function() {
            console.log("Submitting login data...");
            console.log(this.loginData);
            const response = await this.postJSON("/auth/login", this.loginData);
            if(response.ok) {
                // we don't really care what the result is tbh
                const contents = await response.json();
                console.log(contents);
                // just continue to the main site
                window.location.href = "/";
            } else {
                console.error(response);
                try {
                    const contents = await response.json();
                    this.loginErrorMsg = contents.msg;
                } catch (e) {
                    // no method JSON - something went really wrong
                    this.loginErrorMsg = await response.text();
                }
            }
        },
        submitRegister: async function() {
            console.log("Submitting registration data...");
            console.log(this.registerData);
            const response = await this.postJSON("/auth/register", this.registerData);
            if(response.ok) {
                // we don't really care what the result is tbh
                const contents = await response.json();
                console.log(contents);
                // just continue to the main site
                window.location.href = "/";
            } else {
                console.error(response);
                try {
                    const contents = await response.json();
                    this.loginErrorMsg = contents.msg;
                } catch (e) {
                    // no method JSON - something went really wrong
                    this.loginErrorMsg = await response.text();
                }
            }
        }
    }
});