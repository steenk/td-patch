
var tdpatch = require('../td-patch.js'),
	assert = require('assert');


var obj = {"b": "bar", "c": [1, 2, 3, 4], "d": {"e": {"f": {} } } };
var patch = [
	  {"op": "add", "path": "/a", "value": "steen"},
	  {"op": "test",  "path": "/a",  "value": "steen"},
	  {"op": "remove",  "path": "/b"},
	  {"op": "remove",  "path": "/c/2"},
	  {"op": "replace",  "path": "/a",  "value": "billi"},
	  {"op": "replace",  "path": "/d/e/f",  "value": "foobar"}
	];

describe('Tests for td-patch', function () {
	it('should return a the expected structur with two parameters', function () {
		var res = tdpatch(obj, patch);
		assert(JSON.stringify(res) === '{"c":[1,2,4],"d":{"e":{"f":"foobar"}},"a":"billi"}');
	});
	it('should return the expected structure with chain transfomations', function () {
		var res = tdpatch(obj)
			.add("/a", "steen")
			.test("/a",  "steen")
			.remove("/b")
			.remove("/c/2")
			.replace("/a",  "billi")
			.replace("/d/e/f",  "foobar")
			.run();
		assert(JSON.stringify(res) === '{"c":[1,2,4],"d":{"e":{"f":"foobar"}},"a":"billi"}');
	});
})
