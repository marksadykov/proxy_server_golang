import * as net from "net";
import * as url from "url";

const ab2str = require('arraybuffer-to-string')

export function requestHandlerHttps (req: any, clientSocket: any, head: any, history: any) {
    console.log(clientSocket.remoteAddress, clientSocket.remotePort, req.method, req.url);
    const {port, hostname} = url.parse(`//${req.url}`, false, true);
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
        const serverSocket = net.connect(Number(port), hostname);
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

            let body = '';
            clientSocket.on('data', function (chunk: any) {
                let json = JSON.stringify(chunk);
                let AfterJson = JSON.parse(json);
                let uint8 = new Uint8Array(AfterJson.data);
                body += ab2str(uint8);
            });
            clientSocket.on('end', function () {
                history.push({
                    req: req,
                    clientSocket: clientSocket,
                    type: 'https',
                    body: body,
                });
            });

            clientSocket.write('\r\n\r\n');
            serverSocket.pipe(clientSocket, {end: false});
            clientSocket.pipe(serverSocket, {end: false});
        })
    } else {
        clientSocket.end('HTTP/1.1 400 Bad Request\r\n')
        clientSocket.destroy()
    }
}
