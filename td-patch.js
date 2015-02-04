/* td-patch v0.2.1, (c) 2015 Steen Klingberg. License: MIT */
!function(r,e){"function"==typeof define&&define.amd?define(e):"undefined"!=typeof module?module.exports=e():r.tdpatch=e()}(this,function(){function r(r){return"op"in r&&"path"in r&&(r.op.match(f)&&"value"in r||r.op.match(s)&&"from"in r||r.op.match("remove"))}function e(r,e){var o,t,n=!1;if("string"==typeof r&&(r=JSON.parse(r)),"object"==typeof r){if("string"==typeof e)o=e.split("/");else{if(!Array.isArray(e))return;o=e}return o.forEach(function(e){n||(e=e.replace("~1","/").replace("~0","~"),""===e?t=r:"undefined"==typeof t[e]?(n=!0,t=void 0):t=t[e])}),t}}function o(r,o,t){return e(r,o)==t}function t(r,o){if(void 0===e(r,o))return!1;var t=o.split("/"),n=t.pop(),i=e(r,t);if(delete i[n],Array.isArray(i)){var p=t.pop();e(r,t)[p]=i.filter(function(r){return void 0!==r})}return!0}function n(r,o,t){var n=e(r,o),i=o.split("/"),p=i.pop(),u=e(r,i);if(void 0===u)return!1;if(Array.isArray(u)){if(!(p<=u.length))return!1;u.splice(p,0,t)}else{if(void 0!==n)return!1;u[p]=t}return!0}function i(r,o,t){if(void 0===e(r,o))return!1;var n=o.split("/"),i=n.pop(),p=e(r,n);return void 0===p?!1:(delete p[i],p[i]=t,!0)}function p(r,o,t){if(void 0===e(r,o))return!1;var n=a(e(r,t),0),i=o.split("/"),p=i.pop(),u=e(r,i);if(void 0===u)return!1;u[p]=n;var c=t.split("/"),f=c.pop(),s=e(r,c);return delete s[f],!0}function u(r,o,t){if(void 0===e(r,o))return!1;var n=a(e(r,t),0),i=o.split("/"),p=i.pop(),u=e(r,i);return void 0===u?!1:(u[p]=n,!0)}function a(r,e){if(e>256)return void console.error(new Error("Structure is too deep."));if(null===r)return null;if("object"!=typeof r)return r;var o,t,n=Object.prototype.toString.call(r);if("[object Date]"===n)return new Date(r);if(0===n.indexOf("[object HTML"))return r.cloneNode(!0);if(0===n.indexOf("[object SVG"))return r.cloneNode(!0);if("[object Array]"===n)t=[];else{if("[object Object]"!==n)return void 0;t={}}for(o in r)t[o]=a(r[o],e+1);return t}function c(r){var e=function(){};return e.patches=[],e.object=r,e.test=function(r,e){return this.patches.push({op:"test",path:r,value:e}),this},e.remove=function(r){return this.patches.push({op:"remove",path:r}),this},e.add=function(r,e){return this.patches.push({op:"add",path:r,value:e}),this},e.replace=function(r,e){return this.patches.push({op:"replace",path:r,value:e}),this},e.move=function(r,e){return this.patches.push({op:"move",path:r,from:e}),this},e.copy=function(r,e){return this.patches.push({op:"copy",path:r,from:e}),this},e.run=function(){return h(this.object,this.patches)},e}var f=/^test$|^add$|^replace$/,s=/^move$|^copy$/,h=function(e,f){if("object"==typeof e&&void 0===f)return c(e);if(Array.isArray(f)&&"object"==typeof e){var s=a(e,0),h=!1;return f.forEach(function(e){return h?void 0:r(e)?void("test"===e.op?o(s,e.path,e.value)||(console.error(new Error("Patch tested wrong.")),h=!0):"remove"===e.op?t(s,e.path)||(console.error(new Error("Error in remove operation.")),h=!0):"add"===e.op?n(s,e.path,e.value)||(console.error(new Error("Error in add operation.")),h=!0):"replace"===e.op?i(s,e.path,e.value)||(console.error(new Error("Error in replace operation.")),h=!0):"move"===e.op?p(s,e.path,e.from)||(console.error(new Error("Error in move operation.")),h=!0):"copy"===e.op&&(u(s,e.path,e.from)||(console.error(new Error("Error in copy operation.")),h=!0))):(console.error(new Error("Patch is not valid.")),void(h=!0))}),h?void 0:s}};return h});