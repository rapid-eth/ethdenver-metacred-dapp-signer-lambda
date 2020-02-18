const http = require('http');
const { dappSigner } = require('./service')

const hostname = '127.0.0.1';
const port = 3010;

const server = http.createServer((req, res) => {

    var body = ''
    req.on('data', function (data) {
        body += data
    })

    req.on('end', function () {
        service(body).then((result, err) => {
            console.log("F")
            console.log(err)
            console.log(result)
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify(result))
        }).catch((err) => {
            console.log("aerr")
            res.writeHead(400, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify(err))
        })
    })

});

const service = async (data) => {
    let meta = JSON.parse(data)
    console.log(meta)
    let signature = await dappSigner(meta.metaTx);
    return { signature }
}

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});