var tdpatch = require('../td-patch'),
	fs = require('fs');

if (process.argv.length < 4) {
	console.log("Usage: tdpatch <json file> <json patch file> [<output file>]");
	process.exit();
}

var json_file = process.argv[2],
	patch_file = process.argv[3],
	out_file = process.argv[4];

fs.exists(json_file, function (exists) {
	if (exists) {
		fs.exists(patch_file, function (exists) {
			if (exists) {
				fs.readFile(patch_file, function (err, res) {
					var jp = JSON.parse(res);
					fs.readFile(json_file, function (err, res) {
						var json = JSON.parse(res);
						var out = tdpatch(json, jp);
						if (out_file !== undefined) {
							fs.writeFile(out_file, JSON.stringify(out));
						} else {
							console.log(JSON.stringify(out));
						}
					});
				});
			} else {
				console.error(new Error("The patch file is missing."));
			}
		})
	} else {
		console.error(new Error("The JSON file is missing."));
	}
})

