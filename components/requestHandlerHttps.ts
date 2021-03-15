import * as net from "net";
import * as url from "url";

export function requestHandlerHttps (req: any, clientSocket: any, head: any) {
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
            clientSocket.write('\r\n\r\n');
            serverSocket.pipe(clientSocket, {end: false});
            clientSocket.pipe(serverSocket, {end: false});
        })
    } else {
        clientSocket.end('HTTP/1.1 400 Bad Request\r\n')
        clientSocket.destroy()
    }
}
