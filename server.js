// Muaz Khan   - www.MuazKhan.com
// MIT License - www.WebRTC-Experiment.com/licence
// Source Code - https://github.com/muaz-khan/WebRTC-Scalable-Broadcast

var fs = require("fs");
var path = require('path');
// <kau>
var https = require('https');

// <kau> https version
var options = {
    key: fs.readFileSync(process.env.SSL_KEY_FILE || 'C:\\Windows\\System32\\key.pem'),
    cert: fs.readFileSync(process.env.SSL_CERT_FILE || 'C:\\Windows\\System32\\cert.pem')
};

var app = https.createServer(options, function (request, response) {
    var uri = require('url').parse(request.url).pathname,
        filename = path.join(process.cwd(), uri);

    var isWin = !!process.platform.match(/^win/);

    if (fs.statSync(filename).isDirectory()) {
        if(!isWin) filename += '/index.html';
        else filename += '\\index.html';
    }

    fs.access(filename, fs.constants.F_OK, function (err) {
        if (err) {
            response.writeHead(404, {
                "Content-Type": "text/plain"
            });
            response.write('404 Not Found: ' + filename + '\n');
            response.end();
            return;
        }

        fs.readFile(filename, 'binary', function (err, file) {
            if (err) {
                response.writeHead(500, {
                    "Content-Type": "text/plain"
                });
                response.write(err + "\n");
                response.end();
                return;
            }

            response.writeHead(200);
            response.write(file, 'binary');
            response.end();
        });
    });
});
// var app = require('http').createServer(function (request, response) {
//     var uri = require('url').parse(request.url).pathname,
//         filename = path.join(process.cwd(), uri);

//     var isWin = !!process.platform.match(/^win/);

//     if (fs.statSync(filename).isDirectory()) {
//         if(!isWin) filename += '/index.html';
//         else filename += '\\index.html';
//     }

//     fs.exists(filename, function (exists) {
//         if (!exists) {
//             response.writeHead(404, {
//                 "Content-Type": "text/plain"
//             });
//             response.write('404 Not Found: ' + filename + '\n');
//             response.end();
//             return;
//         }

//         fs.readFile(filename, 'binary', function (err, file) {
//             if (err) {
//                 response.writeHead(500, {
//                     "Content-Type": "text/plain"
//                 });
//                 response.write(err + "\n");
//                 response.end();
//                 return;
//             }

//             response.writeHead(200);
//             response.write(file, 'binary');
//             response.end();
//         });
//     });
// });

app = app.listen(process.env.PORT || 8888, process.env.IP || "192.168.0.5", function() {
    var addr = app.address();
    console.log("Server listening at", addr.address + ":" + addr.port);
});


require('./WebRTC-Scalable-Broadcast.js')(app);
// when to access thorugh orginal code 
//http://localhost:8888 or 127.0.0.1:8888

// when to access thorugh kau https code
//https://192.168.0.6:8888