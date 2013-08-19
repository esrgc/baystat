
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
    replace: {
      dist: {
        options: {
          variables: {
            'timestamp': '<%= new Date().getTime() %>',
            'version': '<%= pkg.version %>'
          }
        },
        files: [
          {src: ['html/solutions.html'], dest: 'solutions.html'},
          {src: ['html/causes.html'], dest: 'causes.html'}
        ]
      }
    },
    watch: {
      templates: {
        files: ['templates/*.handlebars'],
        tasks: ['handlebars']
      },
      livereload: {
        options: { livereload: true },
        files: ['templates/templates.js', 'css/*.css'],
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-handlebars');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-replace');

  grunt.registerTask('default', ['handlebars', 'watch']);
  grunt.registerTask('deploy', ['handlebars', 'replace']);

};