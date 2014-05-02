module.exports = function(grunt) {
	"use strict";

	grunt.config.set("jsdoc", {
		docs: {
			src: ["src/*.js"],
			options: {
				destination: "docs",
				configure: "build/docs/jsdoc-config.json",
				template: "build/docs/template"
			}
		}
	});

	grunt.loadNpmTasks("grunt-jsdoc");
};
