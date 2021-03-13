"use strict";
const http = require('http');

http.createServer(onRequest).listen(8080);

function onRequest(client_req: any, client_res: any) {
    console.log('serve: ' + client_req.url);
    delete client_req.headers['proxy-connection'];

    const options = {
        hostname: client_req.headers.host,
        port: 80,
        path: client_req.url,
        method: client_req.method,
        headers: client_req.headers
    };

    const proxy = http.request(options, function (res: any) {
        client_res.writeHead(res.statusCode, res.headers)
        res.pipe(client_res, {
            end: true
        });
    });

    client_req.pipe(proxy, {
        end: true
    });
}
