/* td-patch v0.1.0, (c) 2015 Steen Klingberg. License: MIT */
if (typeof define !== 'function') { define = function (f) { module.exports = f();}}

define(function () {

    /*
     * Verify that the patch object contains the right properties.
     */
    var ops_value = /^test$|^add$|^replace$/,
        ops_from = /^move$|copy$/;
    function verify (p) {
        return 'op' in p && 'path' in p 
            && (
                (p.op.match(ops_value) && 'value' in p)
                || (p.op.match(ops_from) && 'from' in p)
                || p.op.match('remove')
            );
    }

    /*
     * Implementation of JSON Pointer.
     */
    function select (obj, sel) {
        var s,
            r,
            done = false;
        if (typeof obj === 'string') {
            obj = JSON.parse(obj);
        }
        if (typeof obj !== 'object') {
            return;
        }
        if (typeof sel === 'string') {
            s = sel.split('/');
        } else if (Array.isArray(sel)) {
            s = sel;
        } else {
            return;
        }
        s.forEach(function (key) {
            if (done) return;
            key = key.replace('~1','/').replace('~0','~');
            if (key === '') {
                r = obj;
            } else {
                if (typeof r[key] === 'undefined') {
                    done = true;
                    r = undefined;
                } else {
                    r = r[key];
                }
            }
        })
        return r;
    }

    /*
     * JSON Patch method "test".
     */
    function test (obj, path, value) {
        return select(obj, path) == value;
    }

    /*
     * JSON Patch method "remove".
     */
    function remove (obj, path) {
        if (select(obj, path) === undefined) return false;
        var p = path.split('/');
        var n = p.pop();
        var o = select(obj, p);
        delete o[n];
        if (Array.isArray(o)) {
            var a = p.pop();
            select(obj, p)[a] = o.filter(function (n) {return n !== undefined});
        }
        return true;
    }

    /*
     * JSON Patch method "add".
     */
    function add (obj, path, value) {
        var p = path.split('/');
        var n = p.pop();
        var o = select(obj, p);
        if (o === undefined) return false;
        o[n] = value;
        return true;
    }

    /*
     * JSON Patch method "replace".
     */
    function replace (obj, path, value) {
        var p = path.split('/');
        var n = p.pop();
        var o = select(obj, p);
        if (o === undefined) return false;
        delete o[n];
        o[n] = value;
        return true;
    }

    /*
     * JSON Patch method "move".
     */
    function move () {

    }

    /*
     * JSON Patch method "copy".
     */
    function copy () {

    }

    /*
     * Deep copy of a JavaScript object. It can handle Date objects,
     * HTML nodes, SVG nodes, and ordinary JavaScript data types.
     * It is limited to a depth of 256 levels.
     */
    function deepCopy (obj, depth) {
        if (depth > 256) {
            console.error(new Error("Structure is too deep."));
            return undefined;
        }
        if (obj === null) return null;
        if (typeof obj !== 'object') return obj;
        var x,
            t = Object.prototype.toString.call(obj),
            cpy;
        if (t === '[object Date]') return new Date(obj);
        else if (t.indexOf('[object HTML') === 0) return obj.cloneNode(true);
        else if (t.indexOf('[object SVG') === 0) return obj.cloneNode(true);
        else if (t === '[object Array]') cpy = [];
        else if (t === '[object Object]') cpy = {};
        else return undefined;
        for (x in obj) {
            cpy[x] = deepCopy(obj[x], depth + 1);
        }
        return cpy;
    }

    /*
     * The module returns a function with two parameters,
     * the object to modify, and a patch list.
     * It can log errors if something is wrong, and then
     * returns undefined. If it successfully runs the patch list,
     * it returns the a patched object.
     */
    return function (object, patchlist) {
        if (! Array.isArray(patchlist) || typeof object !== 'object') {
            return;
        }
        var obj = deepCopy(object, 0),
            done = false;
        patchlist.forEach(function (patch) {
            if (done) return;
            if (! verify(patch)) {
                console.error(new Error("Patch is not valid."));
                done = true;
                return;
            }
            if (patch.op === 'test') {
                if (! test(obj, patch.path, patch.value)) {
                    console.error(new Error("Patch tested wrong."));
                    done = true;
                }
            } else if (patch.op === 'remove') {
                if (! remove(obj, patch.path)) {
                    console.error(new Error("Error in remove operation."));
                    done = true;
                }
            } else if (patch.op === 'add') {
                if (! add(obj, patch.path, patch.value)) {
                    console.error(new Error("Error in add operation."));
                    done = true;
                }
            } else if (patch.op === 'replace') {
                if (! replace(obj, patch.path, patch.value)) {
                    console.error(new Error("Error in replace operation."));
                    done = true;
                }
            } else if (patch.op === 'move') {
                move(obj, patch.from, patch.path);
            } else if (patch.op === 'copy') {
                copy(obj, patch.path, patch.value);
            }
        });
        if (done) {
            return undefined;
        }
        return obj;
    }   
})
