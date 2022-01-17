import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";
import resolve from "@rollup/plugin-node-resolve";
import {
    terser
} from "rollup-plugin-terser";

const packageJson = require('./package.json');

export default [{
        input: "src/index.ts",
        output: [{
                file: packageJson.main,
                format: "cjs",
                sourcemap: true
            },
            {
                file: packageJson.module,
                format: "esm",
                sourcemap: true
            }
        ],
        plugins: [
            resolve(),
            commonjs(),
            typescript({
                tsconfig: "./tsconfig.json"
            })
        ]
    },
    {
        /* Making one file with types */
        input: "dist/esm/types/index.d.ts",
        output: [{
            file: "dist/types.d.ts",
            format: "esm"
        }],
        plugins: [dts()]
    },
    {
        input: "src/tformat.ts",
        output: [{
            file: "tformat.js",
            format: "cjs",
        }],
        plugins: [typescript()]
    },
    {
        input: "tformat.js",
        output: [{
            file: "tformat.min.js",
            format: "cjs",
            plugins: [terser({
                keep_classnames: true,
                compress: {
                    unused: false
                }
            })]
        }]
    }
];