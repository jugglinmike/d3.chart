module.exports = function(grunt) {
	"use strict";

	grunt.config.set("jsdoc", {
		docs: {
			src: ["src/*.js"],
			options: {
				destination: "docs",
				configure: "build/docs/jsdoc-config.json",
				template: "../jsdoc-template-miso/src"
			}
		}
	});

	grunt.loadNpmTasks("grunt-jsdoc");
};
