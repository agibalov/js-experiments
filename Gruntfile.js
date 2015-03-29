module.exports = function(grunt) {
  grunt.initConfig({

    // Backend tests
    beTestSrcDir: 'be-test',
    mochaTest: {
      all: {
        src: ['<%= beTestSrcDir %>/**/*.spec.js']
      }
    },

    // Frontend build
    feSrcDir: 'fe-src',
    feTmpBuildDir: 'fe-tmp',
    feTemplatesJsFile: '<%= feTmpBuildDir %>/templates.js',
    ngtemplates: {
      all: {
        src: ['<%= feSrcDir %>/**/*.html', '!**/index.html'],
        dest: '<%= feTemplatesJsFile %>',
        options: {
          url: function(url) {
            // TODO: can I access feTemplatesSrcDir here?
            return url.replace('fe-src/', '');
          }
        }
      }
    },
    feAmalgamatedJsFile: '<%= feTmpBuildDir %>/amalgamated.js',
    feBowerComponentsDir: 'bower_components',
    uglify: {
      all: {
        src: ['<%= feSrcDir %>/**/*.js', '<%= feTemplatesJsFile %>'],
        dest: '<%= feAmalgamatedJsFile %>'
      }
    },
    feBuildDir: 'fe-build',
    feAmalgamatedJsFileWithDependencies: '<%= feBuildDir %>/teambuildr.js',
    feAmalgamatedCssFile: '<%= feBuildDir %>/teambuildr.css',
    concat: {
      allJs: {
        src: [
          '<%= feBowerComponentsDir %>/uri.js/src/URI.min.js',
          '<%= feBowerComponentsDir %>/uri.js/src/URITemplate.js',
          '<%= feBowerComponentsDir %>/angular/angular.min.js',
          '<%= feBowerComponentsDir %>/angular-route/angular-route.min.js',
          '<%= feAmalgamatedJsFile %>'
        ],
        dest: '<%= feAmalgamatedJsFileWithDependencies %>'
      },
      allCss: {
        src: ['<%= feBowerComponentsDir %>/bootstrap/dist/css/bootstrap.min.css'],
        dest: '<%= feAmalgamatedCssFile %>'
      }
    },
    feIndexHtmlFile: '<%= feSrcDir %>/index.html',
    copy: {
      indexHtml: {
        expand: true,
        flatten: true,
        src: ['<%= feIndexHtmlFile %>'],
        dest: '<%= feBuildDir %>'
      }
    },
    clean: {
      feBuild: ['<%= feBuildDir %>'],
      feTmpBuildDir: ['<%= feTmpBuildDir %>']
    }
  });

  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-angular-templates');

  grunt.registerTask('be-test', 'Run backend tests', ['mochaTest']);
  grunt.registerTask('test', 'Run all tests', ['be-test']);

  grunt.registerTask('fe-build', 'Build frontend',
    ['clean', 'ngtemplates', 'uglify', 'copy', 'concat', 'clean:feTmpBuildDir']);
};
