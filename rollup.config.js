const globals = {
    '@angular/core': 'ng.core',
    '@angular/common': 'ng.common'
};

export default {
    input: 'dist/index.js',
    output: {
        file: 'dist/bundles/ng-event-options.umd.js',
        format: 'umd'
    },
    sourceMap: false,
    name: 'ng.eventOptions',
    exports: 'named',
    globals: globals,
    external: Object.keys(globals)
}
