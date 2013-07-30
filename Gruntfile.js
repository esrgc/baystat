
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
    }
  });

  grunt.loadNpmTasks('grunt-contrib-handlebars');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('default', ['handlebars']);
};