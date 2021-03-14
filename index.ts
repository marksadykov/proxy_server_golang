"use strict";

function requestHandler(client_req: any, client_res: any) {
    console.log('serve: ' + client_req.url);
    delete client_req.headers['proxy-connection'];

    const regPath = new RegExp(client_req.headers.host);
    const optionPath = client_req.url.replace(regPath, '').substr(client_req.url.replace(regPath, '').indexOf('://') + 3);
    const options = {
        hostname: client_req.headers.host,
        port: 80,
        path: optionPath,
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


const http = require('http')
const port = 8080
const net = require('net')
const url = require('url')

const server = http.createServer(requestHandler)

const listener = server.listen(port, (err: any) => {
    if (err) {
        return console.error(err)
    }
    const info = listener.address()
    console.log(`Server is listening on address ${info.address} port ${info.port}`)
})

server.on('connect', (req: any, clientSocket: any, head: any) => { // listen only for HTTP/1.1 CONNECT method
    console.log(clientSocket.remoteAddress, clientSocket.remotePort, req.method, req.url)
    const {port, hostname} = url.parse(`//${req.url}`, false, true) // extract destination host and port from CONNECT request
    if (hostname && port) {
        const serverErrorHandler = (err: any) => {
            console.error(err.message);
            if (clientSocket) {
                clientSocket.end(`HTTP/1.1 500 ${err.message}\r\n`);
            }
        };
        const serverEndHandler = () => {
            if (clientSocket) {
                clientSocket.end(`HTTP/1.1 500 External Server End\r\n`);
            }
        };
        const serverSocket = net.connect(port, hostname);
        const clientErrorHandler = (err: any) => {
            console.error(err.message);
            if (serverSocket) {
                serverSocket.end();
            }
        };
        const clientEndHandler = () => {
            if (serverSocket) {
                serverSocket.end();
            }
        };
        clientSocket.on('error', clientErrorHandler);
        clientSocket.on('end', clientEndHandler);
        serverSocket.on('error', serverErrorHandler);
        serverSocket.on('end', serverEndHandler);
        serverSocket.on('connect', () => {
            clientSocket.write([
                'HTTP/1.1 200 Connection Established',
                'Proxy-agent: Node-VPN',
            ].join('\r\n'));
            clientSocket.write('\r\n\r\n');
            serverSocket.pipe(clientSocket, {end: false});
            clientSocket.pipe(serverSocket, {end: false});
        })
    } else {
        clientSocket.end('HTTP/1.1 400 Bad Request\r\n')
        clientSocket.destroy()
    }
})
