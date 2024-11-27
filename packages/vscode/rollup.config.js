import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import image from '@rollup/plugin-image';

// vscode插件开发专用配置
export default {
    plugins: [
        //
        nodeResolve({
            preferBuiltins: true
        }),
        commonjs({}),
        json({}),
        image({})
    ],
    input: 'src/extension.js',
    output: {
        file: 'dist/extension.cjs',
        format: 'cjs',
        strict: true,
        generatedCode: {
            constBindings: true
        }
    },
    treeshake: {
        moduleSideEffects: false
    },
    external: ['vscode'],
    onwarn(warning, warn) {
        if (warning.code === 'CIRCULAR_DEPENDENCY') {
            return;
        }
        warn(warning);
    }
};
