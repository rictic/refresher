var http = require('http');
var url = require('url');
var fs = require('fs');
var path = require('path');
var util = require('./util');

function createWebServer(port, host, webroot) {
  var fingerprint;
  var server = http.createServer(function (request, response) {
    var pathname = url.parse(request.url).pathname;
    if (pathname === "/") {
      pathname = "/index.html"
    }
    if (pathname.match(/\.html?$/)) {
      handleHtml(path.join(webroot, pathname), request, response);
      return;
    }
    if (pathname === "/fingerprint.json") {
      response.writeHead(200, {'Content-Type': 'text/json'});
      response.end(JSON.stringify({fingerprint: fingerprint}));
      return;
    }
    if (pathname === "/refresher.js") {
      serveFile(path.join(path.dirname(__filename), "refresher_client.js"), response);
      return;
    }
    serveFile(path.join(webroot, pathname), response);
  })
  server.listen(port, host);
  server.refreshClients = function() {
      fingerprint = Math.round(Math.random() * 10000000);
  }
  //called once to initialize
  server.refreshClients();
  
  return server;
}

function handleHtml(pathname, request, response) {
  fs.readFile(pathname, "utf8", function(err, data) {
    if (err) {
      response.writeHead(404);
      response.end("<h1>file not found</h1>");
      return;
    }
    data = data.replace(/(<body.*?>)/, "$1\n<script defer async src='refresher.js'></script>");
    response.writeHead(200, {"Content-Type": "text/html"});
    response.end(data);
  })
}

function sendClient(response) {
  fs.readFile("refresher_client.js", "utf8", function(_, data) {
    response.writeHead(200, {'Content-Type': 'application/javascript'});
    response.end(data);
  })
}

function serveFile(pathname, response) {
  fs.readFile(pathname, "utf8", function(err, data) {
    if (err) {
      response.writeHead(404);
      response.end("<h1>file not found</h1>");
      return;
    }
    response.writeHead(200);
    response.end(data);
  })
}

var webroot = "."
var web_server = createWebServer(8124, "0.0.0.0", webroot);
console.log('Refresher web server running at http://localhost:8124/');


//ok, all of that is just setup, here's the meat:
util.watchAllFiles(webroot, function() {
  web_server.refreshClients();
})