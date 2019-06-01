/* env browser */
/* global window */
/* exported getJSON, postJSON, parseSearchString, deleteJSON */

const BASE_URL = `${window.location.protocol}//${window.location.host}`;

/**
 * I recreate this function so much that surprised it's not part of the JS standard library
 */
const parseSearchString = () => {
    const parts = window.location.search.substr(1).split("&");
    const d = {};
    for(const pair of parts) {
        const [key, val] = pair.split("=");
        d[key] = val;
    }
    return d;
};

/**
 * wrapper around window.fetch
 * returns a promise
 * @param {string} path
 * @param {object} params
 */
const getJSON = async (path, params) => {
    params = params || {};
    const url = new URL(path, BASE_URL);
    Object.keys(params).forEach((key) => {
        url.searchParams.append(key, params[key]);
    });
    return window.fetch(url, {
        method: "GET",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        }
    });
};

/**
 * wrapper around window.fetch
 * returns a promise
 * @param {string} url
 * @param {object} data
 */
const postJSON = async (url, data) => {
    return window.fetch(url, {
        method: "POST",
        body: JSON.stringify(data),
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        }
    });
};

/**
 * wrapper around window.fetch
 * returns a promise
 * @param {string} url
 * @param {object} data
 */
const deleteJSON = async (path, params) => {
    params = params || {};
    const url = new URL(path, BASE_URL);
    Object.keys(params).forEach((key) => {
        url.searchParams.append(key, params[key]);
    });
    return window.fetch(url, {
        method: "DELETE",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        }
    });
};