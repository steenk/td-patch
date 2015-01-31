
var tdpatch = require('../td-patch.js');

var res = tdpatch(
	{"b": "bar", "c": [1, 2, 3, 4], "d": {"e": {"f": {} } } }, 
	[
	  {"op": "add", "path": "/a", "value": "steen"},
	  {"op": "test",  "path": "/a",  "value": "steen"},
	  {"op": "remove",  "path": "/b"},
	  {"op": "remove",  "path": "/c/2"},
	  {"op": "replace",  "path": "/a",  "value": "billi"},
	  {"op": "replace",  "path": "/d/e/f",  "value": "foobar"}
	]
);

console.log(res);
