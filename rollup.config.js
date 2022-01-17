import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";

import {
    terser
} from "rollup-plugin-terser";

export default [{
        input: "src/tformat.js",
        output: [
            {
                file: "tformat.min.js",
                plugins: [commonjs(), terser()]
            },
            // {
            //     file: "dist/types/tformat.d.ts",
            //     sourcemap: true,
            //     plugins: [commonjs(), typescript({
            //         tsconfig: "./tsconfig.json"
            //     })]
            // },
            {
                file: "tformat.js",
                plugins: [commonjs()]
            },
        ]
    },
    {
        input: "src/react/TFinput.tsx",
        output: [{
            file: "dist/react/index.js",
            format: "cjs",
            sourcemap: true,

        }],
        plugins: [
            commonjs(),
            typescript()
        ]
    },
];