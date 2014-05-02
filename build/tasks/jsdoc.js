module.exports = function(grunt) {
	"use strict";

	grunt.config.set("jsdoc", {
		docs: {
			src: ["src/*.js"],
			options: {
				destination: "docs"
			}
		}
	});

	grunt.loadNpmTasks("grunt-jsdoc");
};
