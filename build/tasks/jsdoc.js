module.exports = function(grunt) {
	"use strict";

	grunt.config.set("jsdoc", {
		docs: {
			src: ["src/*.js"],
			options: {
				destination: "docs",
				configure: "build/docs/jsdoc-config.json"
			}
		}
	});

	grunt.loadNpmTasks("grunt-jsdoc");
};
