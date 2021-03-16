import * as http from "http";
import {StringDecoder} from "string_decoder";

const ab2str = require('arraybuffer-to-string')

export function requestHandler(client_req: any, client_res: any, history: any) {
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
        client_res.writeHead(res.statusCode, res.headers);

        res.pipe(client_res, {
            end: true
        });

        let body = '';
        res.on('data', function (chunk: any) {
            let json = JSON.stringify(chunk);
            let AfterJson = JSON.parse(json)
            let uint8 = new Uint8Array(AfterJson.data);
            body += ab2str(uint8);
        });
        res.on('end', function () {
            history.push({
                req: client_req,
                clientSocket: client_res,
                type: 'http',
                body: body,
            });
        });
    });

    client_req.pipe(proxy, {
        end: true
    });
}
