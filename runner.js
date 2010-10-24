var sys   = require('sys')
   ,spawn = require('child_process').spawn
   ,fs    = require('fs')
   ,path  = require('path')


var server;
var serverAlarm;
function runServer() {
  serverAlarm = undefined;
  try {
    server.expectedToDie = true;
    server.kill();
  }catch(e) {}
  sys.puts("\n\n\n\n\n\n");
  var myServer = spawn("node", [path.join(path.dirname(__filename), "refresher.js")]);
  server = myServer;
  myServer.stdout.addListener('data', function(data) {
    sys.print(data);
  });
  myServer.stderr.addListener('data', function(data) {
    sys.print(data);
  });
  myServer.addListener("exit", function(code, signal) {
    sys.puts("server exited with code " + code + " due to signal " + signal);
    if (!myServer.expectedToDie)
      restartServer();
  })
}

runServer();

function watchAllFiles(dir, callback) {
  var files = fs.readdirSync(dir);
  files.forEach(function(file) {
    file = path.join(dir,file)
    if (fs.statSync(file).isDirectory())
      watchAllFiles(file, callback);
    else
      fs.watchFile(file, {interval: 100}, callback);
  });
}

watchAllFiles(path.dirname(__filename), function() {
  restartServer();
});

function restartServer() {
    runServer();
}