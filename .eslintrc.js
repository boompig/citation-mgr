module.exports = {
    "env": {
        "es6": true,
        "node": true
	},
	"parserOptions": {
		"ecmaVersion": 2017
	},
	"plugins": ["jest"],
    "extends": ["eslint:recommended", "plugin:jest/recommended"],
    "rules": {
        "indent": [
            "error",
            4
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "double"
        ],
        "semi": [
            "error",
            "always"
        ],
		"no-console": "off",
		"prefer-const": ["error"],
		"no-var": ["error"]
    }
};
