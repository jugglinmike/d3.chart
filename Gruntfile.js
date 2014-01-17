module.exports = function(grunt) {

  "use strict";

  grunt.initConfig({
    meta: {
      pkg: grunt.file.readJSON("package.json"),
      srcFiles: [
        "src/init.js",
        "src/layer.js",
        "src/layer-extensions.js",
        "src/chart.js",
        "src/chart-extensions.js"
      ],
      libraries: [
        "node_modules/datamap/src/datamap.js"
      ]
    },
    watch: {
      scripts: {
        files: ["src/**/*.js", "test/tests/*.js"],
        tasks: ["jshint"]
      }
    },
    jshint: {
      options: {
        curly: true,
        unused: true,
        undef: true,
        quotmark: "double",
        trailing: false
      },
      chart: {
        options: {
          browser: true,
          globalstrict: true,
          globals: {
            require: true,
            define: true
          }
        },
        files: {
          src: "<%= meta.srcFiles %>"
        }
      },
      test: {
        options: {
          globals: {
            define: true,
            require: true,
            assert: true,
            setup: true,
            suiteSetup: true,
            teardown: true,
            suite: true,
            test: true,
            sinon: true
          }
        },
        files: {
          src: ["test/tests/*.js"]
        }
      },
      grunt: {
        options: {
          node: true
        },
        files: {
          src: ["Gruntfile.js"]
        }
      }
    },
    mocha: {
      options: {
        run: false,
        log: true
      },
      src: ["test/index.html"]
    },
    requirejs: {
		compile: {
			options: {
				baseUrl: "src",
				name: "chart-extensions",
				paths: {
					"d3": "../test/lib/d3.v3"
				},
				excludeShallow: ["d3"],
				optimize: "none",
				out: "d3.chart.js",
				useStrict: true,
				onBuildWrite: function(moduleName, path, contents) {
					return require("amdclean").clean(contents);
				}
			}
		}
    }
  });

  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-contrib-requirejs");
  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-mocha");

  grunt.registerTask("test", ["mocha"]);
  grunt.registerTask("default", ["jshint", "test"]);
  grunt.registerTask("release", ["default", "requirejs"]);
};
