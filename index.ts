"use strict";
import { config } from './config/config';
import { requestHandler } from './components/requestHandler';

const http = require('http');
const net = require('net');
const url = require('url');

const port = config.port;
const server = http.createServer(requestHandler);

const listener = server.listen(port, (err: any): (void) => {
    if (err) {
        return console.error(err)
    }
    const info = listener.address()
    console.log(`Server is listening on address ${info.address} port ${info.port}`)
})

server.on('connect', (req: any, clientSocket: any, head: any) => {
    console.log(clientSocket.remoteAddress, clientSocket.remotePort, req.method, req.url)
    const {port, hostname} = url.parse(`//${req.url}`, false, true)
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
