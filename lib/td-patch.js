/* td-patch v0.2.1, (c) 2015 Steen Klingberg. License: MIT */

(function (glob, f) {
    if (typeof define === 'function' && define.amd) {
        define(f);
    } else if (typeof module !== 'undefined') {
        module.exports = f();
    } else {
        glob.tdpatch = f();
    }
}(this, function () {

    /*
     * Verify that the patch object contains the right properties.
     */
    var ops_value = /^test$|^add$|^replace$/,
        ops_from = /^move$|^copy$/;
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
        var p = path.split('/'),
            n = p.pop(),
            o = select(obj, p);
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
        var v = select(obj, path),
            p = path.split('/'),
            n = p.pop(),
            o = select(obj, p);
        if (o === undefined) return false;
        if (Array.isArray(o)) {
            if (n <= o.length) {
                o.splice(n, 0, value);
            } else {
                return false;
            }
        } else {
            if (v === undefined) {
                o[n] = value;
            } else {
                return false;
            }
        }
        return true;
    }

    /*
     * JSON Patch method "replace".
     */
    function replace (obj, path, value) {
        if (select(obj, path) === undefined) return false;
        var p = path.split('/'),
            n = p.pop(),
            o = select(obj, p);
        if (o === undefined) return false;
        delete o[n];
        o[n] = value;
        return true;
    }

    /*
     * JSON Patch method "move".
     */
    function move (obj, path, from) {
        if (select(obj, path) === undefined) return false;
        var o = deepCopy(select(obj, from), 0),
            p = path.split('/'),
            n = p.pop(),
            t = select(obj,p);
        if (t === undefined) return false;
        t[n] = o;
        var f = from.split('/'),
            d = f.pop(),
            x = select(obj, f);
        delete x[d];
        return true;
    }

    /*
     * JSON Patch method "copy".
     */
    function copy (obj, path, from) {
        if (select(obj, path) === undefined) return false;
        var o = deepCopy(select(obj, from), 0),
            p = path.split('/'),
            n = p.pop(),
            t = select(obj,p);
        if (t === undefined) return false;
        t[n] = o;
        return true;
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
     * Chaining interface for transformation
     */
    function start (obj) {
        var p = function () {};
        p.patches = [];
        p.object = obj;
        p.test = function (path, value) {
           this.patches.push({
            op: 'test',
            path: path,
            value: value
           });
           return this;
        };
        p.remove = function (path) {
           this.patches.push({
            op: 'remove',
            path: path
           });
           return this;
        };
        p.add = function (path, value) {
           this.patches.push({
            op: 'add',
            path: path,
            value: value
           });
           return this;
        };
        p.replace = function (path, value) {
           this.patches.push({
            op: 'replace',
            path: path,
            value: value
           });
           return this;
        };
        p.move = function (path, from) {
           this.patches.push({
            op: 'move',
            path: path,
            from: from
           });
           return this;
        };
        p.copy = function (path, from) {
           this.patches.push({
            op: 'copy',
            path: path,
            from: from
           });
           return this;
        };

        p.run = function () {
            return tdpatch(this.object, this.patches);
        }
        return p;
    }

    /*
     * The module returns a function with two parameters,
     * the object to modify, and a patch list.
     * It can log errors if something is wrong, and then
     * returns undefined. If it successfully runs the patch list,
     * it returns the a patched object.
     */
    var tdpatch = function (object, patchlist) {
        if (typeof object === 'object' && patchlist === undefined) {
            return start(object);
        }
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
                if (! move(obj, patch.path, patch.from)) {
                    console.error(new Error("Error in move operation."));
                    done = true;
                }
            } else if (patch.op === 'copy') {
                if (! copy(obj, patch.path, patch.from)) {
                    console.error(new Error("Error in copy operation."));
                    done = true;
                }
            }
        });
        if (done) {
            return undefined;
        }
        return obj;
    }

    return tdpatch;  
}))
