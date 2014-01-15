define(function() {
"use strict";

return function(test, message) {
	if (test) {
		return;
	}
	throw new Error("[d3.chart] " + message);
};
});
