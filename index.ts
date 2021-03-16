"use strict";
import { config } from './config/config';
import { requestHandler } from './components/requestHandler';
import { requestHandlerHttps } from './components/requestHandlerHttps';
import app from "./server";

const portStatic = config.portStatic;
const Window = require('window');
const window = new Window();

const fetch = require('node-fetch');

const http = require('http');

const history = [];

app.get('/', (req: any, res: any) => {
    const response = `<div>
        <div>слушает на порту 8080</div>
        <div>на порту 8000 веб-интерфейс</div>
        <div>/requests – список запросов</div>
        <div>/requests/id – вывод 1 запроса</div>
        <div>/repeat/id – повторная отправка запроса</div>
        <div>/scan/id – сканирование запроса</div>
        </div>`
    res.send(config.start + response + config.end);
})

app.get('/requests', (req: any, res: any) => {
    let historyText = '';
    history.forEach((item: any, index: any)=>{
        historyText += `<div>
            <span>id </span><span>${index}</span>
            <span> </span><span>${item?.req?.headers?.host}</span>
            <div>path: ${item?.optionPath}</div>
            </div><hr>`;
    });
    const response = `
        <div>
            <div>requests</div>
            <div>${historyText}</div>
        </div>
    `
    res.send(config.start + response + config.end);
})

app.get('/requests/:id', (req: any, res: any) => {
    let response = '';
    const item = history[req.params.id];
    if (item) {
        response = `<div><span>${item?.req?.headers?.host}</span></div>
                        <div>path: ${item?.optionPath}</div>
                        <div>Ответ:</div>
                        <div>${item?.body}</div>
                    <hr>`;
    } else {
        response = `<div>Нет запроса с id = ${req.params.id}</div>`
    }
    res.send(config.start + response + config.end);
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
                    <div>path: ${item?.optionPath}</div>
                    <div>Ответ:</div>
                    <div>${item?.body}</div>
                    </div>
                    <hr>`;
    } else {
        response = `<div>Нет запроса с id = ${req.params.id}</div>`
    }
    res.send(config.start + response + config.end);
})

app.get('/scan/:id', (req: any, res: any) => {
    fetch('https://raw.githubusercontent.com/maurosoria/dirsearch/master/db/dicc.txt')
        .then((response: any) => response.text())
        .then((textString: any) => {
            let answer = '';
            const vac = textString.split('\n');
            const item = history[req.params.id];
            if (item) {
                vac.forEach((item:string)=>{
                    answer+= `<div><span>404  </span>${item}</div>`
                })
            } else {
                answer = `<div>Нет запроса с id = ${req.params.id}</div>`
            }

            res.send(config.start + answer + config.end);
        });
})


app.listen(portStatic, () => {
    console.log(`Static server listening at :: port ${portStatic}`);
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
    console.log(`Proxy server is listening on address ${info.address} port ${info.port}`)
})

server.on('connect', (req: any, clientSocket: any, head: any) => {
    return requestHandlerHttps.call(this, req, clientSocket, head, history);
});
