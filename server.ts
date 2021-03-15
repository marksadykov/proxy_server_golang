const http = require('http')
const fs = require('fs')
const path = require('path')

const port = 8000;

const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.ico': 'image/x-icon',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.json': 'application/json',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2'
}
const mimeTypes = new Map([
    ['.html', 'text/html'],
    ['.js', 'application/javascript'],
    ['.css', 'text/css'],
    ['.ico', 'image/x-icon'],
    ['.png', 'image/png'],
    ['.jpg', 'image/jpeg'],
    ['.gif', 'image/gif'],
    ['.gif', 'image/gif'],
    ['.gif', 'image/gif'],
    ['.gif', 'image/gif'],
]);

const server = http.createServer()

server.on('request', (req: any, res: any) => {
    const parsedUrl = new URL(req.url, 'https://node-http.glitch.me/')

    let pathName = parsedUrl.pathname

    let ext = path.extname(pathName)

    if (pathName !== '/' && pathName[pathName.length - 1] === '/') {
        res.writeHead(302, {'Location': pathName.slice(0, -1)})
        res.end()
        return
    }

    if (pathName === '/') {
        ext = '.html'
        pathName = 'index.html'
    } else if (!ext) {
        ext = '.html'
        pathName += ext
    }

    const filePath = path.join(process.cwd(), './', pathName)

    fs.exists(filePath, function (exists: boolean) {

        if (!exists || !mimeTypes[ext]) {
            console.log('File does not exist: ' + pathName)
            res.writeHead(404, {'Content-Type': 'text/plain'})
            res.write('404 Not Found')
            res.end()
            return
        }

        res.writeHead(200, {'Content-Type': mimeTypes[ext]})

        const fileStream = fs.createReadStream(filePath)
        fileStream.pipe(res)
    })
})

server.listen(port);

console.log(`Server listening on ${port}`);
