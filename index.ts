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
        historyText += `<div><span>id </span><span>${index}</span><span> </span><span>${item?.req?.headers?.host}</span></div><hr>`;
    });
    res.send(`
        <div>
            <div>requests</div>
            <div>${historyText}</div>
        </div>
    `);
})

app.get('/requests/:id', (req: any, res: any) => {
    let response = '';
    const item = history[req.params.id];
    if (item) {
        response = `<div><span>${item?.req?.headers?.host}</span></div>
                        <div>Ответ:</div>
                        <div>${item?.body}</div>
                    <hr>`;
    } else {
        response = `<div>Нет запроса с id = ${req.params.id}</div>`
    }
    res.send(response);
})

app.get('/repeat/:id', (req: any, res: any) => {
    let response = '';
    const item = history[req.params.id];
    if (item) {
        if (item.type === 'http') {
            requestHandler(item.req, item.clientSocket, history);
        }
        if (item.type === 'https') {
            requestHandlerHttps(item.req, item.clientSocket, 'a', history);
        }
        response = `<div>
                    <span>${item?.req?.headers?.host} повторно!</span>
                    </div>
                    <div>
                    <div>Ответ:</div>
                    <div>${item?.body}</div>
                    </div>
                    <hr>`;
    } else {
        response = `<div>Нет запроса с id = ${req.params.id}</div>`
    }
    res.send(response);
})


app.listen(portStatic, () => {
    console.log(`App listening at http://localhost:${portStatic}`);
})

const port = config.port;
const server = http.createServer((client_req: any, client_res: any) => {
        return requestHandler.call(this, client_req, client_res, history);
    }
);
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
