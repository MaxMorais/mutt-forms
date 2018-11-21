import resolve from "rollup-plugin-node-resolve";
import babel from "rollup-plugin-babel";
import uglify from "rollup-plugin-uglify";

export default {
    input: "src/index.js",
    output: [
        {
            file: "dist/mutt-forms.es.js",
            format: "es"
        },
        {
            file: "dist/mutt-forms.min.js",
            format: "iife",
            exports: "default",
            name: "Mutt"
        }
    ],
    plugins: [
        resolve(),
        babel(),
        uglify({
            mangle: false,
            keep_classnames: true,
            keep_fnames: true,
            safari10: true
        })
    ]
};
