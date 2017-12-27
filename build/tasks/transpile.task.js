const clean = require('gulp-clean')
const ts = require('gulp-typescript')
const sourcemaps = require('gulp-sourcemaps')
const path = require('path')

const nodeModulesPath = path.resolve('./node_modules')

module.exports = function configureGulp(gulp) {  
  gulp.task('clean', function () {
    return gulp.src(['./bin', './dist'])
      .pipe(clean());
  });

  gulp.task('transpile', ['clean'], function () {
    let tsProject = ts.createProject('./tsconfig.json')
    let errors = []
    return tsProject.src()
      .pipe(sourcemaps.init({ loadMaps: true }))
      .pipe(tsProject())
      .on('error', error => {
        if (error.fullFilename && !path.resolve(error.fullFilename).indexOf(nodeModulesPath) == 0) {
          errors.push(error)
        }
      })
      .on("finish", () => {
        if (errors.length) {
          throw errors.join('\n')
        }
      })
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./bin'))
  })
}