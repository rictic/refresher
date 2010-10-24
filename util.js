var fs = require("fs");
function watchAllFiles(dir, callback) {
    var files = fs.readdirSync(dir);
    files.forEach(function(file) {
        file = dir + "/" + file
        if (fs.statSync(file).isDirectory())
            watchAllFiles(file, callback);
        else
            fs.watchFile(file, {interval: 100}, callback);
    });
}
exports.watchAllFiles = watchAllFiles;