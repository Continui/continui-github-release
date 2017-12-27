const rollup = require('rollup'),
      rollupTypescript = require('rollup-plugin-typescript2'),
      os = require('os')

const rollupTypescriptOptions = {
    cacheRoot: os.tmpdir(),
    useTsconfigDeclarationDir: true,
    tsconfigOverride: {
        compilerOptions: {
            declaration: true,
            declarationDir: './dist/definitions'
        },
        include: ['./src/**/*.ts']
    }
}

const rollupOptions = {
    input: './src/index.ts',
    plugins: [
        rollupTypescript(rollupTypescriptOptions)
    ],
    external: [
        'fs',
        'path',
        'axios'
    ]
}

module.exports = function configureGulp(gulp) {

    gulp.task('distribute', getDistributePipe);
    gulp.task('distribute-cd', ['integrate'], getDistributePipe);

    function getDistributePipe() {
        return rollup.rollup(rollupOptions)
        .then(bundle => {
           return bundle.write({
               file: './dist/continui-githubre.js',
               format: 'cjs'
           })
        })
    }
}