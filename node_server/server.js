/**
* Copyright 2016 IBM Corp.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

var express = require('express');
var http = require('http');
var request = require('request');

var app = express();
var server = http.createServer(app);

// Local web server port http://localhost:9081
var port = 9081;

// MFP url, unless set in npm start arg, this is set to localhost:9080
var mfpURL = process.argv[2] || 'http://localhost:9080';

server.listen(port);
console.log('::: Node.js server - Listening on port ' + port + ' :::');
console.log('::: All MobileFirst requests will be forwarded to ' + mfpURL + ' :::');
console.log('::: Visit ' + 'http://localhost:' + port + '/home :::');

// Web server - serves the Client-side
app.use('/home', express.static(__dirname + '/../platforms/browser/www'));

// Reverse proxy, pipes the requests/responses to/from MFP
app.use('/mfp/*', function(req, res) {
  var url = mfpURL + req.originalUrl;
  console.log('passing to URL: ' + url);
  req.pipe(
    request[req.method.toLowerCase()](url))
  .pipe(res)
})
