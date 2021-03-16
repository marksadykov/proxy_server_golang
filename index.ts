"use strict";
import { config } from './config/config';
import { requestHandler } from './components/requestHandler';
import { requestHandlerHttps } from './components/requestHandlerHttps';
import app from "./server";

const portStatic = config.portStatic;
const Window = require('window');
const window = new Window();

const http = require('http');

const history = [];

app.get('/', (req: any, res: any) => {
    res.send('<div>lel</div>');
})

app.get('/requests', (req: any, res: any) => {
    let historyText = '';
    history.forEach((item: any, index: any)=>{
        historyText += `<div><span>id </span><span>${index}</span><span> </span><span>${item}</span></div><hr>`;
    });
    res.send(`
        <div>
            <div>requests</div>
            <div>${historyText}</div>
        </div>
    `);
})


app.listen(portStatic, () => {
    console.log(`App listening at http://localhost:${portStatic}`);
})

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
    return requestHandlerHttps.call(this, req, clientSocket, head, history);
});
