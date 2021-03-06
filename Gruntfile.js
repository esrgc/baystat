//BayStat dashboards build script

var js_dependencies = [
  'js/lib/jquery.min.js',
  'js/lib/underscore-min.js',
  'js/lib/backbone-min.js',
  'js/lib/bootstrap.min.js',
  'js/lib/handlebars.min.js',
  'js/lib/leaflet-0.7.2/leaflet.js',
  'templates/templates.js',
  'js/src/Map.js',
  'js/src/Causes.js',
  'js/src/Solutions.js'
];

var css_dependencies = [
  'css/bootstrap.min.css',
  'js/lib/geodash/geodash.min.css',
  'css/style.css'
];

module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    bump: {
      options: {
        files: ['package.json'],
        updateConfigs: ['pkg'],
        commit: false,
        createTag: false,
        push: false
      }
    },
    //Compile handlebars templates
    handlebars: {
      compile: {
        options: {
          namespace: 'BayStat.templates'
        },
        files: {
          'templates/templates.js': ['templates/*.handlebars', '!causes.handlebars', '!solutions.handlebars']
        }
      }
    },
    //Compile javascript source to js/min/baystat.js
    uglify: {
      build: {
        options: {
          banner: '/*! \n' +
          '<%= pkg.name %> v<%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %> \n' +
          'Author: @fsrowe, ESRGC, 2014 \n' +
          '*/\n',
          mangle: false,
          beautify: true,
          wrap: false,
          compress: false
        },
        files: {
          'js/min/baystat.js': ['js/src/*.js']
        }
      }
    },
    //Concat javascript source, templates and libraries
    //Concat css source ands css libraries
    concat: {
      js: {
        src: js_dependencies,
        dest: 'js/min/<%= pkg.name %>.min.js',
      },
      css: {
        src: css_dependencies,
        dest: 'css/min/<%= pkg.name %>.min.css',
      }
    },
    //Build HTML files for dev or deploy.
    assemble: {
      deploy: {
        options: {
          deploy: true,
          version: '<%= pkg.version %>'
        },
        files: {
          'solutions.html': ['templates/solutions.handlebars'],
          'causes.html': ['templates/causes.handlebars']
        }
      },
      dev: {
        options: {
          deploy: false,
          version: '<%= pkg.version %>',
          js_dependencies: js_dependencies,
          css_dependencies: css_dependencies
        },
        files: {
          'solutions.html': ['templates/solutions.handlebars'],
          'causes.html': ['templates/causes.handlebars']
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

  grunt.loadNpmTasks('grunt-bump');
  grunt.loadNpmTasks('grunt-contrib-handlebars');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('assemble');
  grunt.loadNpmTasks('grunt-line-remover');

  grunt.registerTask('dev', ['handlebars', 'uglify', 'concat', 'assemble:dev']);
  grunt.registerTask('deploy', ['bump', 'handlebars', 'uglify','concat', 'assemble:deploy', 'lineremover']);

};
