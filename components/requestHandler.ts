import * as http from "http";

export function requestHandler(client_req: any, client_res: any) {
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
