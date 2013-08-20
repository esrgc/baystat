
var js_dependencies = [
  'js/lib/jquery.min.js',
  'js/lib/underscore-min.js',
  'js/lib/backbone-min.js',
  'js/lib/bootstrap.min.js',
  'js/lib/d3.v3.min.js',
  'js/lib/GeoDash.min.js',
  'js/lib/handlebars.min.js',
  'js/lib/leaflet.js',
  'templates/templates.js',
  'js/*.js'
];

var css_dependencies = [
  'css/bootstrap.min.css',
  'css/GeoDash.min.css',
  'css/style.css'
];

module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    handlebars: {
      compile: {
        options: {
          namespace: "BayStat.templates"
        },
        files: {
          "templates/templates.js": "templates/*.handlebars"
        }
      }
    },
    uglify: {
      build: {
        options: {
          banner: '/*! \n' +
          '<%= pkg.name %> v<%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %> \n' +
          'Author: @frnkrw \n' +
          '*/\n',
          mangle: false,
          beautify: true,
          wrap: true
        },
        files: {
          'js/<%= pkg.name %>.<%= pkg.version %>.min.js': ['templates/templates.js', 'js/*.js']
        }
      }
    },
    concat: {
      js: {
        src: js_dependencies,
        dest: 'js/min/<%= pkg.name %>.<%= pkg.version %>.min.js',
      },
      css: {
        src: css_dependencies,
        dest: 'css/min/<%= pkg.name %>.<%= pkg.version %>.min.css',
      }
    },
    assemble: {
      deploy: {
        options: {
          deploy: true,
          version: '<%= pkg.version %>'
        },
        files: {
          'solutions.html': ['html/solutions.handlebars'],
          'causes.html': ['html/causes.handlebars']
        }
      },
      dev: {
        options: {
          deploy: false,
          version: '<%= pkg.version %>'
        },
        files: {
          'solutions.html': ['html/solutions.handlebars'],
          'causes.html': ['html/causes.handlebars']
        }
      }
    },
    lineremover: {
      removeBlankLines: {
        files: {
          'solutions.html': 'solutions.html',
          'causes.html': 'causes.html'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-handlebars');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('assemble');
  grunt.loadNpmTasks('grunt-line-remover');

  grunt.registerTask('dev', ['handlebars', 'concat', 'assemble:dev']);
  grunt.registerTask('deploy', ['handlebars', 'concat', 'assemble:deploy', 'lineremover']);

};