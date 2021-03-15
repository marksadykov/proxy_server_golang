"use strict";
import { config } from './config/config';
import { requestHandler } from './components/requestHandler';
import { requestHandlerHttps } from './components/requestHandlerHttps';
import { staticHandler } from "./server";

const http = require('http');

const portStatic = config.portStatic;
const serverStatic = http.createServer()
serverStatic.on('request', staticHandler);
serverStatic.listen(portStatic);
console.log(`Server listening on ${portStatic}`);

const port = config.port;
const server = http.createServer(requestHandler);
const listener = server.listen(port, (err: any): (void) => {
    if (err) {
        return console.error(err)
    }
    const info = listener.address()
    console.log(`Server is listening on address ${info.address} port ${info.port}`)
})

server.on('connect', requestHandlerHttps);
