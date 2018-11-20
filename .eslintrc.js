module.exports = {
    "globals" : {
        "g": false,
    },
    "env": {
        "browser": true,
        "node": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "ecmaVersion": 5
    },
    "rules": {
        "indent": [
            "error",
            "tab"
        ],
        "linebreak-style": [
            "error",
            "windows"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "always"
        ],
        "no-unused-vars": [
            "error", {
                "vars": "all",
                "args": "after-used",
                "ignoreRestSiblings": false
        }],
        "no-undef-init": 1,
        "no-useless-return": 1,
        "eol-last": [
            "error",
            "always"
        ],
    }
};
