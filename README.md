# td-patch
A JSON Patch module for Node.js, the browser, and the command line.

Install it with
 ```sh
 npm install td-patch -g
 ```
 or download the minimized version to be used in a browser.

* * *

For XML there are XSLT and XQuery for manipulating documents, and XPath for pointing to nodes in a document. What is the corresponding solution for JSON? It is __JSON Path__ and __JSON Pointer__. Both XML and JSON are data interchange formats, but they are quite different. XML is more complex with attributes, namespaces, comments, and schemas. It needs complex tools. JSON is very close to the native data structure of many programming languages, JavaScript in particular. The natural way is to handle data manipulation in a programming language of choice, but there are situations where there is a need to write down a transformation in a standardized way, so it can be applied to a JSON later on. This is mostly what XSLT and XQuery is about, making templates for transformation of documents. __JSON Patch__ is exactly that for JSON.

## JSON Pointer

The first thing we need is to have a way to point at a node in a JSON structure, an address string. __JSON Pointer__ is the simplest possible solution to that.

```js
var json = {
	"module": "td-path",
	"version": "0.1.0",
	"keywords": [
    	"tripledollar",
    	"json-path",
    	"json-pointer"
  	],
  	"bin": {
  		"tdpath": "bin/tdpath.js"
  	},
  	"author": "steenk",
  	"license": "MIT"
},

	pointer1 = "/",
	pointer2 = "/keywords/1",
	pointer3 = "/version",
	pointer4 = "/bin/tdpath"
```

A JSON structure consists of a tree of arrays and objects with key/value pairs. To access a key/value pair the key is used, and to access any item in an array an index number is used. __JSON Pointer__ use a combination of these keys and index numbers with slashes dividing them. It looks like an Internet address, which is also the meaning.

So what if a key has a "/" inside it? To prevent the key from being split into two invalid keys, it has to be escaped. The escape character used in __JSON Pointer__ is "~". So the "/" in the key name is replaced by "~1" in the __JSON Pointer__ string. That leaves the question of what if the key has a "~" in it? Well then it has to be replaced by "~0". These cases are not so common and all other valid characters in a JSON key goes without change.

## JSON Patch

While __JSON Pointer__ gives us a way to point to the inner data structures of a JSON document, __JSON Patch__ gives us a way to describe transformations of a JSON document. __JSON Patch__
 is itself a JSON document. It always consists of an array with one or many patches. Each patch will do one of six operations on the JSON document, _test_, _remove_, _add_, _replace_, _move_, and _copy_. The patches will be applied in sequence, so it is actually an activity list for a transformation. The transformation is atomic, meaning that if any of the operation steps fails, the whole transformation fails. Five of the six operations will try to transform the JSON in some way, but the _test_ operation just do a validation, which if it fails stops the whole transformation. Here is an example. It starts with the object `{"b": "bar", "c": [1, 2, 3, 4], "d": {"e": {"f": {} } } }` and transform it with a sequence of patches.

```js
var res = tdpatch(
	{"b": "bar", "c": [1, 2, 3, 4], "d": {"e": {"f": {} } } }, 
	[
	  {"op": "add", "path": "/a", "value": "foo"},
	  {"op": "test",  "path": "/a",  "value": "foo"},
	  {"op": "remove",  "path": "/b"},
	  {"op": "remove",  "path": "/c/2"},
	  {"op": "replace",  "path": "/a",  "value": "bar"},
	  {"op": "replace",  "path": "/d/e/f",  "value": "foobar"}
	]
);

// res: { "c": [ 1, 2, 4 ], d: { e: { f: 'foobar' } }, a: 'bar' }
```

All patches has the properties "op" and "path", _add_, _test_, and _replace_ have the "value" property also, and _move_ and _copy_ have the "from" property also. In __res__ comes the transformed object `{ c: [ 1, 2, 4 ], d: { e: { f: 'foobar' } }, a: 'bar' }` if it succeeds, otherwise __res__ will be __undefined__.

## Chain Transformation

An alternative is to build up the transformation with chaining. If only the the first parameter is put into _tdpatch_, the patches can be applied with methods chained together and finally run by the _run_ method. In the parameter list of these methods, the first one is always the path.

```js
var obj = {"b": "bar", "c": [1, 2, 3, 4], "d": {"e": {"f": {} } } };

// start at transformation
var trans = tdpatch(obj)
	.add("/a", "doggy");

// add a test
trans.test("/a",  "doggy");

// chain the rest and run
var res = trans.remove("/b")
	.remove("/c/2")
	.replace("/a",  "billi")
	.replace("/d/e/f",  "foobar")
	.run();

console.log(res);
```
With this method you can build up a long patchlist, and whenever you want to export your patches do it with `JSON.stringify(trans.patches)`, and you get a JSON string you can save for later use.

## How to Get the Library

In Node.js this is what to do:

```js
var tdpatch = require('td-patch');

var res = tdpatch({}, [{op: 'add', path: '/foo', value: 'bar'}]);
// res: {foo: 'bar'}
```

In the browser the prefered way is to use an AMD module loader, like Require.js, but without a module loader it will register a global method `window.tdpatch`.

```js
require(['td-patch'], function (tdpatch) {
	
	var tdpatch = require('td-patch');
	var res = tdpatch({}, [{op: 'add', path: '/foo', value: 'bar'}]);
	// res: {foo: 'bar'}
});
```

## The Command Tool

Installed in Node.js with the "-g" flag gives a command tool called "tdpatch".

```sh
tdpatch --help
Usage: tdpatch <json file> <json patch file> [<output file>]
```

The __JSON Patch__ file has an array with one or more patches in it. It has to be in valid JSON format. The output file is optional.













