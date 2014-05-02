module.exports = function(grunt) {
  "use strict";

  grunt.config.set("jshint", {
    src: {
      options: {
        jshintrc: "src/.jshintrc"
      },
      src: ["<%= meta.srcFiles %>"]
    },
    test: {
      options: {
        jshintrc: "test/.jshintrc"
      },
      src: ["test/tests/*.js"]
    },
    build: {
      options: {
        jshintrc: "build/.jshintrc"
      },
      src: ["Gruntfile.js", "build/**/*.js", "!build/docs/template/**/*.js"]
    }
  });

  grunt.loadNpmTasks("grunt-contrib-jshint");
};
