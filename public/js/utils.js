/* env browser */
/* global window */
/* exported getJSON, postJSON */

const BASE_URL = `${window.location.protocol}//${window.location.host}`;

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